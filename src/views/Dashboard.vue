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
                  @paste="searchAsset($event)"
                  placeholder="Name search"
                />
              </div>
            </div>
            <div class="form-input-decorated">
              <!-- FORM INPUT -->
              <div class="form-input small mb-4">
                <input
                  type="text"
                  name="asset_id"
                  v-model="searchAssetId"
                  @keyup="searchByAssetId($event)"
                  @paste="searchByAssetId($event)"
                  placeholder="Search by asset id"
                />
              </div>
            </div>
            <!-- FORM SELECT -->
            <div class="form-select mb-4">
              <label for="quest-filter-criteria">Filter By</label>
              <select
                id="quest-filter-criteria"
                name="quest_filter_criteria"
                v-model="userFilter"
                @change="filterChanged()"
              >
                <option value="Select option">Select option</option>
                <option value="stakable">All Stakable</option>
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
                @change="collectionChanged()"
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
            <button class="button secondary" @click.prevent="clear()">
              Reset
            </button>

            <!-- <button class="button small secondary mt-3 mt-md-0" @click.prevent="burnAllExpired()">
              Burn All Expired
            </button> -->
            <!-- /BUTTON -->
          </div>
          <!-- /FORM SELECT -->
        </form>
        <!-- /FORM -->
      </div>

      <div class="row justify-content-center" v-if="!loading && inventory!=null">
        <AssetCard
          v-for="(item, index) in inventory"
          :key="index"
          :row="index"
          :info="item"
          :level="levels"
          :stake="stake"
          :state="tblState"
          :loginAccount="userAccount"
          v-on:transfer-click="transfer"
          v-on:stake-void-click="upStakeVoidModal"
          v-on:stack-click="stack"
        />
        <p v-if="!info.length" class="no-record">There are no assets in your inventory.</p>
      </div>
      <div class="row justify-content-center" v-if="totalRows > 1">
        <div class="section-pager-bar">
      <!-- SECTION PAGER -->
          <div class="section-pager">
            <pagination
              v-model="currentPage"
              :pages="totalRows"
              :range-size="1"
              active-color="#DCEDFF"
              @update:modelValue="paginate"
            />
            <!-- /SECTION PAGER ITEM -->
          </div>
        </div>
      </div>
    </div>

    <!-- teleport the modal outsidof the app -->
    <teleport to="body">
      <div v-if="showModal">
        <transition name="modal">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Transfer Asset</h5>
                    <button
                      type="button"
                      class="close modal-close text-purple"
                      data-dismiss="modal"
                      aria-label="Close"
                      @click="showModal = false"
                    >
                      <span aria-hidden="true" class="text-purple"
                        >&times;</span
                      >
                    </button>
                  </div>

                  <div class="modal-body" style="">
                    <p class="text-center mb-2 error-msg" v-if="error">{{ error }}</p>
                    <div class="row">
                      <div class="col text-center">
                        <p class="text-title mb-3">
                          {{ row.data.name }}
                        </p>
                        <template v-if="row.data.video">
                          <video
                            height="150"
                            width="150"
                            class=""
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
                            class="modal-img"
                            height="150"
                            width="150"
                            :src="getImgUrl(row.data.img)"
                            alt="badge-bronze-b"
                            v-show="isModalImageLoaded"
                            @load="ModalLoaded"
                          >
                          <img class="badge-item-stat-image loading" v-if="!isModalImageLoaded && 'img' in row.data" :src="'/img/img-loader.gif'">
                        </template>
                      </div>

                      <div class="col">
                        <form @submit.prevent="OnSubmit">
                          <div class="form-group">
                            <label for="account" class="ml-2"
                              >Account name</label
                            >
                            <input
                              type="text"
                              name="account"
                              v-model="account"
                              class="form-control"
                              placeholder="Enter wax account"
                            />
                          </div>

                          <div class="form-group">
                            <label for="pwd" class="ml-2">memo:</label>
                            <input
                              type="text"
                              name="memo"
                              v-model="memo"
                              class="form-control"
                              placeholder="Enter memo (optional)"
                            />
                          </div>
                          <button type="submit" class="button secondary">
                            Submit
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
    <StakeModal 
          :assetId="assetId"
          v-if="showStakeVoidModal" v-on:stake-void-hide="showStakeVoidModal=false"
    />
    <teleport to="body">
      <div v-if="showStackModal">
        <transition name="modal">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Stake Asset</h5>
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
                    <p class="error-msg" v-if="error">{{ error }}</p>
                    <p class="success-msg" v-if="success">{{ success }}</p>

                    <div class="row">
                      <div class="col mt-3 text-center">
                        <p class="text-title mb-3">
                          {{ row.data.name }}
                        </p>
                        <template v-if="row.data.video">
                          <video
                            width="150"
                            height="150"
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
                            class="modal-img"
                            :src="getImgUrl(row.data.img)"
                            alt="badge-bronze-b"
                            width="150"
                            height="150"
                            v-show="isModalImageLoaded"
                            @load="ModalLoaded"
                          >
                          <img class="badge-item-stat-image loading" v-if="!isModalImageLoaded && 'img' in row.data" :src="'/img/img-loader.gif'">
                        </template>
                       
                      </div>
                      <div class="col">
                        <form @submit.prevent="OnStake" class="mt-5 mb-5">
                          <div class="form-group">
                            <label for="pwd" class="ml-2">Lockup Period:</label>
                            <input
                              type="number"
                              name="memo"
                              v-model="memo"
                              class="form-control"
                              placeholder="Enter duration in days"
                              @keypress="onlyNumber($event)"
                              @keyup="checkRange($event)"
                              pattern="^(?:36[0-5]|3[0-5][0-9]|[12][0-9][0-9]|[1-9][0-9]|[1-9])$"
                            />
                          </div>
                          <button type="submit" class="button secondary">
                            Stake
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
import AssetCard from '../components/AssetCard'
import Loading from 'vue-loading-overlay';
import * as ApiService from "../_services/Service";
import StakeModal from '../components/StakeModal'
import {mapGetters} from "vuex"

export default {
  name: 'login',
  components:{
    AssetCard,
    Loading,
    StakeModal
  },
  computed: {
    ...mapGetters([
      'tblState',
      'inventory',
      'stakeable',
      'stakes'
    ])
  },
  data () {
    return {
      levels: [],
      stake: [],
      apiRes: [],
      info: [],
      status: false,
      showStakeVoidModal: false,
      assetId:"",
      searchAssetId:null,
      searchTerm:"",
      row:{},
      account:"",
      memo:"",
      userAccount:localStorage.getItem('wax_user'),
      assetIds:[],
      showModal: false,
      showStackModal: false,
      loading: true,
      collections: [],
      userCollection:"Select",
      userFilter:"Select option",
      error:false,
      success:false,
      isLoading: false,
      totalRows:0,
      currentPage:1,
      isModalImageLoaded:false,
      fullPage: false
    }
  },
  
  created () {
    // get record from vuxstore
    this.$store.commit('updateLoadedComponent', "Dashboard")
    this.$store.dispatch("getState");
    this.$store.dispatch("getStakes");
    this.$store.dispatch("getTinfos");
    this.fetchAll()
  },
  mounted () {
    // check if login if not redirect
    if(!ApiService.isLogin()) {
        router.push('/login')
    }
    this.userAccount = localStorage.getItem('wax_user');
    // event listener for top search
    this.emitter.on("search-asset", searchTerm => {
      this.searchTerm = searchTerm;
      this.searchAsset()
    });
  },
  methods: {
    hideStakeVoidModal(){
      this.showStakeVoidModal=false
    },
    async doSign(assetId,toAccount,memo) {
      this.clearLogs()
      let fromAccount = localStorage.getItem("wax_user");
      ApiService.doSign(
        {
          account: 'atomicassets',
          name: 'transfer',
          authorization: [{
            actor: fromAccount,
            permission: 'active',
          }],
          data: {
            from: fromAccount,
            to: toAccount,
            asset_ids:[assetId],
            memo: memo || "",
          },
        },((res)=>{
          if(res.processed.id){
            this.error = "";
            this.success = "Transaction done"
              setTimeout(() => {
                this.showModal = false;
                this.showStackModal = false;
              }, 1000);
             this.fetchAll()
          }
        }),((error)=>{
          this.success = ""
          if(error.what){
            this.error = error.what;
          }else{
            this.error = error
          }
        })
      )
    },
    paginate(page){
      this.currentPage = page
      this.init(`&page=${page}`, true);
    },
    clear(){
      this.searchTerm = "";
      this.userCollection = "Select";
      this.userFilter="Select option",
      this.fetchAll()
      this.currentPage = 1;
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
    searchByAssetId(){
      if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.searchById();
      }, 500);
    },
    getImgUrl(pet) {
        return ApiService.getImgUrl(pet)
    },
    collectionChanged(){
      this.init("");
    },
    filterChanged(){
      this.init("");
    },
    search(){
      this.init("");
    },
    searchById(){
      if(this.searchAssetId==""){
        this.fetchAll()
        return;
      }
      this.isLoading = true
      axios
        .get(`${process.env.VUE_APP_API_ASSET_URL}/${this.searchAssetId}`)
        .then(response => {
          let res = response['data']
          if(res['success']) {
            this.currentPage = 1;
           this.totalRows=1
            this.info = [res['data']]
            this.$store.commit('updateInventory', [res['data']])
          } else {
            this.info = []
            this.$store.commit('updateInventory', [])
          }
          this.loading = false;
          this.isLoading = false
        })
        .catch(() => {
          this.info = [];
          this.loading = false;
          this.isLoading = false;
        })
    },
    transfer(assetId,row){
      this.assetId = assetId;
      this.showModal = true;
      this.error = "";
      this.success = "";
      this.row = row;
      this.isModalImageLoaded = false
    },
    upStakeVoidModal(assetId,row){
      this.assetId = assetId;
      this.showStakeVoidModal = true;
      this.error = "";
      this.success = "";
      this.row = row;
      this.isModalImageLoaded = false
    },
    stack(assetId,row){
      this.assetId = assetId;
      this.row = row;
      this.showStackModal = true;
      this.error = "";
      this.success = "";
      this.isModalImageLoaded = false
    },
    async OnStake(){
       this.clearLogs()
      await this.makeTrans(this.assetId,process.env.VUE_APP_CONTRACT,this.memo);
    },
    async OnSubmit(){
      this.clearLogs()
      await this.makeTrans(this.assetId,this.account,this.memo);
    },
    async makeTrans(assetId,toAccount,memo){
    if(!assetId || !toAccount){
      this.error = "Need to provide asset id and account name";
      return;
    }
    // check session if wax or anchor
    if(localStorage.getItem("ual-session-authenticator")!="Wax"){
      await this.doSign(assetId,toAccount,memo);
      return;
    }else{
    await ApiService.signWithWax({
        from: this.userAccount,
        to: toAccount,
        asset_ids:[assetId],
        memo: memo || "",
    },((error)=>{
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
          this.showStackModal = false;
        }, 1000);
        this.fetchAll()
      }
    }));
    }
  },
  async init(params, setPage = false) {
    const stakeable = this.stakeable ? this.stakeable.collection:null
    params = ApiService.makeRequestParams(this.userFilter,this.searchTerm,this.userCollection,stakeable);
    let paramsWithPage = params+"&page="+this.currentPage
    this.isLoading = true
    axios
      .get(`${process.env.VUE_APP_API_ASSET_URL}?owner=${localStorage.getItem('wax_user')}&limit=${process.env.VUE_APP_PER_PAGE_ITEMS}${paramsWithPage}`)
      .then(response => {
        let res = response['data']
        if(res['success']) {
          this.info = res['data']
          this.apiRes = res['data'];
          this.$store.commit('updateInventory', res['data'])
          // force page 1
          if(!setPage) {
            this.currentPage = 1;
          }
        } else {
          this.info = []
        }
        this.allRecordCount(params);
        this.loading = false;
        this.isLoading = false
      })
  },
  allRecordCount(params){
    axios
      .get(`${process.env.VUE_APP_API_ASSET_URL}?owner=${localStorage.getItem('wax_user')}&limit=1000${params}`)
      .then(response => {
        let res = response['data']
        if(res['success']) {
          this.apiRes = res['data']
          // populate collection option
          this.collectionOptions(params,res['data']);
          this.totalRows = Math.ceil(Number(res["data"].length)/process.env.VUE_APP_PER_PAGE_ITEMS);
        }
      })
  },
  collectionOptions(params,res){
    // params is null or page=1 load all collection extracted from all record
    // we have an api point for collection as well but this way it fast
    if(params=="" || params == "&page=1"){
          var collections = Object.keys(this.apiRes).map(function(k){
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
    if(this.userFilter=="stakable"){
      let stakeable = null
      if(this.stakeable){
        stakeable = this.stakeable.collection
      }else{
        (async() => {
          stakeable = await ApiService.getStakeable(this.tblState.epoch)
            this.$store.commit('updateStakeable', stakeable[0]);
            stakeable = stakeable[0]
        })();
      }
      this.info = res.filter((item)=>{
            let coll = item.collection.collection_name.toLowerCase();
            return (stakeable.indexOf(coll) != -1);
      });
      // this.$store.commit('updateInventory', this.info)
      let collection = [];
      for (let index = 0; index < stakeable.length; index++) {
        const element = stakeable[index];
        collection.push({
          collection_name:element,
          name:element.charAt(0).toUpperCase() + element.slice(1)
        })
      }
      this.collections = collection
    }
  },
  checkRange(evt){
    evt = (evt) ? evt : window.event;
    var keyVal = Number(evt.target.value);
    if ((keyVal < 0 || keyVal > 365)) {
      this.memo = 365
    }
  },
  onlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    console.log(charCode);
    if (charCode === 46 || charCode===45) {
      evt.preventDefault();
    } else {
      return true;
    }
  },
  ModalLoaded(){
    this.isModalImageLoaded = true
  },
  async fetchAll(){
      await this.init("&page=1")
  },
  clearLogs(){
    this.success = '';
    this.error = '';
  },
  async burnAllExpired(){
      await this.init("&collection_name=boilerleases&limit=5")
      let userAccount = localStorage.getItem('wax_user')
      let actions = [];
      if(!this.info.length){
        return;
      }
      for (let index = 0; index <= this.info.length; index++) {
        let row = this.info[index];
        if(row && typeof row.asset_id !== 'undefined' && row.collection.collection_name=="boilerleases"){
          console.log(row.name);
            let isExpired = ApiService.isExpired(row.data.expiration);
            if(isExpired){
              actions.push({
              account: "atomicassets",
              name: 'burnasset',
              authorization: [{
                actor: userAccount,
                permission: 'active',
              }],
                data: {asset_owner: userAccount,asset_id:row.asset_id},
              });
            }
        }
      }

    if(localStorage.getItem("ual-session-authenticator")!="Wax"){
      await ApiService.doSign(actions,((res)=>{
        if(res.processed.id){
          this.error = "";
          this.success = "Transaction done"
            setTimeout(() => {
              this.fetchAll()
              this.showModal = false;
            }, 1000);
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
          setTimeout(() => {
           this.fetchAll()
            this.showModal = false;
          }, 1000);
        }
      }));
  },
  searchApi(params) {
    this.isLoading = true
    let post = {
        "owner":localStorage.getItem('wax_user'),
        "page":1,
        "limit":"10000",
        "collection_name": this.userCollection,
        ...params
    };
    axios
      .post(`https://wax.api.aa.atomichub.io/atomicmarket/v1/assets`,post)
      .then(response => {
        let res = response['data']
        if(res['success']) {
          this.info = res['data']
          this.apiRes = res['data']
          if(params==""){
            var collections = Object.keys(this.info).map(function(k){
              return res['data'][k].collection;
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
          this.status = true
        } else {
          this.info = []
          this.status = false
        }
        this.loading = false;
        this.isLoading = false
      })
  }
  },
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

.section-filters-bar .form-item.split .form-input, .section-filters-bar .form-item.split .form-select {
    width: 200px !important;
}

.section-filters-bar .form-item.split .form-input-decorated {
    width: 188px !important;
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

  .section-filters-bar .form-item.split .form-input, .section-filters-bar .form-item.split .form-select {
    width: 100% !important;
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
.section-pager .section-pager-item .section-pager-item-text {
    background-color: #454850 !important;
}

.section-pager-bar {
  margin-top: 30px;
  width: auto !important;
}

.section-pager {
  position: unset !important;
  background-color: #1d2333 !important;
  padding: 15px;
}

.modal-img {
  height: auto !important;
}
</style>
