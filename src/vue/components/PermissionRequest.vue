<template>
  <div class="permission-request">
    The website at <span class="url">{{url}}</span> wants to {{action}}
    <span class="object">{{object}}</span>
  </div>
</template>

<script>
export default {
  props: ['url', 'action', 'object'],
};
</script>

<style lang="scss">
.permission-request {
  padding: 10px;
  background-color: #f0f0f0;

  .object {
    display: block;
    font-weight: bold;
  }
}
</style>