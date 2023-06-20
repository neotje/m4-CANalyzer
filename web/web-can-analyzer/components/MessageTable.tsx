import AnalyzerContext from "@/lib/AnalyzerContext";
import { Box, Checkbox, FormControlLabel, MenuItem, Switch, Tooltip } from "@mui/material";
import { createContext, useContext, useMemo, useState } from "react";
import { MRT_Cell, MaterialReactTable } from 'material-react-table';
import { type MRT_ColumnDef } from 'material-react-table';
import { ICanFrame } from "@/lib/CanFrame";

interface IMessageTableContext {
    idHexMode: boolean
    setIdHexMode: (hexMode: boolean) => void

    dataHexMode: boolean
    setDataHexMode: (dataHexMode: boolean) => void
}

const MessageTableContext = createContext<IMessageTableContext>({
    idHexMode: false,
    setIdHexMode: () => { },

    dataHexMode: false,
    setDataHexMode: () => { }
})

const IdCell: React.FC<{ cell: MRT_Cell<ICanFrame> }> = ({ cell }) => {
    const { idHexMode: hexMode } = useContext(MessageTableContext)

    const cellText = useMemo<string>(() => {
        if (hexMode) {
            return '0x' + cell.getValue<number>()?.toString(16).padStart(8, '0')
        }

        return cell.getValue<number>()?.toString(10)
    }, [cell, hexMode])
    const [tooltipTitle, setTooltipTitle] = useState<string>(cell.row.original.extended ? "Extended frame" : "Standard frame")

    const onClickHandler = async () => {
        await navigator.clipboard.writeText(cellText)
        setTooltipTitle("Copied!")
    }

    return <Tooltip
        title={tooltipTitle}
        disableInteractive
        onClose={() => setTooltipTitle(cell.row.original.extended ? "Extended frame" : "Standard frame")}
    >
        <Box
            component={'span'}
            sx={(theme) => ({
                backgroundColor: cell.row.original.extended ? theme.palette.primary.main : theme.palette.secondary.main,
                borderRadius: '4px',
                color: theme.palette.getContrastText(cell.row.original.extended ? theme.palette.primary.main : theme.palette.secondary.main),
                p: '0.25rem',
                cursor: 'pointer'
            })}
            onClick={onClickHandler}
        >
            {cellText}
        </Box>
    </Tooltip>
}

const DataCell: React.FC<{ cell: MRT_Cell<ICanFrame> }> = ({ cell }) => {
    const { dataHexMode: hexMode } = useContext(MessageTableContext)
    const [tooltipTitle, setTooltipTitle] = useState<string>("")

    const cellText = useMemo<string>(() => {
        if (cell.getValue<number[]>()?.length === 0) {
            return ""
        }

        if (hexMode) {
            let hex: string[] = []

            for (let i = 0; i < cell.getValue<number[]>()?.length; i++) {
                hex.push(cell.getValue<number[]>()?.[i].toString(16).padStart(2, '0'))
            }

            return '0x' + hex.join(' 0x')
        }

        return cell.getValue<number[]>()?.join(' ')
    }, [cell, hexMode])

    const onClickHandler = async () => {
        setTooltipTitle("Copied!")
        await navigator.clipboard.writeText(cellText)
    }

    return <Tooltip
        title={tooltipTitle}
        onClose={() => setTooltipTitle("")}
    >
        <Box
            component={'span'}
            sx={(theme) => ({
                cursor: 'pointer'
            })}
            onClick={onClickHandler}
        >
            {cellText}
        </Box>
    </Tooltip>
}

const RTRCell: React.FC<{ cell: MRT_Cell<ICanFrame> }> = ({ cell }) => {
    const rtr = cell.getValue<boolean>()

    return <Checkbox checked={rtr} disabled />
}

const IdHexModeSwitch: React.FC = () => {
    const { idHexMode: hexMode, setIdHexMode: setHexMode } = useContext(MessageTableContext)

    return <FormControlLabel
        control={<Switch
            checked={hexMode}
            onChange={(e) => setHexMode(e.target.checked)}
        />}
        label="Hex mode"
    />
}

const DataHexModeSwitch: React.FC = () => {
    const { dataHexMode: hexMode, setDataHexMode: setHexMode } = useContext(MessageTableContext)

    return <FormControlLabel
        control={<Switch
            checked={hexMode}
            onChange={(e) => setHexMode(e.target.checked)}
        />}
        label="Hex mode"
    />
}

const IdColumnActions: MRT_ColumnDef<ICanFrame>['renderColumnActionsMenuItems'] = ({ internalColumnMenuItems }) => {
    return [
        ...internalColumnMenuItems,
        <MenuItem key="id_hex_mode">
            <IdHexModeSwitch />
        </MenuItem>
    ]
}

const DataColumnActions: MRT_ColumnDef<ICanFrame>['renderColumnActionsMenuItems'] = ({ internalColumnMenuItems }) => {
    return [
        ...internalColumnMenuItems,
        <MenuItem key="data_hex_mode">
            <DataHexModeSwitch />
        </MenuItem>
    ]
}

const MessageTable: React.FC = () => {
    const { canFrames } = useContext(AnalyzerContext)

    const [hexMode, setHexMode] = useState<boolean>(false)
    const [dataHexMode, setDataHexMode] = useState<boolean>(false)

    const columns = useMemo<MRT_ColumnDef<ICanFrame>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            Cell: IdCell,
            renderColumnActionsMenuItems: IdColumnActions
        },
        {
            accessorFn: (row) => {
                const date = new Date(row.timestamp)
                return date.toLocaleTimeString()
            },
            header: 'Timestamp',
        },
        {
            accessorKey: 'data',
            header: 'Data',
            Cell: DataCell,
            renderColumnActionsMenuItems: DataColumnActions,
        },
        {
            accessorKey: 'dlc',
            header: 'DLC',
        },
        {
            accessorKey: 'rtr',
            header: 'RTR',
            Cell: RTRCell
        }
    ], [])

    return (
        <MessageTableContext.Provider value={{
            idHexMode: hexMode,
            setIdHexMode: setHexMode,
            dataHexMode,
            setDataHexMode
        }}>
            <Box
                className='ag-theme-material'
                sx={{
                    height: '100%',
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'auto'
                }}
            >
                <MaterialReactTable
                    columns={columns}
                    data={canFrames}
                    enableRowSelection={false}
                    enableColumnOrdering
                    enableGlobalFilter={false}
                    muiTableContainerProps={{ sx: { height: 'calc(100% - 7rem)' } }}
                    muiTablePaperProps={{ sx: { height: '100%' } }}
                />
            </Box>
        </MessageTableContext.Provider>
    )
}

export default MessageTable;