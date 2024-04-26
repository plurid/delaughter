import React from 'react';
import { createRoot } from 'react-dom/client';

import CollectionScript from './components/CollectionScript';



const app = document.createElement('div');
document.body.append(app);
const root = createRoot(app);

root.render(
    <React.StrictMode>
        <CollectionScript />
    </React.StrictMode>
);
