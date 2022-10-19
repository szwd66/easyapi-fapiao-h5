<template>
  <div class="address-list">
    <div class="add-con">
      <div style="margin-top: 10px; margin-bottom: 35px">
        <div class="no-record-con" v-if="state.addressList.length == 0 && !state.loading">
          <van-empty image="search" description="暂无数据" />
        </div>
        <div class="address-con header-d" v-for="(item, index) in state.addressList" :key="index">
          <div class="address-top">
            <p>
              <span class="rise-text">{{ item.name }}</span>
              <van-tag plain type="warning" v-if="item.ifDefault">默认</van-tag>
              <span class="edit" @click="edit(item.addressId)">编辑</span>
            </p>
          </div>
          <div class="address-bottom">
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
      </div>
    </div>
    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="gotoEditAddress">新增地址</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAddressListApi, defaultAddressApi } from '@/api/address';
import { showLoadingToast, closeToast } from 'vant';

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
    closeToast();
    state.loading = false;
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

const gotoEditAddress = () => {
  router.push('/address/edit');
};

const edit = addressId => {
  router.push({
    path: '/address/edit',
    query: { id: addressId },
  });
};

onMounted(() => {
  getAddressList();
});
</script>

<style lang="less" scoped>
.address-list {
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
