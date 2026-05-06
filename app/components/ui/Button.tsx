import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	className?: string;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'danger' | 'ghost' | 'primary' | 'secondary';
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
	danger:
		'bg-haci-danger text-white hover:bg-oklch(0.52 0.12 32) focus-visible:ring-haci-danger',
	ghost:
		'bg-transparent text-haci-text-muted hover:bg-haci-surface-subtle hover:text-haci-text focus-visible:ring-haci-focus',
	primary:
		'bg-haci-accent text-haci-accent-contrast hover:bg-haci-accent-ink focus-visible:ring-haci-focus',
	secondary:
		'bg-haci-surface text-haci-text border border-haci-border hover:bg-haci-surface-subtle hover:border-haci-border-strong focus-visible:ring-haci-focus',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
	lg: 'px-6 py-3 text-base',
	md: 'px-4 py-2.5 text-sm',
	sm: 'px-3 py-1.5 text-xs',
};

export function Button({
	children,
	className = '',
	disabled,
	size = 'md',
	variant = 'primary',
	...props
}: ButtonProps) {
	const base =
		'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-haci-bg disabled:opacity-50 disabled:cursor-not-allowed';

	return (
		<button
			className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	);
}
