<template>
	<view class="container">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="avatar-section" @click="changeAvatar">
				<image class="avatar" :src="userInfo.avatar_file || '/static/default-avatar.png'" mode="aspectFill">
				</image>
			</view>
			<view class="user-info">
				<view class="nickname-wrapper" @click="showNicknameInput">
					<text class="nickname">{{ userInfo.nickname || '未登录' }}</text>
					<text class="iconfont icon-edit"></text>
				</view>
				<view class="user-id" v-if="userInfo._id">ID:{{ userInfo._id }}</view>
			</view>
		</view>

		<!-- 功能列表 -->
		<view class="feature-list">
			<view class="feature-item" @click="handleModel">
				<image class="feature-icon" src="/static/icons/template.svg" mode="aspectFit"></image>
				<text class="feature-text">导入模板以及导入说明</text>
			</view>

			<view class="feature-item" @click="checkTip">
				<image class="feature-icon" src="/static/icons/import.svg" mode="aspectFit"></image>
				<text class="feature-text">导入Excel</text>
			</view>

			<view class="feature-item" @click="handleExport">
				<image class="feature-icon" src="/static/icons/export.svg" mode="aspectFit"></image>
				<text class="feature-text">导出Excel</text>
			</view>

			<view class="feature-item" @click="showFeedback">
				<image class="feature-icon" src="/static/icons/feedback.svg" mode="aspectFit"></image>
				<text class="feature-text">意见反馈</text>
			</view>

			<view class="feature-item" @click="gotoAnalysis">
				<image class="feature-icon" src="/static/icons/analysis.svg" mode="aspectFit"></image>
				<text class="feature-text">数据分析</text>
			</view>

			<view class="feature-item" @click="gotoRecord">
				<image class="feature-icon" src="/static/icons/record.svg" mode="aspectFit"></image>
				<text class="feature-text">出库记录</text>
			</view>

			<view class="feature-item" @click="gotoUsemsg">
				<view class="icon-wrapper">
					<image class="feature-icon" src="/static/icons/message.svg" mode="aspectFit"></image>
					<view v-if="showMsgFlag" class="red-dot"></view>
				</view>
				<text class="feature-text">我的消息</text>
			</view>
		</view>


		<!-- 广告 -->
		<!-- <ad-custom unit-id="adunit-51de09dcce46fe1b"></ad-custom> -->

		<!-- 功能列表 -->
		<view class="feature-list">
			<view class="feature-item" @click="logout">
				<image class="feature-icon" src="/static/icons/logout.svg" mode="aspectFit"></image>
				<text class="feature-text">退出登录</text>
			</view>

			<view class="feature-item" @click="changePwd" v-if="hasUsername">
				<image class="feature-icon" src="/static/icons/password.svg" mode="aspectFit"></image>
				<text class="feature-text">修改密码</text>
			</view>

			<view class="feature-item" @click="delall">
				<image class="feature-icon" src="/static/icons/delete.svg" mode="aspectFit"></image>
				<text class="feature-text">一键清库</text>
			</view>

			<view class="feature-item" @click="gotoPayUrl">
				<image class="feature-icon" src="/static/icons/star.svg" mode="aspectFit"></image>
				<text class="feature-text">支持作者</text>
			</view>

			<!-- <view class="feature-item" @click="cancelUser">
				<image class="feature-icon" src="/static/icons/delete.svg" mode="aspectFit"></image>
				<text class="feature-text">注销账号</text>
			</view> -->
		</view>

		<!-- 修改昵称弹窗 -->
		<uni-popup ref="nicknamePopup" type="center">
			<view class="popup-content">
				<view class="popup-title">修改昵称</view>
				<input class="nickname-input" v-model="newNickname" placeholder="请输入新昵称" maxlength="12" />
				<view class="popup-buttons">
					<button class="cancel-btn" @click="closeNicknamePopup">取消</button>
					<button class="confirm-btn" @click="updateNickname">确认</button>
				</view>
			</view>
		</uni-popup>

		<!-- 意见反馈弹窗 -->
		<uni-popup ref="feedbackPopup" type="center">
			<view class="popup-content">
				<view class="popup-title">意见反馈</view>
				<textarea class="mobile-input" v-model="mobile" placeholder="请输入您的电话，方便与您联系" />
				<textarea class="feedback-input" v-model="feedbackContent" placeholder="请输入您的建议" maxlength="500" />
				<view class="developer-contact">开发者微信：ohohoh6a</view>
				<view class="popup-buttons">
					<button class="cancel-btn" @click="closeFeedbackPopup">取消</button>
					<button class="confirm-btn" @click="submitFeedback">提交</button>
				</view>

			</view>
		</uni-popup>

		<!-- 删除确认弹窗 -->
		<uni-popup ref="confirmPopup" type="center">
			<view class="popup-content">
				<view class="popup-title">删除所有商品数据</view>
				<view class="export-content">
					删除后数据将无法找回，谨慎操作。如需删除，请输入{{userInfo.username ? '您的登录密码' : '您的ID后6位'}}以确认删除所有数据（注：“商品”页面的数据）</view>
				<input class="nickname-input" v-model="confirmInput"
					:placeholder="userInfo.username ? '输入登录密码' : '请输入ID后6位'" password="showPassword" />
				<view class="popup-buttons">
					<button class="cancel-btn" @click="$refs.confirmPopup.close()">取消</button>
					<button class="confirm-btn" @click="confirmDelete">确认</button>
				</view>
			</view>
		</uni-popup>

		<!-- 导出弹窗 -->
		<uni-popup ref="exportPopup" type="center">
			<view class="popup-content">
				<view class="popup-title">复制成功√</view>
				<view class="export-content">您已复制下载连接，请粘贴到【浏览器】中下载。当前连接10分钟后过期(注：图片不导出)</view>
				<input class="tmpurl-input" v-model="tmpurl" />
				<view class="popup-buttons">
					<button class="confirm-btn" @click="coypContent">复制</button>
					<button class="confirm-btn" @click="closeexportPopup">好的</button>
				</view>
			</view>
		</uni-popup>

	</view>
</template>

<script>
	const db = uniCloud.database()
	const delUserGoodsInfo = uniCloud.importObject('delUserGoodsInfo')
	const goodsExportImport = uniCloud.importObject('goodsExportImport2')
	const sendMsg = uniCloud.importObject('sendMsg')
	const uniIdCo = uniCloud.importObject("uni-id-co", {
		customUI: true
	})
	import * as XLSX from 'xlsx';
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'

	export default {
		data() {
			return {
				newNickname: '',
				feedbackContent: '',
				mobile: '',
				tmpurl: '',
				hasShownImportTip: false,
				msgCount: 0,
				showMsgFlag: false,
				nowMsgCount: null,
				confirmInput: '',
				showPassword: true
			}
		},
		onLoad() {
			this.checkMsg()
			this.hasShownImportTip = uni.getStorageSync('hasShownImportTip') || false
		},

		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin() {
				return store.hasLogin
			},
			hasUsername() {
				console.log(store)
				return store.userInfo.username
			}
		},
		methods: {
			changePassword: function() {
				this.showPassword = !this.showPassword;
			},

			async delall() {
				if (this.goLoaginPage()) return
				this.$refs.confirmPopup.open()
			},

			async confirmDelete() {
				if (!this.confirmInput) {
					uni.showToast({
						title: '请输入验证信息',
						icon: 'none'
					});
					return;
				}

				if (this.userInfo.username) {
					// 密码验证
					try {
						const res = await uniIdCo.verifyPassword({
							password: this.confirmInput
						});
						if (res.code !== 0) {
							uni.showToast({
								title: '密码错误',
								icon: 'none'
							});
							this.confirmInput = ''
							return;
						}
					} catch (e) {
						uni.showToast({
							title: '验证失败',
							icon: 'none'
						});
						this.confirmInput = ''
						return;
					}
				} else {
					// ID验证
					const lastSix = this.userInfo._id.slice(-6);
					if (this.confirmInput !== lastSix) {
						uni.showToast({
							title: 'ID验证失败',
							icon: 'none'
						});
						this.confirmInput = ''
						return;
					}
				}

				// 执行删除操作
				try {
					await delUserGoodsInfo.delAllInfo();
					this.confirmInput = ''
					this.$refs.confirmPopup.close();
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
				} catch (e) {
					this.confirmInput = ''
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					});
				}
			},



			gotoPayUrl() {
				uni.navigateTo({
					url: "/pages/subpack/pay/pay"
				})
			},

			changePwd() {
				if (this.goLoaginPage()) return
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/change_pwd/change_pwd"
				})
			},

			// 退出登录
			logout() {
				if (this.goLoaginPage()) return
				uni.showModal({
					title: "是否退出登录"
				}).then(res => {
					if (res.confirm) {
						mutations.logout()
					}
				})
			},

			// 注销账号
			cancelUser() {
				if (this.goLoaginPage()) return
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/deactivate/deactivate"
				})
			},

			goLoaginPage() {
				if (!this.hasLogin) {
					uni.showToast({
						title: '未登录/登录过期',
						icon: "none"
					})
					return true
				}
				return false
			},

			async checkMsg() {
				this.nowMsgCount = await sendMsg.getMsgCount()
				this.msgCount = uni.getStorageSync('msgCount') || 0
				if (this.msgCount < this.nowMsgCount) {
					this.showMsgFlag = true
				} else if (this.msgCount > this.nowMsgCount) {
					uni.setStorageSync('msgCount', this.nowMsgCount)
				}
			},

			handleModel() {
				uni.navigateTo({
					url: "/pages/subpack/explanation/explanation"
				})
			},

			gotoAnalysis() {
				uni.navigateTo({
					url: "/pages/subpack/analysis/analysis"
				})
			},

			gotoRecord() {
				uni.navigateTo({
					url: "/pages/subpack/record/record"
				})
			},

			gotoUsemsg() {
				uni.setStorageSync('msgCount', this.nowMsgCount)
				this.showMsgFlag = false
				uni.navigateTo({
					url: "/pages/subpack/usermsg/usermsg"
				})
			},


			gotoLogin() {
				uni.showToast({
					title: '未登录/登录过期',
					icon: 'none'
				})

				setTimeout(() => {
					uni.navigateTo({
						url: '../../uni_modules/uni-id-pages/pages/login/login-withoutpwd'
					})
				}, 1000)
			},

			showNicknameInput() {
				console.log(this.userInfo.nickname)
				if (typeof this.userInfo.nickname === 'undefined') {
					console.log(this.userInfo.nickname)
					this.gotoLogin()
					return
				}
				this.newNickname = this.userInfo.nickname || '未知'
				this.$refs.nicknamePopup.open()
			},

			closeNicknamePopup() {
				this.$refs.nicknamePopup.close()
			},


			changeAvatar() {
				if (typeof this.userInfo.avatar_file === 'undefined') {
					this.gotoLogin()
					return
				}
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						const tempFilePath = res.tempFilePaths[0]

						// 显示上传中提示
						uni.showLoading({
							title: '上传中...'
						})
						console.log(tempFilePath)
						try {
							// 上传图片到云存储
							const uploadRes = await uniCloud.uploadFile({
								filePath: tempFilePath,
								cloudPath: `avatar/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`
							})
							const tempFileURL = await uniCloud.getTempFileURL({
								fileList: [uploadRes.fileID]
							})

							let avatarUrl = tempFileURL.fileList[0].tempFileURL

							const questionMarkIndex = avatarUrl.indexOf('?');
							if (questionMarkIndex !== -1) {
								avatarUrl = avatarUrl.substring(0, questionMarkIndex);
							}

							// 更新用户信息
							await db.collection('uni-id-users').doc(this.userInfo._id).update({
								avatar_file: avatarUrl
							})

							// 更新本地存储
							this.userInfo.avatar_file = avatarUrl


							uni.setStorageSync('uni-id-pages-userInfo', JSON.stringify(this.userInfo))

							uni.hideLoading()
							uni.showToast({
								title: '头像更新成功',
								icon: 'success'
							})
						} catch (e) {
							console.error('头像更新失败:', e)
							uni.hideLoading()
							uni.showToast({
								title: e.message || '上传失败',
								icon: 'error'
							})
						}
					},
					fail: (err) => {
						console.error('选择图片失败:', err)
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						})
					}
				})
			},

			async updateNickname() {
				if (!this.newNickname.trim()) {
					uni.showToast({
						title: '昵称不能为空',
						icon: 'none'
					})
					return
				}

				try {

					console.log(this.userInfo._id)
					await db.collection('uni-id-users').where('_id==$env.uid').update({
						nickname: this.newNickname
					})

					this.userInfo.nickname = this.newNickname
					uni.setStorageSync('uni-id-pages-userInfo', JSON.stringify(this.userInfo))

					this.closeNicknamePopup()
					uni.showToast({
						title: '昵称更新成功',
						icon: 'success'
					})
				} catch (e) {
					uni.showToast({
						title: '更新失败',
						icon: 'error'
					})
				}
			},

			// 查看用户是否到如果，引导用户
			checkTip() {
				if (!this.hasShownImportTip) {
					this.hasShownImportTip = true
					uni.setStorageSync('hasShownImportTip', true)
					uni.showModal({
						title: '温馨提示',
						content: '首次导入请先查看"导入模板以及导入说明"',
						confirmText: '去查看',
						cancelText: '继续导入',
						success: (res) => {
							if (res.confirm) {
								this.handleModel()
								return
							} else {
								this.handleImport()
								return
							}
						}
					})
				} else {
					this.handleImport()
				}
			},

			// 导入商品数据
			async handleImport() {
				if (this.goLoaginPage()) {
					this.gotoLogin()
					return
				}
				try {
					// 选择文件
					const chooseRes = await uni.chooseMessageFile({
						count: 1,
						type: 'file',
						extension: ['xlsx', '.xlsx']
					});

					const filePath = chooseRes.tempFiles[0].path

					// 创建文件系统管理器
					const fs = wx.getFileSystemManager();

					// 读取文件内容
					let fileData;
					try {
						fileData = fs.readFileSync(filePath, 'base64');
					} catch (error) {
						uni.showToast({
							title: '读取文件失败',
							icon: 'none',
							duration: 2000
						});
						return;
					}

					// 使用 xlsx 解析 Excel 文件
					const workbook = XLSX.read(fileData, {
						type: 'base64'
					});
					const worksheet = workbook.Sheets[workbook.SheetNames[0]];

					// 将工作表转换为 JSON 数据
					let jsonData = XLSX.utils.sheet_to_json(worksheet, {
						header: 1
					});
					jsonData.shift()


					jsonData = jsonData.filter(subArray => subArray.length > 0);

					// 检查名字是否有空
					const hasEmptyName = jsonData.some(row => {
						const name = String(row[1] || '');
						console.log(!name || name.trim() === '')
						return !name || name.trim() === '';
					});
					if (hasEmptyName) {
						uni.showToast({
							title: '商品名称不能为空',
							icon: 'none',
							duration: 4000
						});
						return;
					}

					// 检查商品价格列是否包含非数字或者负数
					const hasNonNumericPrice = jsonData.some(row => {
						const price = Number(row[2]);
						return isNaN(price) || price < 0;
					});
					if (hasNonNumericPrice) {
						uni.showToast({
							title: '商品价格必须为非负数',
							icon: 'none',
							duration: 4000
						});
						return;
					}

					// 检查商品成本列是否包含非数字或者负数
					const hasNonNumericCost = jsonData.some(row => {
						const cost = row[3];
						if (cost === '' || cost === null || cost === undefined) {
							return false;
						}
						const costValue = Number(cost);
						return isNaN(costValue) || costValue < 0;
					});
					if (hasNonNumericCost) {
						uni.showToast({
							title: '商品成本必须为非负数或留空',
							icon: 'none',
							duration: 4000
						});
						return;
					}

					// 检查数量列是否为正整数或者为空
					const hasInvalidNum = jsonData.some(row => {
						const num = row[4];
						if (num === '' || num === null || num === undefined) {
							return false;
						}
						const numValue = Number(num);
						return isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue);
					});
					if (hasInvalidNum) {
						uni.showToast({
							title: '商品数量必须为非负整数或留空',
							icon: 'none',
							duration: 4000
						});
						return;
					}

					// 检查缺货提醒阈值列是否为正整数或者为空
					const hasInvalidThreshold = jsonData.some(row => {
						const threshold = row[5];
						if (threshold === '' || threshold === null || threshold === undefined) {
							return false;
						}
						const thresholdValue = Number(threshold);
						return isNaN(thresholdValue) || thresholdValue < 0 || !Number.isInteger(
							thresholdValue);
					});
					if (hasInvalidThreshold) {
						uni.showToast({
							title: '缺货提醒阈值必须为非负整数或留空',
							icon: 'none',
							duration: 4000
						});
						return;
					}

					console.log(jsonData)

					jsonData.forEach(row => {
						row[2] = Number(row[2]);

						// 处理成本、数量和阈值字段
						[3, 4, 5].forEach(index => {
							const value = row[index];
							if (value === 0) {
								row[index] = 0;
							} else if (typeof value === 'string' && (value.trim() === '' || value ===
									'')) {
								row[index] = '';
							} else if (!isNaN(value)) {
								row[index] = Number(value);
							} else {
								row[index] = '';
							}
						});
					});
					console.log(jsonData)

					// 分批导入数据
					const batchSize = 200;
					const batches = [];
					for (let i = 0; i < jsonData.length; i += batchSize) {
						const end = Math.min(i + batchSize, jsonData.length);
						batches.push(jsonData.slice(i, end));
					}


					// return
					try {
						const batchPromises = batches.map(batch => {
							return goodsExportImport.importGoods(batch)
						});
						const results = await Promise.all(batchPromises);

						const hasError = results.some(res => res.code === 500);
						const hasLoginError = results.some(res => res.code === -1);

						uni.hideLoading();

						if (hasLoginError) {
							this.gotoLogin();
							return;
						}

						if (hasError) {
							uni.showToast({
								title: '部分数据导入失败',
								icon: 'none',
								duration: 2000
							});
						} else {
							uni.showToast({
								title: '导入成功',
								icon: 'success',
								duration: 2000
							});
						}
					} catch (error) {
						uni.hideLoading();
						uni.showToast({
							title: '导入失败',
							icon: 'none',
							duration: 2000
						});
						console.log(jsonData)

					}

				} catch (error) {
					console.log(error)
				}
			},


			// 导出商品数据
			async handleExport() {
				if (this.goLoaginPage()) {
					this.gotoLogin()
					return
				}
				try {
					const res = await goodsExportImport.exportGoods();
					if (res.code === 200) {
						this.tmpurl = res.downloadUrl
						this.$refs.exportPopup.open()
						this.coypContent(this.tmpurl)
					} else if (res.code === -1) {
						this.gotoLogin()
						return
					} else {
						uni.showToast({
							title: '导出失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '导出失败',
						icon: 'none'
					})
				}
			},

			coypContent() {
				uni.setClipboardData({
					data: this.tmpurl,
					success: () => {
						uni.showToast({
							title: '复制成功',
							icon: 'success'
						})
					},
					fail: () => {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						})
					}
				})
			},

			closeexportPopup() {
				this.$refs.exportPopup.close()
			},

			async showFeedback() {
				if (this.goLoaginPage()) {
					this.gotoLogin()
					return
				}
				this.$refs.feedbackPopup.open()
			},
			closeFeedbackPopup() {
				this.$refs.feedbackPopup.close()
				this.feedbackContent = ''
			},
			async submitFeedback() {
				const regex = /^1[3-9]\d{9}$/;
				if (!this.feedbackContent.trim()) {
					uni.showToast({
						title: '请输入反馈内容',
						icon: 'none'
					})
					return
				} else if (this.mobile === '') {
					uni.showToast({
						title: '手机号不能为空',
						icon: 'none'
					})
					return
				} else if (!regex.test(this.mobile)) {
					console.log(this.mobile);
					uni.showToast({
						title: '请输入有效的手机号',
						icon: 'none'
					})
					return
				}

				try {
					const res = await db.collection('opendb-feedback').add({
						user_id: this.userInfo._id,
						content: this.feedbackContent,
						mobile: this.mobile,
						create_date: Date.now()
					})

					console.log(res)

					this.closeFeedbackPopup()
					uni.showToast({
						title: '反馈提交成功',
						icon: 'success'
					})
				} catch (e) {
					console.log(e)
					uni.showToast({
						title: '提交失败',
						icon: 'error'
					})
				}
			}

		}
	}
</script>

<style scoped>
	.container {
		height: 100vh;
		background: #f5f5f5;
		padding: 30rpx;
		background-color: #f8f8f8;
		overflow-y: auto;
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		box-sizing: border-box;
	}

	.user-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
		display: flex;
		align-items: center;
		margin-bottom: 8rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	}

	.avatar-section {
		position: relative;
		margin-right: 30rpx;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		background: #eee;
	}

	.edit-badge {
		position: absolute;
		right: -6rpx;
		bottom: -6rpx;
		width: 40rpx;
		height: 40rpx;
		background: #007AFF;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.edit-badge .icon-camera {
		color: #fff;
		font-size: 24rpx;
	}

	.user-info {
		flex: 1;
	}

	.nickname-wrapper {
		display: flex;
		align-items: center;
	}

	.nickname {
		font-size: 36rpx;
		color: #333;
		font-weight: 500;
		margin-right: 16rpx;
	}

	.user-id {
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.icon-edit {
		font-size: 32rpx;
		color: #999;
	}

	.feature-list {
		background: #fff;
		border-radius: 20rpx;
		padding: 0 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		margin: 20rpx 0;
	}

	.feature-item {
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		border-bottom: 1rpx solid #eee;
	}

	.feature-item:last-child {
		border-bottom: none;
	}

	.feature-item .iconfont {
		font-size: 40rpx;
		color: #007AFF;
		margin-right: 20rpx;
	}

	.feature-item .icon-right {
		margin-left: auto;
		color: #999;
		font-size: 32rpx;
	}

	.feature-icon {
		width: 40rpx;
		height: 40rpx;
		margin-right: 20rpx;
	}

	.feature-text {
		font-size: 28rpx;
		color: #333;
	}

	.popup-content {
		background: #fff;
		border-radius: 20rpx;
		width: 600rpx;
		padding: 30rpx;
	}

	.export-content {
		margin-bottom: 25rpx;
	}

	.popup-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.nickname-input {
		height: 80rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		margin-bottom: 30rpx;
	}

	.tmpurl-input {
		width: 100%;
		height: 80rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		padding: 0 20rpx;
		margin-bottom: 30rpx;
		box-sizing: border-box;
	}

	.mobile-input {
		width: 100%;
		height: 80rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		padding: 20rpx;
		font-size: 28rpx;
		margin-bottom: 30rpx;
		box-sizing: border-box;
	}


	.feedback-input {
		height: 300rpx;
		width: 100%;
		background: #f5f5f5;
		border-radius: 8rpx;
		padding: 20rpx;
		font-size: 28rpx;
		margin-bottom: 30rpx;
		box-sizing: border-box;
	}

	.popup-buttons {
		display: flex;
		justify-content: space-between;
	}

	.popup-buttons button {
		width: 260rpx;
		height: 80rpx;
		border-radius: 8rpx;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cancel-btn {
		background: #f5f5f5;
		color: #666;
	}

	.confirm-btn {
		background: #007AFF;
		color: #fff;
	}

	/* 添加动画效果 */
	.user-card {
		animation: slideDown 0.5s ease-out;
	}

	.feature-list {
		animation: slideUp 0.5s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-20rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.developer-contact {
		font-size: 28rpx;
		color: #666;
		text-align: center;
		margin: 20rpx 0;
		padding: 10rpx;
		background-color: #f8f8f8;
		border-radius: 8rpx;
	}

	.icon-wrapper {
		position: relative;
		display: inline-block;
	}

	.red-dot {
		position: absolute;
		top: -6rpx;
		right: 9rpx;
		width: 16rpx;
		height: 16rpx;
		background-color: #ff4d4f;
		border-radius: 50%;
	}
</style>