module.exports = {
	// 删除用户下所有商品信息
	async delAllInfo() {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})

		try {
			// 获取用户所有商品信息
			const goodsInfo = await dbObj.collection('goods-info')
				.where('user_id==$env.uid')
				.get();
			// 收集所有需要删除的图片fileID
			const fileIDsToDelete = goodsInfo.data.map(item => item.goods_pic?.fileID).filter(fileID =>
				fileID !== undefined);
			// 如果有图片需要删除
			if (fileIDsToDelete.length > 0) {
				const res = await uniCloud.deleteFile({
					fileList: fileIDsToDelete
				});
			}

			// 删除所有商品记录
			await dbObj.collection('goods-info')
				.where('user_id==$env.uid')
				.remove();

			return {
				code: 0,
				msg: '删除成功'
			};
		} catch (error) {
			return {
				code: -2,
				msg: '删除失败',
				error: error.message
			};
		}
	}
}