import AnalyzerContext from "@/lib/AnalyzerContext"
import { styled } from "@mui/material"
import { Box, Button, TextField, Typography } from "@mui/material"
import { useContext } from "react"

const USB_FILTERS = [
    {
        usbVendorId: 0x239A,
        usbProductId: 0x80CD
    }, {
        usbVendorId: 0x239A,
        usbProductId: 0x00CD
    }
]

const DeviceSettingsTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
}))


const DeviceSettings: React.FC = () => {
    const analyzerContext = useContext(AnalyzerContext)

    const handleSelectDevice = async () => {
        try {
            const port = await navigator.serial.requestPort({
                filters: USB_FILTERS
            })

            analyzerContext.setSerialPort(port)

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Box padding={2}>
            <Typography variant="h5" gutterBottom>Connection Settings</Typography>
            <Button
                variant={analyzerContext.serialPort ? "outlined" : "contained"}
                onClick={handleSelectDevice}
            >
                {analyzerContext.serialPort ? "Change device" : "Select device"}
            </Button>
            <DeviceSettingsTextField
                label="Baud rate"
                value={analyzerContext.baudrate}
                type="number"
                onChange={(e) => analyzerContext.setBaudrate(parseInt(e.target.value))}
            />
            <Button
                variant={analyzerContext.serialPortConnected ? "outlined" : "contained"}
                disabled={!analyzerContext.serialPort || analyzerContext.serialPortLocked}
                onClick={async () => {
                    if (!analyzerContext.serialPortConnected) {
                        await analyzerContext.serialBegin()
                    } else {
                        await analyzerContext.serialClose()
                    }
                }}
            >
                {analyzerContext.serialPortConnected ? "Disconnect" : "Connect"}
            </Button>
        </Box>
    )
}

export default DeviceSettings