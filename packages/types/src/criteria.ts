export type CriterionId =
	| "C1"
	| "C2"
	| "C3"
	| "C4"
	| "C5"
	| "C6"
	| "C7"
	| "C8"
	| "C9"
	| "C10"
	| "C11"
	| "C12"
	| "C13"
	| "C14";

export type CollectionBlock = {
	id: string;
	title: string;
	instruction: string;
	include: string[];
	avoid: string[];
	example: string;
	rationale: string;
};

export type CollectionProtocol = {
	protocolVersion: string;
	criteria: CollectionBlock[];
	implicitCriteria: CriterionId[];
	blockingIssue?: string;
	question?: string;
	collectionPayloadSchema: unknown;
};
