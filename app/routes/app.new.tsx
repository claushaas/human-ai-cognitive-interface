import { AppShell } from '~/components/shell/AppShell';

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
			<div className="space-y-6">
				<h1 className="font-bold text-2xl text-neutral-900">Novo Prompt</h1>
				<p className="max-w-prose text-neutral-600 leading-relaxed">
					Esta tela reserva o ponto de entrada para criação de um prompt HACI. O
					fluxo completo será implementado na <strong>Fase 5</strong>, depois
					dos contratos e da engine determinística.
				</p>
				<p className="text-neutral-500 text-sm">
					<em>
						Nenhum dado é salvo ainda. Nenhum schema ou validação de entrada foi
						implementado nesta fase.
					</em>
				</p>
			</div>
		</AppShell>
	);
}
