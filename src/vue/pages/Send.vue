<template>
  <div class="scroll-view">

    <div class="overlay-dialog" :class="{visible: status=='success'}">
      <h2>The transaction has been sent.</h2>

      <p v-if="signedTx">
        <strong>Hash: {{signedTx.hash}}</strong><br>
        From: {{signedTx.from}}<br>
        To: {{signedTx.to}}<br>
        Amount: {{signedTx.amount}}<br>
        Nonce: {{signedTx.nonce}}
      </p>

      <div class="form-actions">
        <Button text="OK" primary="true" v-on:click.native="cancel" />
      </div>
    </div>

    <div class="overlay-dialog" :class="{visible: status=='confirm'}">
      <h2>Please confirm this transaction.</h2>

      <p v-if="signedTx">
        From: {{signedTx.from}}<br>
        To: {{signedTx.to}}<br>
        Amount: {{signedTx.amount}}<br>
        Nonce: {{signedTx.nonce}}
      </p>

      <div class="form-actions">
        <p v-if="error" class="error">{{error}}</p>
        <Button text="Confirm" primary="true" v-on:click.native="confirm" />
        <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
      </div>
    </div>

    <form class="form" autocomplete="off">
      <div class="form-line">
        <label>
          Recipient

          <input type="text" class="text-input" ref="address" v-model="transaction.to">
        </label>
      </div>

      <div class="form-line">
        <label>
          Amount

          <input type="number" class="text-input" v-model="transaction.amount">
        </label>
      </div>

      <div class="form-line">
        <label>
          Nonce

          <input type="number" class="text-input" v-model="transaction.nonce">
        </label>
      </div>

      <div class="form-line">
        <label>
          Data

          <input type="text" class="text-input" >
        </label>
      </div>

      <div class="form-actions">
        <p v-if="error" class="error">{{error}}</p>
        <Button text="Continue" primary="true" v-on:click.native="startConfirm" />
        <Button text="Cancel" class="secondary" v-on:click.native="cancel" />
      </div>
    </form>
  </div>
</template>

<script>
import controller from '../../controller';
import {CommitStatus} from 'herajs/src/client';

const defaultData = {
  transaction: {
    to: '',
    amount: 0,
    nonce: 1
  },
  signedTx: null,
  error: '',
  status: 'initial',
  lastTxHash: null,
};
export default {
  data () {
    return {...defaultData};
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
    async startConfirm () {
      this.error = '';
      const from = this.$route.params.address;
      await controller.accounts.unlock(from, 'testpass');
      const tx = {
          nonce: parseInt(this.transaction.nonce),
          from: from,
          to: this.transaction.to,
          amount: parseInt(this.transaction.amount),
          payload: null,
      };
      try {
        this.signedTx = await controller.accounts.signTransaction(tx);
        this.status = 'confirm';
      } catch (error) {
        let errorReason = 'Undefined error';
        if (error.code && error.code < Object.values(CommitStatus).length) {
          errorReason = Object.keys(CommitStatus)[Object.values(CommitStatus).indexOf(error.code)];
        }
        this.error = errorReason;
        console.log('failed to sign tx', errorReason, error, );
      }
    },
    async confirm () {
      try {
        this.lastTxHash = await controller.sendTransaction(this.signedTx);
        this.transaction.nonce = this.signedTx.nonce + 1;
        console.log('tx sent', this.lastTxHash, this.signedTx);
        this.status = 'success';
      } catch (error) {
        let errorReason = 'Undefined error';
        if (error.code && error.code < Object.values(CommitStatus).length) {
          errorReason = Object.keys(CommitStatus)[Object.values(CommitStatus).indexOf(error.code)];
        }
        this.error = errorReason;
        console.log('failed to send tx', errorReason, error, );
      }
    },
    cancel () {
      this.$data.transaction.to = defaultData.transaction.to;
      this.$data.transaction.amount = defaultData.transaction.amount;
      this.status = 'initial';
    }
  },
};
</script>

<style lang="scss">
.error {
  color: red;
}
.overlay-dialog {
  background: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  text-align: center;

  opacity: 0;
  transition: opacity .3s;
  pointer-events: none;
  &.visible {
    opacity: 1;
    pointer-events: all;
  }

  p {
    overflow-wrap: break-word;
    max-width: 100%;
  }
}
</style>