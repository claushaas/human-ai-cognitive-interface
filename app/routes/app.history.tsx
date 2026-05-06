import { AppShell } from '~/components/shell/AppShell';

export function meta() {
	return [
		{ title: 'Histórico — HACI' },
		{
			content: 'Histórico de sessões de prompt HACI.',
			name: 'description',
		},
	];
}

export default function AppHistory() {
	return (
		<AppShell>
			<div className="space-y-6">
				<h1 className="font-bold text-2xl text-neutral-900">Histórico</h1>
				<p className="max-w-prose text-neutral-600 leading-relaxed">
					Esta tela reserva o ponto de listagem de sessões HACI anteriores. A
					listagem completa será implementada na <strong>Fase 6</strong>, quando
					a persistência em D1 e a autenticação Cloudflare Access estiverem
					prontas.
				</p>
				<p className="text-neutral-500 text-sm">
					<em>Nenhum dado é listado ainda. O histórico está vazio.</em>
				</p>
			</div>
		</AppShell>
	);
}
