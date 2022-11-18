<template>
  <header headerTitle="开票记录" v-if="store.ifShowH5NavBar"></header>
  <div class="record-list">
    <div>
      <van-cell title="发票日期" :value="state.date" @click="state.showCalendar = true" center>
        <template #right-icon>
          <van-icon v-if="state.showDown" name="arrow-down" />
          <van-icon v-if="state.showCross" name="cross" @click.stop="clearDate" />
        </template>
      </van-cell>
      <van-calendar
        v-model:show="state.showCalendar"
        type="range"
        color="#1989fa"
        :min-date="state.minDate"
        @confirm="onConfirm"
      />
    </div>
    <div v-if="state.empty">
      <van-empty image="search" description="暂时还没有开票记录" />
    </div>
    <van-list
      v-else
      v-model:loading="state.loading"
      :finished="state.finished"
      finished-text="没有更多数据了"
      @load="loadMore"
      :style="{ height: state.windowHeight + 'px' }"
    >
      <div
        class="record-list_item"
        v-for="(item, index) in state.invoiceList"
        :key="index"
        @click="gotoDetail(item.invoiceId)"
      >
        <div class="record-list_item_top">
          <van-tag v-if="item.category === '增值税电子普通发票'" type="danger">电</van-tag>
          <van-tag v-else-if="item.category === '增值税普通发票'" type="danger">普</van-tag>
          <van-tag v-else-if="item.category === '增值税专用发票'" type="danger">专</van-tag>
          <van-tag v-else type="danger">票</van-tag>
          <span class="status">{{ item.statements }}</span>
        </div>
        <div class="record-list_item_bottom">
          <p class="text">
            <span>{{ item.purchaserName }}</span>
          </p>
          <p class="record-list_item_bottom_time">
            <span>{{ item.addTime }}</span>
            <span class="price">￥{{ item.price }}</span>
          </p>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { Header } from '@/components';
import { getRecordListApi } from '@/api/record';
import moment from 'moment';
import { useStore } from '@/stores';
const store = useStore();
const router = useRouter();

const state = reactive({
  loading: true,
  empty: false,
  finished: false,
  pagination: {
    page: 1,
    size: 10,
    totalPages: 0,
  },
  startAddTime: '',
  endAddTime: '',
  invoiceList: [],
  date: '',
  showCalendar: false,
  showDown: true,
  showCross: false,
  minDate: new Date(2000, 0, 1),
  windowHeight: 0,
});

/**
 * 获取发票类型
 */
const getRecordList = () => {
  const params = {
    size: state.pagination.size,
    page: state.pagination.page - 1,
    startAddTime: state.startAddTime,
    endAddTime: state.endAddTime,
  };
  getRecordListApi(params).then(res => {
    state.loading = false;
    if (res.code === 1) {
      state.pagination.totalPages = res.totalPages;
      state.invoiceList = state.invoiceList.concat(res.content);
    } else {
      state.empty = true;
      state.invoiceList = [];
    }
  });
};

/**
 * 上拉加载
 */
const loadMore = () => {
  if (state.pagination.page == state.pagination.totalPages) {
    state.finished = true;
    return;
  }
  state.pagination.page++;
  getRecordList();
};

/**
 * 跳转详情
 */
const gotoDetail = id => {
  router.push({ path: '/invoice/detail', query: { id: id } });
};

const formatDate = date => {
  return `${date.getYear() + 1900}/${date.getMonth() + 1}/${date.getDate()}`;
};

const onConfirm = date => {
  const [start, end] = date;
  state.showCalendar = false;
  state.date = `${formatDate(start)} - ${formatDate(end)}`;
  state.startAddTime = moment(date[0]).format('YYYY-MM-DD 00:00:00');
  state.endAddTime = moment(date[1]).format('YYYY-MM-DD 23:59:59');
  state.pagination.page = 0;
  state.invoiceList = [];
  state.empty = false;
  state.showDown = false;
  state.showCross = true;
  state.finished = false;
  getRecordList();
};

const clearDate = () => {
  state.date = '';
  state.startAddTime = '';
  state.endAddTime = '';
  state.pagination.page = 0;
  state.invoiceList = [];
  state.empty = false;
  state.showDown = true;
  state.showCross = false;
  state.finished = false;
};

const getWindowHeight = () => {
  const clientHeight = document.documentElement.clientHeight;
  state.windowHeight = clientHeight - 69 - (store.ifShowH5NavBar ? 46 : 0);
};

onMounted(() => {
  getWindowHeight();
  getRecordList();
});
</script>

<style lang="less">
.record-list {
  .van-cell__value {
    min-width: 60%;
    margin-right: 8px;
    span {
      display: inline-block;
      text-align: left;
      word-break: break-all;
    }
  }
}
</style>
<style lang="less" scoped>
.record-list {
  padding: 15px 16px 0px 16px;

  .record-list_item {
    background: url('@/assets/images/record-bg.png') no-repeat center;
    background-size: 100% 100%;
    padding: 15px 24px 20px;
    margin-top: 10px;

    .record-list_item_top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .status {
        color: #1989fa;
      }
    }

    .record-list_item_bottom {
      margin-top: 30px;

      .text {
        color: #333;
        font-size: 14px;
      }

      .record-list_item_bottom_time {
        margin-top: 10px;
        color: #666;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .price {
        color: #ff4848;
      }
    }
  }
}
</style>
