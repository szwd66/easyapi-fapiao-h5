<template>
  <header class="header">
    <van-nav-bar :title="headerTitle" left-arrow @click-left="goBack()" />
  </header>
  <div class="header-placeholder"></div>
</template>

<script setup lang="ts">
const props = defineProps({
  headerTitle: {
    type: String,
  },
});

const goBack = () => {
  history.go(-1);
};
</script>

<style lang="less" scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
}

.header-placeholder {
  width: 100%;
  height: 46px;
}
</style>
