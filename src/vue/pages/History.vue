<template>
  <div class="scroll-view">
    <table class="tx-table">
      <tr v-for="tx in transactions" :key="tx.hash">
        <td :title="moment(tx.data.ts)">{{moment(tx.data.ts).fromNow()}}</td>
        <td>
          <span v-if="tx.data.to == tx.data.from" class="label">self-transfer</span>
          <span v-if="tx.data.to != tx.data.from && address == tx.data.from"><span class="label label-negative">to</span> {{tx.data.to | shortAddress}}</span>
          <span v-if="tx.data.to != tx.data.from && address == tx.data.to"><span class="label label-positive">from</span> {{tx.data.from | shortAddress}}</span>
        </td>
        <td>{{formatAmount(tx.data.amount)}}</td>
        <td><a :href="explorerLink(tx)" target="_blank">view</a></td>
      </tr>
    </table>
  </div>
</template>

<script>
import { Amount } from '@herajs/client';
import { DEFAULT_CHAIN, chainProvider } from '../../controllers/chain-provider';
import moment from 'moment';

export default {
  data () {
    return {
      transactions: []
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
  methods: {
    moment,
    explorerLink(tx) {
      return chainProvider(DEFAULT_CHAIN).explorerUrl(`/transaction/${tx.hash}`);
    },
    formatAmount(amount) {
      return (new Amount(amount, 'aer')).toUnit('aergo').toString();
    },
    async load() {
      this.transactions = await this.$store.dispatch('accounts/getAccountTx', { address: this.address });
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
  }
}
</style>