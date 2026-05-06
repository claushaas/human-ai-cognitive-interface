import type { ReactNode } from 'react';

export interface CardProps {
	children: ReactNode;
	className?: string;
	tone?: 'danger' | 'default' | 'subtle' | 'success' | 'warning';
}

const toneClasses: Record<NonNullable<CardProps['tone']>, string> = {
	danger: 'bg-haci-danger-surface border-haci-danger text-haci-text',
	default: 'bg-haci-surface border-haci-border text-haci-text',
	subtle: 'bg-haci-surface-subtle border-haci-border text-haci-text',
	success: 'bg-haci-success-surface border-haci-success text-haci-text',
	warning: 'bg-haci-warning-surface border-haci-warning text-haci-text',
};

export function Card({
	children,
	className = '',
	tone = 'default',
}: CardProps) {
	return (
		<div
			className={`rounded-xl border p-5 transition-colors duration-150 ${toneClasses[tone]} ${className}`}
		>
			{children}
		</div>
	);
}
