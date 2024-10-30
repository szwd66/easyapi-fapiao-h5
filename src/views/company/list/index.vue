<script setup lang="ts">
import { closeToast, showLoadingToast } from 'vant'
import wx from 'jweixin-1.6.0'
import company from '@/api/company'
import { useStore } from '@/stores'
import config from '@/api/config'

const store = useStore()
const router = useRouter()
const route = useRoute()

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
  checked: '',
})

function getCompanyList() {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  })
  const params = {
    name: state.companyName,
    size: state.pagination.size,
    page: state.pagination.page,
  }
  company.getCompanyList(params).then((res) => {
    state.loading = false
    closeToast()
    if (res.code === 1) {
      state.companyList = state.companyList.concat(res.content)
      state.pagination.totalPages = res.totalPages
      state.companyList.forEach((item) => {
        if (item.ifDefault)
          state.checked = item.companyId
      })
    }
    else {
      state.companyList = []
      state.pagination.totalPages = 0
    }
  })
}

function companyNameSearch() {
  state.companyList = []
  state.pagination.page = 0
  state.noData = false
  state.noMoreData = false
  state.loading = true
  getCompanyList()
}

function select(item) {
  if (route.query.from)
    return

  state.checked = item.companyId
  // 设置为默认抬头
  company.updateCompanySetDefault(item.companyId).then((res) => {
    if (res.code === 1)
      history.back()
  })
}

function gotoEditCompany(companyId) {
  router.push({
    path: '/company/edit',
    query: { id: companyId },
  })
}

function getPageList() {
  if (state.pagination.page < state.pagination.totalPages - 1) {
    state.pagination.page = state.pagination.page + 1
    getCompanyList()
  }
  if (state.pagination.page === state.pagination.totalPages - 1)
    state.noMoreData = true
}

function lazyLoading() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight = document.documentElement.clientHeight
  const scrollHeight = document.documentElement.scrollHeight
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    // 滚动到底部，逻辑代码
    // 事件处理
    getPageList()
  }
}

/**
 * 选择微信抬头
 */
function selectWeiXinCompany() {
  config.getWeiXinConfig().then((res) => {
    if (res) {
      wx.config({
        beta: true,
        debug: true,
        timestamp: res.timestamp,
        nonceStr: res.nonceStr,
        signature: res.signature,
        appId: res.appId,
        jsApiList: ['chooseInvoiceTitle'],
      })
      wx.ready(() => {
        wx.invoke(
          'chooseInvoiceTitle',
          {
            scene: '1', // 不是必填  使用场景 1开具发票 2其他
          },
          (res) => {
            // 这里处理调用结果
            const info = res.choose_invoice_title_info
            if (info != null && info != undefined) {
              const infoJson = JSON.parse(info)
              // 0单位 1个人
              //	choose_invoice_title_info对象的结构如下：
              // { "type":"0", "title":"企业名称", "taxNumber":"企业税号", "companyAddress":"地址", "telephone":"手机号", "bankName":"银行", "bankAccount":"银行账号" }
            }
          },
        )
      })
      wx.error((res) => {
        console.info(JSON.stringify(res))
      })
    }
  })
}

onMounted(() => {
  getCompanyList()
  // 滚动到底部，再加载的处理事件
  window.addEventListener('scroll', lazyLoading)
})
</script>

<template>
  <Header v-if="store.ifShowH5NavBar" header-title="抬头管理" />
  <div :class="store.ifShowH5NavBar ? 'search-top' : 'search'">
    <van-search
      v-model="state.companyName"
      placeholder="请输入公司名称"
      @update:model-value="companyNameSearch"
    />
  </div>
  <div class="search-placeholder" />
  <div class="company">
    <div v-if="!state.loading">
      <div v-if="state.companyList.length === 0">
        <van-empty image="search" description="暂无数据" />
      </div>
      <div v-else class="company-list">
        <van-radio-group v-model="state.checked">
          <div
            v-for="(item, index) in state.companyList"
            :key="index"
            class="company-list-item"
            @click="select(item)"
          >
            <div class="company-list-item_content">
              <van-radio
                v-if="!route.query.from"
                class="company-list-item_radio"
                :name="item.companyId"
              />
              <div class="company-list-item_name">
                <div class="company-list-item_tag">
                  <van-tag v-if="item.ifDefault" type="primary" size="medium" class="tag" @click="selectWeiXinCompany">
                    默认
                  </van-tag>
                  <span class="rise-text">{{ item.name }}</span>
                </div>
                <div class="company-list-item_taxNumber">
                  {{ item.taxNumber }}
                </div>
              </div>
            </div>
            <van-icon
              name="edit"
              color="#999"
              size="22"
              @click.stop="gotoEditCompany(item.companyId)"
            />
          </div>
        </van-radio-group>
      </div>
    </div>
    <div v-if="state.loading" class="loading">
      <div>加载中......</div>
    </div>
    <div v-if="state.noMoreData" class="no-more-data">
      <div>没有更多数据了</div>
    </div>
  </div>
  <div class="bottom fixed-bottom-bgColor">
    <!-- <div> -->
    <van-button type="primary" block @click="gotoEditCompany('')">
      新增抬头
    </van-button>
    <!-- </div> -->
    <!-- <div>
      <van-button block @click="selectWeiXinCompany">
        选择微信抬头
      </van-button>
    </div> -->
  </div>
</template>

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
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 10px;

      .company-list-item_content {
        display: flex;
        align-items: center;

        .company-list-item_radio {
          margin-right: 20px;
        }

        .company-list-item_name {
          .company-list-item_tag {
            display: flex;
            align-items: center;

            .tag {
              margin-right: 5px;
            }

            .rise-text {
              max-width: 200px;
              display: block;
              overflow: hidden; /*内容超出后隐藏*/
              text-overflow: ellipsis; /* 超出内容显示为省略号*/
              white-space: nowrap; /*文本不进行换行*/
              font-size: 16px;
              font-weight: 550;
            }
          }

          .company-list-item_taxNumber {
            margin-top: 10px;
            color: #999;
            font-size: 13px;
          }
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
  display: flex;
  align-items: center;
  justify-content: space-between;

  // div {
  //   width: 48%;
  // }
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
