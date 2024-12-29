import { create } from 'zustand'

const useFormationStore = create((set) => ({
  players: [
    { id: 1, position: { x: 50, y: 85 } },  // GK
    { id: 2, position: { x: 20, y: 70 } },  // LB
    { id: 3, position: { x: 40, y: 70 } },  // CB
    { id: 4, position: { x: 60, y: 70 } },  // CB
    { id: 5, position: { x: 80, y: 70 } },  // RB
    { id: 6, position: { x: 30, y: 50 } },  // CM
    { id: 7, position: { x: 70, y: 50 } },  // CM
    { id: 8, position: { x: 50, y: 40 } },  // CAM
    { id: 9, position: { x: 30, y: 20 } },  // LW
    { id: 10, position: { x: 50, y: 25 } }, // ST
    { id: 11, position: { x: 70, y: 20 } }  // RW
  ],
  updatePlayerPosition: (id, position) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, position } : player
      ),
    })),
}))

export default useFormationStore