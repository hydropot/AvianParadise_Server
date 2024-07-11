var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1111',
  database : 'shootgame'
});
 
connection.connect(function(error,result) {
    if (error==null) {
        console.log("连接数据库成功");
    }
});
//SQL服务器在空闲大约8小时至12小时后似乎会断开SQL连接https://stackoverflow.com/questions/70645884/error-packets-out-of-order-got-0-expected-3
//每小时ping一下mysql服务器以解决断联问题
setInterval(function() {
    connection.query('SELECT 1', function(error, results, fields) {
        if (error) {
            console.error("Error pinging database:", error.message);
            return;
        }
        console.log("Database pinged successfully");
    });
}, 3600000); // 3600000ms=1h

//判断用户名是否存在
module.exports.IsExistUsername=function(username,callback){
    var  sql = 'SELECT * FROM userinfo WHERE UserName=?';
    var sqlParams=[username]
    //查
    connection.query(sql,sqlParams,function (err, result) {
        if(err){
            callback(false)
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        if(result.length==0){//用户名不存在
            callback(false)
        }else{//用户名存在
            callback(true)
        }
    });
}
//插入一条数据
module.exports.AddData=function(type,species,username,pwd,callback){
    var sql='INSERT INTO userinfo(type,species,username,pwd,online) VALUES(?,?,?,?,?)'
    var sqlParams=[type,species,username,pwd,0]
    connection.query(sql,sqlParams,function(err,result){
        if(err){
            callback(false)
            console.log('[INSERT ERROR]',err.message);
            return
        }
        callback(true)
    })
}

//（用户名存在时）登录逻辑
module.exports.Login=function(username,pwd,callback){
    //callback两个参数分别为（是否登录成功，是否在线,用户信息）
    var  sql = 'SELECT * FROM userinfo WHERE UserName=? AND pwd=?';//查询用户名，密码
    var sqlParams=[username,pwd]
    connection.query(sql,sqlParams,function (err, result) {//result=1为能查询到，0为查询不到   
        if(err){//登录出错
            console.log("Login Error"+err.message);
            return;
        }
        if(result.length>0){//密码匹配
            if(result[0].Online==0){//不在线
                //执行上线操作
                var updateSql="UPDATE userinfo SET online=1 WHERE id=?"//online更新为1
                var updateSqlParams=[result[0].Id]
                connection.query(updateSql,updateSqlParams,function(err,update_result){
                    if(err){//上线出错
                        console.log("UPDATE Online ERROR"+err.message)
                        return;
                    }
                    //上线成功
                    callback(true,false,result[0])//登录t，在线f
                })
            }else{//已经在线
                callback(false,true,null)//登录f，在线t
            }
        }else{//密码错误
            callback(false,false,null)//登录f，在线f
        }
    })
}

module.exports.OffLine=function(id){
    var sql='UPDATE userinfo SET online=0 WHERE id=?'
    var sqlPrama=[id]
    connection.query(sql,sqlPrama,function(err,result){
        if(err){
            console.log("Offline ERROR"+err.message)
            return;
        }
    })
}
module.exports.ChangeSpecies=function(playerId,type,species,callback){
    var sql='UPDATE userinfo SET Type=?,Species=? WHERE Id=?'
    var sqlPrama=[type,species,playerId]
    //console.log("mysqlmanager: ",sqlPrama);
    connection.query(sql,sqlPrama,function(err,result){
        if(err){
            callback(false)
            console.log("UPDATE Species ERROR"+err.message)
            return;
        }
        callback(true)
    })

}