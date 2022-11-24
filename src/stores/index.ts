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
