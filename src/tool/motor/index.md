---
title: "[工具] 摩托车折旧计算器"
created_at: 2024-03-08 22:05:01
tag: ["摩托车折旧计算器",'tool']
toc: true
---

{{<element-ui>}}
{{<inline-html path="calculator.html">}}


# 参考 {#reference}

YTD = Year to Date，代表当年累计值
每年减值 = 新车价格 / 13<sup>报废年限</sup>
减值YTD = 每年减值 * 年数<sup>当前年份 - 新车年份</sup>
剩余价值 = (新车价格 - 减值YTD ) * 折旧系数
