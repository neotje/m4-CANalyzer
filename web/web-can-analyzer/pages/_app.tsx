import AnalyzerContext, { defaultAnalyzerContext } from '@/lib/AnalyzerContext'
import CanAnalyzer from '@/lib/CanAnalyzer'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
    const [serialPort, _setSerialPort] = useState<typeof defaultAnalyzerContext.serialPort>(defaultAnalyzerContext.serialPort)
    const [baudrate, setBaudrate] = useState<number>(defaultAnalyzerContext.baudrate)

    const [serialPortLocked, setSerialPortLocked] = useState<boolean>(defaultAnalyzerContext.serialPortLocked)
    const [serialPortConnected, setSerialPortConnected] = useState<boolean>(defaultAnalyzerContext.serialPortConnected)

    const [canAnalyzer, setCanAnalyzer] = useState<typeof defaultAnalyzerContext.canAnalyzer>(defaultAnalyzerContext.canAnalyzer)

    const [canBitrate, setCanBitrate] = useState<number>(defaultAnalyzerContext.canBitrate)
    const [canMode, setCanMode] = useState<number>(defaultAnalyzerContext.canMode)

    const setSerialPort = (port: SerialPort | null) => {
        if (serialPort) {
            serialPort.close().then(() => {
                _setSerialPort(port)
            })
        } else {
            _setSerialPort(port)
        }
    }

    const serialBegin = async () => {
        if (!serialPort) {
            return
        }

        setSerialPortLocked(true)

        try {
            await serialPort.open({
                baudRate: baudrate,
            })
            setSerialPortConnected(true)

            setCanAnalyzer(new CanAnalyzer(serialPort))
        } catch (error) {
            console.error(error)
            setSerialPortConnected(false)
            setCanAnalyzer(null)
        }
        setSerialPortLocked(false)
    }

    const serialClose = async () => {
        if (!serialPort) {
            return
        }

        setSerialPortLocked(true)

        try {           
            if (canAnalyzer) {
                await canAnalyzer.close()
            }

            setCanAnalyzer(null)

            await serialPort.close()
            setSerialPortConnected(false)
        } catch (error) {
            console.error(error)
        }
        setSerialPortLocked(false)
        setCanAnalyzer(null)
    }

    const applyCanConfig = async () => {
        if (!canAnalyzer) {
            return
        }

        await canAnalyzer.sendConfig(canBitrate, canMode)
    }

    return <AnalyzerContext.Provider value={{
        serialPort,
        setSerialPort,
        baudrate,
        setBaudrate,

        serialPortLocked,
        serialPortConnected,
        serialBegin,
        serialClose,

        canAnalyzer,

        canBitrate,
        setCanBitrate,
        canMode,
        setCanMode,
        applyCanConfig,
    }}>
        <Component {...pageProps} />
    </AnalyzerContext.Provider>
}
