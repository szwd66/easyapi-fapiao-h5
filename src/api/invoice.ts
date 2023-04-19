import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

/**
 * 获取开票列表
 *
 * @see https://www.easyapi.com
 */
export async function getInvoiceListApi(params): Promise<any> {
  return request.get('/invoices', {
    params: {
      accessToken: localStorage.get('accessToken'),
      ...params,
    },
  })
}

/**
 * 获取发票详情信息
 */
export async function getInvoiceApi(id): Promise<any> {
  return request.get(`/invoice/${id}`, {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  })
}

/**
 * 查询发票信息
 *
 * @see https://www.easyapi.com
 */
export async function queryInvoiceApi(outOrderNo): Promise<any> {
  return request.get(`/invoice/${outOrderNo}/query`, {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  })
}

/**
 * 获取外部订单列表
 *
 * @param invoiceId 发票ID
 */
export async function getOutOrderListApi(params): Promise<any> {
  return request.get('/out-orders', {
    params: {
      accessToken: localStorage.get('accessToken'),
      ...params,
    },
  })
}
