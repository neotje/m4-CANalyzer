# Feather M4 CAN usb analyzer

Simple usb can analyzer based on Adafruit Feater M4 CAN board. Using a simple uart based protocol.

## Installation

### Adafruit feather M4 CAN

Clone this repo `git clone https://github.com/neotje/m4-CANalyzer.git`

Install [Platformio IDE](https://marketplace.visualstudio.com/items?itemName=platformio.platformio-ide) in vscode.

Open the cloned repo in vscode.

Connect the feather M4 CAN board to your computer.

Press the upload button in vscode.

### Web interface

Available at [m4-canalyzer.neo-web.nl](https://m4-canalyzer.neo-web.nl)

or

```
cd {this repo root}/web/web-can-analyzer

npm install

# build/run for production
npm run build
npm run start

# or run in dev mode
npm run dev
```


## Uart protocol

Global rules:

```abnf
frame = frame-header frame-type frame-data frame-footer

frame-header = %xAA
frame-type = config-type / can-type / error-type
config-type = %xBB
can-type = %xCC
error-type = %xEE

frame-data = config-data / can-data / error-data

frame-footer = %x55
```

### Config frame

example
```abnf
; 500kbit/s, normal mode
AA BB 00 07 A1 20 00 55

; 1Mbit/s, loopback mode
AA BB 00 0F 42 40 01 55
```


```abnf
config-data = can-bit-rate
can-bit-rate = 4OCTET ; 32bit unsigned long
can-mode = 1OCTET ; 0 - normal, 1 - loopback, 2 - observe
```

### CAN message frame

example
```abnf
; Extended id 00 04 00 01, 1 byte data 0xFF
AA CC 21 00 04 00 01 FF 55
```

```abnf
; Standard id 00 12, 4 byte data 0x01 0x02 0x03 0x04
AA CC 04 00 12 01 02 03 04 55
```

```abnf
can-data = can-frame-type can-frame-id can-frame-data

can-frame-type = 2BIT is-extended is-rtr dlc ; 1 Byte
is-extended = BIT ; 1 if extended frame
is-rtr = BIT ; 1 if remote frame
dlc = 4BIT ; 0-8

can-frame-id = standard-id / extended-id
standard-id = 2OCTET ; 11bit unsigned int
extended-id = 4OCTET ; 29bit unsigned int

can-frame-data = 0*8OCTET ; 0-8 bytes
```

### Error frame

```abnf
error-data = error-code
error-code = 1OCTET
; 0 - Starting can failed (probably invalid bit rate)
; 1 - Sending can frame failed (invalid id or data length)
```