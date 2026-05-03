// button styles

import { ButtonSpinner } from "./Loader";
import '../../styles/components.css';


export default function Button({ children,
    variant = 'primary',
    size = '',
    loading = false,
    block = false,
    icon = false,
    onClick,
    type = 'button',
    disabled,
    style
}){

    const classes = [
        'btn',
        `btn-${variant}`,
        size && `btn-${size}`,
        block && `btn-block`,
        icon && `btn-icon`
    ].filter(Boolean).join(' ');


    return(
        <button className= {classes}
            onClick={onClick}
            type= {type}
            disabled = { disabled || loading }
            style={style}
        >
            {loading ? <ButtonSpinner />  : children}
        </button>
    )
}