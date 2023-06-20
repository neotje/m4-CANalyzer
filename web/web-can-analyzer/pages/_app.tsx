"use strict";

import AnalyzerContext, { defaultAnalyzerContext } from '@/lib/AnalyzerContext'
import CanAnalyzer from '@/lib/CanAnalyzer'
import CanFrame, { ICanFrame } from '@/lib/CanFrame'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useState } from 'react'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'

declare global {
    interface Window {
        dataSample: () => void
    }
}

export default function App({ Component, pageProps }: AppProps) {
    const [serialPort, _setSerialPort] = useState<typeof defaultAnalyzerContext.serialPort>(defaultAnalyzerContext.serialPort)
    const [baudrate, setBaudrate] = useState<number>(defaultAnalyzerContext.baudrate)

    const [serialPortLocked, setSerialPortLocked] = useState<boolean>(defaultAnalyzerContext.serialPortLocked)
    const [serialPortConnected, setSerialPortConnected] = useState<boolean>(defaultAnalyzerContext.serialPortConnected)

    const [canAnalyzer, setCanAnalyzer] = useState<typeof defaultAnalyzerContext.canAnalyzer>(defaultAnalyzerContext.canAnalyzer)

    const [canBitrate, setCanBitrate] = useState<number>(defaultAnalyzerContext.canBitrate)
    const [canMode, setCanMode] = useState<number>(defaultAnalyzerContext.canMode)

    const [sendFrameForm, setSendFrameForm] = useState<typeof defaultAnalyzerContext.sendFrameForm>(defaultAnalyzerContext.sendFrameForm)

    const [canFrames, setCanFrames] = useState<typeof defaultAnalyzerContext.canFrames>(defaultAnalyzerContext.canFrames)

    const [canRead, setCanRead] = useState<Promise<void> | null>(null)

    if (typeof window !== "undefined") {
        window.dataSample = () => {
            let frames: ICanFrame[] = canFrames

            for (let i = 0; i < 10; i++) {
                frames = [...frames, CanFrame.random().toObject()]
            }

            setCanFrames(frames)
        }
    }

    const setSerialPort = (port: SerialPort | null) => {
        if (serialPort) {
            serialPort.close().then(() => {
                _setSerialPort(port)
            }).catch(() => {/* Ignore errors */ })
        } else {
            _setSerialPort(port)
        }
    }

    const readFrames = async (canAnalyzer: CanAnalyzer) => {
        console.log('Start reader...')

        const reader = canAnalyzer.readable.getReader()

        let frames: ICanFrame[] = []

        try {
            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    // Allow the serial port to be closed later.
                    reader.releaseLock()
                    break
                }

                if (value) {
                    frames = [...frames, value.toObject()]

                    setCanFrames(frames)
                }
            }
        } catch (error) {
            
            await serialClose()
        }

        console.log('Stopping reader...')
    }

    const serialBegin = async () => {
        if (!serialPort) {
            return
        }

        serialPort.addEventListener('disconnect', async () => {
            await serialClose()
            enqueueSnackbar(`Lost connection`, {
                variant: 'error',
            })
        })

        setSerialPortLocked(true)

        try {
            await serialPort.open({
                baudRate: baudrate,
            })
            setSerialPortConnected(true)

            const canAnalyzer = new CanAnalyzer(serialPort)
            setCanAnalyzer(canAnalyzer)

            setCanRead(readFrames(canAnalyzer))
        } catch (error) {
            console.error(error)

            enqueueSnackbar(`Could not connect to the serial port.`, {
                variant: 'error',
            })

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

            if (canRead) {
                await canRead
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

    return <SnackbarProvider>
        <AnalyzerContext.Provider value={{
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

            sendFrameForm,
            setSendFrameForm,

            canFrames,
        }}>
            <Component {...pageProps} />
        </AnalyzerContext.Provider>
    </SnackbarProvider>
}
