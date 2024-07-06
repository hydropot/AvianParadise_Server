var mysql=require("./MysqlManager")

module.exports.Regist=function(socket,userInfo){
    //判断用户名是否已经存在
    mysql.IsExistUsername(userInfo.Username,function(IsExist){
        if(IsExist){//存在，给客户端已经存在的回应
            console.log("用户名存在")
            socket.emit(EventCode.ServerMsg,Code.Account,AccountCode.Regist_Fail,null)
        }else{//不存在
            //随机一个头像
            //初始化物种名
            var type=0;
            var species=0;
            //向数据库插入消息
            mysql.AddData(type,species,userInfo.Username,userInfo.Pwd,function(result){
                if(result){
                     //给客户端注册成功的回应
                    socket.emit(EventCode.ServerMsg,Code.Account,AccountCode.Regist_Success,null)
                }
                console.log(result)
            })

        }
    })
}

module.exports.Login=function(socket,userInfo,playerInfo){
    //判断用户名是否存在
    mysql.IsExistUsername(userInfo.Username,function(IsExist){
        if(IsExist){//用户名存在
            mysql.Login(userInfo.Username,userInfo.Pwd,function(isSucc,isOnline,info){
                if(isSucc){
                    console.log("用户登录成功",info)

                    playerInfo.Id=info.Id
                    playerInfo.UserName=info.UserName
                    playerInfo.Type=info.Type
                    playerInfo.Species=info.Species

                    socket.emit(EventCode.ServerMsg,Code.Account,
                        AccountCode.Login_Success,info)                   
                }else{
                    if(isOnline){
                        socket.emit(EventCode.ServerMsg,Code.Account,
                            AccountCode.Login_Fail,"用户已在线")
                    }else{
                        socket.emit(EventCode.ServerMsg,Code.Account,
                            AccountCode.Login_Fail,"密码错误")
                    }
                }

            })
            //设置为在线
        }else{//不存在
            socket.emit(EventCode.ServerMsg,Code.Account,AccountCode.Login_Fail,"用户名不存在")
        }
    })
}
module.exports.ChangeSpecies=function(playerInfo,data){
    //console.log("accountlogic: ",data)
    mysql.ChangeSpecies(playerInfo.Id,data.Type,data.Species,function(result){
        if(result){
            playerInfo.Type=data.Type;
            playerInfo.Species=data.Species;
            playerInfo.Socket.emit(EventCode.ServerMsg,Code.Account,AccountCode.ChangeSpecies_SRES,[playerInfo.Type,playerInfo.Species])
        }
    })
}