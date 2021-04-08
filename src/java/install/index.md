---
title: '[Java] Install'
created_at: 2017-08-06 16:34:01
tag: ["Java", "Maven", "Gradle", "Install"]
toc: true
---


# 1 OpenJdk {#openjdk}

下载地址 : 
1. <https://adoptopenjdk.net/upstream.html>
2. <https://www.microsoft.com/openjdk>
3. <https://developers.redhat.com/products/openjdk/download>

```powershell
# 设置环境变量 
Env-SetJavaEnvironmentVariable

# 查看版本信息 
java -v
```

# 2 Maven {#maven}

下载地址 : <https://maven.apache.org/download.cgi>

下载二进制包 : `apache-maven-3.8.1-bin.zip`解压至`d:\_app\_maven\`目录下。 
```powershell
# 设置环境变量
Env-SetMavenEnvironmentVariable

# 查看版本信息
mvn -v

# wrapper
# https://github.com/takari/maven-wrapper
mvn --non-recursive --debug io.takari:maven:wrapper -Dmaven='3.8.1'
```
## 2.1 settings.xml {#settings-xml}

复制`settings.xml`配置文件到`HOME/.m2/`目录。

{{<highlight-file title="~/.m2/setting.xml" path="settings.xml" lang="xml">}}


# 3 Gradle {#3.gradle}

下载地址 : <https://gradle.org/releases/>

下载二进制包 : `gradle-6.7-bin.zip`解压至`d:\_app\_gradle\`目录下。
设置环境变量 : 
```powershell
# 设置环境变量
Env-SetGradleEnvironmentVariable

# 查看版本信息
gradle -v

# wrapper
# https://docs.gradle.org/current/userguide/gradle_wrapper.html
gradle wrapper --gradle-version 6.7 --distribution-type all
```

## 3.1 gradle.properties {#gradle-properties}

复制`gradle.properties`配置文件到`GRADLE_USER_HOME`目录。

{{<highlight-file title="$GRADLE_USER_HOME/gradle.properties" path="gradle.properties" lang="ini">}}


## 3.2 init.gradle {#init-gradle}

复制`init.gradle`配置文件到`GRADLE_USER_HOME`目录。

{{<highlight-file title="$GRADLE_USER_HOME/init.gradle" path="init.gradle" lang="groovy">}}


## 3.3 settings.gradle {#settings.gradle}

复制`settings.gradle`配置文件到`GRADLE_USER_HOME`目录。

{{<highlight-file title="$GRADLE_USER_HOME/settings.gradle" path="settings.gradle" lang="groovy">}}
