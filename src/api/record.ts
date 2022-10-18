import request from '@/utils/request';
import { localStorage } from '@/utils/local-storage';

/**
 * 获取开票记录
 *
 * @see https://www.easyapi.com
 */

export async function getRecordListApi(params): Promise<any> {
  return request.get('/api/invoice/records', {
    params: {
      accessToken: localStorage.get('accessToken'),
      ...params,
    },
  });
}
