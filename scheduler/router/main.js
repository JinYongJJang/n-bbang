//const Kakao = require('./kakao.js');
//import Kakao from './kakao.js'
//const axios = require('axios');
const env = require('dotenv').config()


// 시간 형식 변경 함수
// 2022-03-23T06:26:02.289Z ->  2022-03-23 15:26:02   로 변경
function dateFormat(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;
    second = second >= 10 ? second : '0' + second;

    return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}


// 1시간 내 만료된 채팅방 리스트를 검색하고
// 검색된 채팅방에 참여한 사람의 리스트를 가져온다
async function select_1hour_list(){
    let newTime = new Date()
    let newTime2 = new Date()

    // 1시간 전 계산
    newTime.setHours(newTime.getHours() - 1)

    let beforeTime = dateFormat(newTime);
    let currentTime = dateFormat(newTime2);
    
    //  ** t_chat **                                    RIGHT OUTER JOIN       ** chat_fixed **
    //  |chatid    |user_id    |username   |                                   |chat_id     |host_kakao_uid     |
    //  |101        |2148084993 |김혜인     |                                   |101        |2123940641         |
    //  |101        |2110291509 |이진용     |                                   |102        |2148084993         |
    //  |102        |2123940641 |궁정원     |                                   |103        |2110291509         |
    //  |103        |2163933666 |이다민     |

    // =>   |user_id    |host_kakao_uid |
    //      |2148084993 |2123940641     |   (101)
    //      |2110291509 |2123940641     |   (101)
    //      |2123940641 |2148084993     |   (102)
    //      |2163933666 |2110291509     |   (103)
    let vals = [beforeTime, currentTime];
    let arg = {
        queryId : "select_1hour_list",
        values: vals
    }
    let chatList = await this.dbManager.execute(arg);

    return chatList;
}


// 참여한 사람의 last_chat_id에 호스트의 uid를 update함
async function update_last_chat_id(chatList){
    let user_id = ""
    let host_kakao_uid = ""
    console.log(chatList)
    for(let i = 0; i<chatList.data.length; i++){
        user_id = chatList.data[i].userid;
        host_kakao_uid = chatList.data[i].host_kakao_uid;        

        // 호스트일 경우 평가없이 curr_chat_id만 0으로 변경
        if(host_kakao_uid == user_id){
            let vals = [user_id];
            let arg = {
                queryId : "update_curr_chat_id",
                values: vals
            }
            let result = await this.dbManager.execute(arg);
            console.log("I'm Host");
            console.log(result)
        }
        // 참여자일 경우 last_chat_id와 curr_chat_id를 변경
        else{
            let vals = [host_kakao_uid, user_id];
            let arg = {
                queryId : "update_last_chat_id",
                values: vals
            }
            let result = await this.dbManager.execute(arg);
            console.log(result)
        }
    }
}



module.exports = async function(dbMgr) {
    this.dbManager = dbMgr;

    

    setInterval(async function(){
        let chatList = await select_1hour_list()
        update_last_chat_id(chatList)
    }, 3600000)
}
