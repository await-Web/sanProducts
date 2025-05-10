const uniID = require('uni-id-common')

// 提取登录验证函数
const checkLogin = async function() {
	const token = this.getUniIdToken()
	const payload = await this.uniID.checkToken(token)
	if (!payload.uid) {
		return {
			code: -1,
			msg: '用户未登录'
		}
	}
	return payload.uid
}

module.exports = {
	_before: async function() {
		this.uniID = uniID.createInstance({
			clientInfo: this.getClientInfo()
		})
	},
	// 增加商品信息
	async addGoods(params = {}) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})
		// 通过 call(this) 把当前云对象的上下文传递给 checkLogin 函数，保证 this 指向正确
		const uid = await checkLogin.call(this)
		if (typeof uid === 'object') {
			return uid
		}
		return await dbObj.collection('goods-info').add(params)
	},

	// 查找这个用户是否有这个商品
	async findGoods(goods_sn) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})
		const uid = await checkLogin.call(this)
		if (typeof uid === 'object') {
			return uid
		}

		const goodsInfo = await dbObj.collection('goods-info')
			.where({
				goods_sn: goods_sn,
				user_id: uid
			})
			.get()

		if (goodsInfo.data && goodsInfo.data.length > 0) {
			return {
				code: 0,
				msg: '查询成功',
				data: goodsInfo.data[0]
			}
		} else {
			return {
				code: -2,
				msg: '未找到相关商品',
				data: null
			}
		}
	},

	// 删除商品信息
	async removeGoods(params = {}) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})
		const uid = await checkLogin.call(this)
		if (typeof uid === 'object') {
			return uid
		}
		if (params.fileID) {
			const res = await uniCloud.deleteFile({
				fileList: [params.fileID] // 文件ID数组
			});
		}

		return await dbObj.collection('goods-info').doc(params._id).remove()
	},

	// 修改商品信息
	async updateGoods(params = {}) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})
		const uid = await checkLogin.call(this)
		if (typeof uid === 'object') {
			return uid
		}

		if (isNaN(params.goods_price)) {
			return {
				code: -1,
				msg: '商品价格不合法'
			}
		}

		const id = params._id
		delete params._id
		const tempGoodsInfo = {
			...params,
			goods_price: Number(params.goods_price),
			goods_cost: params.goods_cost === '' ? '' : Number(params.goods_cost),
			last_modify_date: new Date().getTime()
		}
		return await dbObj.collection('goods-info').doc(id).update(tempGoodsInfo)
	},
	// 搜索商品
	async searchGoods(params = {}) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})
		const uid = await checkLogin.call(this)
		if (typeof uid === 'object') {
			return uid
		}

		const {
			keyword,
			page = 1,
			pageSize = 10
		} = params
		const skipAmount = (page - 1) * pageSize

		try {
			const result = await dbObj.collection('goods-info')
				.where({
					user_id: uid,
					goods_name: new RegExp(keyword, 'i')
				})
				.skip(skipAmount)
				.limit(pageSize)
				.orderBy('last_modify_date', 'desc')
				.get()

			return {
				code: 0,
				msg: '搜索成功',
				data: result.data
			}
		} catch (err) {
			return {
				code: -2,
				msg: err.message
			}
		}
	},

	// 获取库存充足商品
	async getEnoughGoodsList({
		page = 1,
		pageSize = 20
	}) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		});
		const uid = await checkLogin.call(this);
		if (typeof uid === 'object') {
			return uid;
		}

		try {
			const condition = {
				user_id: uid,
				$or: [{
						goods_threshold: null,
						goods_num: {
							$gt: 0
						}
					},
					{
						goods_threshold: '',
						goods_num: {
							$gt: 0
						}
					},
					{
						goods_num: null
					},
					{
						goods_num: ''
					},
					{
						$and: [{
								goods_threshold: {
									$exists: true,
									$ne: null,
									$ne: ''
								}
							},
							{
								goods_num: {
									$exists: true,
									$ne: null,
									$ne: ''
								}
							},
							{
								$expr: {
									$lt: ["$goods_threshold", "$goods_num"]
								}
							}
						]
					}
				]
			};
			const goodsInfo = await dbObj.collection('goods-info')
				.where(condition)
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.orderBy('last_modify_date', 'desc')
				.get();

			return {
				code: 0,
				msg: '获取成功',
				data: goodsInfo.data
			};
		} catch (error) {
			console.error('获取商品列表失败:', error);
			return {
				code: -2,
				msg: '获取商品列表失败',
				error: error.message
			};
		}
	},

	// 获取缺货商品
	async getStockGoodsList({
		page = 1,
		pageSize = 20
	}) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		});
		const uid = await checkLogin.call(this);
		if (typeof uid === 'object') {
			return uid;
		}

		const condition = {
			user_id: uid,
			$or: [{
					$and: [{
							goods_threshold: {
								$ne: '',
								$exists: true
							}
						},
						{
							goods_num: {
								$ne: '',
								$exists: true
							}
						},
						{
							$expr: {
								$gte: ["$goods_threshold", "$goods_num"]
							}
						}
					]
				},
				{
					goods_num: 0
				}
			]
		};

		try {
			const goodsInfo = await dbObj.collection('goods-info')
				.where(condition)
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.orderBy('last_modify_date', 'desc')
				.get();


			return {
				code: 0,
				msg: '获取成功',
				data: goodsInfo.data
			};
		} catch (error) {
			console.error('获取商品列表失败:', error);
			return {
				code: -2,
				msg: '获取商品列表失败',
				error: error.message
			};
		}
	},

	// 商品出库处理
	async outGoods(outGoodsList = {}) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		});
		const uid = await checkLogin.call(this);
		if (typeof uid === 'object') {
			return uid;
		}

		try {
			const zeroQuantityGoods = [];
			for (const item of outGoodsList) {
				const goodsDoc = await dbObj.collection('goods-info').doc(item._id).field({
					goods_num: true,
					goods_name: true,
					goods_threshold: true
				}).get();
				if (goodsDoc.data && goodsDoc.data.length > 0 && goodsDoc.data[0].goods_num != null && goodsDoc
					.data[0].goods_threshold != null && !isNaN(goodsDoc.data[0].goods_num) && !isNaN(goodsDoc
						.data[0].goods_threshold)) {
					let currentQuantity = goodsDoc.data[0].goods_num;
					const subtractQuantity = item.goods_quantity;
					let flag = 0;
					if (currentQuantity == Math.max(0, currentQuantity - subtractQuantity)) flag = 1;
					currentQuantity = Math.max(0, currentQuantity - subtractQuantity);
					const {
						goods_threshold
					} = goodsDoc.data[0];
					if (goods_threshold !== null && goods_threshold !== undefined && goods_threshold !== '' &&
						currentQuantity <= goods_threshold) {
						zeroQuantityGoods.push(goodsDoc.data[0].goods_name);
					}
					// 是0就不用再更新了
					if (flag == 0) {
						await dbObj.collection('goods-info').doc(item._id).update({
							goods_num: currentQuantity,
							last_modify_date: new Date().getTime()
						});
					}
				} else if (goodsDoc.data && goodsDoc.data.length > 0 && goodsDoc.data[0].goods_num != null && !
					isNaN(goodsDoc.data[0].goods_num)) {
					let currentQuantity = goodsDoc.data[0].goods_num;
					const subtractQuantity = item.goods_quantity;
					let flag = 0;
					if (currentQuantity == Math.max(0, currentQuantity - subtractQuantity)) flag = 1;
					currentQuantity = Math.max(0, currentQuantity - subtractQuantity);
					if (flag == 0) {
						await dbObj.collection('goods-info').doc(item._id).update({
							goods_num: currentQuantity,
							last_modify_date: new Date().getTime()
						});
					}

				}
			}
			return {
				code: 0,
				msg: '商品出库处理成功',
				zeroQuantityGoods
			};
		} catch (e) {
			return {
				code: -2,
				msg: e.message
			};
		}
	},

	// 批量删除商品
	async deleteGoods(params = {}) {
		const dbObj = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		});
		const uid = await checkLogin.call(this);
		if (typeof uid === 'object') {
			return uid;
		}

		try {
			// 获取要删除的商品信息，主要是为了获取图片fileID
			const goodsInfo = await dbObj.collection('goods-info')
				.where({
					_id: dbObj.command.in(params.goods_id_s),
					user_id: uid
				})
				.get();

			// 收集所有需要删除的图片fileID
			const fileIDsToDelete = goodsInfo.data
				.filter(item => item.fileID)
				.map(item => item.fileID);

			// 如果有图片需要删除
			if (fileIDsToDelete.length > 0) {
				await uniCloud.deleteFile({
					fileList: fileIDsToDelete
				});
			}

			// 批量删除商品记录
			await dbObj.collection('goods-info')
				.where({
					_id: dbObj.command.in(params.goods_id_s),
					user_id: uid
				})
				.remove();

			return {
				code: 0,
				msg: '删除成功'
			};
		} catch (error) {
			console.error('批量删除商品失败:', error);
			return {
				code: -2,
				msg: '删除失败',
				error: error.message
			};
		}
	}
}