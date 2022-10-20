import request from '@/utils/request';
import { localStorage } from '@/utils/local-storage';

/**
 * 获取地址列表
 *
 * @see https://www.easyapi.com
 */

export async function getAddressListApi(params): Promise<any> {
  return request.get(`/addresses`, {
    params: {
      accessToken: localStorage.get('accessToken'),
      ...params,
    },
  });
}

/**
 * 获取地址信息
 *
 * @see https://www.easyapi.com
 */
export async function getAddressApi(id): Promise<any> {
  return request.get(`/address/${id}`, {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  });
}

/**
 * 添加地址信息
 **
 * @see https://www.easyapi.com
 */

export async function createAddressApi(data): Promise<any> {
  data.accessToken = localStorage.get('accessToken');
  return request.post(`/address`, data);
}

/**
 * 修改地址信息
 *
 * @see https://www.easyapi.com
 */

export async function updateAddressApi(id, data): Promise<any> {
  data.accessToken = localStorage.get('accessToken');
  return request.put(`/address/${id}`, data);
}

/**
 * 删除地址信息
 *
 * @see https://www.easyapi.com
 */
export async function deleteAddressApi(id): Promise<any> {
  return request.delete(`/address/${id}`, {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  });
}

/**
 * 获取我的默认地址信息
 */
export async function getDefaultAddressApi(username): Promise<any> {
  return request.get(`/address/${username}/default`, {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  });
}

/**
 * 设置为默认地址
 *
 * @see https://www.easyapi.com
 */
export async function defaultAddressApi(id): Promise<any> {
  return request.put(`/address/${id}`, {
    accessToken: localStorage.get('accessToken'),
    ifDefault: true,
  });
}
