import * as waxjs from "@waxio/waxjs/dist";

var keys = null
var loginAccount = null
if (localStorage.getItem("ual-wax:autologin") != null) {
    let ualWax = JSON.parse(localStorage.getItem("ual-wax:autologin"))
    keys = ualWax ? ualWax.pubKeys : null
    loginAccount = localStorage.getItem("wax_user")
}
const wax = new waxjs.WaxJS('https://wax.greymass.com', loginAccount, keys, false);

const getTinfos = async function() {
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
const getStakes = async function() {
    const result = await wax.rpc.get_table_rows({
        json: true, // Get the response as json
        code: process.env.VUE_APP_CONTRACT, // Contract that we target
        scope: loginAccount, // Account that owns the data
        table: 'stakes', // Table name
        limit: 100, // Maximum number of rows that we want to get
        reverse: false, // Optional: Get reversed data
        show_payer: false // Optional: Show ram payer
    });
    return result.rows
}
async function getState() {
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

export function calculate(assetId, tinfos, state) {
    if (!assetId || !tinfos || !state) {
        return [0, 0]
    }
    const exp_lvls = state.exp_lvls
    let exp_previous = 0 //the experience points that were needed to reach the current level.
    let exp_next = 0 //the experience needed to reach the next level.
    let asset_exp = 0; //the exp the NFT currently has.
    let level = 0 //the current level iterator, keep in mind it's zero initialized, so if the table says the level is 0, you would display it with the level one icon in the front end.
    let exp_progression = 0;
    let lvl_exp = 0;
    let progressBar = 0;
    for (let index = 0; index < tinfos.length; index++) {
        let item = tinfos[index]
        if (item.asset_id === assetId) {
            level = Number(item.level);
            exp_next = Number(exp_lvls[level])
            if (level == 0) {
                exp_previous = 0
            } else {
                exp_previous = Number(exp_lvls[level - 1])
            }
            asset_exp = Number(item.value[0]);
            exp_progression = Number(asset_exp - exp_previous)
            lvl_exp = Number(exp_next - exp_previous)
            progressBar = Number(exp_progression / lvl_exp)
        }
    }
    switch (progressBar) {
        case progressBar <= 25:
            progressBar = 25;
            break;
        case (progressBar > 24 && progressBar <= 50):
            progressBar = 50;
            break;

        case (progressBar > 49 && progressBar <= 75):
            progressBar = 75;
            break;
        case (progressBar > 74 && progressBar <= 100):
            progressBar = 100;
            break;
        default:
            break;
    }
    return [progressBar, level];
}
export default {
    wax,
    getTinfos,
    getState,
    getStakes
}