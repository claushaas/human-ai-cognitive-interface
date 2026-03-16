import type { InitialRoleId, RulersVector } from '~/types';
import hardBlocksConfig from '../../config/hard-blocks.json';

interface HardBlockResult {
	ruleId: string;
	message: string;
	severity: 'BLOCK' | 'WARN' | 'CONFIRM';
}

/**
 * Avalia todas as regras de hard blocks contra o contrato
 *
 * @param rulers - Vetor de réguas do usuário
 * @param role - Papel inicial
 * @param selectedLevel - Nível selecionado (para blocks que dependem do nível)
 * @returns Lista de hard blocks ativos
 */
export function evaluateHardBlocks(
	rulers: RulersVector,
	role: InitialRoleId,
	selectedLevel?: string,
): HardBlockResult[] {
	const results: HardBlockResult[] = [];
	const rules = hardBlocksConfig.rules;

	for (const rule of rules) {
		if (evaluateCondition(rule.condition, rulers, role, selectedLevel)) {
			results.push({
				message: rule.message,
				ruleId: rule.id,
				severity: rule.action as 'BLOCK' | 'WARN' | 'CONFIRM',
			});
		}
	}

	return results;
}

/**
 * Avalia uma condição de hard block
 * Implementa parser simples para condições canônicas
 */
function evaluateCondition(
	condition: string,
	rulers: RulersVector,
	role: InitialRoleId,
	selectedLevel?: string,
): boolean {
	// block.decision.totalOrHigh: rulers.decision >= 4
	if (condition.includes('rulers.decision >= 4')) {
		return rulers.decision >= 4;
	}

	// block.source.closedButResearch: rulers.source == 1 AND (role == 'role.explore' OR role == 'role.research')
	if (
		condition.includes('rulers.source == 1') &&
		condition.includes('role.explore')
	) {
		return rulers.source === 1 && role === 'role.explore';
	}

	// block.inferenceHighWithClosedSource: rulers.inference >= 4 AND rulers.source == 1
	if (
		condition.includes('rulers.inference >= 4') &&
		condition.includes('rulers.source == 1')
	) {
		return rulers.inference >= 4 && rulers.source === 1;
	}

	// block.metaHighAgainstOperational: rulers.meta >= 4 AND rulers.scope <= 2
	if (
		condition.includes('rulers.meta >= 4') &&
		condition.includes('rulers.scope <= 2')
	) {
		return rulers.meta >= 4 && rulers.scope <= 2;
	}

	// block.scopeSystemicWithoutSystemicIntent: rulers.scope >= 4 AND role IN ['role.analyze', 'role.document']
	if (
		condition.includes('rulers.scope >= 4') &&
		condition.includes('role.analyze')
	) {
		return (
			rulers.scope >= 4 && (role === 'role.analyze' || role === 'role.document')
		);
	}

	// block.governanceRequiresDecision3: levelMatch.selectedLevel == 'N6' AND rulers.decision != 3
	if (
		condition.includes("selectedLevel == 'N6'") &&
		condition.includes('rulers.decision != 3')
	) {
		return selectedLevel === 'N6' && rulers.decision !== 3;
	}

	return false;
}
