import { useState } from 'react'
import { FORMATIONS } from '../../data/formations'

const FormationButton = ({ formation, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg font-medium transition-all text-sm
            ${isActive 
                ? 'bg-blue-500 text-white'
                : 'bg-blue-50/50 text-blue-500 hover:bg-blue-100/50'}`}
    >
        {formation}
    </button>
)

export const FormationSelector = ({ onFormationSelect, currentFormation }) => {
    return (
        <div className="mb-4 sm:mb-0">
            <div className="flex flex-wrap gap-1.5">
                {Object.keys(FORMATIONS).map(formation => (
                    <FormationButton
                        key={formation}
                        formation={formation}
                        onClick={() => onFormationSelect(FORMATIONS[formation])}
                        isActive={currentFormation === formation}
                    />
                ))}
            </div>
        </div>
    )
}

export const SaveFormation = ({ players, onSave }) => {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        if (!name) return;
        setSaving(true);
        try {
            await onSave({ name, players });
            setName('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 1000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex gap-2">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Formation name"
                className="flex-1 px-3 py-1.5 text-sm border rounded-lg
                          bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                          border-gray-200 placeholder:text-gray-400"
                disabled={saving}
            />
            <button
                onClick={handleSave}
                disabled={saving || !name}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${success
                        ? 'bg-green-500 text-white shadow-md'
                        : saving || !name
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'}`}
            >
                Save Formation
            </button>
        </div>
    );
};

export const SavedFormations = ({ formations, onLoad }) => {
    if (!formations.length) return null;

    return (
        <div className="mt-3 mb-3 lg:mb-0">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Saved Formations</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {formations.map((formation, index) => (
                    <button
                        key={index}
                        onClick={() => onLoad(formation.players)}
                        className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg
                                  hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium"
                    >
                        {formation.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

const FormationControls = ({ onFormationSelect, currentFormation, players, onSave }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
                <FormationSelector
                    onFormationSelect={onFormationSelect}
                    currentFormation={currentFormation}
                />
                <div className="block sm:hidden">
                    <SaveFormation
                        players={players}
                        onSave={onSave}
                    />
                </div>
            </div>
            <div className="hidden sm:block">
                <SaveFormation
                    players={players}
                    onSave={onSave}
                />
            </div>
        </div>
    );
};

export default FormationControls;