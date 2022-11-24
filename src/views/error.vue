<script setup lang='ts'></script>

<template>
  <div class="error">
    <van-icon name="clear" color="#ed4014" size="100" />
    <p>信息错误</p>
    <p>请重新进入</p>
  </div>
</template>

<style lang='less' scoped>
.error {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  p {
    font-size: 14px;
    line-height: 30px;
    color: #666;
  }
}
</style>
