/**
 * Canonical roles for the HACI matching engine.
 *
 * Exposed roles: 6 options presented to users in stage 1.
 * Internal roles: 2 additional roles for compatibility with legacy data.
 *
 * Source of truth: docs/raw inputs/canonical-prompt-generator.json
 */

export type InitialRoleId =
	| 'role.analyze'
	| 'role.synthesize'
	| 'role.explore'
	| 'role.decideSupport'
	| 'role.document'
	| 'role.transform';

export type InternalRoleId = InitialRoleId | 'role.research' | 'role.execute';

export type RoleConfig = {
	id: InitialRoleId;
	label: string;
	userHint: string;
};

export const EXPOSED_ROLES: readonly RoleConfig[] = [
	{
		id: 'role.analyze',
		label: 'Analisar',
		userHint:
			'Quero diagnóstico, lacunas, riscos, inconsistências. Sem executar mudanças.',
	},
	{
		id: 'role.synthesize',
		label: 'Organizar / Sintetizar',
		userHint:
			'Quero estruturar, consolidar e dar forma. Sem criar coisas arbitrárias.',
	},
	{
		id: 'role.explore',
		label: 'Explorar alternativas',
		userHint: 'Quero opções, abordagens e trade-offs. Sem decidir por mim.',
	},
	{
		id: 'role.decideSupport',
		label: 'Apoiar decisão',
		userHint:
			'Quero recomendação e priorização com justificativa. A decisão final é minha.',
	},
	{
		id: 'role.document',
		label: 'Documentar / Formalizar',
		userHint:
			'Quero regras, contratos, especificações e documentação normativa.',
	},
	{
		id: 'role.transform',
		label: 'Transformar conteúdo',
		userHint:
			'Quero aplicar regras explícitas: reformatar, normalizar, extrair, comparar versões.',
	},
] as const;

export const INTERNAL_ROLE_IDS: readonly InternalRoleId[] = [
	...EXPOSED_ROLES.map((r) => r.id),
	'role.research',
	'role.execute',
] as const;

export function isInitialRole(value: unknown): value is InitialRoleId {
	return EXPOSED_ROLES.some((r) => r.id === value);
}

export function isInternalRole(value: unknown): value is InternalRoleId {
	return INTERNAL_ROLE_IDS.includes(value as InternalRoleId);
}

export function getRoleLabel(roleId: InitialRoleId): string {
	return EXPOSED_ROLES.find((r) => r.id === roleId)?.label ?? roleId;
}

export function getRoleHint(roleId: InitialRoleId): string {
	return EXPOSED_ROLES.find((r) => r.id === roleId)?.userHint ?? '';
}
