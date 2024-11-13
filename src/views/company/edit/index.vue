<script setup lang='ts'>
import { closeToast, showConfirmDialog, showLoadingToast, showToast } from 'vant'
import company from '@/api/company'
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
  isComposing: false,
})

/**
 * 删除
 */
function deleteData() {
  showConfirmDialog({
    title: '提示',
    message: '确定删除?',
  }).then(() => {
    company.deleteCompany(route.query.id).then((res) => {
      if (res.code === 1)
        history.back()
    })
  })
}

function searchCompanyList() {
  if (state.name.length < 4) {
    state.searchList = []
    state.listShow = false
    return
  }

  company.getCompanyCodeList({ name: state.name }).then((res) => {
    if (res.code === 1) {
      state.searchList = res.content
      openDropDown()
    }
    else {
      state.searchList = []
      inputBlur()
    }
  }).catch(() => {
    state.searchList = []
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
      company.updateCompany(route.query.id, state.companyForm).then((res) => {
        if (res.code === 1)
          history.back()
      })
    }
    else {
      company.createCompany(state.companyForm).then((res) => {
        if (res.code === 1)
          history.back()
      })
    }
  })
}

function handleInput() {
  if (!state.isComposing) {
    searchCompanyList()
  }
}
function handleCompositionStart() {
  state.isComposing = true
}
function handleCompositionEnd() {
  state.isComposing = false
  searchCompanyList()
}

/**
 * 发票抬头失焦后
 */
function inputBlur() {
  state.listShow = false
}
/**
 * 发票抬头聚焦后
 */
function inputFocus() {
  if (state.name.length > 3 && state.searchList.length > 0) {
    openDropDown()
  }
}
function openDropDown() {
  const helper = document.querySelector('.helper') as any
  const element = document.querySelector('.searchList') as any
  const distanceToTop = helper.offsetTop
  element.style.top = `${distanceToTop}px`
  state.listShow = true
}

function getCompany() {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  })
  company.getCompany(route.query.id).then((res) => {
    closeToast()
    if (res.code === 1) {
      state.companyForm = res.content
      state.name = res.content.name
    }
  })
}

onMounted(() => {
  if (route.query.id) {
    document.title = '编辑抬头'
    getCompany()
  }
  else {
    document.title = '新增抬头'
  }
})
</script>

<template>
  <Header v-if="store.ifShowH5NavBar" header-title="编辑抬头" />
  <div class="company-edit">
    <van-form @submit="confirm">
      <van-cell-group inset>
        <van-field
          v-model="state.name" label="公司名称" placeholder="请输入公司名称" border required autosize rows="1"
          type="textarea" :rules="[{ required: true, message: '请输入公司名称' }]" @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd" @input="handleInput" @focus="inputFocus" @blur="inputBlur"
        />
        <div class="helper" />
        <div v-show="state.listShow && state.searchList.length > 0" class="searchList">
          <ul>
            <li
              v-for="(item, index) in state.searchList" :key="index" class="searchList-item"
              @mousedown="chooseCompany(index)"
            >
              {{ item.name }}
            </li>
          </ul>
        </div>
        <van-field
          v-model="state.companyForm.taxNumber" label="公司税号" placeholder="请输入纳税人识别号" border required autosize
          rows="1" type="textarea" :rules="[{ required: true, message: '请输入纳税人识别号' }]"
        />
        <van-field
          v-model="state.companyForm.address" label="注册地址" placeholder="请输入地址" border autosize rows="1"
          type="textarea"
        />
        <van-field
          v-model="state.companyForm.phone" label="注册电话" placeholder="请输入电话" border autosize rows="1"
          type="textarea"
        />
        <van-field
          v-model="state.companyForm.bank" label="开户银行" placeholder="请输入开户行" border autosize rows="1"
          type="textarea"
        />
        <van-field
          v-model="state.companyForm.bankAccount" label="银行账号" placeholder="请输入开户行账号" border autosize rows="1"
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

      <div class="bottom fixed-bottom-bgColor" :class="{ 'single-button': !route.query.id }">
        <div>
          <van-button type="primary" block native-type="submit">
            保存
          </van-button>
        </div>
        <div v-if="route.query.id">
          <van-button type="danger" block @click="deleteData">
            删除
          </van-button>
        </div>
      </div>
    </van-form>
  </div>
</template>

<style lang='less' scoped>
.company-edit {
  padding-top: 15px;
  position: relative;

  .searchList {
    position: fixed;
    background-color: #fff;
    right: 0;
    left: 0;
    bottom: 0;
    padding: 0 16px;
    z-index: 999;
    overflow-y: scroll;

    .searchList-item {
      font-size: 14px;
      color: #1989FA;
      padding: 10px 0;
      line-height: 24px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-bottom: 1px solid rgba(235, 237, 240, .5);
    }
  }

  .default {
    margin-top: 15px;
  }

  .bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    div {
      width: 48%;
    }

  }

  .single-button {
    display: block;

    div {
      width: 100%;
    }
  }
}
</style>
