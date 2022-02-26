---
title: '[Monitor] prometheus'
created_at: 2022-02-26 12:30:00
tag: ["monitor","prometheus","draft"]
toc: true
draft: true
---

监控系统工具

# Example


## Ratio

```promql
sum(rate(requests_counter{result="error"}[28d])) / sum(rate(requests_counter[28d]))

```

```promql
sum(increase(requests_counter{result="error"}[28d])) / sum(increase(requests_counter[28d]))
```

```promql
sum without (cpu)(rate(node_cpu[1m]))  
/ ignoring(mode) group_left 
sum without (mode, cpu)(rate(node_cpu[1m])) 
```

```promql
sum by (handler) (rate(prometheus_http_request_duration_seconds_count[1m]))
/ ignoring(handler) group_left
sum (rate(prometheus_http_request_duration_seconds_count[1m]))
```


```promql
sum by (code) (rate(prometheus_http_requests_total[1m]))
/ ignoring(code) group_left
sum (rate(prometheus_http_requests_total[1m]))
```

<https://www.robustperception.io/using-group_left-to-calculate-label-proportions>

# Reference

https://prometheus.io/

