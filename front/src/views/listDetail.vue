<template>
  <div id="listDetail" class="main" style="flex-direction: column; width:100%">
    <div class="center"> 
      <div class="top">
        <button class="back" @click="$router.go(-1)">      
          <img alt="back" src="@/assets/back.png" height="30">
        </button>
        <div class="title"> {{title}} </div>
      </div>
      <div class="rooms" style="height: 100%">
          <div class="room">
              <div class="info">
                  <div class="tags">
                      <div class="tag">{{ getCodeText('del', currentChat.delivery_type)}}</div>
                      <div class="tag">{{ getCodeText('fee', currentChat.delivery_fee) }}</div>
                      <div class="tag">{{ getCodeText('pay', currentChat.order_type) }}</div>
                      <!-- <button class="share" @click="alert()">                
                          <img alt="share" src="@/assets/share2.png" height="20">
                      </button>   -->
                  </div>
                  <div>
                      <div class="details" >
                          <h1 class="detail" style="width:30%">{{ currentChat.time_order }}</h1>
                          <h1 class="detail" style="width:50%">{{ currentChat.order_shop }}</h1>
                          <h1 class="detail" style="width:20%">{{ currentChat.curr }}/{{ currentChat.order_max }}</h1>
                      </div>
                      <div v-if="currentChat.hash_tag !=''" class="hashtags">
                          <div class="hashtag" v-for="(tag,tag_i) in currentChat.hash_tag" :key="tag_i">#{{ tag }}</div>
                      </div>
                  </div>
              </div>
              <div class="host">
                  <div class="profile">
                      <img alt="logo" :src="require(`@/assets/profiles/profile${currentChat.host_icon + 1}.png`)" height="50">
                      <p style="font-size: 9pt">{{currentChat.host_kakao_nickname}}</p>
                  </div>
                  <div class="review">
                      <div class="good">
                          <img alt="logo" src="@/assets/review/good.png" height="30">
                          <p style="font-size: 9pt">{{currentChat.host_like}}</p>
                      </div>
                      <div class="bad">
                          <img alt="logo" src="@/assets/review/bad.png" height="30">
                          <p style="font-size: 9pt">{{currentChat.host_dislike}}</p>
                      </div>
                  </div>
              </div>
          </div>            
          <!-- ????????? ?????? -->
          <div class ="participantInfo">
              <p style="text-align: left; font-weight: bold">?????? ?????? ??????</p>
              <div class="users">
                <template v-for="(user,i) in enterUser" :key="i">
                  <div class="user" v-if="user.userid != currentChat.host_kakao_uid">
                    <img class="profile" :src="require(`@/assets/profiles/profile${user.icon + 1}.png`)"/>
                    <p class="username">{{user.username}}</p>
                    <img class="minus" :src="require(`@/assets/minus.png`)" v-if="isHost" @click="ejectModalOpen(user)"/>
                  </div>                  
                </template>
              </div>
          </div>
        
          <div class="btnBox">
            <a :href="currentChat.kakao_link" target="_blank">
              <input type="button" class="btn link" value="??????????????? ??????">
            </a>
            <div class="buttons">
              <template v-if="isHost">
                <input type="button" class="btn delete" value="??? ??????" @click="$refs.deleteModal.open()"/>
                <input type="button" class="btn done" value="?????? ??????" @click="$refs.doneModal.open()"/>
              </template>           
            </div>
            
            <template v-if="!isHost">
              <input type="button" class="btn exit" value="?????????" @click="$refs.exitModal.open()"/>
            </template>   
          </div>          
      </div>
    </div>
  </div>

  <Modal ref="ejectModal" width="100%" top="calc(100% - 85px)">
    <template #body>
      <h3 class="ejectText">
         <span style="color: #df7d10">{{ this.selectUser.username }}</span>
        ?????? ?????????????????????????
      </h3>
      <br>
    </template>

    <template #footer>      
      <div class="modalFooter">
        <button class="btn cancel" @click="$refs.ejectModal.close()">?????????</button>
        <button class="btn progress" @click="deleteUser()">???</button>
      </div>
    </template>
  </Modal>

  <Modal ref="exitModal" width="100%" top="calc(100% - 100px)">
    <template #body>
      <h3 class="ejectText">
         ?????? ??????????????????????
      </h3>
      <br>
    </template>

    <template #footer>      
      <div class="modalFooter">
        <button class="btn cancel" @click="$refs.exitModal.close()">?????????</button>
        <button class="btn progress" @click="exit()">???</button>
      </div>
    </template>
  </Modal>
  
  <Modal ref="deleteModal" width="100%" top="calc(100% - 100px)">
    <template #body>
      <h3 class="deleteText">      
        ?????? ?????????????????????????
      </h3>
      <br>
    </template>

    <template #footer>      
      <div class="modalFooter">
        <button class="btn cancel"  @click="$refs.deleteModal.close()">?????????</button>
        <button class="btn progress" @click="finishRoom(CANCEL_ROOM)">???</button>
      </div>
    </template>
  </Modal>
  
  <Modal ref="doneModal" width="100%" top="calc(100% - 100px)">
    <template #body>
      <h3 class="doneText">
        ????????? ???????????????????
      </h3>
      <br>
    </template>

    <template #footer>      
      <div class="modalFooter">
        <button class="btn cancel"  @click="$refs.doneModal.close()">?????????</button>
        <button class="btn progress" @click="finishRoom(CLEAR_ROOM)">???</button>
      </div>
    </template>
  </Modal>
</template>


<script>
import { reactive } from '@vue/runtime-core';
import {getCurrentInstance, ref, onMounted} from 'vue'
import Modal from '../components/modal/modal.vue'

export default {
  name: 'listDetail',
  
  components: {  
    Modal
  },
  setup() {

    const CLEAR_ROOM = "003"
    const CANCEL_ROOM = "001"

    const app = getCurrentInstance()
    const callSvc = ref(app.appContext.config.globalProperties.$callService)
    const routerParams = ref(app.appContext.config.globalProperties.$router);

    const temp_callSvc = app.appContext.config.globalProperties.$callService;
    const temp_routerParams = app.appContext.config.globalProperties.$router;

    const defData = reactive({
      category: {},
      deliveryType: {},
      feeType: {},
      payType: {}
    });

    onMounted(async () => {
      temp_callSvc.validateToken();

      if(temp_callSvc.curr_chat_id == 0){
        temp_routerParams.replace('/list-room')
      }
    })

    return {
      callSvc, routerParams, defData, CANCEL_ROOM, CLEAR_ROOM
    }
  },
  async created(){
    /*
      ?????? code ??? ?????? ??? ?????????
    */

    await this.callSvc.getDataCall(this.callSvc.backUrl+'/getCode/FO').then(data => {
      this.defData.category = data.data;
    })

    let callArr =[  
      this.callSvc.getDataCall(this.callSvc.backUrl+'/getCode/DF'),  //feeType
      this.callSvc.getDataCall(this.callSvc.backUrl+'/getCode/DT'),  //deliveryType
      this.callSvc.getDataCall(this.callSvc.backUrl+'/getCode/OT')   //payType
    ]

    Promise.all(callArr).then(datas => {
      this.defData.feeType = datas[0].data
      this.defData.deliveryType = datas[1].data
      this.defData.payType = datas[2].data

      //console.log(JSON.stringify(defData));
    })
    
    this.getData();
  },
  
  data(){
      return{
        title: '',
        currentChat : {},
        enterUser : [],
        isHost : false,
        selectUser : {},
        ModalFilter: false
      }
  },
  methods:{
      async getData(){
        // ????????? ?????? ????????????
        const pathName = window.location.pathname.toString().split('/')[2]  // "/list-detail/3" -> ["", "list-detail", "3"]
        const result = await this.callSvc.postDataCall(this.callSvc.backUrl+'/listDetail', {"chat_id" : pathName})
        if(result.isSuccess == true){
            this.currentChat = result.data[0]  // ????????? ????????? ??????
            // 2022-03-25T09:37:32.000Z??? 18:37??? ??????
            this.currentChat.time_order = new Date(this.currentChat.time_order)
            var hour = this.currentChat.time_order.getHours().toString()
            var mins = this.currentChat.time_order.getMinutes().toString()
            if (hour.length == 1) {
                hour = "0" + hour
            }
            if (mins.length == 1) {
                mins = "0" + mins
            }
            this.currentChat.time_order = hour + ":" + mins

            // hash_tag ???????????? ?????? ???????????? ????????? ??????.
            this.currentChat.hash_tag = this.currentChat.hash_tag.split("|")
            console.log("this.currentChat.hash_tag");
            console.log(this.currentChat.hash_tag);
            console.log(typeof(this.currentChat.hash_tag));

            // ???????????? ????????? ????????? ?????? ????????????
            const enterUser_result = await this.callSvc.postDataCall(this.callSvc.backUrl+'/enterUser', {"chat_id" : pathName})
            console.log(enterUser_result)
            if(enterUser_result.isSuccess == true){
                // ?????? ?????? ?????? ???
                this.currentChat.curr = enterUser_result.data.length;

                // ????????? ??????
                this.enterUser = enterUser_result.data;

                // ?????? ????????? ???????????????
                if(this.callSvc.kakao_uid == this.currentChat.host_kakao_uid){
                    this.isHost = true
                    this.title = "??? ??????"
                }
                else {
                  this.title = "??? ??????"
                }
            }
            else{
                alert("???????????? ????????? ????????? ?????? ???????????? ????????????");
            }
        }
        else{  // ?????? ????????? ????????? ?????? ??? ?????? ???????????? ??????
            alert("????????? ?????? ???????????? ????????????");
        }
        console.log(this.currentChat)    
    },
    getCodeText(lcd, cd) {
      let txt = cd
      let arrData = []
      switch (lcd){
        case 'del':
          arrData = this.defData.deliveryType
          break
        case 'fee':
          arrData = this.defData.feeType
          break
        case 'pay':
          arrData = this.defData.payType
          break
        default:
          arrData = []
          break
      }

      if (arrData.length > 0) {
        arrData.some(elem => {
          if (elem.small == cd) {
            txt = elem.name
            return true
          }
        })  
      }

      return txt
    },

    ejectModalOpen(user){
      this.selectUser = user;
      this.$refs.ejectModal.open();
    },

    // ?????? ????????????
    async deleteUser(){
      const result = await this.callSvc.postDataCall(this.callSvc.backUrl+'/deleteUser', {
          'chat_id': this.selectUser.chatid ,
          'user_id' : this.selectUser.userid
      })
      if(result.data[0].isSuccess && result.data[1].isSuccess){
          this.getData()
      }
      else{
         alert("??????????????? ?????????????????????.")
      }
    },

    // ????????? ??????
    async exit(){
      const result = await this.callSvc.putDataCall(`${this.callSvc.backUrl}/exit-room`, {
          'chat_id': this.currentChat.chat_id ,
          'user_id' : this.callSvc.kakao_uid
      })
      if(result.isSuccess){
        this.callSvc.currentChatIs = false
        this.callSvc.curr_chat_id = 0
        this.routerParams.go(-1)
        return
      } else {
        alert("????????? ??????????????????.")
        return
      }
    },
    async finishRoom(cd) {
      const sendObj = {
          "chat_id": this.currentChat.chat_id,
          "fin_code" : cd,
          "host_kakao_uid" : this.currentChat.host_kakao_uid
      }

      const result = await this.callSvc.putDataCall(`${this.callSvc.backUrl}/finish-room`, sendObj)
      if (result.isSuccess) {
        alert("????????? ?????????????????????.")
        this.routerParams.go(-1)
      } else {
        alert("?????? ?????? ????????? ?????????????????????.")
        return
      }
    }

  }
}

</script>


<style src="../assets/css/listDetail.css" scoped></style>
<style src="../assets/css/room.css" scoped></style>
<style src="../assets/css/topbar.css" scoped></style>
