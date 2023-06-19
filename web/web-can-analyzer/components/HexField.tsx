import { TextField, styled } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";

interface IHexFieldProps {
    value?: string;
    onChange?: (value: string) => void;
    label?: ReactNode;
    max?: number;
    disabled?: boolean;
}

const HexTextField = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
}))

const HexField: React.FC<IHexFieldProps> = (props) => {
    const [value, setValue] = useState(props.value ?? "");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = event.target.value;
        
        // newValue can only contain hex characters and spaces
        if (!/^[0-9a-fA-F ]*$/.test(newValue)) {
            newValue = value;
        }

        // Remove spaces
        newValue = newValue.replace(/ /g, "");

        // Add spaces every 2 characters
        newValue = newValue.replace(/(.{2})/g, "$1 ");

        // Remove trailing space
        newValue = newValue.trim();

        // cap max paires
        if (props.max && newValue.length > props.max * 3 - 1) {
            newValue = newValue.substring(0, props.max * 3 - 1);
        }

        if (props.onChange) {
            props.onChange(newValue);
        }

        setValue(newValue);
    };

    return (
        <HexTextField
            label={props.label}
            value={value}
            onChange={handleChange}
            helperText={props.max ? `${Math.ceil(value.length / 3)} / ${props.max}` : undefined}
            disabled={props.disabled}
        />
    );
}

export default HexField;