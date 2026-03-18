import type { ReactNode } from 'react';

interface CardProps {
	children: ReactNode;
	className?: string;
	variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({
	children,
	className = '',
	variant = 'default',
}: CardProps) {
	const variants = {
		default: 'bg-bg-primary border border-border-primary',
		elevated: 'bg-bg-primary border border-border-primary shadow-lg',
		outlined: 'bg-bg-primary border-2 border-border-secondary',
	};

	return (
		<div
			className={`rounded-xl overflow-hidden ${variants[variant]} ${className}`}
		>
			{children}
		</div>
	);
}

interface CardHeaderProps {
	children: ReactNode;
	className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
	return (
		<div className={`px-6 py-4 border-b border-border-primary ${className}`}>
			{children}
		</div>
	);
}

interface CardContentProps {
	children: ReactNode;
	className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
	return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

interface CardFooterProps {
	children: ReactNode;
	className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
	return (
		<div
			className={`px-6 py-4 border-t border-border-primary bg-bg-secondary ${className}`}
		>
			{children}
		</div>
	);
}
