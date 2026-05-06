import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import type { InitialRole } from '~/domain/contracts';

const ROLES: Array<{
	id: InitialRole;
	label: string;
	description: string;
}> = [
	{
		description: 'Entender partes, relações e implicações.',
		id: 'role.analyze',
		label: 'Analisar',
	},
	{
		description: 'Condensar informação em uma estrutura clara.',
		id: 'role.synthesize',
		label: 'Sintetizar',
	},
	{
		description: 'Levantar possibilidades, caminhos e alternativas.',
		id: 'role.explore',
		label: 'Explorar',
	},
	{
		description: 'Comparar opções e preparar uma escolha humana.',
		id: 'role.decideSupport',
		label: 'Apoiar decisão',
	},
	{
		description: 'Produzir uma especificação, guia ou registro.',
		id: 'role.document',
		label: 'Documentar',
	},
	{
		description: 'Reescrever, adaptar ou converter conteúdo.',
		id: 'role.transform',
		label: 'Transformar',
	},
];

export interface RoleStepProps {
	selectedRole?: InitialRole;
	onSelect: (role: InitialRole) => void;
}

export function RoleStep({ selectedRole, onSelect }: RoleStepProps) {
	const [localSelection, setLocalSelection] = useState<InitialRole | undefined>(
		selectedRole,
	);

	const handleSelect = (role: InitialRole) => {
		setLocalSelection(role);
	};

	const handleSubmit = () => {
		if (localSelection) {
			onSelect(localSelection);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="font-serif text-xl font-bold text-haci-text">
					Qual o papel da IA?
				</h2>
				<p className="text-haci-text-subtle text-sm">
					Escolha o que você quer que a IA faça. Isso ajuda a estruturar o
					prompt da melhor forma.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{ROLES.map((role) => {
					const isSelected = localSelection === role.id;
					return (
						<button
							className={`text-left transition-all duration-150 ${
								isSelected ? 'ring-2 ring-haci-accent' : ''
							}`}
							key={role.id}
							onClick={() => handleSelect(role.id)}
							type="button"
						>
							<Card
								className={`h-full ${
									isSelected
										? 'border-haci-accent bg-haci-accent-soft'
										: 'hover:bg-haci-surface-subtle'
								}`}
							>
								<h3 className="font-medium text-sm text-haci-text">
									{role.label}
								</h3>
								<p className="mt-1 text-haci-text-subtle text-sm">
									{role.description}
								</p>
							</Card>
						</button>
					);
				})}
			</div>

			<div className="flex justify-end">
				<Button disabled={!localSelection} onClick={handleSubmit}>
					Continuar
				</Button>
			</div>
		</div>
	);
}
