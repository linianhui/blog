autoload -Uz compinit && compinit

source $(dirname $0)/a.sh

# https://adoptium.net/temurin/releases?version=11
# tar xvf openjdk.tar.gz /lnh/_app/_java11
# export JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8
# /usr/libexec/java_home -v 1.8
export JAVA_8_HOME=/lnh/_app/_java8
export JAVA_11_HOME=/lnh/_app/_java11
export JAVA_17_HOME=/lnh/_app/_java17
export JAVA_21_HOME=/lnh/_app/_java21
export JAVA_HOME=$JAVA_8_HOME

launchctl setenv JAVA_HOME $JAVA_HOME

launchctl setenv M2_HOME $M2_HOME
launchctl setenv MAVEN_HOME $MAVEN_HOME
launchctl setenv MAVEN_OPTS $MAVEN_OPTS

launchctl setenv GRADLE_HOME $GRADLE_HOME
launchctl setenv GRADLE_USER_HOME $GRADLE_USER_HOME

# https://github.com/ggreer/lscolors
export CLICOLOR=1

__directory_add_quick_access /lnh
__directory_add_quick_access /lnh/_code
__directory_add_quick_access /lnh/_github
#__directory_add_to_quick_access /lnh/_app

if [ -f "/lnh/_shell/a.sh" ]; then
  source /lnh/_shell/a.sh
fi