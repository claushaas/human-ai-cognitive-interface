import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { SessionCard } from '~/components/stages';
import { Button, Card, CardContent, Header } from '~/components/ui';
import { createRepositories } from '~/db';
import type { PaginatedSessions } from '~/types/dashboard';

interface LoaderData {
	recentSessions: PaginatedSessions;
}

export async function loader({ context }: LoaderFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	const result = await repos.sessions.list({ limit: 6 });

	return new Response(
		JSON.stringify({ recentSessions: result } as LoaderData),
		{
			headers: { 'Content-Type': 'application/json' },
		},
	);
}

export function meta() {
	return [
		{ title: 'Human-AI Cognitive Interface' },
		{
			content: 'Medie cognições via contratos explícitos',
			name: 'description',
		},
	];
}

export default function Index() {
	const loaderData = useLoaderData<typeof loader>();
	const data = loaderData
		? (JSON.parse(String(loaderData)) as LoaderData)
		: null;
	const recentSessions = data?.recentSessions?.sessions || [];

	return (
		<div className="min-h-screen bg-bg-secondary">
			<Header />

			<main className="container-page py-12 md:py-16">
				<div className="max-w-4xl mx-auto">
					{/* Hero Section */}
					<div className="text-center mb-12">
						<div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6 shadow-lg">
							<svg
								aria-hidden="true"
								className="w-10 h-10 text-text-inverse"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
							Human-AI Cognitive Interface
						</h1>
						<p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8">
							Sistema de mediação cognitiva para interações humano-IA.
							Estabeleça contratos explícitos de cognição antes de executar
							tarefas.
						</p>
						<Link to="/session/new">
							<Button size="lg">
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
								Iniciar Nova Sessão
							</Button>
						</Link>
					</div>

					{/* Recent Sessions Section */}
					{recentSessions.length > 0 && (
						<div className="mb-12">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-text-primary">
									Sessões Recentes
								</h2>
								<Link
									className="text-primary hover:text-primary-dark text-sm font-medium"
									to="/sessions"
								>
									Ver todas →
								</Link>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{recentSessions.map((session) => (
									<SessionCard
										key={session.id}
										onClick={() => {
											window.location.href = `/sessions/${session.id}`;
										}}
										session={session}
									/>
								))}
							</div>
						</div>
					)}

					{/* Features Grid */}
					<div className="grid md:grid-cols-3 gap-6 mb-12">
						<Card>
							<CardContent className="p-6">
								<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
									<svg
										aria-hidden="true"
										className="w-6 h-6 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</div>
								<h3 className="text-lg font-semibold text-text-primary mb-2">
									Contratos Explícitos
								</h3>
								<p className="text-text-secondary">
									Defina claramente o papel, nível e réguas cognitivas antes de
									qualquer interação.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
									<svg
										aria-hidden="true"
										className="w-6 h-6 text-success"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</div>
								<h3 className="text-lg font-semibold text-text-primary mb-2">
									Match Canônico
								</h3>
								<p className="text-text-secondary">
									Algoritmo determinístico para encontrar o nível cognitivo
									ideal baseado nas suas réguas.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
									<svg
										aria-hidden="true"
										className="w-6 h-6 text-warning"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</div>
								<h3 className="text-lg font-semibold text-text-primary mb-2">
									Coleta Estruturada
								</h3>
								<p className="text-text-secondary">
									Protocolo de coleta derivado automaticamente do contrato para
									garantir execução adequada.
								</p>
							</CardContent>
						</Card>
					</div>

					{/* How it Works */}
					<Card className="mb-12" variant="elevated">
						<CardContent className="p-8">
							<h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
								Como Funciona
							</h2>
							<div className="grid md:grid-cols-3 gap-8">
								<div className="text-center">
									<div className="w-12 h-12 bg-primary text-text-inverse rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
										1
									</div>
									<h4 className="font-semibold text-text-primary mb-2">
										Escolha o Papel
									</h4>
									<p className="text-text-secondary text-sm">
										Selecione entre 6 papéis iniciais: Analisar, Sintetizar,
										Explorar, etc.
									</p>
								</div>
								<div className="text-center">
									<div className="w-12 h-12 bg-primary text-text-inverse rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
										2
									</div>
									<h4 className="font-semibold text-text-primary mb-2">
										Configure Réguas
									</h4>
									<p className="text-text-secondary text-sm">
										Ajuste as 5 dimensões cognitivas e receba o match de nível.
									</p>
								</div>
								<div className="text-center">
									<div className="w-12 h-12 bg-primary text-text-inverse rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
										3
									</div>
									<h4 className="font-semibold text-text-primary mb-2">
										Coleta & Execução
									</h4>
									<p className="text-text-secondary text-sm">
										Responda aos critérios derivados e gere o prompt de
										execução.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* CTA Section */}
					<div className="text-center">
						<p className="text-text-tertiary mb-4">Pronto para começar?</p>
						<Link to="/session/new">
							<Button size="lg" variant="secondary">
								Criar Nova Sessão
							</Button>
						</Link>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-border-primary mt-16">
				<div className="container-page py-8">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<p className="text-text-tertiary text-sm">
							© 2026 Human-AI Cognitive Interface. Todos os direitos reservados.
						</p>
						<div className="flex items-center gap-6">
							<a
								className="text-text-secondary hover:text-text-primary text-sm transition-colors"
								href="/docs"
							>
								Documentação
							</a>
							<a
								className="text-text-secondary hover:text-text-primary text-sm transition-colors"
								href="https://github.com/claushaas/human-ai-cognitive-interface"
								rel="noopener noreferrer"
								target="_blank"
							>
								GitHub
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
