<template>
<div class="wallet-page">
    <secondary-nav></secondary-nav>
    <div class="container">
        <div class="w-100 d-flex justify-content-between align-items-center mb-3 mt-4">
            <div class="h3">{{$t('common.direct-recharge')}}</div>
        </div>
        <div class="row">
            <div class="col-md-5">
                <form class="transfer-body">
                    <div class="form-group">
                        <label for="asstes">{{ $t("common.direct-recharge-currency") }}</label>
                        <div>
                            <el-select
                            v-model="form.currency"
                            @input="changePayment"
                            :placeholder="$t('common.direct-recharge-pleaseSelect')"
                            >
                                <el-option
                                    v-for="(item, index) in paymentList"
                                    :key="index"
                                    :label="item.currency"
                                    :value="item.currency"
                                >
                                    <span>{{ item.currency }}</span>
                                </el-option>
                            </el-select>
                        </div>

                        <div class="mb-2">
                            <div class="col-md-12">
                            {{$t('common.exchange_rate')}}：{{ payment.exchange_rate }}
                            </div>
                            <div class="col-md-12">
                            {{$t('otc.d7')}}：{{ payment.real_name }}
                            </div>
                            <div class="col-md-12">{{$t('otc.d8')}}：{{ payment.card_no }}</div>
                            <div class="col-md-12">
                            {{$t('otc.d9')}}：{{ payment.bank_name }}
                            </div>
                            
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <input
                            type="number"
                            class="form-control"
                            v-model="form.amount"
                            step="1"
                            min="0"
                            :placeholder="$t('common.direct-recharge-strokes')"
                            />
                            <div class="input-group-append">
                                <span class="input-group-text fn-12">
                                    &nbsp; USDT
                                </span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <div>{{ $t("common.direct-recharge-money") }}：</div>
                            <div>{{ money }} {{ form.currency }}</div>
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
                    {{ $t("common.direct-recharge-confirm") }}
                    </button>
                </form>
            </div>
            <div class="col-md-7">
                <div class="panel-box bg-panel">
                    <div class="heading d-flex justify-content-between align-items-center">
                        <div class="h6">{{$t('common.direct-recharge-description')}}</div>
                    </div>
                    <div class="tab-content">
                        <ul>
                            <!-- <li class="mb-2">1.{{$t('wallet.handlingFee')}}。</li> -->
                            <!-- <li class="mb-2">2.{{$t('wallet.inCase2',{name:'USDT'})}}。</li> -->
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 mt15">
                <div class="markets-pair-list">
                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="tab1" role="tabpanel">
                            <table class="table stripe">
                                <thead>
                                    <tr>
                                        <th>{{$t('common.direct-recharge-a1')}}</th>
                                        <th>{{$t('common.direct-recharge-a2')}}</th>
                                        <th>{{$t('common.direct-recharge-a3')}}</th>
                                        <th class="text-right">{{$t('wallet.status')}}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in rechargeManualLogs" :key="item.id">
                                        <td>
                                            <img src="../../assets/img/icon/1.png" alt="eth" />
                                            {{ item.amount }}
                                        </td>
                                        <td> {{ item.pay_money }} {{ item.pay_currency }} </td>
                                        <td>{{ item.created_at|parseTime }}</td>
                                        <td class="text-right">
                                            <!-- 0-待审核 1-成功 2-驳回 -->
                                            <span class="fail" v-if="item.status == 0">{{$t('common.to-audit')}}</span>
                                            <span class="fail" v-if="item.status == 1">{{$t('common.reject')}}</span>
                                            <span class="success"  v-else-if="item.status == 2">{{$t('wallet.success')}}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import Wallet from "@/api/wallet";
import math from "@/utils/class/math.js";
export default {
    data() {
        return {
            paymentList: [],
            payment: {
                exchange_rate: "",
                bank_name: "",
                real_name: "",
                card_no: ""
            },
            image: "",
            rechargeManualLogs: [],
            form: {
                currency: "",
                amount: "",
                image: "",
            },
        };
    },

    computed: {
        money() {
            return math.omitTo(this.form.amount * this.payment.exchange_rate, 4);
        }
    },
    methods: {
        getPayments() {
            Wallet.getPayments()
                .then(data => {
                    this.paymentList = data;
                    console.log({"paymentList":this.paymentList})
                    if(this.paymentList.length > 0){
                        this.from.currency = this.paymentList[0].currency
                    }
                })
                .catch(err => {});
        },
        changePayment(item) {
            let payment = this.paymentList.find((value,index,arr)=>{
                return value.currency == item
            })
            
            this.payment.exchange_rate = payment.exchange_rate;
            this.payment.bank_name = payment.bank_name;
            this.payment.real_name = payment.real_name;
            this.payment.card_no = payment.card_no;
        },
        getRechargeManualLog() {
            Wallet.rechargeManualLog()
                .then(data => {
                    this.rechargeManualLogs = data.data;
                })
                .catch(err => {});
        },
        rechargeManualPost() {
            let formData = this.form;
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
        this.getPayments();
        this.getRechargeManualLog();
    }
};
</script>

<style lang="scss" scoped>
.table {
    tr {
        td {
            cursor: default !important;
        }
    }

}
</style>
