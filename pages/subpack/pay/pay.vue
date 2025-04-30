<template>
	<view class="container">
		<image class="qrcode" src="https://env-00jxt6l7w3we.normal.cloudstatic.cn/showPic/7a22107d9a82d7aefa002bf5f8afae9.jpg" mode="aspectFit"></image>
		<view class="thank-text">如果您觉得不错，欢迎支持一下</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
}
.qrcode {
	height: 50%;
	margin-bottom: 40rpx;
}
.thank-text {
	font-size: 35rpx;
	color: #666;
}
</style>
