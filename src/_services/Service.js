/*
Created by : @abdulmanan7
Purpose : common function
*/
import axios from 'axios'
import Link from 'anchor-link'
import * as waxjs from "@waxio/waxjs/dist";
import moment from 'moment';
import BrowserTransport from 'anchor-link-browser-transport'
var keys = null
var laccount = null
if (localStorage.getItem("ual-wax:autologin") != null) {
    let ualWax = JSON.parse(localStorage.getItem("ual-wax:autologin"))
    keys = ualWax ? ualWax.pubKeys : null
}
if (localStorage.getItem("wax_user") != null) {
    laccount = localStorage.getItem("wax_user")
}
const wax = new waxjs.WaxJS(process.env.VUE_APP_CHAIN_FULL_URL, laccount, keys, false);
export function getImgUrl(hash) {
    // return '//dweb.link/ipfs/' + hash;
    // return '//cloudflare-ipfs.com/' + hash;
    // return 'https://resizer.atomichub.io/images/v1/preview?ipfs=' + hash + "&size=370";
    return process.env.VUE_APP_ASSET_URL + hash;
}
export function makeRequestParams(userFilter, searchTerm, userCollection, stakeable) {
    let params = "";
    if (userFilter == 'stakable' && userCollection == "Select") {
        params += `&collection_name=${stakeable}`;
    }
    if (userFilter == "only_duplicate_templates") {
        params += "&only_duplicate_templates=true";
    }
    if (userFilter == "transfered_order_new") {
        params += "&order=desc&sort=transferred";
    }
    if (userFilter == "transfered_order_new") {
        params += "&order=desc&sort=transferred";
    }
    if (userFilter == "transfered_order_old") {
        params += "&order=asc&sort=transferred";
    }
    if (userFilter == "created_order_new") {
        params += "&order=desc&sort=created";
    }
    if (userFilter == "created_order_old") {
        params += "&order=asc&sort=created";
    }
    if (userFilter == "alphabetical_a_z") {
        params += "&order=asc&sort=name";
    }
    if (userCollection && userCollection != "Select") {
        params += "&collection_name=" + userCollection;
    }
    if (searchTerm) {
        params += "&match=" + searchTerm;
    }
    return params;
}

export async function callApi(params, callback) {
    axios
        .get(`${process.env.VUE_APP_API_ASSET_URL}?owner=${localStorage.getItem('wax_user')}&page=1&limit=10000${params}`)
        .then(() => callback)
}
export async function getCollections(collections) {
    return collections.reduce((col, current) => {
        const x = col.find(item => item.name === current.name);
        if (!x) {
            return col.concat([current]);
        } else {
            return col;
        }
    }, []);
}
export async function getState() {
    if (localStorage.getItem("state")) {
        return JSON.parse(localStorage.getItem('state'))
    } else {
        const result = await wax.rpc.get_table_rows({
            json: true, // Get the response as json
            code: process.env.VUE_APP_CONTRACT, // Contract that we target
            scope: process.env.VUE_APP_CONTRACT, // Account that owns the data
            table: 'state', // Table name
            limit: 1, // Maximum number of rows that we want to get
            reverse: false, // Optional: Get reversed data
            show_payer: false // Optional: Show ram payer
        });
        localStorage.setItem("state", JSON.stringify(result.rows[0]))
        return result.rows[0]
    }
}
export async function getTinfos() {
    const result = await wax.rpc.get_table_rows({
        json: true, // Get the response as json
        code: process.env.VUE_APP_CONTRACT, // Contract that we target
        scope: process.env.VUE_APP_CONTRACT, // Account that owns the data
        table: 'tinfos', // Table name
        limit: 100, // Maximum number of rows that we want to get
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
    });
    return result.rows
}
export async function getStakes() {
    const result = await wax.rpc.get_table_rows({
        json: true, // Get the response as json
        code: process.env.VUE_APP_CONTRACT, // Contract that we target
        scope: laccount, // Account that owns the data
        table: 'stakes', // Table name
        limit: 1000, // Maximum number of rows that we want to get
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
    });
    return result.rows
}
export async function getStakeable() {
    const result = await wax.rpc.get_table_rows({
        json: true, // Get the response as json
        code: process.env.VUE_APP_CONTRACT, // Contract that we target
        index_position: 1,
        key_type: "",
        limit: "100",
        lower_bound: null,
        reverse: false,
        scope: process.env.VUE_APP_CONTRACT,
        show_payer: false,
        table: "epochs",
        upper_bound: null
    });
    return result.rows
}
export async function fetchStakes() {
    const result = await wax.rpc.get_table_rows({
        json: true, // Get the response as json
        code: process.env.VUE_APP_CONTRACT, // Contract that we target
        scope: laccount, // Account that owns the data
        table: 'stakes', // Table name
        limit: 100, // Maximum number of rows that we want to get
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
    });
    let stakes = result.rows
    let ids = "";
    for (var i = 0; i < stakes.length; i++) {
        let comma = (ids === "") ? "" : ",";
        ids = `${ids}${comma}${stakes[i].asset_id}`
    }
    return ids;
}
const link = new Link({
    transport: new BrowserTransport({ requestStatus: false, storagePrefix: process.env.VUE_APP_NAME }),
    chains: [{
        chainId: process.env.VUE_APP_CHAIN_ID,
        nodeUrl: process.env.VUE_APP_CHAIN_FULL_URL,
    }]
})
export async function doSign(action, onSuccessCallback, onErrorCallback) {
    link.restoreSession(process.env.VUE_APP_NAME).then((session) => {
        session.transact({
            actions: (action instanceof Array) ? action : [action]
        }, {
            blocksBehind: 3,
            expireSeconds: 120,
        }).then(onSuccessCallback).catch(onErrorCallback)
    }).catch((error) => {
        (async() => {
            const identity = await link.login(process.env.VUE_APP_NAME)
            const { session } = identity
            session.transact({
                actions: (action instanceof Array) ? action : [action]
            }, {
                blocksBehind: 3,
                expireSeconds: 120,
            }).then(onSuccessCallback).catch(onErrorCallback)
        })()
        return error;
    })
}
export async function signWithWax(data, onErrorCallback, onSuccessCallback) {
    let isAutoLoginAvailable = await wax.isAutoLoginAvailable();
    if (!isAutoLoginAvailable) {
        await wax.login();
    }
    let userAccount = wax.userAccount;
    try {
        await wax.api.transact({
            actions: [{
                account: 'atomicassets',
                name: 'transfer',
                authorization: [{
                    actor: userAccount,
                    permission: 'active',
                }],
                data: data,
            }]
        }, {
            blocksBehind: 3,
            expireSeconds: 120,
            broadcast: true,
            sign: true,
        }).then(onSuccessCallback).catch(onErrorCallback)
    } catch (error) {
        return onErrorCallback(error)
    }
}
export async function signWithWaxGeneric(action, onErrorCallback, onSuccessCallback) {
    let isAutoLoginAvailable = await wax.isAutoLoginAvailable();
    if (!isAutoLoginAvailable) {
        await wax.login();
    }
    try {
        await wax.api.transact(action, {
            blocksBehind: 3,
            expireSeconds: 120,
            broadcast: true,
            sign: true,
        }).then(onSuccessCallback).catch(onErrorCallback)
    } catch (error) {
        return onErrorCallback(error)
    }
}
export function isLogin() {
    // check local store and also expiry of session
    if (localStorage.getItem('wax_user')) {
        var currentDate = localStorage.getItem("ual-session-expiration");
        var d1 = new Date();
        var d2 = new Date(currentDate);
        return !(d1 > d2);
    } else {
        return false
    }
}
export async function fetchData(url, callback) {
    axios
        .get(url)
        .then(callback)
}
export function isExpired(expiredDate) {
    if (typeof expiredDate === 'undefined') return "";
    let localCurrentTime = new Date();
    let currentUtc = moment.utc(localCurrentTime).format('YYYY-MM-DD HH:mm:ss')
    let expired = moment(currentUtc).isAfter(moment(expiredDate));
    return expired
}