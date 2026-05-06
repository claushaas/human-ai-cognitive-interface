import { useState } from 'react';
import { Button } from './Button';

export interface DebugPanelProps {
	className?: string;
	data: unknown;
	title?: string;
}

export function DebugPanel({
	className = '',
	data,
	title = 'Dados técnicos',
}: DebugPanelProps) {
	const [open, setOpen] = useState(false);

	let serialized: string;
	try {
		serialized = JSON.stringify(data, null, 2);
	} catch {
		serialized = '[Erro ao serializar dados]';
	}

	return (
		<div
			className={`rounded-lg border border-dashed border-haci-border-strong bg-haci-surface-subtle/50 ${className}`}
		>
			<Button
				className="w-full justify-between rounded-b-none border-0 bg-transparent px-4 py-2 text-left text-haci-text-muted hover:bg-haci-surface-subtle hover:text-haci-text"
				onClick={() => setOpen(!open)}
				size="sm"
				variant="ghost"
			>
				<span className="font-mono text-xs">{title}</span>
				<span aria-hidden="true" className="text-xs">
					{open ? '▲' : '▼'}
				</span>
			</Button>
			{open && (
				<pre className="m-0 rounded-t-none border-0 bg-transparent p-4 pt-0">
					<code className="font-mono text-xs text-haci-text-muted">
						{serialized}
					</code>
				</pre>
			)}
		</div>
	);
}
