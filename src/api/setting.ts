import request from '@/utils/request';
import { localStorage } from '@/utils/local-storage';

/**
 * 查询设置信息
 *
 * @see https://www.easyapi.com
 */

export async function findSettingApi(params): Promise<any> {
  return request.get('/setting/find', {
    params: {
      accessToken: localStorage.get('accessToken'),
      ...params,
    },
  });
}
