function calculate(param) {
    var items = [];

    var current = calculateCurrent(param);
    items.push(current);

    applyActions(items, param.actions);

    return {
        items: items
    };
}

function applyActions(items, actions) {
    if (!actions) {
        return;
    }

    for (let index = 0; index < actions.length; index++) {
        const action = actions[index];
        applyAction(items, action);
    }
}

function applyAction(items, action) {
    if (!action) {
        return;
    }

    action = calculateAction(action);
    if (!action) {
        return;
    }

    var last = items[items.length - 1];

    var cost = {
        number: calculateCostNumber(last.cost, action),
        amount: calculateCostAmount(last.cost, action)
    };

    cost.price = calculateCostPrice(cost, action);

    var price = calculateCore({
        price: action.price,
        number: cost.number
    });

    var costDiff = calculateDiff(last.cost, cost);
    var priceDiff = calculateDiff(last.price, price);
    var income = calculateDiff(cost, price);

    var item = {
        type: action.type,
        action: action,
        cost: cost,
        costDiff: costDiff,
        price: price,
        priceDiff: priceDiff,
        income: income
    };

    items.push(item);
}

function calculateCostNumber(lastCost, action) {
    if (isBuy(action)) {
        return lastCost.number + action.number;
    }

    return lastCost.number - action.number;
}

function calculateCostAmount(lastCost, action) {
    if (isBuy(action)) {
        return lastCost.amount + action.amount;
    }

    return lastCost.amount - action.amount;
}

function calculateCostPrice(cost) {
    if (cost.number == 0) {
        return cost.amount;
    }
    return blog.round2(cost.amount / cost.number);
}

function calculateCurrent(action) {
    var cost = calculateCore({
        price: action.cost,
        number: action.number
    });

    var price = calculateCore({
        price: action.price,
        number: action.number
    });

    var income = calculateDiff(cost, price);

    return {
        type: action.type,
        cost: cost,
        price: price,
        income: income
    };
}

function calculateDiff(a, b) {
    var price = blog.round2(b.price - a.price);
    var number = blog.round2(b.number - a.number);
    var priceClass = calculateDiffCssClass(price);
    var amount = blog.round2(b.amount - a.amount);
    var amountPercent = blog.round2(amount * 100 / a.amount);
    var amountClass = calculateDiffCssClass(amount);
    return {
        price: price,
        priceClass: priceClass,
        number: number,
        amount: amount,
        amountPercent: amountPercent,
        amountClass: amountClass
    };
}

function calculateAction(action) {
    if (!action) {
        return;
    }

    if (!action.enabled) {
        return;
    }

    var result = blog.deepClone(action);
    result.amount = calculateAmountCore(action);
    result.actionClass = calculateActionCssClass(result);
    return result;
}

function calculateCore(param) {
    var amount = calculateAmountCore(param);
    return {
        price: param.price,
        number: param.number,
        amount: amount
    };
}

function calculateAmountCore(param) {
    return blog.round2(param.price * param.number);
}

function calculateDiffCssClass(value) {
    if (value > 0) {
        return "diff-up";
    }

    if (value < 0) {
        return "diff-down";
    }

    return "diff-none";
}

function calculateActionCssClass(action) {
    if (isBuy(action)) {
        return "action-buy";
    }

    if (isSell(action)) {
        return "action-sell";
    }

    return "action-none";
}

function isBuy(action) {
    return action && "买入" == action.type;
}

function isSell(action) {
    return action && "卖出" == action.type;
}