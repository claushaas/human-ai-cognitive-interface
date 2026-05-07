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
import { formatJson, formatTimestamp } from './debug-format';

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
	llmMetadata?: {
		model?: string | null;
		usage?: {
			inputTokens?: number;
			outputTokens?: number;
			totalTokens?: number;
		};
		warnings?: string[];
	};
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="border-t border-haci-border/30 pt-3 mt-3">
			<h4 className="text-xs font-semibold text-haci-text-muted uppercase tracking-wide mb-2">
				{title}
			</h4>
			{children}
		</div>
	);
}

function JsonBlock({ data }: { data: unknown }) {
	return (
		<pre className="text-xs text-haci-text-muted overflow-auto max-h-48 p-2 bg-haci-surface-subtle/50 rounded">
			<code>{formatJson(data)}</code>
		</pre>
	);
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
	llmMetadata,
}: DebugContractPanelProps) {
	const [open, setOpen] = useState(false);

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
				<div className="m-0 max-h-[32rem] overflow-auto rounded-t-none border-0 bg-transparent p-4 pt-0 space-y-1">
					{rawIntent && (
						<Section title="Entrada">
							<p className="text-xs text-haci-text-muted">
								Texto: {rawIntent.text.slice(0, 200)}
								{rawIntent.text.length > 200 ? '...' : ''}
							</p>
							<p className="text-xs text-haci-text-muted">
								Locale: {rawIntent.locale}
							</p>
						</Section>
					)}

					{initialRole && (
						<Section title="Papel">
							<p className="text-xs text-haci-text-muted">{initialRole}</p>
						</Section>
					)}

					{rulers && (
						<Section title="Ajustes / Réguas">
							<JsonBlock data={rulers} />
						</Section>
					)}

					{levelMatch && (
						<Section title="Profundidade / Match">
							<p className="text-xs text-haci-text-muted">
								Status: {levelMatch.status}
							</p>
							{levelMatch.selected && (
								<p className="text-xs text-haci-text-muted">
									Selecionado: {levelMatch.selected.id} (score:{' '}
									{levelMatch.selected.score})
								</p>
							)}
							<JsonBlock data={levelMatch} />
						</Section>
					)}

					{levelMatch?.hardBlocks && levelMatch.hardBlocks.length > 0 && (
						<Section title="Bloqueios">
							<JsonBlock data={levelMatch.hardBlocks} />
						</Section>
					)}

					{levelMatch?.correctionSuggestions &&
						levelMatch.correctionSuggestions.length > 0 && (
							<Section title="Sugestões de correção">
								<JsonBlock data={levelMatch.correctionSuggestions} />
							</Section>
						)}

					{collectionProtocol && (
						<Section title="Protocolo de coleta">
							<p className="text-xs text-haci-text-muted">
								Perguntas: {collectionProtocol.questions.length}
							</p>
							<JsonBlock data={collectionProtocol} />
						</Section>
					)}

					{collectionAnswers && collectionAnswers.length > 0 && (
						<Section title="Respostas">
							<JsonBlock data={collectionAnswers} />
						</Section>
					)}

					{contract && (
						<Section title="Contrato">
							<p className="text-xs text-haci-text-muted">ID: {contract.id}</p>
							<p className="text-xs text-haci-text-muted">
								Criado: {formatTimestamp(contract.createdAt)}
							</p>
							<JsonBlock data={contract} />
						</Section>
					)}

					{promptResult && (
						<Section title="Prompt result">
							<p className="text-xs text-haci-text-muted">
								Gerado: {formatTimestamp(promptResult.generatedAt)}
							</p>
							<p className="text-xs text-haci-text-muted">
								Prompt length: {promptResult.prompt.length} chars
							</p>
							<JsonBlock data={promptResult} />
						</Section>
					)}

					{llmMetadata && (
						<Section title="LLM metadata">
							<p className="text-xs text-haci-text-muted">
								Modelo: {llmMetadata.model ?? '—'}
							</p>
							{llmMetadata.usage && (
								<p className="text-xs text-haci-text-muted">
									Tokens: {llmMetadata.usage.inputTokens ?? '—'} in /{' '}
									{llmMetadata.usage.outputTokens ?? '—'} out
								</p>
							)}
							{llmMetadata.warnings && llmMetadata.warnings.length > 0 && (
								<p className="text-xs text-haci-text-muted">
									Avisos: {llmMetadata.warnings.length}
								</p>
							)}
						</Section>
					)}

					{!rawIntent && !contract && !promptResult && (
						<p className="text-xs text-haci-text-muted italic">
							Nenhum dado técnico disponível.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
