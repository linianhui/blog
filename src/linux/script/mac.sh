launchctl setenv JAVA_HOME $JAVA_HOME

launchctl setenv M2_HOME $M2_HOME
launchctl setenv MAVEN_HOME $MAVEN_HOME
launchctl setenv MAVEN_OPTS $MAVEN_OPTS

launchctl setenv GRADLE_HOME $GRADLE_HOME
launchctl setenv GRADLE_USER_HOME $GRADLE_USER_HOME

# https://github.com/ggreer/lscolors
export CLICOLOR=1

source $(dirname $0)/a.sh
if [ -f "/lnh/_shell/a.sh" ]; then
  source /lnh/_shell/a.sh
fi