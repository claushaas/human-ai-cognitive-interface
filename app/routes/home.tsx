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
		<section className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
			<header className="space-y-4">
				<h1 className="font-bold text-5xl tracking-tight text-neutral-900">
					HACI
				</h1>
				<p className="text-neutral-500 text-xl">Human-AI Cognitive Interface</p>
				<p className="max-w-lg text-neutral-600 text-lg leading-relaxed">
					Inicie conversas mais assertivas com uma IA.{' '}
					<span className="font-medium">
						Ferramenta para estruturar um prompt inicial antes de abrir um chat
						com IA.
					</span>
				</p>
			</header>

			<nav className="flex flex-col items-center gap-4">
				<a
					className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-8 py-3 font-medium text-sm text-white no-underline transition hover:bg-neutral-800"
					href="/app/new"
				>
					Criar novo prompt
				</a>

				<a
					className="text-neutral-600 text-sm no-underline hover:text-neutral-900"
					href="/app/history"
				>
					Ver histórico
				</a>
			</nav>

			<p className="text-neutral-400 text-xs">
				Ambiente: {env.APP_ENV} | v1.0.0
			</p>
		</section>
	);
}
