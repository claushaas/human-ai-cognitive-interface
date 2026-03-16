/**
 * Engine de Substituição de Variáveis para Templates
 *
 * Sistema de substituição de placeholders em templates de prompt
 * com validação de que todos os placeholders foram preenchidos
 */

/**
 * Resultado da substituição de template
 */
export interface TemplateResult {
	/** Template com todas as variáveis substituídas */
	output: string;

	/** Lista de variáveis que foram substituídas */
	substitutedVars: string[];

	/** Lista de variáveis que faltaram (se houver) */
	missingVars: string[];

	/** Se todas as variáveis foram substituídas */
	isValid: boolean;
}

/**
 * Regex para encontrar placeholders no formato {{variableName}}
 */
const PLACEHOLDER_REGEX = /\{\{(\w+(?:\.\w+)*)\}\}/g;

/**
 * Extrai todos os placeholders de um template
 *
 * @param template - Template string com placeholders
 * @returns Lista de nomes de variáveis encontradas
 */
export function extractPlaceholders(template: string): string[] {
	const matches = [...template.matchAll(PLACEHOLDER_REGEX)];
	const vars = new Set<string>();

	for (const match of matches) {
		vars.add(match[1]);
	}

	return Array.from(vars);
}

/**
 * Obtém valor aninhado de um objeto usando path (ex: 'user.name')
 *
 * @param obj - Objeto para buscar
 * @param path - Caminho da propriedade (ex: 'user.name')
 * @returns Valor encontrado ou undefined
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
	return path.split('.').reduce<unknown>((acc, key) => {
		if (acc && typeof acc === 'object' && key in acc) {
			return (acc as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj);
}

/**
 * Substitui placeholders em um template usando dados fornecidos
 *
 * @param template - Template string com placeholders {{variableName}}
 * @param data - Dados para substituição
 * @returns Resultado da substituição
 */
export function substituteTemplate(
	template: string,
	data: Record<string, unknown>,
): TemplateResult {
	const placeholders = extractPlaceholders(template);
	const substitutedVars = new Set<string>();
	const missingVars = new Set<string>();

	let output = template;

	for (const placeholder of placeholders) {
		const value = getNestedValue(data, placeholder);

		if (value !== undefined && value !== null) {
			// Substituir todas as ocorrências deste placeholder
			const regex = new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g');
			output = output.replace(regex, String(value));
			substitutedVars.add(placeholder);
		} else {
			missingVars.add(placeholder);
		}
	}

	return {
		isValid: missingVars.size === 0,
		missingVars: Array.from(missingVars),
		output,
		substitutedVars: Array.from(substitutedVars),
	};
}

/**
 * Valida se um template tem todos os placeholders preenchidos
 *
 * @param template - Template string
 * @param data - Dados para validação
 * @returns true se todos os placeholders podem ser substituídos
 */
export function validateTemplate(
	template: string,
	data: Record<string, unknown>,
): boolean {
	const result = substituteTemplate(template, data);
	return result.isValid;
}

/**
 * Cria um template engine reutilizável
 *
 * @param template - Template string base
 * @returns Objeto engine com métodos de substituição
 */
export function createTemplateEngine(template: string) {
	return {
		/**
		 * Extrai placeholders do template
		 */
		getPlaceholders(): string[] {
			return extractPlaceholders(template);
		},

		/**
		 * Substitui placeholders com dados fornecidos
		 */
		render(data: Record<string, unknown>): TemplateResult {
			return substituteTemplate(template, data);
		},

		/**
		 * Renderiza ou lança erro se faltar variáveis
		 */
		renderOrThrow(data: Record<string, unknown>): string {
			const result = substituteTemplate(template, data);
			if (!result.isValid) {
				throw new Error(
					`Placeholders não preenchidos: ${result.missingVars.join(', ')}`,
				);
			}
			return result.output;
		},

		/**
		 * Valida se dados são suficientes para renderizar
		 */
		validate(data: Record<string, unknown>): boolean {
			return validateTemplate(template, data);
		},
	};
}

/**
 * Escapa caracteres especiais em valores para evitar injeção
 *
 * @param value - Valor para escapar
 * @returns Valor escapado
 */
export function escapeTemplateValue(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Define custom formatter para valores no template
 *
 * @example
 * ```typescript
 * const template = "Nome: {{name|upper}}";
 * const result = substituteWithFormatter(template, { name: "joão" });
 * // Result: "Nome: JOÃO"
 * ```
 */
const FORMATTERS: Record<string, (value: string) => string> = {
	escape: (v) => escapeTemplateValue(v),
	lower: (v) => v.toLowerCase(),
	trim: (v) => v.trim(),
	upper: (v) => v.toUpperCase(),
};

/**
 * Substitui template com suporte a formatters básicos
 *
 * @param template - Template com optional formatters (ex: {{var|upper}})
 * @param data - Dados para substituição
 * @returns Template processado
 */
export function substituteWithFormatter(
	template: string,
	data: Record<string, unknown>,
): string {
	const formatterRegex = /\{\{(\w+)(?:\|(\w+))?\}\}/g;

	return template.replace(formatterRegex, (match, varName, formatterName) => {
		const value = getNestedValue(data, varName);

		if (value === undefined || value === null) {
			return match; // Manter placeholder se valor não existir
		}

		let stringValue = String(value);

		if (formatterName && formatterName in FORMATTERS) {
			stringValue = FORMATTERS[formatterName](stringValue);
		}

		return stringValue;
	});
}
