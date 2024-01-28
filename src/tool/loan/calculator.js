
function calculateMonths(principal, month, rate, date) {
    var rateMonth = rate / 12 / 100;
    var months = avgPrincipalAndAvgInterest(principal, month, rateMonth, date);
    var avgPrincipalTotalInterest = sum(months, x => x.avgPrincipal.interest);
    var avgInterestTotalInterest = sum(months, x => x.avgInterest.interest);
    return {
        avgPrincipalTotal: round2(principal + avgPrincipalTotalInterest),
        avgPrincipalTotalInterest: avgPrincipalTotalInterest,
        avgInterestTotal: round2(principal + avgInterestTotalInterest),
        avgInterestTotalInterest: avgInterestTotalInterest,
        diff: round2(avgInterestTotalInterest - avgPrincipalTotalInterest),
        months: months
    };
}

function avgPrincipalAndAvgInterest(principal, month, rateMonth, date) {
    var avgPrincipalMonths = avgPrincipal(principal, month, rateMonth);
    var avgInterestMonths = avgInterest(principal, month, rateMonth);

    var result = [];

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

// 等额本金
function avgPrincipal(principal, month, rateMonth) {
    var result = [];

    // 每月本金
    var principalMonth = round2(principal / month);

    for (let index = 0; index < month; index++) {

        // 每月利息
        var interestMonth = round2(principal * rateMonth);

        // 每月还款总金额
        var amountMonth = round2(principalMonth + interestMonth);

        // 剩余本金
        principal = round2(principal - principalMonth);

        result.push({
            amount: amountMonth,
            principal: principalMonth,
            interest: interestMonth,
            principalBalance: principal
        });
    }

    return result;
}

// 等额本息
function avgInterest(principal, month, rateMonth) {
    var result = [];

    // 每月还款总金额
    var x = Math.pow((1 + rateMonth), month);
    var amountMonth = round2(principal * rateMonth * x / (x - 1));

    for (let index = 0; index < month; index++) {

        // 每月利息
        var interestMonth = round2(principal * rateMonth);

        // 每月本金
        var principalMonth = round2(amountMonth - interestMonth);

        // 剩余本金
        principal = round2(principal - principalMonth);

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
        + "年"
        + fill0(newDate.getMonth() + 1)
        + "月"
        + fill0(newDate.getDate())
        + "日";
}

function fill0(value) {
    if (value < 10) {
        return "0" + value;
    }
    return value;
}

function round2(value) {
    const number = value || 0;
    return Math.round(number * 100) / 100;
}

function sum(items, func) {
    var result = 0;
    for (let index in items) {
        const item = items[index];
        result = round2(result + func(item));
    }
    return round2(result);
}

function deepClone(value) {
    if (value) {
        return JSON.parse(JSON.stringify(value));
    }
}

function log(type, value) {
    console.log(type, deepClone(value));
}