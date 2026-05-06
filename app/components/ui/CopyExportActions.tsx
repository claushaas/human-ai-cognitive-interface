import { Button } from './Button';

export interface CopyExportActionsProps {
	className?: string;
	onCopy?: () => void;
	onExport?: () => void;
}

export function CopyExportActions({
	className = '',
	onCopy,
	onExport,
}: CopyExportActionsProps) {
	const handleCopy = () => {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard
				.writeText('')
				.then(() => onCopy?.())
				.catch(() => onCopy?.());
		} else {
			onCopy?.();
		}
	};

	return (
		<div className={`flex flex-wrap items-center gap-3 ${className}`}>
			<Button onClick={handleCopy} size="md" variant="primary">
				Copiar
			</Button>
			<Button onClick={onExport} size="md" variant="secondary">
				Exportar
			</Button>
		</div>
	);
}
