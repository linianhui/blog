# https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/register-argumentcompleter?view=powershell-7.1

Register-ArgumentCompleter -CommandName Directory-To -ParameterName Path -ScriptBlock $__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK
Register-ArgumentCompleter -CommandName VsCode-Open -ParameterName Path -ScriptBlock $__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK
Register-ArgumentCompleter -CommandName Idea-Open -ParameterName Path -ScriptBlock $__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK
Register-ArgumentCompleter -CommandName Gui-OpenExplorer -ParameterName Path -ScriptBlock $__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK