import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/views/home'
import Market from '@/views/market'
import Exchange from '@/views/exchange'

import College from './college'
import Activity from '@/views/activity'
import News from '@/views/news'
import Setting from '@/views/setting'

// 导入路由集合
import Wallet from './wallet'
import Profile from './profile'

import Order from './order'

import ContactUs from '@/views/contactUs'

import SignIn from '@/views/signIn'
import SignUp from '@/views/signUp'

// 期权
import Option from '@/views/option'
// 秒合约
import Second from '@/views/second'
// 上币申请
import Application from '@/views/application'

// 开始申购
import Purchase from '@/views/purchase'

// 服务条款
import Service from '@/views/server';
import ForgotPwd from '@/views/forgotPwd';

// 合约
import Contract from '@/views/contract'

// OTC
// import Otc from "./otc";


Vue.use(VueRouter);

// 将多文件路由合并到一起
const routes = [{
        path: '/',
        redirect: '/home'
    },
    {
        name: 'home',
        path: '/home',
        component: Home
    }, {
        name: "exchange",
        path: "/exchange/:symbol?",
        component: Exchange
    }, {
        name: "market",
        path: "/market/:id?",
        component: Market,
    }, {
        name: "activity",
        path: "/activity",
        component: Activity
    }, {
        name: "news",
        path: "/news",
        component: News
    }, {
        name: "contactUs",
        path: "/contact-us",
        component: ContactUs
    }, {
        name: "setting",
        path: "/setting",
        component: Setting,
    },
    ...Wallet, ...Profile, ...Order, ...College,
    {
        name: "signIn",
        path: "/sign-in",
        component: SignIn
    },
    {
        name: "signUp",
        path: "/sign-up",
        component: SignUp
    }, {
        name: "forgotPwd",
        path: "/forget-pwd",
        component: ForgotPwd
    },
    {
        name: "option",
        path: "/option",
        component: Option
    },
    {
        name: "second",
        path: "/second",
        component: Second
    },
    {
        name: "contract",
        path: "/contract",
        component: Contract
    },
    {
        name: "application",
        path: "/application",
        component: Application
    },
    {
        name: "purchase",
        path: "/purchase",
        component: Purchase
    }, {
        name: "server",
        path: "/service/:cid?",
        component: Service
    }
]

const router = new VueRouter({
    routes
});

// 添加路由导航守卫 非登录状态禁止进入wallet

router.beforeEach((to, from, next) => {
    const auth = localStorage.getItem("auth");
    const pages = [`/wallet`, `/setting`, `/order`, `/profile`];

    let res = pages.some(item => to.path.startsWith(item));
    if (res && !auth) {

        next({
            path: '/sign-in'
        })


    } else next();
})

export default router;
