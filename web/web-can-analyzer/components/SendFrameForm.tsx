import AnalyzerContext from "@/lib/AnalyzerContext";
import { Box, Button, FormControl, FormControlLabel, FormGroup, Switch, TextField, Tooltip, Typography, styled } from "@mui/material";
import { useContext, useState } from "react";
import HexField from "./HexField";
import { MdSend } from "react-icons/md";
import CanFrame from "@/lib/CanFrame";

const StyledTextfield = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
}))

const SendFrameForm: React.FC = () => {
    const { sendFrameForm, setSendFrameForm, canAnalyzer } = useContext(AnalyzerContext)

    const isIdValid = () => {
        return sendFrameForm.id < 0 || (sendFrameForm.id > 0x1FFFFFFF && sendFrameForm.extended) || (sendFrameForm.id > 0x7FF && !sendFrameForm.extended)
    }

    const onSendFrame = async () => {
        if (isIdValid() || !canAnalyzer) {
            return
        }

        let frame = new CanFrame()

        frame.id = sendFrameForm.id
        frame.extended = sendFrameForm.extended
        frame.rtr = sendFrameForm.rtr

        // convert hex string to uint8array
        if (sendFrameForm.data.trim() === '') {
            frame.data = new Uint8Array(0)
        } else {
            frame.data = new Uint8Array(sendFrameForm.data.split(' ').map((byte) => parseInt(byte, 16)))
        }
        frame.dlc = frame.data.length

        console.log(frame)

        await canAnalyzer.sendCanFrame(frame)
    }

    return (
        <Box padding={2}>
            <Typography variant="h5" gutterBottom>Send CAN Frame</Typography>
            <FormControl disabled={!canAnalyzer} fullWidth>
                <FormGroup>
                    <FormControlLabel
                        control={<Switch
                            checked={sendFrameForm.extended}
                            onChange={(e) => setSendFrameForm({ ...sendFrameForm, extended: e.target.checked })}
                        />}
                        label="Extended?"
                    />
                </FormGroup>

                <Tooltip title={
                    isIdValid() ? "ID must be between 0 and 536.870.911 for extended frames and between 0 and 2047 for standard frames" : ""
                }>
                    <StyledTextfield
                        variant="outlined"
                        label="id"
                        type="number"
                        value={sendFrameForm.id}
                        onChange={(e) => setSendFrameForm({ ...sendFrameForm, id: parseInt(e.target.value) })}
                        error={isIdValid()}
                        disabled={!canAnalyzer}
                    />
                </Tooltip>

                <FormGroup>
                    <FormControlLabel
                        control={<Switch
                            checked={sendFrameForm.rtr}
                            onChange={(e) => setSendFrameForm({ ...sendFrameForm, rtr: e.target.checked })}
                        />}
                        label="Remote Transmission Request?"
                    />
                </FormGroup>

                {
                    !sendFrameForm.rtr &&
                    <HexField
                        label="data"
                        value={sendFrameForm.data}
                        onChange={(data) => setSendFrameForm({ ...sendFrameForm, data })}
                        max={8}
                        disabled={!canAnalyzer}
                    />
                }
            </FormControl>

            <Button
                variant="contained"
                endIcon={<MdSend />}
                disabled={!canAnalyzer}
                onClick={onSendFrame}
            >
                Send
            </Button>
        </Box>
    )
}

export default SendFrameForm;