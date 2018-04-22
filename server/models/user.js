var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	"userId" : {type: String},
  	"userName" : String,
  	"userPwd" : String,
  	"orderList" : Array,
  	"cartList" : [{
  		"productId" : String,
	  	"productName" : String,
	  	"salePrice" : Number,
	  	"productImage" : String,
	  	"checked" : String,
	  	"productNum": Number
  	}],
  	"addressList": [{
  		addressId: String,
		userName: String,
		streetName: String,
		postCode: Number,
		tel: Number,
		isDefault: Boolean
  	}]
});

//输出model模型
module.exports = mongoose.model('User',userSchema);	//通过mongoose.model定义一个User
/*commonjs规范*/