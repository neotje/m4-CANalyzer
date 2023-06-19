import { createContext } from "react";
import CanAnalyzer, { CanMode } from "./CanAnalyzer";
import CanFrame, { ICanFrame } from "./CanFrame";

export interface ISendFrameForm {
    id: number
    extended: boolean
    rtr: boolean
    data: string
}

interface IAnalyzerContext {
    serialPort: SerialPort | null
    setSerialPort: (serialPort: SerialPort) => void

    baudrate: number
    setBaudrate: (baudRate: number) => void

    serialPortLocked: boolean
    serialPortConnected: boolean
    serialBegin: () => Promise<void>
    serialClose: () => Promise<void>

    canAnalyzer: CanAnalyzer | null

    canBitrate: number
    setCanBitrate: (canBitrate: number) => void
    canMode: CanMode
    setCanMode: (canMode: CanMode) => void
    applyCanConfig: () => Promise<void>

    sendFrameForm: ISendFrameForm
    setSendFrameForm: (sendFrameForm: ISendFrameForm) => void

    canFrames: ICanFrame[]
}

export const defaultAnalyzerContext: IAnalyzerContext = {
    serialPort: null,
    setSerialPort: () => { throw new Error("setSerialPort not implemented") },
    baudrate: 2500000,
    setBaudrate: () => { throw new Error("setBaudRate not implemented") },

    serialPortLocked: false,
    serialPortConnected: false,
    serialBegin: () => { throw new Error("serialBegin not implemented") },
    serialClose: () => { throw new Error("serialClose not implemented") },

    canAnalyzer: null,

    canBitrate: 250000,
    setCanBitrate: () => { throw new Error("setCanBitrate not implemented") },
    canMode: CanMode.Normal,
    setCanMode: () => { throw new Error("setCanMode not implemented") },
    applyCanConfig: () => { throw new Error("applyCanConfig not implemented") },

    sendFrameForm: {
        id: 0,
        extended: false,
        rtr: false,
        data: ""
    },
    setSendFrameForm: () => { throw new Error("setSendFrameForm not implemented") },
    canFrames: []
}

const AnalyzerContext = createContext<IAnalyzerContext>(defaultAnalyzerContext)

export default AnalyzerContext