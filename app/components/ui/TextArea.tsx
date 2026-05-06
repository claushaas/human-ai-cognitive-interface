import type { TextareaHTMLAttributes } from 'react';
import { useId } from 'react';

export interface TextAreaProps
	extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	className?: string;
	error?: string;
	hint?: string;
	label: string;
	showCounter?: boolean;
}

export function TextArea({
	className = '',
	error,
	hint,
	label,
	maxLength,
	showCounter,
	...props
}: TextAreaProps) {
	const id = useId();
	const hintId = `${id}-hint`;
	const errorId = `${id}-error`;
	const valueLength =
		typeof props.value === 'string'
			? props.value.length
			: typeof props.defaultValue === 'string'
				? props.defaultValue.length
				: 0;

	return (
		<div className={`space-y-1.5 ${className}`}>
			<label className="block font-medium text-sm" htmlFor={id}>
				{label}
			</label>
			{hint && (
				<p className="text-haci-text-subtle text-sm" id={hintId}>
					{hint}
				</p>
			)}
			<textarea
				aria-describedby={
					[hint && hintId, error && errorId].filter(Boolean).join(' ') ||
					undefined
				}
				aria-invalid={error ? 'true' : undefined}
				className="w-full min-h-[6rem] resize-y rounded-lg border border-haci-border bg-haci-surface px-3 py-2 text-sm leading-relaxed text-haci-text placeholder:text-haci-text-subtle transition-colors duration-150 focus:border-haci-accent focus:outline-none focus:ring-2 focus:ring-haci-accent-soft disabled:opacity-50 disabled:cursor-not-allowed"
				id={id}
				maxLength={maxLength}
				{...props}
			/>
			<div className="flex items-center justify-between">
				{error && (
					<p className="text-haci-danger text-sm" id={errorId}>
						{error}
					</p>
				)}
				{showCounter && maxLength && (
					<span className="ml-auto text-haci-text-subtle text-xs">
						{valueLength}/{maxLength}
					</span>
				)}
			</div>
		</div>
	);
}
