<template>
<transition name="modal">
    <div class="modal-mask">
        <div class="modal-wrapper">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Stake Void</h5>
                        <button type="button" class="close modal-close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true" @click="hideModal()">&times;</span>
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
                                          type="number" 
                                          name="memo" 
                                          v-model="quantity" 
                                          class="form-control" 
                                          placeholder="Enter Quantity e.g 100"
                                          @keypress="onlyNumber($event)"
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
                                    <p class="help-block">To be sent to: {{account}} </p>
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
</template>

<script>
import * as ApiService from "../_services/Service";
export default {
    name: "StakeModal",
    props: ['show', 'assetId'],
    data() {
        return {
            account: "stage.hive",
            error: "",
            success: "",
            quantity: "",
        }
    },
    computed: {
        showModal: function () {
            return this.show;
        },
        memo: function () {
            return this.assetId;
        }
    },
    methods: {
        async OnSubmit() {
            if (this.quantity && this.quantity != 0) {
                this.makeTrans(this.account, this.quantity, this.memo);
            } else {
                this.error = "Quantity field is required, please provide a positive number"
            }
        },
        hideModal(e) {
            this.$emit("stake-void-hide", e);
        },
        onlyNumber(evt) {
          evt = (evt) ? evt : window.event;
          var charCode = (evt.which) ? evt.which : evt.keyCode;
          if (charCode === 46 || charCode===45) {
            evt.preventDefault();
          } else {
            return true;
          }
        },
        async makeTrans(toAccount, quantity, memo) {
            this.success = ""
            this.error = ""
            let userAccount = localStorage.getItem("wax_user")
            if (localStorage.getItem("ual-session-authenticator") != "Wax") {
                await ApiService.doSign({
                    account: "onessusonwax",
                    name: "transfer",
                    authorization: [{
                        actor: userAccount,
                        permission: "active",
                    }, ],
                    data: {
                        from: userAccount,
                        to: process.env.VUE_APP_CONTRACT,
                        quantity: Number(quantity).toFixed(4) + " VOID",
                        memo: memo,
                    },
                }, ((res) => {
                    if (res.processed.id) {
                        this.error = "";
                        this.success = "Transaction done"
                        setTimeout(() => {
                            this.$emit("stake-void-hide", res);
                        }, 1000);
                    }
                }), ((error) => {
                    this.success = ""
                    if (error.what) {
                        this.error = error.what;
                    } else {
                        this.error = error
                    }
                }));
                return;
            }
            await ApiService.signWithWaxGeneric({
                actions: [{
                    account: "onessusonwax",
                    name: "transfer",
                    authorization: [{
                        actor: userAccount,
                        permission: "active",
                    }, ],
                    data: {
                        from: userAccount,
                        to: toAccount,
                        quantity: Number(quantity).toFixed(4) + " VOID",
                        memo: memo,
                    },
                }, ],
            }, ((error) => {
                this.success = ""
                if (error.what) {
                    this.error = error.what;
                } else {
                    this.error = error
                }
            }), ((result) => {
                if (result.processed.id) {
                    this.error = "";
                    this.success = "Transaction done"
                    setTimeout(() => {
                        this.$emit("stake-void-hide", result);
                    }, 1000);
                }
            }))
        }
    },
}
</script>

<style>
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
    text-align: left;
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
