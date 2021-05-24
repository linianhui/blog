var config = {
    rates: {
        "2019新税率表": {
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
        "北京2021社保基数": {
            养老: {
                min: 3613,
                max: 25401,
                corporationPercentage: 19,
                personalPercentage: 8
            },
            医疗: {
                min: 5360,
                max: 25401,
                corporationPercentage: 10,
                personalPercentage: 2
            },
            失业: {
                min: 3613,
                max: 25401,
                corporationPercentage: 0.8,
                personalPercentage: 0.2
            },
            工伤: {
                min: 4713,
                max: 25401,
                corporationPercentage: 0.4,
                personalPercentage: 0
            },
            生育: {
                min: 5360,
                max: 25401,
                corporationPercentage: 0.8,
                personalPercentage: 0
            },
            公积金: {
                min: 0,
                max: 25401,
                corporationPercentage: 12,
                personalPercentage: 12
            }
        },
        "杭州2021社保基数": {
            养老: {
                min: 3321.6,
                max: 17880.75,
                corporationPercentage: 14,
                personalPercentage: 8
            },
            医疗: {
                min: 3321.6,
                max: 17880.75,
                corporationPercentage: 10.5,
                personalPercentage: 2
            },
            失业: {
                min: 3321.6,
                max: 17880.75,
                corporationPercentage: 0.5,
                personalPercentage: 0.5
            },
            工伤: {
                min: 3321.6,
                max: 17880.75,
                corporationPercentage: 0.4,
                personalPercentage: 0
            },
            生育: {
                min: 3321.6,
                max: 17880.75,
                corporationPercentage: 1.2,
                personalPercentage: 0
            },
            公积金: {
                min: 0,
                max: 17880.75,
                corporationPercentage: 12,
                personalPercentage: 12
            }
        }
    }
};