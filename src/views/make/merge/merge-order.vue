<template>
  <div class="make-merge">
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

    <van-cell-group title="发票内容" inset>
      <van-field label="发票内容" v-model="state.orderType" readonly></van-field>
      <van-field
        class="merge-order_price"
        label="发票金额"
        v-model="state.invoiceForm.price"
        readonly
      ></van-field>
      <van-field
        label="发票备注"
        v-model="state.invoiceForm.remark"
        :placeholder="common.remarkPlaceholder"
      ></van-field>
    </van-cell-group>

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
  </div>
</template>

<script setup lang="ts">
import { mergeMakeInvoiceApi } from '@/api/make';
import { Invoice, Receive } from '@/components';
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant';
import makeMixins from '../mixins/make';
import { localStorage } from '@/utils/local-storage';
const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile } = makeMixins();

const router = useRouter();

const state = reactive({
  ifElectronic: localStorage.get('ifElectronic'),
  ifPaper: localStorage.get('ifPaper'),
  isShow: false,
  isHide: true,
  orderType: '',
  company: {
    companyId: '',
  },
  address: {},
  outOrderIds: '',
  invoiceForm: {
    outOrderNo: 'H5' + new Date().getTime(),
    type: '企业',
    category: '增值税电子普通发票',
    property: localStorage.get('ifElectronic') ? '纸质' : '电子',
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
    companyId: '',
    outOrderIds: '',
  },
  seletedOutOrderList: [],
});

const getOrder = () => {
  state.orderType = localStorage.get('orderType') ? localStorage.get('orderType') : '';
  state.invoiceForm.price = localStorage.get('tot') ? localStorage.get('tot') : 0.0;
  state.seletedOutOrderList = localStorage.get('seleted')
    ? JSON.parse(localStorage.get('seleted'))
    : [];
  for (let i = 0; i < state.seletedOutOrderList.length; i++) {
    state.outOrderIds += state.seletedOutOrderList[i].outOrderId + ',';
    state.invoiceForm.outOrderIds = state.outOrderIds;
    state.invoiceForm.category = '增值税电子普通发票';
    state.invoiceForm.property = localStorage.get('ifElectronic') ? '电子' : '纸质';
  }
};

/**
 * 提交开票信息
 */
const makeInvoice = () => {
  if (state.invoiceForm.type === '个人' && state.invoiceForm.purchaserName === '') {
    return showToast('请输入发票抬头');
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
    state.invoiceForm.companyId = state.company.companyId;
    mergeMakeInvoiceApi(state.invoiceForm).then(res => {
      closeToast();
      if (res.code === 1) {
        router.push({
          path: '/make/success',
        });
      } else {
        showToast(res.message);
      }
    });
  });
};

const receiveCompany = val => {
  state.company = val;
};

const changeElectronic = () => {
  state.invoiceForm.category = '增值税电子普通发票';
  state.invoiceForm.property = '电子';
};

const changePaper = () => {
  state.invoiceForm.property = '纸质';
  state.invoiceForm.category = '增值税普通发票';
};

onMounted(() => {
  if (localStorage.get('type')) {
    state.invoiceForm.type = localStorage.get('type');
  }
  getOrder();
  getInvoiceRemark();
  ifNeedMobileEmail();
});
</script>

<style lang="less">
.make-merge {
  .van-cell__value {
    min-width: 70%;
  }

  .merge-order_price .van-field__control {
    color: red;
  }
}
</style>
<style lang="less" scoped>
.make-merge {
  padding-bottom: 75px;

  .bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 10px 20px;

    .submit {
      border: none;
      height: 40px;
      border-radius: 5px;
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 2px;
      text-indent: 2px;
    }
  }
}
</style>
