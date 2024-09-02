<script setup lang='ts'>
import { closeToast, showConfirmDialog, showLoadingToast, showToast } from 'vant'
import makeMixins from '../mixins/make'
import make from '@/api/make'
import outOrder from '@/api/out-order'
import { localStorage } from '@/utils/local-storage'
import { useStore } from '@/stores'

const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile } = makeMixins()
const store = useStore()
const router = useRouter()
const route = useRoute()

const state = reactive({
  taxNumber: '',
  isShow: false,
  isHide: true,
  amountOfMoney: '0',
  productList: [], // 商品列表
  address: {},
  outOrder: {
    outOrderId: '',
    price: 0,
  },
  contentList: '',
  outOrderNo: '',
  accessToken: '',
  showDisabled: true,
  selected: '1',
  company: {
    companyId: '',
  },
  itemIds: '',
  sum: 0,
  item: {},
  mergeTax: 0,
  howMany: '',
  returnUrl: '',
  invoiceForm: {
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
    outOrderIds: '',
    companyId: '',
  },
})

function getOutOrder() {
  const outOrderNo = state.outOrderNo
  const params = {
    accessToken: state.accessToken,
    taxNumber: state.taxNumber,
    state: 0,
    no: outOrderNo,
  }
  outOrder.getOutOrderList(params).then((res) => {
    if (res.code === 1) {
      router.push({
        path: '/invoice/detail',
        query: { id: res.content.invoice.invoiceId },
      })
    }
    state.outOrder = res.content[0]
    calculatedAmount()
  })
}

function receiveCompany(val) {
  state.company = val
}

function receiveCategory(category) {
  state.invoiceForm.category = category
}

/**
 * 开具发票
 */
function makeInvoice() {
  if (state.invoiceForm.type === '个人') {
    if (state.invoiceForm.purchaserName === '')
      return showToast('请输入发票抬头')
  }
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
    state.invoiceForm.outOrderIds = state.outOrder.outOrderId
    state.invoiceForm.companyId = state.company.companyId
    make.mergeMakeInvoice(state.invoiceForm).then((res) => {
      closeToast()
      if (res.code === 1) {
        router.push({
          path: '/single-order-success',
          query: { returnUrl: state.returnUrl },
        })
      }
      else {
        showToast(res.message)
      }
    })
  })
}

/**  计算发票金额 */
function calculatedAmount() {
  if (state.outOrder !== null)
    state.amountOfMoney = state.outOrder.price.toFixed(2)
}

/** 删除商品 */
function deleteProduct(id) {
  for (let i = 0; i < state.productList.length; i++) {
    if (id === state.productList[i].productId)
      state.productList.splice(i, 1)
  }
  state.invoiceForm.price = 0
  calculatedAmount()
}

onMounted(() => {
  if (route.query.accessToken) {
    localStorage.set('accessToken', route.query.accessToken)
    state.accessToken = localStorage.get('accessToken')
  }
  else if (state.accessToken === '') {
    showToast('accessToken不能为空！')
  }
  if (route.query.outOrderNo) {
    localStorage.set('outOrderNo', route.query.outOrderNo)
    state.outOrderNo = localStorage.get('outOrderNo')
  }
  else if (state.outOrderNo === '') {
    showToast('outOrderNo不能为空！')
  }
  if (route.query.returnUrl) {
    localStorage.set('returnUrl', route.query.returnUrl)
    state.accessToken = localStorage.get('returnUrl')
  }
  else if (state.returnUrl === '') {
    showToast('returnUrl不能为空！')
  }
  state.accessToken = localStorage.get('accessToken')
  state.taxNumber = localStorage.get('taxNumber')
  state.outOrderNo = localStorage.get('outOrderNo')
  state.invoiceForm.type = localStorage.get('type')
  if (state.invoiceForm.type)
    state.invoiceForm.type = localStorage.get('type')
  else
    state.invoiceForm.type = '企业'

  getOutOrder()
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

    <div class="invoice-contents">
      <p class="contents-title">
        发票内容
      </p>
      <div class="contents-product">
        <ul class="product-head">
          <li style="width: 35%">
            商品名称
          </li>
          <li style="width: 35%">
            规格型号
          </li>
          <li>单位</li>
          <li>数量</li>
          <li>单价</li>
          <li>操作</li>
        </ul>
        <van-cell class="line" />
        <ul v-for="(product, index) in state.productList" :key="index" class="contents-content">
          <li style="width: 35%; line-height: 15px; padding-top: 12px">
            {{ product.name }}
          </li>
          <li style="width: 35%; line-height: 15px; padding-top: 12px">
            {{ product.specification }}
          </li>
          <li>{{ product.unit }}</li>
          <li>{{ product.number }}</li>
          <li>{{ product.price }}</li>
          <li style="color: #1989fa" @click="deleteProduct(product.productId)">
            删除
          </li>
        </ul>
        <van-cell class="line" />
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
      </div>
    </div>

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

<style lang='less'>
@import '../make.less';
</style>
