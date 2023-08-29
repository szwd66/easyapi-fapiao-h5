<script setup lang='ts'>
import { closeToast, showLoadingToast, showToast } from 'vant'
import Clipboard from 'clipboard'
import { getInvoiceApi, sendEmail } from '@/api/invoice'
import { getOutOrderCountApi } from '@/api/out-order'
import { copyText } from '@/utils/invoice'
import { useStore } from '@/stores'

const store = useStore()
const route = useRoute()
const router = useRouter()

const state = reactive({
  outOrderCount: 0,
  popupVisible: false,
  invoiceDetail: {
    state: 0,
    category: '',
    statements: '',
    auditState: '',
    consoleReason: '',
    purchaserName: '',
    purchaserTaxpayerNumber: '',
    purchaserAddress: '',
    purchaserPhone: '',
    purchaserBank: '',
    purchaserBankAccount: '',
    price: '',
    remark: '',
    email: '',
    addrMobile: '',
    updateTime: '',
    electronicInvoiceImg: '',
    electronicInvoiceUrl: '',
    url: '',
  },
  copyInfo: '',
})

/**
 * 查看发票
 */
function viewPicture() {
  if (state.invoiceDetail.state === 1)
    state.popupVisible = true
  else
    showToast(`发票${state.invoiceDetail.statements}`)
}

/**
 * 前往外部订单列表
 */
function gotoOutOrder() {
  router.push({
    path: '/invoice/out-order',
    query: { id: route.query.id },
  })
}

function copyLink() {
  const newClipboard = new Clipboard('.copyPdfUrl')
  newClipboard.on('success', () => {
    showToast('复制成功')
  })
  newClipboard.on('error', () => {
    showToast('复制失败')
  })
}

/**
 * 获取发票详情
 */
function getInvoiceDetail() {
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  })
  getInvoiceApi(route.query.id).then((res) => {
    closeToast()
    if (res.code === 1) {
      state.invoiceDetail = res.content
      state.copyInfo = copyText(res.content)
    }
  })
}

/**
 * 获取外部订单数量
 */
function getOutOrderCount() {
  getOutOrderCountApi({ invoiceId: route.query.id }).then((res) => {
    if (res.code === 1)
      state.outOrderCount = res.content
  })
}

/**
 * 发送邮箱
 */
function sendToEmail() {
  sendEmail({ email: state.invoiceDetail.email, outOrderNo: state.invoiceDetail.outOrderNo }).then((res) => {
    if (res.code === 1)
      showToast(res.message)
  })
}

onMounted(() => {
  getInvoiceDetail()
  getOutOrderCount()
})
</script>

<template>
  <Header v-if="store.ifShowH5NavBar" header-title="发票详情" />
  <div class="invoice-detail">
    <div class="types">
      <van-icon name="checked" size="20" />
      {{ state.invoiceDetail.statements }}
    </div>
    <van-cell-group inset @click="viewPicture">
      <van-cell
        :title="`${state.invoiceDetail.category}（${state.invoiceDetail.statements}）`"
        is-link
      />
      <van-cell
        v-if="state.outOrderCount > 0"
        :title="`1张发票，含${state.outOrderCount}个订单`"
        :label="state.invoiceDetail.updateTime"
        is-link
        @click="gotoOutOrder"
      />
      <van-cell v-if="state.invoiceDetail.auditState" title="未通过原因：">
        <van-tag type="warning">
          {{ state.invoiceDetail.consoleReason }}
        </van-tag>
      </van-cell>
    </van-cell-group>

    <van-cell-group title="发票详情" inset>
      <van-cell :value="state.invoiceDetail.purchaserName" title="发票抬头" />
      <van-cell
        :value="state.invoiceDetail.purchaserTaxpayerNumber"
        title="税号"
      />
      <van-cell
        :value="
          state.invoiceDetail.purchaserAddress
            + state.invoiceDetail.purchaserPhone
        "
        title="地址、电话"
      />
      <van-cell
        :value="
          state.invoiceDetail.purchaserBank
            + state.invoiceDetail.purchaserBankAccount
        "
        title="开户行及账号"
      />
      <van-cell :value="state.invoiceDetail.price" title="发票金额" />
      <van-cell :value="state.invoiceDetail.remark" title="备注" />
    </van-cell-group>

    <van-cell-group
      v-if="state.invoiceDetail.category.indexOf('电子') !== -1"
      title="接收方式"
      inset
    >
      <van-cell :value="state.invoiceDetail.email" title="电子邮件" />
      <van-cell :value="state.invoiceDetail.addrMobile" title="手机号码" />
    </van-cell-group>

    <van-cell-group
      v-if="
        state.invoiceDetail.category === '增值税普通发票'
          || state.invoiceDetail.category === '增值税专用发票'
      "
      title="接收方式"
      inset
    >
      <van-field label="收件人" readonly />
      <van-field label="手机号码" readonly />
    </van-cell-group>

    <van-action-bar v-if="state.invoiceDetail.state === 1">
      <van-action-bar-button data-clipboard-action="copy" class="copyPdfUrl" :data-clipboard-text="state.copyInfo" color="#01a8b9" text="复制发票信息" @click="copyLink" />
      <van-action-bar-button color="#409eff" text="预览发票" @click="viewPicture" />
      <van-action-bar-button v-if="state.invoiceDetail.category.indexOf('电子') !== -1" type="success" text="发送邮箱" @click="sendToEmail" />
    </van-action-bar>

    <van-popup
      v-model:show="state.popupVisible"
      style="padding: 30px"
      align="center"
    >
      <p style="font-size: 18px; margin-bottom: 20px">
        发票预览
      </p>
      <img
        :src="state.invoiceDetail.electronicInvoiceImg"
        alt=""
        style="width: 350px"
      >
      <div style="margin-bottom: 20px">
        <van-button
          type="primary"
          data-clipboard-action="copy"
          class="copyPdfUrl submit"
          :data-clipboard-text="state.copyInfo"
          @click="copyLink"
        >
          复制发票下载地址
        </van-button>
      </div>
      <div style="width: 300px; font-size: 12px">
        <textarea
          :value="state.invoiceDetail.electronicInvoiceUrl"
          style="width: 300px"
        />
      </div>
      <p style="margin-top: 20px">
        复制发票下载地址并在浏览器中打开进行下载
      </p>
    </van-popup>
  </div>
</template>

<style lang='less'>
.invoice-detail {
  .types{
    margin-bottom: 20px;
    text-align: center;
  }
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
.invoice-detail {
  padding-top: 20px;

  .submit {
    border: none;
    height: 40px;
    border-radius: 5px;
    color: #fff;
  }
}
</style>
