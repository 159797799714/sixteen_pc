<template>
  <div>
    <secondary-nav></secondary-nav>
    <div class="container my-4">
      <div class="row">
        <div class="col-12 my-2">
          <div class="d-flex justify-content-between">
            <div class="d-flex align-items-center">
              <div class="btn-group">
                <button
                  class="btn"
                  :class="side == 2 ? 'btn-info' : 'btn-light'"
                  @click="changeSide(2)"
                >
                  {{$t('otc.a1')}}
                </button>
                <button
                  class="btn"
                  :class="side == 1 ? 'btn-info' : 'btn-light'"
                  @click="changeSide(1)"
                >
                  {{$t('otc.a2')}}
                </button>
              </div>
              <el-select
                :value="virtual_coin"
                @input="changeCoin"
                style="width: 200px"
                class="ml-3"
              >
                <el-option
                  v-for="item in coinList"
                  :key="item.label"
                  :value="item.value"
                  :label="item.label"
                >
                </el-option>
              </el-select>
            </div>
            <div>
              <button class="btn btn-primary" @click="sendAdShow = true">
                {{$t('otc.g0')}}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 coin-list">
          <table class="w-100">
            <thead>
              <tr>
                <th>{{$t('otc.g1')}}</th>
                <th>{{$t('otc.g2')}}</th>
                <th>{{$t('otc.c6')}}</th>
                <th>{{$t('otc.g3')}}</th>
                <th>{{$t('otc.c5')}}</th>
                <th>{{$t('otc.g4')}}</th>
                <th>{{$t('otc.c9')}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in list" :key="item.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="user-head">
                      {{ userName(item.user.username) }}
                    </div>
                    <div class="name ml-2">{{ item.user.username }}</div>
                  </div>
                </td>
                <td class="text-light">{{ item.amount }}</td>
                <td class="text-light">{{ item.cur_amount }}</td>
                <td class="text-light">
                  {{ item.min_num * 1 }} - {{ item.max_num * 1||'∞' }}
                </td>
                <td>{{ item.price * 1 }} CNY</td>
                <td>
                  <template v-for="minItem in item.pay_type">
                    {{ payTypeMap[minItem] }}，
                  </template>
                </td>
                <td>
                  <button
                    class="btn btn-success btn-sm"
                    @click="clickItem(item)"
                    v-if="side == 2"
                  >
                    {{$t('otc.b7')}}
                  </button>
                  <button
                    class="btn btn-success btn-sm"
                    @click="clickItem(item)"
                    v-if="side == 1"
                  >
                    {{$t('otc.b8')}}
                  </button>
                </td>
              </tr>
               <tr v-if="!list.length">
                <td colspan="7">
                  <no-record />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="d-flex justify-content-center mt-3">
        <el-pagination
          layout="prev, pager, next"
          :page-size="detail.per_page"
          @current-change="changePage"
          :total="detail.total"
        ></el-pagination>
      </div>
      <!-- 买入卖出 -->
      <el-dialog
        :title="activeItem.side == 1 ? $t('otc.b8') :$t('otc.b7')"
        :visible.sync="buyShow"
      >
        <div class="content" v-if="activeItem.id">
          <div class="row">
            <div class="col-md-6">
              <div class="d-flex align-items-center">
                <div class="user-head">
                  {{ userName(activeItem.user.username) }}
                </div>
                <div class="name ml-2">{{ activeItem.user.username }}</div>
              </div>
              <div class="d-flex justify-content-between">
                <div class="min-max my-2 text-light">
                  {{$t('otc.g5')}}：{{ activeItem.amount }}
                </div>
                <div class="min-max my-2 text-primary">
                  {{$t('otc.c6')}}：{{ activeItem.cur_amount }}
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="d-flex justify-content-between">
                <div class="min-max mb-2 text-primary">
                  {{$t('otc.g3')}}：{{ activeItem.min_num * 1 }} - {{
                      activeItem.max_num * 1||'∞'
                  }}
                </div>
                <div class="min-max mb-2 text-light">
                  {{$t('otc.c5')}}：{{ activeItem.price * 1 }}CNY
                </div>
              </div>
              <div class="form-group">
                <input
                  class="form-control"
                  type="number"
                  v-model="form.amount"
                  :placeholder="$t('otc.a6')"
                />
              </div>
                <div class="form-group form-check-inline text-light">
                  <div
                    class="form-check"
                    v-for="minItem in activeItem.pay_type"
                    :key="minItem"
                  >
                    <input
                      class="form-check-input"
                      type="radio"
                      name="payType"
                      :value="minItem"
                      v-model="form.pay_type"
                      :id="minItem"
                    />
                    <label class="form-check-label" :for="minItem">
                      {{ payTypeMap[minItem] }}
                    </label>
                  </div>
                </div>
            </div>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="buyShow = false">{{$t('common.cancelBtn')}}</el-button>
          <el-button type="primary" @click="storeOrder">{{$t('common.confirmBtn')}}</el-button>
        </div>
      </el-dialog>
      <!-- 发布卖出广告 -->
      <el-dialog :title="$t('otc.g0')" :visible.sync="sendAdShow">
        <send-ad
          @close="sendAdShow = false"
          :coinList="coinList"
          @success="sendAdShow = false"
        />
      </el-dialog>
    </div>
  </div>
</template>
<script>
import sendAd from "./components/sendAd";
import Otc from "@/api/otc";
export default {
  data() {
    return {
      buyShow: false,
      sendAdShow: false,
      detail: {},
      page: 1,
      side: 2,
      pay_type: "all",
      virtual_coin: "USDT",
      coinList: [],
      list: [],
      activeItem: {
        user: {},
      },
      form: {
        entrust_id: "",
        amount: "",
        pay_type: "",
      },
    };
  },
  components: {
    sendAd,
  },
  computed: {
    payTypeMap() {
      return {
        alipay: this.$t('otc.b1'),
        wechat: this.$t('otc.b2'),
        bank_card: this.$t('otc.b3'),
      };
    },
  },
  created() {
    this.otcTicker();
    this.tradingEntrusts();
  },
  methods: {
    // 获取交易币种
    otcTicker() {
      Otc.otcTicker().then((res) => {
        this.coinList = res.map((item) => {
          return {
            value: item.coin_name,
            label: item.coin_name,
          };
        });
      });
    },
    changeSide(idx) {
      this.side = idx;
      this.changePage(1);
    },
    changeCoin(val) {
      this.virtual_coin = val;
      this.changePage(1);
    },
    changePage(page) {
      this.page = page;
      this.tradingEntrusts();
    },
    // 获取列表
    tradingEntrusts() {
      let data = {
        page: this.page,
        side: this.side,
        virtual_coin: this.virtual_coin,
        pay_type: this.pay_type,
      };
      Otc.tradingEntrusts(data).then((res) => {
        this.detail = res;
        this.list = res.data;
      });
    },
    userName(name) {
      return name.substring(0, 1);
    },
    clickItem(item) {
      this.activeItem = item;
      this.form.entrust_id = this.activeItem.id;
      this.form.pay_type = this.activeItem.pay_type[0];
      this.buyShow = true;
    },
    // 下单
    storeOrder() {
      let data = {
        ...this.form
      };
      Otc.storeOrder(data).then(res=>{
        this.$message.success(this.$t('otc.g6'));
        this.buyShow = true;
        this.$router.push({path:'/otc/detail',query:{id:res.id}})
      })
    },
  },
};
</script>
<style lang="scss" scoped>
.user-head {
  $size: 50px;
  height: $size;
  width: $size;
  border: 3px solid white;
  border-radius: 50%;
  overflow: hidden;
  color: white;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #6d9ef9, #1f5df4);
}
/deep/ .el-dialog {
  background-color: #222e3d;
  color: #fff;
  &__title {
    color: #fff;
  }
}
</style>