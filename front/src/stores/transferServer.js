import { defineStore } from "pinia";
import axios from "axios";

export const transferServer = defineStore("transferServer",{
    //id: "transferServer",
    state: () => ({
        token: "",
        refresh_token : "",
        jwt : "",
        kakao_uid: "",  // 카카오 식별자
        kakao_nickname:"" , // 카카오 닉네임
        icon : "",  // 아이콘
        like: "",  // 좋아요 갯수
        dislike: "",  // 싫어요 갯수
        last_chat_id: "", // 마지막 N빵을 이용한 채팅방 번호
        curr_chat_id: "", // 현재 N빵을 이용하고 있는 채팅방 번호
        lat: "",  // 위도
        lng: "",  // 경도,
        address: "", // 주소
        isLogin: false,
        frontUrl: process.env.VUE_APP_HOST_URL,
        backUrl: process.env.VUE_APP_API_URL
    }),
    getters: {
        getToken: (state) => state.token
    },
    actions: {
        setToken(token) {
            this.token = token
        },
        setRefreshToken(refresh_token){
            this.refresh_token = refresh_token
        },
        setJwt(jwt){
            this.jwt = jwt
        },
        setUserInfo(str){  // 유저 정보 저장
            this.kakao_uid = str['kakao_uid'];
            this.kakao_nickname = str['kakao_nickname'];
            this.icon = str['icon'];
            this.like = str['like'];
            this.dislike = str['dislike'],
            this.last_chat_id = str['last_chat_id'];
            this.curr_chat_id = str['curr_chat_id'];
            this.lat = str['lat'],
            this.lng = str['lng'],
            this.address = str['address']
        },
        setUserGps(str){  // GPS 정보 저장
            this.lat = str['lat'],
            this.lng = str['lng'],
            this.address = str['address']
        },
        plusUserLike(){
            this.like = this.like++,
            this.dislike = this.dislike++
        },

        // 토큰 유효성 검증
        async validateToken(){
            let valid_token = window.localStorage.getItem('kakao_2f924a7df4d051faae0a8a839c0a8d08')
            let valid_refresh_token = window.localStorage.getItem('kakao_refresh_2f924a7df4d051faae0a8a839c0a8d08')
            let valid_jwt = window.localStorage.getItem('kakao_jwt_2f924a7df4d051faae0a8a839c0a8d08')

            // token이 있다면
            if(valid_token){
                // Store에 저장
                this.setToken(valid_token);
                this.setRefreshToken(valid_refresh_token);
                this.setJwt(valid_jwt);

                // ms 단위 이므로 1000을 나눠서 seconde로 변경
                let current_time = parseInt(new Date().getTime() / 1000)

                // head, payload, sign 3부분으로 나눠지며, payload 부분만 추출
                let base64Payload = JSON.parse( Buffer.from( valid_jwt.split('.')[1], 'base64' ).toString() );

                // access token이 만료 되었을 경우
                if(base64Payload.exp - current_time < 0){   // 만료시간 - 현재시간 < 0
                    // 새로운 토큰을 받아서 적용 시킴
                    let new_token = await axios.post(this.backUrl+"/newAccessToken", {},  {
                        headers: {
                            'refresh': `Bearer ${this.refresh_token}`
                        }
                    })
                    // 새로운 토큰을 store에 저장
                    if(new_token.data.refresh_token == undefined){
                        this.token = new_token.data.access_token
                        this.jwt = new_token.data.id_token
                    }
                    else{
                        // 기존 리프레시 토큰의 유효기간이 1개월 미만인 경우에만 갱신
                        this.token = new_token.data.access_token
                        this.jwt = new_token.data.id_token
                        this.refresh_token = new_token.data.refresh
                    }

                    window.localStorage.setItem('kakao_2f924a7df4d051faae0a8a839c0a8d08', this.token);
                    window.localStorage.setItem('kakao_refresh_2f924a7df4d051faae0a8a839c0a8d08', this.refresh_token)
                    window.localStorage.setItem('kakao_jwt_2f924a7df4d051faae0a8a839c0a8d08', this.jwt)
                }
                
                //새로 고침으로 인해 사용자 정보가 사라졌을 경우
                if(this.kakao_uid == ""){
                    // 유저 정보를 store에 저장
                    const user_info = await axios.post(this.backUrl+"/signIn", {},  {
                        headers: {
                            'refresh' : `Bearer ${this.refresh_token}`,
                            'Authorization': `Bearer ${this.token}`
                        }
                    })
                    this.setUserInfo(user_info.data);
                }
            }
            // 토큰이 없으면 메인페이지로 이동 시켜 로그인을 시킨다
            else if (!valid_token){
                window.location.href = this.frontUrl
            }
        },

        // 유저 정보 유효성 검증
        // Local storage의 위변조 위험 방지
        async validateUser(){

            // JWT의 유저 정보 가져옴
            let valid_jwt = window.localStorage.getItem('kakao_jwt_2f924a7df4d051faae0a8a839c0a8d08')
            let base64Payload = JSON.parse( Buffer.from( valid_jwt.split('.')[1], 'base64' ).toString() );
            
            if(this.kakao_uid.toString() != base64Payload.sub.toString()){
                alert("정보가 달라서 로그아웃 합니다.")

                window.localStorage.setItem('kakao_2f924a7df4d051faae0a8a839c0a8d08', "");
                window.localStorage.setItem('kakao_refresh_2f924a7df4d051faae0a8a839c0a8d08', "")
                window.localStorage.setItem('kakao_jwt_2f924a7df4d051faae0a8a839c0a8d08', "")

                window.href="/"
                
            }
        },

        async getDataCall(url, params) {
            await this.validateToken();
            this.validateUser();

            if(!params) {
                params = {};
            }
            let result = await axios.get(url, {
                headers: {
                    'refresh' : `Bearer ${this.refresh_token}`,
                    'Authorization': `Bearer ${this.token}`
                },
                params
            })
            if (result.data.isSuccess) {
                result =  result.data
            } 
            return result
        },
        async postDataCall(url, payload) {
            await this.validateToken();
            this.validateUser();

            if(!payload) {
                payload = {};
            }
            let result = await axios.post(url, payload,  {
                headers: {
                    'refresh' : `Bearer ${this.refresh_token}`,
                    'Authorization': `Bearer ${this.token}`
                }
            })
            if (result.data.isSuccess) {
                result =  result.data
            } 
            return result
        },
        async firstCall(url, payload) {
            if(!payload) {
                payload = {};
            }
            let result = await axios.post(url, payload,  {
                headers: {
                    'refresh' : `Bearer ${this.refresh_token}`,
                    'Authorization': `Bearer ${this.token}`
                }
            })
            if (result.data.isSuccess) {
                result =  result.data
            } 
            return result
        },
        
        async putDataCall(url, payload) {
            await this.validateToken();
            this.validateUser();

            if(!payload) {
                payload = {};
            }
            let result = await axios.put(url, payload,  {
                headers: {
                    'refresh' : `Bearer ${this.refresh_token}`,
                    'Authorization': `Bearer ${this.token}`
                }
            })
            if (result.data.isSuccess) {
                result =  result.data
            } 
            return result
        },
        getUserInfo(){
            let userinfo = {
                kakao_uid : this.kakao_uid,  // 카카오 식별자
                kakao_nickname : this.kakao_nickname, // 카카오 닉네임
                icon : this.icon,  // 아이콘
                like : this.like,  // 좋아요 갯수
                dislike : this.dislike,  // 싫어요 갯수
                last_chat_id : this.last_chat_id, // 마지막 N빵을 이용한 채팅방 번호
                curr_chat_id : this.curr_chat_id, // 현재 N빵을 이용하고 있는 채팅방 번호
                lat : this.lat,  // 위도
                lng : this.lng,  // 경도
                address : this.address // 주소
            }
            return userinfo
        },
        setUserCurrChatId(id){
            this.curr_chat_id = id
        },
        getDataCalljhsong(url, params) {
            if(!params) {
                params = {};
            }
            let result = axios.get(url, {
                headers: {
                    Authorization: `Bearer ${this.token}`
                },
                params
            })
            if (result.data.isSuccess) {
                result =  result.data
            } 
            return result
        },

        async postFormDataCall(url, form) {            
            if(!form) {
                form = {};
            }
            let result = await axios.post(url, form,{
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            })

            if (result.data.isSuccess) {
                result =  result.data                
            }                
                return result
        },
        isEmpty: (value) => {
            if(value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)){             
                return true
            }else{
                return false
            }
        }

    }
})
