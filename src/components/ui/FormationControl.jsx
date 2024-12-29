import { useState } from 'react'
import { FORMATIONS } from '../../data/formations'

const FormationButton = ({ formation, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-all
      ${isActive 
        ? 'bg-blue-500 text-white shadow-lg' 
        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
  >
    {formation}
  </button>
)

export const FormationSelector = ({ onFormationSelect, currentFormation }) => {
  return (
    <div className="flex gap-3 mb-4">
      {Object.keys(FORMATIONS).map(formation => (
        <FormationButton
          key={formation}
          formation={formation}
          onClick={() => onFormationSelect(FORMATIONS[formation])}
          isActive={currentFormation === formation}
        />
      ))}
    </div>
  )
}

export const SaveFormation = ({ players, onSave }) => {
  const [name, setName] = useState('')

  const handleSave = () => {
    if (!name) return
    onSave({ name, players })
    setName('')
  }

  return (
    <div className="flex gap-2 mb-6">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Formation name"
        className="px-4 py-2 border rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSave}
        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                 transition-colors font-medium shadow-lg"
      >
        Save Formation
      </button>
    </div>
  )
}

export const SavedFormations = ({ formations, onLoad }) => {
  if (!formations.length) return null

  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Saved Formations</h3>
      <div className="flex gap-2 flex-wrap">
        {formations.map((formation, index) => (
          <button
            key={index}
            onClick={() => onLoad(formation.players)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 
                     transition-colors font-medium"
          >
            {formation.name}
          </button>
        ))}
      </div>
    </div>
  )
}