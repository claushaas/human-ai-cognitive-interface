import fs from 'node:fs';
import path from 'node:path';
import {
	Action,
	ActionPanel,
	Clipboard,
	environment,
	Form,
	showToast,
	Toast,
} from '@raycast/api';
import { useEffect, useMemo, useRef, useState } from 'react';

type StepId =
	| 'regime'
	| 'profile'
	| 'objective'
	| 'source'
	| 'allowed'
	| 'prohibited'
	| 'formatLanguage'
	| 'stop';

type StepOption = {
	value: string;
	label: string;
};

type StepDefinition = {
	id: StepId;
	title: string;
	kind: 'dropdown' | 'text';
	options?: StepOption[];
	fields: StepField[];
};

type StepField = {
	id: FieldId;
	title: string;
	placeholder?: string;
};

type FieldId =
	| 'regime'
	| 'profile'
	| 'objective'
	| 'source'
	| 'allowed'
	| 'prohibited'
	| 'format'
	| 'language'
	| 'stop';

type StepValue = {
	value: string;
};

type StepValues = Record<FieldId, StepValue>;

const steps: StepDefinition[] = [
	{
		fields: [{ id: 'regime', title: 'Regime Cognitivo' }],
		id: 'regime',
		kind: 'dropdown',
		options: [
			{
				label: 'Nível 1 — Execução estritamente delimitada',
				value: 'level-1',
			},
			{
				label: 'Nível 2 — Análise controlada e diagnóstico',
				value: 'level-2',
			},
			{
				label: 'Nível 3 — Síntese estruturada e organização cognitiva',
				value: 'level-3',
			},
			{
				label: 'Nível 4 — Exploração de alternativas e trade-offs',
				value: 'level-4',
			},
			{
				label: 'Nível 5 — Apoio à decisão humana',
				value: 'level-5',
			},
			{
				label: 'Nível 6 — Governança, controle e segurança cognitiva',
				value: 'level-6',
			},
			{
				label: 'Nível 7 — Meta-cognição e arquitetura de pensamento',
				value: 'level-7',
			},
			{
				label: 'Nível 8 — Documentação, contratos e sistemas de uso',
				value: 'level-8',
			},
		],
		title: 'Regime Cognitivo',
	},
	{
		fields: [{ id: 'profile', title: 'Perfil Cognitivo' }],
		id: 'profile',
		kind: 'dropdown',
		options: [
			{
				label: 'Conservador',
				value: 'profile-conservative',
			},
			{
				label: 'Analítico',
				value: 'profile-analytical',
			},
			{
				label: 'Crítico',
				value: 'profile-critical',
			},
			{
				label: 'Estrutural',
				value: 'profile-structural',
			},
		],
		title: 'Perfil Cognitivo',
	},
	{
		fields: [
			{
				id: 'objective',
				placeholder:
					'Descreva o resultado esperado de forma clara e operacional.',
				title: 'Objetivo',
			},
		],
		id: 'objective',
		kind: 'text',
		title: 'Objetivo',
	},
	{
		fields: [
			{
				id: 'source',
				placeholder:
					'Declare explicitamente quais dados são válidos para esta tarefa.',
				title: 'Fonte de Verdade',
			},
		],
		id: 'source',
		kind: 'text',
		title: 'Fonte de Verdade',
	},
	{
		fields: [
			{
				id: 'allowed',
				placeholder: 'Liste as transformações autorizadas.',
				title: 'Operações Permitidas',
			},
		],
		id: 'allowed',
		kind: 'text',
		title: 'Operações Permitidas',
	},
	{
		fields: [
			{
				id: 'prohibited',
				placeholder: 'Liste ações que o modelo não pode executar.',
				title: 'Operações Proibidas',
			},
		],
		id: 'prohibited',
		kind: 'text',
		title: 'Operações Proibidas',
	},
	{
		fields: [
			{
				id: 'format',
				placeholder: 'Descreva exatamente como a resposta deve ser entregue.',
				title: 'Formato da Saída',
			},
			{
				id: 'language',
				placeholder: 'Ex.: pt-BR',
				title: 'Idioma',
			},
		],
		id: 'formatLanguage',
		kind: 'text',
		title: 'Formato / Idioma',
	},
	{
		fields: [
			{
				id: 'stop',
				placeholder: 'Declare quando o modelo deve interromper a execução.',
				title: 'Condições de Parada',
			},
		],
		id: 'stop',
		kind: 'text',
		title: 'Condições de Parada',
	},
];

let metaPromptCache: string | null = null;

function getMetaPromptTemplate(): string {
	if (metaPromptCache) {
		return metaPromptCache;
	}

	const templatePath = path.join(environment.assetsPath, 'meta-prompt.md');
	const template = fs.readFileSync(templatePath, 'utf8');
	metaPromptCache = template;
	return template;
}

function shorten(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return `${text.slice(0, maxLength - 3)}...`;
}

function validateStep(step: StepDefinition, values: StepValues): string | null {
	for (const field of step.fields) {
		const current = values[field.id]?.value?.trim();
		if (!current) {
			return `Preencha "${field.title}".`;
		}
	}
	return null;
}

function resolveAllValues(stepValues: StepValues): StepValues {
	return stepValues;
}

function getOptionLabel(stepId: StepId, value: string): string {
	const step = steps.find((candidate) => candidate.id === stepId);
	const label = step?.options?.find((option) => option.value === value)?.label;
	return label ?? value;
}

function renderMetaPrompt(values: StepValues): string {
	const nivelCognitivo = getOptionLabel('regime', values.regime.value);
	const perfilCognitivo = getOptionLabel('profile', values.profile.value);
	const template = getMetaPromptTemplate();

	return template
		.replaceAll('{{NIVEL_COGNITIVO}}', nivelCognitivo)
		.replaceAll('{{PERFIL_COGNITIVO}}', perfilCognitivo)
		.replaceAll('{{OBJETIVO_OPERACIONAL}}', values.objective.value)
		.replaceAll('{{FONTE_DE_VERDADE}}', values.source.value)
		.replaceAll('{{OPERACOES_PERMITIDAS}}', values.allowed.value)
		.replaceAll('{{OPERACOES_PROIBIDAS}}', values.prohibited.value)
		.replaceAll('{{FORMATO_E_RESTRICOES}}', values.format.value)
		.replaceAll('{{IDIOMA}}', values.language.value)
		.replaceAll('{{CONDICOES_DE_PARADA}}', values.stop.value);
}

export default function Command() {
	const [stepIndex, setStepIndex] = useState(0);
	const [stepValues, setStepValues] = useState<StepValues>(() => {
		return steps
			.flatMap((step) => step.fields)
			.reduce((acc, field) => {
				acc[field.id] = { value: '' };
				return acc;
			}, {} as StepValues);
	});
	const dropdownRef = useRef<Form.Dropdown>(null);
	const customRef = useRef<Form.TextArea>(null);

	const step = steps[stepIndex];

	// biome-ignore lint/correctness/useExhaustiveDependencies: <always force focus on step change>
	useEffect(() => {
		const timer = setTimeout(() => {
			if (step.kind === 'dropdown') {
				dropdownRef.current?.focus();
			} else {
				customRef.current?.focus();
			}
		}, 0);

		return () => clearTimeout(timer);
	}, [step.id, step.kind]);

	const preview = useMemo(() => {
		if (step.kind === 'dropdown') {
			const field = step.fields[0];
			const current = stepValues[field.id]?.value;
			if (!current) {
				return 'Nenhuma opcao selecionada.';
			}
			const label =
				step.options?.find((option) => option.value === current)?.label ?? '';
			return label ? shorten(label, 140) : 'Nenhuma opcao selecionada.';
		}

		const lines = step.fields.map((field) => {
			const current = stepValues[field.id]?.value?.trim();
			if (!current) {
				return `${field.title}: (vazio)`;
			}
			return `${field.title}: ${shorten(current, 140)}`;
		});
		return lines.join('\n');
	}, [step, stepValues]);

	const handleOptionChange = (fieldId: FieldId, value: string) => {
		setStepValues((prev) => ({
			...prev,
			[fieldId]: { value },
		}));
	};

	const handleTextChange = (fieldId: FieldId, value: string) => {
		setStepValues((prev) => ({
			...prev,
			[fieldId]: { value },
		}));
	};

	const handleBack = () => {
		setStepIndex((prev) => Math.max(prev - 1, 0));
	};

	const handleNext = async () => {
		const error = validateStep(step, stepValues);
		if (error) {
			await showToast({
				message: error,
				style: Toast.Style.Failure,
				title: 'Validacao',
			});
			return;
		}
		setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
	};

	const handleGenerate = async () => {
		for (let index = 0; index < steps.length; index += 1) {
			const candidateStep = steps[index];
			const error = validateStep(candidateStep, stepValues);
			if (error) {
				setStepIndex(index);
				await showToast({
					message: error,
					style: Toast.Style.Failure,
					title: 'Validacao',
				});
				return;
			}
		}

		const resolvedValues = resolveAllValues(stepValues);
		const prompt = renderMetaPrompt(resolvedValues);

		await Clipboard.copy(prompt);

		try {
			await Clipboard.paste(prompt);
			await showToast({
				style: Toast.Style.Success,
				title: 'Prompt copiado e colado',
			});
		} catch {
			await showToast({
				message: 'Falha ao colar. O texto permanece no clipboard.',
				style: Toast.Style.Success,
				title: 'Prompt copiado',
			});
		}
	};

	return (
		<Form
			actions={
				<ActionPanel>
					{stepIndex < steps.length - 1 ? (
						<Action onAction={handleNext} title="Proximo" />
					) : (
						<Action onAction={handleGenerate} title="Gerar E Colar" />
					)}
					{stepIndex > 0 ? (
						<Action onAction={handleBack} title="Voltar" />
					) : null}
				</ActionPanel>
			}
			navigationTitle={`Canonical Prompt Generator (${stepIndex + 1}/${steps.length})`}
		>
			{step.kind === 'dropdown' ? (
				<Form.Dropdown
					id={`${step.id}-option`}
					key={step.id}
					onChange={(value) => handleOptionChange(step.fields[0].id, value)}
					placeholder="Selecione uma opcao"
					ref={dropdownRef}
					title={step.title}
					value={stepValues[step.fields[0].id]?.value ?? ''}
				>
					{step.options?.map((option) => (
						<Form.Dropdown.Item
							key={option.value}
							title={option.label}
							value={option.value}
						/>
					))}
				</Form.Dropdown>
			) : (
				step.fields.map((field, index) => (
					<Form.TextArea
						id={`${step.id}-${field.id}`}
						key={field.id}
						onChange={(value) => handleTextChange(field.id, value)}
						placeholder={field.placeholder}
						ref={index === 0 ? customRef : null}
						title={field.title}
						value={stepValues[field.id]?.value ?? ''}
					/>
				))
			)}
			<Form.Description text={preview} title="Previa" />
		</Form>
	);
}
