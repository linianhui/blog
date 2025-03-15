var localtionParam = blog.getLocationParamJson() || {};
console.log('localtionParam', localtionParam);
var loanParam = localtionParam.loan || {};
var actionsParam = localtionParam.actions || [];

var defaultLoan = {
    totalPrincipal: 1000000,
    beginDate: blog.dateAddMonths(blog.dateNow(), -12),
    totalNumberOfRepayment: 240,
    yearRate: 3.5,
    repaymentDayOfMonth: 1
};

var loan = {};
loan.totalPrincipal = loanParam.totalPrincipal || defaultLoan.totalPrincipal;
loan.beginDate = loanParam.beginDate || defaultLoan.beginDate;
loan.totalNumberOfRepayment = loanParam.totalNumberOfRepayment || defaultLoan.totalNumberOfRepayment;
loan.yearRate = blog.number(loanParam.yearRate || defaultLoan.yearRate).value;
loan.repaymentDayOfMonth = loanParam.repaymentDayOfMonth || defaultLoan.repaymentDayOfMonth;
var actions = [];
for (var index = 0; index < actionsParam.length; index++) {
    var actionParam = actionsParam[index];
    if (actionParam) {
        var action = {};
        action.type = actionParam.type;
        action.date = actionParam.date;
        action.principal = actionParam.principal;
        action.afterAction = actionParam.afterAction;
        action.yearRate = actionParam.yearRate;
        action.type = actionParam.type;
        actions.push(action);
    }
}
actions.sort((a, b) => blog.dateDiffDays(a.date, b.date));

var defautParam = {
    loan: loan,
    actions: actions
};
var defautParamJson = JSON.stringify({ loan: defaultLoan, actions: [] });

var vueApp = new Vue({
    el: '#app',
    mounted() {
        this.initChart();
    },
    data: function () {
        return {
            asc: true,
            showAction: false,
            showRepaired: true,
            afterActionTypes: LOAN_PREPAYMENT_AFTER_ACTION_TYPE_LIST,
            loan: loan,
            resetRateAction: {
                type: LOAN_REPLAMENT_PLAN_ACTION_TYPE_RESET_RATE,
                date: blog.dateAddMonths(moment(), 3),
                yearRate: loan.yearRate
            },
            prepaymentAction: {
                type: LOAN_REPLAMENT_PLAN_ACTION_TYPE_PREPAYMENT,
                date: blog.dateAddMonths(moment(), 1),
                principal: 10000,
                afterAction: LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_TIME_NOT_GTE_PRINICIPAL
            },
            changePrinicipalAction: {
                type: LOAN_REPLAMENT_PLAN_ACTION_TYPE_CHANGE_PRINICIPAL,
                date: blog.dateAddMonths(moment(), 1),
                principal: 10000,
            },
            actions: actions
        }
    },
    filters: {
        CNY: function (value) {
            return blog.number(value || 0).format();
        }
    },
    methods: {
        initChart() {
            this.repairedChart = echarts.init(this.$refs.repairedChartDiv);
            this.balanceChart = echarts.init(this.$refs.balanceChartDiv);
            this.sumChart = echarts.init(this.$refs.sumChartDiv);
            this.renderMonthChart(this.repairedChart, this.repairedItems);
            this.renderMonthChart(this.balanceChart, this.balanceItems);
            this.renderSumChart(this.sumChart, this.sumItems);
        },
        sortTable() {
            this.asc = !this.asc;
        },
        showRepairedArea() {
            this.showRepaired = !this.showRepaired;
        },
        showActionArea() {
            this.showAction = !this.showAction;
        },
        addResetRateAction() {
            this.actions.push(blog.deepClone(this.resetRateAction));
            this.actions.sort((a, b) => blog.dateDiffDays(a.date, b.date));
        },
        addPrepaymentAction() {
            this.actions.push(blog.deepClone(this.prepaymentAction));
            this.actions.sort((a, b) => blog.dateDiffDays(a.date, b.date));
        },
        addChangePrinicipalAction() {
            this.actions.push(blog.deepClone(this.changePrinicipalAction));
            this.actions.sort((a, b) => blog.dateDiffDays(a.date, b.date));
        },
        deleteAction(i) {
            this.actions.splice(i, 1);
        },
        downloadCsvUtf8Bom() {
            this.downloadCsvCore('\uFEFF');
        },
        downloadCsv() {
            this.downloadCsvCore('');
        },
        downloadCsvCore(bom) {
            var csv = buildCsv(this.items, bom);
            var bomName = bom ? '-bom' : '';
            var csvFileName = this.loan.totalPrincipal + '-' + this.loan.beginDate + '-' + this.loan.totalNumberOfRepayment + '-' + this.loan.yearRate + '-utf8' + bomName + '.csv';
            var csvFile = new File([csv], { type: 'text/csv' });
            var csvUrl = URL.createObjectURL(csvFile);
            var csvA = document.createElement('a');
            csvA.href = csvUrl;
            csvA.download = csvFileName;
            document.body.appendChild(csvA);
            csvA.click();
            document.body.removeChild(csvA);
            URL.revokeObjectURL(csvUrl);
        },
        storeParams() {
            var param = {};
            param.loan = blog.deepClone(this.loan);
            param.actions = blog.deepClone(this.actions);
            var paramJson = JSON.stringify(param);
            if (paramJson != defautParamJson) {
                console.log('localtionParam', param);
                blog.setLocationParams(paramJson);
            } else {
                blog.setLocationParams();
            }
        },
        renderMonthChart(chart, items) {
            var data = items.map(item => {
                return {
                    '还款日期': item.plan.repaymentDate,
                    '本金': item.repayment.principal,
                    '利息': item.repayment.interest,
                    '总额': item.repayment.amount
                }
            });
            var option = {
                title: {
                    text: '每期还款明细'
                },
                backgroundColor: '#efe',
                legend: {
                    show: true
                },
                grid: {
                    left: 20,
                    right: 20,
                    top: 60,
                    bottom: 60,
                    containLabel: true
                },
                tooltip: {
                    show: true,
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    },
                },
                toolbox: {
                    show: true,
                    right: '20px',
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        magicType: { type: ['line', 'bar'] },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                dataset: {
                    sourceHeader: false,
                    source: data
                },
                dataZoom: [{
                    type: 'slider',
                }],
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: '本金',
                        type: 'bar',
                        stack: 'total',
                        symbol: 'none',
                        encode: {
                            x: '还款日期',
                            y: '本金',
                        }
                    },
                    {
                        name: '利息',
                        type: 'bar',
                        stack: 'total',
                        symbol: 'none',
                        encode: {
                            x: '还款日期',
                            y: '利息',
                        }
                    },
                    {
                        name: '总额',
                        type: 'line',
                        symbol: 'none',
                        encode: {
                            x: '还款日期',
                            y: '总额',
                        }
                    }
                ]
            };
            chart.setOption(option);
        },
        renderSumChart(chart, items) {
            var data = [];
            for (var index = 0; index < items.length; index++) {
                var item = items[index];
                data.push({
                    amountName: item.type + '金额 ' + item.amount + ' (' + item.amountPercent + '%)',
                    amountPercent: item.amountPercent,
                    principalName: item.type + '本金 ' + item.principal + ' (' + item.principalPercent + '%)',
                    principalPercent: item.principalPercent,
                    interestName: item.type + '利息 ' + item.interest + ' (' + item.interestPercent + '%)',
                    interestPercent: item.interestPercent
                });
            }

            var repaired = data[0];
            var balance = data[1];
            var total = data[2];
            var nodes = [
                { depth: 0, name: total.amountName },
                { depth: 1, name: total.principalName },
                { depth: 1, name: total.interestName },
                { depth: 2, name: repaired.principalName },
                { depth: 2, name: repaired.interestName },
                { depth: 2, name: balance.principalName },
                { depth: 2, name: balance.interestName },
                { depth: 3, name: repaired.amountName },
                { depth: 3, name: balance.amountName }
            ];

            var links = [
                {
                    source: total.amountName,
                    target: total.principalName,
                    value: total.principalPercent
                },
                {
                    source: total.amountName,
                    target: total.interestName,
                    value: total.interestPercent
                },
                {
                    source: total.principalName,
                    target: repaired.principalName,
                    value: repaired.principalPercent
                },
                {
                    source: total.principalName,
                    target: balance.principalName,
                    value: balance.principalPercent
                },
                {
                    source: total.interestName,
                    target: repaired.interestName,
                    value: repaired.interestPercent
                },
                {
                    source: total.interestName,
                    target: balance.interestName,
                    value: balance.interestPercent
                },
                {
                    source: repaired.principalName,
                    target: repaired.amountName,
                    value: repaired.principalPercent
                },
                {
                    source: balance.principalName,
                    target: balance.amountName,
                    value: balance.principalPercent
                },
                {
                    source: repaired.interestName,
                    target: repaired.amountName,
                    value: repaired.interestPercent
                },
                {
                    source: balance.interestName,
                    target: balance.amountName,
                    value: balance.interestPercent
                }
            ];
            var option = {
                title: {
                    text: '总还款百分比分布'
                },
                backgroundColor: '#efe',
                grid: {
                    left: 20,
                    right: 20,
                    top: 60,
                    bottom: 60,
                    containLabel: true
                },
                tooltip: {
                    show: true,
                    trigger: 'item'
                },
                toolbox: {
                    show: true,
                    right: '20px',
                    feature: {
                        saveAsImage: {}
                    }
                },
                series: [
                    {
                        type: 'sankey',
                        nodes: nodes,
                        links: links,
                        lineStyle: {
                            curveness: 0.5
                        }
                    }
                ]
            };
            chart.setOption(option);
        }
    },
    computed: {
        result() {
            this.items = calculateRepaymentPlanList(this.loan, this.actions);
            var result = sumRepaymentPlanList(this.items, this.asc);
            console.log('result', result);
            this.repairedItems = result.repairedItems;
            this.balanceItems = result.balanceItems;
            this.sumItems = result.sumItems;
            this.storeParams();
            return result;
        }
    },
    updated: function () {
        this.renderMonthChart(this.repairedChart, this.repairedItems);
        this.renderMonthChart(this.balanceChart, this.balanceItems);
        this.renderSumChart(this.sumChart, this.sumItems);
    }
});