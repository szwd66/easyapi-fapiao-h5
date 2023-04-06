/**
 * 发票分类
 */
export const invoiceCategoryList = [
  { value: '增值税电子普通发票', label: '增值税电子普通发票' },
  { value: '增值税普通发票', label: '增值税普通发票' },
  { value: '增值税专用发票', label: '增值税专用发票' },
  { value: '增值税电子专用发票', label: '增值税电子专用发票' },
  { value: '全电电子普通发票', label: '全电电子普通发票' },
  { value: '全电电子专用发票', label: '全电电子专用发票' },
]

export function invoiceTag(invoice: any) {
  if (invoice.category === '增值税电子普通发票')
    return { name: '电普', color: '#00b2c8', bgColor: '#f2fbff' }

  if (invoice.category === '增值税普通发票')
    return { name: '普票', color: '#f56c6c', bgColor: '#f56c6c' }

  if (invoice.category === '全电电子普通发票')
    return { name: '全电普', color: '#00b2c8', bgColor: '#f2fbff' }

  if (invoice.category === '卷式增值税普通发票')
    return { name: '卷票', color: '#00b2c8', bgColor: '#f2fbff' }

  if (invoice.category === '增值税电子专用发票')
    return { name: '电专', color: '#00b2c8', bgColor: '#f2fbff' }

  if (invoice.category === '增值税专用发票')
    return { name: '专票', color: '#f56c6c', bgColor: '#fff3f3' }

  if (invoice.category === '全电电子专用发票')
    return { name: '全电专', color: '#00b2c8', bgColor: '#f2fbff' }
}
