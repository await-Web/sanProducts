<template>
	<view class="goods-list-page">
		<view class="uni-padding-wrap uni-common-mt" v-if="!isDeleteMode">
			<uni-segmented-control :current="current" :values="choseList" style-type="text" active-color="#24cbed"
				inActive-Color="#c4c4c4" @clickItem="onClickText" />
		</view>
		<view class="delete-header" v-else>
			<view class="delete-actions">
				<text class="cancel-btn" @click="cancelDelete">取消</text>
				<text class="delete-btn" @click="confirmDelete">删除</text>
			</view>
		</view>
		<view class="content">
			<view v-show="current === 0">
				<view v-if="enoughGoodsList.length > 0 ">
					<scroll-view scroll-y="true" refresher-enabled="true" :refresher-triggered="enoughTriggered"
						@refresherrefresh="onEnoughRefresh" @scrolltolower="onEnoughReachBottom"
						:style="{ height: `calc(100vh - ${ScrollViewHeight})` }">
						<view v-for="item in enoughGoodsList" :key="item._id" @click="handleItemClick(item)"
							@longtap="enterDeleteMode()">
							<goods-item :item="item" :selected="selectedItems.includes(item._id)"
								:delete-mode="isDeleteMode"></goods-item>
						</view>
						<!-- 加载更多 -->
						<view class="load-more" v-if="isEnoughLoading">
							<text class="loading-text">加载中...</text>
						</view>
						<view class="no-more" v-else>
							<text class="no-more-text">没有更多了</text>
						</view>
					</scroll-view>
				</view>
				<view class="nothing" v-else-if="enoughGoodsList.length == 0 && !isEnoughLoading">
					<text class="font">--没有库存充足的商品--</text>
					<image class="empty-icon" src="/static/nothing.png" mode="aspectFill"></image>
				</view>
			</view>
			<view v-show="current === 1">
				<view v-if="stockGoodsList.length > 0 ">
					<scroll-view scroll-y="true" refresher-enabled="true" :refresher-triggered="stockTriggered"
						@refresherrefresh="onStockRefresh" @scrolltolower="onStockReachBottom"
						:style="{ height: `calc(100vh - ${ScrollViewHeight})` }">
						<view v-for="item in stockGoodsList" :key="item._id" @click="handleItemClick(item)"
							@longtap="enterDeleteMode(item)">
							<goods-item :item="item" :selected="selectedItems.includes(item._id)"
								:delete-mode="isDeleteMode"></goods-item>
						</view>
						<!-- 加载更多 -->
						<view class="load-more" v-if="isStockLoading">
							<text class="loading-text">加载中...</text>
						</view>
						<view class="no-more" v-else>
							<text class="no-more-text">没有更多了</text>
						</view>
					</scroll-view>
				</view>
				<view class="nothing" v-else-if="stockGoodsList.length == 0 && !isEnoughLoading">
					<text class="font">--没有库存不足的商品--</text>
					<image class="empty-icon" src="/static/nothing.png" mode="aspectFill"></image>
				</view>
			</view>
		</view>



		<!-- 商品详情弹窗 -->
		<goods-popup :show="showPopup" :goods="currentGoods" @update:show="showPopup = $event" @refresh="refreshList" />
	</view>
</template>

<script>
	const goodsCloudObj = uniCloud.importObject('goodsInfoObj2');
	export default {
		data() {
			return {
				isDeleteMode: false, // 是否处于批量删除模式
				selectedItems: [], // 选中的商品ID列表
				enoughGoodsList: [], // 充足商品列表数据
				stockGoodsList: [], // 缺货商品列表数据
				enoughPage: 1, // 充足商品当前页码
				enoughPageSize: 12, // 充足商品每页数据量
				stockPage: 1, // 缺货商品当前页码
				stockPageSize: 12, // 缺货商品每页数据量
				isEnoughLoading: false,
				isEnoughNoMore: false,
				isStockLoading: false, // 是否正在加载数据
				isStockNoMore: false, // 是否已经没有更多数据
				showPopup: false,
				currentGoods: {},
				choseList: ['库存充足', '库存不足'],
				current: 0,
				enoughTriggered: false, // 充足商品下拉刷新状态
				stockTriggered: false, // 缺货商品下拉刷新状态
				ScrollViewHeight: '', // 用于存储计算后的高度
				navBarHeight: 44, // 导航栏默认高度
				statusBarHeight: 0, // 状态栏高度
				loginOne: 0,
				onshowFlag: true,
				hasShownDeleteTip: false, // 是否已显示过删除提示
			};
		},
		onLoad() {
			// 获取状态栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;
			uni.$on('closeOnshow', this.closeOnshow);
		},
		onUnload() {
			uni.$off('closeOnshow', this.closeOnshow)
		},
		onShow() {
			if (this.onshowFlag) {
				this.onEnoughRefresh()
				this.onStockRefresh()
			} else {
				this.onshowFlag = true
			}


		},

		mounted() {
			this.calculateScrollViewHeight();
		},
		methods: {
			// 进入删除模式
			enterDeleteMode() {
				this.isDeleteMode = true;
			},

			// 检查是否显示删除提示
			checkTip() {
				// 检查是否已经显示过删除提示
				this.hasShownDeleteTip = uni.getStorageSync('hasShownDeleteTip') || false;
				if (!this.hasShownDeleteTip) {

					uni.showModal({
						title: '提示',
						content: '长按商品可进入批量删除模式，可同时删除多个商品',
						showCancel: false,
						confirmText: '知道了',
						success: () => {
							this.hasShownDeleteTip = true;
							uni.setStorageSync('hasShownDeleteTip', true);
						}
					});

				}
			},

			// 处理商品点击
			handleItemClick(item) {
				if (this.isDeleteMode) {
					const index = this.selectedItems.indexOf(item._id);
					if (index === -1) {
						this.selectedItems.push(item._id);
					} else {
						this.selectedItems.splice(index, 1);
					}
				} else {
					this.showGoodsDetail(item);
				}
			},

			// 取消删除
			cancelDelete() {
				this.isDeleteMode = false;
				this.selectedItems = [];
			},

			// 确认删除
			async confirmDelete() {
				if (this.selectedItems.length === 0) {
					uni.showToast({
						title: '请选择要删除的商品',
						icon: 'none'
					});
					return;
				}
				uni.showModal({
					title: '确认删除',
					content: '确定要删除选中的商品吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await goodsCloudObj.deleteGoods({
									goods_id_s: this.selectedItems
								});
								if (result.code === 0) {
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									});
									this.isDeleteMode = false;
									this.selectedItems = [];
									this.refreshList();
								} else {
									uni.showToast({
										title: result.msg,
										icon: 'none'
									});
								}
							} catch (e) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}
						}
					}
				});

			},

			closeOnshow() {
				this.onshowFlag = false
			},

			// 获取高度
			calculateScrollViewHeight() {
				uni.createSelectorQuery().select('.uni-padding-wrap').boundingClientRect((rect) => {
					if (rect) {
						this.ScrollViewHeight = `${rect.height + 7}px`;
					}
				}).exec();
			},

			onClickText(e) {
				if (this.current !== e.currentIndex) {
					this.current = e.currentIndex;
				}
			},
			async getEnoughGoods() {
				if (this.isEnoughLoading || this.isEnoughNoMore) {
					return;
				}
				this.isEnoughLoading = true;
				const result = await goodsCloudObj.getEnoughGoodsList({
					page: this.enoughPage,
					pageSize: this.enoughPageSize
				});
				if (result.code === 0) {
					this.checkTip()
					const enoughGoods = result.data;
					if (enoughGoods.length < this.enoughPageSize) {
						this.isEnoughNoMore = true;
					}
					this.enoughGoodsList = [...this.enoughGoodsList, ...enoughGoods];
					this.enoughPage++;
				} else if (result.code === -1) {
					if (this.loginOne === 0) {
						this.loginOne = 1
					} else {
						this.isEnoughLoading = false;
						this.enoughTriggered = false;
						return
					}

					uni.showToast({
						title: '未登录/登录过期',
						icon: 'none'
					});
					this.isEnoughLoading = false;
					this.enoughTriggered = false;
					setTimeout(() => {
						uni.navigateTo({
							url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
						});
					}, 1000);
					return;
				} else {
					uni.showToast({
						title: result.msg,
						icon: 'none'
					});
				}
				this.enoughTriggered = false;
				this.isEnoughLoading = false;
			},
			async getStockGoods() {
				if (this.isStockLoading || this.isStockNoMore) {
					return;
				}
				this.isStockLoading = true;
				const result = await goodsCloudObj.getStockGoodsList({
					page: this.stockPage,
					pageSize: this.stockPageSize
				});
				if (result.code === 0) {
					if (result.data.length < this.stockPageSize) {
						this.isStockNoMore = true;
					}
					this.stockGoodsList = [...this.stockGoodsList, ...result.data];
					this.stockPage++;
				} else if (result.code === -1) {
					if (this.loginOne === 0) {
						this.loginOne = 1
					} else {
						this.isEnoughLoading = false;
						this.enoughTriggered = false;
						return
					}
					uni.showToast({
						title: '未登录/登录过期',
						icon: 'none'
					});
					this.isStockLoading = false;
					this.stockTriggered = false;
					setTimeout(() => {
						uni.navigateTo({
							url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
						});
					}, 1000);
					return;
				} else {
					uni.showToast({
						title: result.msg,
						icon: 'none'
					});
				}
				this.stockTriggered = false;
				this.isStockLoading = false;
			},
			async onEnoughRefresh() {
				this.enoughPage = 1;
				this.enoughGoodsList = [];
				this.isEnoughNoMore = false;
				this.enoughTriggered = true;
				await this.getEnoughGoods();
				this.enoughTriggered = false;
			},
			async onStockRefresh() {
				this.stockPage = 1;
				this.stockGoodsList = [];
				this.isStockNoMore = false;
				this.stockTriggered = true;
				await this.getStockGoods();
				this.stockTriggered = false;
			},
			onEnoughReachBottom() {
				this.getEnoughGoods();
			},
			onStockReachBottom() {
				this.getStockGoods();
			},
			showGoodsDetail(goods) {
				this.currentGoods = goods;
				this.showPopup = true;
			},
			refreshList() {
				this.enoughPage = 1;
				this.enoughGoodsList = [];
				this.isEnoughNoMore = false;
				this.stockPage = 1;
				this.stockGoodsList = [];
				this.isStockNoMore = false;
				this.getEnoughGoods();
				this.getStockGoods();
				this.showPopup = false;
			}
		}
	};
</script>

<style scoped>
	.delete-header {
		background: #f8f8f8;
		padding: 18rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.delete-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 20rpx;
	}

	.cancel-btn,
	.delete-btn {
		padding: 12rpx 78rpx;
		border-radius: 8rpx;
		font-size: 32rpx;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.cancel-btn {
		color: #666;
		background-color: #bdb2b2;
	}

	.cancel-btn:active {
		background-color: #e8e8e8;
	}

	.delete-btn {
		color: #fff;
		background-color: #ff3b30;
	}

	.delete-btn:active {
		background-color: #e6352b;
	}

	.goods-list-page {
		background-color: #f8f8f8;
		height: 100vh;
	}

	.uni-padding-wrap {
		margin-bottom: 7px;
	}

	.nothing {
		padding: 30rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.font {
		font-size: 38rpx;
		color: #c7ccd7;
	}

	.empty-icon {
		width: 400rpx;
		height: 400rpx;
	}

	.load-more,
	.no-more {
		text-align: center;
		padding: 30rpx 0;
	}

	.loading-text,
	.no-more-text {
		font-size: 24rpx;
		color: #999;
	}
</style>