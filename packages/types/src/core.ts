export type Scale1to5 = 1 | 2 | 3 | 4 | 5;
export type Scale1to3 = 1 | 2 | 3;

export type RulerId = 'inference' | 'decision' | 'scope' | 'source' | 'meta';

export type RulersVector = Record<RulerId, Scale1to5>;

export type CanonicalLevelId =
	| 'N1'
	| 'N2'
	| 'N3'
	| 'N4'
	| 'N5'
	| 'N6'
	| 'N7'
	| 'N8';

export type InitialRoleId =
	| 'role.analyze'
	| 'role.synthesize'
	| 'role.explore'
	| 'role.decideSupport'
	| 'role.document'
	| 'role.transform';

export type OperationMode =
	| 'MODE_PREPARATION'
	| 'MODE_GOVERNANCE'
	| 'MODE_EXECUTION';
