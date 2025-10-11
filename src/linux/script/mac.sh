autoload -Uz compinit && compinit

source $(dirname $0)/a.sh

# https://adoptium.net/temurin/releases?version=11
# tar xvf openjdk.tar.gz ${MY_HOME_APP}/_java11
# export JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8
# /usr/libexec/java_home -v 1.8
export JAVA_8_HOME=${MY_HOME_APP}/_java8/Contents/Home
export JAVA_11_HOME=${MY_HOME_APP}/_java11/Contents/Home
export JAVA_17_HOME=${MY_HOME_APP}/_java17/Contents/Home
export JAVA_21_HOME=${MY_HOME_APP}/_java21/Contents/Home
export JAVA_HOME=$JAVA_8_HOME

launchctl setenv JAVA_HOME $JAVA_HOME

launchctl setenv M2_HOME $M2_HOME
launchctl setenv MAVEN_HOME $MAVEN_HOME
launchctl setenv MAVEN_OPTS $MAVEN_OPTS

launchctl setenv GRADLE_HOME $GRADLE_HOME
launchctl setenv GRADLE_USER_HOME $GRADLE_USER_HOME

# https://github.com/ggreer/lscolors
export CLICOLOR=1

__directory_add_quick_access ${MY_HOME}
__directory_add_quick_access ${MY_HOME_CODE}
__directory_add_quick_access ${MY_HOME}/_github
#__directory_add_to_quick_access ${MY_HOME_APP}

if [ -f "${MY_HOME}/_shell/a.sh" ]; then
  source ${MY_HOME}/_shell/a.sh
fi