<script setup lang="ts">
import customCategory from '@/api/custom-category'
import make from '@/api/make'
import qiniu from '@/api/qiniu'
import TripPeople from '@/components/make/TripPeople.vue'
import { useStore } from '@/stores'
import { localStorage } from '@/utils/local-storage'
import { validPrice } from '@/utils/validate'
import { closeToast, showConfirmDialog, showLoadingToast, showToast } from 'vant'
import makeMixins from '../mixins/make'

const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile, ifCategoryMakeFileRequired } = makeMixins()
const store = useStore()
const router = useRouter()
const route = useRoute()

const tripPeopleInfo = ref(null)
const state = reactive({
  showCustomCategory: false,
  keyboardShow: false,
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
    specificBusiness: [],
    specificBusinessCode: '',
  },
  init: false,
  tripData: null,
})

function getToken() {
  qiniu.getQiniuToken().then((res) => {
    state.qnToken = res.content.uploadToken
  })
}

function getKey() {
  qiniu.getQiniuKey().then((res) => {
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
  qiniu.qiniuUpload(data)
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
  customCategory.getCustomCategoryList(params).then((res) => {
    if (res.code === 1) {
      state.customCategoryList = res.content
      state.customCategoryList.forEach((item) => {
        state.invoiceForm.specificBusinessCode = item.specificBusinessCode
        item.text = item.name
        item.value = item.customCategoryId
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
  if (state.invoiceForm.specificBusinessCode === '09') {
    state.tripData.forEach((item) => {
      if (item.travelDateFormatter) {
        item.tripPeopleForm.travelDate = `${item.travelDateFormatter[0]}-${item.travelDateFormatter[1]}-${item.travelDateFormatter[2]}`
      }
      state.invoiceForm.specificBusiness.push(item.tripPeopleForm)
    })
  }
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
      if (state.fieldValue.length > 0) {
        state.invoiceForm.extends.push({
          fieldKey: 'attch',
          fieldName: '附件',
          fieldValue: state.fieldValue.toString(),
        })
      }
      make.categoryMakeInvoice(state.invoiceForm).then((res) => {
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

function getTripPeople(data) {
  state.tripData = data
}
onMounted(async () => {
  if (route.query.accessToken)
    localStorage.set('accessToken', route.query.accessToken)

  if (route.query.taxNumber)
    localStorage.set('taxNumber', route.query.taxNumber)

  if (localStorage.get('type'))
    state.invoiceForm.type = localStorage.get('type')

  state.init = true
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
      v-if="state.init"
      :is-show="state.isShow"
      :is-hide="state.isHide"
      :invoice-form="state.invoiceForm"
      :company="state.company"
      @get-company="receiveCompany"
      @get-invoice-category="receiveCategory"
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
      <van-cell title="附件" label="可上传最多5张" :required="common.ifCategoryMakeFileRequired">
        <van-uploader
          v-model="state.imageList"
          :max-count="5"
          :data="{ key: state.qnKey, token: state.qnToken }"
          :after-read="onAfterRead"
          :before-delete="deleteFieldValue"
        />
      </van-cell>
    </van-cell-group>
    <TripPeople v-if="state.invoiceForm.specificBusinessCode === '09' " ref="tripPeopleInfo" @get-trip-people="getTripPeople" />
    <Receive
      v-if="state.init"
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
