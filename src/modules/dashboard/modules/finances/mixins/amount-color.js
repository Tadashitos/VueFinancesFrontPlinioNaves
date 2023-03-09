export default {
    methods: {
        amountColor(amount){
            const textLighten = 'text--lighten-1'
            return amount < 0
            ? `error--text ${textLighten}`
            : `primary--text ${textLighten}`
        }
    }
}