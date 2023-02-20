<template>
    <div class="develperInfo_left"></div>
    <div class="develperInfo_main">
        <div class="develperInfo_img"> <!-- 사진 -->
            <img
                style="width:80px; height:80px; border-radius:50%; position: relative; top: calc(50% - 40px);"
                :src="image"
            />
        </div>
        <div class="develperInfo_tag"> <!-- 해시 태그 -->
            <span>{{tag}}</span>
        </div>
        <div class="develperInfo_description"> <!-- 설명 -->
            <span>{{description}}</span>
        </div>
        <div class="develperInfo_more"> <!-- 링크 -->
            <a href=#> 더 보기 </a>
        </div>
    </div>
    <div class="develperInfo_right"></div>

</template>

<script>
export default {    

    name: "DeveloperInfo",
    props: ["devInfo"],  // v-bind로 받은 데이터
    data () {
        return {
            image : this.devInfo.image,
            tag : this.devInfo.tag,
            description : this.devInfo.description
        }
    },
    
    created() {
        //this.image = require(this.devInfo.image)
    },

    methods: {
        
    },
};
</script>

<style>
.develperInfo_left{
    position: relative;
    float: left;
    height: 100%;
    width: 10%;
    /* background-color:black */
}
.develperInfo_main{
    position: relative;
    float: left;
    width: 80%;
    height: 100%;
    background-color:gainsboro
}
.develperInfo_img{
    position: relative;
    float: left;
    width: 20%;
    height: 100%
}
.develperInfo_tag{
    position: relative;
    text-align: left;
    float: left;
    width: 80%;
    height: 20%;
    top:20%
}
.develperInfo_description{
    position: relative;
    text-align: left;
    float: left;
    width: 80%;
    height: 20%;
    top:20%
}
.develperInfo_more{
    position: relative;
    text-align: right;
    float: left;
    width: 80%;
    height: 40%;
    top: 25%
}
.develperInfo_right{
    position:relative;
    float: left;
    height: 100%;
    width: 10%;
    /* background-color:black */
}
</style>
