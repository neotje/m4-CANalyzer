import { Box, Grid, IconButton, List, ListItem, Paper, Stack, Tooltip, styled } from '@mui/material';
import { useState } from 'react';
import { MdDeviceHub, MdInfo, MdSend, MdSettingsEthernet } from 'react-icons/md';
import ResizableBox from './ResizableBox';
import DeviceSettings from './DeviceSettings';
import CanSettings from './CanSettings';
import SendFrameForm from './SendFrameForm';
import Information from './Information';

interface IDrawerPage {
    title: string,
    icon: JSX.Element,
    content: JSX.Element,
}

interface IDrawerPages {
    [key: string]: IDrawerPage
}

const AppDrawerList = styled(List)(({ theme }) => ({
    height: '100%',
}))

const AppDrawerContent = styled(Paper)(({ theme }) => ({
    height: '100%',
    resize: 'horizontal',
    zIndex: 99,
}))

interface IAppDrawerItemProps extends IDrawerPage {
    pageKey: string,
    onClick: (key: string) => void,
    selected?: boolean,
}

const AppDrawerItem: React.FC<IAppDrawerItemProps> = ({ title, icon, pageKey, onClick, selected }) => (
    <ListItem>
        <Tooltip title={title} placement='right'>
            <IconButton
                onClick={() => onClick(pageKey)}
                color={selected ? 'primary' : 'default'}
            >
                {icon}
            </IconButton>
        </Tooltip>
    </ListItem>
)

export default function AppDrawer() {
    const DrawerPages: IDrawerPages = {
        "device_settings": {
            title: "Connection settings",
            icon: <MdDeviceHub />,
            content: <DeviceSettings />
        },
        "can_settings": {
            title: "CAN settings",
            icon: <MdSettingsEthernet />,
            content: <CanSettings />
        },
        "send_can": {
            title: "Send CAN frame",
            icon: <MdSend />,
            content: <SendFrameForm />
        },
        "information": {
            title: "Information",
            icon: <MdInfo />,
            content: <Information />
        }
    }

    const [selected, setSelected] = useState<string | undefined>("device_settings")

    const onItemClick = (key: string) => {
        if (key === selected) {
            setSelected(undefined)
        } else {
            setSelected(key)
        }
    }

    return (
        <Stack direction="row" height="100vh">
            <AppDrawerList>
                {
                    Object.keys(DrawerPages).map((key) => <AppDrawerItem
                        key={key}
                        pageKey={key}
                        onClick={onItemClick}
                        selected={key === selected}
                        {...DrawerPages[key]}
                    />)
                }
            </AppDrawerList>

            {
                selected &&
                <AppDrawerContent elevation={2}>
                    <ResizableBox minWidth={300}>
                        {DrawerPages[selected].content}
                    </ResizableBox>
                </AppDrawerContent>
            }

        </Stack>
    )
}