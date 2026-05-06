import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import { TextArea } from '~/components/ui/TextArea';
import type { RawIntent } from '~/domain/contracts';
import { CONTRACT_VERSION, RawIntentSchema } from '~/domain/contracts';

export interface IntentStepProps {
	onSubmit: (intent: RawIntent) => void;
}

export function IntentStep({ onSubmit }: IntentStepProps) {
	const [text, setText] = useState('');
	const [desiredOutcome, setDesiredOutcome] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = () => {
		setError('');

		const intent: RawIntent = {
			desiredOutcome: desiredOutcome.trim() || undefined,
			locale: 'pt-BR',
			text: text.trim(),
			version: CONTRACT_VERSION,
		};

		const result = RawIntentSchema.safeParse(intent);
		if (!result.success) {
			const firstError = result.error.issues[0];
			setError(firstError?.message ?? 'Texto inválido');
			return;
		}

		onSubmit(intent);
	};

	const isValid = text.trim().length >= 1;

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="font-serif text-xl font-bold text-haci-text">
					O que você quer conseguir com a IA?
				</h2>
				<p className="text-haci-text-subtle text-sm">
					Descreva o resultado esperado. Não precisa escrever um prompt perfeito
					agora.
				</p>
			</div>

			<TextArea
				error={error || undefined}
				hint="Exemplo: quero organizar minhas anotações de leitura em um sistema de tags..."
				label="Descrição da tarefa"
				maxLength={8000}
				onChange={(e) => setText(e.target.value)}
				placeholder="Descreva o resultado que você quer obter..."
				showCounter
				value={text}
			/>

			<TextArea
				hint="Opcional: qual resultado específico você espera ao final?"
				label="Resultado desejado (opcional)"
				maxLength={2000}
				onChange={(e) => setDesiredOutcome(e.target.value)}
				placeholder="Exemplo: um sistema de tags com categorias principais e subcategorias..."
				showCounter
				value={desiredOutcome}
			/>

			<div className="flex justify-end">
				<Button disabled={!isValid} onClick={handleSubmit}>
					Continuar
				</Button>
			</div>
		</div>
	);
}
