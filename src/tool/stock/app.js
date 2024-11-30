function getLocationParams() {
    return {
        cost: parseFloat(blog.getLocationParam(1, 9)),
        price: parseFloat(blog.getLocationParam(2, 10)),
        number: parseInt(blog.getLocationParam(3, 1000)),
        limitUp: parseInt(blog.getLocationParam(4, 0)),
    };
}

var defaultParam = getLocationParams();
console.log("default param", defaultParam);

var vueApp = new Vue({
    el: "#app",
    data: function () {
        return {
            cost: defaultParam.cost,
            price: defaultParam.price,
            number: defaultParam.number,
            limitUp: defaultParam.limitUp,
            actionTypes: [
                "买入",
                "卖出",
            ],
            actions: [{
                type: "买入",
                price: defaultParam.price,
                number: 0,
                enabled: true
            }]
        }
    },
    filters: {
        CNY: function (value) {
            return currency(
                value || 0,
                {
                    symbol: "",
                    separator: ",",
                    precision: 2
                })
                .format();
        }
    },
    methods: {
        addAction() {
            this.actions.push({
                type: "买入",
                price: this.price,
                number: 0,
                enabled: true
            });
        }
    },
    computed: {
        result() {
            var param = {
                type: "当前持仓",
                enabled: true,
                cost: parseFloat(this.cost),
                price: parseFloat(this.price),
                number: parseInt(this.number),
                limitUp: parseInt(this.limitUp),
                actions: this.actions
            };

            var result = calculate(param);

            console.log("calculate param", param);
            console.log("calculate result", result);

            blog.setLocationParams(this.cost, this.price, this.number, this.limitUp);

            return result;
        }
    }
});