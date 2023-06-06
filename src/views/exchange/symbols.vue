<template>
<div class="col-md-3">
    <div class="market-pairs">

        <!-- 搜索框区域 -->
        <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-sm">
                    <i class="icon ion-md-search"></i>
                </span>
            </div>
            <input type="text" class="form-control" v-model="keyword" :placeholder="$t('exchange.search')" aria-describedby="inputGroup-sizing-sm">
        </div>

        <!-- 币种列表 -->
        <ul class="nav nav-pills" role="tablist" ref="navList">

            <li class="nav-item" v-for="(coin, index) in markets" :key="index">
                <a :class="[`nav-link`, {active:currentCoinIdx == index}]" href @click.prevent="currentCoinIdx = index">
                    <!-- 查看收藏交易对 -->
                    <template v-if="coin.coin_name == 'fav'">
                        <i class="icon ion-md-star"></i>
                    </template>
                    <template v-else>
                        {{ coin.coin_name }}
                    </template>
                </a>
            </li>
        </ul>

        <!-- 币种行情信息，不同的交易对价值 -->
        <div class="tab-content">

            <div v-for="(coin, index) in markets" :key="index">
                <table class="table" v-if="currentCoinIdx == index">
                    <thead>
                        <tr style="display:block">
                            <th class="w-33">{{ $t("exchange.pair") }}</th>
                            <th class="w-33 text-right">{{ $t("exchange.last-price") }}</th>
                            <th class="w-33 text-right">{{ $t("exchange.change") }}</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr style="display:block" :class="{highlight : item.pair_id == marketId}" @click="selectSymbols(item.symbol)" v-for="(item, key) in coin.marketInfoList" :key="key" v-show="isShow(item)">
                            <td class="w-33" style="white-space:nowrap">
                                <i class="icon ion-md-star h6" @click.self="handleFav"></i>
                                {{ coin.coin_name == 'fav' ? item.symbol : item.coin_name + '/' + coin.coin_name}}
                            </td>
                            <td class="w-33 text-right">
                                {{item.price|omitTo(item.price_decimals)}}
                            </td>
                            <td class="w-33 text-right" v-if="item.increaseStr" :class="item.increaseStr.startsWith('-') ? 'red' : 'green'" >
                                {{ item.increaseStr }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>
</template>

<script>
import Market from "@/api/market";
export default {

    props: {
        marketList: {
            type: Array,

            // 初始化填充页面排版的数据
            default: Array(5).fill({
                coin_name: "-",
                marketInfoList: Array(10).fill({
                    coin_name: "-",
                    price: "-",
                    increace: 0,
                    increaseStr: "+0.00%",
                }),
            })
        },

        isLogin: {
            type: Boolean,
            default: false,
        },

        marketId: {
            type: Number,
            default: null,
        },

        firstEnter: true,
    },

    data() {
        return {
            keyword: '', // 搜索关键字
            current: "fav",
            // 个人收藏的交易对信息
            favList: {
                coinName: "fav",
                marketInfoList: Array(10).fill({
                    pair: "-",
                    price: "-",
                    increace: 0,
                    increaseStr: "+0.00%",
                }),
            },

            // 收藏交易对的数据结构
            favList: {
                coin_name: "fav",
                image: require("@/assets/img/waiting.png"),
                marketInfoList: [],
            },

            currentCoinIdx: 0, // 当前展示的币种

            cacheMarketList : [],
        }

    },

    computed: {

        markets() {

            // 将行情列表和收藏交易对整理一起 方便渲染
            return [...this.cacheMarketList, this.favList];
        },

    },

    watch : {
        marketList (list) {
            if (list.length) this.cacheMarketList = list;
        }
    },

    methods: {

        /*
         * 询问用户是否登录
         *  如果已经登录 返回true
         *  如果没有登录 询问用户是否登录进行操作
         */
        inquiryLogin() {
            if (!this.isLogin) {
                this.$confirm("请先登录以进行此操作", "系统提示", {
                        confirmButtonText: this.$t('home.Login'),
                        cancelButtonText: this.$t('home.Cancel'),
                        type: "info",
                    })
                    .then(() => {
                        location.href = "/login";
                    })
                    .catch(() => {});
                return false;
            } else {
                return true;
            }
        },
        getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },
        getSymblosForUrl(){
           let url = window.location.href;
           if(url.indexOf("&s=") != -1){
           	let sparr = url.split('&s=');
           	let tabstr = 0;
           	if( sparr[1].indexOf("&") != -1 ){
           		let s = sparr[1].split('&');
           		tabstr = s[0];
           	}else{
           		tabstr = sparr[1];
           	}
           	// if(tabstr == 1 ){
           	// 	this.tab = 1;
           	// }
           }
        },
        selectSymbols(symbol){
            // currentCoinIdx = index
            this.$emit('update:symbol', symbol);
        },
        // 搜索关键字
        isShow(symbol) {
            const reg = new RegExp(this.keyword, "gi");
            if (!this.keyword) return true;
            else {
                let name = symbol.coinName || symbol.pair;
                return name.search(reg) >= 0;
            }
            // return !this.keyword || symbol.coinName.concat(symbol.pair).search(reg) >= 0;

        },

        // 添加收藏的方法
        handleFav() {
            alert("收藏成功");
        },

    },

    created() {
        // 如果已登陆 则写入收藏交易对
        if (this.isLogin) {

            // Market.collection().then(response => {

            //     this.favList.marketInfoList = response.data;

            // }).catch(err => {});

        }
    },
    
    mounted() {
        // 初始化市场行情 覆盖初始化的[]
        Market.getMarketList().then(data => {
            console.log(1, data)
            this.cacheMarketList = data;
        }).catch(err => {});
        
    }

}
</script>

<style lang="scss">
.highlight {
    background: #f6f8f9;
    background: #F8F8FF;

    td:first-child {
        color: #007bff !important;
    }
}

.w-33 {
    display: inline-block !important;
    vertical-align: top !important;
    width: 32% !important;
}
</style>
