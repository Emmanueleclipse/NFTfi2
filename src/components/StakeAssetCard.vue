<template>
  <div class="col-md-2 badge-item-stat">
        <div class="badge-item-stat-header">
        </div>
        <div class="badge-item-stat-body">
          <div class="badge-item-stat-body-media">
        <img class="badge-item-stat-image" v-show="isImageLoaded"  v-if="'img' in info.data" :src="getImgUrl(info.data.img)" alt="badge-bronze-b" @load="loaded">
        <img class="badge-item-stat-image loading" v-if="!isImageLoaded" :src="'/img/img-loader.gif'">
        <video class="badge-item-stat-video" v-if="'video' in info.data" autoplay loop muted>
          <source :src="getImgUrl(info.data.video)" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        </div>
        <p class="badge-item-stat-title">{{info.data.name}}</p>
        <div class="progress-stat">
          <div id="badge-bronze" class="progress-stat-bar" style="width: 204px; height: 4px; position: relative;"><canvas width="204" height="4" style="position: absolute; top: 0px; left: 0px;"></canvas><canvas width="204" height="4" style="position: absolute; top: 0px; left: 0px;"></canvas></div>
            <div class="bar-progress-wrap">
              <p class="bar-progress-info negative center"><span class="bar-progress-text no-space"></span></p>
              <p class="bar-progress-info negative center"><span class="light">Collection</span><span class="bar-progress-text">{{info.collection.name}}</span></p>
              <p class="bar-progress-info negative center" v-if="info.data.expiredDate"><span class="light">Expiry</span><span class="bar-progress-text">{{info.data.expiredDate}}</span></p>
              <p class="bar-progress-info negative center" v-if="info.data.stakeDate"><span class="light">Stake Date</span><span class="bar-progress-text">{{info.data.stakeDate}}</span></p>
              <p class="bar-progress-info negative center" v-if="info.data.quantity"><span class="light">Quantity</span><span class="bar-progress-text">{{info.data.quantity}}</span></p>
            </div>

        <div class="progress time-remaining-progress mt-3 mb-3">
          <div class="progress-bar" role="progressbar" :style="{ width: info.data.reqExpForNextLevel+'%'}" :aria-valuenow=info.data.reqExpForNextLevel aria-valuemin="0" aria-valuemax="100"></div>
        </div>
          <div class="bar-progress-wrap">
            <button class="button small secondary center" v-show="info.data.expired" style="line-height: 23px !important;" @click.prevent="claimStake(info.asset_id,info,$event)">Claim Stake</button>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import * as ApiService from "../_services/Service";
export default {
    name: 'AssetCard',
    props:["info",'row'],
    data(){
      return {
        isImageLoaded:false,
        currentRecord:[]
      }
    },
    methods:{
      getImgUrl(pet) {
          return ApiService.getImgUrl(pet)
      },
      transfer(assetId,rec){
        this.$emit("transfer-click",assetId,rec);
      },
      claimStake(assetId,rec){
        this.$emit("claim-stake-click",assetId,rec);
      },
      loaded() {
          this.isImageLoaded = true;
      },
    }
}
</script>

<style>
/* new css */
</style>