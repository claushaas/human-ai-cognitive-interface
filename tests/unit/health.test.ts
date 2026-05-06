import { describe, expect, it } from 'vitest';
import { loader } from '~/routes/health';

describe('health loader', () => {
	it('retorna status ok e dados esperados', async () => {
		const response = await loader({} as Parameters<typeof loader>[0]);
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/json');

		const data = await response.json();
		expect(data.status).toBe('ok');
		expect(data.app).toBe('haci');
		expect(data.environment).toBe('local');
		expect(data.timestamp).toBeDefined();
		expect(() => new Date(data.timestamp)).not.toThrow();
	});

	it('não expõe secrets', async () => {
		const response = await loader({} as Parameters<typeof loader>[0]);
		const body = await response.text();
		expect(body).not.toContain('SECRET');
		expect(body).not.toContain('KEY');
		expect(body).not.toContain('TOKEN');
	});
});
