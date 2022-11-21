# https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/register-argumentcompleter?view=powershell-7.1

Register-ArgumentCompleter -CommandName Directory-To -ParameterName Path -ScriptBlock $__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK
Register-ArgumentCompleter -CommandName VsCode-Open -ParameterName Path -ScriptBlock $__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK
Register-ArgumentCompleter -CommandName Idea-Open -ParameterName Path -ScriptBlock $__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK
Register-ArgumentCompleter -CommandName Gui-OpenExplorer -ParameterName Path -ScriptBlock $__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK

Register-ArgumentCompleter -Native -CommandName winget -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)
    [Console]::InputEncoding = [Console]::OutputEncoding = $OutputEncoding = [System.Text.Utf8Encoding]::new()
    $Local:word = $wordToComplete.Replace('"', '""')
    $Local:ast = $commandAst.ToString().Replace('"', '""')
    winget complete --word="$Local:word" --commandline "$Local:ast" --position $cursorPosition | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
    }
}

Register-ArgumentCompleter -Native -CommandName dotnet -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)
    dotnet complete --position $cursorPosition $commandAst.ToString() | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
    }
}

# https://docs.microsoft.com/en-us/powershell/module/psreadline/get-psreadlinekeyhandler?view=powershell-7.1
# Get-PSReadLineKeyHandler