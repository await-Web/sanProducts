<template>
	<view>
		<!-- <ad-custom unit-id="adunit-91dadbe75146ce18"></ad-custom> -->
		<view class="record-container">
			<!-- 日期选择器 -->
			<view class="date-picker">
				<uni-datetime-picker type="date" v-model="selectedDate" @change="onDateChange" />
			</view>

			<!-- 记录列表 -->
			<view class="record-list">
				<template v-if="records.length > 0">
					<view v-for="(record, index) in records" :key="record._id" class="record-item"
						@click="showDetail(record)">
						<view class="record-summary">
							<text class="time">{{formatTime(record.create_time)}}</text>
							<text class="amount">¥{{record.total_amount}}</text>
						</view>
						<view class="record-info">
							<text class="quantity">共{{record.total_quantity}}件商品</text>
						</view>
					</view>
				</template>
				<view v-else class="empty-state">
					<image src="/static/nothing.png" mode="aspectFit" class="empty-image"></image>
					<text class="empty-text">暂无出库记录</text>
				</view>
			</view>

			<!-- 分页器 -->
			<view v-if="records.length > 0" class="pagination">
				<view class="page-info">
					<text>第{{pagination.page}}页，共{{pagination.totalPages}}页</text>
				</view>

				<view class="page-controls">
					<button :disabled="pagination.page <= 1" @click="prevPage" class="page-btn">上一页</button>
					<button :disabled="pagination.page >= pagination.totalPages" @click="nextPage"
						class="page-btn">下一页</button>
				</view>
			</view>

			<!-- 详情弹窗 -->
			<uni-popup ref="detailPopup" type="center">
				<view class="detail-popup">
					<view class="detail-header">
						<text class="detail-title">出库详情</text>
						<text class="close-btn" @click="closeDetail">×</text>
					</view>
					<scroll-view scroll-y="true" class="detail-content">
						<view v-if="selectedRecord" class="detail-info">
							<view class="detail-time">出库时间：{{formatTime(selectedRecord.create_time)}}</view>
							<scroll-view scroll-y :style="{height:'250rpx'}">
								<view class="detail-items">
									<view v-for="(item, idx) in selectedRecord.items" :key="item.goods_id"
										class="item-row">
										<text class="item-name">{{item.goods_name}}</text>
										<text class="item-quantity">×{{item.goods_quantity}}</text>
										<text class="item-price">¥{{item.goods_price}}</text>
									</view>
								</view>
							</scroll-view>
							<view class="detail-total">
								<view>
									<text>总数量：</text>
									<text class="total-amount">{{selectedRecord.total_quantity.toFixed(0)}}</text>
								</view>
								<view>
									<text>总利润：</text>
									<text
										class="total-amount">¥{{selectedRecord.total_profit ? selectedRecord.total_profit.toFixed(2):0}}</text>
								</view>
								<view>
									<text>总金额：</text>
									<text class="total-amount">¥{{selectedRecord.total_amount.toFixed(2)}}</text>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	const outputHistoryObj = uniCloud.importObject('outputHistoryObj2')
	export default {
		data() {
			return {
				selectedDate: new Date().toISOString().split('T')[0],
				records: [],
				pagination: {
					page: 1,
					size: 10,
					total: 0,
					totalPages: 0
				},
				selectedRecord: null,
				jumpPage: ''
			}
		},
		onLoad() {
			this.loadRecords()
		},
		methods: {
			async loadRecords() {
				try {
					const result = await outputHistoryObj.getOutputRecords({
						date: this.selectedDate,
						page: this.pagination.page,
						size: this.pagination.size
					})

					if (result.success) {
						this.records = result.data.list
						this.pagination = result.data.pagination
					} else {
						uni.showToast({
							title: '获取记录失败',
							icon: 'none'
						})
					}
				} catch (e) {
					console.error(e)
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				}
			},
			onDateChange(date) {
				this.pagination.page = 1
				this.loadRecords()
			},
			formatTime(timestamp) {
				if (!timestamp) return ''
				const date = new Date(timestamp)
				const hours = date.getHours().toString().padStart(2, '0')
				const minutes = date.getMinutes().toString().padStart(2, '0')
				return `${hours}:${minutes}`
			},
			showDetail(record) {
				this.selectedRecord = record
				this.$refs.detailPopup.open()
			},
			closeDetail() {
				this.$refs.detailPopup.close()
			},
			prevPage() {
				if (this.pagination.page > 1) {
					this.pagination.page--
					this.loadRecords()
				}
			},
			nextPage() {
				if (this.pagination.page < this.pagination.totalPages) {
					this.pagination.page++
					this.loadRecords()
				}
			},
			goToPage() {
				const page = parseInt(this.jumpPage)
				if (page && page >= 1 && page <= this.pagination.totalPages) {
					this.pagination.page = page
					this.loadRecords()
				} else {
					uni.showToast({
						title: '请输入有效页码',
						icon: 'none'
					})
				}
				this.jumpPage = ''
			}
		}
	}
</script>

<style lang="scss" scoped>
	.record-container {
		padding: 20rpx;
		background-color: #f5f5f5;
	}

	.date-picker {
		background-color: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
		margin: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.record-list {
		margin-bottom: 20rpx;
	}

	.record-item {
		background-color: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
		margin: 0 20rpx 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
			background-color: #f8f8f8;
		}
	}

	.record-summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;

		.time {
			color: #666;
			font-size: 28rpx;
		}

		.amount {
			color: #ff6b6b;
			font-size: 32rpx;
			font-weight: bold;
		}
	}

	.record-info {
		.quantity {
			color: #999;
			font-size: 26rpx;
		}
	}

	.empty-state {
		padding: 100rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.empty-image {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 20rpx;
		}

		.empty-text {
			color: #999;
			font-size: 28rpx;
		}
	}

	.pagination {
		background-color: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
		text-align: center;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
		margin: 20rpx;

		.page-info {
			color: #666;
			font-size: 28rpx;
			margin-bottom: 30rpx;
		}

		.page-input {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 20rpx;
			gap: 20rpx;

			input {
				width: 120rpx;
				height: 60rpx;
				border: 2rpx solid #ddd;
				border-radius: 8rpx;
				text-align: center;
				font-size: 28rpx;
				padding: 0 10rpx;
			}

			.go-btn {
				padding: 0 30rpx;
				height: 60rpx;
				line-height: 60rpx;
				background-color: #4CAF50;
				color: #fff;
				border-radius: 8rpx;
				font-size: 26rpx;
				transition: all 0.3s ease;

				&:active {
					transform: scale(0.95);
				}
			}
		}

		.page-controls {
			display: flex;
			justify-content: center;
			gap: 30rpx;

			.page-btn {
				font-size: 28rpx;
				padding: 15rpx 40rpx;
				background-color: #2196F3;
				color: #fff;
				border-radius: 8rpx;
				transition: all 0.3s ease;

				&:active {
					transform: scale(0.95);
				}

				&:disabled {
					background-color: #E0E0E0;
					color: #9E9E9E;
					cursor: not-allowed;
					transform: none;

					&:active {
						transform: none;
						background-color: #E0E0E0;
					}
				}
			}
		}
	}

	.detail-popup {
		background-color: #fff;
		border-radius: 16rpx;
		width: 85vw;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.12);

		.detail-header {
			padding: 30rpx;
			border-bottom: 1rpx solid #eee;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.detail-title {
				font-size: 32rpx;
				font-weight: bold;
			}

			.close-btn {
				font-size: 40rpx;
				color: #999;
				padding: 0 20rpx;
			}
		}

		.detail-content {
			max-height: 60vh;
			padding: 22rpx;
		}

		.detail-time {
			color: #666;
			font-size: 28rpx;
			margin-bottom: 20rpx;
		}

		.detail-items {
			.item-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx 0;
				border-bottom: 1rpx solid #eee;

				.item-name {
					flex: 1;
					font-size: 28rpx;
					padding-right: 20rpx;
				}

				.item-quantity {
					color: #666;
					font-size: 28rpx;
					width: 120rpx;
					text-align: center;
				}

				.item-price {
					color: #ff6b6b;
					font-size: 28rpx;
					width: 140rpx;
					text-align: right;
				}
			}
		}

		.detail-total {
			display: flex;
			flex-direction: column;
			align-items: left;
			padding: 5rpx 0;
			font-size: 28rpx;
			font-weight: 600;

			.total-amount {
				color: #ff6b6b;
				font-size: 32rpx;
				font-weight: bold;
				margin-right: 20rpx;
			}
		}
	}
</style>