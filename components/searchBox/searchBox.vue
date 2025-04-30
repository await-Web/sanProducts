<template>
	<view class="search-container" :style="{ height: BoxHeight }">
		<!-- 搜索头部 -->
		<view class="search-header">
			<view class="search-input-box">
				<text class="iconfont icon-search"></text>
				<input class="search-input" type="text" v-model="searchKeyword" placeholder="搜索商品名称"
					confirm-type="search" @confirm="handleSearch" focus />
				<text v-if="searchKeyword" class="clear-icon" @click="clearSearch">×</text>
			</view>
			<text class="cancel-btn" @click="goBack" v-if="flag === 0">取消</text>
		</view>

		<!-- 搜索历史 -->
		<view class="search-history" v-if="!goodsList.length && !searched">
			<view class="history-header">
				<text class="history-title">搜索历史</text>
				<text class="clear-history" @click="clearHistory" v-if="searchHistory.length">清空历史</text>
			</view>
			<view class="history-list" v-if="searchHistory.length">
				<view class="history-item" v-for="(item, index) in searchHistory" :key="index">
					<text class="history-text" @click="useHistory(item)">{{ item }}</text>
					<text class="delete-history" @click="deleteHistory(index)">×</text>
				</view>
			</view>
			<view class="no-history" v-else>
				<text class="no-history-text">暂无搜索历史</text>
			</view>
		</view>

		<!-- 搜索结果列表 -->
		<scroll-view class="search-results" scroll-y @scrolltolower="loadMore" v-if="goodsList.length > 0">
			<view class="goods-item" v-for="item in goodsList" :key="item._id" @click="handleGoodsDetail(item)">
				<goods-item :item="item"></goods-item>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore">
				<text class="loading-text">加载中...</text>
			</view>
			<view class="no-more" v-else>
				<text class="no-more-text">没有更多了</text>
			</view>
		</scroll-view>

		<!-- 无搜索结果 -->
		<view class="empty-result" v-else-if="searched">
			<text class="empty-text">未找到相关商品</text>
		</view>

		<!-- 商品详情弹窗 -->
		<goods-popup :show="showPopup" :goods="currentGoods" @update:show="showPopup = $event" @refresh="refreshList" />

	</view>
</template>

<script>


const goodsInfoObj = uniCloud.importObject('goodsInfoObj2')

export default {
	props: {
		BoxHeight: {
			type: String,
			default: '100vh'
		},
		// 0 显示弹窗 1 传递商品信息回父级
		flag: {
			type: Number,
			default: 0
		},
	},
	data() {
		return {
			searchKeyword: '',
			goodsList: [],
			pageSize: 10,
			page: 1,
			hasMore: true,
			searched: false,
			showPopup: false,
			currentGoods: {},
			searchHistory: []
		}
	},
	// 初始化时获取历史记录
	created() {
		if (this.flag === 0) {
			this.searchHistory = uni.getStorageSync('searchHistory') || []
		} else {
			console.log(this.flag)
			this.searchHistory = uni.getStorageSync('addHistory') || []
		}
	},
	methods: {
		
		
		// 添加搜索历史
		addHistory(keyword) {
			if (!keyword.trim()) return

			// 移除已存在的相同关键词
			const index = this.searchHistory.indexOf(keyword)
			if (index > -1) {
				this.searchHistory.splice(index, 1)
			}

			// 添加到历史记录开头
			this.searchHistory.unshift(keyword)

			// 限制最多9条记录
			if (this.searchHistory.length > 9) {
				this.searchHistory.pop()
			}

			// 保存到本地存储
			if (this.flag === 0) {
				uni.setStorageSync('searchHistory', this.searchHistory)
			} else {
				uni.setStorageSync('addHistory', this.searchHistory)
			}
		},

		// 使用历史记录进行搜索
		useHistory(keyword) {
			this.searchKeyword = keyword
			this.handleSearch()
		},

		// 删除单条历史记录
		deleteHistory(index) {
			this.searchHistory.splice(index, 1)
			if (this.flag === 0) {
				uni.setStorageSync('searchHistory', this.searchHistory)
			} else {
				uni.setStorageSync('addHistory', this.searchHistory)
			}
		},

		// 清空所有历史记录
		clearHistory() {
			this.searchHistory = []
			if (this.flag === 0) {
				uni.setStorageSync('searchHistory', this.searchHistory)
			} else {
				uni.setStorageSync('addHistory', this.searchHistory)
			}
		},

		goBack() {
			uni.navigateBack()
		},

		clearSearch() {
			this.searchKeyword = ''
			this.goodsList = []
			this.searched = false
		},
		async handleSearch() {
			if (!this.searchKeyword.trim()) {
				uni.showToast({
					title: '请输入搜索关键词',
					icon: 'none'
				})
				return
			}

			// 添加到搜索历史
			this.addHistory(this.searchKeyword)

			this.page = 1
			this.hasMore = true
			this.searched = true
			await this.searchGoods()
		},
		async searchGoods() {
			try {
				const res = await goodsInfoObj.searchGoods({
					keyword: this.searchKeyword,
					page: this.page,
					pageSize: this.pageSize
				})
				if (res.code === -1) {
					uni.showToast({
						title: '未登录/登录过期',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateTo({
							url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
						})
					}, 1000)
					return
				}

				if (this.page === 1) {
					this.goodsList = res.data
				} else {
					this.goodsList = [...this.goodsList, ...res.data]
				}

				this.hasMore = res.data.length === this.pageSize
			} catch (e) {
				uni.showToast({
					title: '搜索失败',
					icon: 'error'
				})
			}
		},
		async loadMore() {
			if (!this.hasMore) return
			this.page++
			await this.searchGoods()
		},
		handleGoodsDetail(goods) {
			console.log(goods, this.flag)
			if (this.flag === 0) {
				this.currentGoods = goods
				this.showPopup = true
			} else {
				this.$emit('sendGoodsInfo', goods)
			}

		},
		refreshList() {
			this.handleSearch()
			this.showPopup = false
		},

	}
}
</script>

<style scoped>
.search-container {
	background: #f8f8f8;
}

.search-header {
	position: sticky;
	top: 0;
	z-index: 100;
	display: flex;
	align-items: center;
	padding: 20rpx 32rpx;
	background: #fff;
}

.search-input-box {
	flex: 1;
	height: 72rpx;
	background: #f5f5f5;
	border-radius: 36rpx;
	display: flex;
	align-items: center;
	padding: 0 24rpx;
	margin-right: 20rpx;
}

.icon-search {
	font-size: 32rpx;
	color: #999;
	margin-right: 12rpx;
}

.search-input {
	flex: 1;
	height: 72rpx;
	font-size: 28rpx;
}

.clear-icon {
	font-size: 40rpx;
	color: #999;
	padding: 0 20rpx;
}

.cancel-btn {
	font-size: 28rpx;
	color: #007AFF;
}

.search-results {
	height: v-bind('`calc(${BoxHeight} - 112rpx)`');
	box-sizing: border-box;
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

.empty-result {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200rpx;
}

.empty-image {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

/* 搜索历史样式 */
.search-history {
	padding: 30rpx;
	background: #f8f8f8;
}

.history-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.history-title {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
}

.clear-history {
	font-size: 24rpx;
	color: #999;
}

.history-list {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.history-item {
	display: flex;
	align-items: center;
	padding: 12rpx 24rpx;
	background: #dddddd;
	border-radius: 30rpx;
}

.history-text {
	font-size: 28rpx;
	color: #666;
	padding: 8rpx 12rpx;
	margin-right: 20rpx;
}

.delete-history {
	font-size: 28rpx;
	color: #999;
	padding: 8rpx 16rpx;
	border-left: 2rpx solid #ccc;
}

.no-history {
	text-align: center;
	padding: 40rpx 0;
}

.no-history-text {
	font-size: 24rpx;
	color: #999;
}

/* 添加动画效果 */
.goods-item {
	animation: slideIn 0.3s ease-out;
	margin-bottom: 17rpx;
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
</style>