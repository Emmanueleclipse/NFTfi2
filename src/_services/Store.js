const store = {
    debug: true,

    state: reactive({
        ul: null
    }),

    setUlAction(newValue) {
        if (this.debug) {
            console.log('setUlAction triggered with', newValue)
        }

        this.state.ul = newValue
    },

    clearMessageAction() {
        if (this.debug) {
            console.log('clearMessageAction triggered')
        }

        this.state.ul = ''
    }
}