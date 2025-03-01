const rateNameList = Object.keys(rates);
const rateName = rateNameList[0];
const insuranceNameList = Object.keys(insurances);
const insuranceName = insuranceNameList[0];
let precision = blog.isMobile() ? 0 : 2;

new Vue({
    el: "#app",
    data: function () {
        return {
            amount: 5000,
            month: 12,
            precision: precision,
            rateNameList: rateNameList,
            rateName: rateName,
            rate: rates[rateName],
            insuranceNameList: insuranceNameList,
            insuranceName: insuranceName,
            insurance: insurances[insuranceName],
            bonus: 0,
            bonusSingleTax: true,
            bonusRates: bonusRates
        }
    },
    filters: {
        CNY: function (value) {
            return blog.number(value || 0, precision).format();
        }
    },
    computed: {
        salarys() {
            var items = buildSalaryList(
                parseInt(this.amount, 10),
                this.month,
                this.insurance,
                this.rate,
                this.bonus,
                this.bonusSingleTax,
                this.bonusRates
            );
            calculateOneYear(items);
            items.shift();
            console.log("calculate salarys", items);

            var summary = buildSummary(items);
            console.log("calculate salarys year summary", summary);

            return {
                items: items.reverse(),
                summary: summary
            };
        }
    },
    methods: {
        onMonthChange(month) {
            if (month > 12) {
                var bonusMonth = month - 12;
                this.bonus = blog.round(this.amount * bonusMonth);
            }
        },
        onRateNameChange(name) {
            this.rate = rates[name];
        },
        onInsuranceNameChange(name) {
            this.insurance = insurances[name];
        },
        onInsuranceMinChange(e) {
            const min = e.target.value;
            this.insurance.items.forEach(x => x.min = min);
        },
        onInsuranceMaxChange(e) {
            const max = e.target.value;
            this.insurance.items.forEach(x => x.max = max);
        },
        onPrecisionChange(value) {
            precision = value;
        }
    }
});