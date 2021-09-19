import { createStore } from "vuex";
import * as waxjs from "@waxio/waxjs/dist";
import moment from 'moment';
import * as ApiService from "../_services/Service";
var keys = null
var laccount = null

// check if autologin is not null if has set take keys and account name from local storage
if (localStorage.getItem("ual-wax:autologin") != null) {
    let ualWax = JSON.parse(localStorage.getItem("ual-wax:autologin"))
    keys = ualWax ? ualWax.pubKeys : null
}
if (localStorage.getItem("wax_user") != null) {
    laccount = localStorage.getItem("wax_user")
}
const wax = new waxjs.WaxJS(process.env.VUE_APP_CHAIN_FULL_URL, laccount, keys, false);

export default createStore({
    state: {
        ul: null,
        stakes: null,
        inventory: null,
        stakesInventory: null,
        stakeable: null,
        tinfos: null,
        tblState: null,
        loadedComponent: "Dashboard",
    },
    mutations: {
        addUl(state, ul) {
            state.ul = ul
        },
        clearUl(state, payload) {
            state.ul = payload
        },
        updateTblState(state, payload) {
            state.tblState = payload
        },
        updateTinfos(state, payload) {
            state.tinfos = payload
        },
        updateStakes(state, payload) {
            state.stakes = payload
        },
        updateInventory(state, payload) {
            state.inventory = payload
        },
        updateStakesInventory(state, payload) {
            state.stakesInventory = payload
        },
        updateLoadedComponent(state, payload) {
            state.loadedComponent = payload
        },
        updateStakeable(state, payload) {
            state.stakeable = payload
        }
    },
    actions: {
        getState({ commit }) {
            if (localStorage.getItem("state")) {
                let result = JSON.parse(localStorage.getItem('state'))
                commit('updateTblState', result);
                (async() => {
                    let stakeable = await ApiService.getStakeable(result.epoch)
                    commit('updateStakeable', stakeable[0]);
                })();
            } else {
                wax.rpc.get_table_rows({
                    json: true, // Get the response as json
                    code: process.env.VUE_APP_CONTRACT, // Contract that we target
                    scope: process.env.VUE_APP_CONTRACT, // Account that owns the data
                    table: 'state', // Table name
                    limit: 1, // Maximum number of rows that we want to get
                    reverse: false, // Optional: Get reversed data
                    show_payer: false // Optional: Show ram payer
                }).then((result) => {
                    localStorage.setItem("state", JSON.stringify(result.rows[0]))
                    commit('updateTblState', result.rows[0]);
                    (async() => {
                        let stakeable = await ApiService.getStakeable(result.rows[0].epoch)
                        commit('updateStakeable', stakeable[0])
                    })();
                });
            }
        },
        getTinfos({ commit }) {
            wax.rpc.get_table_rows({
                json: true, // Get the response as json
                code: process.env.VUE_APP_CONTRACT, // Contract that we target
                scope: process.env.VUE_APP_CONTRACT, // Account that owns the data
                table: 'tinfos', // Table name
                limit: 100, // Maximum number of rows that we want to get
                reverse: false, // Optional: Get reversed data
                show_payer: false // Optional: Show ram payer
            }).then(function(result) {
                commit('updateTinfos', result.rows)
            });
        },
        getStakes({ commit }) {
            wax.rpc.get_table_rows({
                json: true, // Get the response as json
                code: process.env.VUE_APP_CONTRACT, // Contract that we target
                scope: laccount, // Account that owns the data
                table: 'stakes', // Table name
                limit: 100, // Maximum number of rows that we want to get
                reverse: false, // Optional: Get reversed data
                show_payer: false // Optional: Show ram payer
            }).then(function(result) {
                commit('updateStakes', result.rows)
            });
        },
    },
    getters: {
        updateLoadedComponent: state => state.updateLoadedComponent,
        tblState: state => state.tblState,
        stakeable: state => state.stakeable,
        stakes: state => state.stakes,
        tinfos: state => state.tinfos,
        inventory: state => {
            var result = state.inventory
            if (state.tblState && state.tinfos) {
                for (let i = 0; i < result.length; i++) {
                    result[i].data.expired = ApiService.isExpired(result[i].data.expiration);
                    result[i].data.levelImg = `/img/levels/0.png`;
                    result[i].data.currentExpValue = 0
                    result[i].data.currentExp = 0
                    result[i].data.expiredDate = "";
                    result[i].data.stakeDate = "";
                    result[i].data.reqExpForNextLevel = 0;
                    result[i].data.currentExp = 0;
                    result[i].data.quantity = 0;
                    var parentAsset = false
                        // for each NFT we need a record in tinfos to calculate expiry time,level and XP
                    let item = state.tinfos.find(nft => {
                        // each lease asset has parent asset id we can show xp,level for lease asset as well through parent
                        parentAsset = (nft.asset_id === result[i].data.parent)
                        if (nft.asset_id === result[i].asset_id) {
                            return nft;
                        } else if (parentAsset) {
                            return nft;
                        }
                    })

                    if (item) {
                        let tpts = item.tpts
                        let quantity = item.quantity[0]
                            // stake asset has expiration date in meta either get it or get it from tinfos
                        let expiredDate = result[i].data.expiration ? result[i].data.expiration : tpts[1];
                        let createdDate = tpts[0];
                        let localCurrentTime = new Date();
                        let currentUtc = moment.utc(localCurrentTime).format('YYYY-MM-DD HH:mm:ss')
                        let stakeCreated = new Date(createdDate);
                        let stakeExpiry = new Date(expiredDate);
                        result[i].data.stakeDate = moment(stakeCreated).format('YYYY-MM-DD HH:mm:ss');
                        result[i].data.expiredDate = moment(stakeExpiry).format('YYYY-MM-DD HH:mm:ss');
                        result[i].data.expired = moment(currentUtc).isAfter(moment(result[i].data.expiredDate));
                        // total stake time is the difference between stakeExpiry and StakeCreated date time
                        let totalStakeTime = moment.duration(moment(stakeExpiry).diff(moment(stakeCreated))).asHours();
                        // time till expiration is the difference between stakeExpiry and currentUtc date time
                        let timeTillExp = moment.duration(moment(stakeExpiry).diff(moment(currentUtc))).asHours();
                        // if nft is expired or timeTillExpiration is less then 0 NextLvel XP is 0
                        if (timeTillExp < 0 || result[i].data.expired) {
                            result[i].data.reqExpForNextLevel = 0
                        } else {
                            result[i].data.reqExpForNextLevel = (Number(timeTillExp) / Number(totalStakeTime)) * 100
                        }
                        // Quantity has 4 decimal 
                        result[i].data.quantity = quantity //(quantity / 10000).toFixed(4);
                        let level = Number(item.level);
                        let asset_exp = Number(item.value[0]);
                        result[i].data.level = level;
                        let exp_lvls = state.tblState.exp_lvls
                        let exp_previous = 0
                        if (level != 0) {
                            exp_previous = Number(exp_lvls[level - 1])
                        }
                        let exp_next = Number(exp_lvls[level])
                        let exp_progression = Number(asset_exp - exp_previous)
                        let lvl_exp = Number(exp_next - exp_previous)
                        let progressBar = Math.abs(Number(exp_progression / lvl_exp));
                        progressBar = isNaN(progressBar) ? 100 : progressBar;
                        result[i].data.currentExpValue = (progressBar).toFixed(4)
                        result[i].data.currentExp = progressBar * 100;
                        result[i].data.levelImg = `/img/levels/${level+1}.png`;
                        if (result[i].data.currentExp > 100) {
                            result[i].data.currentExp = 100
                        }
                    }
                    state.inventory = result
                }
            }
            return state.inventory
        },
        stakesInventory: state => {
            var result = state.stakesInventory
            if (state.tblState && state.stakes && result) {
                for (let i = 0; i < result.length; i++) {
                    result[i].data.expired = "";
                    result[i].data.expiredDate = "";
                    result[i].data.stakeDate = "";
                    result[i].data.quantity = 0;
                    result[i].data.reqExpForNextLevel = 0;
                    var parentAsset = false
                    let item = state.stakes.find(nft => {
                        // each stake asset has parent asset id we can show xp,level for lease asset as well through parent
                        parentAsset = (nft.asset_id === result[i].data.parent)
                        if (nft.asset_id === result[i].asset_id) {
                            return nft;
                        } else if (parentAsset) {
                            return nft;
                        }
                    })

                    if (item) {
                        let tpts = item.tpts
                        let quantity = item.quantity[0]
                            // stake asset has expiration date in meta either get it or get it from tinfos
                        let expiredDate = result[i].data.expiration ? result[i].data.expiration : tpts[1];
                        let createdDate = tpts[0];
                        let localCurrentTime = new Date();
                        let currentUtc = moment.utc(localCurrentTime).format('YYYY-MM-DD HH:mm:ss')
                        let stakeCreated = new Date(createdDate);
                        let stakeExpiry = new Date(expiredDate);
                        result[i].data.stakeDate = moment(stakeCreated).format('YYYY-MM-DD HH:mm:ss');
                        result[i].data.expiredDate = moment(stakeExpiry).format('YYYY-MM-DD HH:mm:ss');
                        result[i].data.expired = moment(currentUtc).isAfter(moment(result[i].data.expiredDate));
                        // total stake time is the difference between stakeExpiry and StakeCreated date time
                        let totalStakeTime = moment.duration(moment(stakeExpiry).diff(moment(stakeCreated))).asHours();
                        // time till expiration is the difference between stakeExpiry and currentUtc date time
                        let timeTillExp = moment.duration(moment(stakeExpiry).diff(moment(currentUtc))).asHours();
                        if (timeTillExp < 0 || result[i].data.expired) {
                            result[i].data.reqExpForNextLevel = 0
                        } else {
                            result[i].data.reqExpForNextLevel = (Number(timeTillExp) / Number(totalStakeTime)) * 100
                        }
                        // Quantity has 4 decimal 
                        result[i].data.quantity = quantity //(quantity / 10000).toFixed(4);
                    }
                    state.stakesInventory = result
                }
            }
            return state.stakesInventory
        },
        inventoryById: (state) => (id) => {
            return state.inventory.find(nft => nft.asset_id === id)
        }
    }
});