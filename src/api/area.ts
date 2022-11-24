import request from '@/utils/request'

/**
 * 获取省市区
 *
 * @see https://www.easyapi.com
 */

export async function getAreaListApi(params): Promise<any> {
  return request.get('https://qiniu.easyapi.com/area.json', {
    params: {
      ...params,
    },
  })
}
