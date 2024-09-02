import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

const make = {
  /**
   * 开具发票
   *
   * @see https://www.easyapi.com
   */
  makeInvoice(data): Promise<any> {
    data.accessToken = localStorage.get('accessToken')
    return request.post('/invoice/make', data)
  },

  /**
   * 合并外部订单开具发票
   *
   * @see https://www.easyapi.com
   */
  mergeMakeInvoice(data): Promise<any> {
    data.accessToken = localStorage.get('accessToken')
    return request.post('/merge-make', data)
  },

  /**
   * 大类开具发票
   *
   * @see https://www.easyapi.com
   */
  categoryMakeInvoice(data): Promise<any> {
    data.accessToken = localStorage.get('accessToken')
    data.taxNumber = localStorage.get('taxNumber')
    return request.post('/invoice/category/make', data)
  },

  /**
   * 商品明细开具发票
   *
   * @see https://www.easyapi.com
   */

  productMakeInvoice(data): Promise<any> {
    data.accessToken = localStorage.get('accessToken')
    return request.post('/invoice/product/make', data)
  },
}

export default make
