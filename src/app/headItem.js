
import React from "react";

export default function HeadItem( {title, iconUrl} ) {
    return (
        <>
            <title>{String(title)}</title>
            <link rel="icon" type="image/png" href={iconUrl}/>
        </>
    );
}
