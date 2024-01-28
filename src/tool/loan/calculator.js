
function calculateMonths(principal, month, rate, date) {
    var rateMonth = rate / 12 / 100;
    var months = avgPrincipalAndAvgInterest(principal, month, rateMonth, date);
    var avgPrincipalTotalInterest = blog.sum(months, x => x.avgPrincipal.interest);
    var avgInterestTotalInterest = blog.sum(months, x => x.avgInterest.interest);
    return {
        avgPrincipalTotal: blog.round2(principal + avgPrincipalTotalInterest),
        avgPrincipalTotalInterest: avgPrincipalTotalInterest,
        avgInterestTotal: blog.round2(principal + avgInterestTotalInterest),
        avgInterestTotalInterest: avgInterestTotalInterest,
        diff: blog.round2(avgInterestTotalInterest - avgPrincipalTotalInterest),
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
    var principalMonth = blog.round2(principal / month);

    for (let index = 0; index < month; index++) {

        // 每月利息
        var interestMonth = blog.round2(principal * rateMonth);

        // 每月还款总金额
        var amountMonth = blog.round2(principalMonth + interestMonth);

        // 剩余本金
        principal = blog.round2(principal - principalMonth);

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
    var amountMonth = blog.round2(principal * rateMonth * x / (x - 1));

    for (let index = 0; index < month; index++) {

        // 每月利息
        var interestMonth = blog.round2(principal * rateMonth);

        // 每月本金
        var principalMonth = blog.round2(amountMonth - interestMonth);

        // 剩余本金
        principal = blog.round2(principal - principalMonth);

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