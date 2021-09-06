import { UALJs } from "ual-plainjs-renderer";
import { Anchor } from "ual-anchor";
import { Wax } from "@eosdacio/ual-wax";
import router from '../router'

// login function
var ual = null
export default class WaxService {
    handle_login() {
        const myChain = {
            chainId: process.env.VUE_APP_CHAIN_ID,
            rpcEndpoints: [{
                protocol: "https",
                host: process.env.VUE_APP_CHAIN_URL,
                port: '443',
            }, ],
        };

        // this call after successfull login from EOSIO
        const myLoginCallback = users => {
            this.users = users;
            // achor login return session in payload wax does'nt so a key is set in local store to identify session 
            // wax or anchor
            if (this.users[0].session) {
                localStorage.setItem("ual-session-authenticator", "anchor")
            } else {
                localStorage.setItem("ual-session-authenticator", "Wax")
            }
            // session details save in local storage
            localStorage.setItem('wax_user', this.users[0].accountName);
            // navigate to dashboard after login
            router.push('/dashboard');
        }

        const myAppName = process.env.VUE_APP_NAME

        //auth partners
        const wax = new Wax([myChain], { appName: myAppName });
        const anchor = new Anchor([myChain], { appName: myAppName });

        // login component load to HTML
        const myAppRoot = {
            containerElement: document.getElementById('ual-div')
        }

        // validate authentication
        ual = new UALJs(myLoginCallback, [myChain], myAppName, [wax, anchor], myAppRoot);
        ual.init();
        // hide UAL button load from liabary after click
        var [buttonUAL] = document.body.getElementsByClassName('ual-button-gen');
        buttonUAL.click();
        // buttonUAL.remove();
        var popups = document.getElementsByClassName('ual-button-gen'),
            i = popups.length;
        try {
            do {
                i--;
                popups[i].remove();
            } while (i >= 0)
        } catch (error) {
            console.warn(error)
        }
        return ual;
    }
    sessionLogin() {
        const myChain = {
            chainId: process.env.VUE_APP_CHAIN_ID,
            rpcEndpoints: [{
                protocol: "https",
                host: process.env.VUE_APP_CHAIN_URL,
                port: '443',
            }, ],
        };

        // this call after successfull login from EOSIO
        const myLoginCallback = users => {
            this.users = users;
            if (this.users[0].session) {
                localStorage.setItem("ual-session-authenticator", "anchor")
            } else {
                localStorage.setItem("ual-session-authenticator", "Wax")
            }
            localStorage.setItem('wax_user', this.users[0].accountName);
        }
        const myAppName = process.env.VUE_APP_NAME
        const wax = new Wax([myChain], { appName: myAppName });
        const anchor = new Anchor([myChain], { appName: myAppName });
        const myAppRoot = {
            containerElement: document.getElementById('ual-div')
        }
        ual = new UALJs(myLoginCallback, [myChain], myAppName, [wax, anchor], myAppRoot);
        ual.attemptSessionLogin([wax, anchor]);
        return ual;
    }
}