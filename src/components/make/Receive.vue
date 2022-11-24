<script setup lang="ts">
import { getDefaultAddressApi } from '@/api/address'
import { getCustomerApi } from '@/api/customer'
import { localStorage } from '@/utils/local-storage'

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
})

const router = useRouter()

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
})

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
  })
}
/**
 * 获取默认地址
 */
const getDefaultAddress = () => {
  getDefaultAddressApi('test').then((res) => {
    if (res.code === 1) {
      state.childAddress = res.content
      state.childForm.addressId = state.childAddress.addressId
    }
  })
}
/**
 * 获取开票用户信息
 */
const getCustomer = () => {
  if (localStorage.get('invoiceForm')) {
    state.childForm.email = JSON.parse(localStorage.get('invoiceForm')).email
    state.childForm.addrMobile = JSON.parse(localStorage.get('invoiceForm')).addrMobile
  } else {
    getCustomerApi({}).then((res) => {
      state.childForm.email = res.content.email ? res.content.email : ''
      state.childForm.addrMobile = res.content.mobile ? res.content.mobile : ''
    })
  }
}

onMounted(() => {
  state.childForm = props.invoiceForm
  getDefaultAddress()
  getCustomer()
})
</script>

<template>
  <div>
    <van-cell-group v-if="props.ifElectronic" title="接收方式" inset>
      <van-field v-if="!ifNeedEmail" v-model="state.childForm.email" label="电子邮箱" />
      <van-field
        v-if="props.ifNeedEmail"
        v-model="state.childForm.email"
        label="电子邮箱"
        required
      />
      <van-field
        v-if="!props.ifNeedMobile"
        v-model="state.childForm.addrMobile"
        label="手机号码"
        maxlength="11"
      />
      <van-field
        v-if="props.ifNeedMobile"
        v-model="state.childForm.addrMobile"
        label="手机号码"
        maxlength="11"
        required
      />
    </van-cell-group>

    <van-cell-group v-if="!props.ifElectronic" title="接收方式" inset>
      <van-field
        v-model="state.childAddress.name"
        right-icon="arrow"
        label="收件人"
        readonly
        @click="gotoAddress"
      />
      <van-field v-model="state.childAddress.mobile" label="手机号码" readonly />
      <van-cell
        title="邮寄地址"
        :value="
          state.childAddress.province
            + state.childAddress.city
            + state.childAddress.district
            + state.childAddress.addr
        "
        readonly
      />
    </van-cell-group>

    <div v-if="!props.ifElectronic" class="page-part" style="margin-bottom: 60px">
      <p>开票金额不足200元，需支付邮费</p>
    </div>
  </div>
</template>

<style lang="less" scoped></style>
