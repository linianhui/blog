---
title: '[Java] synchronized'
created_at: 2020-11-08 19:33:01
tag: ["Java", "AQS","CAS","Lock","synchronized"]
toc: true
---

在Java中，有一个与锁有关的关键字`synchronized`，它是由JVM层面提供的`Monitor`来实现。

# 1. 语法 {#syntax}

`synchronized`关键字在语法层面[^jls-synchronization]有两种形式。请看如下的示例代码：

{{<highlight-file file="SynchronizedExample.java" lang="java">}}

## 1.1 修饰代码快 {#statement}

示例中的`instanceSynchronizedStatementMethod`方法，这种形式的语法要求`synchronized`关键字关联一个对象作为同步资源，然后紧跟着是一个代码块。可以保证在一个JVM进程内，多个使用`syncObject`作为同步资源对象的线程同时访问这个代码块的时候，只能串行的进行访问，也就是同一时刻，只会有一个线程成功的进入这个代码块执行代码。当然这个同步资源对象`syncObject`也可以是一个字段，实例的或者静态的都可以，包裹这个同步代码块的方法同样的也是实例的或者静态的都可以。

这种语法形式的关键在于多个线程持有的`syncObject`是不是同一个，同一个的为同一个阻塞队列。

由此就可以推导出来，Java中的`int`、`byte`和`char`等等这些基本的原始类型是不能作为`syncObject`的，因为它们直接存储的是值，而不是引用；其次`Integer`这种包装类型由于存在装箱拆箱，也是不可以的；再次`String`由于有字符串驻留池的存在，也无法确保`syncObject`不会出现错乱。

故而最好的方式就是`new Object()`即可，当然你也不能有10个线程，每个线程都`new`一个自己的`syncObject`，而是让需要同步的那些个线程使用同一个`syncObject`即可。

当你需要在整个JVM内同步所有线程时，选一个JVM内单例的`syncObject`即可，比如一个静态的字段，或者一个类型的`class`对象。

## 1.2 修饰方法 {#method}

示例中的`synchronizedInstanceMethod`和`synchronizedStaticMethod`都是方法级别的语法。其差异在于前者是锁的`this`对象，后者锁的是`SynchronizedExample.class`这个对象。由于后者在一个JVM进程内是唯一的，故而相当于会影响所有的访问这个方法的线程。

# 2 字节码 {#class-file}

通过字节码来看一下编译后的代码。

{{<highlight-file file="SynchronizedExample.javap" lang="ini">}}

可以看出`instanceSynchronizedStatementMethod`比`instanceMethod`中多来很多的指令，主要是`monitorenter`和`monitorexit`这两个，前者代表加锁，后者代表释放锁，由于不知掉内部会不会抛出异常，故而编译器自动添加来`finaly`块来保证锁的释放。

而`synchronizedInstanceMethod`和`synchronizedStaticMethod`两个方法就比较简单了，只是增加来一个标记`ACC_SYNCHRONIZED`。当JVM遇见这个标记的方法时，会使用和上面一样的`monitorenter`和`monitorexit`一样的方式来执行加锁和解锁行为。

# 3 实现原理 {#}

JVM底层是依赖Java的对象头中的`Mark Word`和`Monitor`来实现的`synchronized`。

## 3.1 Mark Word {#mark-word} 

锁的四种状态体现在下面的表格中。

{{<inline-html file="mark-word.32bit.html">}}

## 3.2 Monitor {#monitor}

我们通过上述的字节码已经得知了`monitorenter`和`monitorexit`指令以及附加到方法上的`ACC_SYNCHRONIZED`标记。在文章开头提到`synchronized`是由JVM层面提供的`Monitor`来实现，那么这些指令和标记就是为Monitor而准备的，在JVM中通过C++实现的`ObjectMonitor`[^object-monitor-cpp]来提供支持。

> `java.lang.Object`的`wait`、`notify`和`notifyAll`这些native方法也是由`ObjectMonitor`实现的。

{{<highlight-file file="ObjectMonitor.hpp" lang="cpp">}}

这里由几个重要的字段：
1. `_owner`：拥有当前对象的线程地址。
2. `_WaitSet`：存放调用wait方法后进入等待状态的线程的队列。
3. `_EntryList`：等待锁block状态的线程的队列。
4. `_recursions`：锁的重入次数。
5. `_count`：线程获取锁的次数。

## 3.3 Heavyweight Lock {#heavyweight-lock}

Jdk1.6之前，`synchronized`在JVM底层就只是传统意义上的依赖OS内核mutex结合`Mark Word`和`Monitor`实现的传统意义上的锁，现在称之为重量级锁。

在上面的`Mark Word`表格中，当`Flag`是`10`时，代表前面的30bit是指向Monitor对象的指针。

## 3.4 Lightweight Lock {#lightweight-lock}

在Jdk1.6时，引入了轻量级锁。自旋锁，自适应锁。

## 3.5 Biased Lock {#biased-lock}

在Jdk1.6时，引入了偏向锁。

# 4 遗留问题 {#problem}

使用`synchronized`来进行同步是非常方便的，JVM也在进行持续的优化，性能也可以得到满足。但是因为这一切都是JVM内部实现的，有些个别的需求它依然无法满足。

1. 有些情况下效率达不到要求。
2. 获取锁的状态。
3. 不可中断。
4. 不够灵活。

# 5 参考资料 {#reference}

[^jls-synchronization]: JLS-Synchronization : <https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html#jls-17.1>

[^jvm-synchronization]: JVM-Synchronization : <https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-3.html#jvms-3.14>

[^object-monitor-cpp]: ObjectMonitor.hpp : <http://hg.openjdk.java.net/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/runtime/objectMonitor.hpp#l140>