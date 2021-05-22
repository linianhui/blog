
function buildSalaryList(amount, insurance, rate) {
    const salaryList = [];
    const insurances = config.insurances[insurance];
    const rates = config.rates[rate];
    for (let index = 0; index < 13; index++) {
        salaryList[index] = {
            month: index + "月",
            base: amount,
            exempted: rates.exempted,
            rates: JSON.parse(JSON.stringify(rates.items)),
            insurances: JSON.parse(JSON.stringify(insurances)),
        };
    }
    return salaryList;
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
            const value = salary.insurances[key];
            const valueOfPrevMonth = salaryOfPrevMonth.insurances[key];
            const min = Math.min(value.base, salary.base);
            value.personal = round2((min * value.personalPercentage / 100));
            value.personalYTD = round2((value.personal || 0) + (valueOfPrevMonth.personalYTD || 0));
            value.corporation = round2((min * value.corporationPercentage / 100));
            value.corporationYTD = round2((value.corporation || 0) + (valueOfPrevMonth.corporationYTD || 0));
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
        salary.taxYTD = taxCore(salary.taxableYTD);
        salary.tax = round2((salary.taxYTD || 0) - (salaryOfPrevMonth.taxYTD || 0));

        function taxCore(amount) {
            if (amount < 0) {
                return 0;
            }
            const rateItem = findRateItem(amount);
            const result = round2((amount * rateItem.rate / 100 - rateItem.quickDeduction));
            return Math.max(0, result);
        }

        function findRateItem(amount) {
            if (amount <= 0) {
                return salary.rates[0];
            }
            for (let key in salary.rates) {
                const rateItem = salary.rates[key];
                if (amount >= rateItem.min && amount <= rateItem.max) {
                    return rateItem;
                }
            }

            return salary.rates[salary.rates.length - 1];
        }
    }


    function actual() {
        salary.actual = round2((salary.base || 0) - (salary.insurancesPersonal || 0) - (salary.tax || 0));
        salary.actualYTD = round2((salary.actual || 0) + (salaryOfPrevMonth.actualYTD || 0));
    }

    function round2(num) {
        return Math.round(num * 100) / 100;
    }
}