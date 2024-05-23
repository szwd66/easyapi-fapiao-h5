<script setup lang="ts">
import { closeToast, showConfirmDialog, showLoadingToast, showToast } from 'vant'
import makeMixins from '../mixins/make'
import { getQiniuKeyApi, getQiniuTokenApi, qiniuUploadApi } from '@/api/qiniu'
import { getCustomCategoryListApi } from '@/api/custom-category'
import { categoryMakeInvoiceApi } from '@/api/make'
import { validPrice } from '@/utils/validate'
import { localStorage } from '@/utils/local-storage'
import { useStore } from '@/stores'

const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile, ifCategoryMakeFileRequired } = makeMixins()
const store = useStore()
const router = useRouter()
const route = useRoute()

const state = reactive({
  showCustomCategory: false,
  keyboardShow: false,
  ifElectronic: localStorage.get('ifElectronic'),
  ifPaper: localStorage.get('ifPaper'),
  isShow: false,
  isHide: true,
  qnKey: '',
  qnToken: '',
  company: {
    companyId: null,
  },
  address: {},
  customCategoryList: [], // 自定义分类列表
  // 选中的自定义分类
  customCategory: {
    customCategoryId: null,
    name: '',
  },
  imageList: [],
  fieldValue: [],
  invoiceForm: {
    outOrderNo: `H5${new Date().getTime()}`,
    category: '增值税电子普通发票',
    type: '企业',
    purchaserName: '',
    purchaserTaxpayerNumber: '',
    purchaserAddress: '',
    purchaserPhone: '',
    purchaserBank: '',
    purchaserBankAccount: '',
    price: null,
    mobile: '',
    email: '',
    remark: '',
    extends: [],
    customCategoryId: null,
    companyId: null,
  },
})

function getToken() {
  getQiniuTokenApi().then((res) => {
    state.qnToken = res.content.uploadToken
  })
}

function getKey() {
  getQiniuKeyApi().then((res) => {
    state.qnKey = res.content.key
  })
}

function onAfterRead(file) {
  uploadImgToQiniu(state.qnToken, state.qnKey, file)
}

/**
 * 上传图片到七牛
 */
function uploadImgToQiniu(qnToken, qnKey, file) {
  const data = new FormData()
  // 七牛需要的token，后台获取
  data.append('token', qnToken)
  data.append('key', qnKey)
  data.append('file', file.file)
  qiniuUploadApi(data)
    .then((res: any) => {
      state.fieldValue.push(`https://qiniu.easyapi.com/${res.key}`)
      // 上传成功后，重新更新七牛参数
      getToken()
      getKey()
    })
    .catch(() => {
      showToast('上传失败')
      const idx = state.imageList.findIndex((item) => {
        return item === file
      })
      state.imageList.splice(idx, 1)
    })
}

function deleteFieldValue(file, { index }) {
  state.fieldValue.splice(index, 1)
  return true
}

/**
 * 获取自定义发票分类
 */
function getCustomCategoryList() {
  const params = {
    size: 1000,
  }
  getCustomCategoryListApi(params).then((res) => {
    if (res.code === 1) {
      state.customCategoryList = res.content
      state.customCategoryList.forEach((item) => {
        item.text = item.name
        if (item.ifDefault) {
          state.customCategory.customCategoryId = item.customCategoryId
          state.customCategory.name = item.name
        }
      })
    }
  })
}

/**
 * 开具发票
 */
function makeInvoice() {
  if (state.invoiceForm.type === '个人' && state.invoiceForm.purchaserName === '')
    return showToast('请输入发票抬头')

  if (state.customCategory === null || state.customCategory.customCategoryId === null)
    return showToast('请选择发票类别')

  if (state.invoiceForm.price === null || state.invoiceForm.price <= 0)
    return showToast('请输入开票金额')
  else if (!validPrice(state.invoiceForm.price))
    return showToast('请输入合法开票金额，最多2位小数')

  if (common.ifCategoryMakeFileRequired && state.fieldValue.length === 0)
    return showToast('附件一栏请上传付款记录凭证')

  if (!checkEmailMobile(state.invoiceForm))
    return

  showConfirmDialog({
    title: '提示',
    message: '确认抬头和金额正确并申请开票吗？',
  })
    .then(() => {
      showLoadingToast({
        message: '开票中...',
        forbidClick: true,
        duration: 0,
      })
      state.invoiceForm.customCategoryId = state.customCategory.customCategoryId
      state.invoiceForm.companyId = state.company.companyId
      state.invoiceForm.extends.push({
        fieldKey: 'attch',
        fieldName: '附件',
        fieldValue: state.fieldValue.toString(),
      })
      categoryMakeInvoiceApi(state.invoiceForm).then((res) => {
        closeToast()
        if (res.code === 1)
          router.push({ path: '/make/success' })
        else
          showToast(res.message)
      })
    })
}

function receiveCompany(val) {
  state.company = val
}

function receiveCategory(val) {
  state.invoiceForm.category = val
}

/**
 * 选择自定义分类
 */
function onConfirm(value) {
  state.customCategory.customCategoryId = value.selectedOptions[0].customCategoryId
  state.customCategory.name = value.selectedOptions[0].name
  state.showCustomCategory = false
}

onMounted(() => {
  if (route.query.accessToken)
    localStorage.set('accessToken', route.query.accessToken)

  if (route.query.taxNumber)
    localStorage.set('taxNumber', route.query.taxNumber)

  if (localStorage.get('type'))
    state.invoiceForm.type = localStorage.get('type')

  getCustomCategoryList()
  getToken()
  getKey()
  getInvoiceRemark()
  ifNeedMobileEmail()
  ifCategoryMakeFileRequired()
})
</script>

<template>
  <Header v-if="store.ifShowH5NavBar" header-title="开具电子发票" />
  <div class="make-invoice">
    <Invoice
      :is-show="state.isShow"
      :is-hide="state.isHide"
      :if-electronic="state.ifElectronic"
      :invoice-form="state.invoiceForm"
      :if-paper="state.ifPaper"
      :company="state.company"
      @getCompany="receiveCompany"
      @getInvoiceCategory="receiveCategory"
    />

    <van-cell-group title="发票内容" inset>
      <van-field
        v-model="state.customCategory.name"
        readonly
        clickable
        label="发票类别"
        placeholder="选择发票类别"
        required
        @click="state.showCustomCategory = true"
      />
      <van-popup v-model:show="state.showCustomCategory" round position="bottom">
        <van-picker
          show-toolbar
          :columns="state.customCategoryList"
          value-key="name"
          @cancel="state.showCustomCategory = false"
          @confirm="onConfirm"
        />
      </van-popup>

      <van-field
        v-model="state.invoiceForm.price"
        class="merge-order_price"
        readonly
        clickable
        label="发票金额"
        placeholder="请准确输入开票金额"
        required
        @touchstart.stop="state.keyboardShow = true"
      />
      <van-number-keyboard
        v-model="state.invoiceForm.price"
        :show="state.keyboardShow"
        theme="custom"
        extra-key="."
        close-button-text="完成"
        @blur="state.keyboardShow = false"
      />
      <van-field
        v-model="state.invoiceForm.remark"
        label="发票备注"
        :placeholder="common.remarkPlaceholder"
      />
      <van-cell title="附件" label="可上传最多3张" :required="common.ifCategoryMakeFileRequired">
        <van-uploader
          v-model="state.imageList"
          :max-count="3"
          :data="{ key: state.qnKey, token: state.qnToken }"
          :after-read="onAfterRead"
          :before-delete="deleteFieldValue"
        />
      </van-cell>
    </van-cell-group>

    <Receive
      :if-electronic="state.ifElectronic"
      :invoice-form="state.invoiceForm"
      :if-need-email="common.ifNeedEmail"
      :if-need-mobile="common.ifNeedMobile"
      :address="state.address"
    />

    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="makeInvoice">
        申请开票
      </van-button>
    </div>
  </div>
</template>

<style lang="less">
@import '../make.less';
</style>
