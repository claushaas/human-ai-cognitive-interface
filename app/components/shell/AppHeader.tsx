import { Link } from 'react-router';

export function AppHeader() {
	return (
		<header className="border-b border-haci-border bg-haci-surface px-4 py-3">
			<nav className="mx-auto flex max-w-3xl items-center justify-between">
				<Link
					className="font-serif text-lg font-bold tracking-tight text-haci-text no-underline transition-colors duration-150 hover:text-haci-accent-ink"
					to="/"
				>
					HACI
				</Link>
				<div className="flex items-center gap-4 md:gap-6">
					<Link
						className="text-haci-text-muted text-sm no-underline transition-colors duration-150 hover:text-haci-text"
						to="/app/new"
					>
						Novo
					</Link>
					<Link
						className="text-haci-text-muted text-sm no-underline transition-colors duration-150 hover:text-haci-text"
						to="/app/history"
					>
						Histórico
					</Link>
				</div>
			</nav>
		</header>
	);
}
