const RecordsHome = () => import('./../views/RecordsHome.vue')
const RecordsAdd = () => import('./../views/RecordsAdd.vue')
const ReportsHome = () => import('./../views/ReportsHome.vue')

export default [
    {
        path: 'records', //sem a "/" pois ela é uma rota filha (de dashboard) e não rota raiz
        component: RecordsHome,
        meta: {
            requiresAuth: true
        },
        alias: ['home', '']
    },
    {
        path: 'records/add',
        component: RecordsAdd,
        meta: {
            requiresAuth: true
        },
        name: 'recordsAdd'
    },
    {
        path: 'reports',
        component: ReportsHome,
        meta: {
            requiresAuth: true
        }
    }
]

//Aqui um detalhe sobre o path "records". Eu quero que o usuário consiga acessar essa rota de 3 formas:
// /dashboard/records
// /dashboard/home
// /dashboard
//Pra fazer isso, trabalharemos com alias


