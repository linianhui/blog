################################
# powershell prompt functions
################################

function prompt () {
    # hold last exit code
    $OLD_LASTEXITCODE = $LASTEXITCODE

    $Now = [System.DateTimeOffset]::Now
    $CurrentYearLastDay = New-Object -TypeName System.DateOnly -ArgumentList ($Now.Year, 12, 31)
    $DateTime = $Now.ToString('yy-MM-dd HH:mm:ss K')
    $DayOfWeek = [System.Int32]$Now.DayOfWeek
    $Week = $DayOfWeek.Equals(0)?7:$DayOfWeek
    $DayOfYear = $Now.DayOfYear
    $WeekOfYear = [System.Math]::Round(($DayOfYear + 7) / 7)
    $ResidueWeekOfYear = [System.Math]::Round(($CurrentYearLastDay.DayOfYear - $DayOfYear) / 7)
    $DayOfNewYear = $CurrentYearLastDay.DayOfYear - $DayOfYear
    $UnixTimeMilliseconds = $Now.ToUnixTimeMilliseconds()
    $UserPrompt = UI-GetUserPrompt
    $UserPromptPrefix = $UserPrompt.Prefix
    $UserPromptText = $UserPrompt.Text

    Write-Host -NoNewline "`n$UserPromptText $DateTime $UnixTimeMilliseconds w$Week-$WeekOfYear-$ResidueWeekOfYear d$DayOfYear-$DayOfNewYear" -ForegroundColor Gray
    if ($OLD_LASTEXITCODE -gt 0) {
        Write-Host -NoNewline " $OLD_LASTEXITCODE" -ForegroundColor Red
    }

    # if working directory is git repository
    if (Get-GitStatus) {

        # get git user.name and user.email
        $GitUser = Git-GetCurrentUser

        # show git user.name and user.email
        Write-Host -NoNewline "`n$UserPromptPrefix $GitUser :" -ForegroundColor Gray

        # show git status
        Write-Host -NoNewline (Write-VcsStatus)
    }

    Write-Host

    # show current work directory in window title
    $Host.UI.RawUI.WindowTitle = $UserPromptText

    # reset last exit code
    $LASTEXITCODE = $OLD_LASTEXITCODE

    return "$UserPromptPrefix "
}
