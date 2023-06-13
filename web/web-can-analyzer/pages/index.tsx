import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import AppDrawer from '@/components/AppDrawer'
import { Box } from '@mui/material'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    return (
        <>
            <Head>
                <title>Feather M4 CAN analyzer</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <Box sx={{
                height: '100vh',
            }}>
                <AppDrawer />
            </Box>

        </>
    )
}
