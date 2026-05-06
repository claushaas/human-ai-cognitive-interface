import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Callout } from '~/components/ui/Callout';
import { Card } from '~/components/ui/Card';
import { FeedbackControl } from '~/components/ui/FeedbackControl';
import type { PromptGenerationResult } from '~/domain/contracts';

export interface ResultStepProps {
	promptResult: PromptGenerationResult;
	onNewPrompt: () => void;
}

export function ResultStep({ promptResult, onNewPrompt }: ResultStepProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			if (navigator.clipboard) {
				await navigator.clipboard.writeText(promptResult.prompt);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} else {
				// Fallback
				const textarea = document.createElement('textarea');
				textarea.value = promptResult.prompt;
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand('copy');
				document.body.removeChild(textarea);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
		} catch {
			// Ignore copy errors
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="font-serif text-xl font-bold text-haci-text">
					Resultado
				</h2>
				<p className="text-haci-text-subtle text-sm">
					Seu prompt está pronto. Copie e use em sua conversa com a IA.
				</p>
			</div>

			<Callout tone="info">
				<p className="text-sm">
					Este prompt foi estruturado para iniciar uma conversa mais assertiva
					com uma IA. Copie o texto abaixo e cole no chat de sua preferência.
				</p>
			</Callout>

			<Card>
				<div className="flex items-center justify-between mb-3">
					<h3 className="font-medium text-sm text-haci-text">Prompt gerado</h3>
					<Button
						onClick={handleCopy}
						size="sm"
						variant={copied ? 'primary' : 'secondary'}
					>
						{copied ? 'Copiado!' : 'Copiar'}
					</Button>
				</div>
				<pre className="whitespace-pre-wrap rounded-lg bg-haci-surface-subtle p-4 font-mono text-sm leading-relaxed text-haci-text">
					{promptResult.prompt}
				</pre>
			</Card>

			<div className="flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-2">
					<span className="text-haci-text-subtle text-sm">
						O prompt funcionou?
					</span>
					<FeedbackControl />
				</div>
			</div>

			<div className="flex justify-between">
				<Button onClick={onNewPrompt}>Criar novo prompt</Button>
				<Button disabled variant="secondary">
					Exportar (em breve)
				</Button>
			</div>
		</div>
	);
}
