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

    <van-cell-group title="发票内容" inset>
      <van-field
        readonly
        clickable
        label="发票类别"
        v-model="state.customCategory.name"
        placeholder="选择发票类别"
        @click="state.showCustomCategory = true"
        required
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
        class="merge-order_price"
        readonly
        clickable
        label="发票金额"
        placeholder="请准确输入开票金额"
        v-model="state.invoiceForm.price"
        @touchstart.stop="state.keyboardShow = true"
        required
      ></van-field>
      <van-number-keyboard
        :show="state.keyboardShow"
        v-model="state.invoiceForm.price"
        theme="custom"
        extra-key="."
        close-button-text="完成"
        @blur="state.keyboardShow = false"
      />
      <van-field
        label="发票备注"
        :placeholder="common.remarkPlaceholder"
        v-model="state.invoiceForm.remark"
      ></van-field>
      <van-cell title="附件" required>
        <van-uploader
          v-model="state.imageList"
          multiple
          :max-count="3"
          :data="{ key: state.qnKey, token: state.qnToken }"
          :after-read="onAfterRead"
        ></van-uploader>
      </van-cell>
    </van-cell-group>

    <Receive
      :ifElectronic="state.ifElectronic"
      :invoiceForm="state.invoiceForm"
      :ifNeedEmail="common.ifNeedEmail"
      :ifNeedMobile="common.ifNeedMobile"
      :address="state.address"
    />

    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="makeInvoice">申请开票</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getQiniuKeyApi, getQiniuTokenApi, qiniuUploadApi } from '@/api/qiniu';
import { getCustomCategoryListApi } from '@/api/custom-category';
import { categoryMakeInvoiceApi } from '@/api/make';
import { closeToast, showConfirmDialog, showLoadingToast, showToast } from 'vant';
import { validPrice } from '@/utils/validate';
import makeMixins from '../mixins/make';
import { localStorage } from '@/utils/local-storage';
import { useStore } from '@/stores';

const { common, getInvoiceRemark, ifNeedMobileEmail, checkEmailMobile } = makeMixins();
const store = useStore();
const router = useRouter();
const route = useRoute();

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
  customCategoryList: [], //自定义分类列表
  //选中的自定义分类
  customCategory: {
    customCategoryId: null,
    name: '',
  },
  imageList: [],
  fieldValue: [],
  invoiceForm: {
    outOrderNo: 'H5' + new Date().getTime(),
    category: '增值税电子普通发票',
    property: localStorage.get('ifElectronic') ? '电子' : '纸质',
    type: '个人',
    purchaserName: '',
    purchaserTaxpayerNumber: '',
    purchaserAddress: '',
    purchaserPhone: '',
    purchaserBank: '',
    purchaserBankAccount: '',
    price: null,
    addrMobile: '',
    email: '',
    remark: '',
    extends: [],
    customCategoryId: null,
    companyId: null,
  },
});

const getToken = () => {
  getQiniuTokenApi().then(res => {
    state.qnToken = res.content.uploadToken;
  });
};

const getKey = () => {
  getQiniuKeyApi().then(res => {
    state.qnKey = res.content.key;
  });
};

const onAfterRead = file => {
  uploadImgToQiniu(state.qnToken, state.qnKey, file);
};

/**
 * 上传图片到七牛
 */
const uploadImgToQiniu = (qnToken, qnKey, file) => {
  const data = new FormData();
  //七牛需要的token，后台获取
  data.append('token', qnToken);
  data.append('key', qnKey);
  data.append('file', file['file']);
  qiniuUploadApi(data).then(res => {
    state.fieldValue.push('https://qiniu.easyapi.com/' + res.key);
    //上传成功后，重新更新七牛参数
    getToken();
    getKey();
  });
};

/**
 * 获取自定义发票分类
 */
const getCustomCategoryList = () => {
  getCustomCategoryListApi({}).then(res => {
    if (res.code === 1) {
      state.customCategoryList = res.content;
      state.customCategoryList.forEach(item => {
        item.text = item.name;
      });
    }
  });
};

const makeInvoice = () => {
  checkEmailMobile(state.invoiceForm);
  if (!common.ifCheckEmailMobile) {
    return;
  }
  if (state.invoiceForm.type === '个人' && state.invoiceForm.purchaserName === '') {
    return showToast('请输入发票抬头');
  }
  if (state.customCategory === null || state.customCategory.customCategoryId === null) {
    return showToast('请选择发票类别');
  }

  if (state.invoiceForm.price === null || state.invoiceForm.price <= 0) {
    return showToast('请输入开票金额');
  } else if (!validPrice(state.invoiceForm.price)) {
    return showToast('请输入合法开票金额，最多2位小数');
  }
  if (state.imageList.length === 0) {
    return showToast('附件一栏请上传付款记录凭证');
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
    state.invoiceForm.customCategoryId = state.customCategory.customCategoryId;
    state.invoiceForm.companyId = state.company.companyId;
    state.invoiceForm.extends.push({
      fieldKey: 'attch',
      fieldName: '附件',
      fieldValue: state.fieldValue.toString(),
    });

    categoryMakeInvoiceApi(state.invoiceForm).then(res => {
      closeToast();
      if (res.code === 1) {
        router.push({ path: '/make/success' });
      } else {
        showToast(res.message);
      }
    });
  });
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

/**
 * 选择自定义分类
 */
const onConfirm = value => {
  state.customCategory.customCategoryId = value.selectedOptions[0].customCategoryId;
  state.customCategory.name = value.selectedOptions[0].name;
  state.showCustomCategory = false;
};

onMounted(() => {
  if (route.query.accessToken) {
    localStorage.set('accessToken', route.query.accessToken);
  }
  if (route.query.taxNumber) {
    localStorage.set('taxNumber', route.query.taxNumber);
  }
  if (localStorage.get('type')) {
    state.invoiceForm.type = localStorage.get('type');
  }
  getCustomCategoryList();
  getToken();
  getKey();
  getInvoiceRemark();
  ifNeedMobileEmail();
});
</script>

<style lang="less">
@import '../make.less';
</style>
