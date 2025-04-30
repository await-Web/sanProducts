module.exports = {
  setPwd: require('./set-pwd'),
  updatePwd: require('./update-pwd'),
  verifyPassword: require('./verify-password'), // ----
  resetPwdBySms: require('./reset-pwd-by-sms'),
  resetPwdByEmail: require('./reset-pwd-by-email'),
  closeAccount: require('./close-account'),
  getAccountInfo: require('./get-account-info'),
  getRealNameInfo: require('./get-realname-info')
}
