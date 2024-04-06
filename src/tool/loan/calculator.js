function calculate(principal, month, rate, date, aheadAmount) {
    var result = calculateCore(principal, month, rate, date);
    var ahead = calculateAhead(result, principal, month, rate, date, aheadAmount);
    console.log("a",ahead);
    return tryMerge(result, ahead);
}

function tryMerge(result, ahead) {
    if (ahead) {
        var oldSum = blog.deepClone(result.sum);
        result.sum = ahead.sum;
        result.sum.ahead = diffSum(oldSum, ahead.sum);
        result.sum.ahead.month = ahead.months.length - result.months.length;
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

function calculateAhead(defaultResult, principal, month, rate, date, aheadAmount) {
    if (aheadAmount >= 10000) {
        var aheads = tryCalculateAheadAll(principal, month, rate, date, aheadAmount);
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

function tryCalculateAheadAll(principal, month, rate, date, aheadAmount) {
    var residuePrincipal = blog.round2(principal - aheadAmount);
    var result = [];
    for (var i = month; i > 0; i--) {
        result.push(calculateCore(residuePrincipal, i, rate, date));
    }
    return result;
}

function calculateCore(principal, month, rate, date) {
    var rateMonth = rate / 12 / 100;
    var months = calculateMonths(principal, month, rateMonth, date);

    var avgPrincipalSum = calculateSum(principal, months, x => x.avgPrincipal.interest);
    var avgInterestSum = calculateSum(principal, months, x => x.avgInterest.interest);

    return {
        months: months,
        sum: {
            avgPrincipal: avgPrincipalSum,
            avgInterest: avgInterestSum,
            interestDiff: blog.round2(avgInterestSum.interest - avgPrincipalSum.interest),
        }
    };
}

function diffSum(old, ahead) {
    var avgPrincipal = diffSumItem(old.avgPrincipal, ahead.avgPrincipal);
    var avgInterest = diffSumItem(old.avgInterest, ahead.avgInterest);
    return {
        avgPrincipal: avgPrincipal,
        avgInterest: avgInterest,
        interestDiff: blog.round2(avgInterest.interest - avgPrincipal.interest),
    }
}

function calculateSum(principal, months, func) {
    var sum = blog.sum(months, func);
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

function calculateMonths(principal, month, rateMonth, date) {
    var result = [];
    var avgPrincipalMonths = calculateAvgPrincipalMonths(principal, month, rateMonth);
    var avgInterestMonths = calculateAvgInterestMonths(principal, month, rateMonth);

    for (let index = 0; index < month; index++) {
        var avgPrincipalMonth = avgPrincipalMonths[index];
        var avgInterestMonth = avgInterestMonths[index];
        result.push({
            month: addMonth(date, index),
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
function calculateAvgPrincipalMonths(principal, month, rateMonth) {
    var result = [];

    // 每月本金
    var principalMonth = blog.round2(principal / month);

    for (let index = 0; index < month; index++) {

        // 每月利息
        var interestMonth = Math.max(blog.round2(principal * rateMonth));

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
function calculateAvgInterestMonths(principal, month, rateMonth) {
    var result = [];

    // 每月还款总金额
    var x = Math.pow((1 + rateMonth), month);
    var amountMonth = blog.round2(principal * rateMonth * x / (x - 1));

    for (let index = 0; index < month; index++) {

        // 每月利息
        var interestMonth = Math.max(blog.round2(principal * rateMonth));

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