import apollo from '@/plugins/apollo'
import moment from 'moment'
import { from } from 'rxjs'
import { map } from 'rxjs/operators'
import md5 from 'md5'

import RecordCreateMutation from './../graphql/RecordCreate.gql'
import RecordsQuery from './../graphql/Records.gql'
import TotalBalanceQuery from './../graphql/TotalBalance.gql'


const createRecord = async (variables) => {
    const response = await apollo.mutate({
        mutation: RecordCreateMutation,
        variables,
        update: (proxy, { data: { createRecord } }) => {
            //records
            const month = moment(createRecord.date.substr(0, 10)).format('MM-YYYY')
            const variables = { month }

            try {
                const recordsData = proxy.readQuery({
                    query: RecordsQuery,
                    variables
                }) //Lemos a query que precisamos

                recordsData.records = [...recordsData.records, createRecord] //Alteramos o que for necessário
                proxy.writeQuery({
                    query: RecordsQuery,
                    variables,
                    data: recordsData
                }) //Reescrevemos ela de volta
            } catch (e) {
                console.log('Query "records" has not been read yet!', e)
            }
            
            //totalBalance
            try {
                const currentDate = moment().endOf('day')
                const recordDate = moment(createRecord.date.substr(0, 10))
                const variables = { date: currentDate.format('YYYY-MM-DD') }

                if(recordDate.isBefore(currentDate)){
                    const totalBalanceData = proxy.readQuery({
                        query: TotalBalanceQuery,
                        variables
                    })

                    totalBalanceData.totalBalance = +(totalBalanceData.totalBalance + createRecord.amount).toFixed(2) //toFixed() retorna uma string, portanto, quando este método retornar o resultado, converteremos ele para um number, através do operador "+"
                    proxy.writeQuery({
                        query: TotalBalanceQuery,
                        variables,
                        data: totalBalanceData
                    })
                }
            } catch (e) {
                console.log('Query "totalBalance" has not been read yet!', e)
            }
        }
    })
    return response.data.createRecord
}

const recordsWatchedQueries = {}

const records = variables => {
    const hashKey = md5(
        Object.keys(variables)
                        .map(k => variables[k])
                        .join('_') //join() = [05-2019, 'outroelemento'] => [05-2019_outroelemento]
    )

    let queryRef = recordsWatchedQueries[hashKey]
    if(!queryRef) {
        queryRef = apollo.watchQuery({
            query: RecordsQuery,
            variables
        })
        recordsWatchedQueries[hashKey] = queryRef
    }

    return from(queryRef)
        .pipe(map(res => res.data.records))
}

const totalBalance = async () => {
    const response = await apollo.query({
        query: TotalBalanceQuery,
        variables: {
            date: moment().format('YYYY-MM-DD')
        }
    })

    return response.data.totalBalance
}

export default {
    createRecord,
    records: records,
    totalBalance: totalBalance
}




