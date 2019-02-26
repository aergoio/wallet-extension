<template>
  <div class="scroll-view">

    <div class="overlay-dialog" :class="{visible: status=='success'}">
      <h2>The transaction has been sent.</h2>

      <p v-if="signedTx">
        <strong>Hash: {{lastTxHash}}</strong><br>
        From: {{signedTx.fromAdr}}<br>
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
        From: <Identicon :text="signedTx.fromAdr" /> {{signedTx.fromAdr}}<br>
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
          Type

          <select v-model="transaction.uiType">
              <option value="">Normal</option>
              <option value="aergo.name">Name System</option>
              <option value="aergo.system">Staking &amp; Voting</option>
            </select>
        </label>
      </div>
      
      <div class="form-line">
        <label>
          Recipient

          <input type="text" class="text-input input-field" ref="address" v-model="transaction.to" :disabled="transaction.uiType!==''">
        </label>
      </div>

      

      <div class="form-line" v-if="payloadFormState == 'system'">
        <label>
          Action

          <select v-model="payload.action">
            <option value="">Please select...</option>
            <option value="s">Stake</option>
            <option value="v">Vote</option>
          </select>
        </label>
      </div>
      <div class="form-line action-hint" v-if="payloadFormState == 'system' && payload.action == 's'">
        The specified amount will be staked. 
      </div>
      <div class="form-line action-hint" v-if="payloadFormState == 'system' && payload.action == 'v'">
        Your vote (weighted by previously staked amount)<br>will be cast for the specified BPs. 
      </div>
      <div class="form-line" v-if="payloadFormState == 'system' && payload.action == 'v'">
        <label>
          BP ids

          <input type="text" class="text-input input-field" placeholder="Comma-seperated peer ids" v-model="payload.bpIds">
        </label>
      </div>

      <div class="form-line" v-if="payloadFormState == 'name'">
        <label>
          Action

          <select v-model="payload.action">
            <option value="">Please select...</option>
            <option value="c">Create</option>
            <option value="u">Update</option>
          </select>
        </label>
      </div>
      <div class="form-line action-hint" v-if="payloadFormState == 'name' && payload.action == 'c'">
        A new name will be assigned to your account. 
      </div>
      <div class="form-line action-hint" v-if="payloadFormState == 'name' && payload.action == 'u'">
        The name's owner will be updated. 
      </div>
      <div class="form-line" v-if="payloadFormState == 'name' && payload.action !== ''">
        <label>
          Name

          <input type="text" class="text-input input-field" v-model="payload.name">
        </label>
      </div>
      <div class="form-line" v-if="payloadFormState == 'name' && payload.action === 'u'">
        <label>
          New owner

          <input type="text" class="text-input input-field" v-model="payload.newOwner">
        </label>
      </div>

      <div class="form-line" v-if="transaction.uiType == '' || payload.action !== ''">
        <label>
          Amount

          <span class="input-field">
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

      <div class="form-line vertical" v-if="payloadFormState == 'manual'">
        <label>
          Data

          <textarea class="text-input" v-model="transaction.payload"></textarea>
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
import bs58 from 'bs58';

const defaultData = {
  transaction: {
    to: '',
    amount: 0,
    nonce: 1,
    amountUnit: 'aergo',
    payload: '',
    uiType: ''
  },
  signedTx: null,
  error: '',
  status: 'initial',
  lastTxHash: null,
  payloadFormState: 'hidden',
  payload: {
    action: "",
    name: "",
    newOwner: "",
    bpIds: ""
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
       this.amountFixed = false;
      if (to === 'aergo.name') {
        this.payloadFormState = 'name';
        this.transaction.amount = '1';
        this.amountFixed = true;
      } else if (to === 'aergo.system') {
        this.payloadFormState = 'system';
      } else if (this.payloadFormState === 'system' || this.payloadFormState === 'name') {
        this.payloadFormState = 'hidden';
      }
    },
    'transaction.uiType': function(uiType, oldUiType) {
      if (uiType !== '') {
        this.transaction.to = uiType;
      }
      if (uiType === '' && this.transaction.to === oldUiType) {
        this.transaction.to = '';
      }
      if (uiType !== 'aergo.name' && 'aergo.name' === oldUiType) {
        this.transaction.amount = '0';
      }
      if (uiType !== oldUiType) {
        this.payload.action = '';
      }
    },
    'payload.action': function(action) {
      if (this.transaction.to == 'aergo.system' && action == 'v') {
        this.transaction.amount = '0';
        this.amountFixed = true;
      } else if (this.transaction.to == 'aergo.system') {
        this.amountFixed = false;
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
      let payload = Buffer.from(this.transaction.payload);
      let type = 0;
      if (this.payloadFormState === 'name') {
        payload = Buffer.from(this.payload.action + this.payload.name);
        if (this.payload.action == 'u') {
          payload = Buffer.concat([payload, Buffer.from(','), Address.decode(this.payload.newOwner)]);
        }
        type = 1;
      }
      else if (this.payloadFormState === 'system') {
        payload = Buffer.from(this.payload.action);
        if (this.payload.action == 'v') {
          const bpids = this.payload.bpIds.split(',').map(id => bs58.decode(id));
          payload = Buffer.concat([payload, ...bpids]);
        }
        type = 1;
      }
      payload = Array.from(payload);
      const tx = {
          from: from,
          fromAdr: from.split('/')[1],
          to: this.transaction.to,
          amount: `${amount} ${this.transaction.amountUnit}`,
          payload,
          type
      };
      this.signedTx = tx;
      console.log(tx);
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
      this.transaction.uiType = '';
      this.payloadFormState = 'hidden';
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

.input-field {
  width: 200px;
  box-sizing: border-box;
}

.action-hint {
  text-align: center;
  color: #666;
}
</style>