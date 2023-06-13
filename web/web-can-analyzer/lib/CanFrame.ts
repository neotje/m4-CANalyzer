export type CanId_t = number

export const CAN_STANDARD_ID_MASK = 0x000007FF
export const CAN_EXTENDED_ID_MASK = 0x1FFFFFFF
export const CAN_EID_LEN = 18
export const CAN_EXTENDED_ID_SID_MASK = (CAN_STANDARD_ID_MASK << CAN_EID_LEN)
export const CAN_EXTENDED_ID_EID_MASK = (CAN_EXTENDED_ID_MASK ^ CAN_EXTENDED_ID_SID_MASK)
export const CAN_SID_EID_TO_UINT = (sid: number, eid: number): CanId_t => ((((sid) << CAN_EID_LEN) | (eid)))

class CanFrame {
    id = 0
    rtr = false
    extended = false
    dlc = 0
    data = new Uint8Array(8)

    get sid() {
        if (this.extended) {
            return (this.id & CAN_EXTENDED_ID_SID_MASK) >> CAN_EID_LEN
        }

        return this.id & CAN_STANDARD_ID_MASK
    }

    set sid(value) {
        if (this.extended) {
            this.id = CAN_SID_EID_TO_UINT(value, this.eid)
        } else {
            this.id = value & CAN_STANDARD_ID_MASK
        }
    }

    get eid() {
        if (this.extended) {
            return this.id & CAN_EXTENDED_ID_EID_MASK
        }

        return 0
    }

    set eid(value) {
        if (this.extended) {
            this.id = CAN_SID_EID_TO_UINT(this.sid, value) & CAN_EXTENDED_ID_MASK
        }
    }
}

export default CanFrame