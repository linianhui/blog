---
title: '[Java] GC(Garbage Collection)'
created_at: 2020-11-06 19:32:01
tag: ["Java", "GC"]
toc: true
---

GC要解决的三个问题：
1. 哪些对象需要回收？
2. 何时回收？
3. 如何回收？

# 1 哪些对象需要回收？

Java的内存区域中，Java线程栈、本地方法栈和程序计数器因为是线程私有的，随着线程的执行自动的释放，所以这部分是是无需回收的。目前需要回收的主要是两个区域：**堆**和**元数据区**。又因为元数据区域存放的是class的信息和常量以及一些静态变量等数据，这部分的数据的生命周期通常是和Java进程保持一致的，所以回收的意义不大。故而只剩下一个区域**堆**。

那么在回收之前，首先要做的事情就是识别出来堆中的哪些对象是垃圾对象，目前主要又两种方式。

## 1.1 引用计数法

开辟一块额外的内存区域，用来记录对象被引用的次数（新增一个引用就+1，否则就-1）。其有点事原理非常简单，但是有一个致命的问题：无法解决循环引用的问题。比如A引用了B，B也引用了A，但是再无其他对象引用A和B了。但是A和B的引用次数都还是1。

## 1.2 可达性分析

目前主流的一些包含GC的语言都是采用可达性分析的方法来判断对象是否是垃圾对象。算法的核心是根据GC Root 对象递归检查，检查到的对象都不用回收，否则就是垃圾对象。

在Java中，可作为GC Root的对象主要来自于：
1. java线程栈中的栈帧中的局部变量表中的引用。
2. 元数据区中的常量引用的对象，静态变量引用的对象。
3. JNI引用的对象。
4. JVM内部的引用：比如对象的`getClass()`获得到的class对象。以及ClassLoader等。
5. 所有被synchronized持有的对象。

## 1.3 四种引用类型 {#reference-type}

在Java 1.2之前的GC工作中，引用只有两种状态，被引用和未被引用。在一些场景下明显不够灵活。所以在1.2中堆对引用进行了扩充，分为了如下四种类型。

### 1.3.1 Strong Reference {#strong-reference}

默认的引用就是Strong Reference强引用。
```java
A.b = new B();
```
在任何情况下，假设A是被GC root对象持有的引用，只要存在A对B的强引用，就那么A和B都不会被回收。

### 1.3.2 Soft Reference {#soft-reference}

软引用`SoftReference<T>`[^soft-reference]比Strong弱一些，在内存足够的时候，这部分对象也不会被回收，只有当内存不够时，就会对此部分对象进行回收。

```java
SoftReference<A> softReferenceField = new SoftReference<A>(new A());
A a = softReferenceField.get();
```

### 1.3.3 Weak Reference {#weak-reference}

弱引用`WeakReference<T>`[^weak-reference]比Soft更弱一些。当除了WeakReference再没其他的引用时，只要发生GC，那么就会被回收。

```java
WeakReference<A> weakReferenceField = new WeakReference<A>(new A());
A a = weakReferenceField.get();
```

### 1.3.4 Phantom Reference {#phantom-reference}

虚引用`PhantomReference<T>`[^phantom-reference]比时最弱的一中引用关系，完全不会对对象的生存周期产生任何影响，也不能通过它获得一个对象。它的目的仅仅时可以让对象被回收时得到一个通知。

```java
PhantomReference<A> phantomReferenceField = new PhantomReference<A>(new A());
// 永远是null
A a = phantomReferenceField.get();
```

# 2 何时回收?

到达安全点。

# 3 如何回收?

## 3.1 垃圾收集算法

### 3.1 标记-清理

根据可达性分析找到垃圾对象，就地清理对象。

缺点：造成内存碎片。

### 3.2 标记-复制

把内存等分为两块A和B，把非垃圾对象整体复制到B，然后整体回收A，如此往复。

缺点：内存浪费严重。

不过经过java团队的研究发现，98%的对象都是朝生夕死的，所以把内存划分成了8:1:1。其中8是新生代，优先分配到次。
1:1的是两个交换区AB，一次只使用其中的一个。这样可以兼顾空间和性能。

### 3.3 标记-整理

根据可达性分析找到垃圾对象，按照整理移动的方式避免标记-清理造成的内存碎片。用在老年代上。

### 3.4 分代回收

分为新、老代，分别选择合适的算法。
新生代使用复制，老年代使用整理。

G1不再明确区分老年代和新生代，而是把内存化分成很多等分的区块，G1动态的调整它的用途。
通过追踪这些区块的信息，然后根据设定的垃圾回收时间，动态的选择回收其中的一部分，而不是之前的那种全部回收。

## 3.2 垃圾收集器

STW: Stop The World.

1. Serial: 新生代。标记-复制。单线程。
2. Serial Old ：老年代。标记-整理。单线程。
3. ParNew/: 新生代。标记-复制。多线程版的Serial。
4. Parallel Scavenge: 新生代。标记-复制。多线程。关注于吞吐量，即用户代码的运行时间/用户代码的运行时间+GC的时间。
5. Parallel Old：老年代。标记-整理。Parallel Scavenge的老年代版本。
6. CMS : 老年代。标记-清理。关注于最短回收停顿时间。
    1. 初始标记（CMS initial mark）: STW。仅记录GC root直接关联的对象。
    2. 并发标记（CMS concurrent mark）: 耗时最慢的缓解不SWT。在1的基础上遍历整个对象图，和用户代码并行运行。
    3. 重新标记（CMS remark）: SWT。修正并发标记阶段产生变动的一部分对象。
    4. 并发清除（CMS concurrent sweep）。仅清理，并不需要移动对象，也和用户代码并行。
7. G1(Garbage First): 新老年代。混合GC。基于把内存分为Region小块，局部收集（
追踪每个Region的垃圾的回收价值大小，然后依据能回收的空间和所消耗的时间比，选择性的优先回收某一部分Region）。
每一个区块都可以是新生代、交换区或者老年代。动态调整。还有一个Humongous区域，大对象专属。
    1. 初始标记（Initial Marking）: STW。仅记录GC root直接关联的对象。并且修改TAMS指针的值，让下阶段用户线程运行时，能正确的在可用的Region中分配对象。
    2. 并发标记（Concurrent Marking）: 耗时最慢的缓解不SWT。和用户代码并行运行。在1的基础上遍历整个对象图，然后重新处理SATB记录下的在并发时有引用变动的对象。
    3. 最总标记（Final Marking）: SWT。处理2遗留的少量SATB记录。
    4. 筛选回收（Live Data Counting And Evacuation）。更新Region的统计数据，对回收价值和成本排序，根据设置的期望停顿时间制定回收计划。
    然后选择任意个Region中的存活对象复制到空的Region中，再清理掉旧的Region的全部空间（SWT）。



# 参考资料

[^soft-reference]: `java.lang.ref.SoftReference<T>`: <https://docs.oracle.com/javase/8/docs/api/java/lang/ref/SoftReference.html> 
[^weak-reference]: `java.lang.ref.WeakReference<T>`: <https://docs.oracle.com/javase/8/docs/api/java/lang/ref/WeakReference.html> 
[^phantom-reference]: `java.lang.ref.PhantomReference<T>`: <https://docs.oracle.com/javase/8/docs/api/java/lang/ref/PhantomReference.html> 
