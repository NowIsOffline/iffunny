'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const gameCfg = {
    1: "https://turbowarp.org/965266120/embed",
    2: "/games/tetris"
};

const InnerGamePage = () => {
    const searchParams = useSearchParams();
    const [id, setId] = useState(1);

    useEffect(() => {
        const idFromQuery = searchParams.get('id');
        if (idFromQuery && gameCfg[idFromQuery]) {
            setId(idFromQuery);
        } else {
            setId(1);
        }
    }, [searchParams]);

    return (
        <div className="game-container">
            <iframe
                src={gameCfg[id]}
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '15px' }}
                title={`Game ${id}`}
            />
        </div>
    );
};

export default InnerGamePage;
