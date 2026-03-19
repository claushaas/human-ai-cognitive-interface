import type { CanonicalLevelId, InitialRoleId } from '~/types';
import type { SessionFilters as SessionFiltersType } from '~/types/dashboard';

interface SessionFiltersProps {
	filters: SessionFiltersType;
	onChange: (filters: SessionFiltersType) => void;
}

const roles: { value: InitialRoleId; label: string }[] = [
	{ label: 'Analisar', value: 'role.analyze' },
	{ label: 'Sintetizar', value: 'role.synthesize' },
	{ label: 'Explorar', value: 'role.explore' },
	{ label: 'Apoiar Decisão', value: 'role.decideSupport' },
	{ label: 'Documentar', value: 'role.document' },
	{ label: 'Transformar', value: 'role.transform' },
];

const levels: { value: CanonicalLevelId; label: string }[] = [
	{ label: 'N1', value: 'N1' },
	{ label: 'N2', value: 'N2' },
	{ label: 'N3', value: 'N3' },
	{ label: 'N4', value: 'N4' },
	{ label: 'N5', value: 'N5' },
	{ label: 'N6', value: 'N6' },
	{ label: 'N7', value: 'N7' },
	{ label: 'N8', value: 'N8' },
];

const statuses: { value: SessionFiltersType['status']; label: string }[] = [
	{ label: 'Rascunho', value: 'draft' },
	{ label: 'Contrato Configurado', value: 'contract_configured' },
	{ label: 'Coleta em Andamento', value: 'collection_in_progress' },
	{ label: 'Completo', value: 'completed' },
];

export function SessionFilters({ filters, onChange }: SessionFiltersProps) {
	const hasActiveFilters =
		filters.role || filters.level || filters.status || filters.search;

	const handleClearFilters = () => {
		onChange({
			level: undefined,
			role: undefined,
			search: undefined,
			status: undefined,
		});
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
			<div className="flex flex-wrap gap-3 items-end">
				{/* Search Input */}
				<div className="flex-1 min-w-[200px]">
					<label
						className="block text-sm font-medium text-gray-700 mb-1"
						htmlFor="search"
					>
						Buscar
					</label>
					<div className="relative">
						<input
							className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
							id="search"
							onChange={(e) =>
								onChange({ ...filters, search: e.target.value || undefined })
							}
							placeholder="ID da sessão..."
							type="text"
							value={filters.search || ''}
						/>
						<svg
							className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Ícone de busca</title>
							<path
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
					</div>
				</div>

				{/* Role Select */}
				<div>
					<label
						className="block text-sm font-medium text-gray-700 mb-1"
						htmlFor="role"
					>
						Papel
					</label>
					<select
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[140px]"
						id="role"
						onChange={(e) =>
							onChange({
								...filters,
								role: (e.target.value as InitialRoleId) || undefined,
							})
						}
						value={filters.role || ''}
					>
						<option value="">Todos</option>
						{roles.map((role) => (
							<option key={role.value} value={role.value}>
								{role.label}
							</option>
						))}
					</select>
				</div>

				{/* Level Select */}
				<div>
					<label
						className="block text-sm font-medium text-gray-700 mb-1"
						htmlFor="level"
					>
						Nível
					</label>
					<select
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[80px]"
						id="level"
						onChange={(e) =>
							onChange({
								...filters,
								level: (e.target.value as CanonicalLevelId) || undefined,
							})
						}
						value={filters.level || ''}
					>
						<option value="">Todos</option>
						{levels.map((level) => (
							<option key={level.value} value={level.value}>
								{level.label}
							</option>
						))}
					</select>
				</div>

				{/* Status Select */}
				<div>
					<label
						className="block text-sm font-medium text-gray-700 mb-1"
						htmlFor="status"
					>
						Status
					</label>
					<select
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[160px]"
						id="status"
						onChange={(e) =>
							onChange({
								...filters,
								status:
									(e.target.value as SessionFiltersType['status']) || undefined,
							})
						}
						value={filters.status || ''}
					>
						<option value="">Todos</option>
						{statuses.map((status) => (
							<option key={status.value} value={status.value}>
								{status.label}
							</option>
						))}
					</select>
				</div>

				{/* Clear Filters Button */}
				{hasActiveFilters && (
					<button
						className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
						onClick={handleClearFilters}
						type="button"
					>
						Limpar filtros
					</button>
				)}
			</div>
		</div>
	);
}
