'use strict';
//中文分词库 ， 专为 DB Search设计
let seg = {};

//加载依赖模块
const jieba = require("nodejieba");
const qnlp = require("tencent-nlp");
const boson = require("bosonnlp");
const ltp = require("ltp-cloud");
let bnlp;
/* setttings的参数
*  type : "jieba|qnlp|boson|ltp"
*  key :{object} //参数为对应的key
*/
let config = {
    type : "",
    key : ""
};
seg.configure = (settings) => {
    config.type = settings.type || "jieba";
    config.key = settings.key || "";
    //配置云api
    if(config.type == "qnlp"){
        qnlp.configure({
            SecretId : config.key.SecretId,
            SecretKey : config.key.SecretKey,
            Region : config.key.Region
        });
    }else if(config.type = "ltp"){
        ltp.configure({
            api_key : config.key.api_key
        });
    }else if(config.type == "boson"){
        bnlp = boson.BosonNLP(config.key.api_key);
    }
} 
//分词返回接口，采用Callback模式（迎合远程api）
seg.cut = (text,callback) => {
    //如果云api的结果是false,那么依然调用 jieba 的分词接口
    if(config.type == "qnlp"){
        qnlp.seg(text,(err,data) => {
            if(err){
                callback(err);
            }
            if(data == false){
                data = jieba.cut(text);                
            }
            callback(null,data);
        });
    }else if(config.type == "ltp"){
        ltp.cut(text,(err,data) => {
            if(err){
                callback(err);
            }
            if(data == false){
                data = jieba.cut(text);                
            }
            callback(null,data);
        });
    }else if(config.type == "boson"){
        bnlp.tag(text,(data) => {
            /*if(err){
                callback(err);
            }
            我能说什么呢？这破第三方SDK连err都没有...
            */
            data = data[0].word;
            if(data.length == 0){
                data = jieba.cut(text);
            }
            callback(null,data);
        })
    }else{
        let data = jieba.cut(text);
        callback(null,data);
    }
}

module.exports = seg;