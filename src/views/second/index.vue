<template>
  <div class="option-page">
    <!-- 上部 -->
    <div class="page-top d-flex pt-2">
      <!-- k线盒子 -->
      <div class="kline-box flex-fill mr-2">
        <!-- 币种切换 -->
        <div
          class="coin-change d-flex align-items-center py-2 pl-4 heading justify-content-between"
        >
          <div class="d-flex align-items-center">
            <!-- <div class="coin d-flex align-items-center">
              <el-popover placement="bottom" ref="popover" width="375" trigger="click">
                <div slot="reference">
                  {{activeCoin.pair_time_name}}
                  <el-button size="mini">
                    <i class="el-icon-arrow-down"></i>
                  </el-button>
                </div>
                <div>
                  <el-collapse v-model="activeSymbolName" accordion>
                    <el-collapse-item
                      :title="item.guessPairsName"
                      :name="item.guessPairsName"
                      v-for="item in symbolList"
                      :key="item.pair_time_name"
                    >
                      <div
                        class="bg-light p-2 symbol-item d-flex justify-content-between"
                        v-for="minItem in item.scenePairList"
                        @click="checkSymbol(minItem.pair_time_name)"
                        :key="minItem.scene_id"
                      >
                        <span>{{minItem.pair_time_name}}</span>
                        <span
                          :class="(minItem.increase*1)>=0?'increace':'decreace'"
                        >{{minItem.increaseStr}}</span>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </el-popover>
            </div> -->
            <div class="coin d-flex align-items-center">
              <el-popover
                placement="bottom"
                ref="popover"
                width="400"
                trigger="click"
              >
                <div slot="reference">
                  {{ activeContract.pair_name }}
                  <el-button size="mini">
                    <i class="el-icon-arrow-down"></i>
                  </el-button>
                </div>
                <div
                  class="markets-pair-list"
                  style="max-height:300px;overflow:auto;"
                >
                  <template v-for="parent in contractList">
                    <div class="px-3 text-primary" :key="parent.coin_name">
                      {{ parent.coin_name }}
                    </div>
                    <table class="table" :key="parent.coin_name + 1">
                      <thead>
                        <tr class="text-secondary">
                          <th class="w-10/24">{{ $t("contract.h5") }}</th>
                          <th class="w-7/24">{{ $t("contract.g3") }}</th>
                          <th class="w-7/24 text-right">
                            {{ $t("contract.h6") }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in parent.marketInfoList"
                          :key="item.symbol"
                          :class="{ active: item.symbol == activeSymbol }"
                          @click="changeSymbol(item.symbol)"
                        >
                          <td class="w-10/24">
                            {{ item.symbol }}/{{ parent.coin_name }}
                          </td>
                          <td
                            class="w-7/24 "
                            :class="item.increase < 0 ? 'decreace' : 'increase'"
                          >
                            {{ item.price }}
                          </td>
                          <td
                            class="w-7/24"
                            :class="item.increase < 0 ? 'decreace' : 'increase'"
                          >
                            {{ item.increaseStr }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </template>
                </div>
              </el-popover>
            </div>
            <div
              class="price px-3 border-right"
              :class="{
            decreace:(newCoinInfo.increase*1)<0,
            increace:(newCoinInfo.increase*1)>=0
            }"
            >
            
              <span class="current">{{ newCoinInfo.price }}$</span>
              &nbsp;
              <span class="zf">{{ newCoinInfo.increaseStr }}</span>
            </div>
          </div>
          <div class="d-flex align-items-center">
           <!-- <theme-change/> -->
            <el-button-group>
              <el-button size="small" :type="tab==1?'primary':''" @click="changeTab(1)">Time</el-button>
              <el-button size="small" :type="tab==2?'primary':''" @click="changeTab(2)">More</el-button>
            </el-button-group>
          </div>
        </div>
        <!-- k线 -->
        <div class="kline">
          <!-- traidngview -->
          <kline-highchart v-if="tab==1" ref="highChart" />
          <!-- <kline v-if="tab==2" :activeCoin="activeCoin" :wsUrl="wsUrl" /> -->
          <kline v-if="tab==2"
            :activeCoin="{ pair_name: activeContract.pair_name }"
          :contract="true"
          :wsUrl="this.Globals.Server.Path.WS1"
        />
        </div>
      </div>
      <!-- 操作期权 -->
      <option-operation :kprice="newCoinInfo.price" @buy-success="buySuccess" :activeCoin="activeCoin" />
    </div>
    <!-- 下部 -->
    <div class="">
      <option-bottom ref="bottom" :activeCoin="activeCoin" />
    </div>
  </div>
</template>

<script>
import kline from "../option/kline";
import klineHighchart from "./kline-highchart";
import optionOperation from "./option-operation";
import optionBottom from "./option-bottom";
import Option from "@/api/option";
import Socket from "@/api/server/Socket.js";
import Contract from "../../api/contract";

export default {
  components: {
    kline,
    optionOperation,
    optionBottom,
    klineHighchart
  },
  data() {
    return {
      symbolList: [],
      activeSymbolName: "",
      activeSymbol: "",
      // 当前币的最新信息
      newCoinInfo: {},
      ws: undefined,
      tab: 1,
      contractList: [],
      symbol: "",
      beforeSymbol: "",
    };
  },
  computed: {
    wsUrl() {
      return this.Globals.Server.Path.WS;
    },
    activeCoin() {
      var data = {
          "symbol": this.symbol,
          "pair_name": this.symbol,
          "pair_time_name": this.symbol
      }
      return data
      // return (
      //   this.symbolList
      //     .map(item =>
      //       item.scenePairList.find(
      //         minItem => minItem.pair_time_name == this.activeSymbol
      //       )
      //     )
      //     .filter(item => !!item)[0] || {}
      // );
    },
    isLogin() {
      return Boolean(this.userAuth);
    },
    userAuth() {
      const auth = localStorage.getItem("auth");
      let ret = "";
      if (auth) {
        let { memberId, accessToken } = JSON.parse(auth);
        ret = `?${accessToken}&${memberId}`;
      }
      return ret;
    },
    activeContract() {
      return (
        this.contractList
          .map(item => item.marketInfoList)
          .flat()
          .find(item => item.symbol == this.activeSymbol) || {}
      );
    },
  },
  methods: {
    // 买入成功
    buySuccess() {
      this.$refs.bottom.reloadData();
    },
    changeTab(idx) {
      this.tab = idx;
      if (this.tab == 1) {
        this.getNewPriceBook();
      }
    },
    // 获取交易对
    sceneListByPairs() {
      // 获取合约市场
      Contract.getMarketList().then(res => {
        this.contractList = res;
        // 默认值
        let firstParent = res[0];
        if (firstParent) {
          let first = firstParent.marketInfoList[0];
          if (first) {
            this.changeSymbol(first.symbol)
            this.linkSocket();
          }

        }
      });
      // Option.sceneListByPairs()
      //   .then(res => {
      //     this.symbolList = res;
      //     this.checkSymbol(res[0].scenePairList[0].pair_time_name);
      //     this.linkSocket();
      //   })
      //   .catch(err => {});
    },
    // 链接socket
    linkSocket() {
      const ws = new Socket(this.wsUrl);
      ws.on("open", () => {
        this.ws = ws;
        this.sendMessage({
          cmd: "sub",
          msg: "sceneListNewPrice"
        });
      });
      ws.on("message", res => {
        let { data, msg, code, sub, type, status } = res;
        if (sub == "newPrice_" + this.symbol) {
          this.newPrice(data);
        } else if (type == "ping") {
          this.sendMessage({
            cmd: "pong"
          });
        } else if (sub == "sceneListNewPrice") {
          this.replaceSymbolList(data);
        }
      });
    },
    replaceSymbolList(data) {
      this.symbolList.forEach(parentItem => {
        parentItem.scenePairList.forEach(item => {
          if (item.pair_time_name == data.pair_time_name) {
            item.downodds = data.downodds;
            item.increase = data.increase;
            item.increaseStr = data.increaseStr;
            item.pair_id = data.pair_id;
            item.pair_name = data.pair_name;
            item.pair_time_name = data.pair_time_name;
            item.symbol = data.symbol;
            item.time_id = data.time_id;
            item.trend_down = data.trend_down;
            item.trend_up = data.trend_up;
            item.upodds = data.upodds;
          }
        });
      });
    },
    // checkSymbol(pair_time_name) {
    //   if (this.activeSymbol) {
    //     this.sendMessage({
    //       cmd: "unsub",
    //       msg: `newPrice_${this.activeCoin.pair_name
    //         .split("/")
    //         .join("")
    //         .toLowerCase()}`
    //     });
    //   }
    //   this.activeSymbol = pair_time_name;
    //   this.$refs.popover.doClose();
    //   this.getNewPriceBook();
    // },
    // 获取初始价格组
    getNewPriceBook() {
      let data = {
        symbol: this.activeSymbolName
      };
      Option.getNewPriceBook(data)
        .then(res => {
          let arr = res.map(item => {
            return [item.ts, item.price];
          });
          if (this.$refs.highChart) {
            this.$refs.highChart.setData(arr);
            this.$refs.highChart.setName(this.activeSymbolName);
          }
          this.sendMessage({
            cmd: "sub",
            msg: "newPrice_" + this.symbol
          });
          console.log("sub symbol:" + this.symbol)
        })
        .catch(res => {});
    },
    // 订阅消息
    sendMessage(msg) {
      if (this.ws) {
        this.ws.send(msg);
      } else {
        setTimeout(() => {
          this.sendMessage(msg);
        }, 200);
      }
    },
    // 获取最新价格
    newPrice(data) {
      this.newCoinInfo = data;
      if (this.$refs.highChart) {
        this.$refs.highChart.addPoint([data.ts, data.price]);
      }
    },
    changeSymbol(symbol) {
      if (!this.beforeSymbol) {
        this.beforeSymbol = symbol.toLowerCase() + "usdt"
      } else {
        this.beforeSymbol = this.symbol
      } 
      this.symbol = symbol.toLowerCase() + "usdt"
      this.activeSymbol = symbol;
      this.activeSymbolName = symbol + "/USDT"
      this.$refs.popover.doClose();
      if (this.beforeSymbol) {
        this.sendMessage({
          cmd: "unsub",
          msg: "newPrice_" + this.beforeSymbol
        });
        console.log("unsub symbol:" + this.beforeSymbol)
      }
      this.getNewPriceBook();
    }
  },
  created() {
    this.sceneListByPairs();
  }
};
</script>

<style lang="scss" scoped>
.symbol-item {
  cursor: pointer;
  margin-bottom: 1px;

  &:hover,
  &.active {
    background-color: #ebeef5 !important;
    color: $cls-blue;
  }
}

.el-collapse {
  border: none;
}

/deep/ .el-collapse-item:last-child {
  .el-collapse-item__header {
    border-bottom: 0;
  }
}
</style>
