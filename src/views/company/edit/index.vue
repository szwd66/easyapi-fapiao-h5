<script setup lang='ts'>
import { closeToast, showConfirmDialog, showLoadingToast, showToast } from 'vant'
import {
  createCompanyApi,
  deleteCompanyApi,
  getCompanyApi,
  getCompanyCodeListApi,
  updateCompanyApi,
} from '@/api/company'
import { useStore } from '@/stores'

const store = useStore()
const route = useRoute()

const state = reactive({
  companyForm: {
    name: '',
    taxNumber: '',
    address: '',
    phone: '',
    bank: '',
    bankAccount: '',
    ifDefault: true,
  },
  id: '',
  searchList: [], // 智能提示的抬头列表
  name: '',
  listShow: false,
})

/**
 * 删除
 */
function deleteData() {
  showConfirmDialog({
    title: '提示',
    message: '确定删除?',
  }).then(() => {
    deleteCompanyApi(route.query.id).then((res) => {
      if (res.code === 1)
        history.back()
    })
  })
}

function searchCompanyList() {
  if (state.name.length < 4)
    return

  getCompanyCodeListApi({ name: state.name }).then((res) => {
    if (res.code === 1)
      state.searchList = res.content
  })
}

function chooseCompany(index) {
  state.name = state.searchList[index].name
  state.companyForm.taxNumber = state.searchList[index].taxNumber
  state.companyForm.bank = state.searchList[index].bank
  state.companyForm.bankAccount = state.searchList[index].bankAccount
  state.companyForm.address = state.searchList[index].address
  state.companyForm.phone = state.searchList[index].phone
  state.listShow = false
}

function confirm() {
  if (!state.name && !state.companyForm.taxNumber) {
    showToast('发票抬头和税号不能为空！')
    return
  }
  state.companyForm.name = state.name
  showConfirmDialog({
    title: '提示',
    message: '确定提交吗？',
  }).then(() => {
    if (route.query.id) {
      updateCompanyApi(route.query.id, state.companyForm).then((res) => {
        if (res.code === 1)
          history.back()
      })
    } else {
      createCompanyApi(state.companyForm).then((res) => {
        if (res.code === 1)
          history.back()
      })
    }
  })
}

function inputBlur() {
  state.listShow = false
}

function getCompany() {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  })
  getCompanyApi(route.query.id).then((res) => {
    closeToast()
    if (res.code === 1) {
      state.companyForm = res.content
      state.name = res.content.name
    }
  })
}

onMounted(() => {
  if (route.query.id)
    getCompany()
})
</script>

<template>
  <Header v-if="store.ifShowH5NavBar" header-title="编辑抬头" />
  <div class="company-edit">
    <van-form @submit="confirm">
      <van-cell-group inset>
        <van-field
          v-model="state.name"
          label="公司名称"
          placeholder="请输入公司名称"
          border
          required
          autosize
          rows="1"
          type="textarea"
          :rules="[{ required: true, message: '请输入公司名称' }]"
          @keyup="searchCompanyList"
          @focus="state.listShow = true"
          @blur="inputBlur"
        />
        <!--        <div v-if="state.listShow && state.searchList !== ''" class="rise-list"> -->
        <!--          <ul> -->
        <!--            <li -->
        <!--              v-for="(item, index) in state.searchList" -->
        <!--              :key="index" -->
        <!--              @mousedown="chooseCompany(index)" -->
        <!--            > -->
        <!--              {{ item.name }} -->
        <!--            </li> -->
        <!--          </ul> -->
        <!--        </div> -->
        <van-field
          v-model="state.companyForm.taxNumber"
          label="公司税号"
          placeholder="请输入纳税人识别号"
          border
          required
          autosize
          rows="1"
          type="textarea"
          :rules="[{ required: true, message: '请输入纳税人识别号' }]"
        />
        <van-field
          v-model="state.companyForm.address"
          label="注册地址"
          placeholder="请输入地址"
          border
          autosize
          rows="1"
          type="textarea"
        />
        <van-field
          v-model="state.companyForm.phone"
          label="注册电话"
          placeholder="请输入电话"
          border
          autosize
          rows="1"
          type="textarea"
        />
        <van-field
          v-model="state.companyForm.bank"
          label="开户银行"
          placeholder="请输入开户行"
          border
          autosize
          rows="1"
          type="textarea"
        />
        <van-field
          v-model="state.companyForm.bankAccount"
          label="银行账号"
          placeholder="请输入开户行账号"
          border
          autosize
          rows="1"
          type="textarea"
        />
      </van-cell-group>

      <van-cell-group class="default" inset>
        <van-cell center title="设置为默认抬头">
          <template #right-icon>
            <van-switch v-model="state.companyForm.ifDefault" active-color="#FFC2A8" />
          </template>
        </van-cell>
      </van-cell-group>

      <div class="bottom fixed-bottom-bgColor">
        <van-button type="primary" block class="save" native-type="submit">
          保存
        </van-button>
        <van-button v-if="route.query.id" type="danger" class="delete" block @click="deleteData">
          删除
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style lang='less' scoped>
.company-edit {
  padding-top: 15px;

  .default {
    margin-top: 15px;
  }

  .bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 10px 16px;

    .save,
    .delete {
      border: none;
      height: 40px;
      border-radius: 5px;
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 2px;
      text-indent: 2px;
    }

    .delete {
      margin-top: 10px;
    }
  }
}
</style>
