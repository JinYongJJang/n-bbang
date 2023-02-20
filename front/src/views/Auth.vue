<template>
    <p></p>
</template>

<script>
import {getCurrentInstance, ref, onMounted} from 'vue'

export default {

    name: 'Auth',
    components:{
    },
    setup(){
        const app = getCurrentInstance()
        const callSvc = ref(app.appContext.config.globalProperties.$callService)
        const routerParams = ref(app.appContext.config.globalProperties.$router)

        const temp_callSvc = app.appContext.config.globalProperties.$callService;
        const temp_routerParams = app.appContext.config.globalProperties.$router;

        onMounted(async () => {
            // 뒤로가기 버튼으로 인해 인가 코드가 재사용됨을 방지
            if(window.localStorage.getItem('kakao_2f924a7df4d051faae0a8a839c0a8d08') != undefined){
                temp_routerParams.replace("/")
            }

            const auth_length = window.location.search.length
            // 토큰 정보 받아오기
            const token = await temp_callSvc.firstCall(temp_callSvc.backUrl+'/auth', {
                'auth' : window.location.search.substring(6, auth_length)
            })

            // 토큰을 로컬 스토리지에 저장
            window.localStorage.setItem('kakao_2f924a7df4d051faae0a8a839c0a8d08', token.data.access_token);
            window.localStorage.setItem('kakao_refresh_2f924a7df4d051faae0a8a839c0a8d08', token.data.refresh_token)
            window.localStorage.setItem('kakao_jwt_2f924a7df4d051faae0a8a839c0a8d08', token.data.id_token)

            // kakao에서 인증받은 토큰을 store에 저장
            temp_callSvc.setToken(token.data.access_token)
            temp_callSvc.setRefreshToken(token.data.refresh_token)
            temp_callSvc.setJwt(token.data.id_token)

            // N빵 회원 가입 유무 확인
            const user_info = await temp_callSvc.firstCall(temp_callSvc.backUrl+'/signIn', {})

            // 유저 정보를 store에 저장
            temp_callSvc.setUserInfo(user_info.data);

            // if (result 값이 있다면)  // 변경 필요
            if(user_info.data.signUp == false){  // 회원 가입 되어있다면 GPS 확인 페이지로 이동
                temp_routerParams.replace("/gps")
            }
            else{ // 회원 가입 페이지로 이동
                temp_routerParams.replace("/signUp")
            }
        });
        

        return { callSvc, routerParams }

    }
}

</script>