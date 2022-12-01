export interface ResponseBody<T = any> {
  code?: number
  message?: string
  content?: T
}

/** 统一返回结构体 */
export interface PageResult<T = any> {
  code: number
  content: T[]
  numberOfElements?: number
  totalPages?: number
  totalElements?: number
}
