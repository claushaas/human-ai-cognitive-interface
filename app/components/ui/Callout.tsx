import type { ReactNode } from 'react';

export interface CalloutProps {
	children: ReactNode;
	className?: string;
	title?: string;
	tone?: 'danger' | 'info' | 'success' | 'warning';
}

const toneClasses: Record<NonNullable<CalloutProps['tone']>, string> = {
	danger: 'bg-haci-danger-surface border-haci-danger text-haci-text',
	info: 'bg-haci-accent-soft border-haci-accent text-haci-text',
	success: 'bg-haci-success-surface border-haci-success text-haci-text',
	warning: 'bg-haci-warning-surface border-haci-warning text-haci-text',
};

const toneIcons: Record<NonNullable<CalloutProps['tone']>, string> = {
	danger: '●',
	info: '●',
	success: '●',
	warning: '●',
};

export function Callout({
	children,
	className = '',
	title,
	tone = 'info',
}: CalloutProps) {
	return (
		<div
			className={`rounded-lg border px-4 py-3 ${toneClasses[tone]} ${className}`}
			role="alert"
		>
			<div className="flex items-start gap-3">
				<span aria-hidden="true" className="mt-0.5 select-none text-sm">
					{toneIcons[tone]}
				</span>
				<div className="min-w-0 flex-1">
					{title && <p className="font-semibold text-sm">{title}</p>}
					<div className="text-sm leading-relaxed">{children}</div>
				</div>
			</div>
		</div>
	);
}
