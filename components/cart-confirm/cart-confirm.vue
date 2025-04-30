<template>
	<view class="popup-mask" v-if="show" @click.stop="cancel">
		<view class="popup-content" @click.stop>
			<view class="popup-header">
				<text class="title">确认出库</text>
				<text class="close-btn" @click="cancel">×</text>
			</view>

			<view class="popup-body">
				<view class="table-header">
					<text class="header-name">名称</text>
					<view class="header-right">
						<text class="header-quantity">数量</text>
						<text class="header-price">单价</text>
					</view>
				</view>
				<scroll-view scroll-y="true" show-scrollbar="true" style="height: 400rpx;">
					<view class="goods-item" v-for="(item, index) in goodsList" :key="index">
						<text class="goods-name">{{item.goods_name}}</text>
						<view class="goods-right">
							<text class="goods-quantity">x{{item.quantity}}</text>
							<text class="goods-price">￥{{item.goods_price}}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<view class="popup-footer">
				<view class="total-section">
					<text class="total-label">合计：</text>
					<text class="total-price">￥{{totalPrice}}</text>
				</view>
				<view class="btn-group">
					<button @click="cancel" class="btn cancel-btn">取消</button>
					<button @click="confirm" class="btn confirm-btn">确认</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'cart-confirm',
		props: {
			show: {
				type: Boolean,
				default: false
			},
			goodsList: {
				type: Array,
				default: () => []
			}
		},
		computed: {
			totalPrice() {
				return this.goodsList.reduce((total, item) => 
					total + (item.goods_price * item.quantity), 0).toFixed(2)
			}
		},
		methods: {
			cancel() {
				this.$emit('update:show', false)
			},
			confirm() {
				this.$emit('confirm')
			}
		}
	}
</script>

<style scoped>
	.popup-mask {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.2s ease-out;
	}

	.popup-content {
		width: 80%;
		background: #fff;
		border-radius: 32rpx;
		overflow: hidden;
		animation: slideIn 0.2s ease-out;
	}

	.popup-header {
		padding: 0 24rpx;
		border-bottom: 2rpx solid #eee;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
	}

	.close-btn {
		font-size: 48rpx;
		color: #999;
		padding: 8rpx 16rpx;
	}

	.popup-body {
		padding: 24rpx 0 0 24rpx;
	}

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 24rpx 20rpx 0;
		border-bottom: 2rpx solid #eee;
		margin-bottom: 10rpx;
	}

	.header-name {
		flex: 1;
		font-size: 28rpx;
		color: #666;
		padding-right: 20rpx;
	}

	.header-right {
		display: flex;
		align-items: center;
		width: 300rpx;
		justify-content: flex-end;
	}

	.header-quantity {
		font-size: 28rpx;
		color: #666;
		width: 100rpx;
		text-align: right;
		margin-right: 20rpx;
	}

	.header-price {
		font-size: 28rpx;
		color: #666;
		width: 160rpx;
		text-align: right;
	}

	.goods-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		margin-right: 24rpx;
		border-bottom: 1rpx solid #eee;
	}

	.goods-name {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		padding-right: 20rpx;
	}

	.goods-right {
		display: flex;
		align-items: center;
		width: 300rpx;
		justify-content: flex-end;
	}

	.goods-quantity {
		font-size: 28rpx;
		color: #666;
		width: 100rpx;
		text-align: right;
		margin-right: 20rpx;
	}

	.goods-price {
		font-size: 28rpx;
		color: #ff3b30;
		width: 160rpx;
		text-align: right;
	}

	.total-section {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 15rpx 0;
	}

	.total-label {
		font-size: 28rpx;
		color: #333;
	}

	.total-price {
		font-size: 36rpx;
		color: #ff3b30;
		font-weight: 500;
		margin:0 15rpx;
	}

	.btn-group {
		display: flex;
		gap: 20rpx;
	}

	.btn {
		flex: 1;
		height: 80rpx;
		font-size: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 12rpx;
	}

	.cancel-btn {
		background: #f5f5f5;
		color: #666;
		margin: 0 0 15rpx 15rpx;

	}

	.confirm-btn {
		background: #007aff;
		color: #fff;
		margin: 0 15rpx 15rpx 0

	}
</style>