#pragma once

#include <Arduino.h>
#include <CAN.h>
#include <can_util.h>

#define FRAME_HEADER 0xAA
#define CONFIG_TYPE 0xBB
#define CAN_TYPE 0xCC
#define FRAME_FOOTER 0x55

#define IS_EXTENDED_BIT 5
#define IS_RTR_BIT 4
#define DLC_MASK 0x0F

#define NORMAL_MODE 0
#define LOOPBACK_MODE 1
#define OBSERVE_MODE 2

#define STARTING_CAN_ERROR 0
#define SENDING_CAN_FRAME_ERROR 1

typedef enum {
    EXPECT_FRAME_HEADER,
    EXPECT_FRAME_TYPE,
    
    EXPECT_CONFIG_CAN_BIT_RATE,
    EXPECT_CONFIG_CAN_MODE,

    EXPECT_CAN_FRAME_TYPE,
    EXPECT_CAN_FRAME_STANDARD_ID,
    EXPECT_CAN_FRAME_EXTENDED_ID,
    EXPECT_CAN_FRAME_DATA,

    EXPECT_FRAME_FOOTER
} parser_state_t;

typedef enum {
    FRAME_TYPE_CONFIG,
    FRAME_TYPE_CAN,
    FRAME_TYPE_ERROR
} frame_type_t;

typedef struct
{
    uint32_t bit_rate;
    uint8_t mode;
} config_frame_t;

typedef struct
{
    frame_type_t type;
    union {
        config_frame_t config;
        can_frame_t can;
    } data;
} parser_result_t;

parser_result_t *serial_parser_stream(Stream &in);
