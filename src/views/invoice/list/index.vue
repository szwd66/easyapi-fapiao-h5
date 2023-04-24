<script setup lang='ts'>
import dayjs from 'dayjs'
import { showToast } from 'vant'
import { getInvoiceListApi } from '@/api/invoice'
import { useStore } from '@/stores'
import { invoiceTag } from '@/utils/invoice-category'
import { copyText } from '@/utils/invoice'
import Clipboard from "clipboard";

const store = useStore()
const router = useRouter()

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
  ifRouter: true,
})

/**
 * 获取发票列表
 */
function getInvoiceList() {
  const params = {
    size: state.pagination.size,
    page: state.pagination.page - 1,
    startAddTime: state.startAddTime,
    endAddTime: state.endAddTime,
  }
  getInvoiceListApi(params).then((res) => {
    state.loading = false
    if (res.code === 1) {
      state.pagination.totalPages = res.totalPages
      state.invoiceList = state.invoiceList.concat(res.content)
    } else {
      state.empty = true
      state.invoiceList = []
    }
  })
}

/**
 * 上拉加载
 */
function loadMore() {
  if (state.pagination.page === state.pagination.totalPages) {
    state.finished = true
    return
  }
  state.pagination.page++
  getInvoiceList()
}

/**
 * 跳转详情
 */
function gotoDetail(id) {
  if (!state.ifRouter) {
    return
  }
  setTimeout(() => {
    router.push({ path: '/invoice/detail', query: { id } })
  }, 10)
}

function formatDate(date) {
  return `${date.getYear() + 1900}/${date.getMonth() + 1}/${date.getDate()}`
}

function onConfirm(date) {
  const [start, end] = date
  state.showCalendar = false
  state.date = `${formatDate(start)} - ${formatDate(end)}`
  state.startAddTime = dayjs(date[0]).format('YYYY-MM-DD 00:00:00')
  state.endAddTime = dayjs(date[1]).format('YYYY-MM-DD 23:59:59')
  state.pagination.page = 0
  state.invoiceList = []
  state.empty = false
  state.showDown = false
  state.showCross = true
  state.finished = false
  getInvoiceList()
}

function clearDate() {
  state.date = ''
  state.startAddTime = ''
  state.endAddTime = ''
  state.pagination.page = 0
  state.invoiceList = []
  state.empty = false
  state.showDown = true
  state.showCross = false
  state.finished = false
}

function getWindowHeight() {
  const clientHeight = document.documentElement.clientHeight
  state.windowHeight = clientHeight - 69 - (store.ifShowH5NavBar ? 46 : 0)
}

function copyLink() {
  state.ifRouter = false
  const newClipboard = new Clipboard('.copyBtn')
  newClipboard.on('success', () => {
    showToast('复制成功')
    state.ifRouter = true
  })
  newClipboard.on('error', () => {
    showToast('复制失败')
    state.ifRouter = true
  })
}

onMounted(() => {
  getWindowHeight()
  getInvoiceList()
})
</script>

<template>
  <Header v-if="store.ifShowH5NavBar" header-title="开票记录" />
  <div class="record-list">
    <div>
      <van-cell title="发票日期" :value="state.date" center @click="state.showCalendar = true">
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
      :style="{ height: `${state.windowHeight}px` }"
      @load="loadMore"
    >
      <div
        v-for="(item, index) in state.invoiceList"
        :key="index"
        class="record-list_item"
        @click="gotoDetail(item.invoiceId)"
      >
        <div class="record-list_item_top">
          <div>
            <span class="price">￥{{ item.price }}</span>
            <van-tag :color="invoiceTag(item).color">
              {{ invoiceTag(item).name }}
            </van-tag>
          </div>
          <span class="status">{{ item.statements }}</span>
        </div>
        <div class="record-list_item_bottom">
          <p class="text">
            <span>{{ item.purchaserName }}</span>
          </p>
          <p class="record-list_item_bottom_time">
            <span>{{ item.addTime }}</span>
            <van-button class="copyBtn" v-if="item.state === 1" size="mini" type="primary" data-clipboard-action="copy" :data-clipboard-text="copyText(item)" @click="copyLink">
              复制发票信息
            </van-button>
          </p>
        </div>
      </div>
    </van-list>
  </div>
</template>

<style lang='less'>
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

<style lang='less' scoped>
.record-list {
  padding: 15px 16px 0 16px;

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

      .price {
        color: #ff4848;
        margin-right: 10px;
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
    }
  }
}
</style>
