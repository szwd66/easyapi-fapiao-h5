// https://router.vuejs.org/zh/
import { createRouter, createWebHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
NProgress.configure({ showSpinner: true });

// 导入路由组件
import mian from '@/views/index.vue';
import error from '@/views/error.vue';
import rule from '@/views/rule.vue';
import invoiceRecord from '@/views/invoice/record/index.vue';
import invoiceDetail from '@/views/invoice/detail/index.vue';
import companyList from '@/views/company/list/index.vue';
import companyEdit from '@/views/company/edit/index.vue';
import addressList from '@/views/address/list/index.vue';
import addressEdit from '@/views/address/edit/index.vue';

// 定义路由，每个路由都需要映射到一个组件
const routes = [
  {
    path: '/',
    name: 'main',
    component: mian,
  },
  {
    path: '/error',
    name: 'error',
    component: error,
  },
  {
    path: '/rule',
    name: 'rule',
    component: rule,
  },
  {
    path: '/invoice/record',
    name: 'invoiceRecord',
    component: invoiceRecord,
  },
  {
    path: '/invoice/detail',
    name: 'invoiceDetail',
    component: invoiceDetail,
  },
  {
    path: '/company/list',
    name: 'companyList',
    component: companyList,
  },
  {
    path: '/company/edit',
    name: 'companyEdit',
    component: companyEdit,
  },
  {
    path: '/address/list',
    name: 'addressList',
    component: addressList,
  },
  {
    path: '/address/edit',
    name: 'addressEdit',
    component: addressEdit,
  },
];

// 创建路由实例并传递 `routes` 配置
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 };
  },
});

router.beforeEach((_to, _from, next) => {
  NProgress.start(); // start progress bar
  next();
});

router.afterEach(() => {
  NProgress.done(); // finish progress bar
});

// 导出路由实例，并在 `main.ts` 挂载
export default router;
