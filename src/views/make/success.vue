<template>
  <div class="success">
    <van-icon name="checked" color="#19be6b" size="120" />
    <div class="success-button">
      <van-button type="default" plain block round @click="gotoIndex">返回首页</van-button>
      <van-divider hairline />
      <van-button type="default" plain block round @click="gotoInvoiceList">开票记录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

const gotoInvoiceList = () => {
  router.replace(`/invoice/record`);
};
const gotoIndex = () => {
  router.replace('/');
};
</script>

<style lang="less" scoped>
.success {
  margin-top: 120px;
  text-align: center;
  padding: 0 10px;
}

.success-button {
  margin-top: 30px;
}
</style>
