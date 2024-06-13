<script setup lang='ts'>
import { closeToast, showImagePreview, showLoadingToast, showToast } from 'vant'
import Clipboard from 'clipboard'
import { getIconByStatements } from '@/utils/invoice-category'
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
  showEmail: false,
  email: '',
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
    mobile: '',
    updateTime: '',
    electronicInvoiceImg: '',
    electronicInvoiceUrl: '',
    url: '',
  },
  copyInfo: '',
  attachList: [],
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
      state.attachList = res.content.invoiceExtends && res.content.invoiceExtends.length > 0 ? res.content.invoiceExtends.filter(item => item.fieldKey === 'attch' && item.fieldValue)[0].fieldValue.split(',') : []
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

function openShowEmail() {
  state.showEmail = true
  state.email = state.invoiceDetail.email
}

/**
 * 发送邮箱
 */
function sendToEmail() {
  if (!state.email)
    return showToast('请输入邮箱')
  const params = {
    email: state.email,
    outOrderNo: state.invoiceDetail.outOrderNo,
  }
  sendEmail(params).then((res) => {
    if (res.code === 1) {
      showToast(res.message)
      state.showEmail = false
    }
  })
}

function viewImagePreview(imgs: any) {
  showImagePreview(imgs)
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
      <van-icon :name="getIconByStatements(state.invoiceDetail.statements)" size="20" />
      {{ state.invoiceDetail.statements }}
    </div>
    <van-cell-group inset @click="viewPicture">
      <van-cell :title="`${state.invoiceDetail.category}`" is-link />
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
      <van-cell :value="state.invoiceDetail.purchaserTaxpayerNumber" title="税号" />
      <van-cell :value="state.invoiceDetail.purchaserAddress + state.invoiceDetail.purchaserPhone" title="地址、电话" />
      <van-cell :value="state.invoiceDetail.purchaserBank + state.invoiceDetail.purchaserBankAccount" title="开户行及账号" />
      <van-cell :value="state.invoiceDetail.price" title="发票金额" />
      <van-cell :value="state.invoiceDetail.remark" title="备注" />
    </van-cell-group>
    <div v-if="state.attachList.length > 0" class="card">
      <div class="title">
        附件
      </div>
      <div class="attch">
        <img v-for="(item, index) in state.attachList" :key="index" :src="item" @click="viewImagePreview(state.attachList)">
      </div>
    </div>
    <van-cell-group v-if="state.invoiceDetail.category.indexOf('电子') !== -1" title="接收方式" inset>
      <van-cell :value="state.invoiceDetail.email" title="电子邮件" />
      <van-cell :value="state.invoiceDetail.mobile" title="手机号码" />
    </van-cell-group>
    <van-cell-group v-if="state.invoiceDetail.category === '增值税普通发票' || state.invoiceDetail.category === '增值税专用发票'" title="接收方式" inset>
      <van-field label="收件人" readonly />
      <van-field label="手机号码" readonly />
    </van-cell-group>
    <van-action-bar v-if="state.invoiceDetail.state === 1">
      <van-action-bar-button data-clipboard-action="copy" class="copyPdfUrl" :data-clipboard-text="state.copyInfo" color="#01a8b9" text="复制发票信息" @click="copyLink" />
      <van-action-bar-button color="#409eff" text="预览发票" @click="viewPicture" />
      <van-action-bar-button v-if="state.invoiceDetail.category.indexOf('电子') !== -1" type="success" text="发送邮箱" @click="openShowEmail" />
    </van-action-bar>
    <van-popup
      v-model:show="state.showEmail"
      align="center"
      class="send-email"
    >
      <div class="title">
        发送邮箱
      </div>
      <van-field
        v-model="state.email"
        clickable
        label="邮箱"
        placeholder="请输入邮箱"
        required
        border
      />
      <van-button type="primary" block @click="sendToEmail">
        确认
      </van-button>
    </van-popup>
    <van-popup
      v-model:show="state.popupVisible"
      style="padding: 30px"
      align="center"
    >
      <p style="font-size: 18px; margin-bottom: 20px">
        发票预览
      </p>
      <img :src="state.invoiceDetail.electronicInvoiceImg" alt="" class="electronic" @click="viewImagePreview([state.invoiceDetail.electronicInvoiceImg])">
      <div style="margin-bottom: 10px">
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
      <div style="width: 100%; font-size: 12px">
        <van-field
          v-model="state.invoiceDetail.electronicInvoiceUrl"
          rows="1"
          autosize
          type="textarea"
          class="textarea"
          readonly
        />
      </div>
      <p style="margin-top: 10px">
        复制发票下载地址并在浏览器中打开进行下载
      </p>
    </van-popup>
  </div>
</template>

<style lang='less'>
.invoice-detail {
  margin-bottom: 65px;
  .types{
    position: absolute;
    top: 0;
    margin: 0 auto;
    background-color: #00B2C7;
    color: white;
    width: 100%;
    height: 120px;
    line-height: 80px;
    font-size: 22px;
    text-align: center;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
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
.electronic{
  width: 100%;
}
.textarea{
  width: 100%;
  border: 0.5px solid #bbbbbb;
}
.send-email{
  padding: 20px;
  .title{
    font-size: 18px;
  }
  .van-field{
    margin: 20px 0;
    flex-wrap: nowrap;
  }
}
</style>

<style lang='less' scoped>
.invoice-detail {
  padding-top: 80px;
  .submit {
    border: none;
    height: 40px;
    border-radius: 5px;
    color: #fff;
  }

  .card{
    padding: 0 15px;

    .title{
      color: #969799;
      padding: 15px 0;
    }

    .attch{
      padding: 15px 15px 5px 15px;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-wrap: wrap;

      img{
        width: 120px;
        margin-right: 10px;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
