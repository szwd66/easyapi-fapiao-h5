import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

const customer = {
  /**
   * 获取我的客户信息
   *
   * @see https://www.easyapi.com
   */
  getCustomer(params): Promise<any> {
    return request.get('/customer', {
      params: {
        accessToken: localStorage.get('accessToken'),
        taxNumber: localStorage.get('taxNumber'),
        ...params,
      },
    })
  },
}

export default customer
