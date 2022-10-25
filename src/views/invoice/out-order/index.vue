<template>
  <Header headerTitle="关联订单" v-if="store.ifShowH5NavBar"></Header>

  <div class="invoice-out-order">
    <van-list
      v-model:loading="state.loading"
      :finished="state.finished"
      finished-text="没有更多数据了"
      @load="loadMore"
    >
      <div class="order-con" v-for="(item, index) in state.outOrders" :key="index">
        <van-cell-group :border="false">
          <van-cell title="订单编号：" :value="item.no" :border="false" />
          <van-cell
            v-if="item.fields"
            :title="Object.values(JSON.parse(item.fields))[0]"
            :value="item.noY"
            :border="false"
          />
          <van-cell title="" :value="item.model" :border="false" />
          <div>
            <span class="price">￥{{ item.price }}</span>
            <span class="subtotal">小计</span>
          </div>
        </van-cell-group>
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { Header } from '@/components';
import { getOutOrderListApi } from '@/api/invoice';
import { useStore } from '@/stores';
const store = useStore();
const route = useRoute();

const state = reactive({
  outOrders: [],
  loading: false,
  finished: false,
  page: {
    page: 0,
    size: 10,
    total: 0,
  },
});

const getOutOrderList = () => {
  let params = {
    invoiceId: route.query.id,
  };
  getOutOrderListApi(params).then(res => {
    state.loading = false;
    if (res.code === 1) {
      state.outOrders = state.outOrders.concat(res.content);
      state.page.total = res.totalPages;
    } else {
      state.outOrders = [];
      state.page.total = 0;
    }
  });
};

/**
 * 上拉加载
 */
const loadMore = () => {
  // if (state.page.total !== 0 && state.page.page > 0 && state.page.page >= state.page.total) {
  //   state.finished = true;
  //   return;
  // }
  state.page.page++;
  getRecordList();
};

onMounted(() => {
  getOutOrderList();
});
</script>

<style lang="less">
.invoice-out-order {
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
.invoice-out-order {
  padding: 0px 20px;

  .order-con {
    margin-top: 15px;
    border-radius: 5px;
    background: #fff;
    background-size: 100% 100%;
    padding: 10px 15px 35px;
    border-bottom: 1px solid #f4f4f4;
    margin-top: 15px;
    border-radius: 8px;
    box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.11);

    .subtotal {
      float: right;
      color: #a1a1a1;
      margin-right: 10px;
    }

    .price {
      color: #ff4848;
      float: right;
    }
  }
}
</style>
