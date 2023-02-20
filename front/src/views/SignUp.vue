<template>
    <div id="signUp" class="main center">
        <swiper class="mySwiper"
        :slidesPerView="1"
        :pagination="true"
        :modules="modules" 
        @slideChange="slideChange">
            <swiper-slide v-for="(image, index) in imageList" :key="image"> 
                <img class="profile" :src="require(`@/assets/profiles/profile${index + 1}.png`)"/>
            </swiper-slide>
        </swiper>
        <h1 class="h20">{{expression.kakao_nickname}}님,</h1>
        <h1 class="h20">프로필 사진을 선택해주세요</h1>
        <button class="next" v-on:click="saveUser">다음</button>
    </div>
</template>

<script>

import { Swiper, SwiperSlide } from "swiper/vue/swiper-vue";
import "swiper/swiper-bundle.css";
import { Pagination } from "swiper";
import {getCurrentInstance, ref, onMounted, reactive} from 'vue'

export default {
    name: "SignUp",
    components: {
      Swiper,
      SwiperSlide,
    },
    
    setup() {
        const app = getCurrentInstance()
        const callSvc = ref(app.appContext.config.globalProperties.$callService)
        const routerParams = ref(app.appContext.config.globalProperties.$router)

        const temp_callSvc = app.appContext.config.globalProperties.$callService;

        const expression = reactive({
            kakao_nickname : ''
        })

        onMounted(async () => {
            temp_callSvc.validateToken();
            expression.kakao_nickname = temp_callSvc.kakao_nickname
        });

        return {
            modules: [Pagination], callSvc, routerParams, expression
        };
    },

    data () {
        return {
        imageList: new Array(5),
        currentIndex : 0  // 현재 slide
        }
    },

    methods: {
        // slide가 이동 될 때
        slideChange(swiper) {
            this.currentIndex = swiper.activeIndex;  // 현재 slide
        },

        // 사용자 식별정보와 이미지, 닉네임을 저장
        async saveUser(){
            //const result = await axios.post('http://localhost:7444/signUp', {'kakao_uid' : this.kakao_uid, 'kakao_nickname': this.kakao_nickname, 'icon': this.currentIndex}, {});
            const result = await this.callSvc.postDataCall(this.callSvc.backUrl+'/signUp', {
                'kakao_uid' : this.callSvc.kakao_uid, 
                'kakao_nickname': this.callSvc.kakao_nickname, 
                'icon': this.currentIndex }
            )

            if(result.isSuccess == true){  // 회원 가입이 완료 되면  GPS 페이지로 이동
                this.routerParams.push( {name : 'Gps', params: {} })

            }
            else{  // 원인 미상의 이유로 회원 가입 실패
                alert("회원 가입 실패했음");
            }

        }
    }
};
</script>

<style src="../assets/css/signUp.css" scoped></style>