<template>
  <div id="createRoom" class="main" style="width: 100%">
    <div class="center">
      <div class="top">
        <button class="back" @click="$router.go(-1)">
          <img alt="back" src="@/assets/back.png" height="30" />
        </button>
        <div class="title">방 만들기</div>
      </div>

      <form id="room" @submit="submitForm" action="" method="post">
        <div class="form-control">
          <div class="helpDisplay">
            <p>카카오톡 링크</p>
            <button type="button" class="help" autofocus="false">
              <img alt="help" src="@/assets/help.png" height="19" style="vertical-align: middle" @click="$refs.linkModal.open()"/>
            </button>
          </div>
          <input type="url" name="link" v-model="state.link" placeholder="카카오톡 오픈채팅 URL을 입력하세요." required />
        </div>

        <div class="form-control">
          <p>주문 예정 시간</p>
          <input type="text" v-model="date" placeholder="주문 예정 시간을 선택해주세요." required />
          <vue-timepicker name="timepicker" class="timepicker" format="HH:mm" :minute-interval="10" :hour-range="enabledHours" v-model="date" hide-disabled-items close-on-complete ></vue-timepicker>
        </div>
        <div class="form-control">
          <p>방 제목</p>
          <input type="text" v-model="shopName" placeholder="방 제목을 입력해주세요." required />
        </div>

        <div class="form-control">
          <p>카테고리</p>
          <div>
            <select v-model="category" required>
              <option value="" disabled selected>
                주문하실 음식의 카테고리를 선택해주세요.
              </option>
              <option v-for="cg in defData.category" :key="cg.small" :value="cg" >
                {{ cg.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-control">
          <p>인원수</p>
          <div>
            <select v-model="member_count" required>
              <option value="" disabled selected>인원수를 선택해주세요.</option>
              <option v-for="option in member_list" :key="option" :value="option" >
                {{ option }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-control-radio">
          <div class="helpDisplay">
            <p>배달 유형</p>
            <button type="button" class="help" autofocus="false">
              <img alt="help" src="@/assets/help.png" height="19" style="vertical-align: middle" @click="$refs.deliveryTypeModal.open()" />
            </button>           
          </div>
          <div class="btn-group">
            <template v-for="type in defData.deliveryType" :key="type.small">
              <div class="radio-group" style="width: 48%">
                <input type="radio" :id="'del_' + type.small" :value="type" v-model="deliveryType" />
                <label class="radioLabel" :for="'del_' + type.small">
                  {{ type.name }}
                </label>
              </div>
            </template>
          </div>
        </div>

        <div class="form-control-radio">
          <div class="helpDisplay">
            <p>배달비</p>
            <button type="button" class="help" autofocus="false">
              <img alt="help" src="@/assets/help.png" height="19" style="vertical-align: middle" @click="$refs.deliveryFeeModal.open()" />
            </button>
          </div>
          <div class="btn-group">
            <template v-for="fee in defData.feeType" :key="fee.small">
              <div class="radio-group" style="width: 22%">
                <input type="radio" :id="'fee_' + fee.small" :value="fee" v-model="deliveryFee" />
                <label class="radioLabel" :for="'fee_' + fee.small">
                  {{ fee.name }}
                </label>
              </div>
            </template>
          </div>
        </div>

        <div class="form-control-radio">
          <div class="helpDisplay">
            <p>결제 유형</p>
            <button type="button" class="help" autofocus="false">
              <img alt="help" src="@/assets/help.png" height="19" style="vertical-align: middle" @click="$refs.orderTypeModal.open()"/>
            </button>
           
          </div>
          <div class="btn-group">
            <template v-for="pay in defData.payType" :key="pay.small">
              <div class="radio-group" style="width: 48%">
                <input type="radio" :id="'pay_' + pay.small" :value="pay" v-model="orderType" />
                <label class="radioLabel" :for="'pay_' + pay.small">
                  {{ pay.name }}</label>
              </div>
            </template>
          </div>
        </div>

        <div class="form-control" style="height: 100px">
          <p>
            해쉬태그
            <span style="font-size: 8pt; color: gray">
              ※ 최대 3개, 중복불가, 2자 이상, 8자 이내
            </span>
          </p>
          <input type="text" v-if="!duplicate" v-model="tagNm" placeholder="Enter a Tag" class="tag-input__text" @keydown="addTag" autocomplete="off" enterkeyhint="enter" />
          <div v-for="(tag, index) in tags" :key="tag" class="tag-input__tag">
            <span @click="removeTag(index)">x</span>
            {{ tag }}
          </div>
        </div>
        <div class="form-control" style="margin-bottom: 5px" :class="{ bottom: !isScroll }">
          <input type="button" @click="validateForm()" class="validCheck" value="방 만들기">
        </div>
      </form>
    </div>
  </div>

  <!-- 모달 모음 --> 
  <!-- 카카오톡 링크 도움말 -->
  <Modal ref="linkModal" width="80%" :justify="true" :align="true">
    <template #header>
      <p class="modalTitle"> 카카오 오픈채팅방 링크 </p>
    </template>
    <template #body>
      <div class="modalText">
        <br>
        <p>1) 카카오톡에서 '오픈채팅>그룹채팅 방 만들기'를 해주세요.</p><br>
        <p>2) 오픈채팅방 이름을 설정해주시고, 프로필은 '기본 프로필로만 참여 허용'으로 설정 하는 것을 권장드려요.</p><br>
        <p>3) 채팅방이 생성 되면 맨 위 '공유' 버튼을 눌러 URL을 복사해주세요.</p><br>
        <p>4) 복사된 URL을 방 만들기 '카카오톡 링크'에 붙여넣기 해주세요.</p><br>
      </div>
    </template>
  </Modal>

  <!-- 배달 유형 도움말 -->
  <Modal ref="deliveryTypeModal" width="80%" :justify="true" :align="true">
    <template #header>
      <p class="modalTitle"> 배달 유형 </p>
    </template>
    <template #body>
      <div class="modalText">
        <br>
        <p>
          <span style="color: #df7d10">방장이 배달</span> <br> 
          이웃의 집 앞까지 친절하게 음식을 배달해주세요!
        </p><br>
        <p>
          <span style="color: #df7d10">모여서 받자</span> <br> 
          방장이 정하는 장소 또는 이웃들과 상의하여 정해진 장소에 모여서 음식을 나눠주세요!
        </p><br>
      </div>
    </template>
  </Modal>

  <!-- 배달비 도움말 -->
  <Modal ref="deliveryFeeModal" width="80%" :justify="true" :align="true">
    <template #header>
      <p class="modalTitle"> 배달비 </p>
    </template>
    <template #body>
      <div class="modalText">
        <br>
        <p>
          <span style="color: #df7d10">N빵</span> <br> 
          방장이 이웃들의 메뉴까지 한꺼번에 주문하여 배달비를 한 번만 지급합니다. <br> 이후, 지급한 배달비는 음식을 주문한 이웃들과 N빵하시면 됩니다! <br>          
        </p>
        <p style="font-size:10pt; color: #3474ff;">
          <span > 예시) </span> <br>
          배달비 5000원, 5명 참여 (방장 + 이웃 4명) &rarr; 각자 1000원씩 부담          
        </p><br>       
        
        <p>
          <span style="color: #df7d10">1000원 / 2000원 / 3000원</span> <br> 
          방장이 음식을 픽업하여 음식을 주문한 이웃들에게 배달비를 받습니다! <br>금액은 방장이 1000원 ~ 3000원 사이에서 자유롭게 선택하실 수 있습니다.
        </p>
        <p style="font-size:10pt; color: #3474ff;">
          <span> 예시) </span> <br>
          5명 참여 (방장 + 이웃 4명), 배달비 2000원 선택 &rarr; 4명의 이웃은 방장에게 각자 2000원씩 지불
        </p>
      </div>
    </template>
  </Modal>

    <!-- 결제 유형 도움말 -->
  <Modal ref="orderTypeModal" width="80%" :justify="true" :align="true">
    <template #header>
      <p class="modalTitle"> 결제 유형 </p>
    </template>
    <template #body>
      <div class="modalText">
        <br>
        <p>
          <span style="color: #df7d10">각자 포장 결제</span> <br> 
          원하는 배달 플랫폼을 이용하여 <span style="color: red">포장</span> 주문합니다. <br>
        </p><br>       
        
        <p>
          <span style="color: #df7d10">방장 한번에 결제</span> <br> 
          방장이 카카오 오픈채팅방에서 메뉴를 전달받아 한꺼번에 주문합니다.<br>
          (메뉴가 섞이지 않도록 음식점에 꼭 확인해주세요!)
        </p>
        <p style="font-size:10pt; color: #3474ff;">
          <span> 예시) </span> <br>
          떡볶이 3인분(X) <br>
          떡볶이 2인분, 1인분 따로 포장이요!(O)
        </p>
      </div>
    </template>
  </Modal>

  <!-- 방 생성 정보 -->
  <Modal ref="submitModal" width="80%" :justify="true" :align="true">
    <template #header>
      <p class="modalTitle"> 방 생성 정보 </p>
    </template>
    <template #body>
      <div class="modalText" style="margin-bottom: 30px">
        <br>
        <ul>
          <li class="subject">오픈채팅방 링크</li><br>
          <li class="info link">{{ state.link }}</li>
        </ul>
        <ul>
          <li class="subject">방 제목</li>
          <li class="info">{{ shopName }}</li>          
        </ul>
        <ul>
          <li class="subject">주문 예정 시간</li>
          <li class="info">{{ date }}</li>          
        </ul>
        <ul>
          <li class="subject">카테고리</li>
          <li class="info">{{ category.name }}</li>          
        </ul>
        <ul>
          <li class="subject">인원수</li>
          <li class="info">{{ member_count }}명</li>          
        </ul>
        <ul>
          <li class="subject">배달 유형</li>
          <li class="info">{{ deliveryType.name }}</li>
        </ul>
        <ul>
          <li class="subject">배달비</li>
          <li class="info">{{ deliveryFee.name }}</li>
        </ul>
        <ul>
          <li class="subject">결제 유형</li>
          <li class="info">{{ orderType.name }}</li>
        </ul>
        <ul>
          <li class="subject">해쉬태그</li><br>
          <li style="float: right">
            <span class="tag" v-for="(a, i) in tags" :key="i" >{{ tags[i] }}</span>
          </li>
        </ul>
        <br>
      </div>
    </template>
    <template #footer>
      <div class="btns">
        <button class="btn2 close" :disabled="prevent" @click="$refs.submitModal.close()" > 취소 </button>
        <button class="btn2 submit" :disabled="prevent" @click="submitForm" > 확인 </button>
      </div>
    </template>    
  </Modal>
            
</template>

<script>
import Modal from '../components/modal/modal.vue';
import VueTimepicker from "vue3-timepicker";
import "vue3-timepicker/dist/VueTimepicker.css";

import useValidate from "@vuelidate/core";
import { required, url } from "@vuelidate/validators";
import { reactive, computed, getCurrentInstance, ref, onMounted, watch } from "vue";

export default {
  name: "App",
  setup() {
    const app = getCurrentInstance();
    const callSvc = ref(app.appContext.config.globalProperties.$callService);
    const routerParams = ref(app.appContext.config.globalProperties.$router);

    const temp_callSvc = app.appContext.config.globalProperties.$callService;

    const defData = reactive({
      category: {},
      deliveryType: {},
      feeType: {},
      payType: {},
    });

    const state = reactive({
      link: "",
    });

    watch(state, (newval) => {
      // newval.link = newval.link.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|]/gm, "").replace(/\s/g, "")
      let str = newval.link.replace(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|]/gm, "").replace(/\s/g, "");
      if(str.indexOf("https") != -1){
        str = newval.link.substring(newval.link.indexOf("https://"));
      }
      newval.link = str.replace(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|]/gm, "").replace(/\s/g, "")
    })

    // 카카오톡 링크 받는 link value를 URL 형식인지 확인
    const rules = computed(() => {
      return {
        link: { required, url },
      };
    });

    const v$ = useValidate(rules, state);

    onMounted(async () => {
      temp_callSvc.validateToken();
    });

    return {
      state,
      v$,
      defData,
      callSvc,
      routerParams,
    };
  },
  data() {
    return {
      deliveryType: {},
      deliveryFee: {},
      orderType: {},
      clientHeight: 0,
      date: "", // 주문 예정 시간
      shopName: "", //방 제목
      isScroll: true,
      obj_key: ["link", "category", "tag"],
      obj_val: new Array(),
      name: "", // 상호명
      category: "", // 카테고리
      tags: [], // 해쉬태그
      duplicate: 0, // 해쉬태그 중복 확인 status,
      member_list: ["2", "3", "4", "5", "6"],
      member_count: "",
      prevent: false,
      tagNm: ""
    };
  },
  computed: {
    enabledHours() {
      const currentHour = new Date().getHours();
      const limitHour = currentHour + 5;
      return limitHour > 23 ? [[currentHour, 23]] : [[currentHour, limitHour]];
    },
  },
  components: {
    VueTimepicker, // 주문 예정 시간 사용 components
    Modal
  },
  mounted() {
    let callArr = [
      this.callSvc.getDataCall(this.callSvc.backUrl + "/getCode/DF"), //feeType
      this.callSvc.getDataCall(this.callSvc.backUrl + "/getCode/DT"), //deliveryType
      this.callSvc.getDataCall(this.callSvc.backUrl + "/getCode/OT"), //payType
      this.callSvc.getDataCall(this.callSvc.backUrl + "/getCode/FO"), //category
    ];

    Promise.all(callArr).then((datas) => {
      this.defData.feeType = datas[0].data;
      this.defData.deliveryType = datas[1].data;
      this.defData.payType = datas[2].data;
      this.defData.category = datas[3].data;

      this.deliveryType = this.defData.deliveryType[0];
      this.orderType = this.defData.payType[0];
      this.deliveryFee = this.defData.feeType[0];
    });

    const scroll = document.getElementById("room").scrollHeight;
    this.clientHeight = document.getElementById("room").clientHeight;
    this.isScroll = scroll > this.clientHeight ? true : false;
  },
  updated() {
    const scroll = document.getElementById("room").scrollHeight;
    this.clientHeight = document.getElementById("room").clientHeight;
    this.isScroll = scroll > this.clientHeight ? true : false;
  },
  methods: {
    validateForm() {
      // console.log(document.getElementById('room').checkValidity());
      const validity = document.getElementById("room").checkValidity();
      validity ? this.$refs.submitModal.open() : document.getElementById("room").reportValidity();
      // console.log(document.getElementById('room').checkValidity();)
    },
    addTag(event) {
      //alert(event.keyCode + ":" + event.code);
      // 태그 추가 (enter 사용 가능)
      // 스페이스바는 기기나 버전 문제 등의 이유로 키 코드 값이 달라져서 제외시킴
      if (event.keyCode == 13) {
        //event.preventDefault();
        let val = this.tagNm;

        if (this.tags.includes(val)) {
          // tags 리스트에 이미 있는 문자열을 추가하면 duplicate 1로 바꿔줌
          this.tagNm = "";
          // this.duplicate = 1
        }

        // 해쉬태그는 3개까지 제한
        // 두 글자 이상 입력해야하며, tags 리스트에 없는 문자열이어야 함
        if (
          this.tags.length < 3 &&
          val.length > 1 &&
          val.length < 9 &&
          !this.tags.includes(val)
        ) {
          this.tags.push(this.tagNm);
          this.tagNm = "";
        } else if (val.length == 1 || val.length > 8) {
          this.tagNm = "";
        }
      }
    },
    removeTag(index) {
      // x 버튼을 눌렀을 때 해당 인덱스 받아서 tags 리스트에서 삭제
      this.tags.splice(index, 1);
    },
    // 완성 버튼을 누르고 뜬 모달창에서 확인 버튼을 눌렀을 때 발생하는 이벤트
    // link URL validate 에러 여부 확인 후 성공 시 localStorage에 저장
    async submitForm() {
      this.prevent = true;

      this.v$.$validate();
      this.obj_val = []; //초기화
      if (!this.v$.$error) {
        //let selectedSlice = this.pickedSelect.join(',');// eslint-disable-line no-unused-vars
        let hashTag = this.tags.join("|");
        let today = new Date();
        let date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate();
        let time = this.date + ":" + today.getSeconds();
        let orderTime = date + " " + time;
        this.obj_val.push(
          this.callSvc.kakao_uid,
          this.callSvc.kakao_nickname,
          this.callSvc.icon,
          this.callSvc.like,
          this.callSvc.dislike,
          this.callSvc.lat,
          this.callSvc.lng,
          this.state.link,
          //this.date, //time_order 시간변형
          orderTime, //2022-03-25 18:37:32
          this.category.small,
          this.member_count,
          this.deliveryType.small,
          this.deliveryFee.small,
          this.orderType.small,
          this.shopName,
          hashTag
        );

        // localStorage.setItem(this.obj_key, this.obj_val.flat());
        localStorage.setItem(this.obj_key, this.obj_val);
        //json or array -> axios 전송 ->  DB insert ok
        if (!this.callSvc.kakao_uid) {
          alert("로그인 정보가 없습니다.");
          this.prevent = false;
          return;
        } else {
          const result = await this.callSvc.postFormDataCall(
            this.callSvc.backUrl + "/Insert_create_room",
            // this.obj_val.flat()
            this.obj_val
          );
          if (result.isSuccess) {
            this.callSvc.curr_chat_id = result.data.insertId;
            alert("정상적으로 처리 되었습니다.");
            // location.href = this.callSvc.frontUrl;
            this.routerParams.push({ name: "listRoom", params: {} });
          } else {
            this.prevent = false;
            alert("정상적으로 처리 되지 않았습니다.");
          }
        }

        // const result = await this.callSvc.postFormDataCall('http://localhost:7444/Insert_create_room', {
        //   'kakao_uid' : this.callSvc.kakao_uid,
        //   'kakao_nickname' : this.callSvc.kakao_nickname,
        //   'like' : this.callSvc.like,
        //   'dislike' : this.callSvc.dislike,
        //   'lat' : this.callSvc.lat,
        //   'lng' : this.callSvc.lng,
        //   'link' : this.state.link,
        //   'date' : this.date,
        //   'category' : this.category,
        //   'member_count' : this.member_count,
        //   'pickedSelect' : this.pickedSelect,
        //   'shopName' : this.shopName,
        //   'hashTag' : this.hashTag
        // })
      } else {
        alert("정상적으로 처리 되지 않았습니다.");
        console.log("DB 저장 실패");
        console.log(this.v$);
      }
      this.$refs.submitModal.close();
    },
  },
};
</script>

<style src="../assets/css/createRoom.css" scoped></style>
<style src="../assets/css/topbar.css" scoped></style>
