function getLocationParams() {
  return {
    principal: parseInt(blog.getLocationParam(1, 1000000)),
    month: parseInt(blog.getLocationParam(2, 360)),
    rateYear: parseFloat(blog.getLocationParam(3, 4.2)),
    date: new Date(blog.getLocationParam(4, new Date())),
    asc: parseInt(blog.getLocationParam(5, 1)) != 0,
    aheadAmount: parseInt(blog.getLocationParam(6, 0)),
    reduceDate: parseInt(blog.getLocationParam(7, 1)) != 0
  };
}

var defaultParam = getLocationParams();
console.log("defaultParam", defaultParam);

var vueApp = new Vue({
  el: "#app",
  data: function () {
    return {
      principal: defaultParam.principal,
      month: defaultParam.month,
      rateYear: defaultParam.rateYear,
      date: defaultParam.date,
      asc: defaultParam.asc,
      aheadAmount: defaultParam.aheadAmount,
      reduceDate: defaultParam.reduceDate
    }
  },
  filters: {
    CNY: function (value) {
      return currency(
        value || 0,
        {
          symbol: "",
          separator: ",",
          precision: 2
        })
        .format();
    }
  },
  computed: {
    result() {
      var param = {
        principal: parseInt(this.principal, 10),
        month: this.month,
        rateYear: this.rateYear,
        date: this.date,
        asc: this.asc,
        aheadAmount: this.aheadAmount,
        reduceDate: this.reduceDate
      };

      var result = calculate(param);

      if (!this.asc) {
        result.months = result.months.reverse();
      }

      console.log("result", result, "param", param);

      var dateString = this.date.getFullYear() + "-" + (this.date.getMonth() + 1) + "-" + this.date.getDate();
      var ascString = this.asc ? 1 : 0;
      var reduceDateString = this.reduceDate ? 1 : 0;
      blog.setLocationParams(this.principal, this.month, this.rateYear, dateString, ascString, this.aheadAmount, reduceDateString);

      return result;
    }
  }
});