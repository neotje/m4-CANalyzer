#pragma once

#include <inttypes.h>

#define CAN_STANDARD_ID_MASK 0x000007FF
#define CAN_EXTENDED_ID_MASK 0x1FFFFFFF
#define CAN_EID_LEN 18
#define CAN_EXTENDED_ID_SID_MASK (CAN_STANDARD_ID_MASK << CAN_EID_LEN)
#define CAN_EXTENDED_ID_EID_MASK (CAN_EXTENDED_ID_MASK ^ CAN_EXTENDED_ID_SID_MASK)
#define CAN_SID_EID_TO_UINT(sid, eid) ((can_id_t)(((sid) << CAN_EID_LEN) | (eid)))

#ifdef __cplusplus
extern "C" {
#endif

typedef uint32_t can_id_t;

typedef struct {
    /*
    * Standard frame id only first 11 bits
    * Extended frame id: 11 MSB bits are the standard id, 18 LSB bits are the extended id bits.
    */
    can_id_t id;
    int rtr;
    int extended;
    uint8_t dlc;
    uint8_t* data;
} can_frame_t;

uint16_t can_get_sid(can_frame_t* frame);

uint32_t can_get_eid(can_frame_t* frame);

#ifdef __cplusplus
}
#endif
