import request from '@/utils/request'
import { localStorage } from '@/utils/local-storage'

const setting = {
  /**
   * 查询设置信息
   *
   * @see https://www.easyapi.com
   */
  findSetting(params): Promise<any> {
    return request.get('/setting/find', {
      params: {
        accessToken: localStorage.get('accessToken'),
        ...params,
      },
    })
  },
}

export default setting
