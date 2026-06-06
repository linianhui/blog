function calculateBpItems(b, p) {
    var result = [];
    for (var i = p; i <= 1; i += 0.05) {
        result.push(kellyCriterionItem(b, blog.round(i, 2)));
    }
    return result;
}

function kellyCriterionItem(b, p) {
    var q = blog.round(1 - p, 2);
    var f = blog.kellyCriterion(b, p, q);
    return {
        b: b,
        p: p,
        q: q,
        f: blog.round(f, 2)
    }
}

function renderBpChart(chart, items) {
    var data = items.map(item => {
        return {
            '净赔率b': item.b,
            '胜率p': item.p,
            '败率q': item.q,
            '最优比例': item.f
        }
    });
    var option = {
        title: {
            text: '最优比例'
        },
        backgroundColor: '#F5F5F5',
        legend: {
            show: true
        },
        grid: {
            left: 20,
            right: 20,
            top: 60,
            bottom: 60,
            containLabel: true
        },
        tooltip: {
            show: true,
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
        },
        toolbox: {
            show: true,
            right: '20px',
            feature: {
                dataZoom: {
                    show: false
                },
                magicType: { show: false },
                restore: { show: false },
                saveAsImage: { show: true }
            }
        },
        dataset: {
            sourceHeader: false,
            source: data
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '最优比例',
                type: 'bar',
                symbol: 'none',
                encode: {
                    x: '胜率p',
                    y: '最优比例',
                }
            }
        ]
    };
    chart.setOption(option);
}