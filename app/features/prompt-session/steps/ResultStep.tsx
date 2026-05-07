import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/Button';
import { Callout } from '~/components/ui/Callout';
import { Card } from '~/components/ui/Card';
import type { PromptGenerationResult } from '~/domain/contracts';
import { FeedbackSection } from '~/features/feedback/FeedbackSection';

export interface ResultStepProps {
	promptResult: PromptGenerationResult;
	onNewPrompt: () => void;
	sessionId?: string;
	feedbackValue?: 'positive' | 'negative' | 'none';
}

export function ResultStep({
	promptResult,
	onNewPrompt,
	sessionId,
	feedbackValue = 'none',
}: ResultStepProps) {
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

			{sessionId && (
				<FeedbackSection feedbackValue={feedbackValue} sessionId={sessionId} />
			)}

			<div className="flex justify-between flex-wrap gap-3">
				<Button onClick={onNewPrompt}>Criar novo prompt</Button>
				{sessionId ? (
					<Link
						className="inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-haci-bg disabled:opacity-50 disabled:cursor-not-allowed bg-haci-surface text-haci-text border border-haci-border hover:bg-haci-surface-subtle hover:border-haci-border-strong focus-visible:ring-haci-focus px-4 py-2.5 text-sm"
						to={`/app/export/${sessionId}`}
					>
						Exportar
					</Link>
				) : (
					<Button disabled variant="secondary">
						Exportar (salve primeiro)
					</Button>
				)}
			</div>
		</div>
	);
}
