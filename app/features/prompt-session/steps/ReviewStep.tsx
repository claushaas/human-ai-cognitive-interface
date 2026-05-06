import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { ReviewPanel } from '~/components/ui/ReviewPanel';
import type { CognitiveContract, CollectionAnswer } from '~/domain/contracts';

export interface ReviewStepProps {
	contract: CognitiveContract;
	answers: CollectionAnswer[];
	onGenerate: () => void;
	onGoBack?: () => void;
}

export function ReviewStep({
	contract,
	answers,
	onGenerate,
	onGoBack,
}: ReviewStepProps) {
	const roleLabels: Record<string, string> = {
		'role.analyze': 'Analisar',
		'role.decideSupport': 'Apoiar decisão',
		'role.document': 'Documentar',
		'role.explore': 'Explorar',
		'role.synthesize': 'Sintetizar',
		'role.transform': 'Transformar',
	};

	const reviewItems = [
		{
			label: 'Intenção',
			value: contract.rawIntent.text,
		},
		{
			label: 'Papel',
			value: roleLabels[contract.initialRole] ?? contract.initialRole,
		},
		{
			label: 'Ajustes',
			value: `Inferência: ${contract.rulers.inference}, Decisão: ${contract.rulers.decision}, Escopo: ${contract.rulers.scope}, Fonte: ${contract.rulers.source}, Meta: ${contract.rulers.meta}`,
		},
		{
			label: 'Profundidade',
			value:
				contract.levelMatch.status === 'matched'
					? 'Estrutura definida'
					: contract.levelMatch.status === 'ambiguous'
						? 'Múltiplas opções compatíveis'
						: 'Em revisão',
		},
		{
			label: 'Idioma',
			value: contract.locale === 'pt-BR' ? 'Português (Brasil)' : 'Inglês',
		},
		{
			label: 'Detalhes',
			value:
				answers.length > 0
					? `${answers.length} resposta(s) fornecida(s)`
					: 'Nenhum detalhe adicional',
		},
	];

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="font-serif text-xl font-bold text-haci-text">Revisão</h2>
				<p className="text-haci-text-subtle text-sm">
					Verifique se tudo está correto antes de gerar o prompt.
				</p>
			</div>

			<ReviewPanel items={reviewItems} title="Estrutura do prompt" />

			{answers.length > 0 && (
				<Card>
					<h3 className="mb-3 font-medium text-sm text-haci-text">
						Detalhes fornecidos
					</h3>
					<dl className="space-y-2">
						{answers.map((answer) => (
							<div
								className="flex flex-col gap-0.5 sm:flex-row sm:gap-4"
								key={answer.questionId}
							>
								<dt className="shrink-0 font-medium text-xs text-haci-text-muted sm:w-48">
									{answer.questionId}
								</dt>
								<dd className="text-sm text-haci-text">
									{formatValue(answer.value)}
								</dd>
							</div>
						))}
					</dl>
				</Card>
			)}

			<div className="flex justify-between">
				<Button onClick={onGoBack} variant="ghost">
					Voltar
				</Button>
				<Button onClick={onGenerate}>Gerar</Button>
			</div>
		</div>
	);
}

function formatValue(value: unknown): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return String(value);
	if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
	if (Array.isArray(value)) return value.join(', ');
	return String(value);
}
