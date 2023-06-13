import { Box, Divider, styled, useTheme } from "@mui/material"
import { useCallback, useRef, useState } from "react"

interface IResizableBoxProps {
    children: React.ReactNode,
    minWidth?: number,
    maxWidth?: number,
}

const VerticalGrabber = styled("div")(({ theme }) => ({
    width: 5,
    height: '100%',
    position: 'absolute',
    cursor: 'ew-resize',
    top: 0,
    right: -2,

    ":hover": {
        backgroundColor: theme.palette.primary.main,
    }
}))

const ResizableBox: React.FC<IResizableBoxProps> = ({ children, minWidth, maxWidth }) => {
    const theme = useTheme()

    const [width, setWidth] = useState<number>(minWidth || 200)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const verticalGrabberRef = useRef<HTMLDivElement>(null)

    const handleMouseDown = () => {
        document.addEventListener("mouseup", handleMouseUp, true);
        document.addEventListener("mousemove", handleMouseMove, true);

        setIsDragging(true);
    }

    const handleMouseUp = () => {
        document.removeEventListener("mouseup", handleMouseUp, true);
        document.removeEventListener("mousemove", handleMouseMove, true);

        setIsDragging(false);
    }

    const handleMouseMove = useCallback(e => {
        if (!verticalGrabberRef.current) return;

        let newWidth = e.clientX - verticalGrabberRef.current.offsetLeft;

        if (minWidth && newWidth < minWidth) newWidth = minWidth;
        if (maxWidth && newWidth > maxWidth) newWidth = maxWidth;

        setWidth(newWidth);
    }, []);

    return (
        <Box
            ref={verticalGrabberRef}
            sx={{
                width: width,
                position: 'relative',
            }}
        >
            {children}
            <VerticalGrabber
                onMouseDown={handleMouseDown}
                sx={{
                    backgroundColor: isDragging ? theme.palette.primary.main : undefined,
                }}
            />
        </Box>
    )
}

export default ResizableBox