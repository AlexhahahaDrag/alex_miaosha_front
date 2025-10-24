import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { getDictList } from '@/views/finance/dict/api';
import type { DictInfo } from '@/views/finance/dict/config';

export function useDictInfo(initialDictTypes?: string) {
	const loading = ref(false);
	const dictMap = ref<Map<string, DictInfo[]>>(new Map());

	const getDictInfoList = async (dictTypes: string) => {
		loading.value = true;
		try {
			const { code, data, message: messageInfo } = await getDictList(dictTypes);
			if (code === '200') {
				// 按 belongTo 分组数据
				const groupedData = new Map<string, DictInfo[]>();
				data?.forEach((item: DictInfo) => {
					const belongTo = item.belongTo;
					if (!groupedData.has(belongTo as string)) {
						groupedData.set(belongTo as string, []);
					}
					groupedData.get(belongTo as string)!.push(item);
				});
				dictMap.value = groupedData;
			} else {
				message.error(messageInfo || '查询字典数据失败！');
			}
		} catch (error: unknown) {
			console.log(`获取字典数据时发生错误:`, error);
			message.error('获取字典数据时发生错误');
		} finally {
			loading.value = false;
		}
	};

	// 获取特定类型的字典数据
	const getDictByType = (type: string): DictInfo[] => {
		return dictMap.value.get(type) || [];
	};

	// 获取所有字典类型
	const getDictTypes = (): string[] => {
		return Array.from(dictMap.value.keys());
	};

	// 检查是否已加载特定类型
	const hasDictType = (type: string): boolean => {
		return dictMap.value.has(type);
	};

	// 如果传入了初始字典类型，则自动调用接口
	getDictInfoList(initialDictTypes || '');

	return {
		loading,
		dictMap,
		getDictInfoList,
		getDictByType,
		getDictTypes,
		hasDictType,
	};
}
