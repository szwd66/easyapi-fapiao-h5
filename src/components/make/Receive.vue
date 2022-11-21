<template>
  <div>
    <van-cell-group title="接收方式" inset v-if="props.ifElectronic">
      <van-field v-if="!ifNeedEmail" label="电子邮箱" v-model="state.childForm.email"></van-field>
      <van-field
        v-if="props.ifNeedEmail"
        label="电子邮箱"
        v-model="state.childForm.email"
        required
      ></van-field>
      <van-field
        v-if="!props.ifNeedMobile"
        label="手机号码"
        v-model="state.childForm.addrMobile"
        maxlength="11"
      ></van-field>
      <van-field
        v-if="props.ifNeedMobile"
        label="手机号码"
        v-model="state.childForm.addrMobile"
        maxlength="11"
        required
      ></van-field>
    </van-cell-group>

    <van-cell-group title="接收方式" inset v-if="!props.ifElectronic">
      <van-field
        right-icon="arrow"
        label="收件人"
        readonly
        @click="gotoAddress"
        v-model="state.childAddress.name"
      ></van-field>
      <van-field label="手机号码" v-model="state.childAddress.mobile" readonly></van-field>
      <van-cell
        title="邮寄地址"
        :value="
          state.childAddress.province +
          state.childAddress.city +
          state.childAddress.district +
          state.childAddress.addr
        "
        readonly
      ></van-cell>
    </van-cell-group>

    <div class="page-part" style="margin-bottom: 60px" v-if="!props.ifElectronic">
      <p>开票金额不足200元，需支付邮费</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDefaultAddressApi } from '@/api/address';
import { getCustomerApi } from '@/api/customer';
import { localStorage } from '@/utils/local-storage';

const router = useRouter();

const props = defineProps({
  ifElectronic: {
    type: Boolean,
  },
  invoiceForm: {
    type: Object,
  },
  ifNeedEmail: {
    type: Boolean,
  },
  ifNeedMobile: {
    type: Boolean,
  },
});

const state = reactive({
  childForm: {
    addrMobile: '',
    email: '',
    addressId: '',
  },
  childAddress: {
    name: '',
    mobile: '',
    address: '',
    phone: '',
    bank: '',
    addressId: '',
  },
});

/**
 * 前往地址管理页
 */
const gotoAddress = () => {
  router.push({
    path: '/address/',
    name: 'Address',
    params: {
      id: state.childAddress ? state.childAddress.addressId : '',
      from: 'make',
    },
  });
};
/**
 * 获取默认地址
 */
const getDefaultAddress = () => {
  getDefaultAddressApi('test').then(res => {
    if (res.code === 1) {
      state.childAddress = res.content;
      state.childForm.addressId = state.childAddress.addressId;
    }
  });
};
/**
 * 获取开票用户信息
 */
const getCustomer = () => {
  if (localStorage.get('invoiceForm')) {
    state.childForm.email = JSON.parse(localStorage.get('invoiceForm')).email;
    state.childForm.addrMobile = JSON.parse(localStorage.get('invoiceForm')).addrMobile;
  } else {
    getCustomerApi({}).then(res => {
      state.childForm.email = res.content.email ? res.content.email : '';
      state.childForm.addrMobile = res.content.mobile ? res.content.mobile : '';
    });
  }
};

onMounted(() => {
  state.childForm = props.invoiceForm;
  getDefaultAddress();
  getCustomer();
});
</script>

<style lang="less" scoped></style>
