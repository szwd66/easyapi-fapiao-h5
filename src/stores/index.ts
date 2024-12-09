import { defineStore } from 'pinia'

export const useStore = defineStore({
  id: 'index',
  persist: true,
  state: () => ({
    // light || dark
    mode: '',
    ifShowH5NavBar: false, // 是否显示顶部
  }),
})

export const useTripDataStore = defineStore({
  id: 'indexTwo',
  persist: true,
  state: () => ({
    index: 0,
    mode: '',
    ifSelectTripData: false,
    tripPeoplesData: null,
  }),
  actions: {
    setTripPeoplesData(data, index) {
      this.tripPeoplesData = JSON.parse(JSON.stringify(data)) || {}
      this.index = index
    },
    ifTripData(val) {
      this.ifSelectTripData = val
    },
  },
})
