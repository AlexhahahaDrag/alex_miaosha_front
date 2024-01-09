<template>
    <svgIcon
      name="dict"
      color="white"
      class="svg"
    ></svgIcon>
  </template>
  
  <script setup>
  import svgIcon from "@v/common/icons/svgIcon.vue";
  
  const url = "https://github.com/AlexhahahaDrag/alex_blog.git";
  const goto = () => {
    window.open(url);
  };
  </script>
  
  <style lang="scss" scoped>
  @import "./svg.scss";
  </style>