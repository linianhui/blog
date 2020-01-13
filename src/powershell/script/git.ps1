################################
# git functions
################################

# import posh-git module
function Git-ImportPoshGit () {
    Import-Module posh-git
}

# install posh-git module
function Git-InstallPoshGit () {
    Install-Module posh-git
}

# recurse git pull rebase
function Git-Pull-Rebase-Recurse () {
    Get-ChildItem -Attributes Directory -Path (Get-Location) | ForEach-Object {
        $Path = $_.FullName.ToLower()
        Log-Debug "`ncd $Path"
        Set-Location $Path

        Log-Debug 'git remote -v'
        git remote -v

        Log-Debug 'git symbolic-ref HEAD'
        git symbolic-ref HEAD
        
        Log-Debug "git pull --rebase"
        git pull --rebase
        
        Set-Location -Path ..
    }
}


function Git-Warn-GC () {
    Log-Debug "git reflog expire --expire=now --all"
    git warn-expire-reflog
    Log-Debug "git gc --prune=now --aggressive"
    git warn-gc-now
    Log-Debug "git count-objects -v -H"
    git size
}

function Git-Warn-GC-Recurse () {
    Get-ChildItem -Attributes Directory -Path (Get-Location) | ForEach-Object {
        $Path = $_.FullName.ToLower()
        Log-Debug "`ncd $Path"
        Set-Location $Path
        Git-Warn-GC
        Set-Location -Path ..
    }
}

function Git-Size-Recurse () {
    Get-ChildItem -Attributes Directory -Path (Get-Location) | ForEach-Object {
        $Path = $_.FullName.ToLower()
        Log-Debug "`ngit -C '$Path' count-objects -v -H"
        git -C "$Path" size
    }
}

function script:Git-GetAllObjects () {
    $gitObjects = git rev-list --objects --all | git cat-file --batch-check='%(objecttype)|%(objectname)|%(objectsize)|%(rest)'
    return $gitObjects
}

function script:Git-ConvertToPSObject ($object) {
    $row = $object.Split('|')

    $gitObject = New-Object PSObject -Property @{
        type = $row[0];
        sha  = $row[1];
        size = [int]($row[2]);
        path = $row[3];
    }

    return $gitObject
}

function script:Git-GetAllBlobObjects () {
    $gitBlobObjects = @()
    Git-GetAllObjects | Foreach-Object {
        if ($_.StartsWith('blob')) {
            $gitBlobObjects += (Git-ConvertToPSObject $_)
        }
    }
    return $gitBlobObjects
}


function Git-GetBigFiles([int]$top = 20) {
    $begin = Get-Date
    Log-Debug "begin..." $begin

    Git-GetAllBlobObjects | 
    Sort-Object size -Descending | 
    Select-Object -First $top | 
    Format-Table -Property sha, @{Label = "size"; Expression = { ($_.size / 1MB).ToString(('0.000')) + 'MB' } }, path -Wrap

    $end = Get-Date
    Log-Debug "end..." $end
    Log-Debug "elapsed times" ($end - $begin)
}

function Git-SetGlobalAlias () {

    # checkout
    git config --global alias.co checkout

    # commit
    git config --global alias.ci commit
    git config --global alias.alc 'commit --amend --no-edit'

    # status
    git config --global alias.st 'status --short --branch'

    # branch
    git config --global alias.br branch

    # pull
    git config --global alias.pr 'pull --rebase'

    # merge
    git config --global alias.mnf 'merge --no-ff'

    # diff
    git config --global alias.d diff
    git config --global alias.dt difftool

    # cherry-pick
    git config --global alias.cp cherry-pick

    # log
    git config --global alias.last 'log -1'
    git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

    # count-objects
    git config --global alias.size 'count-objects -v -H'

    # reflog
    git config --global alias.rl "reflog --format='%cd %h %gs' --date=format:'%Y-%m-%d %H:%M:%S'"
    
    # gc 
    git config --global alias.warn-expire-reflog "reflog expire --expire=now --all"
    git config --global alias.warn-gc-now "gc --prune=now --aggressive"

    # chmod +/- x
    git config --global alias.chmod644 "update-index --chmod=-x"
    git config --global alias.chmod755 "update-index --chmod=+x"

    # head
    git config --global alias.head 'symbolic-ref HEAD'
}

# set global config
function Git-SetGlobalConfig () {

    # gui
    git config --global gui.encoding 'utf-8'
    
    # i18n
    git config --global i18n.commitencoding 'utf-8'
    git config --global core.quotepath false
    
    # editor
    git config --global core.editor "code -w"
    git config --global core.autocrlf false
    git config --global core.safecrlf true
    git config --global core.filemode false

    # color
    git config --global color.ui true
    
    # branch pager
    git config --global pager.branch false
}

# set git global user
function Git-SetGlobalUser (
    [string] $UserName = $(throw "UserName is null!"), 
    [string] $UserEmail = $(throw "UserEmail is null!")
) {

    git config --global user.name $UserName
    git config --global user.email $UserEmail
}

# get git user
function Git-GetCurrentUser () {

    $UserName = git config user.name
    $UserEmail = git config user.email
    return "$UserName@<$UserEmail>"
}

# git get config
function Git-GetConfig ([string]$Name) {
    if ($Name) {
        $Values = git config --get-all $Name
        $LocalValues = git config --get-all --local $Name
        $GlobalValues = git config --get-all --global $Name
        $SystemValues = git config --get-all --system $Name

        Write-Host "name   : $Name" -ForegroundColor Green
        Write-Host "value  : $Values" -ForegroundColor Green
        Write-Host "local  : $LocalValues" -ForegroundColor Green
        Write-Host "global : $GlobalValues" -ForegroundColor Green
        Write-Host "system : $SystemValues" -ForegroundColor Green
    }
    else {
        git config --list | Sort-Object
    }
}

function Git-Proxy(
    [switch]$set = $False,
    [switch]$get = $True,
    [switch]$unset = $False
) {
    if ($set) {
        git config --global http.proxy 'socks5://127.0.0.1:10001'
        git config --global https.proxy 'socks5://127.0.0.1:10001'
    }

    if ($unset) {
        git config --global --unset http.proxy
        git config --global --unset https.proxy
    }
    
    if ($get) {
        git config --global --get http.proxy
        git config --global --get https.proxy
    }
}
