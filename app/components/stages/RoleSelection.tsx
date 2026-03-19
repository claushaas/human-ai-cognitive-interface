import { useState } from 'react';
import { Form } from 'react-router';
import { Button, Card, CardContent } from '~/components/ui';
import type { InitialRoleId } from '~/types';
import { RoleCard } from './RoleCard';

interface Role {
	id: InitialRoleId;
	label: string;
	description: string;
	semanticLoad: string[];
	blockedBehaviors: string[];
}

interface RoleSelectionProps {
	roles: Role[];
}

export function RoleSelection({ roles }: RoleSelectionProps) {
	const [selectedRole, setSelectedRole] = useState<InitialRoleId | null>(null);

	const handleSelect = (roleId: InitialRoleId) => {
		setSelectedRole(roleId);
	};

	const selectedRoleData = selectedRole
		? roles.find((r) => r.id === selectedRole)
		: null;

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
									d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</div>
						<div>
							<h1 className="text-xl font-semibold text-text-primary">
								Nova Sessão
							</h1>
							<p className="text-sm text-text-secondary">
								Etapa 0 — Seleção de Papel
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container-page py-8 md:py-12">
				<div className="max-w-4xl mx-auto">
					{/* Introdução */}
					<div className="text-center mb-10">
						<h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
							Escolha o Papel Inicial
						</h2>
						<p className="text-text-secondary mx-auto leading-relaxed">
							O papel define o modo como a IA vai interagir com você. Cada papel
							tem comportamentos permitidos e bloqueados específicos.
						</p>
					</div>

					{/* Grid de Papéis */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
						{roles.map((role) => (
							<RoleCard
								isSelected={selectedRole === role.id}
								key={role.id}
								onSelect={handleSelect}
								role={role}
							/>
						))}
					</div>

					{/* Resumo da Seleção */}
					{selectedRoleData && (
						<Card className="mb-8" variant="elevated">
							<CardContent className="p-6">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
										<svg
											aria-hidden="true"
											className="w-6 h-6 text-text-inverse"
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
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-text-primary mb-1">
											{selectedRoleData.label}
										</h3>
										<p className="text-text-secondary mb-3">
											{selectedRoleData.description}
										</p>
										<div className="flex flex-wrap gap-2">
											{selectedRoleData.blockedBehaviors.map((behavior) => (
												<span
													className="text-xs px-2 py-1 rounded-full bg-danger/10 text-danger"
													key={behavior}
													title="Comportamento bloqueado neste papel"
												>
													🚫 {behavior}
												</span>
											))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Formulário de Confirmação */}
					<Form className="flex flex-col items-center gap-4" method="post">
						<input name="role" type="hidden" value={selectedRole || ''} />

						<Button disabled={!selectedRole} fullWidth size="lg">
							{selectedRole ? (
								<>
									<svg
										aria-hidden="true"
										className="w-5 h-5 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M13 10V3L4 14h7v7l9-11h-7z"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
									Confirmar e Continuar
								</>
							) : (
								'Selecione um papel para continuar'
							)}
						</Button>

						{/* Link para voltar */}
						<a
							className="text-text-secondary hover:text-text-primary text-sm transition-colors"
							href="/"
						>
							← Voltar para a página inicial
						</a>
					</Form>
				</div>
			</main>
		</div>
	);
}
