import request from '@/utils/request'

const mallOrder = {

  /**
   * 用户根据订单号和金额主动申请开票
   */
  apply(params): Promise<any> {
    return request.get('/mall-order/apply', {
      params: {
        ...params,
      },
    })
  },

}

export default mallOrder
