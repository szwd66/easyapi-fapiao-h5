# EasyAPI电子发票H5移动端

## 项目介绍
EasyAPI电子发票H5移动端是标准的发票申请与发票记录查询模块，功能类似滴滴打车、顺丰快递申请发票模块，可直接嵌入到小程序、微信H5，APP中，极速实现发票申请的功能。
## 前序准备
需要在本地安装 node。本项目技术栈基于 `Vue3`, `Vite3`, `Vant4`, `Pinia2`, `Vitest`, `TypeScript`
## 相关技术和第三方库

* [Vue.js JavaScript 框架](https://cn.vuejs.org/)
* [Vite3 下一代前端开发与构建工具](https://vitejs.cn/)
* [Vant4 轻量、可靠的移动端组件库](https://vant-contrib.gitee.io/vant/#/zh-CN)

---

## 开发调试

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn dev

# build for production with minification
yarn build

```

## 项目目录结构

``` bash
 ├── README.md
 ├── public                #入口
 ├── node_modules          #依赖模块
 ├── src                   #源码
 │  ├── api                #api接口目录
 │  │  ├── api.js          #api接口列表
 │  │  └── fetch.js        #axios封装
 │  ├──assets              #资源目录，用于组织未编译的静态资源如STYLUS LESS、SASS 或 JavaScript
 │  │  ├── images          #图片
 │  │  └── styles          #样式、字体图片等
 │  ├── components         #组件目录
 │  ├── pages              #页面目录  
 │  ├── router             #页面路由  
 │  ├── store              #vuex状态管理
 │  ├── util               #放置公用方法   
 │  ├── App.vue            #  
 │  └── main.js            #入口文件  
 ├── static                #静态资源文件
 │  └── images             #图片
 └── package.json          #入口 

```


## 命名规范

* 使用kebab-case（短横线）命名方式
* 图片资源采用的命名规范
* CSS命名规范
* 常规名称命名方案，参见EasyAPI中英文翻译
* API接口方法命名，例如getUser，getUserList，createUser，updateUser，deleteUser，其他方法尽量动词在前，例如cancelOrder 取消订单

## 其他说明

* page目录页面命名规范，文件命令简明扼要，例如/pages/api/list.vue表示API列表页，/pages/api/detail.vue表示API详情页，其他还包括edit.vue，info.vue，report.vue
* 如果页面必须是2个单词组成，使用短横线分隔命名，例如文章分类article-category，另外考虑是否可以使用/pages/article/category/list.vue来命名，尽量不使用短横线
* page目录中尽量采用样式表和页面分离开发，例如login文件夹中包含login.vue，login.styl
* 自定义组建说明，基于成熟的组建进行自定义开发，可平滑升级，打造属于EasyAPI的Vue组件库，以EasyAPI缩写ea为前缀，例如ea-table
* 网络请求已使用axios，并封装到fetch.js
* 用户信息等全局变量，必须使用store管理，包括相关api请求放置到modules文件夹下

## Vue方法放置顺序
    components
    props
    data
    created
    mounted
    activited
    update
    beforeRouteUpdate
    metods
    filter
    computed
    watch

## 常见问题


**1. 编译失败**

	请使用cnpm试试(前提先安装cnpm)

**2. 编译成功启动失败**

	请确保网络正常，可提供错误给相关工程师
