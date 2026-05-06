import { useState } from 'react';
import { Button } from './Button';

export interface FeedbackControlProps {
	className?: string;
	onChange?: (value: 'negative' | 'none' | 'positive') => void;
	value?: 'negative' | 'none' | 'positive';
}

export function FeedbackControl({
	className = '',
	onChange,
	value: controlledValue,
}: FeedbackControlProps) {
	const [internal, setInternal] = useState<'negative' | 'none' | 'positive'>(
		'none',
	);
	const value = controlledValue ?? internal;

	const handle = (next: 'negative' | 'none' | 'positive') => {
		setInternal(next);
		onChange?.(next);
	};

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<Button
				aria-pressed={value === 'positive'}
				onClick={() => handle('positive')}
				size="sm"
				variant={value === 'positive' ? 'primary' : 'ghost'}
			>
				👍 Funcionou
			</Button>
			<Button
				aria-pressed={value === 'negative'}
				onClick={() => handle('negative')}
				size="sm"
				variant={value === 'negative' ? 'danger' : 'ghost'}
			>
				👎 Não funcionou
			</Button>
		</div>
	);
}
