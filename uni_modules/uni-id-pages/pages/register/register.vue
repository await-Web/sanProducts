<!-- 账号注册页 -->
<template>
	<view class="uni-content">
		<match-media :min-width="690">
			<view class="login-logo">
				<image :src="logo"></image>
			</view>
			<!-- 顶部文字 -->
			<text class="title title-box">用户名密码注册</text>
		</match-media>
		<uni-forms ref="form" :value="formData" :rules="rules" validate-trigger="submit" err-show-type="toast">
			<uni-forms-item name="username" required>
				<uni-easyinput :inputBorder="false" :focus="focusUsername" @blur="focusUsername = false"
					class="input-box" placeholder="请输入用户名" v-model="formData.username" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="nickname">
				<uni-easyinput :inputBorder="false" :focus="focusNickname" @blur="focusNickname = false"
					class="input-box" placeholder="请输入用户昵称" v-model="formData.nickname" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="password" v-model="formData.password" required>
				<uni-easyinput :inputBorder="false" :focus="focusPassword" @blur="focusPassword = false"
					class="input-box" maxlength="20"
					:placeholder="'请输入' + (config.passwordStrength == 'weak'?'6':'8') + '-16位密码'" type="password"
					v-model="formData.password" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="password2" v-model="formData.password2" required>
				<uni-easyinput :inputBorder="false" :focus="focusPassword2" @blur="focusPassword2 =false"
					class="input-box" placeholder="再次输入密码" maxlength="20" type="password" v-model="formData.password2"
					trim="both" />
			</uni-forms-item>
			<uni-forms-item>
				<uni-captcha ref="captcha" scene="register" v-model="formData.captcha" />
			</uni-forms-item>
			<uni-id-pages-agreements scope="register" ref="agreements"></uni-id-pages-agreements>
			<button class="uni-btn" type="primary" @click="submit">注册</button>
			<button @click="navigateBack" class="register-back">返回</button>
			<match-media :min-width="690">
				<view class="link-box">
					<text class="link" @click="registerByEmail">邮箱验证码注册</text>
					<text class="link" @click="toLogin">已有账号？点此登录</text>
				</view>
			</match-media>
		</uni-forms>
	</view>
</template>

<script>
	import rules from './validator.js';
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	import config from '@/uni_modules/uni-id-pages/config.js'
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'

	const uniIdCo = uniCloud.importObject("uni-id-co")
	export default {
		mixins: [mixin],
		data() {
			return {
				formData: {
					username: "",
					nickname: "",
					password: "",
					password2: "",
					captcha: ""
				},
				rules,
				focusUsername: false,
				focusNickname: false,
				focusPassword: false,
				focusPassword2: false,
				logo: "/static/logo.png"
			}
		},
		onReady() {
			this.$refs.form.setRules(this.rules)
		},
		onShow() {
			// #ifdef H5
			document.onkeydown = event => {
				var e = event || window.event;
				if (e && e.keyCode == 13) { //回车键的键值为13
					this.submit()
				}
			};
			// #endif
		},
		methods: {
			/**
			 * 触发表单提交
			 */
			submit() {
				this.$refs.form.validate().then((res) => {
					if (this.formData.captcha.length != 4) {
						this.$refs.captcha.focusCaptchaInput = true
						return uni.showToast({
							title: '请输入验证码',
							icon: 'none',
							duration: 3000
						});
					}
					if (this.needAgreements && !this.agree) {
						return this.$refs.agreements.popup(() => {
							this.submitForm(res)
						})
					}
					this.submitForm(res)
				}).catch((errors) => {
					let key = errors[0].key
					key = key.replace(key[0], key[0].toUpperCase())
					this['focus' + key] = true
				})
			},
			submitForm(params) {
				uniIdCo.registerUser(this.formData).then(e => {
						this.loginSuccess(e)
					})
					.catch(e => {
						//更好的体验：登录错误，直接刷新验证码
						this.$refs.captcha.getImageCaptcha()
					})
			},
			navigateBack() {
				uni.navigateBack()
			},
			toLogin() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
				})
			},
			registerByEmail() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/register/register-by-email'
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	.uni-content {
		min-height: 100vh;
		background: linear-gradient(-45deg, #1a73e8, #2196F3, #03A9F4, #00BCD4);
		background-size: 400% 400%;
		animation: gradientBG 15s ease infinite;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 30px;
		position: relative;
		overflow: hidden;
	}

	@keyframes gradientBG {
		0% {
			background-position: 0% 50%;
		}

		50% {
			background-position: 100% 50%;
		}

		100% {
			background-position: 0% 50%;
		}
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
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		margin-bottom: 50rpx;
		font-weight: bold;
	}

	uni-forms {
		background: rgba(255, 255, 255, 0.15);
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

	.uni-btn {
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(4px);
		border: 1px solid rgba(255, 255, 255, 0.18);
		box-shadow: 0 8rpx 32rpx rgba(31, 38, 135, 0.37);
		border-radius: 10rpx;
		color: white;
		font-weight: bold;
		margin-top: 40rpx;
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.98);
			background: rgba(255, 255, 255, 0.3);
		}
	}

	.register-back {
		margin-top: 20rpx;
		color: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: transparent;

		&:active {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.link {
		color: #fff;
		text-decoration: underline;
	}
</style>

@media screen and (max-width: 690px) {
.uni-content {
margin-top: 15px;
height: 100%;
}
}

@media screen and (min-width: 690px) {
.uni-content {
padding: 30px 40px 60px;
max-height: 530px;
}

.link-box {
/* #ifndef APP-NVUE */
display: flex;
/* #endif */
flex-direction: row;
justify-content: space-between;
margin-top: 10px;
}

.link {
font-size: 12px;
}
}

.uni-content ::v-deep .uni-forms-item__label {
position: absolute;
left: -15px;
}

button {
margin-top: 15px;
}