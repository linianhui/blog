---
title: '[Java] Thread'
created_at: 2020-11-07 19:32:01
tag: ["Java", "Thread"]
toc: true
---

# 1 OS内核态进程

**进程**是OS进行资源分配和调度的最小单元，进程之间互相隔离，这样使得OS可以**并行**运行多个应用程序。`OS:进程=1:N`

遗留问题：这时OS可以并行多个应用程序了，但是应用程序内部则只能串行的运行。

# 2 OS内核态线程

为了解决进程遗留的问题，OS就创造了**线程**，使得一个应用程序内部也可以**并行**，`进程:线程=1:N`。Linux在默认情况下，创建一个线程需要分配8MB的栈内存空间。
```sh
# 查看默认的栈内存大小
ulimit -s

# 输出，8192KB=8MB
8192
```
以及从用户态切换到内核态的切换、16个寄存器、PC、SP...等寄存器的刷新等。

遗留问题：进程和线程的管理调度均有OS负责，这部分操作时在OS的内核态的。所以分配、销毁以及暂停恢复线程就需要用户态和内核态的切换，这部分交互会消耗不少资源，同时线程创建后默认要分配一定的内存空间，这就使得应用程序能创建的线程数量上限受制于OS的内存大小，以及线程过多时，OS在调度上所消耗的资源比重大幅上升。

> JAVA目前支持的线程是1:1映射到OS的线程的，早期JAVA在用户态实现过自己的线程，但是调度管理过于复杂，后来又回归了1:1映射OS的原生线程了。

# 3 应用用户态协程

为了解决线程遗留的问题。故而现在很多编程语言([Go]()、[Java Loom Projec](https://wiki.openjdk.java.net/display/loom/Main))在语言层面实现了协程，由语言的运行时在用户态负责调度管理协程，`线程:协程=1:N`。由于协程的管理调度均在用户态进行管理，故而可以大幅的降低内核态和用户态的切换带来的资源消耗。

创建协程的资源消耗比线程小的多，Go中一个协程消耗`2kB`的内存，以及3个寄存器`PC / SP / DX`足以。


# 4 JAVA的线程

上面说到JAVA的线程是1:1映射到OS的线程的，只是Java的线程默认栈大小为`1MB`。在Java中用[java.lang.Thread](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html)代表一个线程。


## 4.1 创建线程

Thread的几个构造函数均是调用内部的init方法来完成线程对象的创建的。
```java
private void init(
    ThreadGroup g, 
    Runnable target, 
    String name,
    long stackSize, 
    AccessControlContext acc,
    boolean inheritThreadLocals
)
```

1. `g` : 线程组
2. `target` : 待运行的任务
3. `name` : 线程名，有意义的名字便于线上环境分析问题。
4. `stackSize` : 栈大小，默认是0代表不设置，采用1MB默认值。
5. `acc` : 访问控制上下文。
6. `inheritThreadLocals` : 是否继承当前线程的局部变量信息(ThreadLocal)。 


## 4.2 线程的状态

具有6中状态[java.lang.Thread.State](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.State.html):
```java
public enum State {
    /**
      * Thread thread = new Thread(()->{});
      * 仅仅new一个对象时，处于NEW状态。 
      */
    NEW,

    /**
      * thread.start();
      * 调用start后处于RUNNABLE状态。或者
      * {@link Object#notify()}
      * {@link Object#notifyAll()}
      * {@link LookSupport#unpack(Object thread)}
      * {@link Unsafe#unpack(Object thread)}
      * 获取进入了synchronized代码块时。
      */
    RUNNABLE,

    /**
      * 等待进入synchronized代码块时。
      */
    BLOCKED,

    /**
      * 一下方法会使得线程处于等待状态，并且交出CPU。
      * {@link Object#wait()}
      * {@link Thread#join()}
      * {@link LockSupport#park()}
      * {@link Unsafe#park(false,0L)}
      * 直到调用一下方法唤醒:
      * {@link Object#notify()}
      * {@link Object#notifyAll()}
      * {@link LookSupport#unpack(Object thread)}
      * {@link Unsafe#unpack(Object thread)}
      */
    WAITING,

    /**
      * 一下方法会使得线程处于等待指定的时间。
      * {@link Object#wait(long timeout)}
      * {@link Object#wait(long timeout, int nanos)}
      * {@link Thread#join(long millis)}
      * {@link Thread#join(long millis, int nanos)}
      * {@link LockSupport#parkNanos(long nanos)}
      * {@link LockSupport#parkUntil(long deadline)}
      * {@link Thread#sleep(long millis)} 仅交出CPU，不释放锁。
      * {@link Thread#sleep(long millis, int nanos)} 仅交出CPU，不释放锁。
      */
    TIMED_WAITING,

    /**
      * 线程运行完毕
      */
    TERMINATED;
}
```

状态迁移图:

```sh
stateDiagram-v2
    NEW --> RUNNABLE : Thread#start()
    RUNNABLE --> WAITTING : Object#wait()<br/>Thread#join()<br/>LockSupport#park()
    WAITTING --> RUNNABLE : Object#notify()<br/>Object#notifyAll()<br/>LockSupport#unpack(Object thread)
    RUNNABLE --> TIMED_WAITTING : Object#wait(long timeout)<br/>Thread#join(long millis)<br/>Thread#sleep(long millis)<br/>LockSupport#parkNanos(long nanos)<br/>LockSupport#parkUntil(long deadline)
    TIMED_WAITTING --> RUNNABLE : timeout<br/>Object#notify()<br/>Object#notifyAll()<br/>LockSupport#unpack(Object thread)
    RUNNABLE --> BLACKED : 等待进入monitor(synchronized)
    BLACKED --> RUNNABLE : 进入monitor(synchronized)
    RUNNABLE --> TERMINATED : 运行结束<br/>异常
    WAITTING --> TERMINATED : 异常
    TIMED_WAITTING --> TERMINATED : 异常
```

## 4.3 运行线程

可以通过继承Thread或者传递一个Runnable接口的对象来运行一个线程。通常采用传递Runnable接口的方式，这样可以使得任务和线程分离。
然后调用`thread.start()`方法来启动运行一个线程，注意次方法只能调用一次，第二次就会抛出一个`IllegalThreadStateException`的异常(第一次start时会改变线程内部的状态，从而进入RUNNABLE状态，不能回退，start方法内部会检查这个状态)。也不能调用`thread.run()`方法，这样只会直接调用Runnable接口的run方法，相当于在当前线程执行任务。


### 4.3.1 无返回值(Runnable接口)

```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

### 4.3.2 有返回值(Callable Future和FutureTask)

不同于Runnable，Callable会得到一个返回值。
```java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}
```

通过ExecutorService来提交一个Callable。
```java
public interface ExecutorService extends Executor {
    // 其他方法

    // 提交一个有返回值的任务，通过Future获得返回值。
    <T> Future<T> submit(Callable<T> task);
}
```

Future接口的get方法可以获得Callable的返回值，也可以通过它取消任务的执行。

```java
public interface Future<V> {
    boolean cancel(boolean mayInterruptIfRunning);

    boolean isCancelled();

    boolean isDone();

    V get() throws InterruptedException, ExecutionException;

    V get(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException;
}
```

## 4.4 Thread的常用方法

```java
// 开始执行
public synchronized void start();

// 出让CPU，让OS重新调度，当然也有可能又调度到了当前线程。
public static native void yield();

// 使当前线程睡眠指定的时间，不释放锁。
public static native void sleep(long millis) throws InterruptedException;

// 让当前线程处于等待状态，等待调用join的线程执行完毕后再继续，内部是通过Object.wait实现的
public final void join() throws InterruptedException {
    join(0);
}

public final synchronized void join(long millis)
throws InterruptedException {
    long base = System.currentTimeMillis();
    long now = 0;

    if (millis < 0) {
        throw new IllegalArgumentException("timeout value is negative");
    }

    if (millis == 0) {
        while (isAlive()) {
            wait(0);
        }
    } else {
        while (isAlive()) {
            long delay = millis - now;
            if (delay <= 0) {
                break;
            }
            wait(delay);
            now = System.currentTimeMillis() - base;
        }
    }
}

// 获取当前线程
public static native Thread currentThread();
```

## 4.5 线程池

通常来说我们不会直接new一个Thread来使用，而是通过线程池来管理维护一个合适的线程数量，这样可以减少线程创建以及维护的开销。在Java中的线程池的接口是Executor，ThreadPoolExecutor是这个接口的实现类。

```java
public ThreadPoolExecutor(
    int corePoolSize,                  // 核心线程数量
    int maximumPoolSize,               // 最大线程数量
    long keepAliveTime,                // 线程存活时间，当没有任务时，多出核心线程数量的线程可以存活多久。
    TimeUnit unit,                     // 存活时间的单位
    BlockingQueue<Runnable> workQueue, // 任务的阻塞队列
    ThreadFactory threadFactory,       // 创建线程的工厂
    RejectedExecutionHandler handler   // 拒绝策略
)
```

### 4.5.1 BlockingQueue

保存待执行的Runnable对象的队列（线程安全）。常用的方法有如下几个：

```java
public interface BlockingQueue<E> extends Queue<E>{
  // 插入元素 
  // 队列已满时 : 抛出异常IllegalStateException(“Queue full”)
  boolean add(E e);
  // 队列已满时 : 返回false
  boolean offer(E e);
  // 队列已满时 : 一直阻塞到可以插入
  void put(E e) throws InterruptedException;
  // 队列已满时 : 阻塞指定的时间
  boolean offer(E e, long timeout, TimeUnit unit) throws InterruptedException;
 
  // 移除元素
  // 队列为空 : 抛出异常
  E remove();
  // 队列为空 : 返回null
  E poll();
  // 队列为空 : 一直阻塞
  E take() throws InterruptedException;
  // 队列为空 : 阻塞指定的时间
  E poll(long timeout, TimeUnit unit)throws InterruptedException;

  // 检查元素
  // 抛异常
  E element();
  // 返回null
  E peek();
}
```

常用的实现类有：

#### 4.5.1.1 ArrayBlockingQueue

数组实现的有界的固定大小的队列，默认时非空公平锁实现的。
```java
public class ArrayBlockingQueue<E> extends AbstractQueue<E>
        implements BlockingQueue<E>, java.io.Serializable{
  
  public ArrayBlockingQueue(int capacity) {
        this(capacity, false);
  }

  public ArrayBlockingQueue(int capacity, boolean fair) {
      if (capacity <= 0)
          throw new IllegalArgumentException();
      this.items = new Object[capacity];
      lock = new ReentrantLock(fair);
      notEmpty = lock.newCondition();
      notFull =  lock.newCondition();
  }
}
```

#### 4.5.1.2 LinkedBlockingQueue

链表实现的有界的队列，默认队列的大小是Integer.MAX_VALUE。
```java
public class LinkedBlockingDeque<E> extends AbstractQueue<E>
    implements BlockingDeque<E>, java.io.Serializable {
  
  public LinkedBlockingDeque() {
      this(Integer.MAX_VALUE);
  }

  public LinkedBlockingDeque(int capacity) {
      if (capacity <= 0) throw new IllegalArgumentException();
      this.capacity = capacity;
  }
}
```

#### 4.5.1.3 DelayQueue

内部是用PriorityQueued实现的无界队列，没有队列大小限制，插入元素不会阻塞，但是获取元素会被延迟。队列中的元素必须实现`Delayed`接口。

```java
public interface Delayed extends Comparable<Delayed> {
    long getDelay(TimeUnit unit);
}
```

```java
public class DelayQueue<E extends Delayed> extends AbstractQueue<E>
    implements BlockingQueue<E> {

private final transient ReentrantLock lock = new ReentrantLock();
private final PriorityQueue<E> q = new PriorityQueue<E>();

}
```

#### 4.5.1.4 PriorityBlockingQueue

通过Comparator实现的具有优先级的无界队列。默认非公平锁。

```java
public class PriorityBlockingQueue<E> extends AbstractQueue<E>
    implements BlockingQueue<E>, java.io.Serializable {

  public PriorityBlockingQueue(int initialCapacity) {
      this(initialCapacity, null);
  }

  public PriorityBlockingQueue(int initialCapacity,
                                Comparator<? super E> comparator) {
      if (initialCapacity < 1)
          throw new IllegalArgumentException();
      this.lock = new ReentrantLock();
      this.notEmpty = lock.newCondition();
      this.comparator = comparator;
      this.queue = new Object[initialCapacity];
  }
}
```

#### 4.5.1.5 SynchronousQueue

容量为0的队列。每个take必须等待一个put。

### 4.5.2 RejectedExecutionHandler

当线程数量大于最大线程数量时，会触发拒绝策略。jdk默认提供的四种策略如下：

1. ThreadPoolExecutor.AbortPolicy ：默认拒绝处理策略，丢弃任务并抛出RejectedExecutionException异常。
2. ThreadPoolExecutor.DiscardPolicy ：丢弃新来的任务，但是不抛出异常。
3. ThreadPoolExecutor.DiscardOldestPolicy ：丢弃队列头部（最旧的）的任务，然后重新尝试执行程序（如果再次失败，重复此过程）。
4. ThreadPoolExecutor.CallerRunsPolicy ：由调用线程处理该任务。



# 参考资料

1. Go Memory Model : <https://golang.org/ref/mem>
2. 深度剖析Go协程 : <https://studygolang.com/articles/17944>
3. Java Loom Project : <https://wiki.openjdk.java.net/display/loom/Main>
4. 深入浅出Java多线程-线程 : <http://concurrent.redspider.group/article/01/2.html>
5. java.lang.Thread : <https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html>
6. java.lang.Thread.State : <https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.State.html>
