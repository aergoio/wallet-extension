<template>
  <div class="scroll-view">
    <PermissionRequest v-if="request.request" :url="request.request.senderURL" action="" object="sign a message" />

    <form class="form sign-form" autocomplete="off">
      <div class="form-line vertical">
        <label>
          Message

          <textarea v-if="!request || !request.request" class="text-input" v-model="message" style="height: 80px" placeholder="Enter hex string (0x...) or text"></textarea>

          <textarea v-if="request.request" class="text-input" style="height: 80px" v-model="request.request.data.hash" readonly></textarea>
        </label>
      </div>

      <div class="form-actions">
        <p v-if="error" class="error">{{error}}</p>
        <Button text="Sign" primary="true" v-on:click.native="sign" />
        <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
      </div>

      <div class="form-line vertical" v-if="signedMessage">
        <label>
          Signed message

          <textarea class="text-input" v-model="signedMessage" style="height: 60px" readonly></textarea>
        </label>
      </div>

      <p>
        A signature is a cryptographic proof that a message is authorized by an account.
        Signatures can be used to perform certain actions on your behalf.  
      </p>
    </form>
  </div>
</template>

<script>
import { promisifySimple } from '../../utils/promisify';
import { Address } from '@herajs/client';
import bs58 from 'bs58';
import { timedAsync } from 'timed-async';
import Spinner from '../components/Spinner';
import PermissionRequest from '../components/PermissionRequest';
import { mapState } from 'vuex';

export default {
  data () {
    return {
      message: '',
      signedMessage: '',
      error: ''
    };
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
    ...mapState({
      request: state => state.navigation.activeRequest ? state.navigation.activeRequest : {},
    }),
    address() {
      return this.$route.params.address && this.$route.params.address.split('/').pop();
    },
    chainId() {
      const split = this.$route.params.address.split('/');
      split.pop();
      return this.$route.params.address && split.join('/');
    },
  },

  watch: {
    request() {
      console.log('r', this.request);
      this.message = this.request.request;
    },
  },

  methods: {
    async sign () {
      this.status = 'sending';
      this.signedMessage = '';
      this.error = '';
      let message = this.message;
      if (this.request && this.request.requestId) {
        message = this.request.request.data.hash;
      }
      let buf = Buffer.from(message);
      if (message.substr(0, 2) === '0x') {
        try {
          buf = Buffer.from(message.substr(2), "hex");
        } catch (e) {
          this.error = '' + e;
          return;
        }
      }
      const result = await promisifySimple(this.$background.signMessage)({
        address: this.address,
        chainId: this.chainId,
        message: Array.from(Uint8Array.from(buf))
      });
      if (result.error) {
        this.error = result.error;
      } else {
        this.signedMessage = '0x' + result.signedMessage;
      }

      if (this.request && this.request.requestId) {
        await promisifySimple(this.$background.respondToPermissionRequest)({ requestId: this.request.requestId, result: {
          account: {
            address: this.address,
            chainId: this.chainId,
          },
          signature: result.signedMessage,
        }});
        window.close();
      }
    },
    async cancel () {
      this.message = '';
      this.signedMessage = '';
      if (this.request && this.request.requestId) {
        await promisifySimple(this.$background.denyPermissionRequest)(this.request.requestId);
        window.close();
      }
    }
  },
  components: {
    PermissionRequest,
  }
};
</script>

<style lang="scss">
.sign-form .form-line {
  border-bottom: 0;
}
</style>