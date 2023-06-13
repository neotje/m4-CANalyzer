# Feather M4 CAN usb analyzer

Simple usb can analyzer based on Adafruit Feater M4 CAN board. Using a simple uart based protocol.

## Uart protocol

Global rules:

```abnf
frame = frame_header frame_type frame_data frame_footer

frame_header = %xAA
frame_type = config_type / can_type / error_type
config_type = %xBB
can_type = %xCC
error_type = %xEE

frame_data = config_data / can_data / error_data

frame_footer = %x55
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
config_data = can_bit_rate
can_bit_rate = 4OCTET ; 32bit unsigned long
can_mode = 1OCTET ; 0 - normal, 1 - loopback, 2 - observe
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
can_data = can_frame_type can_frame_id can_frame_data

can_frame_type = 2BIT is_extended is_rtr dlc ; 1 Byte
is_extended = BIT ; 1 if extended frame
is_rtr = BIT ; 1 if remote frame
dlc = 4BIT ; 0-8

can_frame_id = standard_id / extended_id
standard_id = 2OCTET ; 11bit unsigned int
extended_id = 4OCTET ; 29bit unsigned int

can_frame_data = 0*8OCTET ; 0-8 bytes
```

### Error frame

```abnf
error_data = error_code
error_code = 1OCTET
; 0 - Starting can failed (probably invalid bit rate)
; 1 - Sending can frame failed (invalid id or data length)
```