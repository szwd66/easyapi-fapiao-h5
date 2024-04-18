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

export function invoiceTag(category: any) {
  if (category === '增值税电子普通发票')
    return { name: '电普', color: '#00b2c8', bgColor: '#f2fbff' }

  if (category === '增值税普通发票')
    return { name: '普票', color: '#1950a5', bgColor: '#edf1fa' }

  if (category === '增值税电子专用发票')
    return { name: '电专', color: '#266253', bgColor: '#dbf5eb' }

  if (category === '增值税专用发票')
    return { name: '专票', color: '#266253', bgColor: '#dbf5eb' }

  if (category === '全电电子普通发票' || category === '数电普通发票' )
    return { name: '数电普', color: '#00b2c8', bgColor: '#f2fbff' }

  if (category === '全电电子专用发票' || category === '数电专用发票')
    return { name: '数电专', color: '#665823', bgColor: '#f8f4e5' }
}

export function getColorByStatements(statements: any) {
  if (statements === '已开票')
    return '#15ad31'

  if (statements === '待审核')
    return '#2a9efb'

  if (statements === '开票失败')
    return '#CE1B1B'

  if (statements === '放弃开票' || statements === '已红冲' || statements === '已作废' || statements === '审核未通过')
    return '#a8a7a7'

  if (statements === '等待其他途径开票' || statements === '红冲中' || statements === '作废中')
    return '#e6a23c'
}

/**
 * 判断状态
 */
export function getIconByStatements(statements) {
  if (statements === '已开票')
    return 'checked'

  if (statements === '等待其他途径开票' || statements === '待审核' || statements === '红冲中' || statements === '作废中')
    return 'clock'

  if (statements === '开票失败' || statements === '审核未通过' || statements === '放弃开票' || statements === '已红冲' || statements === '已作废')
    return 'clear'
}
