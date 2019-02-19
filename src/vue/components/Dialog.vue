<template>
  <div class="dialog">
    <div class="dialog-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dialog',
  props: [],
  data () {
    return {
    }
  },
};
</script>


<style lang="scss">
.dialog {
  background-image: linear-gradient(90deg, #4B64FF, #F91162);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;

  .dialog-content {
    flex: 1;
    margin: 12px;
    padding: 15px;
    border-radius: 4px;
    background-color: #fff;

    h1 {
      font-size: 16px;
      font-weight: normal;
    }
    h1, p {
      text-align: center;
    }
  }
}
</style>
