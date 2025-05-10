<template>
	<view class="image-upload">
		<view v-if="NewImgObj.imgUrl" class="image-preview">
			<image :src="NewImgObj.imgUrl" mode="aspectFill" class="preview-image" @click="previewImage">
			</image>
			<view class="delete-btn" @click.stop="deleteImage">×</view>
		</view>
		<view v-else class="upload-box" @click="chooseImage" :class="{ 'disabled': uploading }">
			<view v-if="uploading" class="loading">
				<uni-icons type="spinner-cycle" size="30"></uni-icons>
			</view>
			<view v-else class="upload-content">
				<uni-icons type="plusempty" size="30"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script>
	const delPic = uniCloud.importObject('delPic', {
		customUI: true
	})
	export default {
		name: "updateImage",
		props: {
			imageObj: {
				type: Object,
				default: () => ({})
			},
			delFlag: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				uploading: false,
				NewImgObj: {}
			};
		},
		emits: ['uploadPic', 'uploadStatusChange'],
		watch: {
			imageObj: {
				handler(newVal) {
					this.NewImgObj = JSON.parse(JSON.stringify(newVal))
				},
				immediate: true
			}
		},
		methods: {

			resetImage() {
				this.NewImgObj = {
					imgUrl: '',
					fileID: ''
				};
			},


			async chooseImage() {
				uni.$emit('closeOnshow', {})
				try {
					const res = await uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera']
					});
					// 压缩图片
					const compressedImage = await this.compressImage(res.tempFilePaths[0]);
					this.uploadImage(compressedImage);
				} catch (e) {
					console.error('选择图片失败', e);
				}
			},

			async compressImage(filePath) {
				try {
					// 获取图片信息
					const fileInfo = await uni.getFileInfo({
						filePath: filePath
					});

					// 如果图片小于50kb，直接返回
					if (fileInfo.size <= 51200) { // 50 * 1024 = 51200 bytes
						return filePath;
					}

					// 初始压缩参数
					let quality = 80;
					let compressedPath = filePath;

					// 循环压缩直到文件大小小于50kb
					while (true) {
						const res = await uni.compressImage({
							src: filePath,
							quality,
							compressedWidth: 210
						});

						compressedPath = res.tempFilePath;
						const compressedInfo = await uni.getFileInfo({
							filePath: compressedPath
						});

						if (compressedInfo.size <= 51200) {
							break;
						}

						// 如果还是太大，降低质量继续压缩
						quality = Math.max(quality - 10, 10);
						if (quality === 10) {
							break; // 防止无限循环
						}
					}

					return compressedPath;
				} catch (e) {
					console.error('压缩图片失败', e);
					return filePath; // 压缩失败则使用原图
				}
			},


			async uploadImage(filePath) {
				this.uploading = true;
				this.$emit('uploadStatusChange', true);
				try {
					const date = new Date();
					const dateStr =
						`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
					const result = await uniCloud.uploadFile({
						filePath: filePath,
						cloudPath: `goodsImg/${dateStr}/${Date.now()}-${Math.random().toString(36).slice(-6)}.${filePath.split('.').pop()}`
					});
					const imgUrl = await uniCloud.getTempFileURL({
						fileList: [result.fileID]
					});
					this.NewImgObj = {
						fileID: result.fileID,
						imgUrl: imgUrl.fileList[0].tempFileURL.split('?')[0]
					}
					this.$emit('uploadPic', this.NewImgObj);
				} catch (e) {
					console.error('上传失败', e);
					uni.showToast({
						title: '上传失败',
						icon: 'error'
					});
				} finally {
					this.uploading = false;
					this.$emit('uploadStatusChange', false);
				}
			},
			deleteImage() {
				if (this.delFlag) {
					delPic.delfile([this.NewImgObj.fileID])
				}

				this.NewImgObj = {
					imgUrl: '',
					fileID: ''
				}
				this.$emit('uploadPic', this.NewImgObj);
			},
			previewImage() {
				uni.$emit('closeOnshow', {})
				uni.previewImage({
					urls: [this.NewImgObj.imgUrl],
					current: 0
				});

			}
		}
	}
</script>

<style scoped>
	.image-upload {
		width: 180rpx;
		height: 180rpx;
		position: relative;
		margin: 20rpx;
	}

	.image-preview {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.preview-image {
		width: 100%;
		height: 100%;
		border-radius: 8rpx;
	}

	.delete-btn {
		position: absolute;
		top: -20rpx;
		right: -20rpx;
		width: 40rpx;
		height: 40rpx;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
	}

	.upload-box {
		width: 100%;
		height: 100%;
		border: 2rpx dashed #8b8b8b;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.upload-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
		font-size: 24rpx;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
		font-size: 24rpx;
	}

	.loading-spinner {
		width: 40rpx;
		height: 40rpx;
		border: 4rpx solid #f3f3f3;
		border-top: 4rpx solid #3498db;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 10rpx;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.upload-box.disabled {
		opacity: 0.5;
		pointer-events: none;
	}
</style>