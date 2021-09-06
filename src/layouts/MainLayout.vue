<template>
  <!-- <Loader /> -->
  <Sidebar />
  <Navigation />
  <NavigationWidget />

  <!-- CHAT WIDGET -->
  <!-- <ChatAside /> -->
  <!-- /CHAT WIDGET -->

  <Header
    v-on:transfer-modal-up="showTransferModal"
    v-on:searchAsset="showTransferModal"
  />

  <!-- <Aside /> -->

  <!-- CONTENT GRID -->
  <div class="content-grid main-grid-transform">
    <router-view />
    <div id="ual-div"></div>
  </div>

  <teleport to="body">
    <div v-if="showModal">
      <transition name="modal">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Stake Void</h5>
                  <button
                    type="button"
                    class="close modal-close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true" @click="showModal = false"
                      >&times;</span
                    >
                  </button>
                </div>
                <div class="modal-body">
                  <p class="text-center mb-2 error-msg" v-if="error">{{ error }}</p>
                  <p class="text-center mb-2 success-msg" v-if="success">{{ success }}</p>
                  <div class="row">
                    <div class="col">
                      <form @submit.prevent="OnSubmit">
                        <!-- <div class="form-group">
                          <label for="account" class="ml-2">Account name</label>
                          <input
                            type="text"
                            name="account"
                            v-model="account"
                            class="form-control"
                            placeholder="Enter wax account"
                          />
                        </div> -->
                        <div class="form-group">
                          <label for="pwd" class="ml-2">Quantity:</label>
                          <input
                            type="text"
                            name="memo"
                            v-model="quantity"
                            class="form-control"
                            placeholder="Enter Quantity e.g 100"
                          />
                        </div>
                        <!-- <div class="form-group">
                          <label for="pwd" class="ml-2">memo:</label>
                          <input
                            type="text"
                            name="memo"
                            v-model="memo"
                            class="form-control"
                            placeholder="Enter lease asset id"
                          />
                        </div> -->
                        <p class="help-block">To be sent to: {{process.env.VUE_APP_CONTRACT}}</p>
                        <br />
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
</template>

<script>
import { reactive } from "vue";

import Header from "./main/Header";
import Sidebar from "./main/Sidebar";
import Navigation from "./main/Navigation/Navigation.vue";
import NavigationWidget from "./main/Navigation/NavigationWidget.vue";
import * as ApiService from "../_services/Service";
// import ChatAside from './ChatAside'
export default {
  name: "MainLayout",

  data() {
    return {
      showModal: false,
      account: process.env.VUE_APP_CONTRACT,
      memo: "",
      error: "",
      success: "",
      quantity: "",
    };
  },

  components: {
    Sidebar,
    // ChatAside,
    // Loader,
    NavigationWidget,
    Navigation,
    Header,
  },

  mounted() {
    // validate session on mounting page
    if (!localStorage.getItem("wax_user")) {
      this.$router.push("/login");
    }
  },

  setup() {
    // check authentication details
    const authentication = reactive({
      user_name: localStorage.getItem("wax_user"),
    });

    return {
      authentication,
    };
  },

  methods: {
    logout: function() {
      this.$router.push("/login");
    },

    showTransferModal() {
      this.showModal = true;
    },

    async OnSubmit() {
      await this.makeTrans(this.account, this.quantity, this.memo);
    },

    async makeTrans(toAccount, quantity, memo) {
      let userAccount = localStorage.getItem("wax_user")
      if(localStorage.getItem("ual-session-authenticator")!="Wax"){
      await ApiService.doSign({
              account: "onessusonwax",
              name: "transfer",
              authorization: [
                {
                  actor: userAccount,
                  permission: "active",
                },
              ],
              data: {
                from: userAccount,
                to: process.env.VUE_APP_CONTRACT,
                quantity: quantity+".0000 VOID",
                memo: memo,
              },
            },((res)=>{
          if(res.processed.id){
            this.success = "Transaction done"
              setTimeout(() => {
                this.showModal = false;
              }, 1000);
          }
        }),((error)=>{
          if(error.what){
            this.error = error.what;
          }else{
            this.error = error
          }
        }));
        return;
      }
      await ApiService.signWithWaxGeneric({
          actions: [
            {
              account: "onessusonwax",
              name: "transfer",
              authorization: [
                {
                  actor: userAccount,
                  permission: "active",
                },
              ],
              data: {
                from: userAccount,
                to: toAccount,
                quantity: quantity+".0000 VOID",
                memo: memo,
              },
            },
          ],
        }
      ,((error)=>{
          if(error.what){
            this.error = error.what;
          }else{
            this.error = error
          }
      }),((result)=>{
        if(result.processed.id){
          this.success = "Transaction done"
          setTimeout(() => {
            this.showModal = false;
          }, 1000);
        }
      }))
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content-grid {
  max-width: 100% !important;
}
.main-grid-transform {
  transform: translate(70px, 0px);
  transition: transform 0.4s ease-in-out 0s;
}
.login-txt {
  color: #000;
}

.modal-body {
  background-color: #1d2333 !important;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
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
.modal-body .badge-item-stat {
  width: 200px;
}
.modal-title {
  color: black;
}
.modal-body .badge-item-stat-image {
  width: 150px !important;
}
.modal-wrapper {
  display: table-cell;
  vertical-align: left;
}

@media screen and (max-width: 768px) {
  .content-grid {
    padding: 92px 0 200px !important;
  }

  .main-grid-transform {
    transform: none !important;
  }
}
</style>
