import request from '@/utils/request';
import { localStorage } from '@/utils/local-storage';

/**
 * 获取公司抬头列表
 *
 * @see https://www.easyapi.com
 */
export async function getCompanyListApi(params): Promise<any> {
  return request.get(`/companies`, {
    params: {
      accessToken: localStorage.get('accessToken'),
      ...params,
    },
  });
}

/**
 * 获取公司抬头信息
 *
 * @see https://www.easyapi.com
 */
export async function getCompanyApi(id): Promise<any> {
  return request.get(`/company/${id}`, {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  });
}

/**
 * 添加公司抬头信息
 *
 * @see https://www.easyapi.com
 */
export async function createCompanyApi(data): Promise<any> {
  data.accessToken = localStorage.get('accessToken');
  return request.post(`/company`, data);
}

/**
 * 修改公司抬头信息
 *
 * @see https://www.easyapi.com
 */

export async function updateCompanyApi(id, data): Promise<any> {
  data.accessToken = localStorage.get('accessToken');
  return request.put(`/company/${id}`, data);
}

/**
 * 删除公司抬头信息
 *
 * @see https://www.easyapi.com
 */
export async function deleteCompanyApi(id): Promise<any> {
  return request.delete(`/company/${id}`, {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  });
}

/**
 * 设置为默认抬头
 *
 * @see https://www.easyapi.com
 */
export async function defaultCompanyApi(id): Promise<any> {
  return request.put(`/company/${id}`, {
    accessToken: localStorage.get('accessToken'),
    ifDefault: true,
  });
}

/**
 * 获取默认抬头信息
 *
 * @see https://www.easyapi.com
 */
export async function getDefaultCompanyApi(): Promise<any> {
  return request.get(`/company/default`, {
    params: {
      accessToken: localStorage.get('accessToken'),
    },
  });
}

/**
 * 抬头信息查询（企业开票信息查询服务）
 *
 * @see https://www.easyapi.com
 */
export async function getCompanyCodeListApi(params): Promise<any> {
  return request.get(`/company/codes`, {
    params: {
      accessToken: localStorage.get('accessToken'),
      ...params,
    },
  });
}
