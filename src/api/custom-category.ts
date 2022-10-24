import request from '@/utils/request';
import { localStorage } from '@/utils/local-storage';

/**
 * 获取发票自定义分类列表
 *
 * @see https://www.easyapi.com
 */

export async function getCustomCategoryListApi(params): Promise<any> {
  return request.get(`/custom-categories`, {
    params: {
      accessToken: localStorage.get('accessToken'),
      taxNumber: localStorage.get('taxNumber'),
      ...params,
    },
  });
}
