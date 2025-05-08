'use client';

import { Suspense } from 'react';
import InnerGamePage from './InnerGamePage'; // 我们新建这个组件

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InnerGamePage />
        </Suspense>
    );
}
