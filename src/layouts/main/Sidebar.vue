<template>
  <!-- NAVIGATION WIDGET -->
  <nav
    id="navigation-widget-small"
    class="navigation-widget navigation-widget-desktop closed sidebar left delayed"
  >

    <!-- MENU -->
    <ul class="menu small">
      <li class="menu-item">
        <router-link to="/dashboard">
          <img  src="@/assets/img/landing/question-logo.png" alt="Logo" width="45" height="45"/>
        </router-link>
      </li>
      <br/>
      <!-- MENU ITEM -->
      <li class="menu-item active">
        <!-- MENU ITEM LINK -->
        <a
          class="menu-item-link text-tooltip-tfr"
          href="/#"
          data-title="Forums"
        >
          <!-- MENU ITEM LINK ICON -->
          <svg class="menu-item-link-icon icon-forums">
            <use xlink:href="#svg-forums"></use>
          </svg>
          <!-- /MENU ITEM LINK ICON -->
        </a>
        <!-- /MENU ITEM LINK -->
      </li>
      <!-- /MENU ITEM -->
    </ul>
    <!-- /MENU -->
  </nav>
  <!-- /NAVIGATION WIDGET -->
</template>

<script>
export default {
  name: "TopNavbar",
};
</script>

<style>
.sidebar.navigation-widget.delayed {
  padding-top: 0px;
}
</style>
