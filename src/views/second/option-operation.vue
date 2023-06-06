<style>
    .buyPercentActive a {
        background: #26a69a !important;
        color: #fff !important;
    }
</style>

<template>
  <div class="opt-box">
    <div class="markets-pair-list">
      <ul class="nav nav-pills" id="pills-tab" role="tablist">
        <li class="nav-item">
          <a
            class="nav-link active"
            data-toggle="pill"
            href="#tab1"
            role="tab"
            aria-selected="false"
          >{{$t('second.nav')}}</a>
        </li>
      </ul>
      
      
      <div class="tab-content">
        <div class="tab-pane fade show active" id="tab1" role="tabpanel">
            
          <div class="form-box p-2">
            <div class="form" style="margin-top: 15px;">
              <div class="item">
                <div>{{ $t("second.amount") }}</div>
                <div class="mt-3">
                  <div class="input-group input-group-sm mb-3">
                   <input
                      v-model="secondFormValue.price"
                      :placeholder="$t('second.amount')"
                      class="form-control"
                    />
                  </div>
               </div>
              </div>
              
              <div class="item">
                <div>{{ $t("second.time") }}</div>
                <div class="mt-3">
                  <div class="input-group input-group-sm mb-3">
                   <input
                      v-model="secondFormValue.seconds"
                      :placeholder="$t('second.time')"
                      class="form-control"
                    />
                  </div>
               </div>
                <ul class="market-trade-list">
                    <template v-for="(time,index) in timeItems">
                        <li v-if="time.status" :class="secondFormValue.seconds==time.seconds?'buyPercentActive':''" @click="timeIndex=index;secondFormValue.seconds=time.seconds;profitRate=time.profitRate;">
                            <a href="javascript:void 0">{{time.seconds}}</a>
                        </li>
                    </template>
                </ul>
              </div>
              
              
              <div class="item" style="line-height: 30px;">
                <div style="display: inline-block; float: left;">{{ $t("second.price") }}</div>
                <div style="display: inline-block; float: right;">{{ kprice }}</div>
                <div style="clear: both;"></div>
              </div>
              <div class="item" style="line-height: 30px;">
                <div style="display: inline-block; float: left;">{{ $t("second.balance") }}</div>
                <div style="display: inline-block; float: right;">{{ balance }}</div>
                <div style="clear: both;"></div>
              </div>
              <div class="item" style="line-height: 30px;">
                <div style="display: inline-block; float: left;">{{ $t("second.wlratio") }}</div>
                <div style="display: inline-block; float: right;">{{ profitRate }}%</div>
                <div style="clear: both;"></div>
              </div>
              

              
              <div style="margin-top: 25px;">
                <button
                  type="button"
                  class="sub btn-success btn btn-sm"
                  @click="doSecondSubmit(1)"
                >{{$t('second.buyUp')}}</button>
              </div>
              
              <div style="margin-top: 15px;">
              <button
                type="button"
                class="sub btn-danger btn btn-sm"
                @click="doSecondSubmit(-1)"
              >{{$t('second.buyDown')}}</button>
               </div>
            </div>


              </div>
            </div>
          </div>
        </div>
        <!--交割记录 -->
      </div>
    </div>
  </div>
</template>
<script>
import Option from "@/api/option";
import Second from "@/api/second";
import Wallet from "@/api/wallet";
import Contract from "@/api/contract";
import Profile from "@/api/profile";
import utils from "../../utils";
export default {
  props: {
    activeCoin: {
      default: {},
      type: Object,
      required: false
    },
    kprice:{
        type: Number,
        default:0
    },
  },
  data() {
    return {
      current_scene: {},
      next_scene: {},
      // 看涨
      up_odds: [],
      up: "",
      upCoin: {},
      upAmount: "",
      // 看平
      draw_odds: [],
      draw: "",
      drawCoin: {},
      drawAmount: "",
      // 看跌
      down_odds: [],
      down: "",
      downCoin: {},
      downAmount: "",
      // 可交易币种
      coinList: [],
      // 交割记录
      page: 1,
      list: [],
      
      timeIndex:0,
      timeItems:[],
  
      secondFormValue:{
          seconds:'',
          direction:1, // 方向：1 买涨 -1 买跌
          openPrice:'', // 下单时的币币价格
          price:'', // 开仓数量
          symbol:'', // btcusdt
          userId:'',
      },
      
      balance:0,
	  balanceTimer:true,
      profitRate:0,
      
      orderItems:[],
      
      differSecond:0, //服务器与本地相差的毫秒秒数
      
      orderDetailVisible:false,
      orderDetail:{},
      
      userInfo:{},
    };
  },
  watch: {
    // 监听选择的币种
    activeCoin(n,o) {
      if (!n.pair_id) return;
      if (n.pair_time_name == o.pair_time_name) return;
      this.sceneDetail();
      this.getOddsList();
      this.resGetSceneResultList();
      this.getMarketList();
    }
  },
  computed: {
    activeUp() {
      return this.up_odds.find(item => item.uuid == this.up) || {};
    },
    activeDown() {
      return this.down_odds.find(item => item.uuid == this.down) || {};
    },
    activeDraw() {
      return this.draw_odds.find(item => item.uuid == this.draw) || {};
    }
  },
  methods: {
    getConfig() {
      Second.getConfig().then((res) => {
        if (res){
          this.timeItems=res
          this.timeIndex=0;
          this.secondFormValue.seconds=res[0].seconds;
          this.profitRate=res[0].profitRate;
        }
      });
    },
	doSecondSubmit(direction){
    if (!this.userInfo.user_id){
      this.$message.error(this.$t("nav.login"));
			return false;
    }
        
		// 最小值判断
		if (this.secondFormValue.price < this.timeItems[this.timeIndex].minAmount){
      this.$message.error(this.$t("second.amountConfirm")+this.timeItems[this.timeIndex].minAmount);
			return false;
		}

      this.$confirm(this.$t('second.amount')+'：'+this.secondFormValue.price+'\r\n'+this.$t("second.time")+'：'+this.secondFormValue.seconds+'\r\n'+this.$t('second.confirmOrder'),direction==1?this.$t("second.buyUp"):this.$t("second.buyDown"),{
		cancelButtonText: this.$t('common.cancelBtn'),
		confirmButtonText:this.$t('common.confirmBtn')
      }).then(()=>{
		      this.doSecond(direction)
      })
	},
	doSecond(direction){
		this.secondFormValue.direction=direction;
		this.secondFormValue.symbol=this.activeCoin.symbol.toUpperCase();
		this.secondFormValue.userId=this.userInfo.user_id;
    this.secondFormValue.openPrice=this.kprice;
		Second.createOrder(this.secondFormValue).then((res) => {
			this.$message.success(this.$t("second.success"));
			this.$emit('buy-success')
		});
	},
	getMarketList(){
        Contract.getMarketList().then((res) => {
            if (res&&res.length&&res[0].marketInfoList&&res[0].marketInfoList.length){
                let item = res[0].marketInfoList.find((val) => val.pair_name == this.activeCoin.pair_name);
                if (item&&item.id){
                    this.secondFormValue.openPrice=item.price
                }
            }
        }); 
	},   
      
    // ===================
    resTimer() {
      setTimeout(() => {
        this.sceneDetail();
        this.getOddsList();
      }, 1000);
    },
    // 获取数据
    sceneDetail() {
      let data = {
        pair_id: this.activeCoin.pair_id,
        time_id: this.activeCoin.time_id
      };
      Option.sceneDetail(data)
        .then(res => {
          this.current_scene = res.current_scene;
          this.next_scene = res.next_scene;
        })
        .catch(err => {});
    },
    // 获取赔率
    getOddsList() {
      let data = {
        pair_id: this.activeCoin.pair_id,
        time_id: this.activeCoin.time_id
      };
      Option.getOddsList(data).then(res => {
        this.up_odds = res.up_odds;
        this.down_odds = res.down_odds;
        this.draw_odds = res.draw_odds;
        // 默认选中第一个
        this.up = this.up_odds[0].uuid;
        this.down = this.down_odds[0].uuid;
        this.draw = this.draw_odds[0].uuid;
      });
    },
    // 获取期权交易币种
    getBetCoinList() {
      Option.getBetCoinList()
        .then(res => {
          this.coinList = res;
          this.upCoin = this.coinList[0] || {};
          this.drawCoin = this.coinList[0] || {};
          this.downCoin = this.coinList[0] || {};
          this.checkCoin(this.upCoin);
        })
        .catch(err => {});
    },
    // 选中交易币种 (需要登录)
    checkCoin(item) {
      let data = {
        coin_id: item.coin_id
      };
      if (!localStorage.getItem("token")) return;
      Option.getUserCoinBalance(data)
        .then(res => {
          this.$set(item, "balance", res.usable_balance);
        })
        .catch(err => {});
    },
    // 购买期权 [数量，币种id，赔率id,dom筛选器,交易币种obj]
    betScene(bet_amount, bet_coin_id, odds_uuid, domName, checkCoin) {
      let data = {
        bet_amount,
        bet_coin_id,
        odds_uuid,
        scene_id: this.next_scene.scene_id
      };
      if (utils.validate(domName)) {
        Option.betScene(data)
          .then(res => {
            if (res) {
              this.$message.success(this.$t('option.buySuccess'));
              this.upAmount = "";
              this.drawAmount = "";
              this.downAmount = "";
              this.$emit('buy-success')
              this.checkCoin(checkCoin);
            }
          })
          .catch(err => {});
      }
    },
    // 获取预计收益
    expected(num1, num2) {
      if (!num1 || !num2) return "0";
      return utils.multiple(num1, num2);
    },
    // 刷新纪录
    resGetSceneResultList() {
      this.page = 1;
      this.getSceneResultList();
    },
    getSceneResultList() {
      let data = {
        pair_id: this.activeCoin.pair_id,
        time_id: this.activeCoin.time_id,
        page: this.page
      };

      Option.getSceneResultList(data)
        .then(res => {
          if (res.current_page == 1) this.list = [];
          this.list = [...this.list, ...res.data];
        })
        .catch(err => {});
    },
    getBalance(){
        const auth = localStorage.getItem("auth");
        if (auth){
            Wallet.getBalance({
                account: 1,
                coin_name: 'USDT',
            }).then((res) => {
                if (res&&res.usable_balance){
                    this.balance=res.usable_balance
                }
            });
        }
		
		if (this.balanceTimer){
			setTimeout(()=>{
			   this.getBalance() 
			},3000)
		}
    },
  },
  created() {
    this.getBetCoinList();
  },
  mounted() {
    this.getConfig();
    this.getMarketList();
  
  this.getBalance();

      const auth = localStorage.getItem("auth");
      if (auth){
          Profile.getUserInfo({}).then(res => {
              this.userInfo = res
          });
      }
  },
  destroyed() {
	  this.balanceTimer=false
  },
};
</script>
