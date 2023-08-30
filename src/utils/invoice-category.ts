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

  if (category === '全电电子普通发票')
    return { name: '全电普', color: '#00b2c8', bgColor: '#f2fbff' }

  if (category === '全电电子专用发票')
    return { name: '全电专', color: '#665823', bgColor: '#f8f4e5' }
}
export function getState(statements: any) {
  if (statements === '已开票')
    return 'green'
  if (statements === '等待其他途径开票')
    return '#eada57'
  if (statements === '待审核')
    return '#1345a9'
  if (statements === '审核未通过')
    return '#CE1B1B'
  if (statements === '开票失败')
    return '#CE1B1B'
  if (statements === '放弃开票')
    return '#a8a7a7'
  if (statements === '红冲中')
    return '#eada57'
  if (statements === '已红冲')
    return '#565454'
  if (statements === '已作废')
    return '#eada57'
  if (statements === '作废中')
    return '#726f6f'
}
