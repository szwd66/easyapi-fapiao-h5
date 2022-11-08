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
          <li style="width: 30%">商品名称</li>
          <li style="width: 30%">规格型号</li>
          <li>单位</li>
          <li>数量</li>
          <li>单价</li>
          <li>操作</li>
        </ul>
        <van-cell class="line" />
        <ul class="product-content" v-for="(product, index) in state.productList" :key="index">
          <li style="width: 30%; line-height: 15px; padding-top: 12px">
            {{ product.name }}
          </li>
          <li style="width: 30%; line-height: 15px; padding-top: 12px">
            {{ product.specification }}
          </li>
          <li>{{ product.unit }}</li>
          <li>{{ product.number }}</li>
          <li>{{ product.price }}</li>
          <li style="color: #1989fa" @click="deleteProduct(product.productId)">删除</li>
        </ul>
        <van-cell class="line" />
        <div class="btn">
          <van-button class="submit-btn" @click="showProductSearchPopup">+添加发票内容</van-button>
        </div>
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

    <van-dialog />
    <van-popup
      class="popupClass"
      v-model:show="state.showPopup"
      position="bottom"
      style="height: 75%; padding-top: 4px"
    >
      <van-search
        v-model="state.productKeyword"
        placeholder="请输入搜索关键词"
        @input="onProductSearch"
      />
      <van-list :finished="true" finished-text="没有更多了">
        <van-cell v-for="item in state.productListAll" :key="item.productId">
          <van-row type="flex" align="center">
            <van-col span="6">
              <van-image width="60" height="60" :src="item.img" />
            </van-col>
            <van-col span="11">
              <div>{{ item.name }}</div>
              <div>
                {{ item.specification }}
              </div>
              <span>￥</span>
              <input
                style="width: 40px; text-align: center; border: none"
                v-model="item.price"
                @change="calcTotalPrice"
              />
              <span>元 / {{ item.unit }}</span>
            </van-col>
            <van-col span="7">
              <van-stepper
                v-model="item.number"
                integer
                min="0"
                default-value="0"
                @change="calcTotalPrice"
              />
            </van-col>
          </van-row>
        </van-cell>
      </van-list>
      <van-submit-bar
        :price="state.productPrice * 100"
        button-text="添加商品"
        @submit="appendProduct"
        button-color="#1989fa"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { getProductListApi } from '@/api/product';
import { productMakeInvoiceApi } from '@/api/make';
import { Invoice, Receive, Header } from '@/components';
import makeMixins from '../mixins/make';
import { localStorage } from '@/utils/local-storage';
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant';
const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile } = makeMixins();
import { useStore } from '@/stores';
const store = useStore();
const router = useRouter();

const state = reactive({
  loadingList: true,
  isShow: false,
  isHide: true,
  ifElectronic: localStorage.get('ifElectronic'),
  ifPaper: localStorage.get('ifPaper'),
  showPopup: false,
  productList: [], //商品列表
  company: {
    companyId: '',
  }, //公司抬头
  address: {}, //地址对象
  invoiceForm: {
    outOrderNo: 'H5' + new Date().getTime(),
    type: '企业',
    category: '增值税电子普通发票',
    property: localStorage.get('ifElectronic') ? '电子' : '纸质',
    purchaserName: '',
    purchaserTaxpayerNumber: '',
    purchaserAddress: '',
    purchaserPhone: '',
    purchaserBank: '',
    purchaserBankAccount: '',
    remark: '',
    addrMobile: '',
    email: '',
    companyId: null,
    products: [],
    addressId: null,
    price: 0.0,
  },
  productListAll: [],
  productKeyword: '', //商品服务搜索关键字
  productPrice: 0, //选择商品总价
});

/** 计算发票金额 */
const calcAmount = () => {
  let money = 0;
  if (state.productList !== null) {
    for (let i = 0; i < state.productList.length; i++) {
      money += state.productList[i].price * state.productList[i].number;
    }
    state.invoiceForm.price = money.toFixed(2);
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
  calcAmount();
};

/** 获取商品服务列表 */
const getProductList = params => {
  getProductListApi(params).then(res => {
    if (res.code === 1) {
      state.productListAll = res.content;
    }
  });
};

/** 追加商品服务 */
const appendProduct = () => {
  let obj = {};

  if (state.productListAll.filter(x => x.number > 0 && (!x.price || x.price == 0 || x.price < 0)).length > 0) {
    return showToast('请输入正确的商品金额');
  }

  for (let i = 0; i < state.productListAll.length; i++) {
    if (state.productListAll[i].number > 0) {
      obj = {
        productId: state.productListAll[i].productId,
        specification: state.productListAll[i].specification,
        unit: state.productListAll[i].unit,
        price: state.productListAll[i].price,
        name: state.productListAll[i].name,
        number: state.productListAll[i].number,
      };
      let oldList = localStorage.get('productList')
        ? JSON.parse(localStorage.get('productList'))
        : [];
      oldList.push(obj);
      localStorage.set('productList', JSON.stringify(oldList));
      state.productList = JSON.parse(localStorage.get('productList'));
    }
  }
  calcAmount();
  state.showPopup = false;
};

/** 显示选择商品弹框 */
const showProductSearchPopup = () => {
  state.productPrice = 0;
  state.showPopup = true;
  state.productKeyword = '';
  getProductList({});
};

/** 搜索商品 */
const onProductSearch = () => {
  getProductList({ name: state.productKeyword });
};

/** 计算追加商品总价 */
const calcTotalPrice = () => {
  let total = 0;
  if (state.productListAll !== null) {
    for (let i = 0; i < state.productListAll.length; i++) {
      total += state.productListAll[i].price * (state.productListAll[i].number || 0);
    }
    state.productPrice = total;
  }
};

const receiveCompany = val => {
  state.company = val;
};

const receiveCategory = val => {
  state.invoiceForm.category = val;
};

const receiveProperty = val => {
  state.invoiceForm.property = val;
};

const makeInvoice = () => {
  if (state.invoiceForm.type === '个人' && state.invoiceForm.purchaserName === '') {
    return showToast('请输入发票抬头');
  }
  if (state.productList === null) {
    return showToast('商品服务不能为空');
  }
  checkEmailMobile(state.invoiceForm);
  if (!common.ifCheckEmailMobile) {
    return;
  }
  showConfirmDialog({
    title: '提示',
    message: '确认抬头正确并开票吗？',
  })
    .then(() => {
      showLoadingToast({
        message: '开票中...',
        forbidClick: true,
        duration: 0,
      });
      state.invoiceForm.companyId = state.company.companyId;
      state.invoiceForm.products = state.productList;
      productMakeInvoiceApi(state.invoiceForm).then(res => {
        closeToast();
        if (res.code === 1) {
          router.push({ path: '/make/success' });
        } else {
          showToast(res.message);
        }
      });
      localStorage.remove('productList');
    })
    .catch(() => {});
};

onMounted(() => {
  state.productList = localStorage.get('productList')
    ? JSON.parse(localStorage.get('productList'))
    : [];
  if (localStorage.get('type')) {
    state.invoiceForm.type = localStorage.get('type');
  }
  getProductList({});
  calcAmount();
  getInvoiceRemark();
  ifNeedMobileEmail();
});
</script>

<style lang="less">
@import '../make.less';
</style>
