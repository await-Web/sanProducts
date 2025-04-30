<template>
	<view class="popup-mask" v-if="show" @click.stop="cancel">
		<view class="popup-content" @click.stop>
			<view class="popup-header">
				<text class="title">商品信息</text>
				<text class="close-btn" @click="cancel">×</text>
			</view>

			<view class="popup-body">
				<scroll-view scroll-y="true" show-scrollbar="true" style="height: 390rpx;">
					<view class="updateBox">
						<view v-if="isEditing">
							<updateImage @uploadPic="uploadPic" @uploadStatusChange="handleUploadStatusChange" :delFlag="false" :imageObj="localGoods.goods_pic"></updateImage>
						</view>
						<view v-else-if="goods.goods_pic?.imgUrl">
							<image :style="{height:'180rpx', width:'180rpx'}" :src="goods.goods_pic.imgUrl" class="goods-img" @click="previewImage(goods.goods_pic.imgUrl)"  mode="aspectFill"/>
						</view>
					</view>

					<view class="form-item">
						<text class="label">商品条形码</text>
						<input v-if="isEditing" v-model="localGoods.goods_sn" class="input" placeholder="请输入商品名称" />
						<text v-else class="value">{{ goods.goods_sn || '暂未填写' }}</text>
					</view>

					<view class="form-item">
						<text class="label">商品名称</text>
						<input v-if="isEditing" v-model="localGoods.goods_name" class="input" placeholder="请输入商品名称" />
						<text v-else class="value">{{ goods.goods_name }}</text>
					</view>

					<view class="form-item">
						<text class="label">商品价格</text>
						<input v-if="isEditing" v-model="localGoods.goods_price" class="input" type="digit"
							placeholder="请输入商品价格" />
						<text v-else class="value">￥{{ goods.goods_price }}</text>
					</view>
					
					<view class="form-item">
						<text class="label">商品成本</text>
						<input v-if="isEditing" v-model="localGoods.goods_cost" class="input" type="digit"
							placeholder="请输入商品成本" />
						<text v-else class="value">￥{{ (goods.goods_cost !== undefined && goods.goods_cost !== null &&
		goods.goods_cost !== '') ? goods.goods_cost : '暂未填写' }}</text>
					</view>
					
					<view class="form-item">
						<text class="label">商品库存</text>
						<input v-if="isEditing" v-model="localGoods.goods_num" class="input" type="number"
							placeholder="请输入商品库存" />
						<text v-else class="value">{{ (goods.goods_num !== undefined && goods.goods_num !== null &&
		goods.goods_num !== '') ? goods.goods_num : '暂未填写' }}</text>
					</view>

					<view class="form-item">
						<text class="label">缺货提醒阈值(出库时提醒)</text>
						<input v-if="isEditing" v-model="localGoods.goods_threshold" class="input" type="number"
							placeholder="请输入商品缺货提醒阈值" />
						<text v-else class="value">{{ (goods.goods_threshold !== undefined && goods.goods_threshold !==
		null && goods.goods_threshold !== '') ? goods.goods_threshold : '暂未填写' }}</text>
					</view>

					<view class="form-item">
						<text class="label">商品备注</text>
						<input v-if="isEditing" v-model="localGoods.goods_notes" class="input" placeholder="请输入商品备注" />
						<text v-else class="value">{{ goods.goods_notes || '暂未填写' }}</text>
					</view>
				</scroll-view>
			</view>

			<view class="popup-footer">
				<button v-if="!isEditing" @click="handleEdit" class="btn edit-btn">编辑</button>
				<block v-else>
					<button @click="handleConfirm" class="btn confirm-btn">确认</button>
					<button @click="handleCancel" class="btn back-btn">返回</button>
				</block>
				<button @click="handleDelete" class="btn delete-btn">删除</button>
			</view>
		</view>
	</view>
</template>

<script>
const goodsInfoObj = uniCloud.importObject('goodsInfoObj2')

export default {
	name: 'goods-popup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		goods: {
			type: Object,
			default: () => ({})
		},
		sacnFlag: false // 判断是否是扫描获取的商品信息
	},
	data() {
		return {
			isEditing: false,
			localGoods: {},
			isUploading: false
		}
	},
	watch: {
		goods: {
			handler(newVal) {
				this.localGoods = JSON.parse(JSON.stringify(newVal))
			},
		}
	},
	methods: {
		uploadPic(newImgObj) {
			this.localGoods.goods_pic = newImgObj;
		},
		handleUploadStatusChange(status) {
			this.isUploading = status;
		},		

		previewImage(imgUrl) {
			uni.$emit('closeOnshow',{})
			uni.previewImage({
				urls: [imgUrl],
				current: 0,
			});
		},

		gotoLogin() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
			})
		},

		cancel() {
			this.isEditing = false
			this.$emit('update:show', false)
		},
		handleEdit() {
			this.isEditing = true
		},
		handleCancel() {
			this.isEditing = false
		},
		async handleConfirm() {
			try {
				if (this.isUploading) {
					uni.showToast({
						title: '等待图片上传完成',
						icon: 'none'
					});
					return
				}
				if (this.localGoods.goods_name === '') {
					uni.showToast({
						title: '名称必填',
						icon: 'none'
					});
					return
				}

				this.localGoods.goods_price = parseFloat(this.localGoods.goods_price)
				if (isNaN(this.localGoods.goods_price) || this.localGoods.goods_price < 0) {
					uni.showToast({
						title: '价格要求为数字且大于等于0',
						icon: 'none'
					});
					return
				}
				
				if (this.localGoods.goods_cost !== "") {
					this.localGoods.goods_cost = parseFloat(this.localGoods.goods_cost)
					if (this.localGoods.goods_cost < 0) {
						uni.showToast({
							title: '成本要求为数字且大于等于0',
							icon: 'none'
						});
						return
					}
				}
				

				if (this.localGoods.goods_num !== "") {
					this.localGoods.goods_num = parseInt(this.localGoods.goods_num)
				}

				if (this.localGoods.goods_threshold !== "") {
					this.localGoods.goods_threshold = parseInt(this.localGoods.goods_threshold)
				}
				
				console.log('this.localGoods',this.localGoods)
				const res = await goodsInfoObj.updateGoods(this.localGoods)
				console.log(res)
				if (res.code === -1) {
					uni.showToast({
						title: '未登录/登录过期',
						icon: 'none'
					})
					setTimeout(() => {
						this.gotoLogin()
					}, 1000)
					return
				}
				this.isEditing = false
				this.$emit('refresh')

			} catch (e) {
				console.log(e)
				uni.showToast({
					title: '更新失败',
					icon: 'error'
				})
			}
		},
		async handleDelete() {
			uni.showModal({
				title: '提示',
				content: '确定要删除该商品吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const rescode = await goodsInfoObj.removeGoods({
								_id: this.goods._id,
								fileID:this.goods.goods_pic?.fileID || null
							})
							if (rescode.code === -1) {
								uni.showToast({
									title: '未登录/登录过期',
									icon: 'none'
								})
								setTimeout(() => {
									this.gotoLogin()
								}, 1000)
								return
							}
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							})
							this.cancel()
							if (!this.sacnFlag) {
								this.$emit('refresh')
							}
						} catch (e) {
							uni.showToast({
								title: '删除失败',
								icon: 'error'
							})
						}
					}
				}
			})
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
	padding: 24rpx 0 24rpx 24rpx;
}

.updateBox {
	padding-bottom: 10rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.form-item {
	padding-bottom: 20rpx;
}


.label {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 7rpx;
	display: block;
}

.input {
	height: 80rpx;
	border: 2rpx solid #ddd;
	border-radius: 16rpx;
	padding: 0 24rpx;
	margin-right: 24rpx;
	font-size: 32rpx;
	transition: all 0.3s;
	height: 70rpx;
}


.value {
	font-size: 32rpx;
	color: #333;
}

.popup-footer {
	padding: 0 25rpx 25rpx;
	display: flex;
	gap: 24rpx;
}

.btn {
	flex: 1;
	height: 80rpx;
	border-radius: 16rpx;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
}

.edit-btn {
	background: #007aff;
	color: #fff;
}

.confirm-btn {
	background: #34c759;
	color: #fff;
}

.back-btn {
	background: #ff9500;
	color: #fff;
}

.delete-btn {
	background: #ff3b30;
	color: #fff;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

@keyframes slideIn {
	from {
		transform: translateY(20px);
		opacity: 0;
	}

	to {
		transform: translateY(0);
		opacity: 1;
	}
}
</style>