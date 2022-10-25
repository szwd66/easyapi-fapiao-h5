<template>
  <Header headerTitle="开具电子发票" v-if="store.ifShowH5NavBar"></Header>
  <div class="make-invoice">
    <Invoice
      :isShow="state.isShow"
      :isHide="state.isHide"
      :ifElectronic="state.ifElectronic"
      :invoiceForm="state.invoiceForm"
      :ifPaper="state.ifPaper"
      :company="state.company"
      @getCompany="receiveCompany"
      @getInvoiceCategory="receiveCategory"
      @getInvoiceProperty="receiveProperty"
    ></Invoice>

    <div class="invoice-contents">
      <p class="contents-title">发票内容</p>
      <div class="contents-product">
        <ul class="product-head">
          <li style="width: 35%">商品名称</li>
          <li style="width: 35%">规格型号</li>
          <li>单位</li>
          <li>数量</li>
          <li>单价</li>
          <li>操作</li>
        </ul>
        <van-cell class="line" />
        <ul class="contents-content" v-for="(product, index) in state.productList" :key="index">
          <li style="width: 35%; line-height: 15px; padding-top: 12px">
            {{ product.name }}
          </li>
          <li style="width: 35%; line-height: 15px; padding-top: 12px">
            {{ product.specification }}
          </li>
          <li>{{ product.unit }}</li>
          <li>{{ product.number }}</li>
          <li>{{ product.price }}</li>
          <li style="color: #1989fa" @click="deleteProduct(product.productId)">删除</li>
        </ul>
        <van-cell class="line" />
        <van-field
          class="merge-order_price"
          label="发票金额"
          v-model="state.invoiceForm.price"
          readonly
        ></van-field>
        <van-field
          label="发票备注"
          :placeholder="common.remarkPlaceholder"
          v-model="state.invoiceForm.remark"
        ></van-field>
      </div>
    </div>

    <Receive
      :ifElectronic="state.ifElectronic"
      :invoiceForm="state.invoiceForm"
      :ifNeedEmail="common.ifNeedEmail"
      :ifNeedMobile="common.ifNeedMobile"
      :address="state.address"
    ></Receive>

    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="makeInvoice">提交</van-button>
    </div>
    <!-- <div>
      <router-view @seletedOrder="seletedOrder"></router-view>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { mergeMakeInvoiceApi } from '@/api/make';
import { getOutOrderListApi } from '@/api/out-order';
import { Invoice, Receive, Header } from '@/components';
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant';
import makeMixins from '../mixins/make';
import { localStorage } from '@/utils/local-storage';
const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile } = makeMixins();
import { useStore } from '@/stores';
const store = useStore();
const router = useRouter();
const route = useRoute();

const state = reactive({
  taxNumber: '',
  ifElectronic: localStorage.get('ifElectronic'),
  ifPaper: localStorage.get('ifPaper'),
  isShow: false,
  isHide: true,
  amountOfMoney: 0,
  productList: '', //商品列表
  address: {},
  outOrder: {
    outOrderId: '',
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
    property: localStorage.get('ifElectronic') ? '电子' : '纸质',
    purchaserName: '',
    purchaserTaxpayerNumber: '',
    purchaserAddress: '',
    purchaserPhone: '',
    purchaserBank: '',
    purchaserBankAccount: '',
    addrMobile: '',
    email: '',
    remark: '',
    price: 0.0,
    outOrderIds: '',
    companyId: '',
  },
});

const seletedOrder = item => {
  state.company = item;
};

const getOutOrder = () => {
  let outOrderNo = state.outOrderNo;
  let params = {
    accessToken: state.accessToken,
    taxNumber: state.taxNumber,
    state: 0,
    no: outOrderNo,
  };
  getOutOrderListApi(params).then(res => {
    if (res.code === 1) {
      router.push({
        path: '/invoice/detail',
        query: { id: res.content.invoice.invoiceId },
      });
    }
    state.outOrder = res.content[0];
    calculatedAmount();
  });
};

const receiveCompany = val => {
  state.company = val;
};

const makeInvoice = () => {
  if (state.invoiceForm.type === '个人') {
    if (state.invoiceForm.purchaserName === '') {
      return showToast('请输入发票抬头');
    }
  }
  checkEmailMobile(state.invoiceForm);
  if (!common.ifCheckEmailMobile) {
    return;
  }
  showConfirmDialog({
    title: '提示',
    message: '确认抬头和金额正确并申请开票吗？',
  }).then(() => {
    showLoadingToast({
      message: '开票中...',
      forbidClick: true,
      duration: 0,
    });
    state.invoiceForm.category = '增值税电子普通发票';
    state.invoiceForm.property = '电子';
    state.invoiceForm.outOrderIds = state.outOrder.outOrderId;
    state.invoiceForm.companyId = state.company.companyId;
    mergeMakeInvoiceApi(state.invoiceForm).then(res => {
      closeToast();
      if (res.code === 1) {
        router.push({
          path: '/single-order-success',
          query: { returnUrl: state.returnUrl },
        });
      } else {
        showToast(res.message);
      }
    });
  });
};

/**  计算发票金额 */
const calculatedAmount = () => {
  if (state.outOrder !== null) {
    state.amountOfMoney = state.outOrder.price.toFixed(2);
  }
};

/** 删除商品 */
const deleteProduct = id => {
  for (let i = 0; i < state.productList.length; i++) {
    if (id === state.productList[i].productId) {
      state.productList.splice(i, 1);
    }
    localStorage.set('productList', JSON.stringify(state.productList));
    state.productList = JSON.parse(localStorage.get('productList'));
  }
  state.invoiceForm.price = 0;
  calculatedAmount();
};

onMounted(() => {
  if (route.query.accessToken) {
    localStorage.set('accessToken', route.query.accessToken);
    state.accessToken = localStorage.get('accessToken');
  } else if (state.accessToken === '') {
    showToast('accessToken不能为空！');
  }
  if (route.query.outOrderNo) {
    localStorage.set('outOrderNo', route.query.outOrderNo);
    state.outOrderNo = localStorage.get('outOrderNo');
  } else if (state.outOrderNo === '') {
    showToast('outOrderNo不能为空！');
  }
  if (route.query.returnUrl) {
    localStorage.set('returnUrl', route.query.returnUrl);
    state.accessToken = localStorage.get('returnUrl');
  } else if (state.returnUrl === '') {
    showToast('returnUrl不能为空！');
  }
  state.accessToken = localStorage.get('accessToken');
  state.taxNumber = localStorage.get('taxNumber');
  state.outOrderNo = localStorage.get('outOrderNo');
  state.invoiceForm.type = localStorage.get('type');
  if (state.invoiceForm.type) {
    state.invoiceForm.type = localStorage.get('type');
  } else {
    state.invoiceForm.type = '企业';
  }
  getOutOrder();
  getInvoiceRemark();
  ifNeedMobileEmail();
});
</script>

<style lang="less">
@import '../make.less';
</style>
