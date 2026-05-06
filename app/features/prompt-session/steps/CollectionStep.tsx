import { useCallback, useState } from 'react';
import { Button } from '~/components/ui/Button';
import { TextArea } from '~/components/ui/TextArea';
import type {
	CollectionAnswer,
	CollectionProtocol,
	CollectionQuestion,
} from '~/domain/contracts';

export interface CollectionStepProps {
	protocol: CollectionProtocol;
	answers: CollectionAnswer[];
	onSubmit: (answers: CollectionAnswer[]) => void;
	onGoBack?: () => void;
}

export function CollectionStep({
	protocol,
	answers,
	onSubmit,
	onGoBack,
}: CollectionStepProps) {
	const [localAnswers, setLocalAnswers] = useState<Map<string, unknown>>(() => {
		const map = new Map<string, unknown>();
		for (const answer of answers) {
			map.set(answer.questionId, answer.value);
		}
		return map;
	});

	const handleAnswer = useCallback((questionId: string, value: unknown) => {
		setLocalAnswers((prev) => {
			const next = new Map(prev);
			next.set(questionId, value);
			return next;
		});
	}, []);

	const handleSubmit = () => {
		const answerList: CollectionAnswer[] = [];
		for (const question of protocol.questions) {
			const value = localAnswers.get(question.id);
			if (value !== undefined && value !== '') {
				answerList.push({
					answeredAt: new Date().toISOString(),
					questionId: question.id,
					value,
				});
			}
		}
		onSubmit(answerList);
	};

	const isComplete = protocol.questions.every((q) => {
		if (!q.required) return true;
		const value = localAnswers.get(q.id);
		return value !== undefined && value !== '';
	});

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="font-serif text-xl font-bold text-haci-text">
					Detalhes necessários
				</h2>
				<p className="text-haci-text-subtle text-sm">
					Responda às perguntas abaixo para que o prompt seja o mais adequado
					possível.
				</p>
			</div>

			<div className="space-y-4">
				{protocol.questions.map((question) => (
					<QuestionField
						key={question.id}
						onChange={(value) => handleAnswer(question.id, value)}
						question={question}
						value={localAnswers.get(question.id)}
					/>
				))}
			</div>

			<div className="flex justify-between">
				<Button onClick={onGoBack} variant="ghost">
					Voltar
				</Button>
				<Button disabled={!isComplete} onClick={handleSubmit}>
					Continuar
				</Button>
			</div>
		</div>
	);
}

function QuestionField({
	question,
	value,
	onChange,
}: {
	question: CollectionQuestion;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	switch (question.answerType) {
		case 'text':
			return (
				<TextArea
					hint={question.rationale}
					label={`${question.label}${question.required ? ' *' : ''}`}
					onChange={(e) => onChange(e.target.value)}
					value={typeof value === 'string' ? value : ''}
				/>
			);

		case 'number':
			return (
				<div className="space-y-1.5">
					<label
						className="block font-medium text-sm"
						htmlFor={`question-${question.id}`}
					>
						{question.label}
						{question.required && ' *'}
					</label>
					{question.rationale && (
						<p className="text-haci-text-subtle text-sm">
							{question.rationale}
						</p>
					)}
					<input
						className="w-full rounded-lg border border-haci-border bg-haci-surface px-3 py-2 text-sm"
						id={`question-${question.id}`}
						onChange={(e) =>
							onChange(
								e.target.value === '' ? undefined : Number(e.target.value),
							)
						}
						type="number"
						value={typeof value === 'number' ? value : ''}
					/>
				</div>
			);

		case 'boolean':
			return (
				<div className="space-y-1.5">
					<span className="block font-medium text-sm">
						{question.label}
						{question.required && ' *'}
					</span>
					{question.rationale && (
						<p className="text-haci-text-subtle text-sm">
							{question.rationale}
						</p>
					)}
					<div className="flex gap-3">
						<Button
							onClick={() => onChange(true)}
							size="sm"
							variant={value === true ? 'primary' : 'secondary'}
						>
							Sim
						</Button>
						<Button
							onClick={() => onChange(false)}
							size="sm"
							variant={value === false ? 'primary' : 'secondary'}
						>
							Não
						</Button>
					</div>
				</div>
			);

		case 'enum':
			return (
				<div className="space-y-1.5">
					<span className="block font-medium text-sm">
						{question.label}
						{question.required && ' *'}
					</span>
					{question.rationale && (
						<p className="text-haci-text-subtle text-sm">
							{question.rationale}
						</p>
					)}
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						{question.options?.map((option) => (
							<button
								className={`text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
									value === option
										? 'border-haci-accent bg-haci-accent-soft text-haci-text'
										: 'border-haci-border bg-haci-surface text-haci-text hover:bg-haci-surface-subtle'
								}`}
								key={option}
								onClick={() => onChange(option)}
								type="button"
							>
								{option}
							</button>
						))}
					</div>
				</div>
			);

		case 'multi-select':
			return (
				<div className="space-y-1.5">
					<span className="block font-medium text-sm">
						{question.label}
						{question.required && ' *'}
					</span>
					{question.rationale && (
						<p className="text-haci-text-subtle text-sm">
							{question.rationale}
						</p>
					)}
					<div className="flex flex-wrap gap-2">
						{question.options?.map((option) => {
							const selected = Array.isArray(value) && value.includes(option);
							return (
								<button
									className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
										selected
											? 'border-haci-accent bg-haci-accent-soft text-haci-text'
											: 'border-haci-border bg-haci-surface text-haci-text hover:bg-haci-surface-subtle'
									}`}
									key={option}
									onClick={() => {
										const current = Array.isArray(value) ? [...value] : [];
										if (selected) {
											onChange(current.filter((v) => v !== option));
										} else {
											onChange([...current, option]);
										}
									}}
									type="button"
								>
									{option}
								</button>
							);
						})}
					</div>
				</div>
			);

		case 'url':
			return (
				<div className="space-y-1.5">
					<label
						className="block font-medium text-sm"
						htmlFor={`question-${question.id}`}
					>
						{question.label}
						{question.required && ' *'}
					</label>
					{question.rationale && (
						<p className="text-haci-text-subtle text-sm">
							{question.rationale}
						</p>
					)}
					<input
						className="w-full rounded-lg border border-haci-border bg-haci-surface px-3 py-2 text-sm"
						id={`question-${question.id}`}
						onChange={(e) => onChange(e.target.value)}
						type="url"
						value={typeof value === 'string' ? value : ''}
					/>
				</div>
			);

		default:
			return null;
	}
}
