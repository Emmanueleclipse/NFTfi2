<template>
    <section class="login">
        <div class="container-fluid d-flex align-items-center justify-content-center">
            <div class="row login-form">
                <div class="col">
                    <div class="login-form-div">

                            <img
                                src="@/assets/img/landing/logo-transparent.png"
                                alt="rocket"
                                width="220"
                                height="220"
                            />

                            <h1 class="form-box-title"><span class="bg-blue">ACCOUNT</span> <span class="bg-violet">LOGIN</span></h1>

                            <div class="button-bg-background mt-5" @click="handle_login">
                                <h5>SIGN IN</h5>
                            </div>
                    </div>    
                </div>
            </div>
        </div>        
    </section>
    <div id="ual-div"></div>
</template>

<script lang="js">
import LoginService from '@/_services/login_service';
// import router from '../../router'
export default {
    name: 'login',
    data(){
        return {
            "ual":null
        }
    },
    mounted(){
        localStorage.removeItem("ual-session-authenticator")
        localStorage.removeItem("ual-session-expiration")
        localStorage.removeItem("autoLogin")
        localStorage.removeItem("loglevel:webpack-dev-server")
        localStorage.removeItem("ual-wax:autologin")
        localStorage.removeItem("wax_user")
        localStorage.clear();
    },
     methods: {
        handle_login:function () {
            if(this.ual){
                this.ual.init()
                var [buttonUAL] = document.body.getElementsByClassName('ual-button-gen');
                buttonUAL.click();
            }else{
                // let modal = document.getElementById('ual-modal');
                // if(modal){
                //     modal.remove()
                // }
                localStorage.clear();
                const loginService = new LoginService();
                this.ual = loginService.handle_login();
            }
            //this.$store.commit('addUl', ul[0]);
        }
    }
}
</script>

<style scoped lang="scss">
    .login {
        height: 100vh;
        background-color: #222222;
        .container-fluid {
            margin: 0px auto;
            
            .login-form {
                .login-form-div {
                    height: 600px;
                    width: 100%;
                    padding: 60px;
                    margin: 0 auto;
                    background: url('~@/assets/img/landing/login_Bg.png');
                    background-size: cover;
                    background-position: 50%;
                    background-repeat: no-repeat;
                }

                .button-bg-background {
                    background: url('~@/assets/img/landing/btn_bg.png');
                    background-size: cover;
                    background-position: 50%;
                    background-repeat: no-repeat;
                    width: 220px;
                    height: 60px;
                    border-radius: 5px;
                    margin: 0 auto;
                    padding-top: 20px;
                    cursor: pointer;
                }

                .button-bg-background:hover {
                    background: url('~@/assets/img/landing/btn_bg_active.png');
                    background-size: cover;
                    background-position: 50%;
                    background-repeat: no-repeat;
                    width: 220px;
                    height: 60px;
                    border-radius: 5px;
                    margin: 0 auto;
                    padding-top: 20px;
                    cursor: pointer;
                }

                .form-box-title {
                    margin-top: 30px;
                    font-weight: 500;
                    .bg-blue {
                        color: #0F74CF;
                    }
                    .bg-violet {
                        color: #D912FF;
                    }
                }
            }
        }
    }            
</style>
