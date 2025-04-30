const uniID = require('uni-id-common')

const getUserInfo = async function(that){
	const token = that.getUniIdToken()
	const clientInfo = that.getClientInfo()
	const uniIDIns = uniID.createInstance({
		clientInfo
	})
	return await uniIDIns.checkToken(token)
}

module.exports = {
	getUserInfo
}

