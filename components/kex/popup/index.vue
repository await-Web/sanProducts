<template>
	<view class="">
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
</template>

<script>
	export default {
		data() {
			return {
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
			}
		},
		methods: {
			uploadPic(newImgObj) {
				this.newGoods.goods_pic = newImgObj;
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
			confirmAdd() {
				this.$emit('add', this.newGoods)
			}
		}
	}
</script>

<style>
</style>