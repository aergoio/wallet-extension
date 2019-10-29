<template>
  <div class="scroll-view">
    <PermissionRequest v-if="request.request" :url="request.request.senderURL" action="" object="send a transaction" />

    <div style="position: relative">

      <div class="overlay-dialog" :class="{visible: status=='sending'}">
        <div class="loading-wrap">
          <Spinner size=30 />
        </div>
        <div v-if="slowQuery">
          Sending is taking longer than usual.<br>You can wait or cancel the transaction.
          <div class="form-actions">
            <Button text="Cancel" primary="true" v-on:click.native="cancelSend" />
          </div>
        </div>
      </div>

      <div class="overlay-dialog" :class="{visible: status=='success'}">
        <span class="icon icon-success"></span>
        
        <h2>The transaction has been sent.</h2>

        <p v-if="signedTx">
          <strong>Hash: {{lastTxHash}}</strong><br>
          <a :href="explorerLink" target="_blank" v-if="explorerLink">Open in Aergoscan</a>
        </p>

        <div class="form-actions">
          <Button text="OK" primary="true" v-on:click.native="finish" />
        </div>
      </div>

      <div class="overlay-dialog" :class="{visible: status=='error'}">
        <span class="icon icon-fail"></span>
        
        <h2>An error occured.</h2>

        <p class="error">{{error}}</p>

        <div class="form-actions">
          <Button text="Go back" primary="true" v-on:click.native="cancel" />
        </div>
      </div>

      <div class="overlay-dialog" :class="{visible: status=='confirm'}">

        <div v-if="signedTx" class="tx-verify">
          <span class="confirm-account">
            <Identicon :text="address" />
            <span class="address">{{address}}</span>
          </span>

          <span class="icon-fromto"></span>
            <br>
          <span class="confirm-account">
            <Identicon :text="txData.to" />
            <span class="address">{{txData.to || '(Create Contract)'}}</span>
          </span><br>
          Amount: <strong>{{txData.amount}}</strong>
          <div v-if="payloadDisplay && payloadDisplay.length">
            Data:
            <br>
            <pre class="dataConfirm">{{payloadDisplay}}</pre>
          </div>
        </div>

        <div class="form-actions">
          <p v-if="error" class="error">{{error}}</p>

          <div v-if="!error">
            <Button text="Confirm" primary="true" v-on:click.native="confirm" />
            <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
          </div>
          <div v-if="error">
            <Button text="Go back" primary="true" v-on:click.native="cancel" />
          </div>
        </div>
      </div>

      <div class="overlay-dialog" :class="{visible: !$route.params.address || $route.params.address === 'none'}">
        <p class="error">Please select an account before continuing.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { CommitStatus } from '@herajs/client';
import { promisifySimple } from '../../utils/promisify';
import Identicon from '../components/Identicon';
import { Address, Amount } from '@herajs/client';
import bs58 from 'bs58';
import { timedAsync } from 'timed-async';
import Spinner from '../components/Spinner';
import { chainProvider } from '../../controllers/chain-provider';
import PermissionRequest from '../components/PermissionRequest';
import { mapState } from 'vuex';

export default {
  data () {
    return {
      status: 'confirm',
      slowQuery: false,
      signedTx: {},
      error: '',
      lastTxHash: '',
    }
  },
  created () {
  },
  mounted () {
    console.log(this.$store.state);
  },
  computed: {
    ...mapState({
      request: state => state.navigation.activeRequest ? state.navigation.activeRequest : {},
      txData: state => state.navigation.activeRequest && state.navigation.activeRequest.request ? state.navigation.activeRequest.request.data : {}, 
    }),
    address() {
      return this.$route.params.address && this.$route.params.address.split('/').pop();
    },
    chainId() {
      if (!this.$route.params.address) return '';
      const split = this.$route.params.address.split('/');
      split.pop();
      return split.join('/');
    },
    explorerLink() {
      return chainProvider(this.signedTx.chainId).explorerUrl(`/transaction/${this.lastTxHash}`);
    },
    payloadParsed() {
      const txData = this.txData;
      if (txData.payload_json) {
          return Buffer.from(JSON.stringify(txData.payload_json));
      }
      return Buffer.from(txData.payload, 'base64')
    },
    payloadDisplay() {
      const txData = this.txData;
      if (txData.payload_json) {
          return JSON.stringify(txData.payload_json, null, 2);
      }
      return txData.payload;
    },
  },
  methods: {
    async confirm () {
      this.error = '';
      this.status = 'sending';

      const txData = {...this.txData};
      txData.payload = this.payloadParsed;
      this.signedTx = {
          chainId: this.chainId,
          from: this.address,
          to: txData.to,
          amount: txData.amount,
          payload: Array.from(txData.payload),
          type: txData.type,
      };
      console.log(this.signedTx);

      const result = await timedAsync(() =>
          promisifySimple(this.$background.sendTransaction)(this.signedTx, this.signedTx.chainId),
          { fastTime: 1000, slowTime: 5000, slow: () => {
            this.slowQuery = true;
          } }
      );
      if ('tx' in result) {
        this.lastTxHash = result.tx.hash;
        console.log('tx sent', this.lastTxHash, this.signedTx);
        this.status = 'success';
      } else if ('error' in result) {
        this.error = result.error;
        this.status = 'error';
        console.error('failed to send tx', error);
      } else {
        this.status = 'error';
        console.log(result);
      }

      if (this.request && this.request.requestId) {
        await promisifySimple(this.$background.respondToPermissionRequest)({ requestId: this.request.requestId, result: {
          account: {
            address: this.address,
            chainId: this.chainId,
          },
          hash: result.tx.hash,
        }});
      }
    },
    finish () {
      window.close();
    },
    async cancel () {
      if (this.request && this.request.requestId) {
        await promisifySimple(this.$background.denyPermissionRequest)(this.request.requestId);
        window.close();
      }
    }
  },
  components: {
    Identicon,
    Spinner,
    PermissionRequest,
  }
};
</script>

<style lang="scss">
.error {
  color: red;
}

.tx-verify {
  .identicon {
    margin-right: 5px;
    line-height: 1;
  }
  .identicon, .identicon svg {
    width: 40px;
    height: 40px;
  }
}

.input-field {
  width: 200px;
  box-sizing: border-box;
}

.action-hint {
  text-align: center;
  color: #666;
}

.overlay-dialog {
  h2 {
    margin: 0 0 .5em;
  }
}

.confirm-account {
  display: flex;
  align-items: center;

  .identicon {

  }
  .address {
    flex: 1;
    text-align: left;
  }
}

.dataConfirm {
  text-align: left;
  margin: 0 auto;
  display: inline-block;
}

.icon-fromto {
  display: inline-block;
  background: url(~@assets/img/icon-fromto-to.svg);
  width: 24px;
  height: 24px;
  background-size: 100%;
}
</style>