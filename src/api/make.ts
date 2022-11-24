import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

/**
 * 开具发票
 *
 * @see https://www.easyapi.com
 */

export async function makeInvoiceApi(data): Promise<any> {
  data.accessToken = localStorage.get('accessToken')
  return request.post('/invoice/make', data)
}

/**
 * 合并外部订单开具发票
 *
 * @see https://www.easyapi.com
 */
export async function mergeMakeInvoiceApi(data): Promise<any> {
  data.accessToken = localStorage.get('accessToken')
  return request.post('/merge-make', data)
}

/**
 * 大类开具发票
 *
 * @see https://www.easyapi.com
 */
export async function categoryMakeInvoiceApi(data): Promise<any> {
  data.accessToken = localStorage.get('accessToken')
  data.taxNumber = localStorage.get('taxNumber')
  return request.post('/invoice/category/make', data)
}

/**
 * 商品明细开具发票
 *
 * @see https://www.easyapi.com
 */

export async function productMakeInvoiceApi(data): Promise<any> {
  data.accessToken = localStorage.get('accessToken')
  return request.post('/invoice/product/make', data)
}
