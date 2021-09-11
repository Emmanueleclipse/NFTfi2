<template>
  <div class="col-md-2 badge-item-stat">
    <div class="badge-item-stat-header">
      <img
        class="badge-item-stat-image-preview"
        :src="info.data.levelImg"
        alt="badge-bronze-s"
      />
    </div>
    <div class="badge-item-stat-body">
      <div class="badge-item-stat-body-media">
        <template v-if="'video' in info.data">
          <video class="badge-item-stat-video" autoplay loop muted>
            <source :src="getImgUrl(info.data.video)" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </template>
        <template v-else>
          <img
            class="badge-item-stat-image"
            v-show="isImageLoaded"
            :src="getImgUrl(info.data.img)"
            alt="badge-bronze-b"
            @load="loaded"
          />
          <img
            class="badge-item-stat-image loading"
            v-if="!isImageLoaded && 'img' in info.data"
            :src="'/img/img-loader.gif'"
          />
        </template>
      </div>
      <p class="badge-item-stat-title">{{ info.data.name }}</p>
      <p class="badge-item-stat-text">
        <span class="light">Collection:</span
        ><span class="bar-progress-text">{{ info.collection.name }}</span>
      </p>

      <div class="progress exp-level-progress mt-3 mb-3">
        <div
          class="time-progress-bar"
          role="progressbar"
          :style="{ width: info.data.currentExp + '%' }"
          :aria-valuenow="info.data.currentExp"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>

      <div class="progress time-remaining-progress mt-3 mb-3">
        <div
          class="progress-bar"
          role="progressbar"
          :style="{ width: info.data.reqExpForNextLevel + '%' }"
          :aria-valuenow="info.data.reqExpForNextLevel"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <div class="bar-progress-wrap">
        <button
          class="button small secondary center"
          v-if="isExpired"
          style="line-height: 23px !important;"
          @click.prevent="stack(info.asset_id, info, $event)"
        >
          Reclaim
        </button>
        <button
          class="button small dark center"
          v-else
          style="line-height: 23px !important;"
        >
          Not Expired
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as ApiService from "../_services/Service";
import { parseISO, isAfter } from "date-fns";
export default {
  name: "ReclaimAssetCard",
  props: ["info", "row", "level"],
  data() {
    return {
      isImageLoaded: false,
      currentRecord: null,
      isExpired: null,
    };
  },
  mounted() {
    // 2021-09-13 21:30:40
    const todayDate = new Date();
    const expiredDate = parseISO(this.info.data.expiredDate);
    this.isExpired = isAfter(todayDate, expiredDate);
  },
  methods: {
    getImgUrl(pet) {
      return ApiService.getImgUrl(pet);
    },
    transfer(assetId, rec) {
      this.$emit("transfer-click", assetId, rec);
    },
    stack(assetId, rec) {
      this.$emit("stack-click", assetId, rec);
    },
    loaded() {
      this.isImageLoaded = true;
    },
  },
};
</script>

<style>
/* new css */
</style>
