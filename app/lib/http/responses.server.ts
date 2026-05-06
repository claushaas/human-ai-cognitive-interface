export function jsonOk<D>(data: D, init?: ResponseInit): Response {
	const body = JSON.stringify(data);
	return new Response(body, {
		headers: { 'Content-Type': 'application/json' },
		status: 200,
		...init,
	});
}

export function jsonError(
	message: string,
	status: number,
	details?: Record<string, unknown>,
): Response {
	const body = JSON.stringify({
		details,
		error: message,
		status,
	});
	return new Response(body, {
		headers: { 'Content-Type': 'application/json' },
		status,
	});
}
