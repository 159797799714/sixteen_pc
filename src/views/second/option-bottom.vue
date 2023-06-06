<template>
  <div class="markets-pair-list">
    <ul class="nav nav-pills" id="pills-tab" role="tablist">
      <li class="nav-item">
        <a
          class="nav-link active"
          data-toggle="pill"
          href="#tabBottom1"
          role="tab"
          aria-selected="false"
          @click="orderCloseStatus=0;reloadData();"
        >{{$t('second.orderTitle')}}</a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          data-toggle="pill"
          href="#tabBottom2"
          role="tab"
          aria-selected="false"
          @click="orderCloseStatus=1;reloadData();"
        >{{$t('second.orderTitle2')}}</a>
      </li>
    </ul>
    <div class="tab-content">
      <div class="tab-pane fade show active">
        <table class="table">
          <thead>
            <tr class="text-nowrap" style="text-align: center !important;">
              <th>{{$t('second.orderSymbol')}}</th>
              <th>{{$t('second.orderType')}}</th>
              <th>{{$t('second.orderAmount')}}</th>
              <th>{{$t('second.orderPrice')}}</th>
              <th v-if="orderCloseStatus==1">{{$t('second.closePrice')}}</th>
              <th>{{$t('second.orderWlratio')}}</th>
              <th v-if="orderCloseStatus==0">{{$t('second.orderTimer')}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orderItems" :key="item.id" style="text-align: center !important;">
              <td>{{filterOrderSymbol(item.symbol)}} <span style="font-size: 10px; margin-left: 4px;">{{item.seconds}}s</span></td>
              <td>
                  <span class="increace" v-if="item.direction == 1">{{$t("second.buyUp")}}</span>
                  <span class="decreace" v-if="item.direction == -1">{{$t("second.buyDown")}}</span>
              </td>
              <td>{{item.price}}</td>
              <td>{{item.openPrice}}</td>
              <td v-if="orderCloseStatus==1">{{item.closePrice}}</td>
              
              <td v-if="orderCloseStatus==0">{{item.estimateProfit}}</td>
              <td v-if="orderCloseStatus==1">
                   <span class="increace" v-if="item.status == 1">+{{item.profit}}</span>
                   <span class="decreace" v-if="item.status == -1">{{item.profit}}</span>
              </td>
              
              <td v-if="orderCloseStatus==0">
                  <span v-if="item.timer <= 0">00:00</span>
                <time-count v-if="item.timer > 0" :isAuto="true" :startTime="item.timer" @end="countDownFinish" />
              </td>
            </tr>
            <tr v-if="!orderItems.length">
              <td colspan="6">
                <no-record/>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- <div class="d-flex justify-content-center mt-3">
          <el-pagination
            layout="prev, pager, next"
            :page-size="detail1.per_page"
            @current-change="changePage1"
            :total="detail1.total"
          ></el-pagination>
        </div> -->
      </div>
    </div>
  </div>
</template>
<script>
import Option from "@/api/option";
import Second from "@/api/second";
import Profile from "@/api/profile";
export default {
  props: {
    activeCoin: {
      default: {},
      required: false,
      type: Object
    }
  },
  data() {
    return {
      status: 1,
      //
      page1: 1,
      detail1: {},
      list1: [],
      //
      page2: 1,
      list2: [],
      detail2: {},
      
      orderCloseStatus:0, // 0未平仓 1已平仓
      orderItems:[],
      differSecond:0,
      
      userInfo:{},
    };
  },
 computed: {
    isLogin() {
      return Boolean(localStorage.token);
    }
  },
  watch: {
    activeCoin(n, o) {

      if (n.pair_time_name != o.pair_time_name) {
        this.isLogin&&this.reloadData();
      }
    }
  },
  methods: {
    reloadData() {
      // this.resLoad1();
      // this.resLoad2();
        this.getOrders()
    },
	  countDownFinish(){
          setTimeout(()=>{
             this.getOrders() 
          },1500)
	  },
	  filterOrderSymbol(symbol){
		  if (!symbol){
			  return  symbol
		  }
		  
		  let _symbol = symbol.toUpperCase()
		  return _symbol.replace("USDT","/USDT")
	  },
      getOrders(){
          Second.getOrders({
              userId:this.userInfo.user_id,
              closeStatus:this.orderCloseStatus,
          }).then((res) => {
              if(res){
                  res.forEach((item)=> {
                   item.timer = this.countTimerSecond(item)
                  })
                  this.orderItems=res
              } else {
                  this.orderItems=[]
              }
          }); 
      },
	countTimerSecond(item){
	   if (item.closeStatus == 1){
		   return 0
	   } else {
		   // 先计算differSecond是因为弹框倒计时需要
		   var nowDate=new Date().getTime()
		   if (this.differSecond == 0){
			   var serDate=new Date(item.serverTime).getTime();
			   this.differSecond = Math.floor((nowDate-serDate))
		   }

		  var creDate=new Date(item.createdTime).getTime()+(item.seconds*1000)+this.differSecond;
		  var times=Math.floor((creDate-nowDate)/1000);
		  return times
	   }
	},
    TimeOutLoad(){
      setTimeout(()=>{
        this.load1()
      },3000)
    },
    // --
    changePage1(idx) {
      this.page1 = idx;
      this.load1();
    },
    resLoad1() {
      this.page1 = 1;
      this.load1();
    },
    load1() {
      this.getOptionHistoryOrders(1, this.page1, res => {
        this.list1 = res.data;
        this.detail1 = res;
      });
    },
    // --
    changePage2(idx) {
      this.page2 = idx;
      this.load1();
    },
    resLoad2() {
      this.page2 = 1;
      this.load2();
    },
    load2() {
      this.getOptionHistoryOrders(2, this.page2, res => {
        this.list2 = res.data;
        this.detail2 = res;
      });
    },
    // --
    getOptionHistoryOrders(status, page, call) {
      let data = {
        page: page,
        status: status,
        pair_id: this.activeCoin.pair_id,
        time_id: this.activeCoin.time_id
      };
      Option.getOptionHistoryOrders(data)
        .then(res => {
          call && call(res);
        })
        .catch(err => {});
    }
  },
  created() {
      let auth = localStorage.getItem("auth");
      if (auth){
          Profile.getUserInfo({}).then(res => {
              this.userInfo = res
          });
      }
  }
};
</script>
