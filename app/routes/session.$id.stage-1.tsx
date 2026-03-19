import { useEffect, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import {
	data,
	Form,
	useFetcher,
	useLoaderData,
	useNavigate,
} from 'react-router';
import {
	ContractConfirmation,
	CorrectionsUI,
	HardBlocksAlert,
	MatchVisualization,
	RulersPanel,
} from '~/components/stages';
import type { MatchCandidate } from '~/core/match';
import { calculateMatch } from '~/core/match';
import { createRepositories, type SessionRecord } from '~/db';
import {
	logContractConfirmed,
	logCorrection,
	logHardBlock,
	logMatchDecision,
} from '~/lib/audit';
import {
	createValidationErrorResponse,
	validateRulersVector,
	validateSessionMode,
} from '~/lib/validation';
import type {
	CanonicalLevelId,
	CognitiveContract,
	HardBlock,
	InitialRoleId,
	LevelMatch,
	LocalCorrection,
	ModeId,
	RulersVector,
} from '~/types';

// Valores padrão das réguas
const DEFAULT_RULERS: RulersVector = {
	decision: 1,
	inference: 3,
	meta: 1,
	scope: 2,
	source: 1,
};

export async function loader({ params, context }: LoaderFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		return data(
			{ error: 'Session ID required', session: undefined },
			{ status: 404 },
		);
	}

	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return data(
			{ error: 'Session not found', session: undefined },
			{ status: 404 },
		);
	}

	// Validação de modo: Stage 1 requer MODE_PREPARATION ou MODE_GOVERNANCE
	const modeValidation = validateSessionMode(session.mode, [
		'MODE_PREPARATION',
		'MODE_GOVERNANCE',
	]);
	if (!modeValidation.valid) {
		return createValidationErrorResponse(
			sessionId,
			modeValidation.error ?? 'Invalid mode',
			modeValidation.status,
		);
	}

	const contracts = await repos.contracts.findBySessionId(sessionId);
	const latestContract = contracts[0];

	// Reconstruct CognitiveContract from individual fields
	const contract: CognitiveContract | null = latestContract
		? {
				correction: latestContract.correction
					? JSON.parse(latestContract.correction)
					: undefined,
				hardBlocks: latestContract.hard_blocks
					? JSON.parse(latestContract.hard_blocks)
					: undefined,
				levelMatch: JSON.parse(latestContract.level_match),
				role: latestContract.role,
				rulers: JSON.parse(latestContract.rulers),
			}
		: null;

	return {
		session: {
			...session,
			contract,
		},
	};
}

export async function action({ params, request, context }: ActionFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		return data({ error: 'Session ID required' }, { status: 400 });
	}

	// Buscar sessão para validação de modo
	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return data({ error: 'Session not found' }, { status: 404 });
	}

	// Validação de modo: Actions de Stage 1 requerem MODE_PREPARATION
	const modeValidation = validateSessionMode(session.mode, [
		'MODE_PREPARATION',
	]);
	if (!modeValidation.valid) {
		return createValidationErrorResponse(
			sessionId,
			modeValidation.error ?? 'Invalid mode',
			modeValidation.status,
		);
	}

	const formData = await request.formData();
	const actionType = formData.get('_action');

	switch (actionType) {
		case 'calculate-match':
			return handleCalculateMatch(formData, session, repos);
		case 'apply-correction':
			return handleApplyCorrection(formData, session, repos);
		case 'confirm-contract':
			return handleConfirmContract(formData, session, repos);
		default:
			return data({ error: 'Unknown action type' }, { status: 400 });
	}
}

async function handleCalculateMatch(
	formData: FormData,
	session: SessionRecord,
	_repos: ReturnType<typeof createRepositories>,
) {
	const rulersParam = formData.get('rulers');
	const roleParam = formData.get('role');

	if (!rulersParam || !roleParam) {
		return data(
			{ error: 'Missing required fields: rulers, role' },
			{ status: 400 },
		);
	}

	const rulers = JSON.parse(rulersParam as string) as RulersVector;
	const role = roleParam as string;

	// Validação completa das réguas (inclui cap constitucional)
	const rulersValidation = validateRulersVector(rulers);
	if (!rulersValidation.valid) {
		return createValidationErrorResponse(
			session.id,
			rulersValidation.error || 'Invalid rulers',
			rulersValidation.status,
		);
	}

	// Calcular match usando motor canônico
	const matchResult = calculateMatch(rulers, role as InitialRoleId);

	// Log de auditoria para decisões de match
	logMatchDecision(session, rulers, {
		autoSelected: matchResult.autoSelected,
		hasCorrections: !!matchResult.corrections?.length,
		hasHardBlocks: !!matchResult.hardBlocks?.length,
		score: matchResult.score,
		selectedLevel: matchResult.selectedLevel,
	});

	// Log de hard blocks se houver
	if (matchResult.hardBlocks?.length) {
		for (const block of matchResult.hardBlocks) {
			logHardBlock(session, block.ruleId, block.message, block.severity);
		}
	}

	// Transformar para formato serializável
	const levelMatch: LevelMatch = {
		candidates: matchResult.candidates.map((c: MatchCandidate) => ({
			level: c.level,
			score: c.score,
		})),
		score: matchResult.score,
		selectedLevel: matchResult.selectedLevel,
	};

	const hardBlocks: HardBlock[] =
		matchResult.hardBlocks?.map(
			(hb: {
				ruleId: string;
				message: string;
				severity: 'BLOCK' | 'WARN' | 'CONFIRM';
			}) => ({
				id: hb.ruleId,
				message: hb.message,
				severity: hb.severity,
			}),
		) || [];

	const corrections: LocalCorrection[] =
		matchResult.corrections?.map(
			(c: { reason: string; rulersDelta: Partial<RulersVector> }) => ({
				reason: c.reason,
				rulersDelta: c.rulersDelta,
			}),
		) || [];

	return {
		autoSelected: matchResult.autoSelected,
		corrections,
		hardBlocks,
		levelMatch,
	};
}

async function handleApplyCorrection(
	formData: FormData,
	session: SessionRecord,
	_repos: ReturnType<typeof createRepositories>,
) {
	const rulersParam = formData.get('rulers');
	const deltaParam = formData.get('delta');

	if (!rulersParam || !deltaParam) {
		return data(
			{ error: 'Missing required fields: rulers, delta' },
			{ status: 400 },
		);
	}

	const originalRulers = JSON.parse(rulersParam as string) as RulersVector;
	const delta = JSON.parse(deltaParam as string) as Partial<RulersVector>;

	// Validar restrição: máx 2 réguas alteradas
	const modifiedRulers = Object.keys(delta).filter(
		(k) =>
			delta[k as keyof RulersVector] !==
			originalRulers[k as keyof RulersVector],
	);
	if (modifiedRulers.length > 2) {
		return data(
			{ error: 'Correction limited to maximum 2 rulers' },
			{ status: 400 },
		);
	}

	// Validar restrição: magnitude máxima ±1 por régua
	for (const ruler of modifiedRulers) {
		const original = originalRulers[ruler as keyof RulersVector];
		const corrected = delta[ruler as keyof RulersVector];
		if (corrected !== undefined && Math.abs(corrected - original) > 1) {
			return data(
				{ error: `Correction magnitude exceeded for ruler ${ruler}: max ±1` },
				{ status: 400 },
			);
		}
	}

	// Aplicar correção
	const correctedRulers: RulersVector = {
		...originalRulers,
		...delta,
	};

	// Validar réguas corrigidas (inclui cap constitucional)
	const rulersValidation = validateRulersVector(correctedRulers);
	if (!rulersValidation.valid) {
		return createValidationErrorResponse(
			session.id,
			rulersValidation.error || 'Constitutional violation after correction',
			rulersValidation.status,
		);
	}

	const role = formData.get('role') as string;

	// Recalcular match com réguas corrigidas
	const matchResult = calculateMatch(correctedRulers, role as InitialRoleId);

	const levelMatch: LevelMatch = {
		candidates: matchResult.candidates.map((c: MatchCandidate) => ({
			level: c.level,
			score: c.score,
		})),
		score: matchResult.score,
		selectedLevel: matchResult.selectedLevel,
	};

	const correction: LocalCorrection = {
		reason: 'Local correction applied by user',
		rulersDelta: delta,
	};

	// Log de auditoria da correção aplicada
	logCorrection(session, originalRulers, correctedRulers, delta);

	return {
		autoSelected: matchResult.autoSelected,
		correctedRulers,
		correction,
		levelMatch,
	};
}

async function handleConfirmContract(
	formData: FormData,
	session: SessionRecord,
	repos: ReturnType<typeof createRepositories>,
) {
	const rulersParam = formData.get('rulers');
	const levelMatchParam = formData.get('levelMatch');
	const hardBlocksParam = formData.get('hardBlocks');
	const roleParam = formData.get('role');
	const correctionParam = formData.get('correction');

	if (!rulersParam || !levelMatchParam || !roleParam) {
		return data(
			{ error: 'Missing required fields: rulers, levelMatch, role' },
			{ status: 400 },
		);
	}

	const rulers = JSON.parse(rulersParam as string) as RulersVector;

	// Validação completa das réguas (inclui cap constitucional)
	const rulersValidation = validateRulersVector(rulers);
	if (!rulersValidation.valid) {
		return createValidationErrorResponse(
			session.id,
			rulersValidation.error || 'Constitutional violation',
			rulersValidation.status,
		);
	}

	const levelMatch = JSON.parse(levelMatchParam as string) as LevelMatch;
	const hardBlocks = hardBlocksParam
		? (JSON.parse(hardBlocksParam as string) as HardBlock[])
		: [];
	const correction = correctionParam
		? (JSON.parse(correctionParam as string) as LocalCorrection)
		: undefined;
	const role = roleParam as CognitiveContract['role'];

	// Criar contrato cognitivo
	const contract: CognitiveContract = {
		correction,
		hardBlocks,
		levelMatch,
		role,
		rulers,
	};

	// Salvar contrato no D1
	const contractId = crypto.randomUUID();
	await repos.contracts.create(contractId, session, contract);

	// Atualizar sessão com contrato e transitar para próxima etapa
	await repos.sessions.update(session.id, {
		contract,
		current_stage: 1,
	});

	// Log de auditoria da confirmação do contrato
	logContractConfirmed(
		session,
		contractId,
		role,
		levelMatch.selectedLevel || 'N/A',
		rulers,
	);

	return {
		contractId,
		redirect: `/session/${session.id}/stage-2`,
		session,
		success: true,
	};
}

// Componente UI da página
export default function Stage1Page() {
	const sessionData = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	const navigate = useNavigate();

	// Parse session data from loader
	const session =
		(
			sessionData as {
				session: {
					contract: CognitiveContract | null;
					id: string;
					mode: ModeId;
					current_stage: number;
					protocol: string | null;
					created_at: string;
					updated_at: string;
				};
			}
		).session || undefined;

	// Estados locais
	const [rulers, setRulers] = useState<RulersVector>(
		session?.contract?.rulers || DEFAULT_RULERS,
	);
	const [matchResult, setMatchResult] = useState<{
		levelMatch: LevelMatch;
		hardBlocks: HardBlock[];
		corrections: LocalCorrection[];
		autoSelected: boolean;
	} | null>(null);
	const [selectedLevel, setSelectedLevel] = useState<
		CanonicalLevelId | undefined
	>(session?.contract?.levelMatch?.selectedLevel);
	const [correction, setCorrection] = useState<LocalCorrection | undefined>(
		session?.contract?.correction,
	);
	const [view, setView] = useState<'rulers' | 'match' | 'confirm'>(
		session?.contract ? 'confirm' : 'rulers',
	);

	// Processar resposta do fetcher
	useEffect(() => {
		if (fetcher.data) {
			const data = fetcher.data as {
				levelMatch?: LevelMatch;
				hardBlocks?: HardBlock[];
				corrections?: LocalCorrection[];
				autoSelected?: boolean;
				correctedRulers?: RulersVector;
				correction?: LocalCorrection;
				redirect?: string;
				success?: boolean;
				error?: string;
			};

			if (data.error) {
				// Tratar erro
				alert(data.error);
				return;
			}

			// Se redirecionamento, navegar
			if (data.redirect && data.success) {
				navigate(data.redirect);
				return;
			}

			// Se correção aplicada
			if (data.correctedRulers) {
				setRulers(data.correctedRulers);
				setCorrection(data.correction);
			}

			// Se resultado do match
			if (data.levelMatch) {
				setMatchResult({
					autoSelected: data.autoSelected ?? false,
					corrections: data.corrections || [],
					hardBlocks: data.hardBlocks || [],
					levelMatch: data.levelMatch,
				});
				setSelectedLevel(data.levelMatch.selectedLevel);
				setView('match');
			}
		}
	}, [fetcher.data, navigate]);

	// Handler para calcular match
	const handleCalculateMatch = () => {
		if (!session) return;
		const formData = new FormData();
		formData.append('_action', 'calculate-match');
		formData.append('rulers', JSON.stringify(rulers));
		formData.append('role', session.mode);

		fetcher.submit(formData, {
			action: `/session/${session.id}/stage-1`,
			method: 'post',
		});
	};

	// Handler para aplicar correção
	const handleApplyCorrection = (delta: Partial<RulersVector>) => {
		if (!session) return;
		const formData = new FormData();
		formData.append('_action', 'apply-correction');
		formData.append('rulers', JSON.stringify(rulers));
		formData.append('delta', JSON.stringify(delta));
		formData.append('role', session.mode);

		fetcher.submit(formData, {
			action: `/session/${session.id}/stage-1`,
			method: 'post',
		});
	};

	// Handler para confirmar contrato
	const handleConfirmContract = () => {
		if (!session || !matchResult) return;

		const formData = new FormData();
		formData.append('_action', 'confirm-contract');
		formData.append('rulers', JSON.stringify(rulers));
		formData.append('levelMatch', JSON.stringify(matchResult.levelMatch));
		formData.append('hardBlocks', JSON.stringify(matchResult.hardBlocks));
		formData.append('role', session.mode);
		if (correction) {
			formData.append('correction', JSON.stringify(correction));
		}

		fetcher.submit(formData, {
			action: `/session/${session.id}/stage-1`,
			method: 'post',
		});
	};

	const isLoading = fetcher.state === 'submitting';

	return (
		<div className="min-h-screen bg-bg-secondary">
			{/* Header */}
			<header className="border-b border-border-primary bg-bg-primary">
				<div className="container-page py-6">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
							<svg
								aria-hidden="true"
								className="w-6 h-6 text-text-inverse"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</div>
						<div>
							<h1 className="text-xl font-semibold text-text-primary">
								Etapa 1 — Configuração do Contrato
							</h1>
							<p className="text-sm text-text-secondary">
								Ajuste as réguas e confirme o nível canônico
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container-page py-8">
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Tela de Réguas */}
					{view === 'rulers' && session && (
						<>
							<RulersPanel
								disabled={isLoading}
								onChange={setRulers}
								rulers={rulers}
							/>

							<div className="flex gap-4">
								<Form action={`/session/${session.id}`} className="flex-1">
									<button
										className="w-full py-3 px-4 bg-bg-tertiary text-text-secondary rounded-lg font-medium hover:bg-border-secondary transition-colors"
										disabled={isLoading}
										type="submit"
									>
										Voltar
									</button>
								</Form>
								<button
									className="flex-1 py-3 px-4 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={isLoading}
									onClick={handleCalculateMatch}
									type="button"
								>
									{isLoading ? 'Calculando...' : 'Calcular Match'}
								</button>
							</div>
						</>
					)}

					{/* Tela de Match */}
					{view === 'match' && matchResult && (
						<>
							<MatchVisualization
								currentRulers={rulers}
								levelMatch={matchResult.levelMatch}
								onSelectLevel={setSelectedLevel}
								selectedLevel={selectedLevel}
							/>

							{matchResult.hardBlocks.length > 0 && (
								<HardBlocksAlert blocks={matchResult.hardBlocks} />
							)}

							{matchResult.corrections.length > 0 && (
								<CorrectionsUI
									corrections={matchResult.corrections}
									currentRulers={rulers}
									isLoading={isLoading}
									onApplyCorrection={handleApplyCorrection}
									onSkip={() => setView('confirm')}
								/>
							)}

							<div className="flex gap-4">
								<button
									className="flex-1 py-3 px-4 bg-bg-tertiary text-text-secondary rounded-lg font-medium hover:bg-border-secondary transition-colors"
									disabled={isLoading}
									onClick={() => setView('rulers')}
									type="button"
								>
									Voltar
								</button>
								{matchResult.corrections.length === 0 && (
									<button
										className="flex-1 py-3 px-4 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-dark transition-colors"
										disabled={isLoading}
										onClick={() => setView('confirm')}
										type="button"
									>
										Continuar
									</button>
								)}
							</div>
						</>
					)}

					{/* Tela de Confirmação */}
					{view === 'confirm' && matchResult && session && (
						<ContractConfirmation
							contract={{
								correction,
								hardBlocks: matchResult.hardBlocks,
								levelMatch: matchResult.levelMatch,
								role:
									session.contract?.role || ('role.analyze' as InitialRoleId),
								rulers,
							}}
							isLoading={isLoading}
							onBack={() => setView('match')}
							onConfirm={handleConfirmContract}
						/>
					)}
				</div>
			</main>
		</div>
	);
}
