import { Box, IconButton, List, ListItem, Paper, Stack, Tooltip, styled } from '@mui/material';
import { useState } from 'react';
import { MdDeviceHub, MdSend, MdSettingsEthernet } from 'react-icons/md';
import ResizableBox from './ResizableBox';
import DeviceSettings from './DeviceSettings';
import CanSettings from './CanSettings';

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
    width: '100%',
    height: '100%',
    resize: 'horizontal',
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
            content: <></>
        },
    }

    const [selected, setSelected] = useState<string | undefined>("device_settings")

    const onItemClick = (key: string) => {
        console.log(key)
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
                selected && <ResizableBox minWidth={300}>
                    <AppDrawerContent elevation={2}>
                        {DrawerPages[selected].content}
                    </AppDrawerContent>
                </ResizableBox>
            }

        </Stack>
    )
}