<template>
	<view>
		<!-- <ad-custom unit-id="adunit-313f9e52ec3ed514"></ad-custom> -->
		<view class="analysis-container">
			<view>
				<view class="data-time">数据时间: {{ nowDateStr }}</view>
				<view class="section-title">时间区间统计</view>
				<view class="filter-section">
					<text class="filter-label">指标筛选</text>
					<view class="filter-buttons">
						<view :class="['filter-btn', currentChart === 'count' ? 'active' : '']"
							@click="switchChart('count',1)">
							出库次数</view>
						<view :class="['filter-btn', currentChart === 'amount' ? 'active' : '']"
							@click="switchChart('amount',1)">
							出库金额</view>
						<view :class="['filter-btn', currentChart === 'quantity' ? 'active' : '']"
							@click="switchChart('quantity',1)">出库商品数量</view>
					</view>
				</view>
				<view class="chart-container">
					<view class="chart-title">{{ chartTitle }}</view>
					<view v-if="currentChart === 'count'">
						<qiun-data-charts type="line" :chartData="countTimeSlotChartData" :opts="lineOpts" />
					</view>
					<view v-if="currentChart === 'amount'">
						<qiun-data-charts type="line" :chartData="amountTimeSlotChartData" :opts="lineOpts" />
					</view>
					<view v-if="currentChart === 'quantity'">
						<qiun-data-charts type="line" :chartData="quantityTimeSlotChartData" :opts="lineOpts" />
					</view>
				</view>
			</view>

			<!-- 日统计 -->
			<view class="section-container">
				<view class="section-title">日度统计</view>
				<view class="filter-section">
					<text class="filter-label">指标筛选</text>
					<view class="filter-buttons">
						<view :class="['filter-btn', currentChart2 === 'count' ? 'active' : '']"
							@click="switchChart('count',2)">
							出库次数</view>
						<view :class="['filter-btn', currentChart2 === 'amount' ? 'active' : '']"
							@click="switchChart('amount',2)">
							出库金额</view>
						<view :class="['filter-btn', currentChart2 === 'profit' ? 'active' : '']"
							@click="switchChart('profit', 2)">出库利润</view>
						<view :class="['filter-btn', currentChart2 === 'quantity' ? 'active' : '']"
							@click="switchChart('quantity', 2)">出库商品数量</view>
					</view>
				</view>
				<view class="chart-container">
					<view class="chart-title">{{chartTitle2}}</view>
					<view v-if="currentChart2 === 'count'">
						<qiun-data-charts type="column" :chartData="countDailyChartData" :opts="barOpts" />
					</view>
					<view v-if="currentChart2 === 'amount'">
						<qiun-data-charts type="column" :chartData="amountDailyChartData" :opts="barOpts" />
					</view>
					<view v-if="currentChart2 === 'profit'">
						<qiun-data-charts type="column" :chartData="profitDailyChartData" :opts="barOpts" />
					</view>
					<view v-if="currentChart2 === 'quantity'">
						<qiun-data-charts type="column" :chartData="quantityDailyChartData" :opts="barOpts" />
					</view>
				</view>
			</view>

			<!-- 月度统计 -->
			<view class="section-container">
				<view class="section-title">月度统计</view>
				<view class="filter-section">
					<text class="filter-label">指标筛选</text>
					<view class="filter-buttons">
						<view :class="['filter-btn', currentChart3 === 'count' ? 'active' : '']"
							@click="switchChart('count',3)">
							出库次数</view>
						<view :class="['filter-btn', currentChart3 === 'amount' ? 'active' : '']"
							@click="switchChart('amount',3)">
							出库金额</view>
						<view :class="['filter-btn', currentChart3 === 'profit' ? 'active' : '']"
							@click="switchChart('profit', 3)">出库利润</view>
						<view :class="['filter-btn', currentChart3 === 'quantity' ? 'active' : '']"
							@click="switchChart('quantity',3)">出库商品数量</view>
					</view>
				</view>
				<view class="chart-container">
					<view class="chart-title">{{chartTitle3}}</view>
					<view v-if="currentChart3 === 'count'">
						<qiun-data-charts type="column" :chartData="countMonthlyChartData" :opts="barOpts2" />
					</view>
					<view v-if="currentChart3 === 'amount'">
						<qiun-data-charts type="column" :chartData="amountMonthlyChartData" :opts="barOpts2" />
					</view>
					<view v-if="currentChart3 === 'profit'">
						<qiun-data-charts type="column" :chartData="profitMonthlyChartData" :opts="barOpts2" />
					</view>
					<view v-if="currentChart3 === 'quantity'">
						<qiun-data-charts type="column" :chartData="quantityMonthlyChartData" :opts="barOpts2" />
					</view>
				</view>
			</view>
		</view>
		<!-- <ad-custom unit-id="adunit-7d155329659c9931"></ad-custom> -->
	</view>
</template>

<script>
	const outputHistoryObj = uniCloud.importObject('outputHistoryObj2', {
		customUI: true
	});
	export default {
		data() {
			return {
				TimeSlotList: null,
				MonthlyList: null,
				DailyList: null,
				countTimeSlotChartData: null,
				amountTimeSlotChartData: null,
				quantityTimeSlotChartData: null,
				countDailyChartData: null,
				profitDailyChartData: null,
				amountDailyChartData: null,
				quantityDailyChartData: null,
				countMonthlyChartData: null,
				profitMonthlyChartData: null,
				amountMonthlyChartData: null,
				quantityMonthlyChartData: null,
				currentChart: 'count',
				currentChart2: 'count',
				currentChart3: 'count',
				chartTitle: '出库次数统计',
				chartTitle2: '出库次数统计',
				chartTitle3: '出库次数统计',
				nowDateStr: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' +
					String(new Date().getDate()).padStart(2, '0'),
				lineOpts: {
					color: ['#01ce89', '#5f84f7', '#f8a530'],
					padding: [10, 10, 10, 10],
					dataLabel: false,
					dataPointShape: false,
					xAxis: {
						disableGrid: true,
						labelCount: 4
					},
					yAxis: {
						gridType: "dash",
						dashLength: 2,
						data: [{
							tofix: 2
						}]
					},
					extra: {
						line: {
							type: "curve",
							width: 2,
							activeType: "hollow",

						}
					}
				},
				barOpts: {
					color: ['#01ce89'],
					padding: [10, 25, 10, 10],
					dataLabel: false,
					dataPointShape: false,
					xAxis: {
						disableGrid: true,
						labelCount: 5
					},
					yAxis: {
						gridType: "dash",
						dashLength: 2,
						data: [{
							tofix: 2
						}]
					},
					extra: {
						column: {
							width: 5,
							seriesGap: 2,
							type: 'group',
							animation: 'horizontal'
						}
					}
				},
				barOpts2: {
					color: ['#01ce89'],
					padding: [10, 25, 10, 10],
					dataLabel: false,
					dataPointShape: false,
					xAxis: {
						disableGrid: true,
					},
					yAxis: {
						gridType: "dash",
						dashLength: 2,
						data: [{
							tofix: 2
						}]
					},
					extra: {
						column: {
							width: 12,
							seriesGap: 2,
							type: 'group',
							animation: 'horizontal'
						}
					}
				}
			}
		},
		async onReady() {
			try {
				const [resTimeSlot, resMonthly, resDaily] = await Promise.all([
					outputHistoryObj.getTimeSlotStats(),
					outputHistoryObj.getMonthlyStats(),
					outputHistoryObj.getDailyStats()
				])

				this.TimeSlotList = resTimeSlot.data
				this.MonthlyList = resMonthly.data
				this.DailyList = resDaily.data

				console.log('DailyList', this.DailyList)
				this.formatTimeSlotChartData()
				this.formatDailyChartData()
				this.formatMonthlyChartData()
			} catch (error) {
				console.error('数据加载失败:', error)
				uni.showToast({
					title: '数据加载失败',
					icon: 'none'
				})
			}
		},

		methods: {
			switchChart(type, chartType) {
				if (chartType === 1) {
					if (this.currentChart === type) return;
					setTimeout(() => {
						this.currentChart = type;
						switch (type) {
							case 'count':
								this.chartTitle = '出库次数统计';
								break;
							case 'amount':
								this.chartTitle = '出库金额统计';
								break;
							case 'quantity':
								this.chartTitle = '出库商品数量统计';
								break;
						}
					}, 300);
				} else if (chartType === 2) {
					if (this.currentChart2 === type) return;
					setTimeout(() => {
						this.currentChart2 = type;
						switch (type) {
							case 'count':
								this.chartTitle2 = '出库次数统计';
								break;
							case 'amount':
								this.chartTitle2 = '出库金额统计';
								break;
							case 'quantity':
								this.chartTitle2 = '出库商品数量统计';
								break;
							case 'profit':
								this.chartTitle2 = '出库利润统计';
								break;
						}
					}, 300);
				} else if (chartType === 3) {
					if (this.currentChart3 === type) return;
					setTimeout(() => {
						this.currentChart3 = type;
						switch (type) {
							case 'count':
								this.chartTitle3 = '出库次数统计';
								break;
							case 'amount':
								this.chartTitle3 = '出库金额统计';
								break;
							case 'quantity':
								this.chartTitle3 = '出库商品数量统计';
								break;
							case 'profit':
								this.chartTitle3 = '出库利润统计';
								break;
						}
					}, 300);
				}
			},
			formatTimeSlotChartData() {
				const categories = Array.from({
					length: 24
				}, (_, i) => `${i}:00`);
				const dates = Object.keys(this.TimeSlotList)
				const nowDate = new Date()
				const nowHour = nowDate.getHours()
				const nowDateStr = nowDate.toISOString().split('T')[0]
				// console.log('dates', dates)
				// 出库次数图表数据
				const countSeries = dates.map(date => {
					const now = new Date(nowDate);
					const yesterday = new Date(now);
					yesterday.setDate(now.getDate() - 1);
					const sevenDaysAgo = new Date(now);
					sevenDaysAgo.setDate(now.getDate() - 7);

					const flag = date === nowDateStr ? '今天' :
						date === yesterday.toISOString().split('T')[0] ? '昨天' :
						date === sevenDaysAgo.toISOString().split('T')[0] ? '7天前' : '其他日期';

					let dataTmp = this.TimeSlotList[date].map(item => {
						if (flag === '今天' && Number(item.time_slot) > nowHour) {
							return null;
						}
						return item.output_count;
					});

					// console.log('date:', date, 'flag:', flag, 'data:', dataTmp);
					return {
						name: flag,
						data: dataTmp
					};
				})


				this.countTimeSlotChartData = {
					categories,
					series: countSeries
				}


				// 出库金额图表数据
				const amountSeries = dates.map(date => {
					const now = new Date(nowDate);
					const yesterday = new Date(now);
					yesterday.setDate(now.getDate() - 1);
					const sevenDaysAgo = new Date(now);
					sevenDaysAgo.setDate(now.getDate() - 7);

					const flag = date === nowDateStr ? '今天' :
						date === yesterday.toISOString().split('T')[0] ? '昨天' :
						date === sevenDaysAgo.toISOString().split('T')[0] ? '7天前' : '其他日期';

					let dataTmp = this.TimeSlotList[date].map(item => {
						if (flag === '今天' && Number(item.time_slot) > nowHour) {
							return null;
						}
						return parseFloat(item.total_amount);
					});

					return {
						name: flag,
						data: dataTmp
					};
				})
				this.amountTimeSlotChartData = {
					categories,
					series: amountSeries
				}
				console.log('amountSeries', this.amountTimeSlotChartData)
				// 出库商品数量图表数据
				const quantitySeries = dates.map(date => {
					const now = new Date(nowDate);
					const yesterday = new Date(now);
					yesterday.setDate(now.getDate() - 1);
					const sevenDaysAgo = new Date(now);
					sevenDaysAgo.setDate(now.getDate() - 7);

					const flag = date === nowDateStr ? '今天' :
						date === yesterday.toISOString().split('T')[0] ? '昨天' :
						date === sevenDaysAgo.toISOString().split('T')[0] ? '7天前' : '其他日期';

					let dataTmp = this.TimeSlotList[date].map(item => {
						if (flag === '今天' && Number(item.time_slot) > nowHour) {
							return null;
						}
						return item.total_quantity;
					});

					return {
						name: flag,
						data: dataTmp
					};
				})
				this.quantityTimeSlotChartData = {
					categories,
					series: quantitySeries
				}


			},

			formatDailyChartData() {
				const now = new Date();
				const dates = Object.keys(this.DailyList).sort((a, b) => {
					const distanceA = Math.abs(now - new Date(a));
					const distanceB = Math.abs(now - new Date(b));
					return distanceB - distanceA; // 距离远的在前面
				});
				const categories = dates.map(date => date.substring(5).replace('-', '.'))

				this.countDailyChartData = {
					categories,
					series: [{
						name: '出库次数',
						data: dates.map(date => this.DailyList[date].output_count)
					}]
				}

				this.amountDailyChartData = {
					categories,
					series: [{
						name: '出库金额',
						data: dates.map(date => parseFloat(this.DailyList[date].total_amount))
					}]
				}

				this.quantityDailyChartData = {
					categories,
					series: [{
						name: '出库商品数量',
						data: dates.map(date => this.DailyList[date].total_quantity)
					}]
				}

				this.profitDailyChartData = {
					categories,
					series: [{
						name: '出库利润',
						data: dates.map(date => isNaN(this.DailyList[date].total_profit) ? 0 : parseFloat(this
							.DailyList[date].total_profit))
					}]
				}
			},

			formatMonthlyChartData() {
				const now = new Date();
				const months = Object.keys(this.MonthlyList).sort((a, b) => {
					const distanceA = Math.abs(now - new Date(a));
					const distanceB = Math.abs(now - new Date(b));
					return distanceB - distanceA; // 距离远的在前面
				});
				const categories = months.map(month => month.substring(5))

				this.countMonthlyChartData = {
					categories,
					series: [{
						name: '出库次数',
						data: months.map(month => this.MonthlyList[month].output_count)
					}]
				}

				this.amountMonthlyChartData = {
					categories,
					series: [{
						name: '出库金额',
						data: months.map(month => parseFloat(this.MonthlyList[month].total_amount))
					}]
				}

				this.quantityMonthlyChartData = {
					categories,
					series: [{
						name: '出库商品数量',
						data: months.map(month => this.MonthlyList[month].total_quantity)
					}]
				}

				this.profitMonthlyChartData = {
					categories,
					series: [{
						name: '出库利润',
						data: months.map(month => isNaN(this.MonthlyList[month].total_profit) ? 0 : parseFloat(
							this.MonthlyList[month].total_profit))
					}]
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.analysis-container {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;

		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin: 30rpx 0 20rpx 0;
		}

		.section-container {
			margin-top: 40rpx;
		}

		.data-time {
			font-size: 30rpx;
			color: #333;
			font-weight: 500;
			margin-bottom: 30rpx;
			padding: 15rpx 20rpx;
			background-color: #fff;
			border-radius: 12rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		}

		.filter-section {
			display: flex;
			align-items: center;
			margin-bottom: 30rpx;

			.filter-label {
				font-size: 28rpx;
				color: #666;
				margin-right: 20rpx;
			}

			.filter-buttons {
				display: flex;
				gap: 20rpx;
			}

			.filter-btn {
				padding: 10rpx 20rpx;
				background-color: #fff;
				border-radius: 6rpx;
				font-size: 26rpx;
				color: #666;
				transition: all 0.3s ease;
				box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.03);

				&.active {
					background-color: #01ce89;
					color: #fff;
					transform: scale(1.05);
				}
			}
		}

		.chart-container {
			padding: 15rpx;
			background: #fff;
			border-radius: 12rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
			transition: all 0.3s ease;
			min-height: 600rpx;

			&.fade {
				opacity: 0;
				transform: translateY(10rpx);
			}

			.chart-title {
				font-size: 32rpx;
				font-weight: bold;
				margin-bottom: 30rpx;
				color: #333;
				text-align: center;
			}
		}
	}
</style>