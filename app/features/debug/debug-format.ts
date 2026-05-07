/**
 * Debug formatting helpers.
 */

export function formatJson(value: unknown): string {
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return '[Erro ao serializar]';
	}
}

export function formatTimestamp(iso: string | undefined | null): string {
	if (!iso) return '—';
	try {
		return new Date(iso).toLocaleString('pt-BR');
	} catch {
		return iso;
	}
}

export function formatRulerValue(value: unknown): string {
	if (typeof value === 'number') return String(value);
	if (typeof value === 'string') return value;
	return '—';
}
