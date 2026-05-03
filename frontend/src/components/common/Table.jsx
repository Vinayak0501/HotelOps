import '../../styles/components.css'

export default function Table({ columns, data, renderRow }){

    return(

        <div className='table-wrap'>

            <table className='table'>
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key || col.label}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.length === 0 ? (

                        <tr>
                            <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)'}}>
                                No data available
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => renderRow(row, i))
                    )}
                </tbody>
            </table>
        </div>
    )
}