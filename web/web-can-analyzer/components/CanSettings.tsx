import AnalyzerContext from "@/lib/AnalyzerContext";
import { CanMode } from "@/lib/CanAnalyzer";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip, Typography, styled } from "@mui/material"
import { useContext } from "react";

const CanSettingsTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
}))

const CanSettings: React.FC = () => {
    const analyzerContext = useContext(AnalyzerContext)

    return (
        <Box padding={2}>
            <Typography variant="h5" gutterBottom>CAN Settings</Typography>

            <CanSettingsTextField
                label="Bitrate"
                value={analyzerContext.canBitrate}
                onChange={(e) => analyzerContext.setCanBitrate(parseInt(e.target.value))}
                type="number"
            />

            <FormControl fullWidth>
                <InputLabel id="can_mod">CAN Mode</InputLabel>
                <Select
                    labelId="can_mod"
                    value={analyzerContext.canMode}
                    onChange={(e) => analyzerContext.setCanMode(e.target.value as CanMode)}
                    label="CAN Mode"
                >
                    <MenuItem value={CanMode.Normal}>Normal</MenuItem>
                    <MenuItem value={CanMode.Loopback}>Loopback</MenuItem>
                    <MenuItem value={CanMode.SILENT}>Silent</MenuItem>
                </Select>
            </FormControl>

            <Tooltip title={!analyzerContext.canAnalyzer ? "Please check your connection settings." : ""}>
                <span>
                    <Button
                        variant="contained"
                        sx={{ marginTop: 2 }}
                        disabled={!analyzerContext.canAnalyzer}
                        onClick={analyzerContext.applyCanConfig}
                    >
                        Apply
                    </Button>
                </span>
            </Tooltip>
        </Box>
    );
}

export default CanSettings;