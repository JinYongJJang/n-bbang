<template>
    <router-view />
</template>

<script>
export default {
  name: 'App',
  components: {
  },
  setup() {    
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    
    window.addEventListener("resize", () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    });
  },

}
</script>

<style src="./assets/css/main.css"></style>
<style src="./assets/css/animation.css"></style>
<style src="./assets/css/normalize.css"></style>
