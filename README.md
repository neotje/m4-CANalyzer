# Feather M4 CAN usb analyzer

Simple usb can analyzer based on Adafruit Feater M4 CAN board. Using a simple uart based protocol.

## Uart protocol

Global rules:

```abnf
frame = frame_header frame_data frame_footer

frame_header = %xAA frame_type
frame_type = config_type / can_type
config_type = %xBB
can_type = %xCC

frame_data = config_data / can_data

frame_footer = %x55
```

### Config frame

```abnf
config_data = can_bit_rate
can_bit_rate = 4OCTET ; 32bit unsigned long
```

### CAN message frame

```abnf
can_data = can_frame_type can_frame_id can_frame_data

can_frame_type = 2BIT is_extended is_rtr dlc
is_extended = BIT ; 1 if extended frame
is_rtr = BIT ; 1 if remote frame
dlc = 4BIT ; 0-8

can_frame_id = standard_id / extended_id
standard_id = 2OCTET ; 11bit unsigned int
extended_id = 4OCTET ; 29bit unsigned int

can_frame_data = 0*8OCTET ; 0-8 bytes
```