import '../../styles/components.css';

export default function Card({ children, style }){

    return(
        <div className='card' style={style}>
            {children}
        </div>
    )
}


export function CardHead({ title, action }){

    return(

        <div className='card-head'>
            <span className='card-title'>{title}</span>

            {action && <span className='card-action'>{action}</span>}
        </div>
    );
}


export function CardBody({ children, flush = false, style}){

    return(

        <div className= {flush ? 'card-body-flush' : 'card-body'} style={style}>
            {children}
        </div>
    );
}
