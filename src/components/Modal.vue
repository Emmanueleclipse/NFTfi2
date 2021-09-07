<template>
  <transition name="modal-fade">
    <div v-body-scroll-lock="this.isModalVisible" class="modal-backdrop">
      <div class="modal container">
        <header class="modal-header">
          <slot name="header" />
        </header>

        <section class="modal-body">
          <slot name="body" />
        </section>

        <footer class="modal-footer">
          <slot name="footer" />
          <button class="button secondary" @click="close">
            Close Modal
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "Modal",
  props: ['isModalVisible'],
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #1d2333;
  color: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 0 40px 0 rgb(0 0 0 / 6%);
  width: 800px;
  height: 800px;
  margin: auto;
  position: relative;
  overflow-y: auto;
}

.modal-header,
.modal-footer {
  display: flex;
  text-align: center;
}

.modal-header {
  border-bottom: 1px solid #0f131c;
  color: #fff;
  font-weight: bold;
  font-size: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #0f131c;
  flex-direction: column;
  justify-content: flex-end;
}

.modal-body {
  position: relative;
}

.btn-close {
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  font-size: 20px;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  color: #4aae9b;
  background: transparent;
}

.btn-green {
  color: white;
  background: #4aae9b;
  border: 1px solid #4aae9b;
  border-radius: 2px;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}
</style>
