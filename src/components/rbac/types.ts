export type RbacKey = string | number;

export interface RbacSummaryItem {
	label: string;
	value?: string | number | null;
}

export interface RbacDiffItem {
	key: RbacKey;
	label: string;
	description?: string;
}

export interface RbacSelectableItem {
	key: RbacKey;
	title: string;
	description?: string;
	meta?: string;
	disabled?: boolean;
}

export interface RbacTreeNode {
	key: RbacKey;
	title: string;
	children?: RbacTreeNode[];
	disabled?: boolean;
}
