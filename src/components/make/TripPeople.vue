<script setup lang="ts">
import area from '@/api/area'
import { useTripDataStore } from '@/stores'
import { idTypes, planeLevels, shippingLevels, trainLevels, vehicleTypes } from '@/utils/business'
import { showToast } from 'vant'

const emit = defineEmits(['update:invoiceForm'])
const now = new Date()
const state = reactive({
  ifDefault: true,
  show: false, // 控制显示出行人信息
  hide: true,
  invoiceForm: [
    {
      tripPeopleForm: {},
      // 展示和隐藏下拉框
      showPopup: false,
      showCascader: false,
      showCascaderTwo: false,
      showVehicle: false,
      showLevel: false,

      cascaderValue: '',
      cascaderTwoValue: '',
      areaList: [] as any,
      areaListTwo: [] as any,
      pickerValueOne: '',
      pickerValueTwo: '',
      idTypeList: [],
      vehicleTypeList: [],
      travelDateFormatter: [now.getFullYear(), now.getMonth() + 1, now.getDate()],
      showPicker: false,
    },
  ],
})

const router = useRouter()

/**
 * 展示更多出行人信息
 */
function showMore() {
  state.show = true
  state.hide = false
}

function packUpInfo() {
  state.show = false
  state.hide = true
}

function onConfirm(event, index, item) {
  const { selectedOptions, selectedValues } = event
  if (index === 1) {
    item.showPopup = false
    item.pickerValueOne = selectedOptions[0].text
    item.idTypeList = selectedValues
    item.tripPeopleForm.idType = item.idTypeList[0]
  }
  else if (index === 2) {
    item.showVehicle = false
    if (item.tripPeopleForm.level) {
      item.tripPeopleForm.level = ''
    }
    item.pickerValueTwo = selectedOptions[0].text
    item.vehicleTypeList = selectedValues
    item.tripPeopleForm.vehicleType = item.vehicleTypeList[0]
  }
  else if (index === 3) {
    item.showLevel = false
    item.tripPeopleForm.level = selectedOptions[0].text
  }
}

/**
 * 获取省市区地址
 */
function getAreaList() {
  area.getAreaList().then((res) => {
    areaListData(res.provinces)
    state.invoiceForm.forEach((item) => {
      item.areaList = JSON.parse(JSON.stringify(res.provinces))
      item.areaListTwo = JSON.parse(JSON.stringify(res.provinces))
    })
  })
}

function onFinish(Event, item, index) {
  const { selectedOptions } = Event
  if (index === 1) {
    item.showCascader = false
    item.tripPeopleForm.travelDeparturePlace = selectedOptions.map(option => option.text).join('/')
  }
  else {
    item.showCascaderTwo = false
    item.tripPeopleForm.travelDestinationPlace = selectedOptions.map(option => option.text).join('/')
  }
}

/**
 * 将接口数据转化为vant-picker组件需要的数据格式
 */
function areaListData(data) {
  data.forEach((item) => {
    item.value = item.name
    item.text = item.name
    item.children = item.cities
    delete item.name
    if (item.cities && item.cities.length > 0) {
      areaListData(item.cities)
    }
    delete item.cities
  })
}

/**
 * 前往抬头管理页
 */
function gotoTripPeoples(id: any) {
  router.push({
    path: `/trip-peoples/list/${id}`,
  })
}

/**
 * 是否显示等级选择框
 */
function ifShowSelect(item) {
  if (item.tripPeopleForm?.vehicleType === 1 || item.tripPeopleForm?.vehicleType === 2 || item.tripPeopleForm?.vehicleType === 7) {
    return true
  }
  else {
    return false
  }
}

/**
 * 增加出行人
 */
function addTripPeople() {
  state.invoiceForm.push({
    tripPeopleForm: {},
  })
  getAreaList()
  sessionStorage.setItem('tripPeopleData', JSON.stringify(state.invoiceForm))
}

function deleteTripPeople(index) {
  if (state.invoiceForm.length === 1) {
    showToast('至少填写一位出行人')
    return
  }
  state.invoiceForm.splice(index, 1)
  showToast('删除成功')
  sessionStorage.setItem('tripPeopleData', JSON.stringify(state.invoiceForm))
}

/**
 * 选择出行日期
 */
function selectDate(item) {
  showToast('选择日期成功')
  item.showPicker = false
  item.tripPeopleForm.travelDate = item.travelDateFormatter.join('-')
}

/**
 * 显示证件类型&交通工具
 */
function showIdTypeAndVehicle() {
  state.invoiceForm.forEach((item) => {
    const idType = idTypes.find(type => type.value == item.tripPeopleForm?.idType)
    const vehicleType = vehicleTypes.find(type => type.value === item.tripPeopleForm?.vehicleType)

    item.pickerValueOne = idType ? idType.text : ''
    item.pickerValueTwo = vehicleType ? vehicleType.text : ''
  })
}

const tripStore = useTripDataStore()

onMounted(() => {
  if (sessionStorage.getItem('tripPeopleData')) {
    state.invoiceForm = JSON.parse(sessionStorage.getItem('tripPeopleData'))
  }
  getAreaList()
  showIdTypeAndVehicle()
  state.invoiceForm[tripStore.index].tripPeopleForm = tripStore.tripPeoplesData
  sessionStorage.setItem('tripPeopleData', JSON.stringify(state.invoiceForm))
})

/**
 * 监控变化一旦变化更改数据
 */
watch(() => state.invoiceForm, () => {
  emit('getTripPeople', state.invoiceForm)
}, { deep: true })

watch(() => tripStore.ifSelectTripData, () => {
  if (tripStore.ifSelectTripData) {
    state.invoiceForm[tripStore.index].tripPeopleForm = tripStore.tripPeoplesData
  }
}, { deep: true })
</script>

<template>
  <van-cell-group v-for="(item, index) in state.invoiceForm" :key="index" title="出行人信息" inset>
    <van-field
      v-model="item.tripPeopleForm.traveler"
      clickable
      label="出行人"
      placeholder="选择出行人"
    >
      <template #right-icon>
        <van-icon name="arrow" @click="gotoTripPeoples(index)" />
      </template>
    </van-field>
    <van-field
      v-model="item.tripPeopleForm.travelDate"
      clickable
      is-link
      required
      label="出行日期"
      readonly
      placeholder="请选择出行日期"
      @click="item.showPicker = true"
    />
    <van-popup v-model:show="item.showPicker" position="bottom" round style="height: 50% ">
      <van-date-picker
        v-model="item.travelDateFormatter"
        title="选择出行日期"
        option-height="100"
        @cancel="item.showPicker = false"
        @confirm="selectDate(item)"
      />
    </van-popup>
    <van-field
      v-model="item.pickerValueOne"
      clickable
      is-link
      label="证件类型"
      readonly
      placeholder="请选择证件类型"
      @click="item.showPopup = true"
    />
    <van-popup v-model:show="item.showPopup" round position="bottom">
      <van-picker
        v-model="item.idTypeList"
        :columns="idTypes"
        @cancel="item.showPopup = false"
        @confirm="onConfirm($event, 1, item)"
      />
    </van-popup>
    <van-field
      v-show="state.hide"
      label="更多"
      right-icon="arrow-down"
      placeholder="证件号码、出发地、目的地等"
      @click="showMore()"
    />
    <div v-if="state.show">
      <van-field
        v-model="item.tripPeopleForm.idNumber"
        clickable
        label="证件号码"
        placeholder="请填写证件号码"
      >
        <template #right-icon>
          <van-icon name="arrow-up" @click="packUpInfo()" />
        </template>
      </van-field>
      <van-field
        v-model="item.tripPeopleForm.travelDeparturePlace"
        clickable
        is-link
        label="出发地"
        placeholder="请填写出发地"
        @click="item.showCascader = true"
      />
      <van-popup v-model:show="item.showCascader" round position="bottom">
        <van-cascader
          v-model="item.cascaderValue"
          title="请选择所在地区"
          :options="item.areaList"
          @close="item.showCascader = false"
          @finish="(event) => onFinish(event, item, 1)"
        />
      </van-popup>
      <van-field
        v-model="item.tripPeopleForm.travelDestinationPlace"
        clickable
        label="目的地"
        placeholder="请填写目的地"
        is-link
        @click="item.showCascaderTwo = true"
      />
      <van-popup v-model:show="item.showCascaderTwo" round position="bottom">
        <van-cascader
          v-model="item.cascaderTwoValue"
          title="请选择所在地区"
          :options="item.areaListTwo"
          @close="item.showCascaderTwo = false"
          @finish="(event) => onFinish(event, item, 2)"
        />
      </van-popup>
      <van-field
        v-model="item.pickerValueTwo"
        clickable
        readonly
        label="交通工具"
        placeholder="请选择交通工具"
        @click="item.showVehicle = true"
      >
        <template #right-icon>
          <van-icon name="arrow" />
        </template>
      </van-field>
      <van-popup v-model:show="item.showVehicle" round position="bottom">
        <van-picker
          v-model="item.vehicleTypeList"
          :columns="vehicleTypes"
          @cancel="item.showVehicle = false"
          @confirm="onConfirm($event, 2, item)"
        />
      </van-popup>
      <van-field
        v-model="item.tripPeopleForm.level"
        :readonly="ifShowSelect(item)"
        clickable
        label="等级"
        placeholder="请填写或选择等级"
      >
        <template #right-icon>
          <van-icon v-if="ifShowSelect(item)" name="arrow" @click="item.showLevel = true" />
        </template>
      </van-field>
      <van-popup v-model:show="item.showLevel" round position="bottom">
        <van-picker
          v-if="item.tripPeopleForm.vehicleType === 1"
          :columns="planeLevels"
          @cancel="item.showLevel = false"
          @confirm="onConfirm($event, 3, item)"
        />
        <van-picker
          v-if="item.tripPeopleForm.vehicleType === 2"
          :columns="shippingLevels"
          @cancel="item.showLevel = false"
          @confirm="onConfirm($event, 3, item)"
        />
        <van-picker
          v-if="item.tripPeopleForm.vehicleType === 7"
          :columns="trainLevels"
          @cancel="item.showLevel = false"
          @confirm="onConfirm($event, 3, item)"
        />
      </van-popup>
      <a class="tripButton" @click="addTripPeople">
        添加出行人
      </a>
      <a class="tripButton" @click="deleteTripPeople(index)">
        删除出行人
      </a>
    </div>
  </van-cell-group>
</template>

<style scoped lang="less">
.tripButton {
  display: flex;
  justify-content: center;
  cursor: pointer;
  color: #969799;
  padding: 10px 0;
}
</style>
