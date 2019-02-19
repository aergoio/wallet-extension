<template>
  <div class="scroll-view">
    <div v-if="state === 'loading'" class="loading-wrap">
      <Spinner size=30 />
    </div>
    <table class="tx-table" v-if="state === 'loaded'">
      <tr v-if="transactions.length === 0"><td class="empty-state">No transactions found.</td></tr>
      <tr v-for="tx in transactions" :key="tx.hash" :class="'status-'+tx.data.status">
        <td :title="moment(tx.data.ts)">{{moment(tx.data.ts).fromNow()}}</td>
        <td class="address-amount">
          <span class="address-amount-wrap">
            <span class="address">
              <span v-if="tx.data.to == tx.data.from" class="label">self-transfer</span>
              <span v-if="tx.data.to != tx.data.from && address == tx.data.from"><span class="label label-negative">to</span> {{tx.data.to | shortAddress(99)}}</span>
              <span v-if="tx.data.to != tx.data.from && address == tx.data.to"><span class="label label-positive">from</span> {{tx.data.from | shortAddress(99)}}</span>
            </span>
            <span class="amount" v-html="$options.filters.formatToken(tx.data.amount)"></span>
          </span>
        </td>
        <td><a :href="explorerLink(tx)" target="_blank" class="icon icon-view">view</a></td>
      </tr>
    </table>
  </div>
</template>

<script>
import { Amount } from '@herajs/client';
import { DEFAULT_CHAIN, chainProvider } from '../../controllers/chain-provider';
import moment from 'moment';
import Spinner from '../components/Spinner';
import { timedAsync } from 'timed-async';

export default {
  data () {
    return {
      transactions: [],
      state: 'initial'
    }
  },
  created () {
  },
  mounted () {
    this.load();
  },
  beforeDestroy () {
  },
  computed: {
    address() {
      return this.$route.params.address;
    }
  },
  components: {
    Spinner,
  },
  methods: {
    moment,
    explorerLink(tx) {
      return chainProvider(DEFAULT_CHAIN).explorerUrl(`/transaction/${tx.hash}`);
    },
    async load() {
      this.state = 'loading';
      try {
        this.transactions = await timedAsync(() => this.$store.dispatch('accounts/getAccountTx', { address: this.address }), { fastTime: 1500 });
      } catch(e) {
        this.state = 'error';
        console.error(e);
      }
      this.state = 'loaded';
    }
  },
};
</script>

<style lang="scss">
.tx-table {
  width: 100%;
  border-collapse: collapse;

  td {
    padding: 8px 5px;
    white-space: nowrap;
  }
  .address-amount {
    width: 100%;
    max-width: 0;

    .address-amount-wrap {
      display: flex;
      white-space: nowrap;
      .address {
        overflow: hidden;
        text-overflow: ellipsis; 
        margin-right: 5px;
        flex: 1;
      }
    }
  }
  
}

.loading-wrap {
  text-align: center;
  margin: 10px 0;
}

.empty-state {
  color: #444;
  text-align: center;
}

.status-pending {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 11px,
    rgba(0,0,0,0.05) 11px,
    rgba(0,0,0,0.05) 22px
  );
}
</style>