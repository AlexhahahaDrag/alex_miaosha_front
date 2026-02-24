import type { MenuDataItem } from '@/router/config';

interface ProxyAlgorithm {
	increaseIndexes<T extends MenuDataItem>(val: Array<T>): Array<T>;
}

class algorithmProxy implements ProxyAlgorithm {
	constructor() {}
	public increaseIndexes<T extends MenuDataItem>(val: T[]): T[] {
		return Object.keys(val)
			.map((v: string) => {
				return {
					...val[v],
					key: v,
				};
			})
			.filter((v) => v.meta && !v.meta.hideInMenu);
	}
}

export const algorithm = new algorithmProxy();
