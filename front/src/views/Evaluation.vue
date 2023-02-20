<template>
  <div class="main center">
        <h1>{{evalu.host_kakao_nickname}}님과의 N빵은 어떠셨나요?</h1>
        <div class="buttons">
            <div>
              <!-- 좋아요 버튼 -->
              <img src="@/assets/review/good.png"  
                class=evaltuation_img 
                :class="{'point': like === true, 'default': like === false}" 
                @click="plus_like" />
              <p class="description">좋아요</p>
            </div>

            <!-- 별로에요 버튼 -->
            <div>
              <img src="@/assets/review/bad.png"
                class=evaltuation_img 
                :class="{'point': dislike === true, 'default': dislike === false}" 
                @click="plus_dislike" />
              <p class="description">별로에요</p>
            </div>
        </div>
        <button class="next" style="margin: 0px" :disabled="!like && !dislike" @click=evalutaionSave>보내기</button>
  </div>
</template>

<script>
import {getCurrentInstance, ref, onMounted, reactive} from 'vue'

export default {
  name: "Evaluation",
    components:{
  },
  setup(){
    const app = getCurrentInstance()
    const callSvc = ref(app.appContext.config.globalProperties.$callService)
    const routerParams = ref(app.appContext.config.globalProperties.$router)

    const temp_callSvc = app.appContext.config.globalProperties.$callService;
    const temp_routerParams = app.appContext.config.globalProperties.$router;

    const evalu = reactive({
      host_kakao_nickname : ''
    })

    onMounted(async () => {
      temp_callSvc.validateToken();

      // last_chat_id를 이용하여 호스트의 닉네임과 마지막 주문했던 메뉴를 가져옴
      const result = await temp_callSvc.postDataCall(temp_callSvc.backUrl+'/last_chat_id', {
        'last_chat_id' : temp_callSvc.last_chat_id
      });
      if(result.data.last_chat_id == '0'){
        temp_routerParams.replace('/list-room')
      }

      evalu.host_kakao_nickname = result.data[0].kakao_nickname
    });


    return {
      callSvc, routerParams, evalu
    }
  },
  data () {
    return{
      host_kakao_uid : '',
      host_kakao_nickname : '',
      order_category : '',
      like : true,
      dislike : false,
    }
  },
  emits: ['modalClose'],
  methods: {
    // 좋아요 버튼 클릭
    plus_like(){
      this.like = !this.like;
      this.dislike = false;
    },

    // 싫어요 버튼 클릭
    plus_dislike(){
      this.dislike = !this.dislike;
      this.like = false;
    },

    // 지난 호스트에 대한 평가 저장
    async evalutaionSave(){
      const result = await this.callSvc.putDataCall(this.callSvc.backUrl+'/evaluation', {
        'like' : this.like, 
        'dislike' : this.dislike,
        'last_chat_id' : this.callSvc.last_chat_id,
        'kakao_uid' : this.callSvc.kakao_uid
      })

      if(result.isSuccess == true){  // 평가 완료 후 메인페이지로 이동
        this.callSvc.last_chat_id = 0;   // 평가 후 store의 last_chat_id 초기화 
        this.$emit('modalClose', false);
        this.routerParams.push( {name : 'listRoom', params: { } })
      }
      else{  // 원인 미상의 이유로 평가 실패
        alert("평가 실패했음");
        this.$emit('modalClose', true);
      }
    }
    
  }
};
</script>

<style scoped>
.buttons {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  height: 250px;
}
.evaltuation_img{
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
.default {
  filter: grayscale();
}
.description {
  font-weight: bold;
}
.point {
  filter: none;
}

</style>
