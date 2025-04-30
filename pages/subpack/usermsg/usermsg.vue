<template>
	<view class="usermsg-container">
		<!-- 管理员发送消息按钮 -->
		<view v-if="isAdmin" class="send-btn" @click="showSendDialog">
			<uni-icons type="plusempty" size="30"></uni-icons>
		</view>

		<!-- 消息列表 -->
		<view class="message-list">
			<view v-for="msg in messages" :key="msg._id" class="message-item" @click="viewMsg(msg)">
				<view class="message-header">
					<text class="message-title">{{msg.title}}</text>
					<view v-if="isAdmin" class="delete-btn" @click.stop="deleteMsg(msg._id)">
						<uni-icons type="trash" size="24" color="#ff0000"></uni-icons>
					</view>
				</view>
				<text class="message-preview">{{msg.content}}</text>
				<text class="message-time">{{formatDate(msg.create_date)}}</text>
			</view>
			<!-- 加载中 -->
			<view v-if="loading" class="indicator">
				<uni-icons type="loading" size="30"></uni-icons>
				<text>加载中...</text>
			</view>
			<!-- 没有更多了 -->
			<view v-else-if="!hasMore" class="indicator">
				<text>没有更多了</text>
			</view>
		</view>

		<!-- 发送消息弹窗 -->
		<uni-popup ref="sendPopup" type="bottom">
			<view class="popup-content">
				<view class="popup-header">
					<text>发送消息</text>
				</view>
				<view class="input-group">
					<input v-model="newMessage.title" placeholder="请输入标题" class="input-title" />
					<textarea v-model="newMessage.content" placeholder="请输入内容" class="input-content"></textarea>
				</view>
				<view class="popup-footer">
					<button @click="$refs.sendPopup.close()" class="cancel-btn">取消</button>
					<button @click="confirmSend" class="confirm-btn">发送</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	const sendMsg = uniCloud.importObject('sendMsg')

	export default {
		data() {
			return {
				isAdmin: false,
				messages: [],
				newMessage: {
					title: '',
					content: ''
				},
				pageSize: 10,
				pageIndex: 1,
				total: 0,
				loading: false,
				hasMore: true
			}
		},
		onLoad() {
			this.checkUserRole()
			this.loadMessages()
		},
		onReachBottom() {
			if (this.hasMore && !this.loading) {
				this.pageIndex++
				this.loadMessages()
			}
		},
		methods: {
			async checkUserRole() {
				try {
					const res = uniCloud.getCurrentUserInfo().role
					this.isAdmin = res === 'admin'
				} catch (e) {
					console.error(e)
				}
			},
			async loadMessages() {
				if (this.loading) return
				this.loading = true
				try {
					const res = await sendMsg.getMessages(this.pageSize, this.pageIndex)
					if (res.errCode === 0) {
						const { list, total } = res.data
						this.total = total
						this.messages = this.pageIndex === 1 ? list : [...this.messages, ...list]
						this.hasMore = this.messages.length < total
					}
				} catch (e) {
					console.error(e)
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},
			showSendDialog() {
				this.$refs.sendPopup.open()
			},
			async deleteMsg(id) {
				try {
					const res = await sendMsg.deleteMessage(id)
					if (res.errCode === 0) {
						this.pageSize = 10
						this.pageIndex = 1
						this.total = 0,
						this.loadMessages()
					} else {
						uni.showToast({
							title: res.errMsg,
							icon: 'none'
						})
					}
				} catch (e) {
					console.error(e)
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					})
				}
			},
			async confirmSend() {
				if (!this.newMessage.title || !this.newMessage.content) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none'
					})
					return
				}
				
				try {
					const res = await sendMsg.sendToAll(this.newMessage.title, this.newMessage.content)
					if (res.errCode === 0) {
						this.$refs.sendPopup.close()
						this.newMessage = { title: '', content: '' }
						this.pageSize = 10
						this.pageIndex = 1
						this.total = 0,
						this.loadMessages()
					} else {
						uni.showToast({
							title: res.errMsg,
							icon: 'none'
						})
					}
				} catch (e) {
					console.error(e)
					uni.showToast({
						title: '发送失败',
						icon: 'none'
					})
				}
			},	
			viewMsg(msg) {
				uni.showModal({
					title: msg.title,
					content: msg.content,
					showCancel: false,
					confirmText: '关闭',
					confirmColor: '#007AFF'
				})
			},
			formatDate(timestamp) {
				const date = new Date(timestamp)
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
			}
		}
	}
</script>

<style scoped>
.usermsg-container {
	padding: 20rpx;
	height: 100vh;
	background: #f8f8f8;
}

.send-btn {
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	background-color: #007AFF;
	color: #fff;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
}

.message-list {
	padding: 10rpx;
}

.message-item {
	background-color: #fff;
	padding: 20rpx;
	margin-bottom: 20rpx;
	border-radius: 10rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.message-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.delete-btn {
	margin-left: 20rpx;
}

.message-title {
	font-size: 32rpx;
	font-weight: bold;
}

.unread-dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	background-color: #ff0000;
}

.message-preview {
	font-size: 28rpx;
	color: #666;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

.message-time {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}

.message-textarea {
	width: 100%;
	height: 200rpx;
	padding: 20rpx;
	box-sizing: border-box;
	margin-top: 20rpx;
	border: 1rpx solid #eee;
	border-radius: 10rpx;
}

.popup-content {
	background-color: #fff;
	padding: 30rpx;
	border-radius: 20rpx 20rpx 0 0;
}

.popup-header {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 30rpx;
	text-align: center;
}

.input-group {
	margin-bottom: 30rpx;
}

.input-title {
	padding: 20rpx;
	border: 1rpx solid #eee;
	border-radius: 10rpx;
	margin-bottom: 20rpx;
}

.input-content {
	width: 100%;
	box-sizing: border-box;
	height: 300rpx;
	padding: 20rpx;
	border: 1rpx solid #eee;
	border-radius: 10rpx;
}

.popup-footer {
	display: flex;
	justify-content: space-between;
}

.cancel-btn, .confirm-btn {
	width: 48%;
	border-radius: 10rpx;
	text-align: center;
}

.cancel-btn {
	background-color: #f1f1f1;
	color: #666;
}

.confirm-btn {
	background-color: #007AFF;
	color: #fff;
}

.indicator {
	color: #7b7979;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20rpx;
}
</style>
