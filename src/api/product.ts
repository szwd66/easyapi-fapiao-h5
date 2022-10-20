import request from '@/utils/request';
import { localStorage } from '@/utils/local-storage';

/**
 * 获取商品列表
 *
 * @see https://www.easyapi.com
 */
export async function getProductListApi(searchParams): Promise<any> {
  return request.get(`/products`, {
    params: {
      accessToken: localStorage.get('accessToken'),
      size: 100,
      ...searchParams,
    },
  });
}
