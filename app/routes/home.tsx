import { Button } from '~/components/ui/Button';
import { getPublicEnv } from '~/lib/env/public';

export function meta() {
	return [
		{ title: 'HACI — Human-AI Cognitive Interface' },
		{
			content: 'Inicie conversas mais assertivas com uma IA.',
			name: 'description',
		},
	];
}

export default function Home() {
	const env = getPublicEnv();

	return (
		<section className="flex flex-1 flex-col items-center justify-center gap-10 text-center px-4">
			<header className="space-y-5 max-w-lg">
				<h1 className="font-serif text-6xl font-bold tracking-tight text-haci-text md:text-7xl">
					HACI
				</h1>
				<p className="text-haci-text-muted text-xl md:text-2xl">
					Human-AI Cognitive Interface
				</p>
				<p className="text-haci-text text-lg leading-relaxed">
					Inicie conversas mais assertivas com uma IA.{' '}
					<span className="font-medium">
						Ferramenta para estruturar um prompt inicial antes de abrir um chat
						com IA.
					</span>
				</p>
			</header>

			<nav className="flex flex-col items-center gap-4">
				<a href="/app/new">
					<Button size="lg">Criar novo prompt</Button>
				</a>

				<a
					className="text-haci-text-muted text-sm no-underline transition-colors duration-150 hover:text-haci-text"
					href="/app/history"
				>
					Ver histórico
				</a>
			</nav>

			<p className="text-haci-text-subtle text-xs">
				Ambiente: {env.APP_ENV} | v1.0.0
			</p>
		</section>
	);
}
