# nRF UART echo based on Bleno
 
Bleno https://github.com/sandeepmistry/bleno

https://github.com/NordicSemiconductor/Android-nRF-UART

## Prerequistes

See Bleno page

## usage

#### Ubuntu : 15.10

First disabled bluetooth bluez

```
$ sudo systemctl stop bluetooth
```

Then power up bluetooth adapter
```
$ sudo hciconfig hci0 up
```

A last start Node App
```
$ sudo node nRF-UART-echo.js
