var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');		//获取mongoose来操作数据库
var Goods = require('../models/goods.js');		//加载Goods 模型表

//连接MongoDB 数据库
mongoose.connect('mongodb://127.0.0.1:27017/vueshop');
//监听连接状态
mongoose.connection.on('connected', function(){
	console.log("MongoDB connected successfully!");
});
mongoose.connection.on('error', function(){
	console.log("ERROR~~~ MongoDB connected error!");
});
mongoose.connection.on('disconnected', function(){
	console.log("Opps~~~ MongoDB disconnected !");
});



/* GET goods listing. 属于二级路由 */ 
router.get('/list', function(req, res, next) {
  //res.send('goods list db connected');	//测试连接，已通

  // 带查询参数(前端传递的)
	let page = parseInt(req.param("page_query"));		/*/这里使用的是req.param获取参数，这个是Express框架封装的/*/
	let pageSize = parseInt(req.param("pageSize_query"));
	let sort = req.param("sort_query");

  let priceLevel = req.param("priceLevel");

	let skip = (page-1)*pageSize;
	let params = {};

  var priceGt = '', priceLte = '';
  if(priceLevel!='all'){
    switch(priceLevel){
      case '0': priceGt = 0; priceLte = 100; break;
      case '1': priceGt = 100; priceLte = 500; break;
      case '2': priceGt = 500; priceLte = 1000; break;
      case '3': priceGt = 1000; priceLte = 5000; break;
    }
    params = {
      salePrice:{
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }

	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);	//find方法返回一个模型,后面是通用分页方法

	goodsModel.sort({'salePrice': sort});	//MongoDB是Nosql,只能解析object, sort方法排序，1升序，-1降序
	goodsModel.exec(function(err, doc){		//exec执行，不需要带参数
  	if(err){
  		res.json({
  			status: 1,
  			msg: err.message
  		});
  	}
  	else{
  		res.json({
  			status: 2,
  			msg: '',
  			results: {
  				count: doc.length,
  				list: doc
  			}
  		});
  	}
  });
});

//加入到购物车
router.post('/addCart', function(req, res, next){
  let userId_query = '100000077';
  let productId_query = req.body.productId_query;
  let User = require('../models/user.js');
  User.findOne({userId: userId_query}, function(err1, userDoc) {
    if(err1){
      res.json({
        status: '1',
        msg: err1.message
      })
    }
    else{
      if(userDoc){
        let goodsItem = '';
        userDoc.cartList.forEach(function(item){
          if(item.productId == productId_query){
            goodsItem = item;
            item.productNum++;
          }
        });
        if(goodsItem){
          userDoc.save(function(err3, newDoc){
                if(err3){
                  res.json({
                    status: '1',
                    msg: err3.message
                  })
                }
                else{
                  res.json({
                    status: '0',
                    msg: '',
                    results: 'successfully added!'
                  })
                }
              });
        }
        else{
          Goods.findOne({productId:productId_query}, function(err2, goodsDoc) {
            var newobj = null;//新对象
            if(err2){
              res.json({
                status: '1',
                msg: err2.message
              })
            }
            else{
              if(goodsDoc){
                newobj = {//新创建一个对象，实现转换mongoose不能直接增加属性的坑
                  productNum: 1,
                  checked: "1",
                  productId: goodsDoc.productId,
                  producName: goodsDoc.producName,
                  salePrice: goodsDoc.salePrice,
                  productName: goodsDoc.productName,
                  productImage: goodsDoc.productImage,
               }
                userDoc.cartList.push(newobj);
                userDoc.save(function(err3, newDoc){
                  if(err3){
                    res.json({
                      status: '1',
                      msg: err3.message
                    })
                  }
                  else{
                    res.json({
                      status: '0',
                      msg: '',
                      results: 'successfully added!'
                    })
                  }
                });
              }
            }
        });
        }
        
      }
    }
  });
});

module.exports = router;
