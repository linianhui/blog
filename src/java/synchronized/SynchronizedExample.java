import java.io.File;

public class SynchronizedExample {

  public void instanceSynchronizedStatementMethod(Object syncObject) {
    synchronized (syncObject) {
      instanceMethod();
    }
  }

  public synchronized void synchronizedInstanceMethod() {
    instanceMethod();
  }

  public void instanceMethod() {
  }

  public static synchronized void synchronizedStaticMethod() {
    staticMethod();
  }

  public static void staticMethod() {
  }
}
