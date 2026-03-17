import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import {
	logContractConfirmed,
	logCorrection,
	logHardBlock,
	logMatchDecision,
} from '~/app/lib/audit';
import {
	createValidationErrorResponse,
	validateRulersVector,
	validateSessionMode,
} from '~/app/lib/validation';
import { calculateMatch } from '~/core/match';
import { createRepositories } from '~/db';
import type {
	CognitiveContract,
	HardBlock,
	InitialRoleId,
	LevelMatch,
	LocalCorrection,
	RulersVector,
} from '~/types';

export async function loader({ params, context }: LoaderFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		return new Response(JSON.stringify({ error: 'Session ID required' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 400,
		});
	}

	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ error: 'Session not found' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 404,
		});
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

	return new Response(
		JSON.stringify({
			session: {
				...session,
				contract: latestContract?.contract_data
					? JSON.parse(latestContract.contract_data)
					: null,
			},
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
}

export async function action({ params, request, context }: ActionFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const sessionId = params.id;
	if (!sessionId) {
		return new Response(JSON.stringify({ error: 'Session ID required' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 400,
		});
	}

	// Buscar sessão para validação de modo
	const session = await repos.sessions.findById(sessionId);
	if (!session) {
		return new Response(JSON.stringify({ error: 'Session not found' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 404,
		});
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
			return handleCalculateMatch(formData, sessionId, repos);
		case 'apply-correction':
			return handleApplyCorrection(formData, sessionId, repos);
		case 'confirm-contract':
			return handleConfirmContract(formData, sessionId, repos);
		default:
			return new Response(JSON.stringify({ error: 'Unknown action type' }), {
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			});
	}
}

async function handleCalculateMatch(
	formData: FormData,
	sessionId: string,
	_repos: ReturnType<typeof createRepositories>,
) {
	const rulersParam = formData.get('rulers');
	const roleParam = formData.get('role');

	if (!rulersParam || !roleParam) {
		return new Response(
			JSON.stringify({ error: 'Missing required fields: rulers, role' }),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			},
		);
	}

	const rulers = JSON.parse(rulersParam as string) as RulersVector;
	const role = roleParam as string;

	// Validação completa das réguas (inclui cap constitucional)
	const rulersValidation = validateRulersVector(rulers);
	if (!rulersValidation.valid) {
		return createValidationErrorResponse(
			sessionId,
			rulersValidation.error || 'Invalid rulers',
			rulersValidation.status,
		);
	}

	// Calcular match usando motor canônico
	const matchResult = calculateMatch(rulers, role as InitialRoleId);

	// Log de auditoria para decisões de match
	logMatchDecision(sessionId, rulers, {
		autoSelected: matchResult.autoSelected,
		hasCorrections: !!matchResult.corrections?.length,
		hasHardBlocks: !!matchResult.hardBlocks?.length,
		score: matchResult.score,
		selectedLevel: matchResult.selectedLevel,
	});

	// Log de hard blocks se houver
	if (matchResult.hardBlocks?.length) {
		for (const block of matchResult.hardBlocks) {
			logHardBlock(sessionId, block.ruleId, block.message, block.severity);
		}
	}

	// Transformar para formato serializável
	const levelMatch: LevelMatch = {
		candidates: matchResult.candidates.map((c) => ({
			level: c.level,
			score: c.score,
		})),
		score: matchResult.score,
		selectedLevel: matchResult.selectedLevel,
	};

	const hardBlocks: HardBlock[] =
		matchResult.hardBlocks?.map((hb) => ({
			id: hb.ruleId,
			message: hb.message,
			severity: hb.severity,
		})) || [];

	const corrections: LocalCorrection[] =
		matchResult.corrections?.map((c) => ({
			reason: c.reason,
			rulersDelta: c.rulersDelta,
		})) || [];

	return new Response(
		JSON.stringify({
			autoSelected: matchResult.autoSelected,
			corrections,
			hardBlocks,
			levelMatch,
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
}

async function handleApplyCorrection(
	formData: FormData,
	sessionId: string,
	_repos: ReturnType<typeof createRepositories>,
) {
	const rulersParam = formData.get('rulers');
	const deltaParam = formData.get('delta');

	if (!rulersParam || !deltaParam) {
		return new Response(
			JSON.stringify({
				error: 'Missing required fields: rulers, delta',
			}),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			},
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
		return new Response(
			JSON.stringify({
				error: 'Correction limited to maximum 2 rulers',
			}),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			},
		);
	}

	// Validar restrição: magnitude máxima ±1 por régua
	for (const ruler of modifiedRulers) {
		const original = originalRulers[ruler as keyof RulersVector];
		const corrected = delta[ruler as keyof RulersVector];
		if (corrected !== undefined && Math.abs(corrected - original) > 1) {
			return new Response(
				JSON.stringify({
					error: `Correction magnitude exceeded for ruler ${ruler}: max ±1`,
				}),
				{
					headers: { 'Content-Type': 'application/json' },
					status: 400,
				},
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
			sessionId,
			rulersValidation.error || 'Constitutional violation after correction',
			rulersValidation.status,
		);
	}

	const role = formData.get('role') as string;

	// Recalcular match com réguas corrigidas
	const matchResult = calculateMatch(correctedRulers, role as InitialRoleId);

	const levelMatch: LevelMatch = {
		candidates: matchResult.candidates.map((c) => ({
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
	logCorrection(sessionId, originalRulers, correctedRulers, delta);

	return new Response(
		JSON.stringify({
			autoSelected: matchResult.autoSelected,
			correctedRulers,
			correction,
			levelMatch,
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
}

async function handleConfirmContract(
	formData: FormData,
	sessionId: string,
	repos: ReturnType<typeof createRepositories>,
) {
	const rulersParam = formData.get('rulers');
	const levelMatchParam = formData.get('levelMatch');
	const hardBlocksParam = formData.get('hardBlocks');
	const roleParam = formData.get('role');
	const correctionParam = formData.get('correction');

	if (!rulersParam || !levelMatchParam || !roleParam) {
		return new Response(
			JSON.stringify({
				error: 'Missing required fields: rulers, levelMatch, role',
			}),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			},
		);
	}

	const rulers = JSON.parse(rulersParam as string) as RulersVector;

	// Validação completa das réguas (inclui cap constitucional)
	const rulersValidation = validateRulersVector(rulers);
	if (!rulersValidation.valid) {
		return createValidationErrorResponse(
			sessionId,
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
	await repos.contracts.create(contractId, sessionId, contract);

	// Atualizar sessão com contrato e transitar para próxima etapa
	await repos.sessions.update(sessionId, {
		contract,
		current_stage: 1,
	});

	// Log de auditoria da confirmação do contrato
	logContractConfirmed(
		sessionId,
		contractId,
		role,
		levelMatch.selectedLevel || 'N/A',
		rulers,
	);

	return new Response(
		JSON.stringify({
			contractId,
			redirect: `/session/${sessionId}/stage-2`,
			sessionId,
			success: true,
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
}
