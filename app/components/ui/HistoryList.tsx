import { Card } from './Card';

export interface HistoryItem {
	id: string;
	subtitle?: string;
	title: string;
}

export interface HistoryListProps {
	className?: string;
	emptyMessage?: string;
	items: HistoryItem[];
}

export function HistoryList({
	className = '',
	emptyMessage = 'Nenhuma sessão encontrada.',
	items,
}: HistoryListProps) {
	if (items.length === 0) {
		return (
			<Card
				className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
				tone="subtle"
			>
				<p className="text-haci-text-muted text-sm">{emptyMessage}</p>
			</Card>
		);
	}

	return (
		<ul className={`space-y-3 ${className}`}>
			{items.map((item) => (
				<li key={item.id}>
					<Card className="transition-colors duration-150 hover:bg-haci-surface-subtle">
						<div className="flex flex-col gap-1">
							<p className="font-medium text-sm text-haci-text">{item.title}</p>
							{item.subtitle && (
								<p className="text-haci-text-subtle text-xs">{item.subtitle}</p>
							)}
						</div>
					</Card>
				</li>
			))}
		</ul>
	);
}
