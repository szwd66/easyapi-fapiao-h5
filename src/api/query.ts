import request from '@/utils/request';
import { localStorage } from '@/utils/local-storage';

/**
 * 查询客户服务器订单信息
 *
 * @see https://www.easyapi.com
 */
export async function queryShopOrderApi(outOrderNo): Promise<any> {
  return request.get(`/shop-order/${outOrderNo}/query`, {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  });
}

/**
 * 批量查询发票状态
 */
export async function getStateApi(outOrderNo): Promise<any> {
  return request.get(`/invoice/state`, {
    params: {
      outOrderNos: outOrderNo,
      accessToken: localStorage.get('accessToken'),
    },
  });
}

/**
 * 根据税号批量获取税收编码简称
 */
export async function getShortNameByTaxCodeApi(data): Promise<any> {
  return request.post(`/tax-code/short-name`, data);
}
