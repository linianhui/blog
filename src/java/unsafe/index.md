---
title: '[Java] Unsafe类'
created_at: 2020-11-04 19:32:01
tag: ["Java", "Unsafe"]
toc: true
displayed_on_home: true
---

Unsafe类是Java提供一个底层的类型，位于`sun.misc`包中，主要用来提供一些不安全的底层内存操作。

>其内部实现在Jdk中略有差异，比如。Jdk 8[^unsafe-jdk8]和Jdk 15[^unsafe-jdk15]的源码。

# 1 获取Unsafe对象 {#get-unsafe-object}

由于Unsafe在实现上添加了限制（只能由`BootstrapClassLoader`加载的类型来调用，而我们的代码通常都是`AppClassLoader`加载的），所以我们无法直接通过`Unsafe.getUnsafe()`这个静态方法来获取。

```java
@CallerSensitive
public static Unsafe getUnsafe() {
    Class<?> caller = Reflection.getCallerClass();
    if (!VM.isSystemDomainLoader(caller.getClassLoader()))
        throw new SecurityException("Unsafe");
    return theUnsafe;
}

//VM.isSystemDomainLoader
public static boolean isSystemDomainLoader(ClassLoader loader) {
  return loader == null;
}
```

但是可以通过反射绕过去这个限制:

```java
public static Unsafe getUnsafe() throws NoSuchFieldException, IllegalAccessException {
    Field theUnsafeField = Unsafe.class.getDeclaredField("theUnsafe");
    theUnsafeField.setAccessible(true);
    return (Unsafe) theUnsafeField.get(null);
}
```

# 2 Unsafe提供的几种操作

大致分为一下几种。

## 2.1 获取字段偏移量

操作一个对象的某个字段时，偏移量时不可或缺的一个参数。使用它和对象本身来定位指定字段在内存中的位置。

```java
public native long staticFieldOffset(Field f);
public native long objectFieldOffset(Field f);
public native Object staticFieldBase(Field f);
public native int arrayBaseOffset(Class<?> arrayClass);
public native int arrayIndexScale(Class<?> arrayClass)
```

## 2.2 普通读写

一下方法可以直接读取和写入一个对象的字段，即使字段是私有的。当然也包含其他的基础类型`Byte`、`Char`、`Short`、`Float`、`Double`、`Long`、`Object`。

```java
public native int getInt(Object o, long offset);
public native void putInt(Object o, long offset, int x);
```

也可以直接使用脱离对象本身使用内存地址进行读取和写入。

```java
public native int getInt(long address);
public native void putInt(long address, int x);
```

## 2.3 有序写

可以保证写入的有序性，但是无法保证其他线程的可见性。
```java
public native void putOrderedInt(Object o, long offset, int x);
```

## 2.4 volatile读写

使用`volatile`修饰的字段也有专门的方法，可以保证可见性和有序性。

```java
public native int getIntVolatile(Object o, long offset);
public native void putIntVolatile(Object o, long offset, int x);
```

## 2.5 CAS操作

[CAS](../juc/cas.md)的底层实现是完全依赖Unsafe提供的方法的。

有如下三个基础方法。
```java
public final native boolean compareAndSwapObject(Object o, long offset,Object expected, Object x);
public final native boolean compareAndSwapInt(Object o, long offset,int expected,int x);
public final native boolean compareAndSwapLong(Object o, long offset,long expected,long x);
```

[JUC](../juc/)中的原子类，AQS、lock甚至`synchronized`的底层实现，也都依赖于这些基础CAS方法。`ConcurrentHashMap`、`ConcurrentLinkedQueue`等线程安全的容器也都是如此。

除了上面的3个基础方法外，还有一些包装好的方法。

```java
public final int getAndAddInt(Object o, long offset, int delta) {
    int v;
    do {
        v = getIntVolatile(o, offset);
    } while (!compareAndSwapInt(o, offset, v, v + delta));
    return v;
}

public final int getAndSetInt(Object o, long offset, int newValue) {
    int v;
    do {
        v = getIntVolatile(o, offset);
    } while (!compareAndSwapInt(o, offset, v, newValue));
    return v;
}
```

以上读写部分等同于C#的[System.Threading.Interlocked](https://docs.microsoft.com/en-us/dotnet/api/system.threading.interlocked)。

## 2.6 类加载

。。。待续

## 2.7 内存屏障

```java
// 保证在这个屏障之前的所有读操作都已经完成
public native void loadFence();
// 保证在这个屏障之前的所有写操作都已经完成
public native void storeFence();
// 保证在这个屏障之前的所有读写操作都已经完成
public native void fullFence();
```

## 2.8 线程调度

这部分方法类似于C#的[System.Threading.Monitor](https://docs.microsoft.com/en-us/dotnet/api/system.threading.monitor)。

```java
// 挂起线程
public native void park(boolean isAbsolute, long time);
// 唤醒线程
public native void unpark(Object thread);

// synchronized的底层实现基于此，不过目前以及标记为弃用了。
@Deprecated
public native void monitorEnter(Object o);
@Deprecated
public native void monitorExit(Object o);
@Deprecated
public native boolean tryMonitorEnter(Object o);
```

其中`pack`、`uppack`以及是`LockSupport`的基础。而`LockSupport`是`AQS`的基础。`AQS`则是[java.util.concurrent.locks](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/package-summary.html)包的基础抽象类。

`pack`的参数`isAbsolute`为`true`是表示time是绝对时间，单位是`毫秒`。为`false`是表示为相对时间，单位是`纳秒`。比如如下是等价的。

```java
// TIMED_WAITING 相对时间，100毫秒
unsafe.pack(false, 100*1000*1000));
// TIMED_WAITING 绝对时间，100毫秒
unsafe.pack(true, System.currentTimeMillis()+100));

// WAITING 一致阻塞，直到调用unpack
unsafe.pack(false, 0L));
```


# 3 参考资料

Java中的Unsafe ：<https://www.jianshu.com/p/db8dce09232d>

[^unsafe-jdk8]: JDK8中的`sun.misc.Unsafe` : <http://hg.openjdk.java.net/jdk8/jdk8/jdk/file/687fd7c7986d/src/share/classes/sun/misc/Unsafe.java>

[^unsafe-jdk15]: JDK15中的`sun.misc.Unsafe` : <https://github.com/openjdk/jdk15/blob/master/src/jdk.unsupported/share/classes/sun/misc/Unsafe.java>，内部是使用`jdk.internal.misc.Unsafe`:<https://github.com/openjdk/jdk15/blob/master/src/java.base/share/classes/jdk/internal/misc/Unsafe.java>来实现，等同于JDK8。

[^unsafe-cpp]: unsafe.cpp : <https://github.com/openjdk/jdk15/blob/master/src/hotspot/share/prims/unsafe.cpp>