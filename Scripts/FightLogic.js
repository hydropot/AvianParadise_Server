var mysql=require("./MysqlManager")

var PlayerList = new Array();
// var PlayerCount=0;
module.exports.StartGame=function(playerInfo){
    PlayerList[playerInfo.Id] = playerInfo;
    // PlayerCount++;
    console.log("开始游戏",PlayerList);

    var roomData=new Array()
    //告知当前房间内其他玩家，谁进来了
    Object.values(PlayerList).forEach(player => {
        roomData.push({Id:player.Id,UserName:player.UserName,Type:player.Type,Species:player.Species})
        
        if(player.Id!=playerInfo.Id){
            player.Socket.emit(EventCode.ServerMsg,Code.Fight,FightCode.Match_OtherEnter,
                {Id:playerInfo.Id,
                UserName:playerInfo.UserName,
                Type:playerInfo.Type,
                Species:playerInfo.Species});
        }
    });
    //告诉新来的玩家，当前房间里都有谁roomData
    playerInfo.Socket.emit(EventCode.ServerMsg,Code.Fight,FightCode.Match_Succ,roomData)
}

// 从 PlayerList 中移除玩家信息
module.exports.RemovePlayer = function(playerInfo) {

    //给房间内所有的玩家发送谁离开了
    Object.values(PlayerList).forEach(player => {
        player.Socket.emit(EventCode.ServerMsg,Code.Fight,FightCode.Match_LeaveSRES,playerInfo.Id)
    });
    delete PlayerList[playerInfo.Id];
    console.log("玩家已移除", PlayerList);
    // PlayerCount--;
}

//位置同步
module.exports.BroadcastPos=function(data){
    var playerId=data.Id;
    Object.values(PlayerList).forEach(playerInfo => {
        //只给其他玩家发送位置数据
        if(playerInfo.Id!=playerId){
            playerInfo.Socket.emit(EventCode.ServerMsg,Code.Fight,FightCode.Pos_SRES,data)
        }
    })
}
//位置初始化
module.exports.BroadcastInitPos=function(data){
    var playerId=data.Id;
    Object.values(PlayerList).forEach(playerInfo => {
        //只给其他玩家发送位置数据
        if(playerInfo.Id!=playerId){
            playerInfo.Socket.emit(EventCode.ServerMsg,Code.Fight,FightCode.Pos_Init_SRES,data)
        }
    })
}
//飞行同步
module.exports.BroadcastFly=function(data){
    var playerId=data;
    Object.values(PlayerList).forEach(playerInfo => {
        //只给其他玩家发送动作数据
        if(playerInfo.Id!=playerId){
            playerInfo.Socket.emit(EventCode.ServerMsg,Code.Fight,FightCode.Fly_SRES,data)
        }
    })
}
//其他动作同步
module.exports.BroadcastMotion=function(data){
    var playerId=data.Id;
    Object.values(PlayerList).forEach(playerInfo => {
        //只给其他玩家发送位置数据
        if(playerInfo.Id!=playerId){
            playerInfo.Socket.emit(EventCode.ServerMsg,Code.Fight,FightCode.Motion_SRES,data)
        }
    })
}

//其他动作同步
module.exports.ChatMessage=function(data){
    //var playerId=data.Id;
    Object.values(PlayerList).forEach(playerInfo => {
        playerInfo.Socket.emit(EventCode.ServerMsg,Code.Fight,FightCode.Chat_RECEIVE,data)
    })
}
