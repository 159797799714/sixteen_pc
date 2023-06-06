<template>
	<div>
		<div class="current">
			<div class="selected" @click="$emit('openList')" v-if='data[current]'>
				<img :src="data[current].coin_icon" alt="">
				<div class="name">
					{{data[current].coin_name}}
				</div>
				<i class="el-input__icon el-icon-arrow-down"></i>
			</div>
			<div class="mask-wrap" v-show="isShow">
				<div class="item" v-for="(item,index) in data" :key="index" @click="$emit('choseCoin',index)">
					<img :src="item.coin_icon" alt="">
					<span class="name">{{item.coin_name}}</span>
				</div>
			</div>
			<div class="space"  v-show="isShow" @click.stop="$emit('closeList')"></div>
		</div>
	</div>
</template>

<script>


export default {
    props: {
        data:{},
		isShow:{},
		current:{}
    },

    data() {
        return {
            
        };
    },

    methods: {
	
	}
};
</script>

<style lang="scss" scoped>
	.current{
		position: relative;
		.selected{
			display: flex;
			justify-content:space-between;
			align-items:center;
			img{
				width:30px;
			}
		}
		.mask-wrap{
			position: absolute;
			right:0;
			top:40px;
			width: 160px;
			background:#141e2c;
			padding:20px 0;
			border-radius:10px;
			max-height:320px;
			overflow-y:scroll;
			z-index:999;
			box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
			.item{
				display: flex;
				height:50px;
				align-items: center;
				padding:0 15px;
				img{
					width:30px;
					margin-right:20px;
				}
				&:hover{
					cursor: pointer;
				}
			}
		}
		.space{
			position: fixed;
			top:0;
			left:0;
			width:100%;
			height:100%;
			background: rgba(0, 0, 0, 0.3);
			z-index: 995;
		}
	}
</style>
