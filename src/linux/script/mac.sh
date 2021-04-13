launchctl setenv JAVA_HOME $JAVA_HOME

launchctl setenv M2_HOME $M2_HOME
launchctl setenv MAVEN_HOME $MAVEN_HOME
launchctl setenv MAVEN_OPTS $MAVEN_OPTS

launchctl setenv GRADLE_HOME $GRADLE_HOME
launchctl setenv GRADLE_USER_HOME $GRADLE_USER_HOME

#env | tr '=' ' ' | awk '{print "launchctl setenv " $1 " " $2}' | sh

# https://github.com/ggreer/lscolors
export CLICOLOR=1

# https://github.com/seebi/dircolors-solarized.git

# 'hyper-solarized'

source /usr/local/share/zsh/site-functions/git-completion.bash
