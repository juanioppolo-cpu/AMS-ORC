import React from 'react';

export default function PlaceholderPage({ title }) {
    return (
        <div className="p-8 text-center text-slate-500">
            <div className="text-4xl mb-4 opacity-20">🚧</div>
            <h2 className="text-xl font-bold text-slate-400 mb-2">{title}</h2>
            <p className="text-sm border-b border-slate-200 inline-block pb-1">Work in Progress</p>
        </div>
    );
}
