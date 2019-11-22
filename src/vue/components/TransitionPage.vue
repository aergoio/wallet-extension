<template>
  <transition
    :name="transitionName"
    :mode="transitionMode"
    :enter-active-class="transitionEnterActiveClass"
    @beforeLeave="beforeLeave"
    @enter="enter"
    @afterEnter="afterEnter"
  >
    <slot/>
  </transition>
</template>

<script>
const DEFAULT_TRANSITION = `fade`;
const DEFAULT_TRANSITION_MODE = `out-in`;

export default {
  name: `TransitionPage`,
  data() {
    return {
      prevHeight: 0,
      prevWidth: 0,
      transitionName: DEFAULT_TRANSITION,
      transitionMode: DEFAULT_TRANSITION_MODE,
      transitionEnterActiveClass: ``,
    };
  },
  created() {
    this.$router.beforeEach((to, from, next) => {
      this.transitionMode = DEFAULT_TRANSITION_MODE;
      let transitionName = from.meta.transitionName || to.meta.transitionName || DEFAULT_TRANSITION;
      const depthDiff = from.path.split(`/`).length - to.path.split(`/`).length;
      const indexDiff = (to.meta.index || 0) - (from.meta.index || 0);
      if (depthDiff > 0) {
        transitionName = to.meta.transitionName;
      }
      if (depthDiff < 0) {
        transitionName = from.meta.transitionName;
      }

      if (transitionName === `slide`) {
        transitionName = indexDiff < 0 || depthDiff > 0 ? `slide-right` : `slide-left`;
        this.transitionMode = ``;
      }
      if (transitionName === `slide-vertical`) {
        transitionName = depthDiff > 0 ? `slide-vertical-down` : `slide-vertical-up`;
        this.transitionMode = ``;
      }
      this.transitionEnterActiveClass = `${transitionName}-enter-active`;
      if (to.meta.transitionName === `zoom`) {
        this.transitionMode = `in-out`;
        this.transitionEnterActiveClass = `zoom-enter-active`;
        document.body.style.overflow = `hidden`;
      }
      if (from.meta.transitionName === `zoom`) {
        this.transitionMode = null;
        this.transitionEnterActiveClass = null;
        document.body.style.overflow = null;
      }
      this.transitionName = transitionName;
      next();
    });
  },
  methods: {
    beforeLeave(element) {
      const style = getComputedStyle(element);
      this.prevHeight = style.height;
      this.prevWidth = style.width;
      element.style.height = this.prevHeight;
      element.style.width = this.prevWidth;
    },
    enter(element) {
      const { height, width } = getComputedStyle(element);
      // eslint-disable-next-line no-param-reassign
      element.style.height = this.prevHeight;
      element.style.width = this.prevWidth;
      setTimeout(() => {
        // eslint-disable-next-line no-param-reassign
        //element.style.height = height;
        //element.style.width = width;
      });
    },
    afterEnter(element) {
      // eslint-disable-next-line no-param-reassign
      element.style.height = `auto`;
      element.style.width = `auto`;
      if (element.className == 'page') {
        element.style.height = `100%`;
      }
    },
  },
};
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: height, opacity;
  transition-timing-function: ease;
  overflow: hidden;
}
.fade-enter,
.fade-leave-active {
  opacity: 0
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: .4s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
  position: absolute !important;
  top: 0;
  left: 0;
}
.slide-right-enter {
  transform: translate(-100%, 0);
}
.slide-left-enter {
  transform: translate(100%, 0);
}
.slide-right-leave-active,
.slide-left-leave-active,
.slide-left-enter-to {
  transform: translate(0%, 0);
}
.slide-left-leave-to {
  transform: translate(-100%, 0);
}
.slide-right-leave-to {
  transform: translate(100%, 0);
}
.slide-right-enter-to {
  transform: translate(0%, 0);
}
.slide-right-leave-to,
.slide-left-leave-to {
  opacity: 0;
}

.slide-vertical-up-enter-active,
.slide-vertical-up-leave-active,
.slide-vertical-down-enter-active,
.slide-vertical-down-leave-active {
  transition-duration: .35s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}
.slide-vertical-up-enter-to,
.slide-vertical-down-enter-to {
  transform: translate(0, -100%);
}
.slide-vertical-up-enter{
  transform: translate(0, 0%);
}
.slide-vertical-down-leave-active {
  opacity: 0;
  transform: translate(0, 100%);
}
.slide-vertical-up-leave-active {
  opacity: 0;
  transform: translate(0, -100%);
}
.slide-vertical-down-enter {
  opacity: 0;
  transform: translate(0, -200%);
}

.zoom-enter-active,
.zoom-leave-active {
  animation-duration: 0.4s;
  animation-fill-mode: both;
  animation-name: zoom;
}
.zoom-leave-active {
  animation-direction: reverse;
}
@keyframes zoom {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  100% {
    opacity: 1;
  }
}
</style>