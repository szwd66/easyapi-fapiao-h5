<script setup lang="ts">
import { computed } from "vue";
import { getOutOrderListApi } from "@/api/out-order";
import { getShopApi } from "@/api/shop";
import { useStore } from "@/stores";
import { localStorage } from "@/utils/local-storage";

const store = useStore();
const route = useRoute();
const router = useRouter();

const state = reactive({
  loading: true, // 下拉加载
  empty: false, // 是否显示空页面
  finished: false,
  pagination: {
    page: 1,
    size: 10,
    totalPages: 0,
  },
  selectList: [],
  outOrderList: [], // 外部订单列表
  minusOutOrderList: [], // 欠费订单列表
  minusAmount: 0.0,
  allCheck: false, // 全部选择
  minPrice: 0.01, // 最小开票金额
  accessToken: "",
  orderType: "",
  windowHeight: 0,
});

/**
 * 计算总价
 */
const totalPrice = computed({
  get() {
    let totalPrice = 0;
    if (state.outOrderList.length === 0) return totalPrice;

    for (let i = 0; i < state.outOrderList.length; i++) {
      const item = state.outOrderList[i];
      if (item.status === true) totalPrice += item.price;
    }
    state.selectList = state.outOrderList.filter((x) => x.status === true);
    return (totalPrice - state.minusAmount).toFixed(2);
  },
  set() {},
});

const checked = (index) => {
  state.outOrderList[index].status = !state.outOrderList[index].status;
  state.allCheck = state.selectList.length === state.outOrderList.length;
};

/**
 * 获取全部负数（欠费）外部订单列表
 */
const getMinusOutOrderList = () => {
  const params = {
    maxPrice: -0.01,
    type: state.orderType,
    page: 0,
    size: 10000,
  };
  getOutOrderListApi(params).then((res) => {
    if (res.code === 1) {
      state.minusOutOrderList = res.content;
      for (let i = 0; i < state.minusOutOrderList.length; i++)
        state.minusAmount += Number(state.minusOutOrderList[i].price);
    } else {
      state.minusAmount = 0.0;
      state.minusOutOrderList = [];
    }
  });
};

/**
 * 获取外部订单列表
 */
const getOutOrderList = () => {
  const params = {
    type: state.orderType,
    page: state.pagination.page - 1,
    size: state.pagination.size,
  };
  getOutOrderListApi(params).then((res) => {
    state.loading = false;
    if (res.code === 1) {
      const data = res.content;
      state.pagination.totalPages = res.totalPages;
      for (const v of data) v.status = false;

      state.outOrderList = state.outOrderList.concat(data);
    } else {
      state.empty = true;
      state.outOrderList = [];
      state.pagination.totalPages = 0;
    }
  });
};

/**
 * 上拉加载
 */
const loadMore = () => {
  if (state.pagination.page === state.pagination.totalPages) {
    state.finished = true;
    return;
  }
  state.pagination.page++;
  getOutOrderList();
};

/**
 * 全选
 */
const change = () => {
  state.outOrderList.forEach((v) => {
    return (v.status = state.allCheck);
  });
  if (state.allCheck === true) state.selectList = state.outOrderList;
  else state.selectList = [];
};

const goElectronicInvoice = () => {
  localStorage.set("tot", totalPrice.value);
  localStorage.set("seleted", JSON.stringify(state.selectList));
  router.push("/make/merge-order");
};
/**
 * 获取发票类型
 */
const getShop = () => {
  getShopApi().then((res) => {
    if (res.code === 1) state.minPrice = res.content.minPrice;
  });
};

const getWindowHeight = () => {
  const clientHeight = document.documentElement.clientHeight;
  state.windowHeight = clientHeight - 87 - (store.ifShowH5NavBar ? 46 : 0);
};

onMounted(() => {
  state.accessToken = localStorage.get("accessToken");
  state.orderType = route.query.type as string;
  localStorage.set("orderType", state.orderType);
  getShop();
  getMinusOutOrderList();
  getOutOrderList();
  getWindowHeight();
});
</script>

<template>
  <header v-if="store.ifShowH5NavBar" headerTitle="选择订单" />

  <div v-if="state.empty">
    <van-empty image="search" description="暂无订单数据" />
  </div>

  <van-list
    v-else
    v-model:loading="state.loading"
    :finished="state.finished"
    finished-text="没有更多数据了"
    class="page-checklist"
    :style="{ height: `${state.windowHeight}px` }"
    @load="loadMore"
  >
    <div v-if="state.minusOutOrderList.length > 0" style="margin-bottom: 30px">
      <p class="pd-left">
        有{{ minusOutOrderList.length }}笔欠费金额，欠费金额小计：¥{{
          minusAmount
        }}元
      </p>
      <div
        v-for="(item, index) in state.minusOutOrderList"
        :key="index"
        class="mint-checklist"
      >
        <div class="mint-cell-wrapper">
          <div>
            <van-checkbox
              v-model="item.status"
              icon-size="15px"
              shape="square"
            />
          </div>
          <div class="order-right" @click="checked(index)">
            <van-cell-group :border="false">
              <van-cell
                :title="`订单号：${item.no}`"
                :border="false"
                class="orderNum"
              />
              <van-cell
                v-if="item.fields"
                :title="Object.values(JSON.parse(item.fields))[0]"
                :value="item.noY"
                :border="false"
              />
              <van-cell
                :title="item.orderTime"
                class="price"
                :value="`￥${item.price}`"
                :border="false"
              />
            </van-cell-group>
          </div>
        </div>
      </div>
    </div>
    <div
      v-for="(item, index) in state.outOrderList"
      :key="index"
      class="mint-checklist"
    >
      <div class="mint-cell-wrapper">
        <div style="margin-top: 7px">
          <van-checkbox v-model="item.status" icon-size="15px" shape="square" />
        </div>
        <div class="order-right" @click="checked(index)">
          <van-cell-group :border="false">
            <van-cell
              :title="`订单号：${item.no}`"
              :border="false"
              class="orderNum"
            />
            <van-cell
              v-if="item.fields"
              :title="Object.values(JSON.parse(item.fields))[0]"
              :value="item.no"
              :border="false"
            />
            <van-cell
              :title="item.orderTime"
              class="price"
              :value="`￥${item.price}`"
              :border="false"
            />
          </van-cell-group>
        </div>
      </div>
    </div>
  </van-list>

  <div v-if="state.outOrderList.length > 0">
    <van-submit-bar
      :price="totalPrice * 100"
      button-text="下一步"
      :disabled="state.selectList.length < 1"
      button-color="#1989fa"
      @submit="goElectronicInvoice"
    >
      <van-checkbox v-model="state.allCheck" @click="change()">
        本页全选
      </van-checkbox>
      <template #tip> 最低开票金额{{ state.minPrice }}元 </template>
    </van-submit-bar>
  </div>
</template>

<style lang="less">
.page-checklist {
  .price {
    .van-cell__value {
      color: #ff4848;
    }
  }
}
</style>

<style lang="less" scoped>
.page-checklist {
  margin-bottom: 87px;
  height: 100%;
  padding: 0 16px;
  overflow: scroll !important;

  .mint-cell-wrapper {
    background: white;
    margin-top: 15px;
    display: flex;
    padding: 10px 12px;
    border-radius: 8px;
  }

  .order-right {
    margin-left: 12px;
    width: 100%;

    .van-cell {
      padding: 3px 10px;
    }
  }

  .pd-left {
    padding: 5px;
  }
}
</style>
