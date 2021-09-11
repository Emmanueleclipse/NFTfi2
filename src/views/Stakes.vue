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
              <!-- /FORM INPUT -->

              <!-- FORM INPUT ICON -->
              <!-- /FORM INPUT ICON -->
            </div>

            <!-- FORM SELECT -->
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

            <!-- BUTTON -->
            <button class="button small secondary" @click.prevent="clear()">
              Load all assets
            </button>
            <button class="button small secondary mt-3 mt-md-0" @click.prevent="claimBulk()">
              Claim all stake
            </button>
            <!-- /BUTTON -->
          </div>
          <!-- /FORM SELECT -->
        </form>
        <!-- /FORM -->
      </div>

      <div class="row justify-content-center" v-if="!loading && stakesInventory!=null">
        <StakeAssetCard
          v-for="(item, index) in stakesInventory"
          :key="index"
          :row="index"
          :info="item"
          v-on:transfer-click="transfer"
          v-on:claim-stake-click="claimStakeTrigger"
        />
      </div>
      <p v-if="!loading && stakesInventory==null" class="no-record">There are no assets in your inventory.</p>
    </div>

    <teleport to="body">
      <div v-if="showStackModal">
        <transition name="modal">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Claim Stake</h5>
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
                      <!-- </div>
                      <div class="col"> -->
                        <form @submit.prevent="signClaimStake" class="mt-5 mb-5">
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
                            <label for="pwd" class="ml-2">Stake Id:</label>
                            <input
                              type="text"
                              name="asset_id"
                              v-model="asset_id"
                              class="form-control"
                              placeholder="Enter assset id"
                            />
                          </div> -->
                          <button type="submit" class="button secondary">
                            Claim
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
import router from '../router'
import StakeAssetCard from '../components/StakeAssetCard'
import Loading from 'vue-loading-overlay';
import * as ApiService from "../_services/Service";
import {mapGetters} from "vuex"
export default {
  name: 'stakes',
  components:{
    StakeAssetCard,
    Loading
  },
  computed: {
    ...mapGetters([
      'tblState',
      'tinfos',
      'stakesInventory',
    ])
  },
  data () {
    return {
      stakes: null,
      level: null,
      state: null,
      info: null,
      assetId:"",
      isModalImageLoaded:false,
      ids:"",
      searchTerm:null,
      row:{},
      account:"",
      owner:"",
      asset_id:"",
      assetIds:[],
      showModal: false,
      showStackModal: false,
      loading: true,
      userFilter:"Select option",
      error:false,
      success:false,
      userAccount:"",
      isLoading: false,
      fullPage: false
    }
  },
  created () {
    this.$store.commit('updateLoadedComponent', "Stakes")
    this.$store.dispatch("getState");
    this.fetchStakes("")
  },
  mounted () {
    if(!ApiService.isLogin()) {
      router.push('/login')
    }
    this.userAccount = localStorage.getItem('wax_user')
    this.owner = this.userAccount
    this.emitter.on("search-asset", searchTerm => {
      this.searchTerm = searchTerm;
      this.searchAsset()
    });
  },
  
  methods: {
    clear(){
      this.searchTerm = "";
      this.userFilter="Select option",
      this.fetchStakes("")
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
    filterChanged(event){
      this.userFilter = event.target.value
      this.search();
    },
    search(){
      const params = ApiService.makeRequestParams(this.userFilter,this.searchTerm);
      this.fetchStakes(params)
    },
    transfer(assetId,row){
      this.assetId = assetId;
      this.showModal = true;
      this.error = "";
      this.success = "";
      this.row = row;
    },
    claimStakeTrigger(assetId,row){
      this.asset_id = assetId;
      this.row = row;
      this.showStackModal = true;
      this.error = "";
      this.success = "";
    },
    async signClaimStake(){
      this.clearLogs()
    let userAccount = localStorage.getItem("wax_user")
    let action = {
        account: process.env.VUE_APP_CONTRACT,
        name: 'claim',
        authorization: [{
          actor: userAccount,
          permission: 'active',
        }],
        data: {
          owner: this.owner,
          stake_id:this.row.asset_id
        },
    }
    if(localStorage.getItem("ual-session-authenticator")!="Wax"){
      await ApiService.doSign(action,((res)=>{
        if(res.processed.id){
          this.error = "";
          this.success = "Transaction done"
            setTimeout(() => {
              this.showModal = false;
            }, 1000);
          this.fetchStakes("")
        }
      }),((error)=>{
        this.success = "";
        if(error.what){
          this.error = error.what;
        }else{
          this.error = error
        }
      }));
      return;
    }else{
      await ApiService.signWithWaxGeneric({
        actions: [action]
      },((error)=>{
            this.success = "";
            if(error.what){
              this.error = error.what;
            }else{
              this.error = error
            }
      }),((result)=>{
          if(result.processed.id){
            this.error = ""
            this.success = "Transaction done"
            setTimeout(() => {
              this.showModal = false;
            }, 1000);
            this.fetchStakes("")
          }
      }));
    }
  },
    async claimBulk(){
      this.clearLogs()
      let userAccount = localStorage.getItem('wax_user')
      let actions = [];
      if(!this.info.length){
        return;
      }
      for (let index = 0; index <= this.info.length; index++) {
        let row = this.info[index];
        if(row && typeof row.asset_id !== 'undefined'){
            actions.push({
              account: process.env.VUE_APP_CONTRACT,
              name: 'claim',
              authorization: [{
                actor: userAccount,
                permission: 'active',
              }],
              data: {owner: userAccount,stake_id:row.asset_id},
            });
        }
      }

    if(localStorage.getItem("ual-session-authenticator")!="Wax"){
      await ApiService.doSign(actions,((res)=>{
        if(res.processed.id){
          this.error = ""
          this.success = "Transaction done"
            setTimeout(() => {
              this.showModal = false;
            }, 1000);
          this.fetchStakes("")
        }
      }),((error)=>{
        this.success = ""
        if(error.what){
          this.error = error.what;
        }else{
          this.error = error
        }
      }));
      return;
    }else{
      await ApiService.signWithWaxGeneric({actions: actions},((error)=>{
          this.success = ""
          if(error.what){
            this.error = error.what;
          }else{
            this.error = error
          }
      }),((result)=>{
        if(result.processed.id){
          this.error = ""
          this.success = "Transaction done"
          setTimeout(() => {
            this.showModal = false;
          }, 1000);
          this.fetchStakes("")
        }
      }));
    }
  },
  clearLogs(){
    this.success = '';
    this.error = '';
  },
  ModalLoaded(){
    this.isModalImageLoaded = true
  },
  async fetchStakes(params){
      this.stakes = await ApiService.getStakes();
      this.$store.commit('updateStakes', this.stakes)
      this.ids = ""
      for (var i = 0; i < this.stakes.length; i++){
        let comma = (this.ids==="") ? "":",";
        this.ids = `${this.ids}${comma}${this.stakes[i].asset_id}`
      }
      if(this.ids){
      this.isLoading = true
        await ApiService.fetchData(
          `${process.env.VUE_APP_API_ASSET_URL}?page=1&ids=${this.ids}&limit=10000${params}`,
          ((response) => {
            let res = response['data']
            console.log('res: ', res)
            if(res['success']) {
              this.info = res['data']
              this.$store.commit('updateStakesInventory', res['data'])
            } else {
              this.info = []
              this.$store.commit('updateStakesInventory', [])
            }
            this.loading = false;
            this.isLoading = false
          })
        )
      }else{
        this.loading = false;
        this.$store.commit('updateStakesInventory', [])
      }
    },
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
