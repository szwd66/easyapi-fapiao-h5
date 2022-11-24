import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

/**
 * 获取订单类型列表
 */
export async function getOrderTypeListApi(): Promise<any> {
  return request.get('/order-types', {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  })
}
