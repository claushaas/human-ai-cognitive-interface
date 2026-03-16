import type { CanonicalLevelId, CriterionId, InitialRoleId } from '~/types';

/**
 * Identifica critérios implícitos satisfeitos pelo próprio contrato
 *
 * Critérios implícitos não precisam ser coletados - já são evidentes
 * a partir do papel e nível selecionado.
 */

/**
 * C7 (Execução vs Preparação) é sempre implícito no contexto
 * O próprio sistema está em MODE_PREPARATION
 */
export function getImplicitC7(): boolean {
	return true;
}

/**
 * C1 (Objetivo Operacional) é implícito para certos papéis
 * role.analyze, role.synthesize têm objetivo claro pelo papel
 */
export function isC1Implicit(role: InitialRoleId): boolean {
	return role === 'role.analyze' || role === 'role.synthesize';
}

/**
 * C10 (Formato de Saída) é implícito para role.document
 * O formato é inerente à documentação
 */
export function isC10Implicit(
	role: InitialRoleId,
	level: CanonicalLevelId,
): boolean {
	return role === 'role.document' || level === 'N8';
}

/**
 * Retorna lista de critérios implícitos
 */
export function getImplicitCriteria(
	role: InitialRoleId,
	level: CanonicalLevelId,
): CriterionId[] {
	const implicit: CriterionId[] = [];

	// C7 sempre implícito
	if (getImplicitC7()) {
		implicit.push('C7');
	}

	// C1 implícito para certos papéis
	if (isC1Implicit(role)) {
		implicit.push('C1');
	}

	// C10 implícito para documentação
	if (isC10Implicit(role, level)) {
		implicit.push('C10');
	}

	return implicit;
}
