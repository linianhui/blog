function WLAN-Export {
    Console-Debug "netsh wlan export profile key=clear"
    netsh wlan export profile key=clear
}