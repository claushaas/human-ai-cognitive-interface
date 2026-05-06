import { AppShell } from '~/components/shell/AppShell';
import { Callout } from '~/components/ui/Callout';
import { StepIndicator } from '~/components/ui/StepIndicator';
import { TextArea } from '~/components/ui/TextArea';

export function meta() {
	return [
		{ title: 'Novo Prompt — HACI' },
		{
			content: 'Criar um novo prompt HACI estruturado.',
			name: 'description',
		},
	];
}

export default function AppNew() {
	return (
		<AppShell>
			<div className="space-y-8">
				<div className="space-y-2">
					<h1 className="font-serif text-2xl font-bold text-haci-text">
						Novo Prompt
					</h1>
					<StepIndicator
						steps={[
							{ label: 'Entrada', state: 'current' },
							{ label: 'Papel', state: 'pending' },
							{ label: 'Ajustes', state: 'pending' },
							{ label: 'Profundidade', state: 'pending' },
							{ label: 'Detalhes', state: 'pending' },
							{ label: 'Revisão', state: 'pending' },
							{ label: 'Gerar', state: 'pending' },
						]}
					/>
				</div>

				<Callout tone="info">
					Esta tela reserva o ponto de entrada para criação de um prompt HACI. O
					fluxo completo será implementado na <strong>Fase 5</strong>, depois
					dos contratos e da engine determinística.
				</Callout>

				<div className="rounded-xl border border-haci-border bg-haci-surface p-6">
					<TextArea
						disabled
						hint="Descreva o resultado esperado. Não precisa escrever um prompt perfeito agora."
						label="O que você quer conseguir com a IA?"
						placeholder="Exemplo: quero organizar minhas anotações de leitura em um sistema de tags..."
						value=""
					/>
				</div>

				<p className="text-haci-text-subtle text-sm">
					<em>
						Nenhum dado é salvo ainda. Nenhum schema ou validação de entrada foi
						implementado nesta fase.
					</em>
				</p>
			</div>
		</AppShell>
	);
}
