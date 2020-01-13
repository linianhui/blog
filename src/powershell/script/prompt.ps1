################################
# powershell prompt functions
################################

function prompt () {
    # hold last exit code
    $originalLastExitCode = $LASTEXITCODE

    $UserPrompt = UI-GetUserPrompt
    $UserPromptPrefix = $UserPrompt.Prefix
    $UserPromptText = $UserPrompt.Text

    Write-Host "`n$UserPromptText" -ForegroundColor Gray

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
    $LASTEXITCODE = $originalLastExitCode

    return "$UserPromptPrefix "
}
