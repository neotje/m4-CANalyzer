import CanFrame from "./CanFrame";

export const IS_EXTENDED_BIT = 5
export const IS_RTR_BIT = 4
export const DLC_MASK = 0x0F

interface State {
    onByte: (byte: number, controller: TransformStreamDefaultController<CanFrame>) => void
}

interface States {
    [key: string]: State
}

class CanFrameTransformer implements Transformer<Uint8Array, CanFrame> {
    frame = new CanFrame()
    buffer: number[] = []

    controller: TransformStreamDefaultController<CanFrame> | null = null

    #states: States  = {
        EXPECT_FRAME_HEADER: {
            onByte: (byte, controller) => {
                if (byte == 0xAA) {
                    return this.goto("EXPECT_FRAME_TYPE")
                }
            }
        },
        EXPECT_FRAME_TYPE: {
            onByte: (byte, controller) => {
                if (byte == 0xCC) {
                    return this.goto("EXPECT_CAN_FRAME_TYPE")
                }
                
                return this.goto("EXPECT_FRAME_HEADER")
            }
        },
        EXPECT_CAN_FRAME_TYPE: {
            onByte: (byte, controller) => {
                this.frame.extended = ((byte >> IS_EXTENDED_BIT) & 1) == 1
                this.frame.rtr = ((byte >> IS_RTR_BIT) & 1) == 1
                this.frame.dlc = byte & DLC_MASK

                if (this.frame.extended) {
                    return this.goto("EXPECT_CAN_FRAME_EXTENDED_ID")
                }

                return this.goto("EXPECT_CAN_FRAME_STANDARD_ID")
            }
        },
        EXPECT_CAN_FRAME_STANDARD_ID: {
            onByte: (byte, controller) => {
                this.buffer.unshift(byte)

                if (this.buffer.length == 2) {
                    this.frame.id = (this.buffer[0] << 8) | this.buffer[1]

                    return this.goto("EXPECT_CAN_FRAME_DATA")
                }
            }
        },
        EXPECT_CAN_FRAME_EXTENDED_ID: {
            onByte: (byte, controller) => {
                this.buffer.unshift(byte)

                if (this.buffer.length == 4) {
                    this.frame.id = (this.buffer[0] << 24) | (this.buffer[1] << 16) | (this.buffer[2] << 8) | this.buffer[3]

                    return this.goto("EXPECT_CAN_FRAME_DATA")
                }
            }
        },
        EXPECT_CAN_FRAME_DATA: {
            onByte: (byte, controller) => {
                if (this.frame.rtr) {
                    return this.goto("EXPECT_FRAME_FOOTER")
                }

                this.buffer.push(byte)

                if (this.buffer.length == this.frame.dlc) {
                    this.frame.data = new Uint8Array(this.buffer)

                    controller.enqueue(this.frame)
                    this.frame = new CanFrame()

                    return this.goto("EXPECT_FRAME_FOOTER")
                }
            }
        },
        EXPECT_FRAME_FOOTER: {
            onByte: (byte, controller) => {
                if (byte == 0x55) {
                    return this.goto("EXPECT_FRAME_HEADER")
                }
            }
        }
    }

    #state = "EXPECT_FRAME_HEADER"

    goto(state: string) {
        // check if state exists
        if (!this.#states.hasOwnProperty(state)) {
            throw new Error(`State ${state} does not exist.`)
        }

        this.buffer = []
        this.#state = state
    }

    start(controller: TransformStreamDefaultController<CanFrame>) {
        this.controller = controller
    }

    transform(chunk: Uint8Array, controller: TransformStreamDefaultController<CanFrame>) {
        for (const byte of chunk) {
            this.#states[this.#state].onByte(byte, controller)
        }
    }
}

export default CanFrameTransformer