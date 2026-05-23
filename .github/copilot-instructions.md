# Coding Guidelines

## Variables

- 使用 `const` 和 `let` 代替 `var`
- 只在需要重新赋值时使用 `let`，其余一律用 `const`

## Control Flow

- `if` / `for` / `while` 必须始终使用花括号 `{}`，禁止单行省略
```js
// ✅ 正确
if (condition) {
    doSomething();
}

// ❌ 错误
if (condition) doSomething();
```

## Object Literals

- 对象属性赋值必须写成显式的 `key: value` 形式，禁止 ES6 简写
```js
// ✅ 正确
return {
    name: name,
    age: age
};

// ❌ 错误
return {
    name,
    age
};
```

## Functions

- 使用默认参数代替 `||` 回退
```js
// ✅ 正确
function buildChart(option = {}) { ... }

// ❌ 错误
function buildChart(option) {
    option = option || {};
    ...
}
```

- 回调函数优先使用箭头函数
```js
// ✅ 正确
items.forEach(item => { ... });

// ❌ 错误
items.forEach(function(item) { ... });
```

## Code Organization

- 重复的入参校验应提取为公共函数
- 常量数据（如固定的 series 配置）应提取为模块级常量，避免每次调用时重新创建
