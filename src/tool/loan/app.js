var localtionParam = blog.getLocationParamJson() || {};
console.log("localtionParam", localtionParam);
var loanParam = localtionParam.loan || {};
var actionsParam = localtionParam.actions || [];

var loan = {};
loan.totalPrincipal = loanParam.totalPrincipal || 1000000;
loan.beginDate = loanParam.beginDate || moment().format(LOAN_DATE_FORMAT);
loan.totalNumberOfRepayment = loanParam.totalNumberOfRepayment || 240;
loan.yearRate = loanParam.yearRate || 3.5;
loan.repaymentDayOfMonth = loanParam.repaymentDayOfMonth || 1;

console.log("loan", loan);

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
console.log("actions", actions);

var vueApp = new Vue({
    el: "#app",
    data: function () {
        return {
            asc: true,
            actionTypes: [
                LOAN_REPLAMENT_PLAN_TYPE_RESET_RATE,
                LOAN_REPLAMENT_PLAN_TYPE_PREPAYMENT,
            ],
            afterActionTypes: [
                LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_TIME_NOT_GTE_PRINICIPAL,
                LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_TIME_NOT_CHANGE_PRINICIPAL,
                LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_PRINICIPAL_NOT_CHANGE_TIME
            ],
            loan: loan,
            resetRateAction: {
                type: LOAN_REPLAMENT_PLAN_TYPE_RESET_RATE,
                date: moment().add(12, MONTHS).format(LOAN_DATE_FORMAT),
                yearRate: loan.yearRate
            },
            prepaymentAction: {
                type: LOAN_REPLAMENT_PLAN_TYPE_PREPAYMENT,
                date: moment().add(12, MONTHS).format(LOAN_DATE_FORMAT),
                principal: 10000,
                afterAction: LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_TIME_NOT_GTE_PRINICIPAL
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
        addResetRateAction() {
            this.actions.push(blog.deepClone(this.resetRateAction));
            this.actions.sort((a, b) => dateDiffDays(a.date, b.date));
        },
        addPrepaymentAction() {
            this.actions.push(blog.deepClone(this.prepaymentAction));
            this.actions.sort((a, b) => dateDiffDays(a.date, b.date));
        },
        deleteAction(i) {
            this.actions.splice(i, 1);
        }
    },
    computed: {
        result() {
            var result = {};
            var items = calculateRepaymentPlanList(this.loan, this.actions);

            if (!this.asc) {
                items = items.reverse();
            }

            var sum = {
                principal: 0,
                interest: 0
            };

            for (var index = 0; index < items.length; index++) {
                var item = items[index];
                item.repayment.yearRateText = blog.round(item.repayment.yearRate);
                item.plan.rateTextList = [];
                if (item.plan.rateList && item.plan.rateList.length > 1) {
                    for (var n = 1; n < item.plan.rateList.length; n++) {
                        var rate = item.plan.rateList[n];
                        item.plan.rateTextList.push(rate.date + " " + rate.yearRate);
                    }
                    item.hasRate = true;
                }
                item.plan.actionTextList = [];
                if (item.plan.actionList && item.plan.actionList.length > 0) {
                    for (var m = 0; m < item.plan.actionList.length; m++) {
                        var action = item.plan.actionList[m];
                        item.plan.actionTextList.push(action.type);
                    }
                    item.hasAction = true;
                }

                sum.interest = blog.round(sum.interest + item.repayment.interest);
            }
            sum.principal = sum.interest + loan.totalPrincipal;

            var param = {};
            param.loan = blog.deepClone(this.loan);
            param.actions = blog.deepClone(this.actions);
            console.log("param", param);

            result.items = items;
            result.sum = sum;
            console.log("result", result);

            blog.setLocationParams(JSON.stringify(param));
            return result;
        }
    }
});