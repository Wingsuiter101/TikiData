export const FORMATIONS = {
    '4-3-3': [
        { id: 1, position: { x: 10, y: 50 } },  // GK
        { id: 2, position: { x: 25, y: 25 } },  // LB
        { id: 3, position: { x: 25, y: 45 } },  // CB
        { id: 4, position: { x: 25, y: 55 } },  // CB
        { id: 5, position: { x: 25, y: 75 } },  // RB
        { id: 6, position: { x: 45, y: 35 } },  // CM
        { id: 7, position: { x: 45, y: 50 } },  // CM
        { id: 8, position: { x: 45, y: 65 } },  // CM
        { id: 9, position: { x: 75, y: 25 } },  // LW
        { id: 10, position: { x: 75, y: 50 } }, // ST
        { id: 11, position: { x: 75, y: 75 } }  // RW
      ],
      '4-4-2': [
        { id: 1, position: { x: 10, y: 50 } },  // GK
        { id: 2, position: { x: 25, y: 25 } },  // LB
        { id: 3, position: { x: 25, y: 45 } },  // CB
        { id: 4, position: { x: 25, y: 55 } },  // CB
        { id: 5, position: { x: 25, y: 75 } },  // RB
        { id: 6, position: { x: 45, y: 25 } },  // LM
        { id: 7, position: { x: 45, y: 45 } },  // CM
        { id: 8, position: { x: 45, y: 55 } },  // CM
        { id: 9, position: { x: 45, y: 75 } },  // RM
        { id: 10, position: { x: 75, y: 40 } }, // ST
        { id: 11, position: { x: 75, y: 60 } }  // ST
      ],
      '3-5-2': [
        { id: 1, position: { x: 10, y: 50 } },  // GK
        { id: 2, position: { x: 25, y: 35 } },  // CB
        { id: 3, position: { x: 25, y: 50 } },  // CB
        { id: 4, position: { x: 25, y: 65 } },  // CB
        { id: 5, position: { x: 45, y: 20 } },  // LWB
        { id: 6, position: { x: 45, y: 35 } },  // CM
        { id: 7, position: { x: 45, y: 50 } },  // CM
        { id: 8, position: { x: 45, y: 65 } },  // CM
        { id: 9, position: { x: 45, y: 80 } },  // RWB
        { id: 10, position: { x: 75, y: 40 } }, // ST
        { id: 11, position: { x: 75, y: 60 } }  // ST
      ],
      '4-2-3-1': [
        { id: 1, position: { x: 10, y: 50 } },  // GK
        { id: 2, position: { x: 25, y: 25 } },  // LB
        { id: 3, position: { x: 25, y: 45 } },  // CB
        { id: 4, position: { x: 25, y: 55 } },  // CB
        { id: 5, position: { x: 25, y: 75 } },  // RB
        { id: 6, position: { x: 40, y: 45 } },  // CDM
        { id: 7, position: { x: 40, y: 55 } },  // CDM
        { id: 8, position: { x: 60, y: 50 } },  // CAM
        { id: 9, position: { x: 60, y: 25 } },  // LW
        { id: 10, position: { x: 75, y: 50 } }, // ST
        { id: 11, position: { x: 60, y: 75 } }  // RW
      ],
      '3-4-3': [
        { id: 1, position: { x: 10, y: 50 } },  // GK
        { id: 2, position: { x: 25, y: 35 } },  // CB
        { id: 3, position: { x: 25, y: 50 } },  // CB
        { id: 4, position: { x: 25, y: 65 } },  // CB
        { id: 5, position: { x: 45, y: 25 } },  // LM
        { id: 6, position: { x: 45, y: 45 } },  // CM
        { id: 7, position: { x: 45, y: 55 } },  // CM
        { id: 8, position: { x: 45, y: 75 } },  // RM
        { id: 9, position: { x: 75, y: 25 } },  // LW
        { id: 10, position: { x: 75, y: 50 } }, // ST
        { id: 11, position: { x: 75, y: 75 } }  // RW
      ],
      '5-3-2': [
        { id: 1, position: { x: 10, y: 50 } },  // GK
        { id: 2, position: { x: 25, y: 20 } },  // LWB
        { id: 3, position: { x: 25, y: 35 } },  // CB
        { id: 4, position: { x: 25, y: 50 } },  // CB
        { id: 5, position: { x: 25, y: 65 } },  // CB
        { id: 6, position: { x: 25, y: 80 } },  // RWB
        { id: 7, position: { x: 45, y: 35 } },  // CM
        { id: 8, position: { x: 45, y: 50 } },  // CM
        { id: 9, position: { x: 45, y: 65 } },  // CM
        { id: 10, position: { x: 75, y: 40 } }, // ST
        { id: 11, position: { x: 75, y: 60 } }  // ST
      ]
  }
  
  export const DEFAULT_FORMATION = FORMATIONS['4-3-3']