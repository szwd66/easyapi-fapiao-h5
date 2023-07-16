import request from '@/utils/request'

const mallOrder = {

  /**
   * 用户根据订单号和金额主动申请开票
   */
  apply(data): Promise<any> {
    return request.post('/mall-order/apply', data)
  },

}

export default mallOrder
