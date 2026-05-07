import { useState } from 'react';
import { Button } from '~/components/ui/Button';

export type FeedbackValue = 'positive' | 'negative' | 'none';

export interface FeedbackControlProps {
	className?: string;
	onChange?: (value: FeedbackValue) => void;
	value?: FeedbackValue;
}

export function FeedbackControl({
	className = '',
	onChange,
	value: controlledValue,
}: FeedbackControlProps) {
	const [internal, setInternal] = useState<FeedbackValue>('none');
	const value = controlledValue ?? internal;

	const handle = (next: FeedbackValue) => {
		setInternal(next);
		onChange?.(next);
	};

	return (
		<fieldset
			aria-label="Feedback sobre o prompt"
			className={`flex items-center gap-2 ${className}`}
		>
			<Button
				aria-label="Sim, o prompt foi útil"
				aria-pressed={value === 'positive'}
				onClick={() => handle('positive')}
				size="sm"
				variant={value === 'positive' ? 'primary' : 'ghost'}
			>
				Sim
			</Button>
			<Button
				aria-label="Não, o prompt não foi útil"
				aria-pressed={value === 'negative'}
				onClick={() => handle('negative')}
				size="sm"
				variant={value === 'negative' ? 'danger' : 'ghost'}
			>
				Não
			</Button>
		</fieldset>
	);
}
