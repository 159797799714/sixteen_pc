<template>
	<div>
		<secondary-nav></secondary-nav>
		<div class="container">
			<div class="w-100 d-flex justify-content-between align-items-center mb-3 mt-4">

				<div class="wrapper">
					<div class="int-item">
						<div class="tit">{{$t('flash.a1')}}</div>
						<div class="int-wrap">
							<input type="digit" placeholder="0.00000000" v-model="userInt" @input="onInput">
							<div class="right">
								<div class="max" @click='intMax'>{{$t('profile.max')}}</div>
								<div class="coin-list">
									<selectCoin :data='coinList' @choseCoin='choseCoin' :isShow='isShowCoinList' @openList='openCoinList' :current='form.from_account' @closeList='closeList'></selectCoin>
								</div>
							</div>
						</div>
					</div>
					<div class="rate"  v-if="coinList[form.from_account]">
						{{$t('contract.a3')}} {{form.amount}} {{coinList[form.from_account] ? coinList[form.from_account].coin_name : ''}}
					</div>
					<div class="swap" >
						<i data-v-0cbb7371="" class="ion ion-ios-swap h3 mt-3 hover" style="transform: rotate(90deg);" @click='swap'></i>
					</div>
					
					<div class="int-item">
						<div class="tit">{{$t('flash.a2')}}</div>
						<div class="int-wrap">
							<input type="text" placeholder="0.00000000" disabled v-model="getNum">
							<div class="right" style="width:15%">
								<div class="coin-list">
									<selectToCoin :data='coinList' @choseCoin='choseToCoin' :isShow='isShowToCoin' @openList='openToCoin' :current='form.to_account' @closeList='closeToList'></selectToCoin>
								</div>
							</div>
						</div>
					</div>
					
					<div class="rate"  v-if="coinList[form.from_account]">
						{{$t('flash.a3')}}：1{{coinList[form.from_account].coin_name}} ≈ {{rate}} {{coinList[form.to_account].coin_name}}
					</div>
					
					<button class="btn btn-primary rounded-pill" @click="submit">{{$t('contract.c5')}}</button>
					
					
					<div class="iconbar">
						<div class="item">
							<img src="../../assets/img/exicon1.png" alt="">
							<p class="title">
								{{$t('flash.a4')}}
							</p>
						</div>
						<div class="item">
							<img src="../../assets/img/exicon2.png" alt="">
							<p class="title">
								{{$t('flash.a5')}}
							</p>
						</div>
						<div class="item">
							<img src="../../assets/img/exicon3.png" alt="">
							<p class="title">
								{{$t('flash.a6')}}
							</p>
						</div>
					</div>
					
				</div>

			</div>
		</div>
		<modalFade :visible='isShowModel' title='Warnning' :showOperation='true' @cancel='cancel' @submit='exchange' :content='content' width='300px'></modalFade>
	</div>
</template>

<script>
	import Wallet from "../../api/wallet.js";
	import Exchange from "../../api/exchange.js";
	import selectCoin from "../../components/selectCoin.vue"
	import selectToCoin from "../../components/selectToCoin.vue"
	import modalFade from '../../components/modelFade.vue'
	export default {
		name: "contract-assets",
		data() {
			return {
				coinList: [],
				curCoin:"",
				curToCoin:'',
				isShowCoinList:false,
				isShowToCoin:false,
				isSwapCoin:false,
				isChangeCoin: false,
				form:{
					from_account:0,
					to_account:1,
					amount:0
				},
				rate:null,
				userInt:'',
				getNum:"",
				isShowModel:false,
				content:""
			};
		},
		mounted() {
		  this.getCoinList();
		},
		methods: {
			getCoinList(){
				Exchange.getExchangeCoin().then(res=>{
					this.coinList = res
					setTimeout(()=>{
						this.getExchangeCoinRate()
						this.fundAccount()
					},500)
				})
			},
			choseCoin(index){
				this.form.from_account = index
				this.isShowCoinList = false
				this.isChangeCoin = false,
				this.getExchangeCoinRate()
				this.fundAccount()
			},
			openCoinList(){
				this.isShowCoinList = !this.isShowCoinList
			},
			choseToCoin(index){
				this.form.to_account = index
				this.isShowToCoin = false
				this.isChangeCoin = false,
				this.getExchangeCoinRate()
			},
			closeList(){
				this.isShowCoinList = false
			},
			openToCoin(){
				this.isShowToCoin = !this.isShowToCoin
			},
			closeToList(){
				this.isShowToCoin = false
			},
			swap(){
				[this.form.from_account, this.form.to_account] = [
					this.form.to_account,
					this.form.from_account,
				];
				this.isSwapCoin = true;
				this.getExchangeCoinRate()
				this.fundAccount()
			},
			getExchangeCoinRate() {
				Exchange.getExchangeCoinRate({
					from_coin_name: this.coinList[this.form.from_account].coin_name,
					to_coin_name: this.coinList[this.form.to_account].coin_name
				}).then((res) => {
						this.rate = res.rate
						if (this.isSwapCoin && this.userInt) {
							this.userInt = this.getNum
							this.getNum = (this.userInt * this.rate).toFixed(8)
							this.isSwapCoin = false
						} else {
							this.getNum = (this.rate * this.userInt).toFixed(8)
						}
				});
			},
			onInput(e){
				this.getNum = this.userInt * this.rate
			},
			fundAccount() {
				Wallet.fundAccount().then((res) => {
					this.account = res.list;
					this.account.forEach((item) => {
						if (item.coin_name == this.coinList[this.form.from_account].coin_name) {
							this.form.amount = item.usable_balance
						}
					})
				});
			},
			intMax() {
				this.userInt = this.form.amount
				this.getNum = this.rate * this.userInt
			},
			submit(){
				if (!this.userInt) {
					this.$message.error(this.$t("flash.a9"));
					return;
				}
				this.isShowModel = true
				let number = this.userInt
				let get = number * this.rate
				this.content = this.$t('flash.a7') + number + this.coinList[this.form.from_account].coin_name + this.$t('flash.a8') + get + this.coinList[
					this.form.to_account].coin_name + "?"
			},
			cancel(){
				this.isShowModel = false
			},
			exchange(){
				this.isShowModel = false
				Exchange.submitExchange({
					from_coin_name:this.coinList[this.form.from_account].coin_name,
					to_coin_name:this.coinList[this.form.to_account].coin_name,
					amount:this.userInt
				}).then((res)=>{
					this.$message.success('success');
					setTimeout(()=>{
						this.fundAccount()
					},500)
				});
			}
		},
		components:{
			selectCoin,
			selectToCoin,
			modalFade
		}
	};
</script>

<style lang="scss">
	.wrapper{
		flex:1;
		padding:40px 10%;
		background: #222e3d;
		border: 1px solid transparent;
		border-radius: 2px;
		.int-item{
			width:100%;
			.tit{
				margin-bottom: 10px;
			}
			.int-wrap{
				display: flex;
				align-items: center;
				justify-content:space-between;
				width: 100%;
				border:1px solid #ced4da;
				border-radius:10px;
				height:50px;
				padding:0 20px;
				input{
					border:none;
					outline:none;
					background: none;
					flex:1;
					color:#fff;
					text-indent:1rem;
				}
				.right{
					display: flex;
					align-items: center;
					width:20%;
					.max{
						color: #007aff;
						margin-right:20px;
						cursor: pointer;
					}
					.coin-list{
						flex:1;
					}
				}
				
			}
		}
		.swap{
			text-align:center;
			margin:20px auto;
			i{
				cursor: pointer;
			}
		}
		.rate{
			margin: 10px 0;
		}
		.btn{
			width:40%;
			margin:20px auto 0;
			display: block;
		}
		.iconbar{
			margin-top:80px;
			display: flex;
			justify-content: space-between;
			.item{
				flex-basis: 100%;
				text-align: center;
				img{
					margin-bottom: 20px;
					width: 120px;
				}
			}
		}
	}
</style>
