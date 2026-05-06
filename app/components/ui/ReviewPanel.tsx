import { Card } from './Card';

export interface ReviewItem {
	label: string;
	value: string;
}

export interface ReviewPanelProps {
	className?: string;
	items: ReviewItem[];
	title?: string;
}

export function ReviewPanel({
	className = '',
	items,
	title = 'Revisão',
}: ReviewPanelProps) {
	return (
		<Card className={className}>
			<h3 className="mb-4 font-serif text-lg font-bold text-haci-text">
				{title}
			</h3>
			<dl className="space-y-3">
				{items.map((item) => (
					<div
						className="flex flex-col gap-0.5 sm:flex-row sm:gap-4"
						key={item.label}
					>
						<dt className="shrink-0 font-medium text-sm text-haci-text-muted sm:w-32">
							{item.label}
						</dt>
						<dd className="text-sm text-haci-text">{item.value}</dd>
					</div>
				))}
			</dl>
		</Card>
	);
}
