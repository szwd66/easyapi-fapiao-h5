import request from '@/utils/request'

const qiniu = {
  /**
   * 获取七牛KEY
   *
   * @see https://www.easyapi.com
   */
  getQiniuKey(): Promise<any> {
    return request.get('https://api.easyapi.com/qiniu/key')
  },

  /**
   * 获取七牛空间TOKEN
   *
   * @see https://www.easyapi.com
   */
  getQiniuToken(): Promise<any> {
    return request.get('https://api.easyapi.com/qiniu/upload-token')
  },

  /**
   * 七牛上传
   */
  qiniuUpload(data: any) {
    return request.post('https://upload.qiniup.com/', data)
  },
}

export default qiniu
