import actions from './actions'
import mutations from './mutations'

const state = {
    filters: undefined,
    isFiltering: false,
    month: ''
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}

