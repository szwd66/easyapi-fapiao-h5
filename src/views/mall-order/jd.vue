<script setup lang='ts'>
import { showConfirmDialog, showDialog, showToast } from 'vant'
import makeMixins from '../make/mixins/make'
import mallOrder from '@/api/mall-order'

const { checkEmailMobile } = makeMixins()

const route = useRoute()

const state = reactive({
  shopName: '',
  orderForm: {
    outOrderNo: '',
    price: '',
    email: '',
    qrCode: route.query.code,
    taxNumber: route.query.taxNumber,
  },
  keyboardShow: false,
})

/**
 * 点击开票
 */
function makeInvoice() {
  if (state.orderForm.outOrderNo === '') {
    showToast('请输入订单号')
    return
  }

  if (state.orderForm.price === '') {
    showToast('请输入订单金额')
    return
  }

  if (!checkEmailMobile(state.orderForm))
    return
  showConfirmDialog({
    title: '提示',
    message: '确认抬头和金额正确并申请开票吗？',
  }).then(() => {
    mallOrder.apply(state.orderForm).then((res) => {
      if (res.code === 1)
        showToast(res.message)
    })
  })
}

/**
 * 点击提示
 */
function openTips() {
  showDialog({
    title: '温馨提示',
    message: '打开京东APP，我的 - 我的订单 - 订单详情，找到订单编号，点击「复制」即可。',
  }).then(() => {
  })
}
</script>

<template>
  <div class="mall-order">
    <div class="image">
      <img src="https://qiniu.easyapi.com/mall/jd.png">
    </div>
    <div class="title">
      {{ state.shopName }}京东店铺 - 订单开票
    </div>

    <van-cell-group title="京东订单信息（已在京东申请开票的订单）" inset>
      <van-field
        v-model="state.orderForm.outOrderNo"
        label="订单号"
        placeholder="请输入京东订单编号"
        required
      />
      <van-field
        v-model="state.orderForm.price"
        readonly
        required
        clickable
        label="金额"
        placeholder="请输入京东订单金额"
        @touchstart.stop="state.keyboardShow = true"
      />
      <van-number-keyboard
        v-model="state.orderForm.price"
        :show="state.keyboardShow"
        theme="custom"
        extra-key="."
        close-button-text="完成"
        @blur="state.keyboardShow = false"
      />
    </van-cell-group>
    <div class="tips-forget" @click="openTips">
      我不知道京东订单号在哪里
    </div>
    <van-cell-group title="接收方式" inset>
      <van-field
        v-model="state.orderForm.email"
        label="邮箱"
        placeholder="请输入接收邮箱"
      />
    </van-cell-group>
    <div class="tips">
      <p>说明：</p>
      <p>1、请先通过京东APP我的订单申请开票，填写开票信息</p>
      <p>2、邮箱可不填写，可通过京东APP订单查询发票信息更方便</p>
      <p>3、如果填写的订单号不是我们店铺，将忽略本次开票申请</p>
    </div>
    <div class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="makeInvoice">
        开票
      </van-button>
    </div>
  </div>
</template>

<style lang='less' scoped>
@import './mall-order.less';
</style>
