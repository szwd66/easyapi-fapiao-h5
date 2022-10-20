<template>
  <div class="company-edit">
    <van-cell-group inset>
      <van-field
        label="公司名称"
        v-model="state.name"
        placeholder="请输入公司名称"
        border
        required
        @keyup="searchCompanyList"
        @focus="state.listShow = true"
        @blur="inputBlur"
      ></van-field>
      <div class="rise-list" v-if="state.listShow && state.searchList !== ''">
        <ul>
          <li
            v-for="(item, index) in state.searchList"
            :key="index"
            @mousedown="chooseCompany(index)"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>
      <van-field
        label="公司税号"
        v-model="state.companyForm.taxNumber"
        placeholder="请输入纳税人识别号（必填）"
        border
        required
      />
      <van-field
        label="注册地址"
        v-model="state.companyForm.address"
        placeholder="请输入地址（非必填信息）"
        border
      />
      <van-field
        label="注册电话"
        v-model="state.companyForm.phone"
        placeholder="请输入电话（非必填信息）"
        border
      />
      <van-field
        label="开户银行"
        v-model="state.companyForm.bank"
        placeholder="请输入开户行（非必填信息）"
        border
      />
      <van-field
        label="银行账号"
        v-model="state.companyForm.bankAccount"
        placeholder="请输入开户行账号（非必填信息）"
        border
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
      <van-button type="primary" block class="save" @click="confirm">保存</van-button>
      <van-button type="danger" v-if="route.query.id" class="delete" block @click="deleteData">
        删除
      </van-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  getCompanyApi,
  createCompanyApi,
  updateCompanyApi,
  deleteCompanyApi,
  getCompanyCodeListApi,
} from '@/api/company';

import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant';

const route = useRoute();
const state = reactive({
  companyForm: {
    taxNumber: '',
    address: '',
    phone: '',
    bank: '',
    bankAccount: '',
    ifDefault: false,
    name: '',
  },
  id: '',
  searchList: [], //智能提示的抬头列表
  name: '',
  listShow: false,
});

/**
 * 删除
 */
const deleteData = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定删除?',
  }).then(() => {
    deleteCompanyApi(route.query.id).then(res => {
      if (res.code === 1) {
        history.back();
      }
    });
  });
};

const searchCompanyList = () => {
  if (state.name.length < 4) {
    return;
  }
  getCompanyCodeListApi({ name: state.name }).then(res => {
    if (res.code === 1) {
      state.searchList = res.content;
    }
  });
};

const chooseCompany = index => {
  state.name = state.searchList[index].name;
  state.companyForm.taxNumber = state.searchList[index].taxNumber;
  state.companyForm.bank = state.searchList[index].bank;
  state.companyForm.bankAccount = state.searchList[index].bankAccount;
  state.companyForm.address = state.searchList[index].address;
  state.companyForm.phone = state.searchList[index].phone;
  state.listShow = false;
};

const confirm = () => {
  if (!state.name && !state.companyForm.taxNumber) {
    showToast('发票抬头和税号不能为空！');
    return;
  }
  state.companyForm.name = state.name;
  showConfirmDialog({
    title: '提示',
    message: '确定提交吗？',
  }).then(() => {
    if (route.query.id) {
      updateCompanyApi(route.query.id, state.companyForm).then(res => {
        if (res.code === 1) {
          history.back();
        }
      });
    } else {
      createCompanyApi(state.companyForm).then(res => {
        if (res.code === 1) {
          history.back();
        }
      });
    }
  });
};

const inputBlur = () => {
  state.listShow = false;
};

const getCompany = () => {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  });
  getCompanyApi(route.query.id).then(res => {
    closeToast();
    if (res.code === 1) {
      state.companyForm = res.content;
      state.name = res.content.name;
    }
  });
};

onMounted(() => {
  if (route.query.id) {
    getCompany();
  }
});
</script>

<style lang="less" scoped>
.company-edit {
  padding-top: 15px;

  .default {
    margin-top: 15px;
  }

  .bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 10px 20px;

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
