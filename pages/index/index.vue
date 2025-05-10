<template>
	<view class="index_v">
		<view class="apply">
			<view class="title">常用工具</view>
			<view class="toolList u-flex">
				<view class="toolItem">
					<view class="icon-kx icon-kx-ruku itemIcon" style="background-color: #ffaa00;"></view>
					<text>入库</text>
				</view>
				<view class="toolItem">
					<view class="icon-kx icon-kx-chuku itemIcon" style="background-color: #b5ddff;"></view>
					<text>出库</text>
				</view>
				<view class="toolItem">
					<view class="icon-kx icon-kx-shoudong itemIcon" style="background-color: #72ffbd;"></view>
					<text>手动入库</text>
				</view>
				<view class="toolItem">
					<view class="icon-kx icon-kx-cangku_cangchuguanli itemIcon" style="background-color: #ffaaf4;">
					</view>
					<text>仓库管理</text>
				</view>
			</view>
		</view>
		<view class="">

		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {

		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f0f2f6;
	}

	.index_v {
		padding: 20rpx 0;

		.apply {
			width: 100%;
			min-height: 200rpx;
			background-color: #fff;
			border-radius: 26rpx 26rpx 0 0;

			.title {
				font-weight: 600;
				font-size: 28rpx;
				padding: 20rpx;
			}

			.toolList {
				width: 100%;
				flex-wrap: wrap;
				margin-top: 20rpx;

				.toolItem {
					width: 25%;
					align-items: center;
					text-align: center;
					padding: 0 20rpx;
					margin-bottom: 20rpx;

					.itemIcon {
						padding: 22rpx;
						font-size: 64rpx;
						border-radius: 10rpx;
						color: #fff;
						background-color: #ffaa00;
						margin-bottom: 10rpx;
					}
				}
			}

		}
	}
</style>