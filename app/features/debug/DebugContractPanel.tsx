import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import type {
	CognitiveContract,
	CollectionAnswer,
	CollectionProtocol,
	InitialRole,
	LevelMatch,
	PromptGenerationResult,
	RawIntent,
	RulersVector,
} from '~/domain/contracts';

export interface DebugContractPanelProps {
	className?: string;
	rawIntent?: RawIntent;
	initialRole?: InitialRole;
	rulers?: RulersVector;
	levelMatch?: LevelMatch;
	collectionProtocol?: CollectionProtocol;
	collectionAnswers?: CollectionAnswer[];
	contract?: CognitiveContract;
	promptResult?: PromptGenerationResult;
}

export function DebugContractPanel({
	className = '',
	rawIntent,
	initialRole,
	rulers,
	levelMatch,
	collectionProtocol,
	collectionAnswers,
	contract,
	promptResult,
}: DebugContractPanelProps) {
	const [open, setOpen] = useState(false);

	const data = {
		collectionAnswers,
		collectionProtocol,
		contract,
		initialRole,
		levelMatch,
		promptResult,
		rawIntent,
		rulers,
	};

	let serialized: string;
	try {
		serialized = JSON.stringify(data, null, 2);
	} catch {
		serialized = '[Erro ao serializar dados]';
	}

	return (
		<div
			className={`rounded-lg border border-dashed border-haci-border-strong bg-haci-surface-subtle/50 ${className}`}
		>
			<Button
				className="w-full justify-between rounded-b-none border-0 bg-transparent px-4 py-2 text-left text-haci-text-muted hover:bg-haci-surface-subtle hover:text-haci-text"
				onClick={() => setOpen(!open)}
				size="sm"
				variant="ghost"
			>
				<span className="font-mono text-xs">Dados técnicos (debug)</span>
				<span aria-hidden="true" className="text-xs">
					{open ? '▲' : '▼'}
				</span>
			</Button>
			{open && (
				<pre className="m-0 max-h-96 overflow-auto rounded-t-none border-0 bg-transparent p-4 pt-0">
					<code className="font-mono text-xs text-haci-text-muted">
						{serialized}
					</code>
				</pre>
			)}
		</div>
	);
}
