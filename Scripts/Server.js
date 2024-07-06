require("./Common/EventCode")//在其他脚本里也不需要重复require
require("./Common/Code")
require("./Common/AccountCode")
require("./Common/FightCode")

var accountLogic=require("./AccountLogic")
var fightLogic=require("./FightLogic")

var mysql=require("./MysqlManager")
var server=require("socket.io")(9000);

console.log("server start......")

//官方文档https://socket.io/docs/v4/server-api
server.on(EventCode.Connection,function(socket){//事件码connection，服务器与客户端连接
    //存放当前客户端用户信息
    var PlayerInfo={
        Id:-1,
        UserName:"",
        Type:-1,
        Species:-1,

        Socket:socket,

    }
    console.log("new client connection"+socket)
    
    //客户端断开连接
    socket.on(EventCode.Disconnect,function(reason){
        console.log("cilent disconnect")
        if(PlayerInfo.Id!=-1){//如果登录了
            fightLogic.RemovePlayer(PlayerInfo)
            mysql.OffLine(PlayerInfo.Id)
        }
    })//事件码disconnect，服务器与客户端断开
    
    //接受客户端发来的消息
    socket.on(EventCode.ClientMsg,function(code,opCode,data){
        //console.log(code+opCode+data.Username+data.Pwd+data.Species)
        switch(code){
            case Code.Account:
                if(opCode==AccountCode.Regist_CREQ){//接收到注册请求
                    accountLogic.Regist(socket,data);
                    //判断用户名是否已经存在
                    //存在，给客户端已经存在的相应
                    //不存在 向数据库插入消息
                    //给客户端注册成功的回应
                }
                if(opCode==AccountCode.Login_CREQ){//接收到登录请求
                    accountLogic.Login(socket,data,PlayerInfo);
                }
                if(opCode==AccountCode.ChangeSpecies_CREQ){//选择时修改动物Type与Species
                    accountLogic.ChangeSpecies(PlayerInfo,data);
                }
                break;
            case Code.Match:

                break;
            case Code.Fight:
                if(opCode==FightCode.StartGame){//进入游戏时的玩家数据
                    fightLogic.StartGame(PlayerInfo)
                }
                if(opCode==FightCode.Pos_Init_CREQ){
                    //console.log("Pos_CREQ",data);
                    fightLogic.BroadcastInitPos(data)
                }
                //客户端位置同步
                if(opCode==FightCode.Pos_CREQ){
                    //console.log("Pos_CREQ",data);
                    fightLogic.BroadcastPos(data)
                }
                if(opCode==FightCode.Fly_CREQ){
                    fightLogic.BroadcastFly(data)
                }
                if(opCode==FightCode.Motion_CREQ){
                    fightLogic.BroadcastMotion(data)
                }

                if(opCode==FightCode.Chat_SEND){
                    fightLogic.ChatMessage(data)
                    console.log("发送消息",data);
                }
                break;
        }
    })
})