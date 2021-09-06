<template>
 <div v-if="'data' in info">
  <div class="col-md-2 badge-item-stat">
        <div class="badge-item-stat-header">
        <img class="badge-item-stat-image-preview" :src="info.data.levelImg" alt="badge-bronze-s">
        <template v-if="info.collection.collection_name=='boilerleases'">
            <div class="text-sticker btn-transfer" @click="stakeVoid(info.asset_id,info,$event)" v-if="!isExpired()">
              <svg class="text-sticker-icon icon-plus-small">
                <use xlink:href="#svg-plus-small"></use>
              </svg>
              Stake Void
            </div>
            <div class="text-sticker btn-transfer text-danger" v-else>
              Expired
            </div>
        </template>
        <template v-else>
          <div v-if="info.is_transferable==true && info.owner==userAccount" class="text-sticker btn-transfer" @click="transfer(info.asset_id,info,$event)">
            <svg class="text-sticker-icon icon-plus-small">
              <use xlink:href="#svg-plus-small"></use>
            </svg>
            Transfer
          </div>
        </template>
        </div>

        <div class="badge-item-stat-body">
          <div class="badge-item-stat-body-media">
            <template v-if="'video' in info.data">
                <video class="badge-item-stat-video"  autoplay loop muted>
                  <source :src="getImgUrl(info.data.video)" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
            </template>
            <template v-else>
              <img class="badge-item-stat-image" v-show="isImageLoaded" :src="getImgUrl(info.data.img)" alt="badge-bronze-b" @load="loaded">
              <img class="badge-item-stat-image loading" v-if="!isImageLoaded && 'img' in info.data" :src="'/img/img-loader.gif'">
            </template>
        </div>
        <p class="badge-item-stat-title">{{info.data.name}}</p>
        <p class="badge-item-stat-text"><span class="light">Collection:</span><span class="bar-progress-text">{{info.collection.name}}</span></p>

        <div class="progress exp-level-progress mt-3 mb-3">
          <div class="time-progress-bar" data-toggle="tooltip" :title=info.data.currentExpValue role="progressbar" :style="{ width: info.data.currentExp+'%'}" :aria-valuenow=info.data.currentExp aria-valuemin="0" aria-valuemax="100"></div>
        </div>

        <div class="progress time-remaining-progress mt-3 mb-3">
          <div class="progress-bar" data-toggle="tooltip" :title=info.data.reqExpForNextLevel role="progressbar" :style="{ width: info.data.reqExpForNextLevel+'%'}" :aria-valuenow=info.data.reqExpForNextLevel aria-valuemin="0" aria-valuemax="100"></div>
        </div>

        <div class="bar-progress-wrap" v-if="(info.is_transferable==true && info.owner==userAccount) && (info.collection.collection_name == 'hodlgod' || info.collection.collection_name == 'elementalnft' || info.collection.collection_name == 'dappradarnft')">
          <button class="button small secondary center" style="line-height: 23px !important;" @click.prevent="stack(info.asset_id,info,$event)">Stake</button>
        </div>

      </div>
      </div>
    </div>
</template>

<script>
import * as ApiService from "../_services/Service";
import {mapGetters} from "vuex"
export default {
    name: 'AssetCard',
    props:["info",'row','level','loginAccount'],
    computed: {
      ...mapGetters([
        'inventory',
        'tblState',
        'stakes'
      ])
    },
    data(){
      return {
        isImageLoaded:false,
        reqExpForNextLevel:100,
        userAccount:"",
        currentExp:0,
        currentRecord:null
      }
    },
    created() {
      this.userAccount = localStorage.getItem('wax_user');
    },
    methods:{
      getImgUrl(pet) {
        return ApiService.getImgUrl(pet);
      },
      transfer(assetId,rec){
        this.$emit("transfer-click",assetId,rec);
      },
      stack(assetId,rec){
        this.$emit("stack-click",assetId,rec);
      },
      stakeVoid(assetId,rec){
        this.$emit("stake-void-click",assetId,rec);
      },
      loaded() {
          this.isImageLoaded = true;
      },
      callAssetId(id) {
        this.setProgressBar("#"+id);
      },
      isExpired(){
        return this.info.data.expired;
      }
    }
}
</script>

<style>
/* new css */
</style>