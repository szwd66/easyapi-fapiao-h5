<template>
  <div>
    <div class="invoice-type">
      <p class="title">请选择发票类型</p>
      <van-row justify="space-between" class="invoice-type-list">
        <van-col span="12" v-if="props.ifElectronic">
          <div
            :class="{
              'invoice-type_blue_box': state.childInvoiceForm.property === '电子',
              'invoice-type_gray_box': state.childInvoiceForm.property !== '电子',
            }"
            style="margin-right: 5px"
            @click="changeElectronic"
          >
            <p style="font-size: 16px; margin-top: -6px">电子发票</p>
            <p style="font-size: 12px; margin-top: 6px">{{ state.electronicInvoiceMakeTime }}</p>
          </div>
        </van-col>
        <van-col span="12" v-if="props.ifPaper">
          <div
            :class="{
              'invoice-type_blue_box': state.childInvoiceForm.property === '纸质',
              'invoice-type_gray_box': state.childInvoiceForm.property !== '纸质',
            }"
            style="margin-left: 5px"
            @click="changePaper"
          >
            <p style="font-size: 16px; margin-top: -6px">纸质发票</p>
            <p style="font-size: 12px; margin-top: 6px">预计一周送达</p>
          </div>
        </van-col>
      </van-row>
    </div>

    <van-cell-group title="发票详情" inset>
      <van-cell title="抬头类型" required>
        <van-radio-group
          v-model="state.childInvoiceForm.type"
          direction="horizontal"
          @change="selectInvoiceType"
        >
          <van-radio name="企业">企业</van-radio>
          <van-radio name="个人">个人/事业单位</van-radio>
        </van-radio-group>
      </van-cell>
      <van-cell title="发票类型" v-if="state.childInvoiceForm.property === '纸质'">
        <van-radio-group v-model="state.childInvoiceForm.category" direction="horizontal">
          <van-radio style="margin-bottom: 5px" name="增值税普通发票">增值税普通发票</van-radio>
          <van-radio name="增值税专用发票" v-if="state.childInvoiceForm.type === '企业'">
            增值税专用发票
          </van-radio>
        </van-radio-group>
      </van-cell>
      <van-field
        label="发票抬头"
        v-if="state.childInvoiceForm.type === '个人'"
        placeholder="请输入姓名/事业单位"
        v-model="state.childInvoiceForm.purchaserName"
        required
      />
      <van-field
        label="发票抬头"
        readonly
        v-if="state.childInvoiceForm.type === '企业'"
        @click="gotoCompany"
        right-icon="arrow"
        placeholder="请选择发票抬头"
        v-model="state.childCompany.name"
        required
      />
      <van-field
        label="税号"
        readonly
        v-if="state.childInvoiceForm.type === '企业'"
        v-model="state.childCompany.taxNumber"
        required
      />
      <van-field
        label="更多"
        right-icon="arrow-down"
        v-if="state.childInvoiceForm.type === '企业'"
        @click="purchaserMore"
        v-show="state.hide"
        readonly
        placeholder="地址、电话、开户行等"
      />
      <div v-if="state.show">
        <van-field
          v-if="state.childInvoiceForm.type === '企业'"
          @click="purchaserMoreHide"
          label="地址"
          readonly
          v-model="state.childCompany.address"
          right-icon="arrow-up"
        />
        <van-field
          v-if="state.childInvoiceForm.type === '企业'"
          label="电话"
          readonly
          v-model="state.childCompany.phone"
        />
        <van-field
          v-if="state.childInvoiceForm.type === '企业'"
          label="开户行"
          readonly
          v-model="state.childCompany.bank"
        />
        <van-field
          v-if="state.childInvoiceForm.type === '企业'"
          label="银行账号"
          readonly
          v-model="state.childCompany.bankAccount"
        />
      </div>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { getDefaultCompanyApi } from '@/api/company';
import { getDefaultAddressApi } from '@/api/address';
import { findSettingApi } from '@/api/setting';
import { localStorage } from '@/utils/local-storage';

const router = useRouter();
const emits = defineEmits(['getInvoiceCategory', 'getInvoiceProperty', 'getCompany']);
const props = defineProps({
  ifElectronic: {
    type: Boolean,
  },
  invoiceForm: {
    type: Object,
  },
  ifPaper: {
    type: Boolean,
  },
  company: {
    type: Object,
  },
  isHide: {
    type: Boolean,
  },
  isShow: {
    type: Boolean,
  },
});

const state = reactive({
  address: {
    addressId: '',
  },
  electronicInvoiceMakeTime: '最快1分钟开具',
  show: props.isShow,
  hide: props.isHide,
  childInvoiceForm: {
    type: '',
    category: '',
    property: '',
    purchaserName: '',
    purchaserTaxpayerNumber: '',
    purchaserAddress: '',
    purchaserPhone: '',
    purchaserBank: '',
    purchaserBankAccount: '',
    companyId: '',
    addressId: '',
  },
  childCompany: {
    name: '',
    taxNumber: '',
    address: '',
    phone: '',
    bank: '',
    bankAccount: '',
    companyId: '',
  },
});

const changeElectronic = () => {
  emits('getInvoiceCategory', (state.childInvoiceForm.category = '增值税电子普通发票'));
  emits('getInvoiceProperty', (state.childInvoiceForm.property = '电子'));
};

const changePaper = () => {
  emits('getInvoiceCategory', (state.childInvoiceForm.category = '增值税普通发票'));
  emits('getInvoiceProperty', (state.childInvoiceForm.property = '纸质'));
};

const selectInvoiceType = () => {
  localStorage.set('type', state.childInvoiceForm.type);
  if (state.childInvoiceForm.type === '企业') {
    getDefaultCompany();
    getDefaultAddress();
  } else if (state.childInvoiceForm.type === '个人') {
    state.childInvoiceForm.purchaserName = '';
    state.childInvoiceForm.purchaserTaxpayerNumber = '';
    state.childInvoiceForm.purchaserAddress = '';
    state.childInvoiceForm.purchaserPhone = '';
    state.childInvoiceForm.purchaserBank = '';
    state.childInvoiceForm.purchaserBankAccount = '';
    state.childInvoiceForm.companyId = '';
  }
};

/**
 * 前往抬头管理页
 */
const gotoCompany = () => {
  router.push({
    path: '/company/list',
  });
};

/**
 * 购买方更多信息
 */
const purchaserMore = () => {
  state.show = true;
  state.hide = false;
};

/**
 * 隐藏购买方更多信息
 */
const purchaserMoreHide = () => {
  state.show = false;
  state.hide = true;
};

const getDefaultCompany = () => {
  getDefaultCompanyApi().then(res => {
    if (res.code === 1) {
      state.childCompany = res.content;
      emits('getCompany', state.childCompany);
      state.childInvoiceForm.purchaserName = state.childCompany.name;
      state.childInvoiceForm.purchaserTaxpayerNumber = state.childCompany.taxNumber;
      state.childInvoiceForm.purchaserAddress = state.childCompany.address;
      state.childInvoiceForm.purchaserPhone = state.childCompany.phone;
      state.childInvoiceForm.purchaserBank = state.childCompany.bank;
      state.childInvoiceForm.purchaserBankAccount = state.childCompany.bankAccount;
      state.childInvoiceForm.companyId = state.childCompany.companyId;
    }
  });
};

const getDefaultAddress = () => {
  //todo username更换
  getDefaultAddressApi('').then(res => {
    if (res.code === 1) {
      state.address = res.content;
      state.childInvoiceForm.addressId = state.address.addressId;
    }
  });
};

/**
 * 获取电子发票文案说明
 */
const findSetting = () => {
  findSettingApi({ fieldKeys: 'electronic_invoice_make_time' }).then(res => {
    if (res.code === 1) {
      state.electronicInvoiceMakeTime = res.content[0].fieldValue;
    }
  });
};

onMounted(() => {
  findSetting();
  state.childInvoiceForm = props.invoiceForm as any;
});
</script>

<style lang="less" scoped>
.invoice-type {
  padding: 0 16px;

  .title {
    padding: 15px 0;
    color: #969799;
  }

  .invoice-type-list {
    text-align: center;
    background: #fff;
    padding: 20px 10px;
    border-radius: 8px;
  }

  .invoice-type_blue_box {
    box-sizing: border-box;
    padding: 17px 0;
    font-size: 15px;
    height: 70px;
    border: 1px solid #1989fa;
    color: #1989fa;
    border-radius: 4px;
  }

  .invoice-type_gray_box {
    box-sizing: border-box;
    padding: 17px 0;
    font-size: 15px;
    height: 70px;
    border: 1px solid #999;
    color: #999;
    border-radius: 4px;
  }
}
</style>
