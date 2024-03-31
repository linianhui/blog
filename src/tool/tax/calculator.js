
function buildSalaryList(amount, month, insurances, rates, bonus, bonusSingleTax, bonusRates) {
    const salaryList = [];
    const minMonthCount = Math.min(month, 12);
    for (let index = 0; index <= minMonthCount; index++) {
        salaryList[index] = {
            month: index,
            base: amount,
            exempted: rates.exempted,
            rates: blog.deepClone(rates),
            insurances: blog.deepClone(insurances),
        };
    }

    if (bonus > 0) {
        salaryList[13] = {
            month: 13,
            bonus: bonus,
            bonusSingleTax: bonusSingleTax,
            bonusRates: bonusRates,
            base: amount * (month - 12),
            months: (month - 12),
            exempted: 0,
            rates: blog.deepClone(rates),
            insurances: blog.deepClone(insurances),
        };
    }
    return salaryList;
}

function buildSummary(salaryList) {
    const last = salaryList[salaryList.length - 1];
    const 公积金SumYTD = findInsurance(last.insurances.items, "公积金").sumYTD;
    const totalActualYTD = blog.round2(公积金SumYTD + last.actualYTD);
    return {
        last: last,
        公积金SumYTD: 公积金SumYTD,
        totalActualYTD: totalActualYTD,
        personalDiffYTD: blog.round2(last.baseYTD - totalActualYTD),
        corporationDiffYTD: blog.round2(last.corporationYTD - totalActualYTD),
    };
}

function calculateOneYear(salaryList) {
    for (let index = 1; index < salaryList.length; index++) {
        const salaryOfPrevMonth = salaryList[index - 1];
        const salary = salaryList[index];
        try {
            if (salary.bonus > 0 && salary.bonusSingleTax) {
                calculateBonusSingleTax(salary, salaryOfPrevMonth);
            }
            else {
                calculateOneMonth(salary, salaryOfPrevMonth);
            }
        } catch (e) {
            console.log(salary, e);
        }
    }
}

function calculateBonusSingleTax(salary, salaryOfPrevMonth) {
    salary.baseYTD = blog.round2((salary.bonus || 0));
    salary.exemptedYTD = salaryOfPrevMonth.exemptedYTD;
    salary.insurances = blog.deepClone(salaryOfPrevMonth.insurances);

    for (let index in salary.insurances.items) {
        var insurance = salary.insurances.items[index];
        insurance.personal = 0;
        insurance.corporation = 0;
        insurance.sum = 0;
    }
    salary.insurances.personal = 0;
    salary.insurances.corporation = 0;
    salary.insurances.sum;

    salary.taxable = blog.round2((salary.bonus || 0));
    salary.taxableYTD = blog.round2((salary.taxable + salaryOfPrevMonth.taxableYTD));

    var monthAmount = blog.round2((salary.taxable / 12));

    var rates = salary.bonusRates.items;
    salary.rate = rates[rates.length - 1];
    for (let key in rates) {
        const rateItem = rates[key];
        if (monthAmount >= rateItem.min && monthAmount <= rateItem.max) {
            salary.rate = rateItem;
            break;
        }
    }

    salary.tax = Math.max(0, blog.round2((salary.taxable * salary.rate.rate / 100 - salary.rate.quickDeduction)));
    salary.taxYTD = blog.round2(salary.tax + salaryOfPrevMonth.taxYTD);

    salary.actual = blog.round2(salary.taxable - salary.tax);
    salary.actualYTD = blog.round2(salary.actual + salaryOfPrevMonth.actualYTD);

    salary.corporation = blog.round2(salary.taxable);
    salary.corporationYTD = blog.round2(salary.corporation + salaryOfPrevMonth.corporationYTD);
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
        salary.baseYTD = blog.round2((salary.base || 0) + (salaryOfPrevMonth.baseYTD || 0));
    }

    function exempted() {
        salary.exemptedYTD = blog.round2((salary.exempted || 0) + (salaryOfPrevMonth.exemptedYTD || 0));
    }

    function insurances() {
        for (let index in salary.insurances.items) {
            var insurance = salary.insurances.items[index];
            var insuranceOfPrevMonth = findInsurance(salaryOfPrevMonth.insurances.items, insurance.name);

            insurance.base = Math.min(Math.max(insurance.min, salary.base), insurance.max);

            if (salary.month <= 12) {
                insurance.personal = blog.round2((insurance.base * insurance.personalPercentage / 100));
            } else {
                insurance.personal = 0;
            }
            insurance.personalYTD = blog.round2((insurance.personal || 0) + (insuranceOfPrevMonth.personalYTD || 0));

            if (salary.month <= 12) {
                insurance.corporation = blog.round2((insurance.base * insurance.corporationPercentage / 100));
            } else {
                insurance.corporation = 0;
            }
            insurance.corporationYTD = blog.round2((insurance.corporation || 0) + (insuranceOfPrevMonth.corporationYTD || 0));

            insurance.sum = blog.round2((insurance.personal || 0) + (insurance.corporation || 0));
            insurance.sumYTD = blog.round2((insurance.sum || 0) + (insuranceOfPrevMonth.sumYTD || 0));
        }

        salary.insurances.personal = blog.sum(salary.insurances.items, x => x.personal);
        salary.insurances.personalYTD = blog.round2((salary.insurances.personal || 0) + (salaryOfPrevMonth.insurances.personalYTD || 0));
        salary.insurances.corporation = blog.sum(salary.insurances.items, x => x.corporation);
        salary.insurances.corporationYTD = blog.round2((salary.insurances.corporation || 0) + (salaryOfPrevMonth.insurances.corporationYTD || 0));
        salary.insurances.sum = blog.sum(salary.insurances.items, x => x.sum);
        salary.insurances.sumYTD = blog.round2((salary.insurances.sum || 0) + (salaryOfPrevMonth.insurances.sumYTD || 0));
    }

    function taxable() {
        salary.taxable = Math.max(0, blog.round2(salary.base - salary.insurances.personal - salary.exempted));
        salary.taxableYTD = Math.max(0, blog.round2(salary.baseYTD - salary.insurances.personalYTD - salary.exemptedYTD));
    }

    function tax() {
        salary.rate = findRate();
        salary.taxYTD = taxCore();
        salary.tax = blog.round2((salary.taxYTD || 0) - (salaryOfPrevMonth.taxYTD || 0));

        function taxCore() {
            const amount = salary.taxableYTD;
            if (amount < 0) {
                return 0;
            }
            const result = blog.round2((amount * salary.rate.rate / 100 - salary.rate.quickDeduction));
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
        salary.actual = blog.round2((salary.base || 0) - (salary.insurances.personal || 0) - (salary.tax || 0));
        salary.actualYTD = blog.round2((salary.actual || 0) + (salaryOfPrevMonth.actualYTD || 0));
    }

    function corporation() {
        salary.corporation = blog.round2((salary.base || 0) + (salary.insurances.corporation || 0));
        salary.corporationYTD = blog.round2((salary.corporation || 0) + (salaryOfPrevMonth.corporationYTD || 0));
    }
}

function findInsurance(items, name) {
    for (let index in items) {
        var item = items[index];
        if (item.name == name) {
            return item;
        }
    }
}
