function calculate(param) {
    param.rateMonth = param.rateYear / 12 / 100;
    var result = calculateCore(param);
    var ahead = calculateAhead(result, param);
    return tryMerge(result, ahead);
}

function tryMerge(result, ahead) {
    if (ahead) {
        var oldSum = blog.deepClone(result.sum);
        result.sum = ahead.sum;
        result.sum.ahead = diffSum(oldSum, ahead.sum);
        for (let index = 0; index < result.months.length; index++) {
            var oldMonth = result.months[index];
            var newMonth = ahead.months[index];
            result.months[index] = tryMergeMonth(oldMonth, newMonth);
        }
    }

    return result;
}

function tryMergeMonth(old, ahead) {
    ahead = ahead || defaultMonth();

    var oldMonth = blog.deepClone(old);
    old.avgPrincipal = ahead.avgPrincipal;
    old.avgInterest = ahead.avgInterest;
    old.ahead = diffMonth(oldMonth, ahead);

    return old;
}

function calculateAhead(defaultResult, param) {
    if (param.aheadAmount >= 10000) {
        if (!param.reduceDate) {
            var aheadParam = blog.deepClone(param);
            aheadParam.date = param.date;
            aheadParam.principal = blog.round2(param.principal - param.aheadAmount);
            return calculateCore(aheadParam);
        }
        var aheads = tryCalculateAheadAll(param);
        for (var i = 0; i < aheads.length - 1; i++) {
            var aheadCurrent = aheads[i];
            var aheadNext = aheads[i + 1];
            if (inRange(defaultResult, aheadCurrent, aheadNext)) {
                return aheadCurrent;
            }
        }
    }
    return null;
}

function inRange(defaultResult, aheadCurrent, aheadNext) {
    var defaultAmount = defaultResult.months[0].avgPrincipal.principal;
    var aheadCurrentAmount = aheadCurrent.months[0].avgPrincipal.principal;
    var aheadNextAmount = aheadNext.months[0].avgPrincipal.principal;
    return aheadCurrentAmount < defaultAmount && defaultAmount <= aheadNextAmount;
}

function tryCalculateAheadAll(param) {
    var result = [];
    var aheadParam = blog.deepClone(param);
    aheadParam.date = param.date;
    aheadParam.principal = blog.round2(param.principal - param.aheadAmount);
    for (var i = param.month; i > 0; i--) {
        aheadParam.month = i;
        result.push(calculateCore(aheadParam));
    }
    return result;
}

function calculateCore(param) {
    var months = calculateMonths(param);

    var avgPrincipalSum = calculateSum(param.principal, months, x => x.avgPrincipal.interest);
    var avgInterestSum = calculateSum(param.principal, months, x => x.avgInterest.interest);
    var month = months.length;
    return {
        months: months,
        sum: {
            month: month,
            year: getYearString(month),
            avgPrincipal: avgPrincipalSum,
            avgInterest: avgInterestSum,
            interestDiff: blog.round2(avgInterestSum.interest - avgPrincipalSum.interest),
        }
    };
}

function diffSum(old, ahead) {
    var avgPrincipal = diffSumItem(old.avgPrincipal, ahead.avgPrincipal);
    var avgInterest = diffSumItem(old.avgInterest, ahead.avgInterest);
    var month = ahead.month - old.month;
    return {
        month: month,
        year: getYearString(month),
        avgPrincipal: avgPrincipal,
        avgInterest: avgInterest,
        interestDiff: blog.round2(avgInterest.interest - avgPrincipal.interest),
    }
}

function calculateSum(principal, months, func) {
    var sum = blog.round2(blog.sum(months, func));
    return {
        principal: principal,
        interest: sum,
        total: blog.round2(principal + sum),
    };
}

function diffSumItem(old, ahead) {
    return {
        principal: blog.round2(ahead.principal - old.principal),
        interest: blog.round2(ahead.interest - old.interest),
        total: blog.round2(ahead.total - old.total),
    };
}

function calculateMonths(param) {
    var result = [];
    var avgPrincipalMonths = calculateAvgPrincipalMonths(param);
    var avgInterestMonths = calculateAvgInterestMonths(param);

    for (let index = 0; index < param.month; index++) {
        var avgPrincipalMonth = avgPrincipalMonths[index];
        var avgInterestMonth = avgInterestMonths[index];
        result.push({
            month: addMonth(param.date, index),
            avgPrincipal: avgPrincipalMonth,
            avgInterest: avgInterestMonth
        });
    }

    return result;
}

function diffMonth(old, ahead) {
    var avgPrincipal = diffMonthItem(old.avgPrincipal, ahead.avgPrincipal);
    var avgInterest = diffMonthItem(old.avgInterest, ahead.avgInterest);
    return {
        avgPrincipal: avgPrincipal,
        avgInterest: avgInterest
    };
}

function defaultMonth() {
    return {
        avgPrincipal: defaultMonthItem(),
        avgInterest: defaultMonthItem()
    };
}

// 等额本金
function calculateAvgPrincipalMonths(param) {
    var result = [];

    // 贷款总金额
    var principal = param.principal;
    // 每月本金
    var principalMonth = blog.round2(principal / param.month);

    for (let index = 0; index < param.month; index++) {

        // 每月利息
        var interestMonth = Math.max(blog.round2(principal * param.rateMonth));

        // 每月还款总金额
        var amountMonth = Math.max(blog.round2(principalMonth + interestMonth));

        // 剩余本金
        principal = Math.max(blog.round2(principal - principalMonth), 0);

        result.push({
            amount: amountMonth,
            principal: principalMonth,
            interest: interestMonth,
            principalBalance: principal
        });
    }

    return result;
}

function diffMonthItem(old, ahead) {
    return {
        amount: blog.round2(ahead.amount - old.amount),
        principal: blog.round2(ahead.principal - old.principal),
        interest: blog.round2(ahead.interest - old.interest),
        principalBalance: blog.round2(ahead.principalBalance - old.principalBalance)
    }
}

function defaultMonthItem() {
    return {
        amount: 0,
        principal: 0,
        interest: 0,
        principalBalance: 0
    }
}

// 等额本息
function calculateAvgInterestMonths(param) {
    var result = [];

    // 贷款总金额
    var principal = param.principal;
    // 每月还款总金额
    var x = Math.pow((1 + param.rateMonth), param.month);
    var amountMonth = blog.round2(principal * param.rateMonth * x / (x - 1));

    for (let index = 0; index < param.month; index++) {

        // 每月利息
        var interestMonth = Math.max(blog.round2(principal * param.rateMonth));

        // 每月本金
        var principalMonth = Math.max(blog.round2(amountMonth - interestMonth));

        // 剩余本金
        principal = Math.max(blog.round2(principal - principalMonth));

        result.push({
            amount: amountMonth,
            principal: principalMonth,
            interest: interestMonth,
            principalBalance: principal
        });
    }

    return result;
}

function addMonth(date, month) {
    var newDate = new Date(date);
    newDate.setMonth(date.getMonth() + month);
    return newDate.getFullYear()
        + "-"
        + fill0(newDate.getMonth() + 1)
        + "-"
        + fill0(newDate.getDate());
}

function fill0(value) {
    if (value < 10) {
        return "0" + value;
    }
    return value;
}

function getYearString(month) {
    var prefix = month >= 0 ? "" : "-";
    var year = Math.abs(Math.floor(month / 12));
    var yearMonth = Math.abs(month % 12);
    if (year == 0) {
        return prefix + yearMonth + "个月";
    }

    if (yearMonth == 0) {
        return prefix + year + "年";
    }

    return prefix + year + "年" + yearMonth + "个月";
}