import request from '@/utils/request'

const area = {
  /**
   * 获取省市区
   *
   * @see https://www.easyapi.com
   */
  getAreaList(params: any): Promise<any> {
    return request.get('https://qiniu.easyapi.com/area.json', {
      params: {
        ...params,
      },
    })
  },
}

export default area
