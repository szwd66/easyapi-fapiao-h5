/**
 * 验证码手机号码
 * @param {string} mobile
 * @returns {Boolean}
 */
export function validMobile(mobile) {
  return mobile.startsWith('1')
}

/**
 * 验证邮箱
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
  const reg
    = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * 验证金额
 * @param {string} price
 * @returns {Boolean}
 */
export function validPrice(price) {
  const reg = /^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/
  return reg.test(price)
}
