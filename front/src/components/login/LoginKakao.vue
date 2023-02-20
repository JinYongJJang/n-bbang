<template>
    <div id="loginKakao" class="main center animation fadeIn">
        <!-- 텍스트 -->
        <div class="intro">
            <div v-html="introText" class="text"></div>
        </div>
        <!-- 로고 -->
        <div class="logo">
            <img class="nbbang animation bounce" src = "../../assets/logo.png"/>
        </div>            
        <!-- 카카오 로그인 버튼 -->
        <div class="login">
            <button class="kakao">                
                <!-- <img class = "kakao_btn" src = "../../assets/login/kakao_login_medium_wide.png" @click="loginWithKakao"/> -->
                <img class = "kakao_btn" src = "../../assets/login/kakao_login_medium_wide.png" @click="loginWithKakao"/>
            </button>
        </div>
        <!-- 유저 가이즈 버튼 -->
        <div class="login">                
            <button class="kakao">
                <!-- <img class = "kakao_btn" src = "../../assets/login/kakao_login_medium_wide.png" @click="loginWithKakao"/> -->
                <a href = "https://tropical-broccoli-f71.notion.site/N-24dae6dd25de4a0da7fb4fb8b0e4097d">
                    <img class = "userGuide_btn" src = "../../assets/login/Nbbang_Userguide_medium_wide.png">
                </a>
            </button>
        </div>
    </div>
</template>

<script>
import {getCurrentInstance, ref} from 'vue'

export default {
    name: "LoginKakao",    
    data () {
        return {
            introText: `배달비 1만원 시대,<br> 내일은 더 올라요!`,    
            token: '',
            refresh_token: '',
            jwt: '',
        }
    },
     setup() {
        const app = getCurrentInstance();
        const callSvc = ref(app.appContext.config.globalProperties.$callService);
        const routerParams = ref(app.appContext.config.globalProperties.$router);    
        return { callSvc, routerParams }
    },
    mounted(){
        this.token = window.localStorage.getItem('kakao_2f924a7df4d051faae0a8a839c0a8d08');
        this.refresh_token = window.localStorage.getItem('kakao_refresh_2f924a7df4d051faae0a8a839c0a8d08');
        this.jwt = window.localStorage.getItem('kakao_jwt_2f924a7df4d051faae0a8a839c0a8d08');
    },

    methods: {
        // OS 환경에 따른 카카오톡 로그인 방식 변경
        async checkOS(){
            console.log(navigator.userAgent.toLowerCase())
            console.log(navigator.userAgent.toLowerCase().indexOf('window'))
            console.log(navigator.userAgent.toLowerCase().indexOf('android'))
            console.log(navigator.userAgent.toLowerCase().indexOf('iphone'))

            // Window일 경우 화면 전환
            if(navigator.userAgent.toLowerCase().indexOf('window') > -1){
                this.loginWithKakao();
            }
            // Android, Iphone일 경우 팝업창 오픈
            else{
                this.loginWithKakao_popUp();
            }
            
        },

        async loginWithKakao() {
            /******** 리다이렉트를 통한 로그인 **********/

            if(this.token){
                // kakao에서 인증받은 토큰을 store에 저장
                this.callSvc.setToken(this.token);
                this.callSvc.setRefreshToken(this.refresh_token)
                this.callSvc.setJwt(this.jwt);

                // N빵 회원 가입 유무 확인
                const user_info = await this.callSvc.postDataCall(this.callSvc.backUrl+'/signIn', {});

                // 유저 정보를 store에 저장
                this.callSvc.setUserInfo(user_info.data);

                // if (result 값이 있다면)  // 변경 필요
                if(user_info.data.signUp == false){  // 회원 가입 되어있다면 GPS 확인 페이지로 이동
                    this.routerParams.replace("/gps")
                }
                else{ // 회원 가입 페이지로 이동
                    this.routerParams.replace("/signUp")
                }
            } else {
                // 토큰이 없다면, 수동 로그인 진행
                const params = {
                    redirectUri: this.callSvc.frontUrl+"/auth",
                };
                window.Kakao.Auth.authorize(params);
            }

            
        },

        async loginWithKakao_popUp(){
            window.Kakao.Auth.login({
                success: function(response) {
                    console.log(response);
                    window.close();
                },
                fail: function(error) {
                    console.log(error);
                },
                scope : "openid"
            });
        }
    },
};
</script>

<style src="../../assets/css/loginKakao.css" scoped></style>