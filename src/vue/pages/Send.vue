<template>
  <div class="scroll-view">

    <div class="overlay-dialog" :class="{visible: status=='success'}">
      <h2>The transaction has been sent.</h2>

      <p v-if="signedTx">
        <strong>Hash: {{lastTxHash}}</strong><br>
        From: {{signedTx.from}}<br>
        To: {{signedTx.to}}<br>
        Amount: {{signedTx.amount}}
      </p>

      <div class="form-actions">
        <Button text="OK" primary="true" v-on:click.native="cancel" />
      </div>
    </div>

    <div class="overlay-dialog" :class="{visible: status=='confirm'}">
      <h2>Please confirm this transaction.</h2>

      <p v-if="signedTx" class="tx-verify">
        From: <Identicon :text="signedTx.from" /> {{signedTx.from}}<br>
        To: <Identicon :text="signedTx.to" /> {{signedTx.to}}<br>
        Amount: {{signedTx.amount}}
      </p>

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

          <span>
            <input type="number" class="text-input" :disabled="amountFixed" v-model="transaction.amount">
            <select v-model="transaction.amountUnit" :disabled="amountFixed" >
              <option>aergo</option>
              <option>aer</option>
              <option>gaer</option>
            </select>
          </span>
        </label>
      </div>

      <div class="form-line" v-if="payloadFormState == 'hidden'">
        <Button text="Add data" class="secondary" v-on:click.native="addPayload" />
      </div>

      <div class="form-line" v-if="payloadFormState == 'manual'">
        <label>
          Data

          <input type="text" class="text-input" v-model="transaction.payload">
        </label>
      </div>

      <div class="form-line" v-if="payloadFormState == 'name'">
        <label>
          Action

          <select v-model="payload.action">
            <option value="">Select...</option>
            <option value="c">Create</option>
            <option value="u">Update</option>
          </select>
        </label>
      </div>
      <div class="form-line" v-if="payloadFormState == 'name'">
        <label>
          Name

          <input type="text" class="text-input" v-model="payload.name">
        </label>
      </div>
      <div class="form-line" v-if="payloadFormState == 'name' && payload.action == 'u'">
        <label>
          New owner

          <input type="text" class="text-input" v-model="payload.newOwner">
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
import { CommitStatus } from '@herajs/client';
import { promisifySimple } from '../../utils/promisify';
import Identicon from '../components/Identicon';
import { Address } from '@herajs/client';

const defaultData = {
  transaction: {
    to: '',
    amount: 0,
    nonce: 1,
    amountUnit: 'aergo',
    payload: ''
  },
  signedTx: null,
  error: '',
  status: 'initial',
  lastTxHash: null,
  payloadFormState: 'hidden',
  payload: {
    action: "",
    name: "",
    newOwner: ""
  },
  amountFixed: false
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
  watch: {
    'transaction.to': function(to) {
      if (to === 'aergo.name') {
        this.payloadFormState = 'name';
        this.transaction.amount = '1';
        this.amountFixed = true;
      } else if (to === 'aergo.system') {
        this.payloadFormState = 'system';
      }
    },
    'payload.name': function(name) {
      if (this.payloadFormState === 'name' && name.length > 12) {
        this.error = 'Name is too long (max. 12 characters)';
      } else if (this.payloadFormState === 'name' && this.error) {
        this.error = '';
      }
    }
  },
  methods: {
    addPayload() {
      this.payloadFormState = 'manual';
    },
    async startConfirm () {
      this.error = '';
      const from = this.$route.params.address;
      const amount = this.transaction.amount.replace(/[^\d\.]/g, '');
      let payload = this.transaction.payload;
      let type = 0;
      if (this.payloadFormState === 'name') {
        payload = Buffer.from(this.payload.action + this.payload.name);
        if (this.payload.action == 'u') {
          payload = Buffer.concat([payload, Buffer.from(','), Address.decode(this.payload.newOwner)]);
        }
        payload = Array.from(payload);
        type = 1;
      }
      const tx = {
          from: from,
          to: this.transaction.to,
          amount: `${amount} ${this.transaction.amountUnit}`,
          payload,
          type
      };
      this.signedTx = tx;
      this.status = 'confirm';
    },
    async confirm () {
      const result = await promisifySimple(this.$background.sendTransaction)(this.signedTx);
      if ('tx' in result) {
        this.lastTxHash = result.tx.hash;
        console.log('tx sent', this.lastTxHash, this.signedTx);
        this.status = 'success';
      }

      if ('error' in result) {
        /*
        let errorReason = 'Undefined error';
        if (error.code && error.code < Object.values(CommitStatus).length) {
          errorReason = Object.keys(CommitStatus)[Object.values(CommitStatus).indexOf(error.code)];
        }
        this.error = errorReason;
        */
        this.error = result.error;
        console.log('failed to send tx', errorReason, error, );
      }
    },
    cancel () {
      this.transaction.to = defaultData.transaction.to;
      this.transaction.amount = defaultData.transaction.amount;
      this.status = 'initial';
      this.error = '';
    }
  },
  components: {
    Identicon,
  }
};
</script>

<style lang="scss">
.error {
  color: red;
}

.tx-verify {
  .identicon svg {
    width: 40px;
    height: 40px;
  }
}
</style>