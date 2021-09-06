<template>
  <div class="hello">
    <nav class="navbar navbar-expand-lg navbar-light bg-light" style="background-color: #e3f2fd;">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
        <a class="navbar-brand" href="#">EOSIO Site</a>
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          <li class="nav-item">
            <a class="nav-link disabled" href="#">About Us</a>
          </li>
        </ul>
        <form  class="form-inline my-2 my-lg-0">
            <label class="login-txt">You Are Login With: <b> {{authentication.user_name}}</b> &nbsp;&nbsp;</label>
            <button type="button" id="login-btn" class="btn btn-outline-success" @click="logout">Logout</button>
        </form>
      </div>
    </nav>
    <div class="container">
      <br/> <br/>
      <router-view></router-view>
    </div>
    <div id="ual-div"></div>
  </div>
</template>

<script>

import { reactive } from 'vue';
import router from '../router'

export default {
  name: "HelloWorld",
  mounted(){
    // validate session on mounting page
    if(!localStorage.getItem('wax_user')) {
        router.push('/login')
    }
  },
  setup() {
    // check authentication details
    const authentication = reactive({ user_name: localStorage.getItem('wax_user') });

    return {
      authentication
    };
  },
  methods: {
    logout: function() {
      router.push('/login')
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .login-txt {
      color: #000;
    }
</style>
