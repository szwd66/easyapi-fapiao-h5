/**
 * 获取复制文案
 */
export function copyText(invoice) {
  return `${invoice.purchaserName}
   收到一张发票，${invoice.category} 
   ${invoice.price}元，开票日期：${invoice.printTime.substring(0, 10)}，
   ${invoice.code ? `发票代码：${invoice.code}，` : ''}${invoice.number ? `发票号码：${invoice.number}，` : ''}
   ${invoice.allElectronicInvoiceNumber ? `全电号码：${invoice.allElectronicInvoiceNumber}，` : ''}
   下载地址：${invoice.electronicInvoiceUrl}`
}

/**
 * 判断发票状态
 */
