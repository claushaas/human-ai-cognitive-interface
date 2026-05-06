import type { ReactNode } from 'react';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

export function AppShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col bg-haci-bg text-haci-text">
			<AppHeader />
			<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 md:px-6">
				{children}
			</main>
			<AppFooter />
		</div>
	);
}
