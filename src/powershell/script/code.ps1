# 代码的根目录
$CODE_PATH = 'd:\.code\';

$CODE_PATH_ALIAS = @{
    ps  = 'd:\.powershell\';
    w   = 'd:\.work\';
    ae  = $CODE_PATH + 'aspnetcore.example';
    ce  = $CODE_PATH + 'cake.example';
    c9d = $CODE_PATH + 'channel9.downloader';
    ces = $CODE_PATH + 'chrome.extensions';
    ct  = $CODE_PATH + 'cnblogs.theme';
    c   = $CODE_PATH + 'code';
    cg  = $CODE_PATH + 'code.guide';
    d   = $CODE_PATH + 'docker';
    gw  = $CODE_PATH + 'git.web';
    hb  = $CODE_PATH + 'http.benchmark';
    di  = $CODE_PATH + 'div';
    b   = $CODE_PATH + 'blog';
    n   = $CODE_PATH + 'networking';
    ns  = $CODE_PATH + 'nuget.server';
    oe  = $CODE_PATH + 'oidc.example';
    se  = $CODE_PATH + 'spring.example';
    je  = $CODE_PATH + 'java.example';
}

function Code-ChangeDirectory ([string] $Alias) {
    $TargetPath = $CODE_PATH

    if ($Alias) {
        $TargetPath= $CODE_PATH_ALIAS[$Alias]
    }

    Log-Debug "cd $TargetPath"
    Set-Location $TargetPath
}

function Code-UseVsCodeOpenDirectory ([string] $Alias) {
    $TargetPath = $CODE_PATH

    if ($Alias) {
        $TargetPath= $CODE_PATH_ALIAS[$Alias]
    }

    Log-Debug "code $TargetPath"
    code $TargetPath
}
