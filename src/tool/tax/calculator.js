
function buildSalaryList(options) {
    const salaryList = [];
    const minMonthCount = Math.min(options.month, 12);
    for (let index = 0; index <= minMonthCount; index++) {
        salaryList[index] = {
            month: index,
            base: options.amount,
            exempted: options.rates.exempted,
            rates: blog.deepClone(options.rates),
            insurances: blog.deepClone(options.insurances),
        };
    }

    if (options.bonus > 0) {
        var months = salaryList.length;
        salaryList[months] = {
            month: months,
            bonus: options.bonus,
            bonusSingleTax: options.bonusSingleTax,
            bonusRates: options.bonusRates,
            base: options.amount * (months - options.month + 1),
            months: (months - options.month + 1),
            exempted: 0,
            rates: blog.deepClone(options.rates),
            insurances: blog.deepClone(options.insurances),
        };
    }
    return salaryList;
}

function buildSummary(salaryList) {
    var sum = null;
    var bonus = {};
    const last = salaryList[salaryList.length - 1];
    if (last.bonus > 0) {
        sum = salaryList[salaryList.length - 2];
        bonus = last;
    } else {
        sum = last;
    }
    const houseFund = findInsurance(sum.insurances.items, "公积金");

    const 税前工资 = sum.baseYTD;
    const 公司公积金 = houseFund.corporationYTD;
    const 个人公积金 = houseFund.personalYTD;
    const 公积金 = blog.round(个人公积金 + 公司公积金);
    const 个人社保 = blog.round(sum.insurances.personalYTD - 个人公积金);
    const 公司社保 = blog.round(sum.insurances.corporationYTD - 公司公积金);
    const 社保 = blog.round(个人社保 + 公司社保);
    const 工资个税 = sum.taxYTD;
    const 税后工资 = sum.actualYTD;
    const 税前奖金 = bonus.bonus || 0;
    const 奖金个税 = bonus.bonusSingleTax ? (bonus.tax || 0) : 0;
    const 税后奖金 = blog.round(税前奖金 - 奖金个税);
    const 个税 = blog.round(工资个税 + 奖金个税);
    const 公司支出 = blog.round(税前工资 + 公司社保 + 公司公积金 + 税前奖金);
    const 个人实收 = blog.round(税后工资 + 社保 + 公积金 + 税后奖金);
    const 个人收入 = blog.round(个人实收 + 个税);
    return {
        公司支出: 公司支出,
        个人收入: 个人收入,
        个人实收: 个人实收,
        税前工资: 税前工资,
        个人社保: 个人社保,
        公司社保: 公司社保,
        社保: 社保,
        工资个税: 工资个税,
        税后工资: 税后工资,
        公司公积金: 公司公积金,
        个人公积金: 个人公积金,
        公积金: 公积金,
        税前奖金: 税前奖金,
        税后奖金: 税后奖金,
        奖金个税: 奖金个税,
        个税: 个税
    };
}

function buildSankeyData(summary, precision) {
    var format = function (v) {
        return blog.number(v, precision).format();
    };

    var percent = function (v) {
        return blog.round(v / summary.公司支出 * 100);
    };

    var name = function (name) {
        var value = summary[name];
        var percentValue = blog.round(value / summary.税前工资 * 100);
        return name + ' ' + format(value) + ' (' + percentValue + '%)';
    }

    const 公司支出 = name('公司支出');
    const 个人收入 = name('个人收入');
    const 个人实收 = name('个人实收');
    const 税前工资 = name('税前工资');
    const 个人社保 = name('个人社保');
    const 公司社保 = name('公司社保');
    const 社保 = name('社保');
    const 工资个税 = name('工资个税');
    const 税后工资 = name('税后工资');
    const 公司公积金 = name('公司公积金');
    const 个人公积金 = name('个人公积金');
    const 公积金 = name('公积金');
    const 税前奖金 = name('税前奖金');
    const 税后奖金 = name('税后奖金');
    const 奖金个税 = name('奖金个税');
    const 个税 = name('个税');

    var links = [];
    links.push({ source: 公司支出, target: 税前工资, value: percent(summary.公司支出) });
    links.push({ source: 公司支出, target: 公司社保, value: percent(summary.公司社保) });
    links.push({ source: 公司支出, target: 公司公积金, value: percent(summary.公司公积金) });
    if (summary.税前奖金) {
        links.push({ source: 公司支出, target: 税前奖金, value: percent(summary.税前奖金) });
    }

    links.push({ source: 税前工资, target: 税后工资, value: percent(summary.税后工资) });
    links.push({ source: 税前工资, target: 个人社保, value: percent(summary.个人社保) });
    links.push({ source: 税前工资, target: 个人公积金, value: percent(summary.个人公积金) });
    links.push({ source: 税前工资, target: 工资个税, value: percent(summary.工资个税) });

    if (summary.税前奖金) {
        links.push({ source: 税前奖金, target: 税后奖金, value: percent(summary.税后奖金) });
        links.push({ source: 税前奖金, target: 奖金个税, value: percent(summary.奖金个税) });
    }

    links.push({ source: 税后工资, target: 个人实收, value: percent(summary.税后工资) });
    links.push({ source: 个人社保, target: 个人实收, value: percent(summary.个人社保) });
    links.push({ source: 个人公积金, target: 个人实收, value: percent(summary.个人公积金) });
    links.push({ source: 公司社保, target: 个人实收, value: percent(summary.公司社保) });
    links.push({ source: 公司公积金, target: 个人实收, value: percent(summary.公司公积金) });
    if (summary.税前奖金) {
        links.push({ source: 税后奖金, target: 个人实收, value: percent(summary.税后奖金) });
    }
    links.push({ source: 工资个税, target: 个税, value: percent(summary.工资个税) });
    if (summary.税前奖金) {
        links.push({ source: 奖金个税, target: 个税, value: percent(summary.奖金个税) });
    }

    links.push({ source: 个人实收, target: 个人收入, value: percent(summary.个人实收) });
    links.push({ source: 个税, target: 个人收入, value: percent(summary.个税) });

    var nodes = blog.echartsSankeyLinks2Nodes(links);

    return {
        nodes: nodes,
        links: links
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
    salary.baseYTD = blog.round((salary.bonus || 0));
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

    salary.taxable = blog.round((salary.bonus || 0));
    salary.taxableYTD = blog.round((salary.taxable + salaryOfPrevMonth.taxableYTD));

    var monthAmount = blog.round((salary.taxable / 12));

    var rates = salary.bonusRates.items;
    salary.rate = rates[rates.length - 1];
    for (let key in rates) {
        const rateItem = rates[key];
        if (monthAmount >= rateItem.min && monthAmount <= rateItem.max) {
            salary.rate = rateItem;
            break;
        }
    }

    salary.tax = Math.max(0, blog.round((salary.taxable * salary.rate.rate / 100 - salary.rate.quickDeduction)));
    salary.taxYTD = blog.round(salary.tax + salaryOfPrevMonth.taxYTD);

    salary.actual = blog.round(salary.taxable - salary.tax);
    salary.actualYTD = blog.round(salary.actual + salaryOfPrevMonth.actualYTD);

    salary.corporation = blog.round(salary.taxable);
    salary.corporationYTD = blog.round(salary.corporation + salaryOfPrevMonth.corporationYTD);
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
        salary.baseYTD = blog.round((salary.base || 0) + (salaryOfPrevMonth.baseYTD || 0));
    }

    function exempted() {
        salary.exemptedYTD = blog.round((salary.exempted || 0) + (salaryOfPrevMonth.exemptedYTD || 0));
    }

    function insurances() {
        for (let index in salary.insurances.items) {
            var insurance = salary.insurances.items[index];
            var insuranceOfPrevMonth = findInsurance(salaryOfPrevMonth.insurances.items, insurance.name);

            insurance.base = Math.min(Math.max(insurance.min, salary.base), insurance.max);

            if (salary.month <= 12) {
                insurance.personal = blog.round((insurance.base * insurance.personalPercentage / 100));
            } else {
                insurance.personal = 0;
            }
            insurance.personalYTD = blog.round((insurance.personal || 0) + (insuranceOfPrevMonth.personalYTD || 0));

            if (salary.month <= 12) {
                insurance.corporation = blog.round((insurance.base * insurance.corporationPercentage / 100));
            } else {
                insurance.corporation = 0;
            }
            insurance.corporationYTD = blog.round((insurance.corporation || 0) + (insuranceOfPrevMonth.corporationYTD || 0));

            insurance.sum = blog.round((insurance.personal || 0) + (insurance.corporation || 0));
            insurance.sumYTD = blog.round((insurance.sum || 0) + (insuranceOfPrevMonth.sumYTD || 0));
        }

        salary.insurances.personal = blog.sum(salary.insurances.items, x => x.personal);
        salary.insurances.personalYTD = blog.round((salary.insurances.personal || 0) + (salaryOfPrevMonth.insurances.personalYTD || 0));
        salary.insurances.corporation = blog.sum(salary.insurances.items, x => x.corporation);
        salary.insurances.corporationYTD = blog.round((salary.insurances.corporation || 0) + (salaryOfPrevMonth.insurances.corporationYTD || 0));
        salary.insurances.sum = blog.sum(salary.insurances.items, x => x.sum);
        salary.insurances.sumYTD = blog.round((salary.insurances.sum || 0) + (salaryOfPrevMonth.insurances.sumYTD || 0));
    }

    function taxable() {
        salary.taxable = Math.max(0, blog.round(salary.base - salary.insurances.personal - salary.exempted));
        salary.taxableYTD = Math.max(0, blog.round(salary.baseYTD - salary.insurances.personalYTD - salary.exemptedYTD));
    }

    function tax() {
        salary.rate = findRate();
        salary.taxYTD = taxCore();
        salary.tax = blog.round((salary.taxYTD || 0) - (salaryOfPrevMonth.taxYTD || 0));

        function taxCore() {
            const amount = salary.taxableYTD;
            if (amount < 0) {
                return 0;
            }
            const result = blog.round((amount * salary.rate.rate / 100 - salary.rate.quickDeduction));
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
        salary.actual = blog.round((salary.base || 0) - (salary.insurances.personal || 0) - (salary.tax || 0));
        salary.actualYTD = blog.round((salary.actual || 0) + (salaryOfPrevMonth.actualYTD || 0));
    }

    function corporation() {
        salary.corporation = blog.round((salary.base || 0) + (salary.insurances.corporation || 0));
        salary.corporationYTD = blog.round((salary.corporation || 0) + (salaryOfPrevMonth.corporationYTD || 0));
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