import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

const shop = {
  /**
   * 获取商户详情信息
   * @see https://www.easyapi.com
   */
  getShop(): Promise<any> {
    return request.get('/shop', {
      params: {
        accessToken: localStorage.get('accessToken'),
      },
    })
  },
}

export default shop
