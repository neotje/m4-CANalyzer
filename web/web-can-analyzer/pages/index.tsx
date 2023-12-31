import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import AppDrawer from '@/components/AppDrawer'
import { Box, Grid, Stack } from '@mui/material'
import MessageTable from '@/components/MessageTable'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    return (
        <>
            <Head>
                <title>M4-CANalyzer</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <Stack
                sx={{
                    height: '100vh',
                    width: '100vw',
                }}
                direction='row'
            >
                <AppDrawer />
                <MessageTable />
            </Stack>

        </>
    )
}
