<template>
	<view class="goodsBox" :class="{ 'selected': selected && deleteMode }">
		<view class="goods-header">
			<text class="goods-name">{{ item.goods_name }}</text>
			<text class="goods-price">￥{{ item.goods_price }}</text>
		</view>
		<view class="goods-main">
			<view class="goods-info">
				<text class="goods-num">库存: {{ item.goods_num == undefined || item.goods_num === null ||
		item.goods_num === '' ? '未添加' : item.goods_num }}</text>
				<text class="goods-code">编码: {{ item.goods_sn || '未添加' }}</text>
			</view>
			<view class="goods-time-info">
				<text class="goods-time">更新时间: {{ formatMillisecondsToDate(item.last_modify_date) }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import {
	formatMillisecondsToDate
} from '@/utils/tool.js'

export default {
	name: "goods-item",
	data() {
		return {};
	},
	methods: {
		formatMillisecondsToDate,
	},
	props: {
		item: {
			type: Object,
			default() {
				return {}
			}
		},
		selected: {
			type: Boolean,
			default: false
		},
		deleteMode: {
			type: Boolean,
			default: false
		}
	}
}
</script>

<style scoped>
.goodsBox {
	margin: 10rpx 20rpx;
	padding: 10rpx 28rpx;
	background: #fff;
	border: 1rpx solid #ccc;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.selected {
	background: linear-gradient(-66deg, #ff6b6b, #ff3b30);
	border-color: #ff3b30;
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 12rpx rgba(255, 59, 48, 0.3);
}

.selected .goods-name,
.selected .goods-price,
.selected .goods-num,
.selected .goods-code,
.selected .goods-time {
	color: #ffffff;
}

.goods-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 4rpx;
}

.goods-name {
	font-size: 32rpx;
	color: #111;
	font-weight: 600;
}

.goods-price {
	font-size: 28rpx;
	color: #ff3b30;
	font-weight: 600;
}


.goods-main {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.goods-info {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: flex-start;
}

.goods-num {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 4rpx;
}

.goods-code {
	font-size: 24rpx;
	color: #666;
}

.goods-time-info {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: flex-end;
}

.goods-time {
	font-size: 22rpx;
	color: #999;
}
</style>