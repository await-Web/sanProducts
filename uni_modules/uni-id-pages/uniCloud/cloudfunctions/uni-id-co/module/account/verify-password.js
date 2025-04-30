const {
	userCollection
} = require('../../common/constants')
const PasswordUtils = require('../../lib/utils/password')

module.exports = async function(params = {}) {
	// 验证参数
	if (!params.password) {
		return {
			code: 1,
			message: '密码不能为空'
		}
	}
	const schema = {
		password: 'string'
	}

	const payload = await this.uniIdCommon.checkToken(this.getUniIdToken())
	const uid = payload.uid  
	const userRecord = (await userCollection.doc(uid).get()).data[0]

	if (!userRecord) {
		return {
			code: 2,
			message: '用户不存在'
		}
	}

	// 验证密码
	const passwordUtils = new PasswordUtils({
		userRecord,
		clientInfo: this.getUniversalClientInfo(),
		passwordSecret: this.config.passwordSecret
	})

	const {
		success
	} = passwordUtils.checkUserPassword({
		password: params.password,
		autoRefresh: false
	})

	return {
		code: success ? 0 : 3,
		message: success ? '密码验证成功' : '密码错误'
	}
}