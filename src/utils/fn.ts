/**
 * 数组对象 查找是否存在某元素 返回 -1或下标
 * 参数1：数组对象 arrObj
 * 参数2：属性  str
 * 参数3：值    str
 */
export function findElem(arrObj: any, attr: any, val: any) {
  for (let i = 0; i < arrObj.length; i++) {
    if (val.includes(arrObj[i][attr] as any) !== -1) {
      return i
    }
  }
  return -1
}

/**
 * 处理省市区
 */
export function transformData(data: any) {
  data.forEach((item: any) => {
    item.value = item.name
    item.label = item.name
    if (item.children && item.children.length > 0) {
      transformData(item.children)
    }
  })
}

/**
 * 随机生成一个包含数字和字母的几位组合
 */
export function generateRandomAlphaNumeric(length: any) {
  const chars
    = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    result += chars[randomIndex]
  }
  return result
}

/**
 * @description 判断是否为json
 * @param value
 * @returns {boolean}
 */
export function isJson(value: any) {
  if (typeof value === 'string') {
    const obj = JSON.parse(value)
    return !!(typeof obj === 'object' && obj)
  }
  return false
}

/**
 * @description 判断是否可以除尽
 */
export function judgeDivisor(m: any, n: any) {
  const num = {}
  let i = 0
  m = m % n
  let result = ''
  while (m != 0 && !(m in num)) {
    num[m] = i++
    result += Number.parseInt((m * 10) / n)
    m = (m * 10) % n
  }
  return m == 0
}

export function parseTextToArray(text: string) {
  // 使用正则表达式按行匹配文本
  const linesArray = text.match(/^.*(?:\r\n?|\n|$)/gm) || []
  // 处理数组，去掉每行前后的空白字符，并过滤掉空行
  const cleanedLinesArray = linesArray.map(line => line.trim()).filter(line => line.length > 0)
  return cleanedLinesArray
}
