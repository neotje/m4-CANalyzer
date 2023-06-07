#include "serial_parser.h"

parser_state_t state = EXPECT_FRAME_HEADER;
parser_result_t result = {
    .type = FRAME_TYPE_CONFIG,
    .data = {
        .config = {
            .bit_rate = 0
        }
    }
};

uint32_t reverse_bytes(uint32_t bytes)
{
    uint32_t aux = 0;
    uint8_t byte;
    int i;

    for(i = 0; i < 32; i+=8)
    {
        byte = (bytes >> i) & 0xff;
        aux |= byte << (32 - 8 - i);
    }
    return aux;
}

uint16_t reverse_bytes(uint16_t bytes)
{
    uint16_t aux = 0;
    uint8_t byte;
    int i;

    for(i = 0; i < 16; i+=8)
    {
        byte = (bytes >> i) & 0xff;
        aux |= byte << (16 - 8 - i);
    }
    return aux;
}

parser_result_t* serial_parser_stream(Stream& in)
{
    if (!in.available())
        return nullptr;

    //Serial.print("Current state: ");
    //Serial.println(state);

    switch (state) {
    case EXPECT_FRAME_HEADER:
    {
        if (in.read() == FRAME_HEADER)
            state = EXPECT_FRAME_TYPE;
        break;
    }

    case EXPECT_FRAME_TYPE:
    {
        uint8_t frame_type = in.read();

        if (frame_type == CONFIG_TYPE) {
            result.type = FRAME_TYPE_CONFIG;
            state = EXPECT_CONFIG_CAN_BIT_RATE;
        }
        else if (frame_type == CAN_TYPE) {
            result.type = FRAME_TYPE_CAN;
            state = EXPECT_CAN_FRAME_TYPE;
        }
        else {
            state = EXPECT_FRAME_HEADER;
        }

        break;
    }

    case EXPECT_CONFIG_CAN_BIT_RATE:
    {
        in.readBytes((char*)&result.data.config.bit_rate, sizeof(result.data.config.bit_rate));
        result.data.config.bit_rate = reverse_bytes(result.data.config.bit_rate);
        state = EXPECT_CONFIG_CAN_MODE;
        break;
    }

    case EXPECT_CONFIG_CAN_MODE:
    {
        result.data.config.mode = in.read();
        state = EXPECT_FRAME_FOOTER;
        break;
    }

    case EXPECT_CAN_FRAME_TYPE:
    {
        uint8_t frame_type = in.read();

        result.data.can.extended = frame_type & (1 << IS_EXTENDED_BIT);
        result.data.can.rtr = frame_type & (1 << IS_RTR_BIT);
        result.data.can.dlc = frame_type & DLC_MASK;

        if (result.data.can.extended)
            state = EXPECT_CAN_FRAME_EXTENDED_ID;
        else
            state = EXPECT_CAN_FRAME_STANDARD_ID;

        break;
    }

    case EXPECT_CAN_FRAME_STANDARD_ID:
    {
        uint16_t standard_id = 0;
        in.readBytes((char*)&standard_id, sizeof(standard_id));

        standard_id = reverse_bytes(standard_id);

        result.data.can.id = standard_id & CAN_STANDARD_ID_MASK;

        state = EXPECT_CAN_FRAME_DATA;
        break;
    }

    case EXPECT_CAN_FRAME_EXTENDED_ID:
    {
        uint32_t extended_id = 0;
        in.readBytes((char*)&extended_id, sizeof(extended_id));

        extended_id = reverse_bytes(extended_id);

        result.data.can.id = extended_id & CAN_EXTENDED_ID_MASK;

        state = EXPECT_CAN_FRAME_DATA;
        break;
    }

    case EXPECT_CAN_FRAME_DATA:
    {
        if (result.data.can.rtr) {
            state = EXPECT_FRAME_FOOTER;
            break;
        }

        if (result.data.can.data != nullptr) {
            free(result.data.can.data);
            result.data.can.data = nullptr;
        }

        result.data.can.data = (uint8_t*)malloc(result.data.can.dlc);

        in.readBytes((char*)result.data.can.data, result.data.can.dlc);
        state = EXPECT_FRAME_FOOTER;
        break;
    }

    case EXPECT_FRAME_FOOTER:
    {
        if (in.read() == FRAME_FOOTER) {
            state = EXPECT_FRAME_HEADER;
            return &result;
        }
        break;
    }

    default:
        state = EXPECT_FRAME_HEADER;
        break;
    };

    //Serial.print("Next state: ");
    //Serial.println(state);

    return nullptr;
}
