<template>
  <div id="listRoom" class="main" style="flex-direction: column">
    <div class="center">
      <div class="top">
        <div class="logoBox">
          <img class="logo" alt="logo" src="@/assets/logo.png" />
        </div>
        <!-- <div id="profile">
              <img alt="logo" src="@/assets/profiles/profile1.png" height="60">
            </div> -->
        <p class="region" @click="$refs.gpsModal.open();">
          {{ userdata.address }}
        </p>
      </div>
      <div class="menu" v-if="defData.category.length > 0">
        <button
          class="categoryItem"
          :class="{ active: selectedCategory == 0 }"
          @click="setSelectedCategory(0)"
        >
          <img
            class="categoryImage"
            :src="require(`@/assets/category/all.png`)"
            alt="null"
          />
          <p>전체</p>
        </button>
        <button
          class="categoryItem"
          v-for="cate in defData.category"
          :key="cate.small"
          :class="{ active: cate.small == selectedCategory }"
          @click="setSelectedCategory(cate.small)"
        >
          <img
            class="categoryImage"
            :src="require(`@/assets/category/${cate.small}.png`)"
            alt=""
          />
          <p>{{ cate.name }}</p>
        </button>
      </div>
      <div class="sort">
        <button class="sortItem" @click="sortByTime()">
          시간순{{ sorting[sortTime] }}
        </button>
        <button class="sortItem" @click="sortByMember()">
          모임인원수{{ sorting[sortMember] }}
        </button>
        <button class="sortItem" @click="filterByType()">
          {{ filter[filterType] }}
        </button>
        <button class="sortItem" @click="sortByLike()">
          호스트 좋아요{{ sorting[sortLike] }}
        </button>
      </div>

      <div class="rooms">
        <div
          class="room current"
          v-if="this.currentChatIs == true"
          @click="golistDetail()"
        >
          <div class="info">
            <div class="tags">
              <div class="tag">
                {{ getCodeText("del", currentChat.delivery_type) }}
              </div>
              <div class="tag">
                {{ getCodeText("fee", currentChat.delivery_fee) }}
              </div>
              <div class="tag">
                {{ getCodeText("pay", currentChat.order_type) }}
              </div>
            </div>
            <div>
              <div class="details">
                <h1 class="detail" style="width: 30%">
                  {{ currentChat.time_order }}
                </h1>
                <h1 class="detail" style="width: 45%">
                  {{ currentChat.order_shop }}
                </h1>
                <h1 class="detail" style="width: 20%">
                  {{ currentChat.curr }}/{{ currentChat.order_max }}
                </h1>
              </div>
              <div v-if="currentChat.hash_tag !=''" class="hashtags">
                <div
                  class="hashtag"
                  v-for="(tag, tag_i) in currentChat.hash_tag"
                  :key="tag_i"
                >
                  <p>#{{ tag }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="host">
            <div class="profile">
              <img
                alt="logo"
                :src="
                  require(`@/assets/profiles/profile${
                    currentChat.host_icon + 1 || 1
                  }.png`)
                "
                height="50"
              />
              <p>
                {{ currentChat.host_kakao_nickname }}
              </p>
            </div>
            <div class="review">
              <div class="good">
                <img alt="logo" src="@/assets/review/good.png" height="30" />
                <p>{{ currentChat.host_like }}</p>
              </div>
              <div class="bad">
                <img alt="logo" src="@/assets/review/bad.png" height="30" />
                <p>{{ currentChat.host_dislike }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-for="(ret, chat_i) in ChatroomList" :key="chat_i">
          <div
            class="room"
            v-if="ret.chat_id != currentChat.chat_id"
            :class="{
              disabled: currentChatIs,
              hideOn:
                filterType != '002' ? filterType != ret.delivery_type : false,
            }"
            v-on="
              currentChatIs
                ? { click: () => showAlert() }
                : { click: () => showChat(ret) }
            "
          >
            <div class="info">
              <div class="tags">
                <div class="tag">
                  {{ getCodeText("del", ret.delivery_type) }}
                </div>
                <div class="tag">
                  {{ getCodeText("fee", ret.delivery_fee) }}
                </div>
                <div class="tag">{{ getCodeText("pay", ret.order_type) }}</div>
              </div>
              <div>
                <div class="details">
                  <h1 class="detail" style="width: 30%">
                    {{ ret.time_order }}
                  </h1>
                  <h1 class="detail" style="width: 45%">
                    {{ ret.order_shop }}
                  </h1>
                  <h1 class="detail" style="width: 20%">
                    {{ ret.curr || 0 }}/{{ ret.order_max }}
                  </h1>
                </div>
                <div v-if="ret.hash_tag != ''" class="hashtags">
                  <div
                    class="hashtag"
                    v-for="(tag, tag_i) in ret.hash_tag"
                    :key="tag_i"
                  >
                    <p>#{{ tag }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="host">
              <div class="profile">
                <img
                  alt="logo"
                  :src="
                    require(`@/assets/profiles/profile${
                      ret.host_icon + 1 || 1
                    }.png`)
                  "
                  height="50"
                />
                <p>{{ ret.host_kakao_nickname }}</p>
              </div>
              <div class="review">
                <div class="good">
                  <img alt="logo" src="@/assets/review/good.png" height="35" />
                  <p>{{ ret.host_like }}</p>
                </div>
                <div class="bad">
                  <img alt="logo" src="@/assets/review/bad.png" height="35" />
                  <p>{{ ret.host_dislike }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="nothing" v-if="(ChatroomList.length < 1)&&(currentChatIs == false)">
          <h3>이웃들이 당신의 N빵 시작을 기다리고 있습니다.</h3>
          <h3>+를 눌러 이웃들과 N빵을 시작 해보세요!</h3>
        </div>
      </div>
    </div>
  </div>
  <button class="floating" @click="createRoom()" v-if="!currentChatIs">
    <img class="create" src="@/assets/plus.png" />
  </button>


  <!-- 모달 창 모음  -->
  <!-- 주소 이름 확인 -->
  <Modal ref="gpsModal" width="100%" top="calc(100% - 65px)">
    <template #body>
      <div class="gpsModal" @click="goGps()">
        <img width="36" height="36" src="@/assets/marker.png" />
        <h3> 현재 위치로 수정하기 </h3>
      </div>
    </template>
  </Modal>

  <!-- 참여 여부 확인 -->
  <Modal ref="joinModal" width="100%" top="calc(100% - 125px)">
    <template #body>
      <h3 class="joinText">
        <span style="color: #df7d10">{{ this.chatInfo.time_order }}</span>
        에 주문하는&nbsp;
        <span style="color: #df7d10">{{ this.chatInfo.order_shop }}</span>
        &nbsp;N빵에 참여하시겠습니까?
      </h3>
    </template>

    <template #footer>      
      <div class="joinFooter">
        <button class="modal-btn cancel" @click="$refs.joinModal.close()">취소</button>
        <button class="modal-btn join" @click="joinChat()">참여하기</button>
      </div>
    </template>
  </Modal>

  <!-- 이전 엔빵 평가 -->
  <Modal ref="evalModal" :justify="true" :align="true">
    <template #body>
      <Evaluation @modalClose="closeEval()"></Evaluation>
    </template>
  </Modal>  
</template>

<script>
import { reactive } from "@vue/runtime-core";
import { getCurrentInstance, ref, onMounted } from "vue";
import { orderBy } from "lodash";
import Evaluation from './Evaluation.vue';
import Modal from '../components/modal/modal.vue'

export default {
  name: "App",
  setup() {
    const app = getCurrentInstance();
    const callSvc = ref(app.appContext.config.globalProperties.$callService);
    const routerParams = ref(app.appContext.config.globalProperties.$router);

    const temp_callSvc = app.appContext.config.globalProperties.$callService;
    // const temp_routerParams = app.appContext.config.globalProperties.$router;

    const defData = reactive({
      category: {},
      deliveryType: {},
      feeType: {},
      payType: {},
    });

    onMounted(async () => {
      temp_callSvc.validateToken();
    });

    return {
      callSvc,
      defData,
      routerParams,
    };
  },

  async created() {
    /*
      기본 code 값 조회 및 초기화
    */

    await this.callSvc.getDataCall(this.callSvc.backUrl + "/getCode/FO").then((data) => {
      this.defData.category = data.data;
    }); 

    let callArr = [
      await this.callSvc.getDataCall(this.callSvc.backUrl + "/getCode/DF"), //feeType
      await this.callSvc.getDataCall(this.callSvc.backUrl + "/getCode/DT"), //deliveryType
      await this.callSvc.getDataCall(this.callSvc.backUrl + "/getCode/OT"), //payType
    ];

    await Promise.all(callArr).then((datas) => {
      this.defData.feeType = datas[0].data;
      this.defData.deliveryType = datas[1].data;
      this.defData.payType = datas[2].data;
    });

    /* ================================================
    작성자: 송진호
    - 초기 Create시 사용자 정보 세팅.
    - 사용자 정보를 바탕으로 현재 참여중인 채팅 상단 고정.
    - 사용자 정보를 바탕으로 유효 범위 내의 채팅방 목록 가져오기.
    */
    this.userdata = this.callSvc.getUserInfo(); // store의 사용자 정보 가져오기.
    if (this.userdata.curr_chat_id == 0) {
      // 사용자가 현재 참여방이 없을 경우, 고정창 off. 있는 경우, 고정창 on > 해당 방의 정보 가져옴
      this.currentChatIs = false;
    } else {
      this.currentChatIs = true;
      await this.getCurrentChat();
      console.log(this.userdata)
    }

    if(this.userdata.last_chat_id > 0){
      this.$refs.evalModal.open();
    }

    await this.postChatList(); // 사용자 정보 (lng, lat)을 기반으로 주변의 채팅방 목록 가져옴.
    console.log(this.ChatroomList)
    /* ================================================ */
  },

  data() {
    return {
      bckurl: "https://:7444",      
      addrModal: false,
      userdata: {},
      currentChat: {},
      chatInfo: {},
      ChatroomList: [],
      sorting: {
        asc: "▲",
        desc: "▼",
      },
      filter: {
        "000": "집앞",
        "001": "모여",
        "002": "모여+집앞",
      },
      sortTime: "asc",
      sortMember: "asc",
      sortLike: "asc",
      filterType: "002",
      selectedCategory: 0,
      currentChatIs: false,
      km: 5,
      };
  },
  components: {
    Evaluation,
    Modal
  },
  methods: {   
    close(open, name) {
      this[name] = open
    },
    getCodeText(lcd, cd) {
      let txt = cd;
      let arrData = [];
      switch (lcd) {
        case "del":
          arrData = this.defData.deliveryType;
          break;
        case "fee":
          arrData = this.defData.feeType;
          break;
        case "pay":
          arrData = this.defData.payType;
          break;
        default:
          arrData = [];
          break;
      }

      if (arrData.length > 0) {
        arrData.some((elem) => {
          if (elem.small == cd) {
            txt = elem.name;
            return true;
          }
        });
      }

      return txt;
    },
    /* ====================[채팅방 목록 가져오기]============================
      작성자: 송진호
      
      - 현재 위치, 선택된 카테고리, 현재 시간을 기준으로 방 목록을 가져옴.
      - 가져온 방 목록들의 현재 인원을 확인
      - 시간 포맷 변경
      */
    async postChatList() {
      let url = this.callSvc.backUrl + "/mp01/chatroom";
      let today = new Date(); // 현재 시간 추출. Query 가능한 형태로 변경
      let date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      let time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let now = date + " " + time;
      let requestbody = {
        km: this.km, // 검색 범위
        lat: this.userdata.lat, // 위도 경도
        lng: this.userdata.lng,
        category: this.selectedCategory, // 선택된 카테고리
        order_time: now, // 시간
      };
      const result = await this.callSvc.postDataCall(url, requestbody);
      
      // 쿼리 결과 ChatroomList 에 저장
      if (result.isSuccess == true) {
        this.ChatroomList = result.data;
      } else {
        this.ChatroomList = []
        alert("N빵 목록 조회 실패.");
      }

      // ChatroomList에 현재 인원 정보 받아오기 및 시간 형식 시간:분 으로 변경
      for (var data of this.ChatroomList) {
        // 시간 형식 시간:분 (0 추가로 두자리 고정) 변경
        data.time_order = new Date(data.time_order);
        var hour = data.time_order.getHours().toString();
        var mins = data.time_order.getMinutes().toString();
        if (hour.length == 1) {
          hour = "0" + hour;
        }
        if (mins.length == 1) {
          mins = "0" + mins;
        }
        data.time_order = hour + ":" + mins;
        // hash_tag "|"를 기준으로 나눠서 추가.
        data.hash_tag = data.hash_tag.split("|");
        data.detailView = false;
      }
      
      // 본인 참여방 존재시 리스트 제외
      if (this.currentChatIs) {
        this.ChatroomList = this.ChatroomList.filter((elem) => {
          return elem.chat_id != this.userdata.curr_chat_id;
        });
      } 
    },
    sortByTime() {
      this.sortTime = this.sortTime == "asc" ? "desc" : "asc";
      console.log(this.sortTime);
      this.ChatroomList = orderBy(
        this.ChatroomList,
        ["time_order", "order_max", "host_like"],
        [this.sortTime, this.sortMember, this.sortLike]
      );
      // this.postChatList();
    },
    sortByMember() {
      this.sortMember = this.sortMember == "asc" ? "desc" : "asc";
      console.log(this.sortMember);
      this.ChatroomList = orderBy(
        this.ChatroomList,
        ["order_max", "time_order", "host_like"],
        [this.sortMember, this.sortTime, this.sortLike]
      );
      // this.postChatList();
    },
    sortByLike() {
      this.sortLike = this.sortLike == "asc" ? "desc" : "asc";
      console.log(this.sortLike);
      this.ChatroomList = orderBy(
        this.ChatroomList,
        ["host_like", "order_max", "time_order"],
        [this.sortLike, this.sortMember, this.sortTime]
      );
      // this.postChatList();
    },
    filterByType() {
      this.filterType =
        this.filterType == "000"
          ? "001"
          : this.filterType == "001"
          ? "002"
          : "000";
    },
    createRoom() {
      // location.href = '/create-room';
      //페이지 이동
      this.routerParams.push({ name: "createRoom", params: {} });
      // if (this.currentChatIs == true){
      //   this.currentChatIs = false
      // } else {
      //   this.currentChatIs = true
      // }
    },

    /*
    Current 계산이 힘들기 때문에 추후 업데이트에 적용.
    increaseC(){
      this.currentindex = (this.currentindex+1)%3
      this.current = this.currentlist[this.currentindex]
    },
    */
    setSelectedCategory(inputCode) {
      console.log(inputCode);
      this.selectedCategory = inputCode;
      console.log(this.selectedCategory);
      this.postChatList();
    },
    /* ========[사용안함]=======
     */

    // 선택한 채팅방의 디테일 표시
    async setChatDetailView(i, id) {
      if (this.ChatroomList[i].detailView == true) {
        this.ChatroomList[i].detailView = false;
      } else {
        this.ChatroomList[i].detailView = true;
        const result = await this.callSvc.getDataCall(
          this.callSvc.backUrl + `/mp01/get_currlist?id=${id}`
        );

        this.ChatroomList[i].members = new Array();
        for (var data of result.data) {
          this.ChatroomList[i].members.push(data.username);
        }
      }
    },
    /* ======================[현재 방 정보 가져오기]==========================
      작성자: 송진호
      - 현재 참가중인 방 정보를 가져옴.
      - 가져온 방 목록들의 현재 인원을 확인
      - 시간 포맷 변경
    */
    async getCurrentChat() {
      // 현재 방 아이디를 기준으로 방 정보 가져옴.
      let url =
        this.callSvc.backUrl +
        "/mp01/get-curr-info/" +
        this.userdata.curr_chat_id;
      const result = await this.callSvc.getDataCall(url);
      if (result.isSuccess && result.data.length > 0) {
        this.currentChat = result.data[0];
      } else {
        // 현재 채팅방 조회시, 방 폭파나, 방종료 등으로 존재 하지 않을 시 표기 하지 않음.
        //alert("참가 중인 방 정보 조회 실패.");
        this.callSvc.setUserCurrChatId(0);
        this.currentChatIs = false;

        this.initMyRoom(); // 본인이 등록된 방 정보 초기화
        return;
      }
      // 시간 형식 시간:분 (0 추가로 두자리 고정) 변경
      this.currentChat.time_order = new Date(this.currentChat.time_order);
      var hour = this.currentChat.time_order.getHours().toString();
      var mins = this.currentChat.time_order.getMinutes().toString();
      if (hour.length == 1) {
        hour = "0" + hour;
      }
      if (mins.length == 1) {
        mins = "0" + mins;
      }
      this.currentChat.time_order = hour + ":" + mins;
      // hash_tag "|"를 기준으로 나눠서 추가.
      this.currentChat.hash_tag = this.currentChat.hash_tag.split("|");
    },
    /* ======================[채팅방 참가 확인]==========================
      작성자: 송진호
      - 채팅방 정보를 chatInfo에 저장.
      - 채팅방 참가 확인 모달 On
    */
    showChat(ret) {
      this.chatInfo = ret;
      this.$refs.joinModal.open();
    },
    /* ======================[채팅방 참가]==========================
      작성자: 송진호
      - 선택한 채팅방에 참가.
      - 이름, 아이디, 채팅아이디를 전송.
      - 성공시 모달 Off, 현재 채팅 정보에 저장, 현재 채팅 참가 여부 On
    */
    async joinChat() {
      // 방 참가 시 총 인원을 초과 했을 경우
      if (this.chatInfo.curr >= this.chatInfo.order_max) {
        alert("인원이 다 찼습니다");
      } else {
        let url = this.callSvc.backUrl + "/mp01/joinroom";
        let requestbody = {
          username: this.userdata.kakao_nickname,
          user_id: this.userdata.kakao_uid,
          chat_id: this.chatInfo.chat_id,
          icon: this.userdata.icon
        };
        const result = await this.callSvc.postDataCall(url, requestbody);

        if (result.isSuccess == true) {
          alert("방에 참가되었습니다.");
          this.callSvc.setUserCurrChatId(this.chatInfo.chat_id);
          this.ModalFilter = false;
          this.currentChat = this.chatInfo;
          this.currentChatIs = true;
          this.golistDetail()
        } else {
          alert("방에 참가하지 못했습니다.");
          this.ModalFilter = false;
        }
      }
    },
    golistDetail() {
      const temp_chat_id = this.currentChat.chat_id;
      // window.location.href = `/list-detail/${temp_chat_id}`;
      this.routerParams.push({
        path: `/list-detail/${temp_chat_id}`,
        param: {},
      });
    },
    goGps() {
      this.routerParams.push({
        path: `/gps`,
        param: {},
      });
    },
    /*
      등록된 ROOM 정보 초기화
    */
    initMyRoom() {
      const sendObj = {
        chat_id: 0,
        kId: this.userdata.kakao_uid,
      };
      this.callSvc
        .putDataCall(`${this.callSvc.backUrl}/mp01/update-in-room`, sendObj)
        .then((data) => {
          console.log(data);
          return;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    showAlert() {
      alert("이미 다른 방에 참여 중입니다.");
    }
  },
};
</script>

<style src="../assets/css/listRoom.css" scoped></style>
<style src="../assets/css/room.css" scoped></style>
