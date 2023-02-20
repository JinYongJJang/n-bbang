//const Kakao = require('./kakao.js');
//import Kakao from './kakao.js'
const axios = require('axios');
const qs = require('qs')
const env = require('dotenv').config()

module.exports = function(app, dbMgr) {
    this.dbManager = dbMgr;

    const kakao = {
        clientID: '41b3f84964a7994003c66099f35f50b1',
        // redirectUri: 'https://n-bbang.com:53000/auth',
        //redirectUri: 'http://localhost:3000/auth',
        redirectUri: process.env.APP_HOST_URL,
    }
    //console.log(app);
    app.get('/', (req,res) => {
        res.send('test rest api....');
    });
    app.post('/hello/world',(req,res) => {
        console.log(req)

        //console.log(token_info.data);
        //console.log(Kakao.Auth.getAccessToken(req.data.token))
        user = axios({   // 사용자 정보 조회
            method:'get',
            url:'https://kapi.kakao.com/v2/user/me',
            headers:{
                Authorization: `Bearer ${token_info.data.access_token}`
            }
        }).catch(function (error) {
            console.log(error);
        })
        req.session.key = token_info.data.access_token;

        // res.send('우리 집에 왜 왔니');
    })
    app.post('/user/check_password', async (req, res) => {
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            "id" : "hinkim",
            "password" : "secret!"
        }
        */
        console.log("##########call store : " + data);

        let vals = [data.id, data.password];

        let arg = {
            queryId : "check_password",
            values: vals
        }

        retObj = await this.dbManager.execute(arg);

        let check = ""
        if(retObj.isSuccess) {  // 성공
            res.status(200);

            check = new Object();  // JSON 형태로 생성하기 위함
            // ID와 PASSWORD를 이용하여 쿼리 결과가 없으면 현재 비밀번호와 일치하지 않음
            if(retObj.data[0]["check"] == 0 ){
                check.valid = false;
            }
            else{
                check.valid = true;
            }
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(check));  // 현재 비밀번호와 일치할 경우 { check: true } 반환
    });

    app.put('/user/change_password', async (req, res) => {
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            "id" : "hinkim",
            "password" : "secret!"
        }
        */
        console.log("##########call store : " + data);

        let vals = [data.password, data.id];

        let arg = {
            queryId : "change_password",
            values: vals
        }

        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj));
    });



    app.get('/sample/select', async (req,res) => {
        let mypageQuery = "Select_mypage";
        let arg = {
            queryId : mypageQuery,
        }

        let retObj = await this.dbManager.execute(arg);
        console.log('#####retObj : ' + retObj);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        
        res.send(JSON.stringify(retObj));
    })

    app.post('/sample/insert', async (req, res) => {
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            "id" : "hinkim",
            "call" : "010-2727-3633",
            "address" : "관악구",
            "email" : "hinkim@isaac-eng.com",
            "password" : "secret!"
        }
        */
        console.log("##########call store : " + data);

        let vals = [data.id, data.call, data.address, data.email, data.password];

        let arg = {
            queryId : "Insert_mypage",
            values: vals
        }

        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj));
    });
    
    app.delete('/sample/delete', async (req, res) => {
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            "id" : "jhsong"
        }
        */

        let vals = [data.id];

        let arg = {
            queryId : "Delete_mypage",
            values: vals
        }

        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj));
    });

    app.put('/sample/update', async (req, res) => {
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            "id" : "hinkim",
            "call" : "010-2727-3633",
            "address" : "관악구",
            "email" : "hinkim@isaac-eng.com",
            "password" : "secret!"
        }
        */
        console.log("##########call store : " + data);

        let vals = [data.call, data.address, data.email, data.password, data.id];

        let arg = {
            queryId : "Update_mypage",
            values: vals
        }

        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj));
    });

    // Kakao를 통해 로그인하여 인가 정보 취득
    app.get('/auth/login', async(req,res)=>{
        const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code`;
        res.redirect(kakaoAuthURL);
    })

    // Kakao 인가정보를 이용하여 토큰 발행 및 사용자 정보 조회
    app.post('/auth', async(req,res)=>{
        let data = req.body;

        /*
        request body sample:
        {
            "auth" : "NDNKBNDSKJFBK!#@!#~~",
        }
        */

        const result = await axios({  // 토큰 발행
            method: 'POST',
            url: 'https://kauth.kakao.com/oauth/token',
            headers:{
                'Content-type':'application/x-www-form-urlencoded'
            },
            data:qs.stringify({
                grant_type: 'authorization_code',
                client_id: kakao.clientID,
                redirectUri: encodeURIComponent(kakao.redirectUri),  // URI 인코딩 사용
                code: data.auth,  // 인가 정보가 HTTP get 방식으로 날아옴(http://***.co.kr?code=NDNKBNDSKJFBK!#@!#~~)
            })
        })
        res.send(JSON.stringify(result.data));
    });

    // 토큰 유효성 검증
    app.post('/validateAccessToken', async(req,res)=>{
        let authorization = req.headers.authorization;

        /*
        request header sample:
        {
            "authorization" : "YZybGZPbTeU0uZFEH4X33yDv8YJAUNg73cgB-wo9cpgAAAF_ryDUxQ",
        }
        */

        // 토큰 정보 확인
        const token_info = await axios({ 
            method:'get',
            url:'https://kapi.kakao.com/v1/user/access_token_info',
            headers:{
                Authorization: authorization
            }
        })
        // console.log(token_info);
        res.send(JSON.stringify(token_info.data))

    });


    // 새로운 access_token 발급
    app.post('/newAccessToken', async(req,res)=>{
        let refresh = req.headers.refresh;
        refresh = refresh.substring(7, refresh.length);

        
        console.log(kakao)
        /*
        request header sample:
        {
            "authorization" : "YZybGZPbTeU0uZFEH4X33yDv8YJAUNg73cgB-wo9cpgAAAF_ryDUxQ",
            "refresh" : "_eyTKdls5x8vYSRfqOKc7IsHEPAvcb-K9hgtQAo9cpgAAAF_ryDUxA",
        }
        */

        // refresh_token을 이용해 새로운 access_token 발급
        const new_token = await axios({  
            method: 'POST',
            url: 'https://kauth.kakao.com/oauth/token',
            headers:{
                'Content-type':'application/x-www-form-urlencoded'
            },
            data:qs.stringify({
                grant_type: 'refresh_token',
                client_id: kakao.clientID,
                refresh_token : refresh
            })
        })

        res.send(JSON.stringify(new_token.data))

    });

    // Kakao 로그인 시도
    app.post('/signIn', async(req,res)=>{
        //console.log(req.headers);

        let authorization = req.headers.authorization;
        //let authorization_refresh = req.headers.authorization_refresh
        

        await axios({   // 사용자 정보 조회
            method:'get',
            url:'https://kapi.kakao.com/v2/user/me',
            headers:{
                Authorization: authorization
            }
        }).then(async function(user){
            // 카카오 정보
            // { "id": 2110291509, "connected_at": "2022-02-07T07:22:49Z",  "properties": { "nickname": "이진용" }, "kakao_account": { "profile_nickname_needs_agreement": false, "profile": { "nickname": "이진용" } } }
            // DB 조회
            let mypageQuery = "li02_selectUser";
            let arg = {
                queryId : mypageQuery,
                values: [ user.data.id ]  // 식별 정보를 이용해 조회
            }
            let retObj = await this.dbManager.execute(arg);
            console.log('#####retObj : ' + JSON.stringify(retObj));

            if(retObj.isSuccess) {
                if(retObj['data'].length == 1){ // N빵 서비스에 가입이 되어 있다면
                    //GPS 확인페이지로 이동
                    res.status(200);
                    const data = retObj['data'][0]
                    let temp = {
                        'signUp' : false,
                        'kakao_uid' : user.data.id,  // 사용자 식별 정보
                        'kakao_nickname' : user.data.kakao_account.profile.nickname,
                        'icon' : data.icon,
                        'like' : data.like,
                        'dislike' : data.dislike,
                        'last_chat_id' : data.last_chat_id,
                        'curr_chat_id' : data.curr_chat_id,
                        'lat' : data.lat,
                        'lng' : data.lng,
                        'address' : data.address,

                    }
                    res.send(JSON.stringify(temp));
                }
                else{  // N빵 서비스에 가입 안되어 있으면 
                    // 회원 가입 페이지로 이동
                    res.status(200);
                    let temp = {
                        'signUp' : true,
                        'kakao_uid' : user.data.id,  // 사용자 식별 정보
                        'kakao_nickname' : user.data.kakao_account.profile.nickname,
                        'icon' : 0,   //  회원 가입을 했을 때 무조건 0
                        'like' : 0,
                        'dislike' : 0,
                        'last_chat_id' : 0,
                        'curr_chat_id' : 0,
                        'lat' : 0,
                        'lng' : 0,
                        'address' : '',
                    }

                    res.send(JSON.stringify(temp));
                }
            } else {
                //res.status(500);
            }
            
            //res.send(JSON.stringify(retObj));

        }).catch(function (error) {
            console.log(error);
        })
    });


    // 회원 가입
    app.post('/signUp', async(req,res)=>{
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            "kakao_uid" : "2110291509",
            "kakao_nickname" : "진용짱짱",
            "icon" : "1"
        }
        */
        console.log("##########call store : " + data);

        let vals = [data.kakao_uid, data.kakao_nickname, data.icon];

        let arg = {
            queryId : "li03_insertUserData",
            values: vals
        }

        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            //console.log(retObj)
            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj));
    });
 
    // GPS 저장
    app.put('/gps', async(req,res)=>{
        let retObj;
        let data = req.body;
        console.log(data)
        /*
        request body sample:
        {
            "kakao_uid" : "2110291509",
            "lat" : "",
            "lng" : "",
            "address" : ""
        }
        */
        console.log("##########call store : " + data);

        let vals = [data.lat, data.lng, data.address, data.kakao_uid];

        let arg = {
            queryId : "au01_updateGps",
            values: vals
        }

        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        res.send(JSON.stringify(retObj));
    });



    // 지난번 N빵한 이력이 있을 경우 호스트 닉네임 조회
    app.post('/last_chat_id', async(req,res)=>{
        let retObj;
        let data = req.body;
        console.log(data);
        /*
        request body sample:
        {
            "last_chat_id" : "123456789"
        }
        */
        console.log("##########call store : " + data);

        let vals = [data.last_chat_id];

        let arg = {
            queryId : "li04_selectHost",
            values: vals
        }

        retObj = await this.dbManager.execute(arg);

        let temp;
        if(retObj.isSuccess) {
            host_kakao_nickname = data.kakao_nickname

            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj));
    });


    // 좋아요, 싫어요 변경
    app.put('/evaluation', async(req,res)=>{
        let retObj;
        let data = req.body;

        /*
        request body sample:
        {
            "like" : true,
            "dislike" : false,
            "last_chat_id" : '12345679',
            "kakao_uid" : "2110291509"
        }
        */
        console.log("##########call store : " + data);

        // 지난 N빵 평가 시 last_chat_id를 받고,
        // user_data 테이블에 해당 kakao_uid의 좋아요, 싫어요 갯수를 변경
        data.like = data.like? 1 : 0;  // true false 를 1 또는 0으로 변환
        data.dislike = data.dislike? 1 : 0;
        let vals = [data.like, data.dislike, data.last_chat_id];
        let arg = {
            queryId : "li04_updateLike",
            values : vals
        }
        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess){
            vals = [data.kakao_uid];
            arg = {
                queryId : "li04_updateLastChatId",
                values : vals
            }
            retObj = await this.dbManager.execute(arg);
            if(retObj.isSuccess){
                res.status(200);
            }
            else{
                res.status(500);
            }
        }
        else{
            res.status(500);
        }
        res.send(JSON.stringify(retObj));
    });

    /* =============[채팅방 정보 가져오기]===========
        작성자: 송진호
        변수로 넘어온 ChatId를 기반으로, 방 정보 쿼리 후 전달.
    */
    app.get('/mp01/get-curr-info/:ChatId', async (req,res) => {
        let { ChatId } = req.params;
        let mypageQuery = "mp01_currinfo";
        let arg = {
            queryId : mypageQuery,
            values: [ChatId]
        }

        let retObj = await this.dbManager.execute(arg);
        console.log('#####retObj : ' + retObj);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        
        res.send(JSON.stringify(retObj));
    })

    /*
        현재 등록된 방 정보 변경
    */
    app.put('/mp01/update-in-room/', async (req,res) => {
        let data = req.body
        let arg = {
            queryId : "mp01_joinchatUpdate",
            values: [data.chat_id, data.kId]
        }

        let retObj = await this.dbManager.execute(arg);
        console.log('#####retObj : ' + retObj);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        
        res.send(JSON.stringify(retObj));
    })

    app.get('/getCode/:lCode', (req, res) => {
        let { lCode } = req.params;

        this.dbManager.execute({
            queryId: "select_code",
            values: [lCode]
        }).then(result => {
            console.log(`###############code result : ${JSON.stringify(result)} ##`);

            if(result.isSuccess) {
                res.status(200);
            } else {
                res.status(500);
            }
            
            res.send(JSON.stringify(result));
        })
    })
    /* ====[채팅방 리스트 전달]====
        작성자: 송진호
        - Select 카테고리, 위도, 경도, 주문시간, 검색 범위 를 기준으로 쿼리
        - 채팅방 정보 리턴
    */
    app.post('/mp01/chatroom', async(req,res)=>{
        let retObj;
        /*
        request body sample:
        {
            category: 0 or '001'
            km: 1
            lat: 37.3863824
            lng: 126.9648429
            order_time: "2022-3-3 17:36:33"
        }
        */
        let category = (req.body.category == 0) ? '%' : req.body.category;  // if category = 000 > all ELSE category
        let lngmin = req.body.lng - (req.body.km * (1/89));                 // 경도 검색 범위 설정 (1/89) = 약 1km
        let lngmax = req.body.lng + (req.body.km * (1/89));
        let latmin = req.body.lat - (req.body.km * (1/110));                // 위도 검색 범위 설정 (1/110) = 약 1km
        let latmax = req.body.lat + (req.body.km * (1/110));
        let order_time = req.body.order_time;                               // 시간 설정
        let vals = [category,lngmin,lngmax,latmin,latmax,order_time];

        let arg = {
            queryId : "mp01_chatroom",
            values: vals
        }

        retObj = await this.dbManager.execute(arg);

        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj));
    });
    /* ====[채팅방 참가]====
        작성자: 송진호
        - Insert 아이디, 닉네임, 채팅방을 채팅방 참가 리스트.
        - Update 유저 정보에 현재 참여중인 채팅방 .
    */
    app.post('/mp01/joinroom', async(req,res)=>{
        let retObj;
        /*
        request body sample:
        {
            username: '아이디'
            user_id: '카카오 uid'
            chat_id: '채팅방 고유 아이디'
            icon: '사용자 아이콘'
        }
        */
        let vals = [req.body.chat_id,req.body.user_id,req.body.username, req.body.icon];
        
        let arg = {
            queryId : "mp01_joinchatInsert",
            values: vals
        }
        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }

        arg = {
            queryId: "mp01_joinchatUpdate",
            values: vals
        }
        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj));
    });
    /* ====[채팅방 인원 전달]====
        작성자: 송진호
        - Select 채팅방 아이디를 기준으로 참가 중인 인원 수.
        - 전송한 채팅방 아이디의 참가중인 인원수 리턴
    */
    app.get('/mp01/get_chatcurr/:Chat_id', async (req,res) => {
        let mypageQuery = "mp01_chatcurr";
        let { Chat_id } = req.params;
        let arg = {
            queryId : mypageQuery,
            values: [Chat_id]
        }

        let retObj = await this.dbManager.execute(arg);
        console.log('#####retObj : ' + retObj);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        
        res.send(JSON.stringify(retObj));
    })

    // 채팅방 정보 가져오기
    app.post('/listDetail', async(req,res)=>{
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            chat_id: '9'
        }
        */
        let vals = [data.chat_id];
        
        let arg = {
            queryId : "nb01_selectChatId",
            values: vals
        }
        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        res.send(JSON.stringify(retObj));
    });

    // 채팅방에 참여된 사람의 정보 가져오기
    app.post('/enterUser', async(req,res)=>{
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            chat_id: '9'
        }
        */
        let vals = [data.chat_id];
        
        let arg = {
            queryId : "nb01_selectEnterUser",
            values: vals
        }
        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        res.send(JSON.stringify(retObj));
    });

     // 방 만들기
     app.post('/Insert_create_room', async(req,res)=>{
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            "kakao_uid" : "2110291509",
            "kakao_nickname" : "진용짱짱",
            "icon" : "1"
        }
        */
        console.log("Insert_create_room ########## call store : " + JSON.stringify(data,null,2));
        
        // let vals = [data.kakao_uid, data.kakao_nickname, data.icon, data.like, data.dislike, data.lat, data.lng, data.date, data.category, data.member_count, data.pickedSelect, data.shopName, data.hashTag, 000];
        let vals = [...data, '000'];
      
        // console.log("====Insert_create_room====vals====");
        // console.log(vals);
        
        let arg = {
            queryId : "Insert_create_room",
            values: vals
        }

        // console.log("====arg====");
        // console.log(arg);

        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            // console.log("=====retObj=======test")
            // console.log(retObj)
            res.status(200);
        } else {
            res.status(500);
        }

        // console.log("=====JSON.stringify(retObj)=====>");
        // console.log(retObj);
        // console.log(JSON.stringify(retObj));
        
        console.log(JSON.stringify(retObj))
        console.log(res.status)
        // 방 생성 시 자동 참여        
        //  let join_vals = [chat_id, kakao_uid, kakao_nickname, icon];
        let join_vals = [retObj.data.insertId, data[0], data[1], data[2]];
        
        let join_arg = {
            queryId : "mp01_joinchatInsert",
            values: join_vals
        }
        join_retObj = await this.dbManager.execute(join_arg);
        if(join_retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        console.log(res.status)

        join_arg = {
            queryId: "mp01_joinchatUpdate",
            values: join_vals
        }
        join_retObj = await this.dbManager.execute(join_arg);
        if(join_retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        console.log(res.status)
        res.send(JSON.stringify(retObj));
    });

    // 참여 유저 삭제
    app.post('/deleteUser', async(req,res)=>{
        let retObj;
        let data = req.body;
        /*
        request body sample:
        {
            "chat_id": "67"
            'user_id': "2110291509"
        }
        */
        console.log("##########call store : " + data);
        let callSvcs = new Array();

        // 삭제된 사람의 정보를 t_chat 테이블에서 제거
        let vals = [data.chat_id, data.user_id];
        let arg = {
            queryId : "nb01_deleteUser",
            values: vals
        }
        callSvcs.push(this.dbManager.execute(arg))
        
        // 삭제된 사람의 curr_chat_id를 0으로 업데이트
        vals = [ data.user_id ];
        arg = {
            queryId : "nb01_updateCurrentChatId",
            values: vals
        }

        callSvcs.push(this.dbManager.execute(arg))

        // 실행
        retObj = await Promise.all(callSvcs)
        console.log("=========result=======")
        console.log(retObj)
        if(retObj[0].isSuccess && retObj[1].isSuccess) {            
            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj));
    });

    // 모임 방 나가기
    app.put('/exit-room', async (req, res) => {
        let retObj
        let data = req.body

        let vals = [data.chat_id, data.user_id];

        let arg = {
            queryId: "nb01_deleteUser",
            values: vals
        }
        let callSvcs = new Array();
        callSvcs.push(this.dbManager.execute(arg))

        arg = {
            queryId : "mp01_joinchatUpdate",
            values: [0, data.user_id]
        }

        callSvcs.push(this.dbManager.execute(arg))

        retObj = await Promise.all(callSvcs)
        if(retObj[0].isSuccess && retObj[1].isSuccess) {
            //console.log(retObj)
            res.status(200);
        } else {
            res.status(500);
        }

        res.send(JSON.stringify(retObj[0]));
    })

    // 모임 방 완료 처리
    app.put('/finish-room', async (req, res) => {
        let retObj
        let data = req.body
        let success_flag = true

        let vals = [data.fin_code, data.chat_id]

        let arg = {
            queryId: "update_room_state",
            values: vals
        }

        let callSvcs = new Array();
        callSvcs.push(this.dbManager.execute(arg))
        

        // 해당 방에 참여한 모든 사람의 last_chat_id를 변경 해줘야함
        vals = [ data.chat_id ]
        arg = {
            queryId: "nb01_selectEnterUser",
            values: vals
        }
        result = await this.dbManager.execute(arg);
        if(result.isSuccess) {
            for(let i=0; i<result.data.length; i++){
                // 배달 완료의 경우
                if(data.fin_code == '003'){
                    // 방을 생성한 사람이 본인이라면 평가를 하지 않음
                    if(result.data[i].userid == data.host_kakao_uid){
                        vals = [0, 0, result.data[i].userid] 
                    }
                    else{
                        // 방에 참여했을 경우 호스트를 평가하기 위해 host_kakao_uid를 전달함
                        vals = [data.host_kakao_uid, 0, result.data[i].userid]
                    }
                    arg = {
                        queryId: "update_my_room_info",
                        values: vals
                    }
                    callSvcs.push(this.dbManager.execute(arg))
                }
                // data.fin_code == '001'  => 방이 삭제 되었을 경우
                else{
                    vals = [0, 0, result.data[i].userid]
                    arg = {
                        queryId: "update_my_room_info",
                        values: vals
                    }
                    callSvcs.push(this.dbManager.execute(arg))
                }
            }
        }

        retObj = await Promise.all(callSvcs)

        // 모든 쿼리를 실행 했을 때 
        // 하나라도 실패하면 flag를 false로 정의
        for(let i=0; i<retObj.length; i++){
            if(retObj[i].isSuccess == false){
                success_flag = false
            }
        }

        let temp= ''
        if(success_flag == true){
            temp={
                'isSuccess' : true
            }
            res.status(200)
        }
        else{
            temp={
                'isSuccess' : true
            }
            res.status(500)
        }
        res.send(JSON.stringify(temp));
    })


    /* app.get('/data/list', async (req, res) => {
        let where = req.query.bill_no;
        let cPage = req.query.pageNo == null? 1: req.query.pageNo;
        let queryNm = "Select_poc_main_info";
        let totQuery = "Select_poc_main_info_total";
        if (where !=  null) {
            queryNm = "Select_poc_main_info_where";
            totQuery = "Select_poc_main_info_where_total";
        }
        // paging 위한 총 건 수 조회
        let arg = {
            queryId : totQuery,
            values: where,
            currPage: cPage
        }
        let naviInfo  = await this.dbManager.getPageNaviNum(arg);
        naviInfo.cPageNum = cPage;
        // 목록 데이터 조회
        arg = {
            queryId : queryNm,
            values: where, 
            currPage: cPage,
        }
        let retObj = await this.dbManager.execute(arg);
        retObj = Object.assign(retObj, naviInfo);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        res.send(JSON.stringify(retObj));
    });
    app.get('/data/api', async (req, res) => {
        //스캥 입력 일자, 시간 필수
        let where = req.query.wrksqn;
        console.log('#####call api : ' + where);
        if (where ==  null) {   
            res.status(200);
            res.send("[]");
            return;
        }
        let queryNm = "select_poc_main_part";
        let arg = {
            queryId : queryNm,
            values: where
        }
        let retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        res.send(JSON.stringify(retObj.data));
    });
    app.post('/data/store', async (req, res) => {
        let retObj;
        let data = req.body;
        console.log("##########call store : " + data);
        // 송장번호 없을 시, 수행 불가
        if (data == null || data.trspbillnum == null || data.trspbillnum.length < 1) {
            retObj = new Object();
            retObj.isSuccess = false;
            retObj.data = "request body or key value is null.";
            res.status(200);
            res.send(JSON.stringify(retObj));    
            return;
        }
        let vals = [data.wrkdiv, data.wrksqn, data.scndt, data.scnhr, data.trspbillnum, data.fcngbrancd, data.vhcnum, data.dock_id, data.wrkdiv, data.wrksqn, data.scndt, data.scnhr, data.fcngbrancd, data.vhcnum, data.dock_id];
        let arg = {
            queryId : "Upsert_poc_main_info",
            values: vals
        }
        retObj = await this.dbManager.execute(arg);
        if(retObj.isSuccess) {
            res.status(200);
        } else {
            res.status(500);
        }
        res.send(JSON.stringify(retObj));
    }); */
}