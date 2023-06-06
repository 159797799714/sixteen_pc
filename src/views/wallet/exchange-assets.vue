<template>
  <div class="settings wallet-page">
    <secondary-nav></secondary-nav>
    <!-- 资产 -->
    <div class="container">
      <div class="w-100 d-flex justify-content-between align-items-center mb-3 mt-4">
        <div class="h3">{{$t('wallet.assets')}}</div>
        <div>
          <!-- 24小时提币限额： 0 / 20000 USD -->
          <span class="icon-Icon-Increase"></span>
        </div>
      </div>
      <div class="row">
        <div class="col-md-7">
          <div class="panel-box bg-panel">
            <div class="heading d-flex justify-content-between align-items-center">
              <div class="h6">{{$t('wallet.allAssets')}}</div>
              <div>
                <div class="custom-control custom-switch">
                  <input type="checkbox" v-model="showValue" class="custom-control-input" id="numerical-control" />
                  <label class="custom-control-label" for="numerical-control">{{$t('wallet.showNum')}}</label>
                </div>
              </div>
            </div>
            <div class="content tab-content">
              <div class="my-1">
                ≈
                <span class="num h2 light-purple">
                  <template v-if="showValue">{{userAssets.total_assets_usd|omitTo(4)}}</template>
                  <template v-else>********</template>
                </span>
                USDT
              </div>
              <div class="my-1">
                ≈
                <span class="num h2 light-purple">
                  <template v-if="showValue">{{userAssets.total_assets_usd|omitTo(4)}}</template>
                  <template v-else>********</template>
                </span>
                USD
              </div>
              <div class="container">
                <div class="row mt-4">
                  <div class="col-6">
                    <div class="label">{{$t('wallet.capitalAccount')}}</div>
                    <div>
                      <span class="num h3 light-purple">
                        <template v-if="showValue">{{userAssets.funds_account_usd|omitTo(4)}}</template>
                        <template v-else>********</template>
                      </span>
                      USDT
                    </div>
                  </div>
                  <!-- <div class="col-6">
                    <div class="label">{{$t('otc.j1')}}</div>
                    <div>
                      <span class="num h3 light-purple">
                        <template v-if="showValue">{{userAssets.otc_account_usd|omitTo(4)}}</template>
                        <template v-else>********</template>
                      </span>
                      USDT
                    </div>
                  </div> -->
                </div>
                <div class="row mt-4">
                  <div class="col-6">
                    <div class="label">{{$t('common.contractaccount')}}</div>
                    <div>
                      <span class="num h3 light-purple">
                        <template v-if="showValue">{{userAssets.contract_account_usd|omitTo(4)}}</template>
                        <template v-else>********</template>
                      </span>
                      USDT
                    </div>
                  </div>
                  <div class="col-6" v-if="false">
                    <div class="label">{{$t('wallet.financialAccount')}}</div>
                    <div>
                      <span class="num h3 light-purple">
                        <template v-if="showValue">-</template>
                        <template v-else>********</template>
                      </span>
                      BTC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-5">
          <inner-transfer @change="getUserAssets"></inner-transfer>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 mt15">
          <div class="markets-pair-list">
            <!-- <ul class="nav nav-pills" id="pills-tab" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" data-toggle="pill" href="#tab1" role="tab" aria-selected="false">现货账户</a>
                        </li>
            </ul>-->
            <form class="form-inline search-box">
              <div class="form-check mb-2 mr-sm-2">
                <input class="form-check-input" type="checkbox" id="hideZero" v-model="isHideZero" />
                <label class="form-check-label" for="hideZero">{{$t('wallet.hide')}} 0 {{$t('wallet.balanceAssets')}}</label>
              </div>

              <div class="mb-2 mr-sm-2">
                <input type="text" v-model="keyword" class="form-control mb-2 mr-sm-2" :placeholder="$t('wallet.searchCurrency')" />

                <router-link to="/wallet/address" class="btn btn-success rounded-pill mb-2">{{$t('wallet.addressManagement')}}</router-link>
              </div>
            </form>
            <div class="tab-content">
              <div class="tab-pane fade show active" id="tab1" role="tabpanel">
                <table class="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{{$t('wallet.assets')}}</th>
                      <th>{{$t('wallet.totalAssets')}}</th>
                      <th>{{$t('wallet.availableBalance')}}</th>
                      <th>{{$t('wallet.fee')}}</th>
                      <th>USD{{$t('wallet.valuation')}}</th>
                      <th class="text-right">{{$t('wallet.operating')}}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in coinAssets" :key="item.id" v-if="seek(item)">
                      <td>{{ index + 1}}</td>
                      <td>
                        <!-- <img :src="item.image" alt="eth" /> -->
                        {{ item.coin_name }}
                      </td>
                      <td>{{ item.freeze_balance|add(item.usable_balance) }}</td>
                      <td>{{item.usable_balance}}</td>
                      <td>{{item.freeze_balance}}</td>
                      <td>{{item.usd_estimate}}</td>
                      <td>
                        <div class="btn-group btn-group-sm" role="group" aria-label="Basic example">
                          <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#deposite" @click="enterDeposite(item)" :disabled="!item.is_withdraw">{{$t('wallet.recharge')}}</button>
                          <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#withdraw" @click="enterWithdraw(item)" :disabled="!item.is_withdraw">{{$t('wallet.withdrawal')}}</button>
                          <div class="btn-group btn-group-sm" role="group">
                            <button id="btnGroupDrop1" type="button" class="btn btn-outline-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{$t('wallet.transaction')}}</button>
                            <div class="dropdown-menu" aria-labelledby="btnGroupDrop1" v-for="(symbol,index) in item.symbol" :key="index">
                              <!-- <router-link :to="`/exchange/`">{{symbol.coin_name.toUpperCase()}}</router-link> -->
                              <!-- <router-link @click="getJump('{item.coin_name}')">{{symbol.coin_name.toUpperCase()}}</router-link> -->
                             <router-link :to="`/exchange/${symbol.coin_name.replace(/\//g,'')}`">{{symbol.coin_name.toUpperCase()}}</router-link>
         
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 充值 -->
      <div class="modal fade" tabindex="-1" role="dialog" id="deposite" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content bg-panel">
            <div class="modal-header">
              <h5 class="modal-title">{{$t('wallet.recharge')}}（{{depositeCoin}}）</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  <div class="col-md-4">
                    <form action class="deposite-body">
                      <template v-if="depositeCoin =='USDT'">
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" v-model="depositeAdressType" name="deposite—address-type" id="deposite-erc20" value="2" />
                          <label class="form-check-label" for="deposite-erc20">ERC20</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" v-model="depositeAdressType" name="deposite—address-type" id="deposite-trc20" value="3" />
                          <label class="form-check-label" for="deposite-trc20">TRC20</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" v-model="depositeAdressType" name="deposite—address-type" id="deposite-omni" value="1" />
                          <label class="form-check-label" for="deposite-omni">BTC</label>
                        </div>
                      </template>

                      <div class="form-group mt-2">
                        <label for="formGroupExampleInput">
                          {{$t('wallet.rechargeAddress')}}
                          <template v-if="depositeCoin == 'USDT'">(USDT -
                            <span v-show="depositeAdressType==2">ERC20</span>
                            <span v-show="depositeAdressType==3">TRC20</span>
                            <span v-show="depositeAdressType==1">BTC</span>
                            )</template>
                        </label>
                        <div class="input-group input-group-sm">
                          <input type="text" v-model="deposite.address" readonly class="form-control" id="deposite-address" required />
                          <div class="input-group-append dopsite-control" data-clipboard-target="#deposite-address">
                            <span class="my-pop input-group-text" data-toggle="popover" data-placement="bottom" :data-content="$t('wallet.rechargeAddress')+'!'">
                              <a href="javascript:void 0" alt="Copy to clipboard">{{$t('wallet.copy')}}</a>
                            </span>
                          </div>
                        </div>

                        
                        <div class="form-group  mt-4">
                              <div class="input-group">
                                  <input
                                  type="number"
                                  class="form-control"
                                  v-model="form.amount"
                                  step="1"
                                  min="0"
                                  :placeholder="$t('wallet.money')"
                                  />
                              </div>        
                                         
                        </div>


                        <div class="form-group">
                            <div class="mb-2">
                                <label>{{$t('otc.e4')}}：</label>
                                <div class="paycode-box" v-if="form.image">
                                    <img :src="form.image" alt="" />
                                </div>
                                <upload-img :allowSize="5000" v-model="form.image" class="mb-3" required :placeholder="$t('otc.e5')">
                                    <template #text>
                                        <div class="text-primary">{{$t('otc.e6')}}</div>
                                    </template>
                                </upload-img>
                                
                            </div>
                        </div>

                        <button class="btn btn-primary rounded-pill" @click.prevent="rechargeManualPost">
                        {{ $t("common.submit") }}
                        </button>
                      </div>
                      <div class="form-group mt-2" v-if="false">
                        <label for="formGroupExampleInput">{{$t('wallet.rechargeQuantity')}}</label>
                        <div class="input-group input-group-sm">
                          <input type="number" class="form-control" required min="0" step="0.00000001" v-model="deposite.amount" :placeholder="$t('wallet.enterQuantity')" />
                        </div>
                      </div>
                    </form>
                  </div>
                  <div class="col-md-3 text-center" style="margin-left:260px">
                    <vue-qr class="mr-2" v-if="deposite.address" :text="deposite.address" :margin="0" :size="150" />
                    <!-- <img src="http://iph.href.lu/150x150" alt /> -->
                  </div>
                  <!-- <div class="col-md-5">
                    <p>{{$t('wallet.rechargeInstructions')}}</p>
                    <ul>
                      <li>1. {{$t('wallet.automaticallyCredited')}}。 {{$t('wallet.tran',{num:10,name:'USDT'})}}。</li>
                      <li>2. {{$t('wallet.only',{name:'USDT'})}}。</li>
                    </ul>
                  </div> -->
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="handleDeposite" v-if="false">{{$t('common.confirmBtn')}}</button>
            </div>
          </div>
        </div>
      </div>
      <!-- 提币 -->
      <div class="modal fade" tabindex="-1" role="dialog" id="withdraw">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content bg-panel">
            <div class="modal-header">
              <h5 class="modal-title">{{$t('wallet.withdrawal')}}（{{withdrawCoin}}）</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  <div class="col-md-6">
                    <form action class="withdraw-body">
                      <template v-if="withdrawCoin =='USDT'">
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="withdraw-address-type" id="withdraw-erc20" v-model="withdraw.addressType" value="2" />
                          <label class="form-check-label" for="withdraw-erc20">ERC20</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="withdraw-address-type" id="withdraw-trc20" v-model="withdraw.addressType" value="3" />
                          <label class="form-check-label" for="withdraw-trc20">TRC20</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="withdraw-address-type" id="withdraw-omni" v-model="withdraw.addressType" value="1" />
                          <label class="form-check-label" for="withdraw-omni">BTC</label>
                        </div>
                      </template>
                      <div class="form-group mt-2">
                        <label class="d-flex justify-content-between" for="formGroupExampleInput">
                          <span>
                            {{$t('wallet.drawAddress')}}
                            <template v-if="withdrawCoin == 'USDT'">(USDT-
                              <span v-show="withdraw.addressType==2">ERC20</span>
                              <span v-show="withdraw.addressType==3">TRC20</span>
                              <span v-show="withdraw.addressType==1">BTC</span>)</template>
                          </span>
                          <span>
                            {{$t('wallet.low')}}:{{withdrawFee.withdrawal_min}} {{withdrawCoin}}
                            <router-link to="/wallet/address" class="text-primary">{{$t('wallet.addressList')}}</router-link>
                          </span>
                        </label>
                        <div class="input-group input-group-sm">
                          <input type="text" :placeholder="$t('wallet.enterDrawAddress')" :data-message="$t('wallet.invalidWallet')+'！'" v-model="withdraw.address" class="form-control" required />
                        </div>
                      </div>
                      <div class="form-group mt-2">
                        <label class="d-flex justify-content-between" for="formGroupExampleInput">
                          <span>{{$t('wallet.withdrawalsNumber')}}</span>
                          <span>
                            <input class="form-check-input" type="checkbox" id="allAssets" v-model="allAssets" />
                            <label for="allAssets">{{$t('wallet.all')}}</label>
                            <span>{{$t('wallet.availableBalance')}}: {{withdrawFee.usable_balance}} {{withdrawCoin}}</span>
                          </span>
                        </label>
                        <div class="input-group input-group-sm">
                          <input type="number" v-model="withdraw.amount" step="0.00000001" :placeholder="$t('wallet.enterDrawNum')" class="form-control" />
                        </div>
                        <span class="text-right">{{$t('wallet.handlingFee1')}}: {{withdrawFee.withdrawal_fee}}%</span>
                      </div>
                    </form>
                  </div>
                  <div class="col-md-6">
                    <p>{{$t('wallet.withdrawalInstructions')}}</p>
                    <ul>
                      <li>1. {{$t('wallet.enterAddress')}}。</li>
                      <li>2. {{$t('wallet.notSend')}}。</li>
                      <li>3. {{$t('wallet.deductionFee')}}。</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary rounded-pill" @click="toHandleWithdraw">{{$t('common.confirmBtn')}}</button>
            </div>
          </div>
        </div>
      </div>
      <v-box v-model="verShow" :title="$t('setting.ver')">
        <d-code :status="withdrawFee" @complete="codeComplete" />
      </v-box>
    </div>
  </div>
</template>

<script>
import InnerTransfer from "../components/inner-transfer.vue";
import Wallet from "@/api/wallet";
import ClipboardJS from "clipboard";
import getCode from "./getCode";
import vueQr from "vue-qr";
export default {
  components: {
    InnerTransfer,
    vueQr,
    dCode: getCode
  },
  data() {
    return {
      // 所有资产列表，需要接口返回
      userAssets: {
        contract_account_btc: 0,
        contract_account_usd: 0,
        funds_account_btc: 0,
        funds_account_usd: 0,
        total_assets_btc: 0,
        total_assets_usd: 0
      },

      coinAssets: [], // 币种账户

      isHideZero: false, // 是否隐藏0余额资产
      keyword: "",
      showValue: true, // 默认隐藏资产数值

      depositeCoin: null,
      depositeAdressType: 2, // 默认充值类型 1 为 omin 2 为 erc20

      withdrawCoin: null,

      // 充值币种
      deposite: {
        coin_id: "",
        amount: "",
        address: ""
      },

      // 提取币种
      withdraw: {
        coin_id: "",
        amount: "",
        address: "",
        addressType: 2, // 默认提币类型 1 为 omni； 2 为 erc20,
        code_type: 1,
        code: ''
      },

      withdrawFee: {
        usable_balance: "-",
        withdrawal_fee: "-",
        withdrawal_min: "-",
        withdrawal_max: "-"
      }, // 提币手续费和余额

      // 所有资产提取
      allAssets: false, //
      cacheInputAssets: null,
      verShow: false,
      image: "",
      form: {
          currency: "",
          amount: "",
          image: "",
      },
    };
  },

  // 保留用户行为

  watch: {
    // 协议改变时 重新获取地址
    depositeAdressType() {
      this.getDepositeAdress();
    },

    allAssets(val) {
      if (val) {
        this.cacheInputAssets = this.withdraw.amount;
        this.withdraw.amount = this.withdrawFee.usable_balance;
      } else {
        this.withdraw.amount = this.cacheInputAssets;
      }
    }
  },

  methods: {
    seek(item) {
      // 搜索关键字
      const reg = new RegExp(this.keyword, "gi");
      let res1 = !this.keyword || item.coin_name.search(reg) >= 0;

      // 隐藏零余额
      let res2 = !this.isHideZero || item.usable_balance.startsWith("0");

      return res1 && res2;
    },

    // 获取用户资产
    getUserAssets() {
      Wallet.personalAssets()
        .then(data => {
          this.userAssets = data;
        })
        .catch(err => { });
    },

    // 获取币种资产
    getCoinAssets() {
      Wallet.fundAccount()
        .then(data => {
          this.coinAssets = data.list;
          console.log(this.coinAssets);
        })
        .catch(err => { });
    },

    // 生成充值地址
    getDepositeAdress() {
      Wallet.walletImage({
        coin_id: this.deposite.coin_id,
        address_type: this.depositeAdressType // 充值地址类型
      })
        .then(data => {
          this.deposite.address = data.address;
        })
        .catch(err => { });
    },

    // 进入充值
    enterDeposite(item) {
      this.depositeCoin = item.coin_name;
      this.deposite.coin_id = item.coin_id;
      // 初始化充值地址
      this.getDepositeAdress();
    },

    // 处理充值
    handleDeposite() {
      //
      if (utils.validate(".deposite-body")) {
        Wallet.recharge(this.deposite)
          .then(data => {
            this.$message({
              type: "success",
              message: this.$t("wallet.submitSuccess") + "！",
              duration: 1000
            });
            // 手动关闭模态框
            $("#deposite").modal("hide");
          })
          .catch(err => { });
      }
    },

    // 进入提币
    enterWithdraw(item) {
      this.withdrawCoin = item.coin_name;
      this.withdraw.coin_id = item.coin_id;
      // 查找余额 手续费等信息
      Wallet.withdrawalBalance({
        coin_name: item.coin_name
      })
        .then(data => {
          this.withdrawFee = data;
        })
        .catch(err => { });
    },

    // 处理提币
    toHandleWithdraw() {
      let data = this.withdrawFee
      if (utils.validate(".withdraw-body")) {
        if (data.withdraw_switch == 1) {
          $("#withdraw").modal("hide");
          this.verShow = true
        } else {
          this.handleWithdraw()

        }
      }
    },
    handleWithdraw() {

      Wallet.withdraw(this.withdraw)
        .then(data => {
          this.$message(this.$t("wallet.operationComplete") + "！");
        })
        .catch(err => { });
    },
    getJump(name){
        // { path: '/exchange',query:{ s:symbol.coin_name } }
        console.log(name);
    },
    // 验证码输入完成
    codeComplete(obj) {
      this.withdraw.code_type = obj.code_type
      this.withdraw.code = obj.code
      this.verShow = false
      this.handleWithdraw()
    },
    // 创建充币地址
    createWalletAddress() {
      // 文鹏写的接口
      // Wallet.createWalletAddress();
    },
    rechargeManualPost() {
        let formData = this.form;
        formData.currency = this.deposite.coin_id
        

        Wallet.rechargeManualPost(formData)
            .then(data => {
                this.$message.success(this.$t('otc.b6'));
                this.form.amount = "";
                this.form.image = "";
            })
            .catch(err => {});
    }
  },

  created() {
    this.getUserAssets();
    this.getCoinAssets();
    this.createWalletAddress();
  },

  mounted() {
    const clipboard = new ClipboardJS(".dopsite-control");

    clipboard.on("success", function (e) {
      $(".my-pop").popover("show");
      setTimeout(function () {
        $("#deposite-address").blur();
        $(".my-pop").popover("hide");
      }, 1000);
      // 清除选取内容
      // e.clearSelection();
    });

    clipboard.on("error", function (e) {
      // console.error('Action:', e.action);
      // console.error('Trigger:', e.trigger);
    });
  }
};
</script>

<style lang="scss" scoped>
.nav-two {
  .nav-item {
    cursor: pointer;
    position: relative;

    &::after {
      content: "";
      width: 0;
      height: 2px;
      background: #007bff;
      position: absolute;
      bottom: -13px;
      left: 0;
      @include css3(transition, width 0.2s);
    }

    &.active,
    &:hover {
      &::after {
        width: 100%;
      }
    }
  }
}
.table {
  tr {
    &:nth-of-type(2n-1) {
      background-color: #222e3d;
    }
    &:nth-of-type(2n) {
      background-color: #1e2834;
    }
  }
}
.search-box {
  @include flexible(row, space-between);
}
</style>
