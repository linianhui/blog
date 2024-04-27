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

    var actionPrice = calculateAction(action);
    if (!actionPrice) {
        return;
    }

    var buy = action.type == "买入";

    var last = items[items.length - 1];

    var number = buy
        ? last.cost.number + actionPrice.number
        : last.cost.number - actionPrice.number;

    var costAmount = buy
        ? last.cost.amount + actionPrice.amount
        : last.cost.amount - actionPrice.amount;

    var cost = {
        price: blog.round2(costAmount / number),
        number: number,
        amount: costAmount
    };

    var price = calculateCore({
        price: actionPrice.price,
        number: number
    });

    var costDiff = calculateDiff(last.cost, cost);
    var priceDiff = calculateDiff(last.price, price);
    var income = calculateDiff(cost, price);

    var item = {
        type: action.type,
        action: actionPrice,
        cost: cost,
        costDiff: costDiff,
        price: price,
        priceDiff: priceDiff,
        income: income
    };

    items.push(item);
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

function calculateAction(action) {
    if (!action) {
        return;
    }

    if (!action.enabled) {
        return;
    }

    if (action.number <= 0) {
        return;
    }

    var result = calculateCore({
        price: action.price,
        number: action.number
    });

    result.type = action.type;
    result.actionClass = calculateActionCssClass(action.type);
    return result;
}

function calculateDiff(a, b) {
    var price = blog.round2(b.price - a.price);
    var priceClass = calculateDiffCssClass(price);
    var amount = blog.round2(b.amount - a.amount);
    var amountPercent = blog.round2(amount * 100 / a.amount);
    var amountClass = calculateDiffCssClass(amount);
    return {
        price: price,
        priceClass: priceClass,
        amount: amount,
        amountPercent: amountPercent,
        amountClass: amountClass
    };
}

function calculateCore(param) {
    var amount = blog.round2(param.price * param.number);
    return {
        price: param.price,
        number: param.number,
        amount: amount
    };
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

function calculateActionCssClass(actionType) {
    if ("买入" == actionType) {
        return "action-buy";
    }

    if ("卖出" == actionType) {
        return "action-sell";
    }

    return "action-none";
}