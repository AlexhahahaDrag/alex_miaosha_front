import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
	postFileData,
} from '@/utils/request';

const baseFileManager = '/file-info';

const fileUrl = {
	page: '/page',
	url: '',
};

// 获取文件列表
export function getFilePage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	let url = baseService.file + baseFileManager + fileUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

// 获取文件详情
export function getFileDetail(id: string): Promise<any> {
	return getDataOne(
		baseService.file + baseFileManager + fileUrl.url + '?id=' + id,
	);
}

// 添加文件
export function addFileManager(params: any, config: any): Promise<any> {
	return postFileData(
		baseService.file + baseFileManager + fileUrl.url,
		params,
		config,
	);
}

// 编辑文件
export function editFileManager(params: any, config: any): Promise<any> {
	return putData(
		baseService.file + baseFileManager + fileUrl.url,
		params,
		config,
	);
}

// 删除文件
export function deleteDictManager(ids: string): Promise<any> {
	return deleteData(
		baseService.file + baseFileManager + fileUrl.url + '?ids=' + ids,
	);
}
