import type { Route } from "./+types/_index";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Human-AI Cognitive Interface" },
		{ name: "description", content: "Medie cognições via contratos explícitos" },
	];
}

export default function Index() {
	return (
		<div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
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
