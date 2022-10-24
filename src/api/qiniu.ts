import request from '@/utils/request';

/**
 * 获取七牛KEY
 *
 * @see https://www.easyapi.com
 */
export async function getQiniuKeyApi(): Promise<any> {
  return request.get(`https://api.easyapi.com/qiniu/key`);
}

/**
 * 获取七牛空间TOKEN
 *
 * @see https://www.easyapi.com
 */
export async function getQiniuTokenApi(): Promise<any> {
  return request.get(`https://api.easyapi.com/qiniu/upToken`);
}

/**
 * 七牛上传
 */
export const qiniuUploadApi = data => {
  return request.post(`https://upload.qiniup.com/`, data);
};
