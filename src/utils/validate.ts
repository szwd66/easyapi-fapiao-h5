/**
 * 验证码手机号码
 * @param {string} mobile
 * @returns {boolean}
 */
export function validMobile(mobile: string) {
  return mobile.startsWith('1')
}

/**
 * 验证邮箱
 * @param {string} email
 * @returns {boolean}
 */
export function validEmail(email: string) {
  const reg
    = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i
  return reg.test(email)
}

/**
 * 验证金额
 * @param {string} price
 * @returns {boolean}
 */
export function validPrice(price) {
  const reg = /^(([1-9]\d*)|(0))(\.\d{1,2})?$/
  return reg.test(price)
}
