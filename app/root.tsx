import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'react-router';
import type { Route } from './+types/root';

import './styles.css';

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR">
			<head>
				<meta charSet="utf-8" />
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<meta content="#3b82f6" name="theme-color" />
				<Meta />
				<Links />
			</head>
			<body className="min-h-screen bg-bg-secondary text-text-primary antialiased">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!';
	let details = 'An unexpected error occurred.';
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error';
		details =
			error.status === 404
				? 'The requested page could not be found.'
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container-page py-12">
			<div className="mx-auto text-center">
				<h1 className="text-4xl font-bold text-text-primary mb-4">{message}</h1>
				<p className="text-lg text-text-secondary mb-8">{details}</p>
				{stack && (
					<pre className="bg-bg-tertiary border border-border-primary rounded-lg p-4 overflow-auto text-left text-sm font-mono text-text-secondary">
						<code>{stack}</code>
					</pre>
				)}
				<a
					className="inline-flex items-center justify-center px-6 py-3 bg-primary text-text-inverse font-medium rounded-lg hover:bg-primary-dark transition-colors"
					href="/"
				>
					Voltar para a página inicial
				</a>
			</div>
		</main>
	);
}
