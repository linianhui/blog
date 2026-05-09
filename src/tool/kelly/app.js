var defaultParamm = {
    b: blog.getLocationParam(0, 0.5),
    p: blog.getLocationParam(1, 0.7)
};

console.log('defaultParamm', defaultParamm);

var vueApp = new Vue({
    el: '#app',
    mounted() {
        this.initChart();
    },
    data: function () {
        return {
            b: defaultParamm.b,
            p: defaultParamm.p
        }
    },
    methods: {
        initChart() {
            this.bpChart = echarts.init(this.$refs.bpChartDiv);
            this.updateChart();
        },
        storeParams() {
            blog.setLocationParams(this.b, this.p);
        }
        ,
        updateChart() {
            this.bpItems = calculateBpItems(this.b, this.p);
            renderBpChart(this.bpChart, this.bpItems);
            this.storeParams();
        }
    },
    watch: {
        b: function () { this.updateChart(); },
        p: function () { this.updateChart(); }
    }
});