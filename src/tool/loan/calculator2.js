// 贷款还款类型 - 等额本金
var LOAN_REPALMENT_TYPE_SAME_PRINCIPAL = "等额本金";
// 贷款还款类型 - 等额本息
var LOAN_REPALMENT_TYPE_SAME_REPALMENT = "等额本息";
// 月
var MONTHS = "months";
// 天
var DAYS = "days";
// 贷款日期格式化
var LOAN_DATE_FORMAT = "YYYY-MM-DD";
var LOAN_REPLAMENT_PLAN_TYPE_RESET_RATE = "调整利率";
var LOAN_REPLAMENT_PLAN_TYPE_PREPAYMENT = "提前还款";
var LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_TIME_NOT_GTE_PRINICIPAL = "期数减少，本金减少";
var LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_TIME_NOT_CHANGE_PRINICIPAL = "期数减少，本金不变";
var LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_PRINICIPAL_NOT_CHANGE_TIME = "期数不变，本金减少";

function calculateRepaymentPlanList(loan, actions) {
    var actionList = blog.deepClone(actions);
    var result = [];
    var firstPlan = buildFirstPlan(loan);
    var repaymentPlan = calculateRepaymentPlan(firstPlan);
    result.push(repaymentPlan);
    do {
        var planList = buildNextPlanList(repaymentPlan, actionList);
        for (var index = 0; index < planList.length; index++) {
            var plan = planList[index];
            repaymentPlan = calculateRepaymentPlan(plan);
            result.push(repaymentPlan);
        }

    } while (hasNextPlan(repaymentPlan));
    return result;
}

function calculateRepayment(loan) {
    return calculateRepaymentSamePrincipal(loan);
}

function hasNextPlan(repaymentPlan) {
    var balance = repaymentPlan.balance;
    return balance.principal > 0;
}

function calculateRepaymentPlan(plan) {
    var result = {};
    result.plan = blog.deepClone(plan);

    var repayment = calculateRepayment(plan);
    result.repayment = blog.deepClone(repayment);

    var balance = {};
    // 本金余额 = 本金余额 - 本期应偿还本金
    balance.principal = Math.max(blog.number(plan.balancePrincipal).subtract(repayment.principal).value, 0);
    result.balance = balance;
    return result;
}

function buildFirstPlan(loan) {
    var result = {};
    result.type = loan.type;
    result.totalPrincipal = loan.totalPrincipal;
    result.beginDate = loan.beginDate;
    result.totalNumberOfRepayment = loan.totalNumberOfRepayment;
    result.repaymentPrincipal = blog.number(result.totalPrincipal).divide(result.totalNumberOfRepayment).value;
    result.rateList = [];
    result.actionList = [];
    result.rateList.push({
        yearRate: loan.yearRate,
        date: loan.beginDate
    });
    result.repaymentType = loan.repaymentType;
    result.repaymentDayOfMonth = loan.repaymentDayOfMonth;

    result.beginInterestDate = result.beginDate;
    result.balancePrincipal = result.totalPrincipal;
    result.endDate = dateAddMonths(result.beginDate, result.totalNumberOfRepayment);
    result.repaymentDate = dateAddMonthsSetDay(result.beginInterestDate, 1, result.repaymentDayOfMonth);
    result.endInterestDate = dateAddDays(result.repaymentDate, -1);

    return result;
}

function buildNextPlanList(repaymentPlan, actionList) {
    var result = [];
    var balance = repaymentPlan.balance;

    var originPlan = blog.deepClone(repaymentPlan.plan);
    originPlan.actionList = [];
    // 复制上一期的本金余额
    originPlan.balancePrincipal = balance.principal;
    originPlan.beginInterestDate = originPlan.repaymentDate;
    originPlan.repaymentDate = dateAddMonthsSetDay(originPlan.beginInterestDate, 1, originPlan.repaymentDayOfMonth);
    originPlan.endInterestDate = dateAddDays(originPlan.repaymentDate, -1);
    if (dateIsBefore(originPlan.endDate, originPlan.endInterestDate)) {
        originPlan.endInterestDate = originPlan.endDate;
    }

    if (originPlan.rateList.length > 1) {
        originPlan.rateList = [originPlan.rateList.pop()];
    }
    originPlan.rateList[0].date = originPlan.beginInterestDate;

    result.push(originPlan);

    // 查找本期的还款计划行为
    var currentPlanActionList = findCurrentPlanActionList(actionList, originPlan);
    // 没有则直接使用原始的还款计划
    if (currentPlanActionList == null || currentPlanActionList.length == 0) {
        return result;
    }

    for (var index = 0; index < currentPlanActionList.length; index++) {
        var action = currentPlanActionList[index];
        // 调整房贷利率
        if (LOAN_REPLAMENT_PLAN_TYPE_RESET_RATE == action.type) {
            originPlan.actionList.push(blog.deepClone(action));
            originPlan.rateList.push({
                yearRate: action.yearRate,
                date: action.date
            });
        }

        if (LOAN_REPLAMENT_PLAN_TYPE_PREPAYMENT == action.type) {
            var prepaymentPlan = blog.deepClone(originPlan);
            prepaymentPlan.actionList = [blog.deepClone(action)];
            prepaymentPlan.endInterestDate = dateAddDays(action.date, -1);
            prepaymentPlan.repaymentDate = action.date;
            prepaymentPlan.repaymentPrincipal = action.principal;

            // 原始还款剩余本金 = 原始还款金额减去提前还款金额
            originPlan.balancePrincipal = blog.number(originPlan.balancePrincipal).subtract(action.principal).value;
            // 延后原始还款计划的计息时间
            originPlan.beginInterestDate = action.date;
            // 期数减少，本金减少
            if (LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_TIME_NOT_GTE_PRINICIPAL == action.afterAction) {
                originPlan.totalNumberOfRepayment = calculateTotalNumberOfRepayment(originPlan);
                originPlan.repaymentPrincipal = blog.number(originPlan.balancePrincipal).divide(originPlan.totalNumberOfRepayment).value;
            }
            // 期数减少，本金不变
            if (LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_TIME_NOT_CHANGE_PRINICIPAL == action.afterAction) {
                originPlan.totalNumberOfRepayment = calculateTotalNumberOfRepayment(originPlan);
            }
            // 期数不变，本金减少
            if (LOAN_PREPAYMENT_AFTER_ACTION_REDUCE_PRINICIPAL_NOT_CHANGE_TIME == action.afterAction) {
                originPlan.repaymentPrincipal = blog.number(originPlan.balancePrincipal).divide(originPlan.totalNumberOfRepayment).value;
            }
            result.push(prepaymentPlan);
        }
    }

    result.sort((a, b) => dateDiffDays(a.beginInterestDate, b.beginInterestDate));

    return result;
}

function findCurrentPlanActionList(actionList, plan) {
    if (actionList == null || plan == null) {
        return null;
    }

    var result = [];
    for (var index = 0; index < actionList.length; index++) {
        var action = actionList[index];
        if (dateIsBetween(plan.beginInterestDate, plan.endInterestDate, action.date)) {
            result.push(action);
        }
    }
    return result;
}

function calculateTotalNumberOfRepayment(plan) {
    var oldRepaymentPrincipal = plan.repaymentPrincipal;
    for (var index = 1; index < plan.totalNumberOfRepayment; index++) {
        var newRepaymentPrincipal = plan.balancePrincipal / index;
        if (newRepaymentPrincipal <= oldRepaymentPrincipal) {
            return index;
        }
    }
    return 1;
}

// 计算还款 - 等额本金
function calculateRepaymentSamePrincipal(plan) {
    var result = {};

    // 本期应偿还本金
    result.principal = plan.repaymentPrincipal;

    if (plan.rateList.length == 1) {
        result.yearRate = plan.rateList[0].yearRate;
    } else {
        result.yearRate = 0;
        var allDays = moment(plan.endInterestDate).date();
        for (var index = 0; index < plan.rateList.length; index++) {
            var current = plan.rateList[index];
            var next = plan.rateList[index + 1];
            var days = dateDiffDays(plan.endInterestDate, current.date) + 1;
            if (next) {
                days = dateDiffDays(next.date, current.date);
            }
            var partRate = blog.number(current.yearRate, 8).multiply(days).divide(allDays).value;
            result.yearRate = blog.number(result.yearRate, 8).add(partRate).value;
        }
    }

    // 按月计算利息
    if (useMonthRate(plan.beginInterestDate, plan.endInterestDate, plan.repaymentDate)) {
        result.rateType = MONTHS;
        result.rate = blog.number(result.yearRate, 8).divide(12).value;
        result.rateTimes = 1;
    }
    // 按日利率计算利息
    else {
        result.rateType = DAYS;
        result.rate = blog.number(result.yearRate, 8).divide(360).value;
        result.rateTimes = dateDiffDays(plan.endInterestDate, plan.beginInterestDate) + 1;
    }

    // 本期应偿还的利息 = 需要计算利息的本金 * 利息 * 利息次数 / 100
    result.interest = blog.number(plan.balancePrincipal)
        .multiply(result.rate)
        .multiply(result.rateTimes)
        .divide(100)
        .value;

    // 本前应偿还总金额 = 本期应偿还本金 + 本期应偿还的利息
    result.amount = blog.number(result.principal).add(result.interest).value;

    return result;
}

function calculateRepaymentPlanSameRepayment(plan) {
    var result = {};

    // 本前应偿还总金额
    var x = Math.pow((1 + plan.rate), param.totalNumberOfRepayment);
    result.repaymentAmount = blog.round(plan.totalPrincipal * plan.rate * x / (x - 1));

    // 本期应偿还的利息 = 需要计算利息的本金 * 利息 / 100
    result.repaymentInterest = blog.round(plan.principalOfNeedInterest * plan.rate / 100);

    // 本前应偿还总金额 = 本前应偿还总金额 - 本期应偿还的利息
    result.repaymentPrincipal = blog.round(result.repaymentAmount - result.repaymentInterest);

    // 剩余需要计算利息的本金 = 需要计算利息的本金 - 本期应偿还本金
    result.principalOfNeedInterest = blog.round(plan.principalOfNeedInterest - result.repaymentPrincipal);

    return result;
}

function useMonthRate(beginInterestDate, endInterestDate, repaymentDate) {
    var nextRepaymentDate1 = dateAddMonths(beginInterestDate, 1);
    var nextRepaymentDate2 = dateAddDays(endInterestDate, 1);
    return nextRepaymentDate1 == repaymentDate && nextRepaymentDate2 == repaymentDate;
}

function dateAddDays(date, days) {
    return dateFormat(moment(date).add(days, DAYS));
}

function dateAddMonths(date, months) {
    return dateFormat(moment(date).add(months, MONTHS));
}

function dateAddMonthsSetDay(date, months, dayOfMonth) {
    return dateFormat(moment(date).add(months, MONTHS).date(dayOfMonth));
}

function dateFormat(date) {
    return date.format(LOAN_DATE_FORMAT);
}

function dateIsBefore(date1, date2) {
    return moment(date1).isBefore(moment(date2));
}

function dateIsBetween(beginDate, endDate, date) {
    return moment(date).isBetween(beginDate, endDate)
}

function dateDiffDays(date1, date2) {
    return moment(date1).diff(date2, DAYS);
}