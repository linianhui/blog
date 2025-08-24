
function onChartDispatchToolTip(charts) {
    onChartDispatch(charts, "showTip1", function (context) {
        var param = context.params.batch ? context.params.batch[0] : context.params;
        return {
            type: 'showTip',
            dataIndex: param.dataIndex
        };
    });
}

function onChartDispatchDataZoom(charts) {
    onChartDispatch(charts, "dataZoom", function (context) {
        var param = context.params.batch ? context.params.batch[0] : context.params;
        return {
            type: "dataZoom",
            start: param.start,
            end: param.end
        };
    });
}

function onChartDispatch(charts, event, buildDispatchActionCallback) {
    if (blog.isEmptyArray(charts) || blog.isNull(event) || blog.isNull(buildDispatchActionCallback)) {
        return;
    }
    var thatList = [];
    for (var index = 0; index < charts.length; index++) {
        var current = charts[index];
        var others = charts.filter((x, i) => i != index);
        thatList.push({
            event: event,
            buildDispatchActionCallback: buildDispatchActionCallback,
            current: current,
            currentChartId: current.getDom().id,
            others: others
        });
    }

    for (var that of thatList) {
        that.current.on(that.event, function (params) {
            if (params.__dispatchChartId) {
                return;
            }
            var currentChartId = this.currentChartId;
            console.log("event", Date.now(), currentChartId, this.event, params);
            for (var other of this.others) {
                var action = this.buildDispatchActionCallback({
                    event: this.event,
                    params: params,
                });
                if (blog.isNull(action)) {
                    continue;
                }
                action.__dispatchChartId = currentChartId;
                console.log("action", Date.now(), other.getDom().id, this.event, action, params);
                other.dispatchAction(action);
            }
        }, that);
    }
}