// Apps/Portal/Assets/Components/App.tsx
import React, { useState } from 'react';

const App = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="card border-gray-200 shadow-sm">
            <div className="card-header border-0 pt-5">
                <h3 className="card-title flex-col items-start">
                    <span className="card-label text-xl font-bold text-gray-900">Dashboard Speca</span><br/>
                    <span className="mt-1 text-sm font-semibold text-gray-500">Metronic + Tailwind 4 Mode</span>
                </h3>
            </div>
            <div className="card-body">
                <div className="mb-5 rounded-xl bg-gray-100 p-8 text-center dark:bg-neutral-800">
                    <h1 className="text-primary mb-2 text-4xl font-extrabold">{count}</h1>
                    <p className="text-gray-600">Total Interaksi Klien</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="kt-btn btn-primary px-6 py-3 font-bold tracking-wider uppercase"
                        onClick={() => setCount(count + 1)}
                    >
                        Tambah
                    </button>
                    <button
                        className="kt-btn btn-light-danger px-6 py-3 font-bold uppercase"
                        onClick={() => setCount(0)}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;