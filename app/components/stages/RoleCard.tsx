import type { InitialRoleId } from '~/types';

interface Role {
	id: InitialRoleId;
	label: string;
	description: string;
	semanticLoad: string[];
	blockedBehaviors: string[];
}

interface RoleCardProps {
	role: Role;
	isSelected: boolean;
	onSelect: (roleId: InitialRoleId) => void;
}

// Ícones para cada papel
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

export function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
	return (
		<button
			className={`group relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 text-left w-full
				${
					isSelected
						? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
						: 'border-border-primary bg-bg-primary hover:border-primary/50 hover:bg-bg-secondary'
				}
			`}
			onClick={() => onSelect(role.id)}
			type="button"
		>
			{/* Ícone */}
			<div
				className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors
					${isSelected ? 'bg-primary text-text-inverse' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}
				`}
			>
				<svg
					aria-hidden="true"
					className="w-7 h-7"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						d={roleIcons[role.id]}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
					/>
				</svg>
			</div>

			{/* Título */}
			<h3 className="text-lg font-semibold text-text-primary mb-2 text-center">
				{role.label}
			</h3>

			{/* Descrição */}
			<p className="text-sm text-text-secondary text-center mb-4 leading-relaxed">
				{role.description}
			</p>

			{/* Carga Semântica */}
			<div className="flex flex-wrap gap-1.5 justify-center mt-auto">
				{role.semanticLoad.map((item) => (
					<span
						className={`text-xs px-2 py-0.5 rounded-full
							${isSelected ? 'bg-primary/20 text-primary' : 'bg-bg-tertiary text-text-tertiary'}
						`}
						key={item}
					>
						{item}
					</span>
				))}
			</div>

			{/* Indicador de seleção */}
			{isSelected && (
				<div className="absolute top-3 right-3 w-6 h-6 bg-primary text-text-inverse rounded-full flex items-center justify-center">
					<svg
						aria-hidden="true"
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M5 13l4 4L19 7"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
						/>
					</svg>
				</div>
			)}
		</button>
	);
}
