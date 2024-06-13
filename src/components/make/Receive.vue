<script setup lang="ts">
import { getDefaultAddressApi } from '@/api/address'
import { getCustomerApi } from '@/api/customer'
import { findSettingApi } from '@/api/setting'

const props = defineProps({
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
    mobile: '',
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
  ifElectronic: false,
})

/**
 * 前往地址管理页
 */
function gotoAddress() {
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
function getDefaultAddress() {
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
function getCustomer() {
  getCustomerApi({}).then((res) => {
    state.childForm.email = res.content.email ? res.content.email : ''
    state.childForm.mobile = res.content.mobile ? res.content.mobile : ''
  })
}

function findSetting() {
  findSettingApi({
    fieldKeys: 'if_shudian_invoice',
  }).then((res) => {
    if (res.code === 1) {
      if (res.content[0].fieldValue === 'true')
        state.ifElectronic = true
    }
  })
}

onMounted(() => {
  state.childForm = props.invoiceForm
  findSetting()
  getDefaultAddress()
  getCustomer()
})
</script>

<template>
  <div>
    <van-cell-group v-if="state.ifElectronic" title="接收方式" inset>
      <van-field
        v-if="!props.ifNeedEmail"
        v-model="state.childForm.email"
        label="电子邮箱"
      />
      <van-field
        v-if="props.ifNeedEmail"
        v-model="state.childForm.email"
        label="电子邮箱"
        required
      />
      <van-field
        v-if="!props.ifNeedMobile"
        v-model="state.childForm.mobile"
        label="手机号码"
        maxlength="11"
      />
      <van-field
        v-if="props.ifNeedMobile"
        v-model="state.childForm.mobile"
        label="手机号码"
        maxlength="11"
        required
      />
    </van-cell-group>

    <van-cell-group v-else title="接收方式" inset>
      <van-field
        v-model="state.childAddress.name"
        right-icon="arrow"
        label="收件人"
        readonly
        @click="gotoAddress"
      />
      <van-field
        v-model="state.childAddress.mobile"
        label="手机号码"
        readonly
      />
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

    <div v-if="!state.ifElectronic" class="page-part">
      开票金额不足200元，需支付邮费
    </div>
  </div>
</template>

<style lang="less" scoped>
.page-part {
  margin: 10px 0 0 20px;
  color: #999;
  font-size: 12px;
}
</style>
