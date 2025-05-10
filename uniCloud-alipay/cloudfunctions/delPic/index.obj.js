// 创建云对象
module.exports = {
	_before: function() { // 通用预处理器

	},
	delfile(event) {
		try {
			const res = uniCloud.deleteFile({
				fileList: event // 文件ID数组
			});
			return {
				code: 0,
				message: '文件删除成功',
				data: res
			};
		} catch (error) {
			return {
				code: 1,
				message: '文件删除失败',
				error: error.message
			};
		}

	}
}