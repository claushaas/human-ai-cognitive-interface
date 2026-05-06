import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import type { RulersVector } from '~/domain/contracts';

const RULER_CONFIG: Array<{
	key: keyof RulersVector;
	label: string;
	hint: string;
	max: number;
}> = [
	{
		hint: 'Quanto a IA pode deduzir além do explícito',
		key: 'inference',
		label: 'Inferência',
		max: 5,
	},
	{
		hint: 'Quanto a IA pode concluir ou recomendar',
		key: 'decision',
		label: 'Decisão',
		max: 3,
	},
	{
		hint: 'Qual o alcance do impacto',
		key: 'scope',
		label: 'Escopo',
		max: 5,
	},
	{
		hint: 'De onde a IA pode tirar informação',
		key: 'source',
		label: 'Fonte',
		max: 5,
	},
	{
		hint: 'A IA atua só no conteúdo ou também no processo',
		key: 'meta',
		label: 'Função meta',
		max: 5,
	},
];

const SCALE_LABELS: Record<number, string> = {
	1: 'Mínimo',
	2: 'Baixo',
	3: 'Médio',
	4: 'Alto',
	5: 'Máximo',
};

export interface RulersStepProps {
	initialRulers?: RulersVector;
	onSubmit: (rulers: RulersVector) => void;
}

export function RulersStep({ initialRulers, onSubmit }: RulersStepProps) {
	const [rulers, setRulers] = useState<RulersVector>(
		initialRulers ?? {
			decision: 1,
			inference: 2,
			meta: 1,
			scope: 2,
			source: 1,
		},
	);

	const handleChange = (key: keyof RulersVector, value: number) => {
		setRulers((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = () => {
		onSubmit(rulers);
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="font-serif text-xl font-bold text-haci-text">Ajustes</h2>
				<p className="text-haci-text-subtle text-sm">
					Ajuste como a IA deve se comportar. Valores mais conservadores são
					mais seguros.
				</p>
			</div>

			<div className="space-y-5">
				{RULER_CONFIG.map((config) => (
					<div className="space-y-2" key={config.key}>
						<div className="flex items-center justify-between">
							<label
								className="font-medium text-sm text-haci-text"
								htmlFor={`ruler-${config.key}`}
							>
								{config.label}
							</label>
							<span className="text-haci-text-subtle text-xs">
								{SCALE_LABELS[rulers[config.key]] ?? rulers[config.key]}
							</span>
						</div>
						<p className="text-haci-text-subtle text-xs">{config.hint}</p>
						<input
							className="w-full accent-haci-accent"
							id={`ruler-${config.key}`}
							max={config.max}
							min={1}
							onChange={(e) => handleChange(config.key, Number(e.target.value))}
							step={1}
							type="range"
							value={rulers[config.key]}
						/>
						<div className="flex justify-between text-haci-text-subtle text-xs">
							<span>1</span>
							<span>{config.max}</span>
						</div>
					</div>
				))}
			</div>

			<div className="flex justify-end">
				<Button onClick={handleSubmit}>Continuar</Button>
			</div>
		</div>
	);
}
