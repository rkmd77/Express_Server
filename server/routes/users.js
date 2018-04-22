var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');		//获取mongoose来操作数据库
var User = require('../models/user.js');		//加载Goods 模型表

require('./../util/util.js');	//加载时间格式化工具插件

/* GET users listing. */
router.get('/', function(req, res, next) {
  	res.send('respond with a resource');
});

/* GET users info. */
router.post('/login',function(req, res, next){
	//console.log(req.body.userName_query);
	User.findOne({
		userName: req.body.userName_query,
		userPwd: req.body.userPwd_query
	},function(err, userDoc){
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				results: ''
			});
		}
		else{
			if(userDoc){
				/* setup cookie */
				res.cookie('userID', userDoc.userId, {
					path: '/',		//cookie 放在根目录下
					maxAge: 1000*60*60		//设置存储时间1小时
				});
				res.cookie('userName', userDoc.userName, {
					path: '/',		//cookie 放在根目录下
					maxAge: 1000*60*60		//设置存储时间1小时
				});
				/* 存到session里 */
				//req.session.user = userDoc.userId;

				res.json({
					status: '0',
					msg:'',
					results: {
						userName: userDoc.userName
					}
				});
			}
		}
	});
});

//Log out
router.post('/logout',function(req, res, next){
	res.cookie('userID', '', {
		path: '/',
		maxAge: -1
	});
	res.json({
		status: '0',
		msg:'',
		results: ''
	});
});

//Check login to remain login status when user refresh page
router.get('/checkLogin',function(req, res, next){
	if(req.cookies.userID){
		res.json({
			status: '0',
			msg:'',
			results: req.cookies.userName || ''
		});
	}
	else{
		res.json({
			status: '1',
			msg:'User not login',
			results: ''
		});
	}
});

//get cart list info after user login
router.get('/cartlist', function(req, res, next){
	User.findOne({userId: req.cookies.userID}, function(err, doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				results: ''
			});
		}
		else{
			if(doc){
				res.json({
					status: '0',
					msg:'',
					results: doc.cartList
				});
			}
		}
	})
})

//Delete cart item
router.post('/cartDel',function(req, res, next){
	var userID = req.cookies.userID;
	var productID = req.body.productId_query;
	User.update({userId: userID},{
		$pull:{
			'cartList':{
				'productId': productID
			}
		}
	}, function(err, doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				results: ''
			});
		}
		else{
			if(doc){
				res.json({
					status: '0',
					msg:'',
					results: 'Item delected!'
				});
			}
		}
	});
});

//Update cart item quantity
router.post('/editQuantity',function(req, res, next){
	var userID = req.cookies.userID;
	var productID = req.body.productId_query;
	var productNUM = req.body.productNum_query;
	var checkED = req.body.check_query;
	User.update({userId: userID, 'cartList.productId':productID},{
		'cartList.$.productNum': productNUM,
		'cartList.$.checked': checkED
	}, function(err, doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				results: ''
			});
		}
		else{
			if(doc){
				res.json({
					status: '0',
					msg:'',
					results: 'Item Updated!'
				});
			}
		}
	});
});

//Update cart item select all
router.post('/editCheckAll',function(req, res, next){
	var userID = req.cookies.userID,
		checkALL = req.body.checkAll_query?'1':'0';
	User.findOne({userId: userID}, function(err, userDoc){
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				results: ''
			});
		}
		else{
			if(userDoc){
				userDoc.cartList.forEach((item)=>{
					item.checked = checkALL;
				});
				userDoc.save(function(err1, doc1){
					if(err1){
						res.json({
							status: '1',
							msg: err1.message,
							results: ''
						});
					}
					else{
						res.json({
							status: '0',
							msg:'',
							results: 'Item Updated(select all)!'
						});
					}
				});
				
			}
		}
	});
});

//grab user address
router.get('/addressList',function(req, res, next){
	User.findOne({userId: req.cookies.userID}, function(err, doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				results: ''
			});
		}
		else{
			if(doc){
				res.json({
					status: '0',
					msg:'',
					results: doc.addressList
				});
			}
		}
	})
})

//set Default address
router.post('/setDefault', function(req, res, next){
	var addressIdparam = req.body.addressId_query;
	if(!addressIdparam){
		res.json({
				status: '1003',
				msg: 'addressId is null',
				results: ''
			});
	}
	else{
		User.findOne({
			userId: req.cookies.userID
		},function(err, userDoc){
			if(err){
				res.json({
					status: '1',
					msg: err.message,
					results: ''
				});
			}
			else{
				if(userDoc){
					userDoc.addressList.forEach((item)=>{
						if(item.addressId == addressIdparam){
							item.isDefault = true;
						}
						else{
							item.isDefault = false;
						}
					});
					userDoc.save(function(err1, doc1){
					if(err1){
						res.json({
							status: '1',
							msg: err1.message,
							results: ''
						});
					}
					else{
						res.json({
							status: '0',
							msg:'Address set Default!',
							results: ''
						});
					}
				});
				}
			}
		})
	}
})

//Delete address item
router.post('/addressDel',function(req, res, next){
	var userID = req.cookies.userID;
	var addressID = req.body.addressId_query;
	User.update({userId: userID},{
		$pull:{
			'addressList':{
				'addressId': addressID
			}
		}
	}, function(err, doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				results: ''
			});
		}
		else{
			if(doc){
				res.json({
					status: '0',
					msg:'',
					results: 'Address delected!'
				});
			}
		}
	});
});

//Payment
router.post('/payMent', function(req, res, next){
	var userID = req.cookies.userID;
	var addressID = req.body.addressId_query;
	var orderTotalPrice = req.body.orderTotalPrice_query;
	User.findOne({userId: userID}, function(err, userDoc){
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				results: ''
			});
		}
		else{
			//get address info
			var selectAddress = '';
			userDoc.addressList.forEach((item)=>{
				if(item.addressId == addressID){
					selectAddress = item;
				}
			});
			//get confirmed goods list info
			var goodsList = [];
			userDoc.cartList.filter((item)=>{
				if(item.checked == '1'){
					goodsList.push(item);
				}
			});

			var sysDate = new Date().Format('yyyyMMddhhmmss');
			var currentDate = new Date().Format('yyyy-MM-dd hh:mm:ss');

			//establish random order ID
			var platformNumber = '787';
			var r1 = Math.floor(Math.random()*10);
			var r2 = Math.floor(Math.random()*10);
			var randomOrderId = platformNumber+r1+sysDate+r2;

			//create order
			var order = {
				orderId: randomOrderId,
				orderTotalPrice: orderTotalPrice,
				addressInfo: selectAddress,
				goodsList: goodsList,
				orderStatus: '1',
				createDate: currentDate
			}
			userDoc.orderList.push(order);
			userDoc.save(function(err1, doc1){
					if(err1){
						res.json({
							status: '1',
							msg: err1.message,
							results: ''
						});
					}
					else{
						res.json({
							status: '0',
							msg:'Order Created Successfully!',
							results: {
								orderId: order.orderId,
								orderTotalPrice: order.orderTotalPrice
							}
						});
					}
				});
		}
	});
});

//search order details by orderId
router.get('/orderDetail', function(req, res, next){
	User.findOne({userId: req.cookies.userID}, function(err, doc){
		if(err){
			res.json({
				status: '1',
				msg: err.message,
				results: ''
			});
		}
		else{
			var showOrderTotalPrice = 0;
			if(doc.orderList.length>0){
				doc.orderList.forEach((item)=>{
					if(req.param('orderID_query') == item.orderId){
						showOrderTotalPrice = item.orderTotalPrice
					}
				});
				res.json({
					status: '0',
					msg:'',
					results: {
						orderTotalPrice: showOrderTotalPrice
					}
				});
			}
			else{
				res.json({
					status: '1',
					msg:'No Order Found!',
					results: ''
				});
			}
		}
	})
});

//get cart count by Vuex
router.get('/cartCount', function(req, res, next){
	if(req.cookies && req.cookies.userID){
		User.findOne({userId: req.cookies.userID}, function(err, doc){
			if(err){
				res.json({
					status: '1',
					msg: err.message,
					results: ''
				});
			}
			else{
				if(doc){
					let cartCount = 0;
					// doc.cartList.forEach((item)=>{
					// 	cartCount += parseInt(item.productNum);
					// });
					doc.cartList.map(function(item){
						cartCount += parseInt(item.productNum);
					});
					console.log(cartCount);
					res.json({
						status: '0',
						msg:'',
						results: cartCount
					});
				}
			}
		})
	}
});


module.exports = router;
