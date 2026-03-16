import { Link } from 'react-router';

export function meta() {
	return [
		{ title: 'Human-AI Cognitive Interface' },
		{
			content: 'Medie cognições via contratos explícitos',
			name: 'description',
		},
	];
}

export default function Index() {
	return (
		<div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
			<h1>Human-AI Cognitive Interface</h1>
			<p>Bem-vindo ao sistema de mediação cognitiva.</p>
			<nav>
				<ul>
					<li>
						<Link to="/session/new">Iniciar Nova Sessão</Link>
					</li>
				</ul>
			</nav>
		</div>
	);
}
