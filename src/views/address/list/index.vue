<template>
  <Header headerTitle="地址管理" v-if="store.ifShowH5NavBar"></Header>
  <div class="address" v-if="!state.loading">
    <div v-if="state.addressList.length == 0">
      <van-empty image="search" description="暂无数据" />
    </div>
    <div class="address-list" v-else>
      <div class="address-list-item" v-for="(item, index) in state.addressList" :key="index">
        <div class="address-top fixed-bottom-bgColor">
          <span class="rise-text">{{ item.name }}</span>
          <van-tag plain type="warning" v-if="item.ifDefault">默认</van-tag>
          <span class="edit" @click="gotoEditAddress(item.addressId)">编辑</span>
        </div>
        <van-cell-group @click="select(item)" :border="false">
          <van-cell title="联系电话" :value="item.mobile" :border="false" />
          <van-cell
            title="收票地址"
            :value="item.province + item.city + item.district + item.addr"
            :border="false"
          />
        </van-cell-group>
      </div>
    </div>
    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="gotoEditAddress()">
        新增地址
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Header } from '@/components';
import { getAddressListApi, defaultAddressApi } from '@/api/address';
import { showLoadingToast, closeToast } from 'vant';
import { useStore } from '@/stores';
const store = useStore();

const router = useRouter();

const state = reactive({
  loading: true,
  addressList: [],
});

const getAddressList = () => {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  });
  getAddressListApi({}).then(res => {
    state.loading = false;
    closeToast();
    if (res.code === 1) {
      state.addressList = res.content;
    }
  });
};

const select = item => {
  defaultAddress(item.addressId);
  history.back();
};

//设置默认值
const defaultAddress = addressId => {
  defaultAddressApi(addressId).then();
};

const gotoEditAddress = addressId => {
  router.push({
    path: '/address/edit',
    query: { id: addressId },
  });
};

onMounted(() => {
  getAddressList();
});
</script>

<style lang="less">
.address {
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
.address {
  .address-list {
    padding: 0px 20px;
    padding-bottom: 80px;

    .address-list-item {
      border-radius: 8px;
      box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.11);
      margin-top: 15px;
      overflow: hidden;

      .address-top {
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
