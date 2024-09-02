/**
 * 开票页Mixin
 */
import { showToast } from 'vant'
import { reactive } from 'vue'
import setting from '@/api/setting'
import { validEmail, validMobile } from '@/utils/validate'

export default function () {
  const common = reactive({
    remarkPlaceholder: '可输入发票备注信息', // 发票备注填写说明
    ifNeedMobile: false, // 手机号码是否必填
    ifNeedEmail: false, // 邮箱是否必填
    ifCategoryMakeFileRequired: false, // 附件是否必填
  })

  /**
   * 获取发票备注填写说明
   */
  const getInvoiceRemark = () => {
    setting.findSetting({ fieldKeys: 'make-placeholder-remark' }).then((res) => {
      if (res.code === 1)
        common.remarkPlaceholder = res.content[0].fieldValue
    })
  }

  /**
   * 获取手机和邮箱是否必填
   */
  const ifNeedMobileEmail = () => {
    const params = {
      fieldKeys: 'if_need_mobile' + ',' + 'if_need_email',
    }
    setting.findSetting(params).then((res) => {
      if (res.code === 1) {
        for (const setting of res.content) {
          if (setting.fieldKey === 'if_need_mobile')
            common.ifNeedMobile = setting.fieldValue === 'true'
          else if (setting.fieldKey === 'if_need_email')
            common.ifNeedEmail = setting.fieldValue === 'true'
        }
      }
    })
  }

  /**
   * 获取附件是否必填
   */
  const ifCategoryMakeFileRequired = () => {
    const params = {
      fieldKeys: 'if-category-make-file-required',
    }
    setting.findSetting(params).then((res) => {
      if (res.code === 1)
        common.ifCategoryMakeFileRequired = res.content[0].fieldValue === 'true'
    })
  }

  /**
   * 检查邮箱和手机号码
   */
  const checkEmailMobile = (data) => {
    // 验证邮箱
    if (common.ifNeedEmail === true) {
      if (data.email === '') {
        showToast('请输入邮箱')
        return false
      }
      else if (!validEmail(data.email)) {
        showToast('邮箱格式不正确')
        return false
      }
    }
    else {
      if (data.email) {
        if (!validEmail(data.email)) {
          showToast('邮箱格式不正确')
          return false
        }
        else {
          return true
        }
      }
    }
    // 手机号验证
    if (common.ifNeedMobile === true) {
      if (data.mobile === '') {
        showToast('请输入手机号码')
        return false
      }
      else if (!validMobile(data.mobile)) {
        showToast('手机号码格式不正确')
        return false
      }
      else {
        return true
      }
    }
    else {
      if (data.mobile) {
        if (!validMobile(data.mobile)) {
          showToast('手机号码格式不正确')
          return false
        }
        else {
          return true
        }
      }
    }
    return true
  }

  return {
    common,
    getInvoiceRemark,
    ifNeedMobileEmail,
    checkEmailMobile,
    ifCategoryMakeFileRequired,
  }
}
