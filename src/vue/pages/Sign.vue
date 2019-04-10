<template>
  <div class="scroll-view">
    <form class="form" autocomplete="off">
 
      <div class="form-line vertical">
        <label>
          Message

          <textarea class="text-input" v-model="message" style="height: 80px" placeholder="Enter hex string (0x...) or text"></textarea>
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
    address() {
      return this.$route.params.address && this.$route.params.address.split('/')[1];
    },
    chainId() {
      return this.$route.params.address && this.$route.params.address.split('/')[0];
    }
  },

  methods: {
    async sign () {
      this.status = 'sending';
      this.signedMessage = '';
      this.error = '';
      let buf = Buffer.from(this.message);
      if (this.message.substr(0, 2) === '0x') {
        try {
          buf = Buffer.from(this.message.substr(2), "hex");
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
    },
    cancel () {
      this.message = '';
      this.signedMessage = '';
    }
  },
  components: {
  }
};
</script>

<style lang="scss">
</style>