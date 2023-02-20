<template>
    <div id="gps" class="main center animation fadeIn">
      <p style="font-weight: bold; color: dodgerblue">마커를 잡아서 이동하면, 위치를 조정할 수 있습니다.</p>
      <br><br>
      <h2>{{address || '위치를 조정해주세요.'}}</h2>
      <div id="map"></div>
      <button class="next" v-on:click="saveGps" :disabled="address === null">다음</button>
    </div>
</template>

<script>
import {getCurrentInstance, ref} from 'vue'

export default {
  name: "Gps",
  components:{
  },
  data () {
    return{
      map: {},
      latitude : 0,
      longitude : 0,
      circle: {},
      markerImage: {},
      marker: {},
      address: '',
      app: {},
      callSvc: {},
      routerParams: {},
    }
  },
  
  mounted(){
    this.app = getCurrentInstance();
    this.callSvc = ref(this.app.appContext.config.globalProperties.$callService);
    this.routerParams = ref(this.app.appContext.config.globalProperties.$router);    

    this.callSvc.validateToken();

    //GPS 실행
    if(!("geolocation" in navigator)) {
        alert('Geolocation is not available.');
      return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
      this.latitude = pos.coords.latitude;
      this.longitude = pos.coords.longitude;
      this.initMap(this.latitude, this.longitude);
    }, err => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
      alert("위치 정보를 필수로 제공해야 합니다.");
    }, { enableHighAccuracy: true,  timeout: 15000, maximumAge: 10000 }  // 정확도 높이는 옵션
    );
  },

  methods: {
    initMap: function(lat, lng){
      const container = document.getElementById("map");
      const options = { //지도를 생성할 때 필요한 기본 옵션
          center: new window.kakao.maps.LatLng(lat, lng), //지도의 중심좌표.
          level: 5 //지도의 레벨(확대, 축소 정도)
      };
      
      this.map = new window.kakao.maps.Map(container, options); //지도 생성 및 객체 리턴
      
      const imageSrc = require('@/assets/marker.png'); // 마커이미지의 주소입니다    
      const imageSize = new window.kakao.maps.Size(48, 48); // 마커이미지의 크기입니다
      const imageOption = {offset: new window.kakao.maps.Point(20, 40)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
      
      // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
      this.markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      
      this.createMarker(this.latitude, this.longitude);
      this.createCircle(this.latitude, this.longitude);
      this.getAddress();
    },
    createMarker: function(lat, lng){      
      const position = new window.kakao.maps.LatLng(lat, lng);
      this.marker = new window.kakao.maps.Marker({
        position: position,
        image: this.markerImage
      });
      this.marker.setMap(this.map);
      this.marker.setDraggable(true);
   
      const $vm = this;
      window.kakao.maps.event.addListener(this.marker, 'dragend', function() {        
        $vm.circle.setMap(null);
        const pos = $vm.marker.getPosition();
        $vm.map.setCenter(pos);
        $vm.latitude = pos.getLat();
        $vm.longitude = pos.getLng();
        $vm.createCircle(pos.getLat(), pos.getLng());
        $vm.getAddress();
      });
    },
    createCircle: function(lat, lng){
      this.circle = new window.kakao.maps.Circle({
        center: new window.kakao.maps.LatLng(lat, lng),
        radius: 500,  // 원의 반지름
        strokeWeight: 2,
        strokeColor: '#db7b10',
        strokeOpacity: 0.8,
        strokeStyle: 'dashed',
        fillColor: '#db7b10',
        fillOpacity: 0.2
      });
      this.circle.setMap(this.map);
    },
    getAddress: function(){
      const pos = this.marker.getPosition();
      const geocoder = new window.kakao.maps.services.Geocoder();
      const $vm = this;
      geocoder.coord2Address(pos.getLng(), pos.getLat(), (result, status) => {
        if(status === window.kakao.maps.services.Status.OK) {          
          $vm.address = result[0].road_address === null ? null : result[0].road_address.address_name ;
        }
      })
    },
    async saveGps(){
      // 현재 GPS를 store에 저장
      let gps_data = {
        "lat" : this.latitude,
        "lng" : this.longitude,
        "address": this.address
      }
      this.callSvc.setUserGps(gps_data);

      // 현재 GPS를 Database에 저장
      const result = await this.callSvc.putDataCall(this.callSvc.backUrl+'/gps', {
        "kakao_uid" : this.callSvc.kakao_uid, 
        "lat": this.latitude, 
        "lng": this.longitude,
        "address": this.address
      })

      if(result.isSuccess == true){ // GPS 저장 완료
        // null로 하려고 했으나, (행이 생성될때 초기화 되는 null)과 (update로 만들어지는 null)의 값이 다름 -> 0으로 설정
        //if(window.props.callAxios.last_chat_id == null){
        if(this.callSvc.last_chat_id == 0){  // 회원 가입은 완료 되었으나 N빵 서비스를 한번도 이용하지 않았을 경우
          this.routerParams.push( {name : 'listRoom', params: {} } )
        }
        else{
          this.routerParams.push( {name : 'Evaluation', params: {} } )
        }
      }
      else{  // 원인 미상의 이유로 GPS 저장 실패
          alert("GPS 저장 실패했음");
      }
    },
  }
};
</script>

<style scoped>
#map {
  padding: 10%;
  /* width: 100%; */
  height: 270px;
  margin-top: 15px;
}
</style>
