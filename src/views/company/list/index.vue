<template>
  <div class="company" v-if="!state.loading">
    <div v-if="state.companyList.length == 0">
      <van-empty image="search" description="暂无数据" />
    </div>
    <div class="company-list" v-else>
      <div class="company-list-item" v-for="(item, index) in state.companyList" :key="index">
        <div class="company-top fixed-bottom-bgColor">
          <span class="rise-text">{{ item.name }}</span>
          <van-tag plain type="warning" size="medium" v-if="item.ifDefault">默认</van-tag>
          <span class="edit" @click="gotoEditCompany(item.companyId)">编辑</span>
        </div>
        <van-cell-group :border="false" @click="select(item)">
          <van-cell title="公司税号" :value="item.taxNumber" :border="false" />
          <van-cell title="注册地址" :value="item.address" :border="false" />
          <van-cell title="注册电话" :value="item.phone" :border="false" />
          <van-cell title="开户银行" :value="item.bank" :border="false" />
          <van-cell title="银行账号" :value="item.bankAccount" :border="false" />
        </van-cell-group>
      </div>
    </div>
    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="sumbit" block @click="gotoEditCompany()">
        新增抬头
      </van-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { showLoadingToast, closeToast } from 'vant';
import { defaultCompanyApi, getCompanyListApi } from '@/api/company';

const router = useRouter();

const state = reactive({
  loading: true,
  companyList: [],
});

const getCompanyList = () => {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  });
  getCompanyListApi().then(res => {
    state.loading = false;
    closeToast();
    if (res.code === 1) {
      state.companyList = res.content;
    }
  });
};

const select = item => {
  //设置为默认抬头
  defaultCompanyApi(item.companyId).then(res => {
    if (res.code == 1) {
      history.back();
    }
  });
};

const gotoEditCompany = companyId => {
  router.push({
    path: '/company/edit',
    query: { id: companyId },
  });
};

onMounted(() => {
  getCompanyList();
});
</script>

<style lang="less">
.company {
  .van-cell__value {
    min-width: 70%;
    text-align: left;
    span {
      display: inline-block;
      word-break: break-all;
    }
  }
}
</style>
<style lang="less" scoped>
.company {
  .company-list {
    padding: 0px 20px;
    padding-bottom: 80px;

    .company-list-item {
      border-radius: 8px;
      box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.11);
      margin-top: 15px;
      overflow: hidden;

      .company-top {
        border-bottom: 1px solid #f4f4f4;
        height: 40px;
        line-height: 40px;
        padding: 0 16px;

        .rise-text {
          float: left;
          max-width: 200px;
          display: block;
          overflow: hidden; /*内容超出后隐藏*/
          text-overflow: ellipsis; /* 超出内容显示为省略号*/
          white-space: nowrap; /*文本不进行换行*/
          font-size: 14px;
          margin-right: 10px;
        }

        .edit {
          float: right;
          color: #1989fa;
        }
      }
    }
  }

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
