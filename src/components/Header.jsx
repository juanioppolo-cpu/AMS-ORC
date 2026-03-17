import React from 'react';

const Header = ({ title }) => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between sticky top-0 z-40">
            <h1 className="text-lg font-semibold text-primary">{title}</h1>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"></div>
        </header>
    );
};

export default Header;
