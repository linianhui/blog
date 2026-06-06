function initSumChart(vm) {
    vm.sumChart = echarts.init(vm.$refs.sumChartDiv);
    renderSumChart(vm);
}

function renderSumChart(vm) {
    var sankeyData = buildSankeyData(vm.salarys.summary, vm.precision);
    var option = {
        title: {
            text: '税前工资百分比分布'
        },
        backgroundColor: '#F5F5F5',
        grid: {
            left: 20,
            right: 20,
            top: 60,
            bottom: 60,
            containLabel: true
        },
        tooltip: {
            show: true,
            trigger: 'item'
        },
        toolbox: {
            show: true,
            right: '20px',
            feature: {
                saveAsImage: {}
            }
        },
        series: [
            {
                type: 'sankey',
                nodes: sankeyData.nodes,
                links: sankeyData.links,
                lineStyle: {
                    color: 'gradient',
                    curveness: 0.5
                }
            }
        ]
    };
    vm.sumChart.setOption(option);
}
