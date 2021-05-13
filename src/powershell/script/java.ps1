function Java-Arthas()
{
    # https://arthas.gitee.io/install-detail.html
    Log-Debug "java -jar $ENV:JAVA_HOME\arthas-boot.jar --repo-mirror aliyun --use-http $ARGS"
    java -jar $ENV:JAVA_HOME\arthas-boot.jar --repo-mirror aliyun --use-http $ARGS
}