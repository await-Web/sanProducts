<!-- 账号密码登录页 -->
<template>
	<view class="uni-content">
		<view>
			<!-- 顶部文字 -->
			<text class="title title-box">账号密码登录</text>
			<uni-forms>
				<uni-forms-item name="username">
					<uni-easyinput :focus="focusUsername" @blur="focusUsername = false" class="input-box"
						:inputBorder="false" v-model="username" placeholder="请输入用户名" trim="all" />
				</uni-forms-item>
				<uni-forms-item name="password">
						<uni-easyinput :focus="focusPassword" @blur="focusPassword = false" class="input-box" clearable
									type="password" :inputBorder="false" v-model="password" placeholder="请输入密码" trim="all" />
				</uni-forms-item>
			</uni-forms>
			<uni-captcha v-if="needCaptcha" focus ref="captcha" scene="login-by-pwd" v-model="captcha" />
			<!-- 带选择框的隐私政策协议组件 -->
			<uni-id-pages-agreements scope="login" ref="agreements"></uni-id-pages-agreements>
			<button class="uni-btn" type="primary" @click="pwdLogin">登录</button>
			<!-- 忘记密码 -->
			<view class="link-box" >
				<view v-if="!config.isAdmin">
					<text class="forget">忘记了，</text>
					<text class="link" @click="toRetrievePwd">就找不回密码了!</text>
				</view>
				<!-- <text class="link" @click="toRegister">{{config.isAdmin ? '注册管理员账号': '注册账号'}}</text> -->
				<text class="link" @click="toRegister" v-if="!config.isAdmin">注册账号</text>
			</view>
		</view>
		<!-- 悬浮登录方式组件 -->
		<uni-id-pages-fab-login ref="uniFabLogin"></uni-id-pages-fab-login>
	</view>
</template>

<script>
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	const uniIdCo = uniCloud.importObject("uni-id-co", {
		errorOptions: {
			type: 'toast'
		}
	})
	export default {
		mixins: [mixin],
		data() {
			return {
				"password": "",
				"username": "",
				"captcha": "",
				"needCaptcha": false,
				"focusUsername": false,
				"focusPassword": false,
				"logo": "/static/logo.png"
			}
		},
		onShow() {
			// #ifdef H5
			document.onkeydown = event => {
				var e = event || window.event;
				if (e && e.keyCode == 13) { //回车键的键值为13
					this.pwdLogin()
				}
			};
			// #endif
		},
		methods: {
			// 页面跳转，找回密码
			toRetrievePwd() {
				uni.showModal({
					title: '为什么',
					content: '因为个人开发者无权实现手机验证码登录以及手机绑定，用户需自行记好，请见谅',
					showCancel: false,
					confirmText: '我知道了',
				})
			},
			/**
			 * 密码登录
			 */
			pwdLogin() {
				if (!this.password.length) {
					this.focusPassword = true
					return uni.showToast({
						title: '请输入密码',
						icon: 'none',
						duration: 3000
					});
				}
				if (!this.username.length) {
					this.focusUsername = true
					return uni.showToast({
						title: '请输入手机号/用户名/邮箱',
						icon: 'none',
						duration: 3000
					});
				}
				if (this.needCaptcha && this.captcha.length != 4) {
					this.$refs.captcha.getImageCaptcha()
					return uni.showToast({
						title: '请输入验证码',
						icon: 'none',
						duration: 3000
					});
				}

				if (this.needAgreements && !this.agree) {
					return this.$refs.agreements.popup(this.pwdLogin)
				}

				let data = {
					"password": this.password,
					"captcha": this.captcha
				}

				if (/^1\d{10}$/.test(this.username)) {
					data.mobile = this.username
				} else if (/@/.test(this.username)) {
					data.email = this.username
				} else {
					data.username = this.username
				}

				uniIdCo.login(data).then(e => {
					this.loginSuccess(e)
				}).catch(e => {
					if (e.errCode == 'uni-id-captcha-required') {
						this.needCaptcha = true
					} else if (this.needCaptcha) {
						//登录失败，自动重新获取验证码
						this.$refs.captcha.getImageCaptcha()
					}
				})
			},
			/* 前往注册 */
			toRegister() {
				uni.navigateTo({
					url: this.config.isAdmin ? '/uni_modules/uni-id-pages/pages/register/register-admin' :
						'/uni_modules/uni-id-pages/pages/register/register',
					fail(e) {
						console.error(e);
					}
				})
			}
		}
	}
</script>

<style lang="scss">
@import "@/uni_modules/uni-id-pages/common/login-page.scss";

@media screen and (min-width: 690px) {
	.uni-content {
		height: auto;
	}
}

.forget {
	font-size: 12px;
	color: #8a8f8b;
}

.link-box {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
	justify-content: space-between;
	margin-top: 20px;
}

.link {
	font-size: 12px;
	padding: 12px 0;
	z-index: 2;
}

.uni-content {
  min-height: 100vh;
  background: linear-gradient(-45deg, #1a73e8, #2196F3, #03A9F4, #00BCD4);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  display: flex;
  flex-direction: column;
  padding: 30px;
  position: relative;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-logo {
  display: flex;
  justify-content: center;
  margin: 20rpx 0 30rpx;
  
  image {
    width: 150rpx;
    height: 150rpx;
    border-radius: 16rpx;
  }
}

.title-box {
  text-align: center;
  font-size: 38rpx;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 50rpx;
  font-weight: bold;
}

uni-forms {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  
  .uni-forms-item__inner {
    padding-bottom: 10px;
  }
  
  .uni-easyinput__content {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10rpx;
    color: #fff;
  }
}

.link-box {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
}

.forget {
  color: rgba(255, 255, 255, 0.8);
}

.link {
  color: #fff;
  text-decoration: underline;
}

.uni-btn {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8rpx 32rpx rgba(31, 38, 135, 0.37);
  border-radius: 10rpx;
  color: white;
  font-weight: bold;
  margin-top: 40rpx;
  
  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
