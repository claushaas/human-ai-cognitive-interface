/**
 * Track selection: separate operational (N1-N6) from meta/constitutional (N7-N8).
 *
 * Constitutional rule (12-constitution.md §5.1):
 * 1. Partition candidates into operational (N1..N6) and meta (N7..N8)
 * 2. Select ONE track for presentation:
 *    - If rulers.decision == 3 → operational only (N6 requires decision=3)
 *    - Else if rulers.meta >= 4 → meta only
 *    - Else → operational only
 * 3. NEVER present both tracks in the same choice set.
 */

import type { LevelId } from '../levels/levels';
import { isMetaLevel, isOperationalLevel } from '../levels/levels';
import type { RulersVector } from '../rulers/rulers';

export type TrackType = 'operational' | 'meta';

export type TrackSelection = {
	track: TrackType;
	selectedIds: LevelId[];
	rejectedIds: LevelId[];
	reason: string;
};

export function selectTrack(
	candidateIds: LevelId[],
	rulers: RulersVector,
): TrackSelection {
	const operational = candidateIds.filter(isOperationalLevel);
	const meta = candidateIds.filter(isMetaLevel);

	// Rule: decision === 3 → operational (N6 is governance)
	if (rulers.decision === 3) {
		return {
			reason: 'decision=3 seleciona track operacional (governança ativa)',
			rejectedIds: meta,
			selectedIds: operational,
			track: 'operational',
		};
	}

	// Rule: meta >= 4 → meta track
	if (rulers.meta >= 4) {
		return {
			reason: 'meta≥4 seleciona track meta/constitucional',
			rejectedIds: operational,
			selectedIds: meta,
			track: 'meta',
		};
	}

	// Default: operational
	return {
		reason: 'padrão: track operacional',
		rejectedIds: meta,
		selectedIds: operational,
		track: 'operational',
	};
}

/**
 * Determine if a specific levelId belongs to the selected track.
 */
export function isInSelectedTrack(levelId: LevelId, track: TrackType): boolean {
	if (track === 'operational') return isOperationalLevel(levelId);
	return isMetaLevel(levelId);
}
