/**
 * Redaction helpers — server-side only.
 *
 * Remove or mask sensitive keys from objects recursively.
 */

const SENSITIVE_KEYS = new Set([
	'apiKey',
	'authorization',
	'cookie',
	'jwt',
	'token',
	'secret',
	'password',
	'DEEPSEEK_API_KEY',
	'Cf-Access-Jwt-Assertion',
]);

function isSensitiveKey(key: string): boolean {
	const lower = key.toLowerCase();
	for (const sensitive of SENSITIVE_KEYS) {
		if (lower === sensitive.toLowerCase()) return true;
	}
	return false;
}

export function redactSensitiveValue(value: unknown): unknown {
	if (value === null || value === undefined) return value;

	if (typeof value === 'string') {
		if (value.length <= 8) return '[REDACTED]';
		return `${value.slice(0, 3)}...[REDACTED]...${value.slice(-3)}`;
	}

	if (typeof value === 'number' || typeof value === 'boolean') return value;

	if (Array.isArray(value)) {
		return value.map((item) => redactSensitiveValue(item));
	}

	if (typeof value === 'object') {
		return redactSensitiveKeys(value);
	}

	return value;
}

export function redactSensitiveKeys(record: unknown): unknown {
	if (record === null || typeof record !== 'object') return record;

	if (Array.isArray(record)) {
		return record.map((item) => redactSensitiveKeys(item));
	}

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(record)) {
		if (isSensitiveKey(key)) {
			result[key] = redactSensitiveValue(value);
		} else if (typeof value === 'object' && value !== null) {
			result[key] = redactSensitiveKeys(value);
		} else {
			result[key] = value;
		}
	}
	return result;
}
