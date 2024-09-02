import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

const invoice = {
  /**
   * 获取开票列表
   *
   * @see https://www.easyapi.com
   */
  getInvoiceList(params): Promise<any> {
    return request.get('/invoices', {
      params: {
        accessToken: localStorage.get('accessToken'),
        ...params,
      },
    })
  },

  /**
   * 获取发票详情信息
   */
  getInvoice(id): Promise<any> {
    return request.get(`/invoice/${id}`, {
      params: {
        accessToken: localStorage.get('accessToken'),
      },
    })
  },

  /**
   * 查询发票信息
   *
   * @see https://www.easyapi.com
   */
  queryInvoice(outOrderNo): Promise<any> {
    return request.get(`/invoice/${outOrderNo}/query`, {
      params: {
        accessToken: localStorage.get('accessToken'),
      },
    })
  },

  /**
   * 获取外部订单列表
   *
   * @param invoiceId 发票ID
   */
  getOutOrderList(params): Promise<any> {
    return request.get('/out-orders', {
      params: {
        accessToken: localStorage.get('accessToken'),
        ...params,
      },
    })
  },

  /**
   * 发送邮箱
   */
  sendEmail(params): Promise<any> {
    return request.get('/send/email', {
      params: {
        accessToken: localStorage.get('accessToken'),
        ...params,
      },
    })
  },
}

export default invoice
