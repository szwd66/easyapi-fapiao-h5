import request from '@/utils/request'

const config = {

  getWeiXinConfig(url): Promise<any> {
    return request.get(`${process.env.VUE_APP_API_ACCOUNT_URL}/jssdk/wxe89b7b79aa61a423/config?url=${url}`)
  },

}

export default config
