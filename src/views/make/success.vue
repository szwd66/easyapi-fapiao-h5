<script setup lang='ts'>
const router = useRouter()

const gotoInvoiceList = () => {
  router.replace('/invoice/record')
}
const gotoIndex = () => {
  router.replace('/')
}
</script>

<template>
  <div class="success">
    <van-icon name="checked" color="#19be6b" size="120" />
    <div class="success-button">
      <van-button type="default" plain block round @click="gotoIndex">
        返回首页
      </van-button>
      <van-divider hairline />
      <van-button type="default" plain block round @click="gotoInvoiceList">
        开票记录
      </van-button>
    </div>
  </div>
</template>

<style lang='less' scoped>
@import './success.less';
</style>
