function Os-Reboot-Bios(){
    Log-Debug "shutdown /r /fw /t 0"
    shutdown /r /fw /t 0
}