function WLAN-Export {
    Log-Debug "netsh wlan export profile key=clear"
    netsh wlan export profile key=clear
}