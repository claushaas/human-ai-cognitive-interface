import PromptSessionFlow from '~/features/prompt-session/PromptSessionFlow';

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
	return <PromptSessionFlow />;
}
