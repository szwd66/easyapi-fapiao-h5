import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

/**
 * 获取商户详情信息
 * @see https://www.easyapi.com
 */
export async function getShopApi(): Promise<any> {
  return request.get('/shop', {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  })
}
