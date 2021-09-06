<template>
<div class="container center">

  <div class="section-header ">
      <!-- SECTION HEADER INFO -->
      <div class="section-header-info">
        <!-- SECTION PRETITLE -->
        <p class="section-pretitle">Explorer</p>
        <!-- /SECTION PRETITLE -->
        <!-- SECTION TITLE -->
        <h2 class="section-title">Account <span class="highlighted"></span></h2>
        <!-- /SECTION TITLE -->
      </div>
      <!-- /SECTION HEADER INFO -->
    </div>
    <div class="grid grid-12 small-space">
      <!-- GRID COLUMN -->
      <div class="grid-column">
        <!-- TABLE WRAP -->
        <div class="table-wrap" data-simplebar>
          <!-- TABLE -->
          <div class="table table-cart split-rows">
            <!-- TABLE HEADER -->
            <!-- /TABLE HEADER -->
        
            <!-- TABLE BODY -->
            <div v-if="info">
              <!-- TABLE ROW -->

              <!-- TABLE ROW -->
              <table>
                  <thead>
                      <tr>
                        <th>TrxId</th>
                        <th>Action</th>
                        <th>From</th>
                        <th>To</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(item,index) in info" :key="index">
                        <td class="td-trx" width="100"><a class="trx-link" v-bind:href="'https://wax.bloks.io/transaction/'+ item.action_trace.trx_id">{{item.action_trace.trx_id}}</a></td>
                        <td>{{item.action_trace.act.name}}</td>
                        <td>{{item.action_trace.act.data.from}}</td>
                        <td>{{item.action_trace.act.data.to}}</td>
                      </tr>
                  </tbody>
              </table>
              <!-- /TABLE ROW -->
            </div>
            <!-- /TABLE BODY -->
          </div>
          <!-- /TABLE -->
        </div>
        <!-- /TABLE WRAP -->
      </div>
      <!-- /GRID COLUMN -->
    </div>
</div>
</template>

<script>
import axios from 'axios'
import router from '../router'
export default {
    name:"account",
    data(){
        return {
            "info":null,
            "apiRes":null
        }
    },
  mounted () {
    if(!localStorage.getItem('wax_user')) {
        router.push('/login')
    }
    this.emitter.on("search-asset", term => {
      var record = this.apiRes;
      this.info = record.filter(function(item){
        let row = item.action_trace.act.data;
        const regexStr = '(?=.*' + term.split(/\,|\s/).join(')(?=.*') + ')';//eslint-disable-line
        const searchRegEx = new RegExp(regexStr, 'gi');
        return (row["from"]!==undefined && row.from.match(searchRegEx) !== null) || (row["to"]!==undefined && row.to.match(searchRegEx) !== null);
      });
    });
    axios
      .post(`https://api.waxsweden.org/v1/history/get_actions?owner=${localStorage.getItem('wax_user')}&page=1&limit=10000&order=desc`,
      {
        account_name: localStorage.getItem('wax_user'),
        offset: -100,
        pos: -1
      })
      .then(response => {
        let res = response.data.actions
        this.info = res
        this.apiRes = res
      })
  },
}
</script>
<style>
.center {
  margin: auto;
  width: 80%;
  padding: 10px;
}
/* .trx-link {
 width:10%;
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
 display: inline-block;
 } */
 table{
     color:#fff;
     text-align: left;
 }
 .td-trx{
     width: 100px;
 }
</style>