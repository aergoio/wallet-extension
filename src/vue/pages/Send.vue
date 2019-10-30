<template>
  <div class="scroll-view">

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
        <Button text="OK" primary="true" v-on:click.native="cancel" />
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
      <h2>Do you confirm this transaction?</h2>

      <div v-if="signedTx" class="tx-verify">
        <span class="confirm-account">
          <Identicon :text="signedTx.fromAdr" />
          <span class="address">{{signedTx.fromAdr}}</span>
        </span>

        <span class="icon-fromto"></span>
          <br>
        <span class="confirm-account">
          <Identicon :text="signedTx.to" />
          <span class="address">{{signedTx.to || '(Create Contract)'}}</span>
        </span><br>
        Amount: <strong>{{signedTx.amount}}</strong>
        <div v-if="stringPayload && stringPayload.length">
          Data:
          <br>
          <pre class="dataConfirm">{{stringPayload}}</pre>
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
          Currently staked amount

          <span>
              {{stakedAmount}}
          </span>
        </label>
      </div>

      <div class="form-line" v-if="payloadFormState == 'system'">
        <label>
          Action

          <select v-model="payload.action">
            <option value="">Please select...</option>
            <option value="s">Stake</option>
            <option value="u">Unstake</option>
            <option value="v">Vote</option>
          </select>
        </label>
      </div>
      <div class="form-line" v-if="payloadFormState == 'system' && payload.action == 'v'">
        <label>
          Vote type

          <select v-model="payload.subAction">
            <option value="b">BP</option>
            <option value="p">Proposal</option>
          </select>
        </label>
      </div>
      <div class="form-line action-hint" v-if="payloadFormState == 'system' && payload.action == 's'">
        The specified amount will be staked. 
      </div>
      <div class="form-line action-hint" v-if="payloadFormState == 'system' && payload.action == 'u'">
        The specified amount will be unstaked. 
      </div>
      <div class="form-line action-hint" v-if="payloadFormState == 'system' && payload.action == 'v'">
        Your vote (weighted by previously staked amount)<br>will be cast for the specified {{payload.subAction == 'b' ? 'BPs' : 'proposal'}}.
      </div>
      <div class="form-line" v-if="payloadFormState == 'system' && payload.action == 'v' && payload.subAction == 'b'">
        <label>
          BP ids

          <input type="text" class="text-input input-field" placeholder="Comma-seperated peer ids" v-model="payload.voteTo">
        </label>
      </div>
      <div class="form-line" v-if="payloadFormState == 'system' && payload.action == 'v' && payload.subAction == 'p'">
        <label>
          Vote for

          <input type="text" class="text-input input-field" placeholder="Comma-seperated id and candidates" v-model="payload.voteTo">
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

          <input type="text" class="text-input input-field" v-model="payload.name" placeholder="Alphanumerical, 12 characters">
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
              <option>gaer</option>
              <option>aer</option>
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
import { Address, Amount } from '@herajs/client';
import bs58 from 'bs58';
import { timedAsync } from 'timed-async';
import Spinner from '../components/Spinner';
import { chainProvider } from '../../controllers/chain-provider';

function getDefaultData() {
  return {
    transaction: {
      to: '',
      amount: '0',
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
      subAction: "b",
      name: "",
      newOwner: "",
      voteTo: ""
    },
    slowQuery: false,
    amountFixed: false,
    stakedAmount: '...',
    stringPayload: '',
  };
}
export default {
  data () {
    return getDefaultData();
  },
  created () {
  },
  mounted () {
    this.cancel();
  },
  beforeDestroy () {
    this.cancel();
  },
  computed: {
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
        if (this.stakedAmount === '...') {
          promisifySimple(this.$background.getStaking)({
            chainId: this.chainId,
            address: this.address
          }).then(result => {
            if (result.amount) {
              this.stakedAmount = new Amount(result.amount).toUnit('aergo').toString();
            }
          });
        }
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
      function jsonPayload(data) {
        return Buffer.from(JSON.stringify(data));
      }

      this.error = '';
      const amount = this.transaction.amount.replace(/[^\d\.]/g, '');
      let stringPayload = this.transaction.payload;
      let payload = Buffer.from(this.transaction.payload);
      let type = 0;
      if (this.payloadFormState === 'name') {
        if (this.payload.name.length != 12) {
          this.error = `Name has to be 12 alphanumeric characters (currently ${this.payload.name.length})`;
          return;
        }
        let jsonData;
        if (this.payload.action == 'c') {
          jsonData = {
            Name: 'v1createName',
            Args: [this.payload.name]
          };
          payload = jsonPayload(jsonData);
        }
        if (this.payload.action == 'u') {
          jsonData = {
            Name: 'v1updateName',
            Args: [this.payload.name, this.payload.newOwner]
          };
          payload = jsonPayload(jsonData);
        }
        stringPayload = JSON.stringify(jsonData, undefined, 2);
        type = 1;
      }
      else if (this.payloadFormState === 'system') {
        let jsonData;
        if (this.payload.action == 's') {
          jsonData = {
            Name: 'v1stake',
            Args: []
          };
          payload = jsonPayload(jsonData);
        }
        if (this.payload.action == 'u') {
          jsonData = {
            Name: 'v1unstake',
            Args: []
          };
          payload = jsonPayload(jsonData);
        }
        if (this.payload.action == 'v' && this.payload.subAction == 'b') {
          jsonData = {
            Name: 'v1voteBP',
            Args: this.payload.voteTo.split(',')
          };
          payload = jsonPayload(jsonData);
        }
        if (this.payload.action == 'v' && this.payload.subAction == 'p') {
          jsonData = {
            Name: 'v1voteProposal',
            Args: this.payload.voteTo.replace(/\s+/g, '').split(',')
          };
          payload = jsonPayload(jsonData);
        }
        stringPayload = JSON.stringify(jsonData, undefined, 2);

        type = 1;
      }
      payload = Array.from(payload);
      const tx = {
          chainId: this.chainId,
          from: this.address,
          fromAdr: this.address,
          to: this.transaction.to,
          amount: `${amount} ${this.transaction.amountUnit}`,
          payload,
          type
      };
      this.signedTx = tx;
      this.stringPayload = stringPayload;
      console.log(tx);
      this.status = 'confirm';
    },
    async confirm () {
      this.status = 'sending';
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
        console.error('failed to send tx', result.error);
      } else {
        this.status = 'error';
        console.log(result);
      }
    },
    cancel () {
      Object.assign(this.$data, getDefaultData())
    }
  },
  components: {
    Identicon,
    Spinner,
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
