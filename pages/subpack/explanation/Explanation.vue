<template>
	<view class="container">
		<!-- 标题 -->
		<view class="title">
			<text class="h1">文档使用说明</text>
		</view>
		<!-- 一、文档概述 -->
		<view class="section">
			<text class="h2">一、文档概述：</text>
			<br />
			<text class="p">该文档名为 ImportModel.xlsx，作为导入商品信息模板。</text>
			<button class="btn" @tap="copyText">点击获取下载连接</button>
		</view>
		<!-- 二、工作表结构 -->
		<view class="section">
			<text class="h2">二、查重覆盖规则说明：</text>
			<br />
			<text class="p">导入时，先按商品条形码查询是否有重复商品，有则覆盖；无条形码，再按商品名称查询，有重复同样覆盖，都无重复才作为新数据导入。
			</text>

		</view>

		<view class="section">

			<view class="table">
				<view class="table-header">
					<view class="table-cell">列名</view>
					<view class="table-cell">含义</view>
				</view>
				<view class="table-body">
					<view class="table-row" v-for="(row, index) in tableBody" :key="index">
						<view class="table-cell">
							<text :class="{ bold: row.isBold }">{{ row.name }}</text>
						</view>
						<view class="table-cell">{{ row.desc }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tableBody: [{
						name: '商品条形码 (选填)',
						desc: '用于唯一标识商品的条形码信息。用于商品的识别操作。',
						isBold: true
					},
					{
						name: '商品名称(必填)',
						desc: '商品的具体名称，方便直观地了解商品内容。',
						isBold: true
					},
					{
						name: '商品价格(必填，填数字且大于等于零)',
						desc: '记录商品的销售价格信息。',
						isBold: true
					},{
						name: '商品成本(选填，填数字且大于等于零)',
						desc: '记录商品的进货成本。',
						isBold: true
					},{
						name: '商品库存(选填，填大于等于0的整数)',
						desc: '记录商品的数量。',
						isBold: true
					},
					{
						name: '商品缺货提醒阈值(选填，填大于等于0的整数)',
						desc: '商品库存低于该值会有提醒。',
						isBold: true
					},
					{
						name: '商品备注(选填)',
						desc: '可填写关于商品的额外信息，如商品的特性、使用说明、注意事项等补充内容。',
						isBold: true
					}
				]
			};
		},
	
		methods:{
			copyText() {
			      uni.setClipboardData({
			        data: 'https://env-00jxt6l7w3we.normal.cloudstatic.cn/model/ImpostModel.xlsx',
			        success() {
			          uni.showToast({
			            title: '复制成功',
			            icon: 'none'
			          });
			        },
			        fail(err) {
			          uni.showToast({
			            title: '复制失败',
			            icon: 'none'
			          });
			          console.error('复制失败', err);
			        }
			      });
			    }
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		padding: 20rpx;
		background-color: #f8f8f8;
	}
	.btn{
		margin: 24rpx 0;
		border: 1px solid #000;
	}
	.title {
		text-align: center;
		margin-bottom: 30rpx;
		font-size: 40rpx;
	}

	.section {
		margin-bottom: 31rpx;
	}

	.h1 {
		font-size: 37rpx;
		color: #333;
	}

	.h2 {
		font-size: 37rpx;
		color: #555;
		margin-top: 30rpx;
		margin-bottom: 15rpx;
	}

	.p {
		font-size: 37rpx;
		color: #666;
	}

	.img {
		width: 100%;
		margin-top: 20rpx;
		margin-bottom: 40rpx;
	}

	.table {
		width: 100%;
	}

	.table-header {
		display: flex;
		border-bottom: 1rpx solid #ccc;
		font-weight: bold;
		padding-bottom: 8rpx;
	}

	.table-body {
		width: 100%;
	}

	.table-row {
		display: flex;
		border-bottom: 1rpx solid #ccc;
		padding: 13rpx 0;
	}

	.table-cell {
		flex: 1;
		text-align: left;
	}

	.bold {
		font-weight: bold;
	}
</style>