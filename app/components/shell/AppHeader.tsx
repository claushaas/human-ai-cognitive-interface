import { Link } from 'react-router';

export function AppHeader() {
	return (
		<header className="border-b border-neutral-200 px-4 py-3">
			<nav className="mx-auto flex max-w-3xl items-center justify-between">
				<Link
					className="font-semibold text-lg tracking-tight text-neutral-900 no-underline"
					to="/"
				>
					HACI
				</Link>
				<div className="flex items-center gap-4">
					<Link
						className="text-neutral-600 text-sm no-underline hover:text-neutral-900"
						to="/app/new"
					>
						Novo
					</Link>
					<Link
						className="text-neutral-600 text-sm no-underline hover:text-neutral-900"
						to="/app/history"
					>
						Histórico
					</Link>
				</div>
			</nav>
		</header>
	);
}
