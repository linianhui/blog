const hddBrands = {
    '希捷': {
        url: 'https://www.seagate.com/cn/zh/',
        seriess: {
            "SkyHawk": {
                url: 'https://www.seagate.com/cn/zh/support/internal-hard-drives/consumer-electronics/skyhawk/',
                datasheetUrl: 'https://www.seagate.com/www-content/datasheets/pdfs/skyhawk-3-5-hdd-china-DS1902-16C-2107CN-zh_CN.pdf'
            },
            'Exos 7E10': {
                url: 'https://www.seagate.com/cn/zh/support/internal-hard-drives/enterprise-hard-drives/exos-7e10/',
                datasheetUrl: 'https://www.seagate.com/www-content/datasheets/pdfs/exos-7e10-DS1957-6M-2104CN-zh_CN.pdf'
            },
            'Exos X18': {
                url: 'https://www.seagate.com/cn/zh/support/internal-hard-drives/enterprise-hard-drives/exos-X18/',
                datasheetUrl: 'https://www.seagate.com/www-content/datasheets/pdfs/exos-x18-channel-DS2045-4-2106CN-zh_CN.pdf'
            }
        }
    },
    "西部数据": {
        url: 'https://www.westerndigital.com/zh-cn',
        seriess: {
            "Purple Surveillance": {
                url: 'https://www.westerndigital.com/zh-cn/products/internal-drives/wd-purple-sata-hdd',
                datasheetUrl: 'https://documents.westerndigital.com/content/dam/doc-library/zh_cn/assets/public/western-digital/product/internal-drives/wd-purple-hdd/product-brief-wd-purple-hdd.pdf'
            },
            "Blue PC Desktop": {
                url: 'https://www.westerndigital.com/zh-cn/products/internal-drives/wd-blue-desktop-sata-hdd#WD80EAZZ',
                datasheetUrl: 'https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/product/internal-drives/wd-blue-hdd/product-brief-western-digital-wd-blue-pc-hdd.pdf'
            },
            "Ultrastar DC HC320": {
                url: 'https://www.westerndigital.com/zh-cn/products/internal-drives/data-center-drives/ultrastar-dc-hc320-hdd',
                datasheetUrl: 'https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/product/data-center-drives/ultrastar-dc-hc300-series/data-sheet-ultrastar-dc-hc300-series.pdf'
            },
            "Ultrastar DC HC550": {
                url: 'https://www.westerndigital.com/zh-cn/products/internal-drives/data-center-drives/ultrastar-dc-hc550-hdd',
                datasheetUrl: 'https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/product/data-center-drives/ultrastar-dc-hc500-series/data-sheet-ultrastar-dc-hc550.pdf'
            }
        }
    }
};


const hdds = [
    {
        capacity: '4TB',
        brand: '希捷',
        series: 'SkyHawk',
        model: 'ST4000VX016',
        recording: 'CMR',
        rpm: 5400,
        cache: '256MB',
        price: 498,
        priceDate: '2022-10-25'
    },
    {
        capacity: '4TB',
        brand: '海康OEM',
        series: 'SkyHawk',
        model: 'ST4000VX015',
        recording: 'CMR',
        rpm: 5400,
        cache: '256MB',
        price: 418,
        priceDate: '2022-10-25'
    },
    {
        capacity: '4TB',
        brand: '西部数据',
        series: 'Purple Surveillance',
        model: 'WD42EJRX',
        recording: 'CMR',
        rpm: 5400,
        cache: '256MB',
        price: 445,
        priceDate: '2022-10-25'
    },
    {
        capacity: '4TB',
        brand: '西部数据',
        series: 'Purple Surveillance',
        model: 'WD43PURZ',
        recording: 'CMR',
        rpm: 5400,
        cache: '64MB',
        price: 519,
        priceDate: '2024-09-02'
    },
    {
        capacity: '4TB',
        brand: '海康OEM',
        series: 'Purple Surveillance',
        model: 'WD42HKVS',
        recording: 'CMR',
        rpm: 5400,
        cache: '256MB',
        price: 418,
        priceDate: '2022-10-25'
    },
    {
        capacity: '8TB',
        brand: '希捷',
        series: 'Exos 7E10',
        model: 'ST8000NM017B',
        recording: 'CMR',
        rpm: 7200,
        cache: '256MB',
        price: 1068,
        priceDate: '2022-10-25'
    },
    {
        capacity: '8TB',
        brand: '西部数据',
        series: 'Ultrastar DC HC320',
        model: 'HUS728T8TALE6L4',
        recording: 'CMR',
        rpm: 7200,
        cache: '256MB',
        price: 999,
        priceDate: '2022-10-25'
    },
    {
        capacity: '8TB',
        brand: '西部数据',
        series: 'Blue PC Desktop',
        model: 'WD80EAZZ',
        recording: 'CMR',
        rpm: 5640,
        cache: '128MB',
        price: 1249,
        priceDate: '2022-11-17'
    },
    {
        capacity: '8TB',
        brand: '西部数据',
        series: 'Blue PC Desktop',
        model: 'WD80EAAZ',
        recording: 'CMR',
        rpm: 5640,
        cache: '256MB',
        price: 1299,
        priceDate: '2024-08-31'
    },
    {
        capacity: '16TB',
        brand: '希捷',
        series: 'Exos X18',
        model: 'ST16000NM000J',
        recording: 'CMR',
        rpm: 7200,
        cache: '256MB',
        price: 1678,
        priceDate: '2022-10-25'
    },
    {
        capacity: '16TB',
        brand: '西部数据',
        series: 'Ultrastar DC HC550',
        model: 'WUH721816ALE6L4',
        recording: 'CMR',
        rpm: 7200,
        cache: '256MB',
        price: 1599,
        priceDate: '2022-10-25'
    },
    {
        capacity: '18TB',
        brand: '希捷',
        series: 'Exos X18',
        model: 'ST18000NM000J',
        recording: 'CMR',
        rpm: 7200,
        cache: '256MB',
        price: 1998,
        priceDate: '2022-10-25'
    },
    {
        capacity: '18TB',
        brand: '西部数据',
        series: 'Ultrastar DC HC550',
        model: 'WUH721818ALE6L4',
        recording: 'CMR',
        rpm: 7200,
        cache: '256MB',
        price: 1899,
        priceDate: '2022-10-25'
    }
];


function hddFill(hdd) {
    hdd.brandUrl = getHddBrandUrl(hdd);
    hdd.capacityBytes = blog.parseBytes(hdd.capacity, 1000);
    hdd.actualCapacityGB = blog.formatBytes(hdd.capacityBytes, 1024, "GB", 0);
    hdd.actualCapacityTB = blog.formatBytes(hdd.capacityBytes, 1024, "TB", 2);
    hdd.seriesUrl = getHddSeriesUrl(hdd);
    hdd.datasheetUrl = getHddDatasheetUrl(hdd);
    hdd.shopJDUrl = blog.getJDSearchUrl(hdd.model);
    hdd.shopTBUrl = blog.getTBSearchUrl(hdd.model);
}

function getHddBrand(hdd) {
    return hddBrands[hdd.brand];
}

function getHddBrandUrl(hdd) {
    var brand = getHddBrand(hdd);
    if (brand) {
        return brand.url;
    }
}

function getHddSeries(hdd) {
    var brand = getHddBrand(hdd);
    if (brand && brand.seriess) {
        return brand.seriess[hdd.series];
    }
}

function getHddSeriesUrl(hdd) {
    var series = getHddSeries(hdd);
    if (series) {
        return series.url;
    }
}

function getHddDatasheetUrl(hdd) {
    var series = getHddSeries(hdd);
    if (series) {
        return series.datasheetUrl;
    }
}

hdds.forEach(hddFill);