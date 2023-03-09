<template>
    <div>
        <TotalBalance class="mb-2" />

        <AppbarByMonth 
            class="mb-2" 
            format="MM-YYYY" 
            @month="changeMonth" 
            :color="appbarColor"
            :month="month || $route.query.month"
            :showSlot="true"
        >
            <RecordsFilter @filter="filter" />
        </AppbarByMonth>
        <v-card>
            <v-card-text class="text-xs-center" v-if="mappedRecordsLength === 0">
                <v-icon size="100" color="grey">assignment</v-icon>
                <p class="font-weight-light subheading grey--text">
                    Nenhum lançamento no período
                </p>
            </v-card-text>
            <v-list two-line subheader v-else>
                <template v-for="(recordsValue, date, index) in mappedRecords">
                    <v-subheader :key="date">{{ date }}</v-subheader>
                    <RecordsListItem 
                        v-for="record in recordsValue"
                        :key="record.id" 
                        :record="record"
                    />
                    <v-divider :key="`${date}-${index}`" v-if="showDivider(index, mappedRecords)"></v-divider>
                </template>
            </v-list>

            <v-footer class="pa-2">
                <v-flex text-xs-right>
                    <h3 class="font-weight-light">
                        <span>Saldo do mês:</span>
                        <strong class="ml-5" :class="amountColor(totalAmount)">{{  formatCurrency(totalAmount) }}</strong>
                    </h3>
                </v-flex>
            </v-footer>
        </v-card>
    </div>
</template>

<script>
    import moment from 'moment'
    import { groupBy } from '@/utils'

    import { createNamespacedHelpers } from 'vuex'

    import { Subject } from 'rxjs'
    import { mergeMap } from 'rxjs/operators'

    import amountColorMixin from './../mixins/amount-color'
    import formatCurrencyMixin from '@/mixins/format-currency'
    import AppbarByMonth from './AppbarByMonth.vue'
    import RecordsFilter from './RecordsFilter.vue'
    import RecordsListItem from './RecordsListItem.vue'
    import TotalBalance from './TotalBalance.vue'

    import RecordsService from './../services/records-service'

    const { mapState, mapActions } = createNamespacedHelpers('finances')

    export default {
        name: 'RecordsList',
        mixins: [amountColorMixin, formatCurrencyMixin],
        components: {
            AppbarByMonth,
            RecordsFilter,
            RecordsListItem,
            TotalBalance
        },
        data: () => ({
            records: [],
            filtersSubject$: new Subject(),
            subscriptions: []
        }),
        computed: {
            ...mapState(['filters', 'month']),
            mappedRecords(){
                return groupBy(this.records, 'date', (record, dateKey) => {
                    return moment(record[dateKey].substr(0, 10)).format('DD/MM/YYYY') //return record.date //O substr() serve para corrigir o fuso padrão do formato ISO da data que subtrai 3 horas do fuso América/São Paulo. Dessa forma, não será exibido o dia anterior a data informada no lançamento.
                })
            },
            mappedRecordsLength(){
                return Object.keys(this.mappedRecords).length
            },
            totalAmount(){
                return this.records.reduce((sum, record) => sum + record.amount, 0)
            },
            appbarColor(){
                return this.totalAmount < 0 
                ? 'error'
                : 'primary'
            }
        },
        created(){
            this.setRecords()
        },
        destroyed(){
            this.subscriptions.forEach(s => s.unsubscribe())
        },
        methods: {
            ...mapActions(['setMonth']),
            changeMonth(month){
                this.$router.push({
                    path: this.$route.path,
                    query: {
                        month
                    }
                }).catch((err) => {
                    console.log('Erro: ', err)
                })

                this.setMonth({ month })
                this.filter()
            },
            filter(){
                this.filtersSubject$.next({ month: this.month, ...this.filters })
            },
            setRecords(){
                this.subscriptions.push(
                    this.filtersSubject$
                        .pipe(mergeMap(variables => RecordsService.records(variables)))
                        .subscribe(records => (this.records = records))
                )
            },
            showDivider(index, object){
                return index < Object.keys(object).length - 1
            }
        }
    }
</script>

