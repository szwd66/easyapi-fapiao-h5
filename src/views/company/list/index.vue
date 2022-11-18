<template>
  <Header headerTitle='抬头管理' v-if='store.ifShowH5NavBar' />
  <div :class="store.ifShowH5NavBar ? 'search-top' : 'search'">
    <van-search
      v-model='state.companyName'
      placeholder='请输入公司名称'
      @update:model-value='companyNameSearch'
    ></van-search>
  </div>
  <div class='search-placeholder'></div>
  <div class='company'>
    <div v-if='!state.loading'>
      <div v-if='state.companyList.length == 0'>
        <van-empty image='search' description='暂无数据' />
      </div>
      <div class='company-list' v-else>
        <div class='company-list-item' v-for='(item, index) in state.companyList' :key='index'>
          <div class='company-top fixed-bottom-bgColor'>
            <span class='rise-text'>{{ item.name }}</span>
            <van-tag plain type='warning' size='medium' v-if='item.ifDefault'>默认</van-tag>
            <span class='edit' @click='gotoEditCompany(item.companyId)'>编辑</span>
          </div>
          <van-cell-group :border='false' @click='select(item)'>
            <van-cell title='公司税号' :value='item.taxNumber' :border='false' />
            <van-cell title='地址、电话' :value='item.address + item.phone' :border='false' />
            <van-cell title='开户行及账号' :value='item.bank + item.bankAccount' :border='false' />
          </van-cell-group>
        </div>
      </div>
    </div>
    <div class='loading' v-if='state.loading'>
      <div>加载中......</div>
    </div>
    <div class='no-more-data' v-if='state.noMoreData'>
      <div>没有更多数据了</div>
    </div>
  </div>
  <div class='bottom fixed-bottom-bgColor'>
    <van-button type='primary' class='sumbit' block @click='gotoEditCompany()'>新增抬头</van-button>
  </div>
</template>
<script setup lang='ts'>
import { showLoadingToast, closeToast } from 'vant';
import { updateCompanySetDefaultApi, getCompanyListApi } from '@/api/company';
import { useStore } from '@/stores';

const store = useStore();
const router = useRouter();

const state = reactive({
  noData: false,
  loading: true,
  noMoreData: false,
  companyList: [],
  companyName: '',
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
  },
});

const getCompanyList = () => {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  });
  const params = {
    name: state.companyName,
    size: state.pagination.size,
    page: state.pagination.page,
  };
  getCompanyListApi(params).then(res => {
    state.loading = false;
    closeToast();
    if (res.code === 1) {
      state.companyList = state.companyList.concat(res.content);
      state.pagination.totalPages = res.totalPages;
    } else {
      state.companyList = [];
      state.pagination.totalPages = 0;
    }
  });
};

const companyNameSearch = () => {
  state.companyList = [];
  state.pagination.page = 0;
  state.noData = false;
  state.noMoreData = false;
  state.loading = true;
  getCompanyList();
};

const select = item => {
  //设置为默认抬头
  updateCompanySetDefaultApi(item.companyId).then(res => {
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

const getPageList = () => {
  if (state.pagination.page < state.pagination.totalPages - 1) {
    state.pagination.page = state.pagination.page + 1;
    getCompanyList();
  }
  if (state.pagination.page === state.pagination.totalPages - 1) {
    state.noMoreData = true;
  }
};

const lazyLoading = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const scrollHeight = document.documentElement.scrollHeight;
  if (scrollTop + clientHeight >= scrollHeight) {
    // 滚动到底部，逻辑代码
    //事件处理
    getPageList();
  }
};

onMounted(() => {
  getCompanyList();
  // 滚动到底部，再加载的处理事件
  window.addEventListener('scroll', lazyLoading);
});
</script>

<style lang='less'>
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
<style lang='less' scoped>
.search-top {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  z-index: 99;
}

.search {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
}

.search-placeholder {
  width: 100%;
  height: 54px;
}

.company {
  padding-bottom: 64px;

  .company-list {
    padding: 0 16px;

    .company-list-item {
      border-radius: 5px;
      box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.11);
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
}

.bottom {
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 10px 16px;

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

.no-more-data {
  text-align: center;
  color: #999;
  line-height: 40px;
}

.loading {
  text-align: center;
  color: #999;
}
</style>
