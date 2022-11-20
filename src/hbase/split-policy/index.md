---
title: '[HBase] Region Split Policy'
created_at: 2022-05-15 16:25:00
tag: ["hbase", "Split"]
toc: true
displayed_on_home: true
---

# 1 概述 {#overview}

待完善。。。

# 2 配置方式 {#config}

## 2.1 RegionServer {#config-regionserver}

不推荐：原因是不够灵活。

`hbase.regionserver.region.split.policy`[^regionserver-config]。默认配置`org.apache.hadoop.hbase.regionserver.SteppingSplitPolicy`[^SteppingSplitPolicy-source-code]。
```xml
<property>
  <name>hbase.regionserver.region.split.policy</name>
  <value>org.apache.hadoop.hbase.regionserver.SteppingSplitPolicy</value>
</property>
```


## 2.2 Table {#config-table}

推荐：原因是表范围内的配置，每个表可以独立设置适合的策略。

方式1（不推荐）
```java
HTableDescriptor tableDesc = new HTableDescriptor("test");
tableDesc.setValue(HTableDescriptor.SPLIT_POLICY, ConstantSizeRegionSplitPolicy.class.getName());
tableDesc.addFamily(new HColumnDescriptor(Bytes.toBytes("cf1")));
admin.createTable(tableDesc);
```

方式2（推荐）
```shell
# old
hbase> create 'blog', {METADATA => {'SPLIT_POLICY' => 'org.apache.hadoop.hbase.regionserver.ConstantSizeRegionSplitPolicy'}},{NAME => 'cf'}

# new
hbase> create 'blog',{CONFIGURATION => {'hbase.regionserver.region.split_restriction.type' => 'KeyPrefix','hbase.regionserver.region.split_restriction.prefix_length' => '1'}},{NAME=>'cf'}
```

# 3 RegionSplitPolicy {#RegionSplitPolicy}

`RegionSplitPolicy`的继承关系如下:

1. `RegionSplitPolicy`[^RegionSplitPolicy-source-code]
    1. `DisabledRegionSplitPolicy`[^DisabledRegionSplitPolicy-source-code]
    2. `ConstantSizeRegionSplitPolicy`[^ConstantSizeRegionSplitPolicy-source-code]
      1. `IncreasingToUpperBoundRegionSplitPolicy`[^IncreasingToUpperBoundRegionSplitPolicy-source-code]
          1. `SteppingSplitPolicy`[^SteppingSplitPolicy-source-code]
          2. `KeyPrefixRegionSplitPolicy`[^KeyPrefixRegionSplitPolicy-source-code]
          3. `DelimitedKeyPrefixRegionSplitPolicy`[^DelimitedKeyPrefixRegionSplitPolicy-source-code]
          4. `BusyRegionSplitPolicy`[^BusyRegionSplitPolicy-source-code]



# 4 RegionSplitRestriction {#RegionSplitRestriction}

`KeyPrefixRegionSplitPolicy`[^KeyPrefixRegionSplitPolicy-source-code]和`DelimitedKeyPrefixRegionSplitPolicy`[^DelimitedKeyPrefixRegionSplitPolicy-source-code]在源码中已被标记为`@Deprecated`。

```java
/**
 * A custom RegionSplitPolicy implementing a SplitPolicy that groups
 * rows by a prefix of the row-key
 *
 * This ensures that a region is not split "inside" a prefix of a row key.
 * I.e. rows can be co-located in a region by their prefix.
 *
 * @deprecated since 2.4.3 and will be removed in 4.0.0. Use {@link RegionSplitRestriction},
 *   instead.
 */
@Deprecated
@InterfaceAudience.Private
public class KeyPrefixRegionSplitPolicy extends IncreasingToUpperBoundRegionSplitPolicy {
  // some code
}
```

推荐使用`RegionSplitRestriction`[^RegionSplitRestriction-source-code]代替。目前包含`KeyPrefixRegionSplitRestriction`[^KeyPrefixRegionSplitRestriction-source-code]和`DelimitedKeyPrefixRegionSplitRestriction`[^DelimitedKeyPrefixRegionSplitRestriction-source-code]两种策略。

```java
/**
 * A split restriction that restricts the pattern of the split point.
 * <p>
 * The difference between {@link RegionSplitPolicy} and RegionSplitRestriction is that
 * RegionSplitRestriction defines how to split while {@link RegionSplitPolicy} defines when we need
 * to split.
 * <p>
 * We can specify a split restriction, "KeyPrefix" or "DelimitedKeyPrefix", to a table with the
 * "hbase.regionserver.region.split_restriction.type" property. The "KeyPrefix" split restriction
 * groups rows by a prefix of the row-key. And the "DelimitedKeyPrefix" split restriction groups
 * rows by a prefix of the row-key with a delimiter.
 *
 * For example:
 * <pre>
 * <code>
 * # Create a table with a "KeyPrefix" split restriction, where the prefix length is 2 bytes
 * hbase> create 'tbl1', 'fam',
 *   {CONFIGURATION => {'hbase.regionserver.region.split_restriction.type' => 'KeyPrefix',
 *                      'hbase.regionserver.region.split_restriction.prefix_length' => '2'}}
 *
 * # Create a table with a "DelimitedKeyPrefix" split restriction, where the delimiter is a comma
 * hbase> create 'tbl2', 'fam',
 *   {CONFIGURATION => {'hbase.regionserver.region.split_restriction.type' => 'DelimitedKeyPrefix',
 *                      'hbase.regionserver.region.split_restriction.delimiter' => ','}}
 * </code>
 * </pre>
 *
 * Instead of specifying a split restriction to a table directly, we can also set the properties
 * in hbase-site.xml. In this case, the specified split restriction is applied for all the tables.
 * <p>
 * Note that the split restriction is also applied to a user-specified split point so that we don't
 * allow users to break the restriction.
 *
 * @see NoRegionSplitRestriction
 * @see KeyPrefixRegionSplitRestriction
 * @see DelimitedKeyPrefixRegionSplitRestriction
 */
@InterfaceAudience.Private
public abstract class RegionSplitRestriction {
  // some code
}
```

# 2 参考 {#reference}

[HBase原理(hbasefly.com)](http://hbasefly.com/category/hbase/)
[HBase原理 – 所有Region切分的细节都在这里了(hbasefly.com)](http://hbasefly.com/2017/08/27/hbase-split/)

[^RegionSplitPolicy-source-code]: RegionSplitPolicy Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/RegionSplitPolicy.java>

[^DisabledRegionSplitPolicy-source-code]: DisabledRegionSplitPolicy Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/DisabledRegionSplitPolicy.java>


[^ConstantSizeRegionSplitPolicy-source-code]: ConstantSizeRegionSplitPolicy Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/ConstantSizeRegionSplitPolicy.java>

[^IncreasingToUpperBoundRegionSplitPolicy-source-code]: IncreasingToUpperBoundRegionSplitPolicy Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/IncreasingToUpperBoundRegionSplitPolicy.java>

[^SteppingSplitPolicy-source-code]: SteppingSplitPolicy Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/SteppingSplitPolicy.java>


[^KeyPrefixRegionSplitPolicy-source-code]: KeyPrefixRegionSplitPolicy Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/KeyPrefixRegionSplitPolicy.java>

[^DelimitedKeyPrefixRegionSplitPolicy-source-code]: DelimitedKeyPrefixRegionSplitPolicy Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/DelimitedKeyPrefixRegionSplitPolicy.java>

[^BusyRegionSplitPolicy-source-code]: BusyRegionSplitPolicy Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/BusyRegionSplitPolicy.java>

[^RegionSplitRestriction-source-code]: RegionSplitRestriction Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/RegionSplitRestriction.java>

[^KeyPrefixRegionSplitRestriction-source-code]: KeyPrefixRegionSplitRestriction Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/KeyPrefixRegionSplitRestriction.java>

[^DelimitedKeyPrefixRegionSplitRestriction-source-code]: DelimitedKeyPrefixRegionSplitRestriction Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-server/src/main/java/org/apache/hadoop/hbase/regionserver/DelimitedKeyPrefixRegionSplitRestriction.java>

[^regionserver-config]:regionserver-config : <https://hbase.apache.org/2.3/book.html#hbase.regionserver.region.split.policy>