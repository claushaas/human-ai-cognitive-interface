import type {
	CanonicalLevelId,
	CriterionId,
	InitialRoleId,
	RulersVector,
} from '~/types';

interface DerivationContext {
	role: InitialRoleId;
	level: CanonicalLevelId;
	rulers: RulersVector;
}

/**
 * Regras de derivação de critérios (R0-R8)
 * Baseado em docs/08-criteria-and-collection-protocol.md
 */

/**
 * R0: C1 (Objetivo Operacional) sempre incluído
 */
export function deriveC1(): CriterionId[] {
	return ['C1'];
}

/**
 * R1: C2 (Artefato) quando nível exige output estruturado
 * Níveis N3+ envolvem síntese ou documentação
 */
export function deriveC2(level: CanonicalLevelId): CriterionId[] {
	const structuredOutputLevels: CanonicalLevelId[] = [
		'N3',
		'N4',
		'N5',
		'N6',
		'N7',
		'N8',
	];
	return structuredOutputLevels.includes(level) ? ['C2'] : [];
}

/**
 * R2: C13 (Contexto Técnico) quando role.transform + scope >= 4
 * Normalização canônica conforme docs/09-open-issues-and-gaps.md seção 5
 */
export function deriveC13(role: InitialRoleId, scope: number): CriterionId[] {
	if ((role === 'role.transform' || role === 'role.document') && scope >= 4) {
		return ['C13'];
	}
	return [];
}

/**
 * R3: C5 (Limites de Inferência) quando inference >= 3
 */
export function deriveC5(inference: number): CriterionId[] {
	return inference >= 3 ? ['C5'] : [];
}

/**
 * R4: C6 (Autoridade/Decisão) quando decision >= 2
 */
export function deriveC6(decision: number): CriterionId[] {
	return decision >= 2 ? ['C6'] : [];
}

/**
 * R5: C7 (Execução vs Preparação) sempre em modo preparation
 * Sempre incluído no contexto de derivação
 */
export function deriveC7(): CriterionId[] {
	return ['C7'];
}

/**
 * R6: C8/C9 (Transformações) quando role.transform ou role.synthesize
 */
export function deriveC8C9(role: InitialRoleId): CriterionId[] {
	if (role === 'role.transform') {
		return ['C8', 'C9'];
	}
	if (role === 'role.synthesize') {
		return ['C8'];
	}
	return [];
}

/**
 * R7: C10/C11/C12 quando nível exige validação estruturada
 * Níveis N5+ envolvem decisão ou governança
 */
export function deriveC10C11C12(level: CanonicalLevelId): CriterionId[] {
	const validationLevels: CanonicalLevelId[] = ['N5', 'N6', 'N7', 'N8'];
	if (validationLevels.includes(level)) {
		return ['C10', 'C11', 'C12'];
	}
	return [];
}

/**
 * R8: C3 (Escopo) quando escopo não for local óbvio
 * C4 (Fonte) quando fonte não for fechada/óbvia
 */
export function deriveC3C4(scope: number, source: number): CriterionId[] {
	const criteria: CriterionId[] = [];

	// C3 quando scope >= 3 (departamental ou mais amplo)
	if (scope >= 3) {
		criteria.push('C3');
	}

	// C4 quando source >= 3 (parcialmente aberta ou mais)
	if (source >= 3) {
		criteria.push('C4');
	}

	return criteria;
}

/**
 * C14 (Restrições de Segurança) sempre considerado em N6 (governança)
 */
export function deriveC14(level: CanonicalLevelId): CriterionId[] {
	return level === 'N6' ? ['C14'] : [];
}

/**
 * Aplica todas as regras de derivação e retorna conjunto de critérios
 *
 * @param context - Contexto do contrato cognitivo
 * @returns Lista de critérios derivados (sem ordenação)
 */
export function deriveAllCriteria(context: DerivationContext): CriterionId[] {
	const { role, level, rulers } = context;

	const allCriteria = new Set<CriterionId>();

	// Aplicar todas as regras (R0-R8 + C14)
	for (const c of deriveC1()) allCriteria.add(c); // R0
	for (const c of deriveC2(level)) allCriteria.add(c); // R1
	for (const c of deriveC13(role, rulers.scope)) allCriteria.add(c); // R2
	for (const c of deriveC5(rulers.inference)) allCriteria.add(c); // R3
	for (const c of deriveC6(rulers.decision)) allCriteria.add(c); // R4
	for (const c of deriveC7()) allCriteria.add(c); // R5
	for (const c of deriveC8C9(role)) allCriteria.add(c); // R6
	for (const c of deriveC10C11C12(level)) allCriteria.add(c); // R7
	for (const c of deriveC3C4(rulers.scope, rulers.source)) allCriteria.add(c); // R8
	for (const c of deriveC14(level)) allCriteria.add(c); // C14

	return Array.from(allCriteria);
}
