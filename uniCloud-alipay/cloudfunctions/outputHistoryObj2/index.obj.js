const uniID = require('uni-id-common')
const utils = require('self-uid')
const $ = uniCloud.database().command.aggregate
module.exports = {
	_before: async function() {
		this.userInfo = await utils.getUserInfo(this)
	},

	/**
	 * 创建出库记录
	 * @param {Object} params 包含出库信息的对象
	 * @returns {Object} 创建结果
	 */
	async createOutputRecord(params) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})

		const now = new Date()
		const hour = now.getHours()
		const timeSlot = `${hour}`
		const date = now.toISOString().split('T')[0]
		const month = date.substring(0, 7)

		const record = {
			user_id: this.userInfo.uid,
			items: params.items,
			total_quantity: params.total_quantity,
			total_amount: params.total_amount,
			total_profit: params.total_profit,
			time_slot: timeSlot,
			date,
			month
		}

		try {
			const result = await dbObj.collection('output-history').add(record)
			return result
		} catch (e) {
			return e
		}
	},

	/**
	 * 当天的时间段统计数据
	 * 格式：YYYY-MM-DD
	 * @returns {Object} 统计结果
	 */
	async getTimeSlotStats() {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})

		try {
			const today = new Date();
			const oneDayAgo = new Date(today);
			oneDayAgo.setDate(today.getDate() - 1);
			const sevenDaysAgo = new Date(today);
			sevenDaysAgo.setDate(today.getDate() - 7);

			const formatDate = (date) => date.toISOString().split('T')[0];

			const dates = [
				formatDate(today),
				formatDate(oneDayAgo),
				formatDate(sevenDaysAgo)
			];

			const statsPromises = dates.map(date => {
				return dbObj.collection('output-history')
					.aggregate()
					.match({
						user_id: this.userInfo.uid,
						date
					})
					.group({
						_id: '$time_slot',
						output_count: $.sum(1),
						total_amount: $.sum('$total_amount'),
						total_quantity: $.sum('$total_quantity'),
						date: {
							$first: '$date'
						}
					})
					.sort({
						_id: 1
					})
					.end();
			});

			const results = await Promise.all(statsPromises);

			const statsByDate = {};
			dates.forEach((date, index) => {
				// 生成所有可能的时间段 (0-1, 1-2, ..., 23-24)
				const allTimeSlots = Array.from({
					length: 24
				}, (_, i) => `${i}`);

				// 创建默认值为0的所有时间段
				const defaultStats = allTimeSlots.map(timeSlot => ({
					time_slot: timeSlot,
					output_count: 0,
					total_amount: '0.00',
					total_quantity: 0
				}));

				// 合并数据库结果和默认值
				const dbResults = results[index].data.map(item => ({
					time_slot: item._id,
					output_count: item.output_count,
					total_amount: item.total_amount.toFixed(2),
					total_quantity: item.total_quantity
				}));

				// 用数据库结果覆盖默认值中对应的项
				statsByDate[date] = defaultStats.map(defaultItem => {
					const dbItem = dbResults.find(dbItem => dbItem.time_slot === defaultItem
						.time_slot);
					return dbItem || defaultItem;
				});
			});

			return {
				success: true,
				data: statsByDate
			};
		} catch (e) {
			return {
				errCode: 'GET_STATS_FAILED',
				errMsg: '获取统计数据失败',
				error: e
			}
		}
	},

	/**
	 * 月度对比，出库次数、出库金额、出库数量、总利润
	 * 格式：YYYY-MM ，本月和前6个月的对比
	 * @returns {Object} 统计结果
	 */
	async getMonthlyStats() {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})

		try {
			const currentMonth = new Date()
			const months = []
			for (let i = 0; i < 7; i++) {
				const date = new Date(currentMonth)
				date.setMonth(currentMonth.getMonth() - i)
				months.push(date.toISOString().substring(0, 7))
			}

			const statsPromises = months.map(month => {
				return dbObj.collection('output-history')
					.aggregate()
					.match({
						user_id: this.userInfo.uid,
						month
					})
					.group({
						_id: '$month',
						output_count: $.sum(1),
						total_profit: $.sum('$total_profit'),
						total_amount: $.sum('$total_amount'),
						total_quantity: $.sum('$total_quantity')
					})
					.end()
			})

			const results = await Promise.all(statsPromises)
			const statsByMonth = {}
			months.forEach((month, index) => {
				statsByMonth[month] = {
					output_count: results[index].data[0]?.output_count || 0,
					total_amount: results[index].data[0]?.total_amount?.toFixed(2) || '0.00',
					total_profit: results[index].data[0]?.total_profit?.toFixed(2) || '0.00',
					total_quantity: results[index].data[0]?.total_quantity || 0
				}
			})
			return {
				success: true,
				data: statsByMonth
			}
		} catch (e) {
			return {
				errCode: 'GET_MONTHLY_STATS_FAILED',
				errMsg: '获取月度统计数据失败',
				error: e
			}
		}
	},

	/**
	 * 每日对比，出库次数、出库金额、出库数量
	 * 格式：YYYY-MM-DD 今天和前30天的对比
	 * @returns {Object} 统计结果
	 */
	async getDailyStats() {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})

		try {
			const today = new Date()
			const dates = []
			for (let i = 0; i < 31; i++) {
				const date = new Date(today)
				date.setDate(today.getDate() - i)
				dates.push(date.toISOString().split('T')[0])
			}

			const statsPromises = dates.map(date => {
				return dbObj.collection('output-history')
					.aggregate()
					.match({
						user_id: this.userInfo.uid,
						date
					})
					.group({
						_id: '$date',
						output_count: $.sum(1),
						total_amount: $.sum('$total_amount'),
						total_profit: $.sum('$total_profit'),
						total_quantity: $.sum('$total_quantity')
					})
					.end()
			})

			const results = await Promise.all(statsPromises)
			const statsByDate = {}
			dates.forEach((date, index) => {
				statsByDate[date] = {
					output_count: results[index].data[0]?.output_count || 0,
					total_amount: results[index].data[0]?.total_amount?.toFixed(2) || '0.00',
					total_profit: results[index].data[0]?.total_profit?.toFixed(2) || '0.00',
					total_quantity: results[index].data[0]?.total_quantity || 0
				}
			})

			return {
				success: true,
				data: statsByDate
			}
		} catch (e) {
			return {
				errCode: 'GET_DAILY_STATS_FAILED',
				errMsg: '获取每日统计数据失败',
				error: e
			}
		}
	},

	/**
	 * 出库记录列表
	 * @param {Object} params 用于历史记录页面记录每天的出库记录，包含分页信息，默认每页10条
	 * @param {Number} params.page 页码，默认为1
	 * @param {Number} params.size 每页记录数，默认为10
	 * @param {String} params.date 日期，格式为YYYY-MM-DD，默认为当天
	 * @returns {Object} 出库记录列表
	 */
	async getOutputRecords(params = {}) {
		const {
			page = 1, size = 10, date = new Date().toISOString().split('T')[0]
		} = params

		// 参数验证
		if (!Number.isInteger(page) || page < 1) {
			return {
				errCode: 'INVALID_PAGE',
				errMsg: '页码必须是大于0的整数'
			}
		}

		if (!Number.isInteger(size) || size < 1 || size > 50) {
			return {
				errCode: 'INVALID_SIZE',
				errMsg: '每页记录数必须是1-50之间的整数'
			}
		}

		const dateRegex = /^\d{4}-\d{2}-\d{2}$/
		if (!dateRegex.test(date)) {
			return {
				errCode: 'INVALID_DATE',
				errMsg: '日期格式必须为YYYY-MM-DD'
			}
		}

		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})

		try {
			// 查询总记录数
			const countResult = await dbObj.collection('output-history')
				.where({
					user_id: this.userInfo.uid,
					date
				})
				.count()

			const total = countResult.total
			const totalPages = Math.ceil(total / size)

			// 如果没有记录，直接返回空数组
			if (total === 0) {
				return {
					success: true,
					data: {
						list: [],
						pagination: {
							page,
							size,
							total,
							totalPages
						}
					}
				}
			}

			// 查询记录列表
			const records = await dbObj.collection('output-history')
				.where({
					user_id: this.userInfo.uid,
					date
				})
				.skip((page - 1) * size)
				.limit(size)
				.orderBy('create_time', 'desc')
				.get()


			return {
				success: true,
				data: {
					list: records.data,
					pagination: {
						page,
						size,
						total,
						totalPages
					}
				}
			}
		} catch (e) {
			return {
				errCode: 'GET_RECORDS_FAILED',
				errMsg: '获取出库记录失败',
				error: e
			}
		}
	}
}