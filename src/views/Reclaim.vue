<template>
  <loading v-model:active="isLoading" :is-full-page="fullPage" />

  <section class="login pt-50">
    <div class="container" id="app">
      <div class="section-filters-bar justify-content-center v2">
        <!-- FORM -->
        <form class="form">
          <!-- FORM ITEM -->
          <div class="form-item split medium">
            <!-- FORM INPUT DECORATED -->
            <div class="form-input-decorated">
              <!-- FORM INPUT -->
              <div class="form-input small mb-4">
                <input
                  type="text"
                  id="search-asset"
                  name="search_asset"
                  v-model="searchTerm"
                  @keyup="searchAsset($event)"
                  placeholder="Name search"
                />
              </div>
            </div>
            <div class="form-select mb-4">
              <label for="quest-filter-criteria">Filter By</label>
              <select
                id="quest-filter-criteria"
                name="quest_filter_criteria"
                @change="filterChanged($event)"
              >
                <option value="">Select option</option>
                <option value="transfered_order_new"
                  >Transfered (Newest)</option
                >
                <option value="transfered_order_old"
                  >Transfered (Oldest)</option
                >
                <option value="created_order_new">Created (Newest)</option>
                <option value="created_order_old">Created (Oldest)</option>
                <option value="alphabetical_a_z">Alphabetical (A-Z)</option>
                <option value="alphabetical_z_a">Alphabetical (Z-A)</option>
                <option value="only_duplicate_templates">Only Duplicate</option>
              </select>
              <!-- FORM SELECT ICON -->
              <svg class="form-select-icon icon-small-arrow">
                <use xlink:href="#svg-small-arrow"></use>
              </svg>
              <!-- /FORM SELECT ICON -->
            </div>
            <!-- /FORM SELECT -->

            <!-- FORM SELECT -->
            <div class="form-select mb-4">
              <label for="quest-filter-order">Collections</label>
              <select
                id="quest-filter-order"
                name="quest_filter_order"
                v-model="userCollection"
                @change="collectionChanged($event)"
              >
                <option value="">All</option>
                <option
                  v-for="(collection, cindex) in collections"
                  :key="cindex"
                  :value="collection.collection_name"
                  >{{ collection.name }}</option
                >
              </select>
              <!-- FORM SELECT ICON -->
              <svg class="form-select-icon icon-small-arrow">
                <use xlink:href="#svg-small-arrow"></use>
              </svg>
              <!-- /FORM SELECT ICON -->
            </div>
            <!-- /FORM SELECT -->

            <!-- BUTTON -->
            <button class="button small secondary" @click.prevent="clear()">
              Load all assets
            </button>
            <button class="button small secondary mt-3 mt-md-0" @click.prevent="reclaimBulk()">
              Reclaim all
            </button>
            <!-- /BUTTON -->
          </div>
          <!-- /FORM SELECT -->
        </form>
        <!-- /FORM -->
      </div>

      <div class="row justify-content-center" v-if="!loading">
        <ReclaimAssetCard
          v-for="(item, index) in inventory"
          :key="index"
          :row="index"
          :info="item"
          :level="levels"
          :state="state"
          v-on:transfer-click="transfer"
          v-on:stack-click="stack"
        />
      </div>
    </div>

    <teleport to="body">
      <div v-if="showStackModal">
        <transition name="modal">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Reclaim Asset</h5>
                    <button
                      type="button"
                      class="close modal-close text-purple"
                      data-dismiss="modal"
                      aria-label="Close"
                      @click="showStackModal = false"
                    >
                      <span aria-hidden="true" class="text-purple"
                        >&times;</span
                      >
                    </button>
                  </div>
                  <div class="modal-body">
                    <p id="error-msg" v-if="error">{{ error }}</p>
                    <p id="success-msg" v-if="success">{{ success }}</p>

                    <div class="row">
                      <div class="col mt-3">
                        <template v-if="row.data.video">
                          <video
                            height="150"
                            width="150"
                            class="center-dev"
                            autoplay loop muted
                          >
                          <source
                            :src="getImgUrl(row.data.video)"
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                        </template>
                        <template v-else>
                          <img
                            class="modal-img center-dev"
                            height="150"
                            width="150"
                            :src="getImgUrl(row.data.img)"
                            alt="badge-bronze-b"
                            v-show="isModalImageLoaded"
                            @load="ModalLoaded"
                          >
                          <img class="img-loader loading" v-if="!isModalImageLoaded && 'img' in row.data" :src="'/img/img-loader.gif'">
                        </template>
                        <br />
                        <p class="text-title text-center">
                          {{ row.data.name }}
                        </p>
                        <p class="text-title text-center">
                          <strong>Owner:{{ owner }}</strong>
                        </p>
                        <form @submit.prevent="OnUnStake" class="mt-5 mb-5">
                          <!-- <div class="form-group">
                            <label for="pwd" class="ml-2">Owner:</label>
                            <input
                              type="text"
                              name="owner"
                              v-model="owner"
                              class="form-control"
                              placeholder="Enter Owner of the asset"
                            />
                          </div> -->
                          <!-- <div class="form-group">
                            <label for="pwd" class="ml-2">Asset Id:</label>
                            <input
                              type="text"
                              name="asset_id"
                              v-model="asset_id"
                              class="form-control"
                              placeholder="Enter assset id"
                            />
                          </div> -->
                          <button type="submit" class="button secondary">
                            Reclaim
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </teleport>
  </section>
</template>

<script lang="js">
import axios from 'axios'
import router from '../router'
import ReclaimAssetCard from '../components/ReclaimAssetCard'
import Loading from 'vue-loading-overlay';
import * as ApiService from "../_services/Service";
import {mapGetters} from "vuex"
export default {
  name: 'reclaim',
  components:{
    ReclaimAssetCard,
    Loading
  },
  data () {
    return {
      levels: null,
      apiRes: null,
      info: null,
      state: null,
      status: false,
      assetId:"",
      ids:"",
      searchTerm:null,
      row:{},
      account:"",
      owner:localStorage.getItem('wax_user'),
      isModalImageLoaded:false,
      asset_id:"",
      assetIds:[],
      showModal: false,
      showStackModal: false,
      loading: true,
      collections: {},
      userCollection:"Select",
      userFilter:"Select option",
      error:false,
      success:false,
      userAccount:"",
      isLoading: false,
      fullPage: false
    }
  },
  computed: {
    ...mapGetters([
      'tblState',
      'inventory',
      'tinfos',
      'stakes'
    ])
  },
  created () {
    this.$store.commit('updateLoadedComponent', "Reclaim")
    this.$store.dispatch("getState");
    this.$store.dispatch("getStakes");
    // this.$store.dispatch("getTinfos");
  },
  async mounted () {
    if(!ApiService.isLogin()) {
      router.push('/login')
    }
    this.userAccount = localStorage.getItem('wax_user')
    this.emitter.on("search-asset", searchTerm => {
      this.searchTerm = searchTerm;
      this.searchAsset()
    });
    this.fetchLevels()
  },
  
  methods: {
    clear(){
      this.searchTerm = "";
      this.userCollection = "Select";
      this.userFilter="Select option",
      this.fetchLevels()
    },
    ModalLoaded(){
    this.isModalImageLoaded = true
  },
    searchAsset(){
      if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.search();
      }, 500);
    },
    getImgUrl(pet) {
        return ApiService.getImgUrl(pet)
    },
    collectionChanged(event){
      this.userCollection = event.target.value
      this.search();
    },
    filterChanged(event){
      this.userFilter = event.target.value
      this.search();
    },
    search(){
      const params = ApiService.makeRequestParams(this.userFilter,this.searchTerm,this.userCollection);
      this.init(params);
    },
    transfer(assetId,row){
      this.assetId = assetId;
      this.showModal = true;
      this.error = "";
      this.success = "";
      this.row = row;
    },
    stack(assetId,row){
      this.asset_id = assetId;
      this.row = row;
      this.showStackModal = true;
      this.error = "";
      this.success = "";
    },
    async OnUnStake(){
      await this.reclaim(this.asset_id,this.owner);
    },
    async reclaim(assetId,toAccount){
      this.clearLogs()
    let userAccount = localStorage.getItem("wax_user")
    if(localStorage.getItem("ual-session-authenticator")!="Wax"){
      await ApiService.doSign({
        account: process.env.VUE_APP_CONTRACT,
        name: 'reclaim',
        authorization: [{
          actor: userAccount,
          permission: 'active',
        }],
        data: {
          owner: toAccount,
          asset_id:assetId
        },
      },((res)=>{
        if(res.processed.id){
          this.error = "";
          this.success = "Transaction done"
          setTimeout(() => {
            this.fetchLevels()
            this.showStackModal = false;
          }, 1000);
        }
      }),((error)=>{
        console.log(error.what);
        if(error.what){
          this.error = error.what;
        }else{
          this.error = error
        }
        this.success = ""
      }));
      return;
    }
      await ApiService.signWithWaxGeneric({
      actions: [{
        account: process.env.VUE_APP_CONTRACT,
        name: 'reclaim',
        authorization: [{
          actor: userAccount,
          permission: 'active',
        }],
        data: {
          owner: toAccount,
          asset_id:assetId
        },
      }]
    },((error)=>{
          this.success = "";
          if(error.what){
            this.error = error.what;
          }else{
            this.error = error
          }
      }),((result)=>{
        if(result.processed.id){
          this.error = "";
          this.success = "Transaction done"
          setTimeout(() => {
            this.fetchLevels()
            this.showStackModal = false;
          }, 1000);
        }
      }));
  },
    async reclaimBulk(){
      this.clearLogs()
      let userAccount = localStorage.getItem('wax_user')
      var actions = [];
      if(!this.info.length){
        return;
      }
      for (let index = 0; index <= this.info.length; index++) {
        let row = this.info[index];
        if(row && typeof row.asset_id !== 'undefined'){
            actions.push({
              account: process.env.VUE_APP_CONTRACT,
              name: 'reclaim',
              authorization: [{
                actor: userAccount,
                permission: 'active',
              }],
              data: {owner: userAccount,asset_id:row.asset_id},
            });
        }
      }

    if(localStorage.getItem("ual-session-authenticator")!="Wax"){
      await ApiService.doSign(actions,((res)=>{
        if(res.processed.id){
          this.error = "";
          this.success = "Transaction done"
        }
      }),((error)=>{
        this.success = "";
        if(error.what){
          this.error = error.what;
        }else{
          this.error = error
        }
      }));
      this.fetchLevels()
      return;
    }
      await ApiService.signWithWaxGeneric({actions: actions},((error)=>{
          this.success = "";
          if(error.what){
            this.error = error.what;
          }else{
            this.error = error
          }
      }),((result)=>{
        if(result.processed.id){
          this.error = "";
          this.success = "Transaction done"
        }
      }));
      this.fetchLevels()
  },
  init(params) {
    if(!this.ids){
      return;
    }
    this.isLoading = true
    axios
      .get(`${process.env.VUE_APP_API_ASSET_URL}?page=1&ids=${this.ids}&limit=10000${params}`)
      .then(response => {
        let res = response['data']
        if(res['success']) {
          this.info = res['data']
          this.$store.commit('updateInventory', res['data'])
          this.collectionOptions(params,this.info);
          this.status = true
        } else {
          this.info = []
          this.status = false
        }
        this.loading = false;
        this.isLoading = false
      })
  },
  collectionOptions(params,res){
    if(params==""){
          var collections = Object.keys(this.info).map(function(k){
            return res[k].collection;
        });
        this.collections = collections.reduce((col, current) => {
          const x = col.find(item => item.collection_name === current.collection_name);
          if (!x) {
            return col.concat([current]);
          } else {
            return col;
          }
        }, []);
    }
    if(this.userCollection!="Select" && this.userFilter=="stakable"){
      this.info = res.filter(function(item){
            let coll = item.collection.collection_name.toLowerCase();
            return (coll=="hodlgod" || coll=="dappradarnft" || coll=="elementalnft");
      });
    }
  },
  async fetchLevels(){
      var levels = await ApiService.getTinfosWithLimit(null);
      this.levels = levels.rows;
      var finala = levels.rows;
      while (levels.more) {
        levels = await ApiService.getTinfosWithLimit(levels.next_key);
        finala = [...finala,...levels.rows];
      }
      this.levels = finala;
      this.$store.commit('updateTinfos', finala)
      this.ids = "";
      for (var i = 0; i < finala.length; i++){
        let comma = (this.ids==="") ? "":",";
        if(finala[i].owner==this.userAccount){
          this.ids = `${this.ids}${comma}${finala[i].asset_id}`
        }
      }
      if(this.ids){
        this.init("")
      }else{
        this.$store.commit('updateInventory', [])
      }
  },
  clearLogs(){
    this.success = '';
    this.error = '';
  }
  }
}
</script>

<style>
.modal-mask {
  overflow: hidden !important;
}
</style>
<style scoped>
.container {
  max-width: 100% !important;
  padding: 0px 100px 0px 30px;
}

.section-filters-bar form {
  width: auto !important;
}
.pt-50 {
  padding-top: 50px;
}
.card-tx {
  color: #000;
}
.modal-mask {
  position: fixed;
  z-index: 9995 !important;
  top: 0;
  left: 0;
  width: 100%;
  overflow: scroll;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
  margin-top: 60px;
}

.modal-close {
  width: 50px;
}

.modal-body {
  background-color: #1d2333 !important;
}
.modal-body .badge-item-stat {
  width: 200px;
}
.modal-body .text-title {
  color: #c7c8cc;
  text-align: center;
  font-size: 18px;
  /* margin-bottom: 1rem; */
}
.modal-body .badge-item-stat-image {
  width: 150px !important;
}
.modal-wrapper {
  position: relative;
  display: table-cell;
  vertical-align: left;
  z-index: 9996 !important;
}
a,
h1,
h2,
h3,
h4,
h5,
h6,
p {
  color: rgb(31, 29, 29);
}
.button.small {
  line-height: 23px !important;
}

.modal-body .stake-modal-video {
  top: 59% !important;
}

@media screen and (max-width: 1320px) {
  .section-filters-bar form {
    width: 100% !important;
  }
}

@media screen and (max-width: 768px) {
  .container {
    padding: 0px 20px !important;
  }
  .pt-50 {
    padding-top: 10px;
  }

  .section-filters-bar .form-item.split .form-input-decorated {
    width: 100% !important;
  }

  .section-filters-bar {
    padding: 20px !important;
    margin-top: 0px !important;
  }

  .form-item.split > * {
    margin-right: 0px !important;
  }

  .form-item.split.medium > * {
    margin-right: 0px !important;
  }
}

.vld-shown {
  overflow: hidden;
}

.vld-overlay {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  align-items: center;
  display: none;
  justify-content: center;
  overflow: hidden;
  z-index: 9999;
}

.vld-overlay.is-active {
  display: flex;
}

.vld-overlay.is-full-page {
  z-index: 9999;
  position: fixed;
}

.vld-overlay .vld-background {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  background: transparent;
  opacity: 0.5;
}

.vld-overlay .vld-icon,
.vld-parent {
  position: relative;
}
.button.small{
  width: 120px !important;
}
</style>
