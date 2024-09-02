<script setup lang="ts">
import { closeToast, showConfirmDialog, showLoadingToast, showToast } from 'vant'
import makeMixins from '../mixins/make'
import make from '@/api/make'
import { localStorage } from '@/utils/local-storage'
import { useStore } from '@/stores'

const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile } = makeMixins()
const store = useStore()
const router = useRouter()

const state = reactive({
  isShow: false,
  isHide: true,
  orderType: '',
  company: {
    companyId: '',
  },
  address: {},
  outOrderIds: '',
  invoiceForm: {
    outOrderNo: `H5${new Date().getTime()}`,
    type: '企业',
    category: '增值税电子普通发票',
    purchaserName: '',
    purchaserTaxpayerNumber: '',
    purchaserAddress: '',
    purchaserPhone: '',
    purchaserBank: '',
    purchaserBankAccount: '',
    mobile: '',
    email: '',
    remark: '',
    price: 0.0,
    companyId: '',
    outOrderIds: '',
  },
  seletedOutOrderList: [],
})

function getOrder() {
  state.orderType = localStorage.get('orderType') ? localStorage.get('orderType') : ''
  state.invoiceForm.price = localStorage.get('tot') ? localStorage.get('tot') : 0.0
  state.seletedOutOrderList = []
  if (localStorage.get('seleted'))
    state.seletedOutOrderList = localStorage.get('seleted')

  for (let i = 0; i < state.seletedOutOrderList.length; i++) {
    state.outOrderIds += `${state.seletedOutOrderList[i].outOrderId},`
    state.invoiceForm.outOrderIds = state.outOrderIds
  }
}

function receiveCategory(category) {
  state.invoiceForm.category = category
}

/**
 * 提交开票信息
 */
function makeInvoice() {
  if (state.invoiceForm.type === '个人' && state.invoiceForm.purchaserName === '')
    return showToast('请输入发票抬头')

  if (!checkEmailMobile(state.invoiceForm))
    return

  showConfirmDialog({
    title: '提示',
    message: '确认抬头和金额正确并申请开票吗？',
  }).then(() => {
    showLoadingToast({
      message: '开票中...',
      forbidClick: true,
      duration: 0,
    })
    state.invoiceForm.companyId = state.company.companyId
    make.mergeMakeInvoice(state.invoiceForm).then((res) => {
      closeToast()
      if (res.code === 1) {
        router.push({
          path: '/make/success',
        })
      }
      else {
        showToast(res.message)
      }
    })
  }).catch(() => {})
}

function receiveCompany(val) {
  state.company = val
}

onMounted(() => {
  if (localStorage.get('type'))
    state.invoiceForm.type = localStorage.get('type')

  getOrder()
  getInvoiceRemark()
  ifNeedMobileEmail()
})
</script>

<template>
  <Header v-if="store.ifShowH5NavBar" header-title="开具电子发票" />
  <div class="make-invoice">
    <Invoice
      :is-show="state.isShow"
      :is-hide="state.isHide"
      :invoice-form="state.invoiceForm"
      :company="state.company"
      @get-company="receiveCompany"
      @get-invoice-category="receiveCategory"
    />

    <van-cell-group title="发票内容" inset>
      <van-field v-model="state.orderType" label="发票内容" readonly />
      <van-field
        v-model="state.invoiceForm.price"
        class="merge-order_price"
        label="发票金额"
        readonly
      />
      <van-field
        v-model="state.invoiceForm.remark"
        label="发票备注"
        :placeholder="common.remarkPlaceholder"
      />
    </van-cell-group>

    <Receive
      :invoice-form="state.invoiceForm"
      :if-need-email="common.ifNeedEmail"
      :if-need-mobile="common.ifNeedMobile"
      :address="state.address"
    />

    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="makeInvoice">
        提交
      </van-button>
    </div>
  </div>
</template>

<style lang="less">
@import '../make.less';
</style>
