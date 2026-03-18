// Dados dos níveis e papéis
import canonicalLevels from '~/config/canonical-levels.json';
import rulersConfig from '~/config/cognitive-rulers.json';
import initialRoles from '~/config/initial-roles.json';
import type {
	HardBlock,
	InitialRoleId,
	LevelMatch,
	LocalCorrection,
	RulersVector,
} from '~/types';

interface ContractConfirmationProps {
	contract: {
		role: InitialRoleId;
		rulers: RulersVector;
		levelMatch: LevelMatch;
		hardBlocks: HardBlock[];
		correction?: LocalCorrection;
	};
	onConfirm: () => void;
	onBack: () => void;
	isLoading?: boolean;
}

// Labels das réguas
const rulerLabels: Record<keyof RulersVector, string> = {
	decision: 'Decisão',
	inference: 'Inferência',
	meta: 'Meta',
	scope: 'Escopo',
	source: 'Fonte',
};

// Ícones dos papéis
const roleIcons: Record<InitialRoleId, string> = {
	'role.analyze':
		'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
	'role.decideSupport': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
	'role.document':
		'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
	'role.explore':
		'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7',
	'role.synthesize': 'M4 6h16M4 12h16m-7 6h7M4 18h4',
	'role.transform': 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
};

export function ContractConfirmation({
	contract,
	onConfirm,
	onBack,
	isLoading = false,
}: ContractConfirmationProps) {
	const { role, rulers, levelMatch, hardBlocks, correction } = contract;

	// Buscar dados do nível
	const levelData = canonicalLevels.levels.find(
		(l) => l.id === levelMatch.selectedLevel,
	);

	// Buscar dados do papel
	const roleData = initialRoles.roles.find((r) => r.id === role);

	// Verificar se há hard blocks críticos
	const hasBlockLevel = hardBlocks.some((b) => b.severity === 'BLOCK');
	const hasWarnings = hardBlocks.some((b) => b.severity !== 'BLOCK');

	return (
		<div className="bg-bg-primary rounded-xl border border-border-primary p-6">
			{/* Header */}
			<div className="mb-6">
				<h2 className="text-xl font-bold text-text-primary">
					Confirmar Contrato Cognitivo
				</h2>
				<p className="text-sm text-text-secondary mt-1">
					Revise os detalhes antes de confirmar
				</p>
			</div>

			<div className="space-y-6">
				{/* Seção: Papel */}
				<section>
					<h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-3">
						Papel Selecionado
					</h3>
					<div className="inline-flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-lg">
						<svg
							aria-hidden="true"
							className="w-5 h-5 text-primary"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d={roleIcons[role]}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
							/>
						</svg>
						<div>
							<span className="font-semibold text-text-primary">
								{roleData?.label || role}
							</span>
							<p className="text-xs text-text-secondary">
								{roleData?.description}
							</p>
						</div>
					</div>
				</section>

				{/* Seção: Réguas */}
				<section>
					<h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-3">
						Configuração das Réguas
					</h3>
					<div className="grid grid-cols-5 gap-3">
						{(Object.keys(rulerLabels) as Array<keyof RulersVector>).map(
							(rulerId) => {
								const value = rulers[rulerId];
								const config = rulersConfig.rulers[rulerId];
								const label =
									config?.labels[String(value) as keyof typeof config.labels];

								return (
									<div
										className="text-center p-3 bg-bg-secondary rounded-lg"
										key={rulerId}
									>
										<div className="text-xl font-bold text-primary">
											{value}
										</div>
										<div className="text-xs text-text-tertiary mt-1">
											{rulerLabels[rulerId]}
										</div>
										{label && (
											<div className="text-[10px] text-text-secondary mt-1 truncate">
												{label.slice(0, 20)}...
											</div>
										)}
									</div>
								);
							},
						)}
					</div>
				</section>

				{/* Seção: Nível Selecionado */}
				<section>
					<h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-3">
						Nível Canônico
					</h3>
					{levelMatch.selectedLevel ? (
						<div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
							<div>
								<span className="text-sm text-success font-medium">
									{levelMatch.selectedLevel}
								</span>
								<h4 className="font-semibold text-success">
									{levelData?.name}
								</h4>
							</div>
							<div className="text-right">
								<span className="text-sm text-text-secondary">Score</span>
								<div className="text-2xl font-mono font-bold text-success">
									{levelMatch.score}%
								</div>
							</div>
						</div>
					) : (
						<div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
							<p className="text-warning">
								Nenhum nível selecionado automaticamente
							</p>
						</div>
					)}
				</section>

				{/* Seção: Hard Blocks (se houver) */}
				{hardBlocks.length > 0 && (
					<section>
						<h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-3">
							Alertas
						</h3>
						<div className="space-y-2">
							{hasBlockLevel && (
								<div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
									<p className="text-danger font-medium">
										⚠️ Existem bloqueios críticos que devem ser resolvidos
									</p>
								</div>
							)}
							{hasWarnings && !hasBlockLevel && (
								<div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
									<p className="text-warning">
										⚠️ Existem avisos que devem ser revisados
									</p>
								</div>
							)}
						</div>
					</section>
				)}

				{/* Seção: Correção Aplicada (se houver) */}
				{correction && (
					<section>
						<h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-3">
							Correção Aplicada
						</h3>
						<div className="p-4 bg-info/10 border border-info/20 rounded-lg">
							<p className="text-info text-sm">{correction.reason}</p>
						</div>
					</section>
				)}
			</div>

			{/* Botões de ação */}
			<div className="flex gap-4 mt-6">
				<button
					className="flex-1 py-3 px-4 bg-bg-tertiary text-text-secondary rounded-lg font-medium hover:bg-border-secondary transition-colors"
					disabled={isLoading}
					onClick={onBack}
					type="button"
				>
					Voltar
				</button>
				<button
					className="flex-1 py-3 px-4 bg-primary text-text-inverse rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isLoading || hasBlockLevel}
					onClick={onConfirm}
					type="button"
				>
					{isLoading ? 'Confirmando...' : 'Confirmar Contrato'}
				</button>
			</div>

			{/* Aviso de bloqueio */}
			{hasBlockLevel && (
				<p className="text-sm text-danger text-center mt-3">
					Resolva os bloqueios antes de confirmar o contrato
				</p>
			)}
		</div>
	);
}
