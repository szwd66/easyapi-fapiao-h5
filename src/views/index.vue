<template>
  <div>
    <van-cell-group v-if="state.ifOrderMake === true" title="订单开票" inset>
      <van-cell
        v-for="type in state.orderTypeList"
        :key="type.orderTypeId"
        :title="type.name"
        is-link
        :to="{ path: '/out-order', query: { type: type.name } }"
        size="large"
      />
    </van-cell-group>
    <van-cell-group title="发票管理" inset>
      <van-cell title="开票记录" is-link to="/invoice/record" />
      <van-cell title="开票规则" is-link to="/rule" />
      <van-cell
        title="抬头管理"
        is-link
        :to="{ path: '/company/list', params: { from: state.index } }"
      />
      <van-cell
        title="地址管理"
        is-link
        :to="{ path: '/address/list', params: { from: state.index } }"
      />
    </van-cell-group>
    <div class="remark">如果无法提交开票申请，请联系客服13656171020</div>
    <div v-if="state.ifProductMake || state.ifMoneyMake" class="bottom fixed-bottom-bgColor">
      <van-button type="primary" class="submit" block @click="gotoMake">我要开票</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showLoadingToast, closeToast } from 'vant';
import { localStorage } from '@/utils/local-storage';
import { getShopApi } from '@/api/shop';
import { findSettingApi } from '@/api/setting';
import { getOrderTypeListApi } from '@/api/order-type';

const route = useRoute();
const router = useRouter();

const state = shallowReactive({
  index: '',
  ifProductMake: false, //是否支持商品清单开票
  ifMoneyMake: false, //是否支持金额开票
  ifOrderMake: false, //是否支持订单开票
  orderTypeList: [], //订单开票类型列表
});

const initialization = () => {
  localStorage.remove('ifProductMake');
  localStorage.remove('ifMoneyMake');
  localStorage.remove('ifOrderMake');
  if (route.query.accessToken) {
    localStorage.set('accessToken', route.query.accessToken);
  } else {
    if (!localStorage.get('accessToken')) {
      router.push('/error');
    }
  }
};

const gotoMake = () => {
  if (state.ifProductMake) {
    router.push(`/make/product`);
  }
  if (state.ifMoneyMake) {
    router.push(`/make/category`);
  }
};

/**
 * 获取发票类型
 */
const getShop = () => {
  getShopApi().then(res => {
    if (res.code === 1) {
      localStorage.set('ifElectronic', res.content.ifElectronic);
      localStorage.set('ifPaper', res.content.ifPaper);
    }
  });
};

/**
 * 获取订单类型列表
 */
const getOrderTypeList = () => {
  getOrderTypeListApi().then(res => {
    if (res.code === 1) {
      state.orderTypeList = res.content;
      setTimeout(function () {
        closeToast();
      }, 1000);
    }
  });
};

/**
 * 获取发票开票类型
 */
const findSetting = () => {
  findSettingApi({
    fieldKeys: 'if_product' + ',' + 'if_money' + ',' + 'if_order',
  }).then(res => {
    if (res.code === 1) {
      for (let setting of res.content) {
        if (setting.fieldKey === 'if_product') {
          state.ifProductMake = setting.fieldValue == 'true';
          localStorage.set('ifProductMake', state.ifProductMake);
        } else if (setting.fieldKey === 'if_money') {
          state.ifMoneyMake = setting.fieldValue == 'true';
          localStorage.set('ifMoneyMake', state.ifMoneyMake);
        } else if (setting.fieldKey === 'if_order') {
          state.ifOrderMake = setting.fieldValue == 'true';
          localStorage.set('ifOrderMake', state.ifOrderMake);
        }
      }
    }
  });
};

onMounted(() => {
  initialization();
  showLoadingToast({
    duration: 0,
    message: '加载中...',
    forbidClick: true,
  });
  getShop();
  getOrderTypeList();
  setTimeout(() => {
    findSetting();
  }, 1000);
});
</script>

<style lang="less" scoped>
.remark {
  padding: 15px 20px;
  color: #666;
  font-size: 12px;
}

.bottom {
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 10px 20px;

  .submit {
    border: none;
    height: 40px;
    border-radius: 5px;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 2px;
    text-indent: 2px;
  }
}
</style>
