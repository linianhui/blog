################################
# powershell prompt functions
################################

function prompt () {
    # hold last exit code
    $OLD_LASTEXITCODE = $LASTEXITCODE
    $OLD_LASTEXITCODE_TIP = $(IF ($OLD_LASTEXITCODE —EQ 0) { "" }ELSE { $OLD_LASTEXITCODE })

    $DateTime = Get-Date -Format 'yy-MM-dd HH:mm:ss'
    $UserPrompt = UI-GetUserPrompt
    $UserPromptPrefix = $UserPrompt.Prefix
    $UserPromptText = $UserPrompt.Text

    Write-Host "`n$UserPromptText $DateTime $OLD_LASTEXITCODE_TIP" -ForegroundColor Gray

    # if working directory is git repository
    if (Get-GitStatus) {

        # get git user.name and user.email
        $GitUser = Git-GetCurrentUser

        # show git user.name and user.email
        Write-Host -NoNewline "$UserPromptPrefix $GitUser :" -ForegroundColor Gray

        # show git status
        Write-VcsStatus

        Write-Host -NoNewline "`n"
    }

    # show current work directory in window title
    $Host.UI.RawUI.WindowTitle = $UserPromptText

    # reset last exit code
    $LASTEXITCODE = $OLD_LASTEXITCODE

    return "$UserPromptPrefix "
}
