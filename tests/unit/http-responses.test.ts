import { describe, expect, it } from 'vitest';
import { jsonError, jsonOk } from '~/lib/http/responses.server';

describe('jsonOk', () => {
	it('retorna Response com status 200 e Content-Type JSON', () => {
		const response = jsonOk({ foo: 'bar' });
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/json');
	});

	it('serializa dados corretamente', async () => {
		const response = jsonOk({ foo: 'bar' });
		const data = await response.json();
		expect(data).toEqual({ foo: 'bar' });
	});

	it('aceita init personalizado', () => {
		const response = jsonOk({}, { status: 201 });
		expect(response.status).toBe(201);
	});
});

describe('jsonError', () => {
	it('retorna Response com status e mensagem', async () => {
		const response = jsonError('Not Found', 404);
		expect(response.status).toBe(404);
		const data = await response.json();
		expect(data.error).toBe('Not Found');
		expect(data.status).toBe(404);
	});

	it('inclui details quando fornecido', async () => {
		const response = jsonError('Bad Request', 400, { field: 'name' });
		const data = await response.json();
		expect(data.details).toEqual({ field: 'name' });
	});

	it('não inclui stack trace', async () => {
		const response = jsonError('Error', 500);
		const body = await response.text();
		expect(body).not.toContain('stack');
	});
});
