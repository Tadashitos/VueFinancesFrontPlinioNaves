<template>
    <app-layout>
        <router-view />
    </app-layout>
</template>

<script>
    import { registerVuexModule } from '@/utils'
    import financesStore from './../modules/finances/store'
    import AppLayout from './../components/AppLayout.vue'

    export default {
        name: 'Dashboard',
        components: {
            AppLayout
        },
        created(){
            registerVuexModule(this.$store, 'finances', financesStore)
        }
    }
</script>

