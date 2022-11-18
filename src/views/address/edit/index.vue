<template>
  <header headerTitle='编辑地址' v-if='store.ifShowH5NavBar'></header>
  <div class='address-edit'>
    <van-cell-group inset>
      <van-field
        label='收件人'
        v-model='state.addressForm.name'
        placeholder='请输入收货人姓名'
        border
      />
      <van-field
        label='联系电话'
        v-model='state.addressForm.mobile'
        placeholder='请输入收货人手机号'
        border
      />
      <van-field
        label='所在地区'
        v-model='state.addressForm.area'
        placeholder='请选择省市区县'
        border
        readonly
        @click='state.showPopup = true'
      />
      <van-field
        label='详细地址'
        v-model='state.addressForm.addr'
        placeholder='请街道、小区门牌号'
        border
      />
    </van-cell-group>

    <van-cell-group class='default' inset>
      <van-cell center title='设置为默认地址'>
        <template #right-icon>
          <van-switch v-model='state.addressForm.ifDefault' active-color='#FFC2A8' />
        </template>
      </van-cell>
    </van-cell-group>

    <van-popup v-model:show='state.showPopup' position='bottom' :style="{ height: '50%' }">
      <van-area title='请选择所在地区' :area-list='state.areaList' @confirm='onAddrConfirm' />
    </van-popup>
    <div class='bottom fixed-bottom-bgColor'>
      <van-button type='primary' class='save' block @click='confirm'>保存</van-button>
      <van-button type='danger' v-if='route.query.id' class='delete' block @click='deleteData'>
        删除
      </van-button>
    </div>
  </div>
</template>
<script setup lang='ts'>
import { createAddressApi, deleteAddressApi, getAddressApi, updateAddressApi } from '@/api/address';
import { showConfirmDialog, showToast } from 'vant';
import { getAreaListApi } from '@/api/area';
import { useStore } from '@/stores';

const store = useStore();

const route = useRoute();

const state = reactive({
  addressForm: {
    area: '',
    province: '',
    city: '',
    district: '',
    name: '',
    mobile: '',
    addr: '',
    ifDefault: false,
  },
  name: '',
  showPopup: false,
  areaList: {},
});

const getAddress = () => {
  getAddressApi(route.query.id).then(res => {
    if (res.code === 1) {
      state.addressForm = res.content;
      state.addressForm.area = state.addressForm.province + state.addressForm.city + state.addressForm.district;
    }
  });
};

const getAreaList = () => {
  getAreaListApi().then(res => {
    if (res.status == 1) {
      const provinces = res.provinces;
      const province_list = {};
      const city_list = {};
      const county_list = {};
      for (const a of provinces) {
        const provinceKey = a.code.toString();
        province_list[provinceKey] = a.name;
        for (const i of a.cities) {
          const cityKey = i.code.toString();
          city_list[cityKey] = i.name;
          if (i.districts.length > 0) {
            for (const k of i.districts) {
              const districtsKey = k.id.toString();
              county_list[districtsKey] = k.name;
            }
          } else {
            county_list[cityKey] = i.name;
          }
        }
      }
      state.areaList['province_list'] = province_list;
      state.areaList['city_list'] = city_list;
      state.areaList['county_list'] = county_list;
    }
  });
};

/**
 * 删除地址
 */
const deleteData = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定删除?',
  }).then(() => {
    deleteAddressApi(route.query.id).then(res => {
      if (res.code === 1) {
        history.back();
      }
    });
  });
};

const confirm = () => {
  if (
    !state.addressForm.name ||
    !state.addressForm.mobile ||
    !state.addressForm.area ||
    !state.addressForm.addr
  ) {
    showToast('请将信息填写完整！');
    return;
  }
  showConfirmDialog({
    title: '提示',
    message: '确定提交吗？',
  }).then(() => {
    if (route.query.id) {
      updateAddressApi(route.query.id, state.addressForm).then(res => {
        if (res.code === 1) {
          history.back();
        }
      });
    } else {
      createAddressApi(state.addressForm).then(res => {
        if (res.code === 1) {
          history.back();
        }
      });
    }
  });
};
const onAddrConfirm = e => {
  state.addressForm.province = e.selectedOptions[0].text;
  state.addressForm.city = e.selectedOptions[1].text;
  state.addressForm.district = e.selectedOptions[2].text;
  state.addressForm.area =
    state.addressForm.province + state.addressForm.city + state.addressForm.district;
  state.showPopup = false;
};

onMounted(() => {
  if (route.query.id) {
    getAddress();
  }
  getAreaList();
});
</script>

<style lang='less' scoped>
.address-edit {
  padding-top: 15px;

  .default {
    margin-top: 15px;
  }

  .bottom {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 10px 16px;

    .save,
    .delete {
      border: none;
      height: 40px;
      border-radius: 5px;
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 2px;
      text-indent: 2px;
    }

    .delete {
      margin-top: 10px;
    }
  }
}
</style>
