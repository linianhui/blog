
function buildSalaryList(amount, month, insurances, rates) {
    const salaryList = [];
    for (let index = 0; index <= 12; index++) {
        salaryList[index] = {
            month: index,
            base: amount,
            exempted: rates.exempted,
            rates: JSON.parse(JSON.stringify(rates)),
            insurances: JSON.parse(JSON.stringify(insurances)),
        };
    }
    if (month > 12) {
        salaryList[13] = {
            month: 13,
            base: amount * (month - 12),
            months : (month - 12),
            exempted: 0,
            rates: JSON.parse(JSON.stringify(rates)),
            insurances: JSON.parse(JSON.stringify(insurances)),
        };
    }
    return salaryList;
}

function buildSummary(salaryList) {
    const month = salaryList.length;
    const last = salaryList[salaryList.length - 1];
    const 医疗YTD = last.insurances.医疗.personalYTD;
    const 公积金YTD = round2(last.insurances.公积金.personalYTD + last.insurances.公积金.corporationYTD);
    const totalActualYTD = round2(医疗YTD + 公积金YTD + last.actualYTD);
    return {
        base: last.base || 0,
        baseYTD: last.baseYTD,
        医疗YTD: 医疗YTD,
        公积金YTD: 公积金YTD,
        taxableYTD: last.taxableYTD,
        taxYTD: last.taxYTD,
        actualAvg: round2(last.actualYTD / month),
        actualYTD: last.actualYTD,
        totalActualYTD: totalActualYTD,
        diffYTD: round2(last.baseYTD - totalActualYTD)
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

    function base() {
        salary.baseYTD = round2((salary.base || 0) + (salaryOfPrevMonth.baseYTD || 0));
    }

    function exempted() {
        salary.exemptedYTD = round2((salary.exempted || 0) + (salaryOfPrevMonth.exemptedYTD || 0));
    }

    function insurances() {
        for (let key in salary.insurances) {
            const insurance = salary.insurances[key];
            const insuranceOfPrevMonth = salaryOfPrevMonth.insurances[key];
            const base = Math.min(Math.max(insurance.min, salary.base), insurance.max);
            if (salary.month <= 12) {
                insurance.personal = round2((base * insurance.personalPercentage / 100));
            } else {
                insurance.personal = 0;
            }
            insurance.personalYTD = round2((insurance.personal || 0) + (insuranceOfPrevMonth.personalYTD || 0));
            if (salary.month <= 12) {
                insurance.corporation = round2((base * insurance.corporationPercentage / 100));
            } else {
                insurance.corporation = 0;
            }
            insurance.corporationYTD = round2((insurance.corporation || 0) + (insuranceOfPrevMonth.corporationYTD || 0));
        }

        salary.insurancesPersonal = sum(x => x.personal);
        salary.insurancesPersonalYTD = sum(x => x.personalYTD);
        salary.insurancesCorporation = sum(x => x.corporation);
        salary.insurancesCorporationYTD = sum(x => x.corporationYTD);

        function sum(func) {
            var total = 0;
            for (let key in salary.insurances) {
                const value = salary.insurances[key];
                total = round2(total + func(value));
            }
            return total;
        }
    }

    function taxable() {
        salary.taxable = Math.max(0, round2(salary.base - salary.insurancesPersonal - salary.exempted));
        salary.taxableYTD = Math.max(0, round2(salary.baseYTD - salary.insurancesPersonalYTD - salary.exemptedYTD));
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
        salary.actual = round2((salary.base || 0) - (salary.insurancesPersonal || 0) - (salary.tax || 0));
        salary.actualYTD = round2((salary.actual || 0) + (salaryOfPrevMonth.actualYTD || 0));
    }
}

function round2(num) {
    return Math.round(num * 100) / 100;
}