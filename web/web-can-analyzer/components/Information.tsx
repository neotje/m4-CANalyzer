import { Box, Link, List, ListItem, ListItemIcon, Typography } from "@mui/material"
import { MdBugReport, MdNewReleases } from "react-icons/md"
import { FaGithub } from "react-icons/fa"

const Information: React.FC = () => {
    return <Box padding={2}>
        <Typography variant="h5" gutterBottom>FAQ</Typography>

        <Typography variant="h6" gutterBottom>What is this?</Typography>
        <Typography variant="body1" gutterBottom>
            This is a CAN analyzer for the <Link target="_blank" rel="noopener" href="https://learn.adafruit.com/adafruit-feather-m4-can-express">
            adafruit feather M4 CAN express</Link> board. 
            It allows you to send and receive CAN frames.
        </Typography>

        <Typography variant="h6" gutterBottom>Installation?</Typography>
        <Typography variant="body1" gutterBottom>
            For further instructions, please see the README.md on github.
        </Typography>

        <Typography variant="h6" gutterBottom>Links</Typography>
        <List>
            <ListItem>
                <ListItemIcon><FaGithub /></ListItemIcon>
                <Typography variant="body1">
                    <Link target="_blank" rel="noopener" href="https://github.com/neotje/m4-CANalyzer">Source</Link>
                </Typography>
            </ListItem>
            <ListItem>
                <ListItemIcon><MdBugReport /></ListItemIcon>
                <Typography variant="body1">
                    <Link target="_blank" rel="noopener" href="https://github.com/neotje/m4-CANalyzer/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=">Bug report</Link>
                </Typography>
            </ListItem>

            <ListItem>
                <ListItemIcon><MdNewReleases /></ListItemIcon>
                <Typography variant="body1">
                    <Link target="_blank" rel="noopener" href="https://github.com/neotje/m4-CANalyzer/issues/new?assignees=&labels=&projects=&template=feature_request.md&title=">Feature request</Link>
                </Typography>
            </ListItem>
        </List>

        <Typography variant="body2" gutterBottom>
            Created by <Link target="_blank" rel="noopener" href="https://neo-web.nl">neotje</Link>
        </Typography>
    </Box>
}

export default Information