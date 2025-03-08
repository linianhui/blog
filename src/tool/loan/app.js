var localtionParam = blog.getLocationParamJson() || {};
console.log("localtionParam", localtionParam);
var loanParam = localtionParam.loan || {};
var actionsParam = localtionParam.actions || [];

var defaultLoan = {
    totalPrincipal: 1000000,
    beginDate: dateFormat(moment()),
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
actions.sort((a, b) => dateDiffDays(a.date, b.date));

var defautParam = {
    loan: loan,
    actions: actions
};
var defautParamJson = JSON.stringify({ loan: defaultLoan, actions: [] });
console.log("defautParam", defautParamJson);

var vueApp = new Vue({
    el: "#app",
    data: function () {
        return {
            asc: true,
            showAction: false,
            showRepaired: false,
            afterActionTypes: LOAN_PREPAYMENT_AFTER_ACTION_TYPE_LIST,
            loan: loan,
            resetRateAction: {
                type: LOAN_REPLAMENT_PLAN_ACTION_TYPE_RESET_RATE,
                date: dateAddMonths(moment(), 3),
                yearRate: loan.yearRate
            },
            prepaymentAction: {
                type: LOAN_REPLAMENT_PLAN_ACTION_TYPE_PREPAYMENT,
                date: dateAddMonths(moment(), 1),
                principal: 10000,
                afterAction: LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_TIME_NOT_GTE_PRINICIPAL
            },
            changePrinicipalAction: {
                type: LOAN_REPLAMENT_PLAN_ACTION_TYPE_CHANGE_PRINICIPAL,
                date: dateAddMonths(moment(), 1),
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
            this.actions.sort((a, b) => dateDiffDays(a.date, b.date));
        },
        addPrepaymentAction() {
            this.actions.push(blog.deepClone(this.prepaymentAction));
            this.actions.sort((a, b) => dateDiffDays(a.date, b.date));
        },
        addChangePrinicipalAction() {
            this.actions.push(blog.deepClone(this.changePrinicipalAction));
            this.actions.sort((a, b) => dateDiffDays(a.date, b.date));
        },
        deleteAction(i) {
            this.actions.splice(i, 1);
        },
        downloadCsv() {
            var csv = "类型,还款日期,计息开始,计息结束,计息本金,年利率%,本期利率%,计息类型,计息,本期利息,本期本金,本金总额,剩余本金";
            for (var index = 0; index < this.items.length; index++) {
                var item = this.items[index];
                csv += "\n";
                csv += item.type + ",";
                csv += item.plan.repaymentDate + ",";
                csv += item.plan.beginInterestDate + ",";
                csv += item.plan.endInterestDate + ",";
                csv += blog.number(item.plan.balancePrincipal) + ",";
                csv += item.repayment.yearRate + ",";
                csv += item.repayment.rate + ",";
                csv += item.repayment.rateType + ",";
                csv += item.repayment.rateTimesText + ",";
                csv += blog.number(item.repayment.interest) + ",";
                csv += blog.number(item.repayment.principal) + ",";
                csv += blog.number(item.repayment.amount) + ",";
                csv += blog.number(item.balance.principal);
            }
            var csvFileName = this.loan.totalPrincipal + "-" + this.loan.beginDate + "-" + this.loan.totalNumberOfRepayment + "-" + this.loan.yearRate + ".csv";
            var csvFile = new File([csv], { type: "text/csv" });
            var csvUrl = URL.createObjectURL(csvFile);
            var csvA = document.createElement('a');
            csvA.href = csvUrl;
            csvA.download = csvFileName;
            document.body.appendChild(csvA);
            csvA.click();
            document.body.removeChild(csvA);
            URL.revokeObjectURL(csvUrl);
        }
    },
    computed: {
        result() {
            var items = calculateRepaymentPlanList(this.loan, this.actions);
            console.log("items", items);
            var result = sumRepaymentPlanList(items, this.asc);
            console.log("result", result);

            var param = {};
            param.loan = blog.deepClone(this.loan);
            param.actions = blog.deepClone(this.actions);
            var paramJson = JSON.stringify(param);
            if (paramJson != defautParamJson) {
                console.log("localtionParam", param);
                blog.setLocationParams(paramJson);
            } else {
                blog.setLocationParams();
            }

            this.items = items;
            return result;
        }
    }
});