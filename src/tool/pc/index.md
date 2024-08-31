---
title: "[工具] pc"
created_at: 2022-11-16 23:09:01
tag: ["pc",'tool',"hdd","afr"]
toc: true
---

{{<element-ui>}}
{{<inline-html path="header.html">}}

# USB {#usb}

## RTL9210B-CG {#usb-rtl9210b-cg}

最新固件下载：<https://www.station-drivers.com/index.php/zh/component/search/?searchword=RTL9210&searchphrase=all&Itemid=101>


{{<highlight-file path="i9A-2242.cfg" lang="ini">}}

# 机械硬盘 {#hdd}

{{<inline-html path="hdd.html">}}

注意：购买明确标注`CMR`的机械硬盘，希捷较西部数据安静一些（但是希捷故障率高一些）。其他的核心特性
1. RVS(Rotational Vibration Sensor) : 旋转振动传感器
2. AFR(Annualized Failure Rates): 年化故障率
    1. <https://www.backblaze.com/blog/category/cloud-storage/hard-drive-stats>
    2. <https://www.backblaze.com/blog/backblaze-drive-stats-for-q3-2022>
    3. <https://www.backblaze.com/cloud-storage/resources/hard-drive-test-data>