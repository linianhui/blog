var config = {
    rates: {
        "2019新税率": {
            exempted: 5000,
            items: [
                {
                    min: 0,
                    max: 36000,
                    rate: 3,
                    quickDeduction: 0
                },
                {
                    min: 36000,
                    max: 144000,
                    rate: 10,
                    quickDeduction: 2520
                },
                {
                    min: 144000,
                    max: 300000,
                    rate: 20,
                    quickDeduction: 16920
                },
                {
                    min: 300000,
                    max: 420000,
                    rate: 25,
                    quickDeduction: 31920
                },
                {
                    min: 420000,
                    max: 660000,
                    rate: 30,
                    quickDeduction: 52920
                },
                {
                    min: 660000,
                    max: 960000,
                    rate: 35,
                    quickDeduction: 85920
                },
                {
                    min: 960000,
                    max: null,
                    rate: 45,
                    quickDeduction: 181920
                }
            ]
        }
    },
    insurances: {
        北京: {
            养老: {
                base: 25401,
                corporationPercentage: 19,
                personalPercentage: 8
            },
            医疗: {
                base: 25401,
                corporationPercentage: 10,
                personalPercentage: 2
            },
            失业: {
                base: 25401,
                corporationPercentage: 0.8,
                personalPercentage: 0.2
            },
            工伤: {
                base: 25401,
                corporationPercentage: 0.4,
                personalPercentage: 0
            },
            生育: {
                base: 25401,
                corporationPercentage: 0.8,
                personalPercentage: 0
            },
            公积金: {
                base: 25401,
                corporationPercentage: 12,
                personalPercentage: 12
            }
        }
    }
};