<template>
	<view class="container">
		<!-- 扫码区域 -->
		<view class="camera-section">
			<camera device-position="back" flash="off" class="camera" mode="scanCode" @scancode="handleScanWithThrottle"
				ref="cameraRef" />
			<view class="scan-overlay">
				<view class="scan-line"></view>
			</view>
			<view class="scan-tips">
				<text class="tips-text">将商品二维码放入框内</text>
			</view>
		</view>

		<!-- 商品列表 -->
		<view class="goods-section">
			<view class="section-header">
				<text class="section-title">商品列表</text>
				<view class="search-btn active-scale" @click="showSearchPopup">
					<uni-icons type="search" size="20"></uni-icons>
					<text style="font-size: 32rpx;">搜索</text>
				</view>
			</view>
			<!-- goodsList.length > 0 -->
			<scroll-view scroll-y class="goods-list" v-if="goodsList.length > 0">
				<view class="goods-item" v-for="(item, index) in goodsList" :key="item._id"
					:class="{ 'slide-in': item.isNew }">
					<view class="goods-info">
						<text class="goods-name">{{ item.goods_name }}</text>
						<text class="goods-price">￥{{ item.goods_price }}</text>
					</view>
					<view class="goods-action">
						<view class="quantity-control">
							<button class="qty-btn minus" @click="updateQuantity(index, -1)"
								:class="{ 'disabled': item.quantity <= 1 }">-</button>
							<text class="quantity">{{ item.quantity }}</text>
							<button class="qty-btn plus" @click="updateQuantity(index, 1)">+</button>
						</view>
						<view class="delete-btn-wrapper">
							<button class="delete-btn" @click="removeItem(index)">
								<text class="iconfont icon-delete"></text>
								<text class="delete-text">删除</text>
							</button>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 空状态 -->
			<view class="empty-state" v-else>
				<image class="empty-icon" src="/static/empty-cart.png"></image>
				<text class="empty-text">暂无商品，请扫码添加</text>
			</view>
		</view>

		<!-- 底部结算栏 -->
		<view class="footer" :class="{ 'has-goods': goodsList.length > 0 }" v-show="goodsList.length > 0">
			<button class="clear-btn" @click="showClearConfirm" v-if="goodsList.length > 0">
				<text class="iconfont icon-delete"></text>
				<text>清空</text>
			</button>
			<button class="clear-btn" @click="showConfirmPopupAction" v-if="goodsList.length > 0">
				<text class="iconfont icon-delete"></text>
				<text>出库</text>
			</button>
			<text class="total-label">合计：</text>
			<text class="total-price">￥{{ totalPrice }}</text>
		</view>

		<!-- 添加确认弹窗组件 -->
		<cart-confirm :show="showConfirmPopup" :goodsList="goodsList" @update:show="showConfirmPopup = $event"
			@confirm="outPutConfirm" />

		<!-- 搜索弹窗 -->
		<uni-popup ref="searchPopup" type="bottom">
			<searchBox ref="search" :BoxHeight="'40vh'" :flag='1' @sendGoodsInfo="sendGoodsInfo"></searchBox>
		</uni-popup>
	</view>
</template>

<script>
	const goodsInfoObj = uniCloud.importObject('goodsInfoObj2')
	const outputHistotyObj = uniCloud.importObject('outputHistoryObj2')
	export default {
		data() {
			return {
				goodsList: [],
				scanning: false,
				lastScanTime: 0,
				showConfirmPopup: false,
			}
		},
		computed: {
			totalPrice() {
				return (this.goodsList.reduce((total, item) => total + (item.goods_price * 100 * item.quantity), 0) / 100).toFixed(2)
			},
			totalNum() {
				return this.goodsList.reduce((total, item) => total + (item.quantity), 0)
			},
			totalProfit() {
				const profit = this.goodsList.reduce((total, item) => {
					let itemProfit = 0
					if(item.goods_cost > 0){
						itemProfit = ((item.goods_price * 100 - item.goods_cost * 100) * item.quantity)
					}
					return total + itemProfit
				}, 0)
				return profit / 100
			}
		},
		methods: {
			sendGoodsInfo(res) {
				// console.log('res',res)
				const existingItem = this.goodsList.find(item => item._id === res._id)
				if (existingItem) {
					const index = this.goodsList.indexOf(existingItem)
					this.updateQuantity(index, 1)
					return
				}

				this.goodsList.unshift({
					...res,
					quantity: 1,
					isNew: true
				})
				// console.log(this.goodsList)
				setTimeout(() => this.goodsList[0].isNew = false, 500)
			},

			// 显示搜索弹窗
			showSearchPopup() {
				this.$refs.searchPopup.open()
			},

			// 隐藏搜索弹窗
			hideSearchPopup() {
				this.$refs.searchPopup.close()
			},

			// 显示弹窗
			showConfirmPopupAction() {
				this.showConfirmPopup = true
			},

			// 添加限流处理方法
			handleScanWithThrottle(e) {
				const currentTime = Date.now()
				if (this.scanning || currentTime - this.lastScanTime < 2000) return
				this.lastScanTime = currentTime
				this.handleScan(e)
			},

			async handleScan(e) {
				if (this.scanning) return
				this.scanning = true
				try {
					const code = e.detail.result

					const innerAudioContext = uni.createInnerAudioContext()
					innerAudioContext.src = '/static/scanSound.mp3'
					innerAudioContext.play()

					const existingItem = this.goodsList.find(item => item.goods_sn === code)
					if (existingItem) {
						const index = this.goodsList.indexOf(existingItem)
						this.updateQuantity(index, 1)
						this.scanning = false
						return
					}
					// console.log('this.list', this.goodsList)
					

					const res = await goodsInfoObj.findGoods(code)
					if (res.code === 0) {
						const goods = res.data
						this.goodsList.unshift({
							...goods,
							quantity: 1,
							isNew: true
						})
						console.log(this.goodsList)
						setTimeout(() => this.goodsList[0].isNew = false, 500)
					} else if (res.code === -1) {
						setTimeout(() => {
							uni.navigateTo({
								url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
							})
						}, 1000)
					} else {
						uni.showToast({
							title: '商品不存在',
							icon: 'error'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '扫描失败',
						icon: 'error'
					})
				} finally {
					this.scanning = false
				}
			},

			updateQuantity(index, change) {
				const newQuantity = this.goodsList[index].quantity + change
				if (newQuantity >= 1) {
					this.goodsList[index].quantity = newQuantity
				}
			},

			removeItem(index) {
				uni.showModal({
					title: '提示',
					content: '确定要删除该商品吗？',
					success: (res) => {
						if (res.confirm) {
							this.goodsList.splice(index, 1)
						}
					}
				})
			},

			showClearConfirm() {
				uni.showModal({
					title: '提示',
					content: '确定要清空所有商品吗？',
					success: (res) => {
						if (res.confirm) {
							this.goodsList = []
						}
					}
				})
			},

			// 商品出库
			async outPutConfirm() {
				const outGoodsList = this.goodsList.map(item => ({
					_id: item._id,
					user_id: item.user_id,
					goods_num: item.goods_num >= 0 ? item.goods_num : '',
					goods_quantity: item.quantity
				}))
				// console.log('outGoodsList', outGoodsList)
				const res = await goodsInfoObj.outGoods(outGoodsList)
				if (res.code === -1) {
					this.showConfirmPopup = false
					uni.showToast({
						title: '未登录/登录过期',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateTo({
							url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
						})
					}, 1000)
				} else if (res.code === 0) {
					this.showConfirmPopup = false
					const outGoodsList2 = this.goodsList.map(item => ({
						goods_id: item._id,
						goods_name: item.goods_name,
						goods_price: item.goods_price,
						goods_quantity: item.quantity
					}))
					// toFixed(2) 返回的是字符串
					await outputHistotyObj.createOutputRecord({
						items: outGoodsList2,
						total_quantity: Number(this.totalNum),
						total_amount: parseFloat(parseFloat(this.totalPrice).toFixed(2)),
						total_profit: parseFloat(parseFloat(this.totalProfit).toFixed(2))
					})
					this.goodsList = []
					if (res.zeroQuantityGoods && res.zeroQuantityGoods.length > 0) {
						const message = `${res.zeroQuantityGoods.join('、')}`
						uni.showModal({
							title: '商品缺货提示',
							content: message,
							showCancel: false,
							confirmText: '知道了'
						})
					}
				} else {
					console.log(res)
				}
			}
		},
		onShow() {
			if (this.$refs.cameraRef) {
				this.$refs.cameraRef.start()
			}
			
		},
		onHide() {
			if (this.$refs.cameraRef) {
				this.$refs.cameraRef.stop()
			}
			this.$refs.search.clearSearch()
			this.goodsList = []
		}
	}
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f8f8f8;
	}

	.camera-section {
		position: relative;
		width: 100%;
		height: 350rpx;
		border-radius: 15rpx;
		overflow: hidden;
		background: #000;
	}

	.camera {
		width: 100%;
		height: 100%;
	}

	.scan-overlay {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: 350rpx;
		border: 2rpx solid rgba(255, 255, 255, 0.6);
		border-radius: 15rpx;
	}

	.scan-line {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 4rpx;
		background: #007AFF;
		animation: scan 2s linear infinite;
	}

	.scan-tips {
		position: absolute;
		bottom: 40rpx;
		left: 0;
		right: 0;
		text-align: center;
	}

	.tips-text {
		color: #fff;
		font-size: 28rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	}

	.goods-section {
		flex: 1;
		overflow: hidden;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 66rpx;
		padding-left: 20rpx;
	}

	.section-title {
		font-size: 37rpx;
		font-weight: 600;
		color: #333;
	}

	.search-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1rpx solid #505050;
		padding: 0 42rpx;
		height: 60rpx;
		background: #f5f5f5;
		border-radius: 30rpx;
		margin-right: 40rpx;
	}

	.search-btn text {
		font-size: 24rpx;
	}

	.search-btn .icon-search {
		margin-right: 8rpx;
	}

	.active-scale {
        transition: transform 0.1s ease;
    }
    
    .active-scale:active {
        transform: scale(0.9);
    }

	.clear-btn {
		display: flex;
		align-items: center;
		padding: 1rpx 55rpx;
		background: #ff3b30;
		border-radius: 15rpx;
		border: none;
	}

	.clear-btn text {
		color: #fff;
		font-size: 24rpx;
	}

	.goods-list {
		height: calc(100% - 50rpx);
	}

	.goods-item {
		background: #fff;
		border-radius: 16rpx;
		border: 1rpx solid #787878;
		padding: 24rpx;
		margin: 10rpx 20rpx;
		animation: slideIn 0.3s ease-out;
	}

	.goods-item.slide-in {
		animation: slideInNew 0.5s ease-out;
	}

	.goods-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.goods-name {
		font-size: 28rpx;
		color: #333;
	}

	.goods-price {
		font-size: 32rpx;
		color: #ff3b30;
		font-weight: 500;
	}

	.goods-action {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 1;
	}

	.quantity-control {
		display: flex;
		align-items: center;
		background: #f5f5f5;
		border-radius: 8rpx;
		overflow: hidden;
	}

	.qty-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		font-size: 28rpx;
		color: #333;
	}

	.qty-btn.disabled {
		color: #999;
	}

	.quantity {
		width: 80rpx;
		text-align: center;
		font-size: 28rpx;
	}

	.delete-btn-wrapper {
		margin-left: 20rpx;
	}

	.delete-btn {
		min-width: 120rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ff3b30;
		border-radius: 8rpx;
		border: none;
		padding: 0 20rpx;
	}

	.delete-btn .icon-delete {
		font-size: 28rpx;
		color: #fff;
		margin-right: 8rpx;
	}

	.delete-btn .delete-text {
		font-size: 24rpx;
		color: #fff;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #dcdfe6;
	}

	.footer {
		padding: 20rpx 32rpx;
		background: #fff;
		transform: translateY(100%);
		transition: transform 0.3s ease-out;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.footer.has-goods {
		transform: translateY(0);
	}


	.total-label {
		font-size: 28rpx;
		color: #666;
		margin-left: auto;
	}

	.total-price {
		font-size: 40rpx;
		color: #ff3b30;
		font-weight: 600;
	}

	@keyframes scan {
		0% {
			top: 0;
		}

		50% {
			top: 100%;
		}

		100% {
			top: 0;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInNew {
		from {
			opacity: 0;
			transform: translateX(-100%);
		}

		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>