const utils = require('self-uid')
module.exports = {
	_before: async function () { // 通用预处理器
		this.userInfo = await utils.getUserInfo(this)
	},
	
	/**
	 * 发送消息给所有用户
	 * @param {string} title 消息标题
	 * @param {string} content 消息内容
	 * @returns {object} 返回结果
	 */
	async sendToAll(title, content) {
		// 参数校验
		if (!title || !content) {
			return {
				errCode: 'PARAM_IS_NULL',
				errMsg: '标题和内容不能为空'
			}
		}
		

		if (this.userInfo.role!='admin') {
			return {
				errCode: 'NO_PERMISSION',
				errMsg: '无权限发送消息'
			}
		}
		
		// 添加消息记录
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})
		const result = await dbObj.collection('msg-to-user').add({
			title,
			content
		})
		
		return {
			errCode: 0,
			errMsg: '发送成功',
			msgId: result.id
		}
	},

	/**
	 * 删除
	 * @param {string} msgId 消息ID
	 * @returns {object} 返回结果
	*/
	deleteMessage(msgId) {
		if (this.userInfo.role!='admin') {
			return {
				errCode: 'NO_PERMISSION',
				errMsg: '无权限删除消息'
			}
		}	
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()	
		})

		const result = dbObj.collection('msg-to-user').where({
			_id: msgId
		}).remove()

		return {
			errCode: 0,
			errMsg: '删除成功'
		}
	},
	
	/**
	 * 获取的消息列表
	 * @param {number} pageSize 每页显示条数，默认10
	 * @param {number} pageIndex 当前页码，从1开始
	 * @returns {object} 返回消息列表和分页信息
	 */
	async getMessages(pageSize = 10, pageIndex = 1) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})
		
		// 获取总记录数
		const countResult = await dbObj.collection('msg-to-user').count()
		const total = countResult.total
		
		// 计算分页参数
		const skip = (pageIndex - 1) * pageSize
		
		// 查询数据
		const messages = await dbObj.collection('msg-to-user')
			.orderBy('create_date', 'desc')
			.skip(skip)
			.limit(pageSize)
			.get()

		return {
			errCode: 0,
			errMsg: '获取成功',
			data: {
				list: messages.data,
				pageSize,
				pageIndex,
				total
			}
		}
	},

	/**	
	 * 获取目前管理者发布的消息数量
	 * @returns {Number} 返回消息数量
	 */
	async getMsgCount() {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()	
		})	
		const result = await dbObj.collection('msg-to-user').count()

		return result.total
	}
}
