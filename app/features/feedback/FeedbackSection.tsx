import { useEffect, useState } from 'react';
import { FeedbackControl } from './FeedbackControl';

export interface FeedbackSectionProps {
	sessionId: string;
	feedbackValue?: 'positive' | 'negative' | 'none';
}

export function FeedbackSection({
	sessionId,
	feedbackValue: initialValue = 'none',
}: FeedbackSectionProps) {
	const [value, setValue] = useState<'positive' | 'negative' | 'none'>(
		initialValue,
	);
	const [saved, setSaved] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	const handleChange = async (next: 'positive' | 'negative' | 'none') => {
		setValue(next);
		if (next === 'none') return;

		setSaving(true);
		try {
			const formData = new FormData();
			formData.append('_action', 'submitFeedback');
			formData.append('feedback', next);

			const response = await fetch(`/app/session/${sessionId}`, {
				body: formData,
				method: 'POST',
			});

			if (response.ok) {
				setSaved(true);
				setTimeout(() => setSaved(false), 3000);
			}
		} catch {
			// Silently fail
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-3">
			<span className="text-haci-text-subtle text-sm">
				Esse prompt foi útil?
			</span>
			<FeedbackControl onChange={handleChange} value={value} />
			{saved && (
				<span aria-live="polite" className="text-haci-success text-sm">
					Obrigado pelo feedback!
				</span>
			)}
			{saving && (
				<span className="text-haci-text-subtle text-sm">Salvando...</span>
			)}
		</div>
	);
}
