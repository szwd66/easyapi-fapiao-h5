<script setup lang='ts'>
import { getOutOrderListApi } from '@/api/invoice'
import { useStore } from '@/stores'

const store = useStore()
const route = useRoute()

const state = reactive({
  outOrders: [],
  loading: true,
  finished: false,
  pagination: {
    page: 1,
    size: 10,
    totalPages: 0,
  },
  windowHeight: 0,
  empty: false,
})

const getOutOrderList = () => {
  const params = {
    invoiceId: route.query.id,
    page: state.pagination.page - 1,
    size: state.pagination.size,
  }
  getOutOrderListApi(params).then((res) => {
    state.loading = false
    if (res.code === 1) {
      state.outOrders = state.outOrders.concat(res.content)
      state.pagination.totalPages = res.totalPages
    } else {
      state.empty = true
      state.outOrders = []
      state.pagination.totalPages = 0
    }
  })
}

/**
 * 上拉加载
 */
const loadMore = () => {
  if (state.pagination.page === state.pagination.totalPages) {
    state.finished = true
    return
  }
  state.pagination.page++
  getOutOrderList()
}

const getWindowHeight = () => {
  const clientHeight = document.documentElement.clientHeight
  state.windowHeight = clientHeight - 15 - (store.ifShowH5NavBar ? 46 : 0)
}

onMounted(() => {
  getWindowHeight()
  getOutOrderList()
})
</script>

<template>
  <Header v-if="store.ifShowH5NavBar" header-title="关联订单" />

  <div v-if="state.empty">
    <van-empty image="search" description="暂无订单数据" />
  </div>

  <van-list
    v-else
    v-model:loading="state.loading"
    :finished="state.finished"
    finished-text="没有更多数据了"
    class="invoice-out-order"
    :style="{ height: `${state.windowHeight}px` }"
    @load="loadMore"
  >
    <div
      v-for="(item, index) in state.outOrders"
      :key="index"
      class="order-con"
    >
      <van-cell-group :border="false">
        <van-cell title="订单编号：" :value="item.no" :border="false" />
        <van-cell title="订单时间：" :value="item.addTime" :border="false" />
        <van-cell
          v-if="item.fields"
          :value="Object.values(JSON.parse(item.fields))[0]"
          :border="false"
        />
        <div class="subtotal">
          <span>小计</span>
          <span class="price">￥{{ item.price }}</span>
        </div>
      </van-cell-group>
    </div>
  </van-list>
</template>

<style lang='less'>
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

<style lang='less' scoped>
.invoice-out-order {
  padding: 0 16px;

  .order-con {
    margin-top: 15px;
    border-radius: 5px;
    background: #fff;
    background-size: 100% 100%;
    padding: 10px 15px 20px;
    border-bottom: 1px solid #f4f4f4;
    border-radius: 8px;
    box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.11);

    .subtotal {
      color: #a1a1a1;
      text-align: right;
    }

    .price {
      color: #ff4848;
      margin-left: 10px;
    }
  }
}
</style>
