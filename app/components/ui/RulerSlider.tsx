import { useId } from 'react';

export interface RulerSliderProps {
	className?: string;
	description?: string;
	disabled?: boolean;
	label: string;
	max?: number;
	min?: number;
	onChange?: (value: number) => void;
	value: number;
}

export function RulerSlider({
	className = '',
	description,
	disabled,
	label,
	max = 5,
	min = 1,
	onChange,
	value,
}: RulerSliderProps) {
	const id = useId();
	const descId = `${id}-desc`;

	return (
		<div className={`space-y-2 ${className}`}>
			<div className="flex items-center justify-between">
				<label className="font-medium text-sm text-haci-text" htmlFor={id}>
					{label}
				</label>
				<span
					aria-hidden="true"
					className="rounded bg-haci-surface-subtle px-2 py-0.5 font-medium text-sm text-haci-text-muted"
				>
					{value}
				</span>
			</div>
			{description && (
				<p className="text-haci-text-subtle text-sm" id={descId}>
					{description}
				</p>
			)}
			<input
				aria-describedby={description ? descId : undefined}
				className="w-full accent-haci-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={disabled}
				id={id}
				max={max}
				min={min}
				onChange={(e) => onChange?.(Number(e.target.value))}
				type="range"
				value={value}
			/>
			<div className="flex justify-between text-haci-text-subtle text-xs">
				<span>{min}</span>
				<span>{max}</span>
			</div>
		</div>
	);
}
