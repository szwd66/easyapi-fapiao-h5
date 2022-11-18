/**
 * 开票页Mixin
 */
import { findSettingApi } from '@/api/setting';
import { showToast } from 'vant';
import { validEmail, validMobile } from '@/utils/validate';
import { reactive } from 'vue';

export default function () {
  const common = reactive({
    remarkPlaceholder: '可输入发票备注信息', //发票备注填写说明
    ifNeedMobile: false, //手机号码是否必填
    ifNeedEmail: false, //邮箱是否必填
    // ifCheckEmailMobile: true, //邮箱和手机是否效验通过
  });

  /**
   * 获取发票备注填写说明
   */
  const getInvoiceRemark = () => {
    findSettingApi({ fieldKeys: 'make-placeholder-remark' }).then(res => {
      if (res.code === 1) {
        common.remarkPlaceholder = res.content[0].fieldValue;
      }
    });
  };

  /**
   * 获取手机和邮箱是否必填
   */
  const ifNeedMobileEmail = () => {
    let params = {
      fieldKeys: 'if_need_mobile' + ',' + 'if_need_email',
    };
    findSettingApi(params).then(res => {
      if (res.code === 1) {
        for (let setting of res.content) {
          if (setting.fieldKey === 'if_need_mobile') {
            common.ifNeedMobile = setting.fieldValue == 'true';
          } else if (setting.fieldKey === 'if_need_email') {
            common.ifNeedEmail = setting.fieldValue == 'true';
          }
        }
      }
    });
  };
  /**
   * 检查邮箱和手机号码
   */
  const checkEmailMobile = data => {
    //验证邮箱
    if (common.ifNeedEmail === true) {
      if (data.email === '') {
        showToast('请输入邮箱');
        return false;
      } else if (!validEmail(data.email)) {
        showToast('邮箱格式不正确');
        return false;
      }
    } else {
      if (data.email) {
        if (!validEmail(data.email)) {
          showToast('邮箱格式不正确');
          return false;
        }
      }
    }
    //手机号验证
    if (common.ifNeedMobile === true) {
      if (data.addrMobile === '') {
        showToast('请输入手机号码');
        return false;
      } else if (!validMobile(data.addrMobile)) {
        showToast('手机号码格式不正确');
        return false;
      } else {
        return true;
      }
    } else {
      if (data.addrMobile) {
        if (!validMobile(data.addrMobile)) {
          showToast('手机号码格式不正确');
          return false;
        } else {
          return true;
        }
      }
    }
  };

  return {
    common,
    getInvoiceRemark,
    ifNeedMobileEmail,
    checkEmailMobile,
  };
}
