<script setup lang="ts">
import { closeToast, showConfirmDialog, showLoadingToast, showToast } from 'vant'
import makeMixins from '../mixins/make'
import { getShortNameByTaxCodeApi, getStateApi, queryShopOrderApi } from '@/api/query'
import { makeInvoiceApi } from '@/api/make'
import { localStorage } from '@/utils/local-storage'
import { useStore } from '@/stores'

const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile } = makeMixins()
const store = useStore()
const router = useRouter()
const route = useRoute()

const state = reactive({
  isHide: true,
  isShow: false,
  active: '商品明细',
  list: [
    {
      name: '商品明细',
    },
    {
      name: '商品类别',
    },
  ],
  outOrder: {
    outOrderNo: '',
    items: [],
  },
  taxNumbers: [],
  outOrderNo: '', // 商户外部订单号
  address: {},
  company: {
    companyId: '',
  },
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
    outOrderNo: '',
    items: [],
    companyId: '',
  },
})

function showDetail(name) {
  state.active = name
}

/**
 * 获取发票状态
 */
function getShopOrder() {
  getStateApi(state.outOrderNo).then((res) => {
    if (res.code === 1) {
      router.replace({
        path: '/invoice/detail',
        query: { id: res.content[0].invoiceId },
      })
    }
  })
  queryShopOrderApi(state.outOrderNo).then((res) => {
    if (res.code === 1) {
      state.outOrder = res.content
      state.invoiceForm.price = res.content.price
      getShortNameByTaxCode()
    }
  })
}

function getShortNameByTaxCode() {
  const nos = []
  state.outOrder.items.forEach((item) => {
    nos.push(item.no)
  })
  const data = {
    nos,
    accessToken: localStorage.get('accessToken'),
  }
  getShortNameByTaxCodeApi(data).then((res) => {
    if (res.code === 1) {
      state.taxNumbers = res.data.content
      state.outOrder.items.forEach((item) => {
        res.data.content.forEach((citem) => {
          if (item.no === citem.no)
            item.shortName = citem.shortName
        })
      })
    }
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
  if (state.invoiceForm.type === '个人' && state.invoiceForm.purchaserName === '')
    return showToast('请输入发票抬头')

  if (state.invoiceForm.type === '企业') {
    if (
      state.invoiceForm.purchaserName === ''
      || state.invoiceForm.purchaserTaxpayerNumber === ''
    )
      return showToast('企业发票抬头未选择')
  }
  if (!checkEmailMobile(state.invoiceForm))
    return

  showConfirmDialog({
    title: '提示',
    message: '确认抬头正确并开票吗',
  })
    .then(() => {
      showLoadingToast({
        message: '开票中...',
        forbidClick: true,
        duration: 0,
      })
      state.invoiceForm.outOrderNo = state.outOrder.outOrderNo
      const items = JSON.parse(JSON.stringify(state.outOrder.items))
      items.forEach((item) => {
        if (state.active === '商品类别')
          item.name = item.shortName
      })
      state.invoiceForm.items = items
      state.invoiceForm.companyId = state.company.companyId
      makeInvoiceApi(state.invoiceForm).then((res) => {
        closeToast()
        if (res.code === 1)
          router.go(0)
        else
          showToast(res.message)
      })
    })
}

onMounted(() => {
  if (route.query.accessToken)
    localStorage.set('accessToken', route.query.accessToken)
  if (route.query.taxNumber)
    localStorage.set('taxNumber', route.query.taxNumber)

  if (localStorage.get('type'))
    state.invoiceForm.type = localStorage.get('type')

  if (route.query.outOrderNo) {
    localStorage.set('outOrderNo', route.query.outOrderNo)
    state.outOrderNo = localStorage.get('outOrderNo')
  }
  else if (state.outOrderNo === '') {
    showToast('outOrderNo不能为空！')
  }
  state.outOrderNo = localStorage.get('outOrderNo')
  getShopOrder()
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
      @getCompany="receiveCompany"
      @getInvoiceCategory="receiveCategory"
    />

    <div class="invoice-contents">
      <p class="contents-title">
        发票内容
      </p>
      <div class="contents-product">
        <van-field name="rate" label="发票内容">
          <template #input>
            <van-tag
              type="primary"
              :plain="state.active !== '商品明细'"
              size="medium"
              @click="showDetail('商品明细')"
            >
              商品明细
            </van-tag>
            <van-tag
              type="primary"
              :plain="state.active !== '商品类别'"
              size="medium"
              style="margin-left: 5px"
              @click="showDetail('商品类别')"
            >
              商品类别
            </van-tag>
          </template>
        </van-field>
        <div v-if="state.outOrder.items && state.outOrder.items.length > 0">
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
          </ul>
          <van-cell class="line" />
          <ul v-for="(item, index) in state.outOrder.items" :key="index" class="product-content">
            <li style="width: 35%; line-height: 15px; padding-top: 12px; word-wrap: break-word">
              <span v-if="state.active === '商品明细'">{{ item.name }}</span>
              <span v-else>{{ item.shortName }}</span>
            </li>
            <li style="width: 35%; line-height: 15px; padding-top: 12px">
              {{ item.model }}
            </li>
            <li>{{ item.unit }}</li>
            <li>{{ item.number }}</li>
            <li>{{ item.price }}</li>
          </ul>
          <van-cell class="line" />
        </div>
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

<style lang="less">
@import '../make.less';
</style>
