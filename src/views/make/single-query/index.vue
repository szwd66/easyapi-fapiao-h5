<template>
  <Header headerTitle="开具电子发票" v-if="store.ifShowH5NavBar" />
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
    />

    <div class="invoice-contents">
      <p class="contents-title">发票内容</p>
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
              @click="showDetail('商品类别')"
              style="margin-left: 5px"
            >
              商品类别
            </van-tag>
          </template>
        </van-field>
        <ul class="product-head">
          <li style="width: 35%">商品名称</li>
          <li style="width: 35%">规格型号</li>
          <li>单位</li>
          <li>数量</li>
          <li>单价</li>
        </ul>
        <van-cell class="line" />
        <ul class="product-content" v-for="(item, index) in state.outOrder.items" :key="index">
          <li style="width: 35%; line-height: 15px; padding-top: 12px">
            {{ item.name }}
          </li>
          <li style="width: 35%; line-height: 15px; padding-top: 12px">{{ item.model }}</li>
          <li>{{ item.unit }}</li>
          <li>{{ item.number }}</li>
          <li>{{ item.price }}</li>
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
    />

    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="makeInvoice">提交</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getStateApi, queryShopOrderApi } from '@/api/query';
import { makeInvoiceApi } from '@/api/make';
import { getShopApi } from '@/api/shop';
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant';
import { localStorage } from '@/utils/local-storage';
import makeMixins from '../mixins/make';
const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile } = makeMixins();
import { useStore } from '@/stores';
const store = useStore();
const router = useRouter();
const route = useRoute();

const state = reactive({
  isHide: true,
  isShow: false,
  ifElectronic: localStorage.get('ifElectronic'),
  ifPaper: localStorage.get('ifPaper'),
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
  outOrderNo: '', //商户外部订单号
  address: {},
  company: {
    companyId: '',
  },
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
    outOrderNo: '',
    items: [],
    companyId: '',
  },
});

const showDetail = name => {
  state.active = name;
};

const getShopOrder = () => {
  getStateApi(state.outOrderNo).then(res => {
    if (res.code === 1) {
      router.replace({
        path: '/invoice/detail',
        query: { id: res.content[0].invoiceId },
      });
    }
  });
  queryShopOrderApi(state.outOrderNo).then(res => {
    if (res.code === 1) {
      state.outOrder = res.content;
      state.invoiceForm.price = res.content.price;
    }
  });
};

const receiveCompany = val => {
  state.company = val;
};

const makeInvoice = () => {
  if (state.invoiceForm.type === '个人' && state.invoiceForm.purchaserName === '') {
    return showToast('请输入发票抬头');
  }
  if (state.invoiceForm.type === '企业') {
    if (
      state.invoiceForm.purchaserName === '' ||
      state.invoiceForm.purchaserTaxpayerNumber === ''
    ) {
      return showToast('企业发票抬头未选择');
    }
  }
  checkEmailMobile(state.invoiceForm);
  if (!common.ifCheckEmailMobile) {
    return;
  }
  showConfirmDialog({
    title: '提示',
    message: '确认抬头正确并开票吗',
  }).then(() => {
    showLoadingToast({
      message: '开票中...',
      forbidClick: true,
      duration: 0,
    });
    state.invoiceForm.category = '增值税电子普通发票';
    state.invoiceForm.property = '电子';
    state.invoiceForm.outOrderNo = state.outOrder.outOrderNo;
    state.invoiceForm.items = state.outOrder.items;
    state.invoiceForm.companyId = state.company.companyId;
    makeInvoiceApi(state.invoiceForm).then(res => {
      closeToast();
      if (res.code === 1) {
        router.go(0);
      } else {
        showToast(res.message);
      }
    });
  });
};

/**
 * 获取发票类型
 */
const getShop = () => {
  getShopApi().then(res => {
    if (res.code === 1) {
      localStorage.set('ifElectronic', res.content.ifElectronic);
      localStorage.set('ifPaper', res.content.ifPaper);
    }
  });
};

onMounted(() => {
  if (route.query.accessToken) {
    localStorage.set('accessToken', route.query.accessToken);
  }
  getShop();
  if (route.query.taxNumber) {
    localStorage.set('taxNumber', route.query.taxNumber);
  }
  if (localStorage.get('type')) {
    state.invoiceForm.type = localStorage.get('type');
  }
  if (route.query.outOrderNo) {
    localStorage.set('outOrderNo', route.query.outOrderNo);
    state.outOrderNo = localStorage.get('outOrderNo');
  } else if (state.outOrderNo === '') {
    showToast('outOrderNo不能为空！');
  }
  state.outOrderNo = localStorage.get('outOrderNo');
  getShopOrder();
  getInvoiceRemark();
  ifNeedMobileEmail();
});
</script>

<style lang="less">
@import '../make.less';
</style>
