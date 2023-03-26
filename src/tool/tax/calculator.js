
function buildSalaryList(amount, month, insurances, rates) {
    const salaryList = [];
    const minMonthCount = Math.min(month, 12);
    for (let index = 0; index <= minMonthCount; index++) {
        salaryList[index] = {
            month: index,
            base: amount,
            exempted: rates.exempted,
            rates: deepClone(rates),
            insurances: deepClone(insurances),
        };
    }
    if (month > 12) {
        salaryList[13] = {
            month: 13,
            base: amount * (month - 12),
            months: (month - 12),
            exempted: 0,
            rates: deepClone(rates),
            insurances: deepClone(insurances),
        };
    }
    return salaryList;
}

function buildSummary(salaryList) {
    const last = salaryList[salaryList.length - 1];
    const 公积金SumYTD = findInsurance(last.insurances.items, "公积金").sumYTD;
    const totalActualYTD = round2(公积金SumYTD + last.actualYTD);
    return {
        last: last,
        公积金SumYTD: 公积金SumYTD,
        totalActualYTD: totalActualYTD,
        personalDiffYTD: round2(last.baseYTD - totalActualYTD),
        corporationDiffYTD: round2(last.corporationYTD - totalActualYTD),
    };
}

function calculateOneYear(salaryList) {
    for (let index = 1; index < salaryList.length; index++) {
        const salaryOfPrevMonth = salaryList[index - 1];
        const salary = salaryList[index];
        calculateOneMonth(salary, salaryOfPrevMonth);
    }
}

function calculateOneMonth(salary, salaryOfPrevMonth) {
    base();
    exempted();
    insurances();
    taxable();
    tax();
    actual();
    corporation();

    function base() {
        salary.baseYTD = round2((salary.base || 0) + (salaryOfPrevMonth.baseYTD || 0));
    }

    function exempted() {
        salary.exemptedYTD = round2((salary.exempted || 0) + (salaryOfPrevMonth.exemptedYTD || 0));
    }

    function insurances() {
        for (let index in salary.insurances.items) {
            const insurance = salary.insurances.items[index];
            const insuranceOfPrevMonth = findInsurance(salaryOfPrevMonth.insurances.items, insurance.name);

            insurance.base = Math.min(Math.max(insurance.min, salary.base), insurance.max);

            if (salary.month <= 12) {
                insurance.personal = round2((insurance.base * insurance.personalPercentage / 100));
            } else {
                insurance.personal = 0;
            }
            insurance.personalYTD = round2((insurance.personal || 0) + (insuranceOfPrevMonth.personalYTD || 0));

            if (salary.month <= 12) {
                insurance.corporation = round2((insurance.base * insurance.corporationPercentage / 100));
            } else {
                insurance.corporation = 0;
            }
            insurance.corporationYTD = round2((insurance.corporation || 0) + (insuranceOfPrevMonth.corporationYTD || 0));

            insurance.sum = round2((insurance.personal || 0) + (insurance.corporation || 0));
            insurance.sumYTD = round2((insurance.sum || 0) + (insuranceOfPrevMonth.sumYTD || 0));
        }

        salary.insurances.personal = sum(salary.insurances.items, x => x.personal);
        salary.insurances.personalYTD = round2((salary.insurances.personal || 0) + (salaryOfPrevMonth.insurances.personalYTD || 0));
        salary.insurances.corporation = sum(salary.insurances.items, x => x.corporation);
        salary.insurances.corporationYTD = round2((salary.insurances.corporation || 0) + (salaryOfPrevMonth.insurances.corporationYTD || 0));
        salary.insurances.sum = sum(salary.insurances.items, x => x.sum);
        salary.insurances.sumYTD = round2((salary.insurances.sum || 0) + (salaryOfPrevMonth.insurances.sumYTD || 0));
    }

    function taxable() {
        salary.taxable = Math.max(0, round2(salary.base - salary.insurances.personal - salary.exempted));
        salary.taxableYTD = Math.max(0, round2(salary.baseYTD - salary.insurances.personalYTD - salary.exemptedYTD));
    }

    function tax() {
        salary.rate = findRate();
        salary.taxYTD = taxCore();
        salary.tax = round2((salary.taxYTD || 0) - (salaryOfPrevMonth.taxYTD || 0));

        function taxCore() {
            const amount = salary.taxableYTD;
            if (amount < 0) {
                return 0;
            }
            const result = round2((amount * salary.rate.rate / 100 - salary.rate.quickDeduction));
            return Math.max(0, result);
        }

        function findRate() {
            const amount = salary.taxableYTD;
            const items = salary.rates.items;
            if (amount <= 0) {
                return items[0];
            }
            for (let key in items) {
                const rateItem = items[key];
                if (amount >= rateItem.min && amount <= rateItem.max) {
                    return rateItem;
                }
            }

            return items[items.length - 1];
        }
    }

    function actual() {
        salary.actual = round2((salary.base || 0) - (salary.insurances.personal || 0) - (salary.tax || 0));
        salary.actualYTD = round2((salary.actual || 0) + (salaryOfPrevMonth.actualYTD || 0));
    }

    function corporation() {
        salary.corporation = round2((salary.base || 0) + (salary.insurances.corporation || 0));
        salary.corporationYTD = round2((salary.corporation || 0) + (salaryOfPrevMonth.corporationYTD || 0));
    }
}

function round2(value) {
    const number = value || 0;
    return Math.round(number * 100) / 100;
}

function findInsurance(items, name) {
    for (let index in items) {
        var item = items[index];
        if (item.name == name) {
            return item;
        }
    }
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
    return JSON.parse(JSON.stringify(value));
}

function log(type, value) {
    console.log(type, deepClone(value));
}