<template>
	<view class="homePage">
		<view class="ad-container">
			<!-- 	<ad-custom unit-id="adunit-cbbb9d842609f447" @load="onAdLoad()" @error="onAdLoad()"
				@close="onAdLoad()"></ad-custom> -->
		</view>

		<view class="container" :style="{ height: `calc(100vh - ${Height}px)` }">
			<!-- 搜索框 -->
			<view class="search-box" @click="goToSearch">
				<text class="iconfont icon-search"></text>
				<text class="placeholder">搜索商品</text>
			</view>

			<view class="btn-box">
				<!-- 扫描按钮 -->
				<view class="scan-section">
					<view class="scan-button" @click="startScan">
						<text class="iconfont icon-scan"></text>
						<text class="scan-text u-m-t-20">扫描商品</text>
					</view>
				</view>

				<!-- 添加按钮 -->
				<view class="scan-section">
					<view class="scan-button" @click="popopen">
						<text class="iconfont icon-scan"></text>
						<text class="scan-text">添加商品</text>
					</view>
				</view>
			</view>

			<!-- 商品信息弹窗 -->
			<goods-popup :show="showGoodsPopup" :goods="currentGoods" :sacnFlag="flag"
				@update:show="showGoodsPopup = $event" @refresh="refreshGoods" />

			<!-- 添加商品弹窗 -->
			<uni-popup ref="addPopup" type="center">
				<view class="add-popup">
					<view class="add-header">
						<text class="add-title">添加商品</text>
						<text class="close-btn" @click="closeAddPopup">×</text>
					</view>
					<view class="add-body">
						<scroll-view scroll-y="true" show-scrollbar="true" style="height: 390rpx;">
							<view class="updateBox">
								<updateImage ref="updateImageRef" @uploadPic="uploadPic" :imageObj="newGoods.goods_pic">
								</updateImage>
							</view>
							<input v-model="newGoods.goods_sn" class="add-input" placeholder="商品条形码" />
							<input v-model="newGoods.goods_name" class="add-input" placeholder="商品名称" />
							<input v-model="newGoods.goods_price" class="add-input" type="digit" placeholder="商品价格" />
							<input v-model="newGoods.goods_cost" class="add-input" type="digit" placeholder="商品成本" />
							<input v-model="newGoods.goods_num" class="add-input" type="digit" placeholder="商品数量" />
							<input v-model="newGoods.goods_threshold" class="add-input" type="digit"
								placeholder="请输入商品缺货提醒阈值" />
							<input v-model="newGoods.goods_notes" class="add-input" placeholder="商品备注" />
						</scroll-view>
					</view>
					<view class="add-footer">
						<button @click="confirmAdd" class="add-btn">确认添加</button>
					</view>
				</view>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	const goodsInfoObj = uniCloud.importObject('goodsInfoObj2')
	export default {
		data() {
			return {
				showGoodsPopup: false,
				currentGoods: {},
				newGoods: {
					goods_name: '',
					goods_price: '',
					goods_notes: '',
					goods_sn: '',
					goods_num: '',
					goods_cost: '',
					goods_threshold: '',
					goods_pic: {}
				},
				flag: true,
				Height: 0,
				list: [],
				AdClose: true

			}
		},

		onReady() {
			this.onAdLoad()
		},

		methods: {
			uploadPic(newImgObj) {
				this.newGoods.goods_pic = newImgObj;
			},

			onAdLoad() {

				// 创建一个SelectorQuery实例
				const query = uni.createSelectorQuery()
				// 在当前页面中选择具有ref为'target'的组件
				query.select('.ad-container').boundingClientRect()
				// 执行查询
				query.exec((res) => {
					if (res && res.length > 0) {
						console.log(res[0])
						const {
							left,
							top,
							width,
							height
						} = res[0]
						this.Height = height
						console.log('组件的位置信息：', {
							left,
							top,
							width,
							height
						})
					}
				})
			},


			onShareAppMessage(res) {
				console.log(res);
				if (res.from === 'menu') { // button：来自页面内分享按钮
					return {
						title: '我的物品录',
						path: '/pages/home/home',
						imageUrl: 'https://env-00jxt6l7w3we.normal.cloudstatic.cn/showPic/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202025-03-02%20170114.png'
					}
				}
			},

			onShareTimeline() {
				return {
					title: '我的物品录',
					imageUrl: 'https://env-00jxt6l7w3we.normal.cloudstatic.cn/showPic/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202025-03-02%20170114.png'
				};
			},

			gotoLogin() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
				})
			},

			goToSearch() {
				uni.navigateTo({
					url: '/pages/home/search'
				})
			},

			popopen() {
				this.$refs.addPopup.open()
				this.newGoods = {
					goods_name: '',
					goods_price: '',
					goods_notes: '',
					goods_sn: '',
					goods_num: '',
					goods_cost: '',
					goods_threshold: '',
					goods_pic: {}
				}
				// 重置图片组件
				this.$refs.updateImageRef.resetImage()
			},

			async startScan() {
				try {
					const res = await uni.scanCode({
						scanType: ['barCode', 'qrCode']
					})

					this.handleScanResult(res.result)
				} catch (e) {
					uni.showToast({
						title: '扫描失败',
						icon: 'error'
					})
				}
			},

			async handleScanResult(code) {

				try {
					const res = await goodsInfoObj.findGoods(code)
					if (res.code === 0) {
						this.currentGoods = res.data
						this.showGoodsPopup = true
					} else if (res.code === -1) {
						uni.showToast({
							title: '未登录/登录过期',
							icon: 'none'
						})
						setTimeout(() => {
							this.gotoLogin()
						}, 1000)
						return
					} else {
						this.newGoods.goods_sn = code
						uni.showModal({
							title: '提示',
							content: '没有该商品信息，是否添加？',
							success: (res) => {
								if (res.confirm) {
									this.sendFindNetInfo(this.newGoods.goods_sn)
								}
							}
						})
					}
				} catch (e) {
					uni.showToast({
						title: '获取商品信息失败',
						icon: 'error'
					})
				}
			},

			async sendFindNetInfo(code) {
				const self = this;
				console.log('code', code);
				try {
					const res = await uni.request({
						url: 'https://www.mxnzp.com/api/barcode/goods/details',
						method: 'GET',
						data: {
							barcode: code,
							app_id: 'qtrpnjmgpsrgbpis',
							app_secret: '8gv3Yy4xGh7coenRdCREDBRKD3lfXVD6'
						}
					});
					console.log(res);
					if (res.data.code === 1) {
						console.log('商品信息', res.data.data);
						self.newGoods.goods_name = res.data.data.goodsName;
						self.$refs.addPopup.open();
					} else {
						console.log(res.data.msg)
						self.newGoods.goods_name = ''
						self.$refs.addPopup.open();
					}
				} catch (err) {
					console.error('网络请求失败', err);
					throw err;
				}
			},

			async confirmAdd() {
				try {
					if (this.newGoods.goods_name === '') {
						uni.showToast({
							title: '名称必填',
							icon: 'none'
						});
						return
					}

					this.newGoods.goods_price = parseFloat(this.newGoods.goods_price)
					if (isNaN(this.newGoods.goods_price) || this.newGoods.goods_price < 0) {
						uni.showToast({
							title: '价格要求为数字且大于等于0',
							icon: 'none'
						});
						return
					}

					if (this.newGoods.goods_num) {
						this.newGoods.goods_num = parseFloat(this.newGoods.goods_num)
					}

					if (this.newGoods.goods_cost) {
						this.newGoods.goods_cost = parseFloat(this.newGoods.goods_cost)
					}

					if (this.newGoods.goods_threshold) {
						this.newGoods.goods_threshold = parseFloat(this.newGoods.goods_threshold)
					}

					const res = await goodsInfoObj.addGoods(this.newGoods)
					if (res.code === -1) {
						uni.showToast({
							title: '未登录/登录过期',
							icon: 'none'
						})
						setTimeout(() => {
							this.gotoLogin()
						}, 1000)
						return
					} else {
						uni.showToast({
							title: '添加成功',
							icon: 'success'
						})
					}

					this.$refs.addPopup.close()
					this.newGoods = {
						goods_name: '',
						goods_price: '',
						goods_notes: '',
						goods_sn: '',
						goods_num: '',
						goods_cost: '',
						goods_threshold: '',
						goods_pic: {}
					}
					// 重置图片组件
					this.$refs.updateImageRef.resetImage()
				} catch (e) {
					uni.showToast({
						title: '添加失败',
						icon: 'error'
					})
				}
			},
			closeAddPopup() {
				this.$refs.addPopup.close()
				this.newGoods = {
					goods_name: '',
					goods_price: '',
					goods_notes: '',
					goods_sn: '',
					goods_num: '',
					goods_cost: '',
					goods_threshold: '',
					goods_pic: {}
				}
				// 重置图片组件
				this.$refs.updateImageRef.resetImage()
			},
			refreshGoods() {
				// 刷新商品信息
				this.handleScanResult(this.currentGoods.goods_sn)
			}
		}
	}
</script>

<style scoped>
	.container {
		background-color: #f8f8f8;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
	}


	.search-box {
		background: #fff;
		height: 72rpx;
		border-radius: 36rpx;
		border: 1px solid #abb2aa;
		display: flex;
		align-items: center;
		padding: 0 32rpx;
		margin: 20rpx 0;
	}

	.icon-search {
		font-size: 40rpx;
		color: #999;
		margin-right: 16rpx;
	}

	.placeholder {
		font-size: 28rpx;
		color: #999;
	}

	.updateBox {
		padding-bottom: 10rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.btn-box {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		border: none;
		transition: all 0.3s ease;
	}


	.scan-section {
		display: flex;
		justify-content: center;
		flex-direction: column;
		width: 100%;
		flex: 1;
		align-items: center;
	}

	.scan-button {
		width: min(210rpx, 80vw);
		height: min(210rpx, 80vw);
		max-width: 80%;
		max-height: 40vh;
		aspect-ratio: 1;
		background: linear-gradient(135deg, #4a90e2, #007aff);
		border-radius: 140rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 16rpx 32rpx rgba(0, 122, 255, 0.25);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}



	.scan-button:active {
		transform: scale(0.95) translateY(4rpx);
		box-shadow: 0 8rpx 16rpx rgba(0, 122, 255, 0.2);
	}

	.icon-scan {
		font-size: 88rpx;
		color: #fff;
		margin-bottom: 16rpx;
		transition: transform 0.3s ease;
	}

	.scan-text {
		font-size: 32rpx;
		color: #fff;
		font-weight: 500;
	}

	.scan-button:nth-child(2) {
		background: linear-gradient(135deg, #34c759, #28a745);
		box-shadow: 0 16rpx 32rpx rgba(52, 199, 89, 0.25);
	}

	.scan-button:nth-child(2):active {
		box-shadow: 0 8rpx 16rpx rgba(52, 199, 89, 0.2);
	}

	/deep/ .uni-popup__wrapper {
		width: 85%;
		max-width: 600rpx;
	}

	.add-popup {
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
		position: relative;
	}

	.add-header {
		padding: 32rpx;
		border-bottom: 1px solid #eee;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #f8f9fa;
	}

	.add-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
	}

	.close-btn {
		font-size: 40rpx;
		color: #666;
		padding: 10rpx;
		transition: all 0.3s ease;
	}

	.close-btn:active {
		transform: scale(0.9);
	}

	.add-body {
		padding: 32rpx;
	}

	.add-input {
		height: 88rpx;
		border: 2rpx solid #e9ecef;
		border-radius: 16rpx;
		padding: 0 24rpx;
		margin-bottom: 24rpx;
		font-size: 32rpx;
		transition: all 0.3s ease;
	}

	.add-input:focus {
		border-color: #007AFF;
		box-shadow: 0 0 0 4rpx rgba(0, 122, 255, 0.1);
	}

	.add-footer {
		padding: 32rpx;
	}

	.add-btn {
		background: linear-gradient(135deg, #34c759, #28a745);
		color: #fff;
		height: 88rpx;
		border-radius: 16rpx;
		font-size: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.add-btn:active {
		transform: scale(0.98);
		opacity: 0.9;
	}
</style>