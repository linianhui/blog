
function resolveBatchParam(context) {
    return context.params.batch ? context.params.batch[0] : context.params;
}

function onChartDispatchToolTip(charts) {
    onChartDispatch(charts, "highlight", function (context) {
        var param = resolveBatchParam(context);
        return {
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: param.dataIndex
        };
    });
}

function onChartDispatchDataZoom(charts) {
    onChartDispatch(charts, "dataZoom", function (context) {
        var param = resolveBatchParam(context);
        return {
            type: "dataZoom",
            start: param.start,
            end: param.end
        };
    });
}

function onChartDispatch(charts, event, buildDispatchActionCallback) {
    if (blog.isEmptyArray(charts)) {
        return;
    }
    for (var i = 0; i < charts.length; i++) {
        var current = charts[i];
        var others = charts.slice(0, i).concat(charts.slice(i + 1));
        current.on(event, function (params) {
            if (params.__dispatchChartId) {
                return;
            }
            for (var j = 0; j < this.others.length; j++) {
                var other = this.others[j];
                var action = buildDispatchActionCallback({ event: event, params: params });
                action.__dispatchChartId = this.currentChartId;
                other.dispatchAction(action);
            }
        }, {
            others: others,
            currentChartId: current.getDom().id
        });
    }
}