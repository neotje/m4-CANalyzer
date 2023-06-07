#include "can_util.h"

uint16_t can_get_sid(can_frame_t* frame) {
    if (frame->extended) {
        return ((frame->id & CAN_EXTENDED_ID_SID_MASK) >> CAN_EID_LEN) & CAN_STANDARD_ID_MASK;
    }
    else {
        return frame->id & CAN_STANDARD_ID_MASK;
    }
}

uint32_t can_get_eid(can_frame_t* frame) {
    if (frame->extended) {
        return frame->id & CAN_EXTENDED_ID_EID_MASK;
    }
    else {
        return 0;
    }
}