import CanFrame from "./CanFrame";
import CanFrameTransformer, { DLC_MASK, IS_EXTENDED_BIT, IS_RTR_BIT } from "./CanFrameTransformer";


export enum CanMode {
    Normal = 0,
    Loopback = 1,
    Observe = 2,
    SILENT
}

class CanAnalyzer {
    readonly port: SerialPort;
    readonly readable: ReadableStream<CanFrame>;

    private _canTransformer = new CanFrameTransformer()
    private _canStream = new TransformStream<Uint8Array, CanFrame>(this._canTransformer)
    private _streamClosed: Promise<void>

    constructor(port: SerialPort) {
        this.port = port

        if (!this.port.readable) throw new Error("Port is not readable")

        this._streamClosed = this.port.readable.pipeTo(this._canStream.writable)

        this.readable = this._canStream.readable
    }

    async sendConfig(baudRate: number, mode: CanMode) {
        if (!this.port.writable) throw new Error("Port is not writable")

        const writer = this.port.writable.getWriter()

        let data = []

        data.push(0xAA)
        data.push(0xBB)

        data.push((baudRate >> 24) & 0xFF)
        data.push((baudRate >> 16) & 0xFF)
        data.push((baudRate >> 8) & 0xFF)
        data.push(baudRate & 0xFF)

        data.push(mode)

        data.push(0x55)

        console.log(data.map(x => x.toString(16)).join(" "))

        await writer.write(new Uint8Array(data))

        writer.releaseLock()
    }

    async sendCanFrame(frame: CanFrame) {
        if (!this.port.writable) throw new Error("Port is not writable")

        const writer = this.port.writable.getWriter()

        let data = []

        data.push(0xAA)
        data.push(0xCC)

        let frame_type = 0

        if (frame.extended) {
            frame_type |= 1 << IS_EXTENDED_BIT
        }

        if (frame.rtr) {
            frame_type |= 1 << IS_RTR_BIT
        }

        frame_type |= Math.min(frame.dlc, 8) & DLC_MASK

        data.push(frame_type)

        if (frame.extended) {
            data.push((frame.id >> 24) & 0xFF)
            data.push((frame.id >> 16) & 0xFF)
            data.push((frame.id >> 8) & 0xFF)
            data.push(frame.id & 0xFF)
        } else {
            data.push((frame.id >> 8) & 0xFF)
            data.push(frame.id & 0xFF)
        }

        if (!frame.rtr) {
            for (let i = 0; i < frame.dlc; i++) {
                data.push(frame.data[i])
            }
        }

        data.push(0x55)

        console.log(data.map(x => x.toString(16)))

        await writer.write(new Uint8Array(data))

        writer.releaseLock()
    }

    async close() {
        this._canTransformer.controller?.terminate()
        await this._streamClosed.catch(() => { })
    }
}

export default CanAnalyzer