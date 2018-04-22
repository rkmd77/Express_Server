var mongoose = require('mongoose');
var Schema = mongoose.Schema;	//通过mongoose获取表模型

var productSchema = new Schema({
	"productId" : {type: String},
  	"productName" : String,
  	"salePrice" : Number,
  	"productImage" : String,
  	"productUrl" : String
});

//输出model模型
module.exports = mongoose.model('Good',productSchema);	//通过mongoose.model定义一个商品Good,模型就是productSchema，