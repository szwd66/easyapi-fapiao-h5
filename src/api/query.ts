import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

const query = {
  /**
   * 查询客户服务器订单信息
   *
   * @see https://www.easyapi.com
   */
  queryShopOrder(outOrderNo): Promise<any> {
    return request.get(`/shop-order/${outOrderNo}/query`, {
      params: {
        accessToken: localStorage.get('accessToken'),
      },
    })
  },

  /**
   * 批量查询发票状态
   */
  getState(outOrderNo): Promise<any> {
    return request.get('/invoice/state', {
      params: {
        outOrderNos: outOrderNo,
        accessToken: localStorage.get('accessToken'),
      },
    })
  },

  /**
   * 根据税号批量获取税收编码简称
   */
  getShortNameByTaxCode(data): Promise<any> {
    return request.post('/tax-code/short-name', data)
  },
}

export default query
