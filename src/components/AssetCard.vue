<template>
  <div v-if="'data' in info" class="root">
    <div class="col-md-2 badge-item-stat" @click.prevent="showModal()">
      <div class="badge-item-stat-header">
        <img
          class="badge-item-stat-image-preview"
          :src="info.data.levelImg"
          alt="badge-bronze-s"
        />
        <template v-if="info.collection.collection_name == 'boilerleases'">
          <div
            class="text-sticker btn-transfer"
            @click="stakeVoid(info.asset_id, info, $event)"
            v-if="!isExpired()"
          >
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
          <div
            v-if="info.is_transferable == true && info.owner == userAccount"
            class="text-sticker btn-transfer"
            @click="transfer(info.asset_id, info, $event)"
          >
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
            data-toggle="tooltip"
            :title="info.data.currentExpValue"
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
            data-toggle="tooltip"
            :title="info.data.reqExpForNextLevel"
            role="progressbar"
            :style="{ width: info.data.reqExpForNextLevel + '%' }"
            :aria-valuenow="info.data.reqExpForNextLevel"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>

        <div
          class="bar-progress-wrap"
          v-if="
            info.is_transferable == true &&
              info.owner == userAccount &&
              (info.collection.collection_name == 'hodlgod' ||
                info.collection.collection_name == 'elementalnft' ||
                info.collection.collection_name == 'dappradarnft')
          "
        >
          <button
            class="button small secondary center"
            style="line-height: 23px !important;"
            @click.prevent="stack(info.asset_id, info, $event)"
          >
            Stake
          </button>
        </div>
      </div>
    </div>
  </div>

  <Modal v-show="isModalVisible" @close="closeModal">
    <template v-slot:header>
      Asset details
    </template>

    <template v-slot:body>
      <div class="row">
        <div class="col-sm-12 col-lg-4">
          <template v-if="'video' in info.data">
            <video class="badge-item-stat-video" autoplay loop muted>
              <source :src="getImgUrl(info.data.video)" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </template>
          <template v-else>
            <img
              class="modal-image"
              v-show="isImageLoaded"
              :src="getImgUrl(info.data.img)"
              alt="badge-bronze-b"
              @load="loaded"
            />
            <img
              class="modal-image loading"
              v-if="!isImageLoaded && 'img' in info.data"
              :src="'/img/img-loader.gif'"
            />
          </template>
        </div>
        <div class="col-sm-12 col-lg-8">
          <h1 class="modal-body-category">Immutable Data</h1>
          <p class="modal-body-title">Asset ID</p>
          <p class="modal-body-content">#{{ info.asset_id }}</p>

          <div v-if="info.immutable_data">
            <p class="modal-body-title">Name</p>
            <p class="modal-body-content">{{ info.immutable_data.name }}</p>

            <p class="modal-body-title">Expiration</p>
            <p class="modal-body-content">
              {{ info.immutable_data.expiration }}
            </p>
          </div>
        </div>
      </div>
      <div class="row" v-if="info.collection">
        <h1 class="col-sm-12 modal-body-category">Collection Data</h1>
        <div class="col-sm-12 col-lg-6">
          <p class="modal-body-title">Author</p>
          <p class="modal-body-content">{{ info.collection.author }}</p>
        </div>
        <div class="col-sm-12 col-lg-6">
          <p class="modal-body-title">Market Fee</p>
          <p class="modal-body-content">{{ info.collection.market_fee }}</p>
        </div>
        <div class="col-sm-12 col-lg-6">
          <p class="modal-body-title">Collection Name</p>
          <p class="modal-body-content">{{ info.collection.name }}</p>
        </div>
      </div>
      <div class="row" v-if="info.data">
        <h1 class="col-sm-12 modal-body-category">General Data</h1>
        <div class="col-sm-12 col-lg-6">
          <p class="modal-body-title">Level</p>
          <p class="modal-body-content">{{ info.data.level }}</p>
        </div>
        <div class="col-sm-12 col-lg-6">
          <p class="modal-body-title">Current EXP</p>
          <p class="modal-body-content">{{ info.data.currentExp }}</p>
        </div>
        <div class="col-sm-12 col-lg-6">
          <p class="modal-body-title">EXP to lvl up</p>
          <p class="modal-body-content">{{ info.data.reqExpForNextLevel }}</p>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import * as ApiService from "../_services/Service";
import Modal from "./Modal.vue";
import { mapGetters } from "vuex";
export default {
  name: "AssetCard",
  props: ["info", "row", "level", "loginAccount"],
  components: { Modal },
  computed: {
    ...mapGetters(["inventory", "tblState", "stakes"]),
  },
  data() {
    return {
      isImageLoaded: false,
      reqExpForNextLevel: 100,
      userAccount: "",
      currentExp: 0,
      currentRecord: null,
      isModalVisible: false,
    };
  },
  created() {
    this.userAccount = localStorage.getItem("wax_user");
  },
  methods: {
    showModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
    getImgUrl(pet) {
      return ApiService.getImgUrl(pet);
    },
    transfer(assetId, rec) {
      this.$emit("transfer-click", assetId, rec);
    },
    stack(assetId, rec) {
      this.$emit("stack-click", assetId, rec);
    },
    stakeVoid(assetId, rec) {
      this.$emit("stake-void-click", assetId, rec);
    },
    loaded() {
      this.isImageLoaded = true;
    },
    callAssetId(id) {
      this.setProgressBar("#" + id);
    },
    isExpired() {
      return this.info.data.expired;
    },
  },
};
</script>

<style scoped>
.root {
  cursor: pointer;
}
.modal-image {
  width: 100%;
  height: auto;
}

.modal-body-title {
  color: #ddd;
  font-weight: 500;
}

.modal-body-content {
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.modal-body-category {
  margin-bottom: 1.5rem;
  color: #7750f8;
  font-weight: bold;
  font-size: 1.7rem;
}
</style>
