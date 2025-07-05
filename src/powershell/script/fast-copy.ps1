################################
# FastCopy env functions
################################

function PS-Fast-Copy() {
    param($source, $target)
    $fcpPath = 'c:\_fast-copy\fastcopy.exe';
    $option = '/cmd=diff /open_window /estimate /balloon /error_stop=FALSE /speed=full /stream /acl';
    $commonExclude='\$RECYCLE.BIN\;\System Volume Information\;\Recovery\;';
    $exclude = "/exclude='\_app2\;\_cache\;\_code\;\_data\;\_github\;\_lang\;\_vhd\;\_video2\;$commonExclude'";
    $command = "$fcpPath $option $exclude `"$source`" /to=`"$target`""
    Log-Debug $command
    Invoke-Expression $command
}

function PS-Fast-Copy-Driver {
    param($driver, $targetDir)
    PS-Fast-Copy -source "${driver}:\" -target "y:\${targetDir}\"
}

function PS-Fast-Copy-Home {
    PS-Fast-Copy-Driver -driver d -targetDir _home
}

function PS-Fast-Copy-Blob {
    PS-Fast-Copy-Driver -driver e -targetDir _blob
}

function PS-Fast-Copy-Mirror {
    PS-Fast-Copy-Driver -driver f -targetDir _mirror
}

function PS-Fast-Copy-Media {
    PS-Fast-Copy-Driver -driver g -targetDir _media
}


function PS-Fast-Copy-All {
    PS-Fast-Copy-Home
    PS-Fast-Copy-Blob
    PS-Fast-Copy-Mirror
    PS-Fast-Copy-Media
}
