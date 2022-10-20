<template>
  <div class="make-product">
    <Header @head-back="goBack()" headerTitle="开具电子发票" v-if="show"></Header>
    <div class="nav" style="margin-top: 0px">
      <div id="loading">
        <van-loading v-show="loadingList" type="spinner" color="#56cbf6" />
      </div>
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
    </div>
    <!-- <div class="invoice-contents">
      <p>发票内容</p>
      <ul class="contents-title">
        <li style="width: 35%">商品名称</li>
        <li style="width: 35%">规格型号</li>
        <li>单位</li>
        <li>数量</li>
        <li>单价</li>
        <li>操作</li>
      </ul>
      <van-cell class="line" />
      <ul class="contents-content" v-for="(product, index) in productList" :key="index">
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
      <div class="btn">
        <van-button class="submit-btn" @click="showProductSearchPopup">+添加发票内容</van-button>
      </div>
      <van-cell class="line" />
      <van-field
        class="merge-order_price"
        label="发票金额"
        v-model="invoiceForm.price"
        readonly
      ></van-field>
      <van-field
        label="发票备注"
        :placeholder="remarkPlaceholder"
        v-model="invoiceForm.remark"
      ></van-field>
    </div> -->
    <Receive
      :ifElectronic="state.ifElectronic"
      :invoiceForm="state.invoiceForm"
      :ifNeedEmail="state.ifNeedEmail"
      :ifNeedMobile="state.ifNeedMobile"
      :address="state.address"
    ></Receive>

    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="makeInvoice">提交</van-button>
    </div>
    <!-- <van-popup
      class="popupClass"
      v-model="showPopup"
      position="bottom"
      style="height: 75%; padding-top: 4px"
    >
      <van-search
        v-model="productKeyword"
        placeholder="请输入搜索关键词"
        @input="onProductSearch"
      />
      <van-list :finished="true" finished-text="没有更多了">
        <van-radio-group>
          <van-cell v-for="item in productListAll" :key="item.productId">
            <van-row type="flex" align="center">
              <van-col span="6">
                <van-image width="60" height="60" :src="item.img" />
              </van-col>
              <van-col span="11">
                <span style="display: block">{{ item.name }}</span>
                <span style="display: block; font-size: 12px; color: #888">
                  {{ item.specification }}
                </span>
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
        </van-radio-group>
      </van-list>
      <van-submit-bar
        :price="productPrice * 100"
        button-text="添加商品"
        @submit="appendProduct"
        button-color="#1989fa"
      />
    </van-popup> -->
  </div>
</template>

<script setup lang="ts">
import { getProductListApi } from '@/api/product';
import { productMakeInvoiceApi } from '@/api/make';
// import Header from '../../../components/Header.vue';
// import { Toast } from 'vant';
// import { Dialog } from 'vant';
import { Invoice, Receive } from '@/components';
// import makeMixins from '../mixins/make';
import { localStorage } from '@/utils/local-storage';

const state = reactive({
  loadingList: true,
  isShow: false,
  isHide: true,
  ifElectronic: localStorage.get('ifElectronic') === 'true',
  ifPaper: localStorage.get('ifPaper') === 'true',
  showPopup: false,
  productList: '', //商品列表
  company: {}, //公司抬头
  address: {}, //地址对象
  invoiceForm: {
    outOrderNo: 'H5' + new Date().getTime(),
    type: '企业',
    category: '增值税电子普通发票',
    property: localStorage.get('ifElectronic') === 'true' ? '电子' : '纸质',
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
    addressId: null,
    price: 0.0,
  },
  productListAll: [],
  productKeyword: '', //商品服务搜索关键字
  productPrice: 0, //选择商品总价
});

// export default {
//   name: 'MakeProduct',
//   components: {
//     Header,
//     Invoice,
//     Receive,
//   },
//   mixins: [makeMixins],
//   data() {
//     return {};
//   },

//   methods: {
//     goBack() {
//       history.go(-1);
//     },
//     /** 计算发票金额 */
//     calcAmount() {
//       let money = 0;
//       if (this.productList !== null) {
//         for (let i = 0; i < this.productList.length; i++) {
//           money += this.productList[i].price * this.productList[i].number;
//         }
//         this.invoiceForm.price = money.toFixed(2);
//       }
//     },

//     /** 删除商品 */
//     deleteProduct(id) {
//       for (let i = 0; i < this.productList.length; i++) {
//         if (id === this.productList[i].productId) {
//           this.productList.splice(i, 1);
//         }
//         localStorage.setItem('productList', JSON.stringify(this.productList));
//         this.productList = JSON.parse(localStorage.getItem('productList'));
//       }
//       this.invoiceForm.price = 0;
//       this.calcAmount();
//     },
//     /** 获取商品服务列表 */
//     getProductList(params) {
//       getProductList(params).then(res => {
//         this.productListAll = res.data.content;
//       });
//     },
//     /** 追加商品服务 */
//     appendProduct() {
//       let obj = {};
//       for (let i = 0; i < this.productListAll.length; i++) {
//         if (this.productListAll[i].number > 0) {
//           obj = {
//             productId: this.productListAll[i].productId,
//             specification: this.productListAll[i].specification,
//             unit: this.productListAll[i].unit,
//             price: this.productListAll[i].price,
//             name: this.productListAll[i].name,
//             number: this.productListAll[i].number,
//           };
//           let oldList = JSON.parse(localStorage.getItem('productList')) || [];
//           oldList.push(obj);
//           localStorage.setItem('productList', JSON.stringify(oldList));
//           this.productList = JSON.parse(localStorage.getItem('productList'));
//         }
//       }
//       this.calcAmount();
//       this.showPopup = false;
//     },
//     /** 显示选择商品弹框 */
//     showProductSearchPopup() {
//       this.productPrice = 0;
//       this.showPopup = true;
//       this.productKeyword = '';
//       this.getProductList();
//     },
//     /** 搜索商品 */
//     onProductSearch() {
//       this.getProductList({ name: this.productKeyword });
//     },
//     /** 计算追加商品总价 */
//     calcTotalPrice() {
//       let total = 0;
//       if (this.productListAll !== null) {
//         for (let i = 0; i < this.productListAll.length; i++) {
//           total += this.productListAll[i].price * (this.productListAll[i].number || 0);
//         }
//         this.productPrice = total;
//       }
//     },
//     receiveCompany(val) {
//       this.company = val;
//     },
//     receiveCategory(val) {
//       this.invoiceForm.category = val;
//     },
//     receiveProperty(val) {
//       this.invoiceForm.property = val;
//     },
//     makeInvoice() {
//       let that = this;
//       if (that.invoiceForm.type === '个人' && that.invoiceForm.purchaserName === '') {
//         return Toast('请输入发票抬头');
//       }
//       if (that.productList === null) {
//         return Toast('商品服务不能为空');
//       }
//       that.checkEmailMobile();
//       if (!that.ifCheckEmailMobile) {
//         return;
//       }
//       Dialog.confirm({
//         title: '提示',
//         message: '确认抬头正确并开票吗？',
//       })
//         .then(() => {
//           Toast.loading({
//             message: '开票中...',
//             forbidClick: true,
//             duration: 0,
//           });
//           that.invoiceForm.companyId = that.company.companyId;
//           that.invoiceForm.products = that.productList;
//           productMakeInvoice(that.invoiceForm)
//             .then(res => {
//               Toast.clear();
//               if (res.data.code !== 1) {
//                 Toast(res.data.message);
//                 return;
//               }
//               that.$router.push({
//                 path: '/make/success',
//               });
//             })
//             .catch(error => {
//               Toast(error.response.data.message);
//             });
//         })
//         .catch(() => {
//           // on cancel
//         });
//       localStorage.removeItem('productList');
//     },
//   },
//   created() {
//     if (localStorage.getItem('type')) {
//       this.invoiceForm.type = localStorage.getItem('type');
//     }
//   },
//   mounted() {
//     this.getProductList();
//     this.calcAmount();
//     this.productList = JSON.parse(localStorage.getItem('productList'));
//     this.loadingList = false;
//   },
//   computed: {
//     show() {
//       return this.$store.state.ifShowH5NavBar;
//     },
//   },
//   watch: {
//     $route(to, from) {},
//   },
// };
</script>

<style lang="less" scoped>
.make-product {
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
