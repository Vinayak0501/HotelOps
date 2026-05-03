// loader components --> page loader, inlineLoader, buttonspinner

import '../../styles/components.css';


export function PageLoader(){

    return(

        <div className='loader-page'>
            <div className='spinner spinner-lg'/>
        </div>

    );
}


export function InlineLoader(){

    return(

        <div className='loader-inline'>
            <div className='spinner spinner-md'/>
        </div>
    );

}

export function ButtonSpinner(){

    return <div className='spinner spinner-sm' style={ { borderTopColor: 'currentColor'} }/>;

}