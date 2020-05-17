import produce from "immer";
import create from "zustand";
import * as undoable from "../utils/undoable";
import grid from "./grid";

const GRID = grid("m");

type Point = { x: number; z: number };

export type Hangar = Point[];

interface Cube {
  x: number;
  z: number;
  wx: number;
  wz: number;
}

export const hangarToCube = (hangar: Hangar): Cube => ({
  x: hangar[0].x,
  z: hangar[0].z,
  wx: Math.abs(hangar[2].x - hangar[0].x),
  wz: Math.abs(hangar[2].z - hangar[0].z),
});

export const cubeToHangar = (cube: Cube): Hangar => [
  { x: cube.x, z: cube.z },
  { x: cube.x + cube.wx, z: cube.z },
  { x: cube.x + cube.wx, z: cube.z + cube.wz },
  { x: cube.x, z: cube.z + cube.wz },
];

export enum EditMode {
  Move = "Move",
  Resize = "Resize",
  Slice = "Slice",
  Insert = "Insert",
}

export interface State {
  user;
  infoVisible: boolean;
  editMode: EditMode;
  hangars: undoable.Undoable<Array<Hangar>>;
  grid: {
    properties: {
      color: string;
      dimensions: {
        cellWidth: number;
        cellLength: number;
      };
    };
  };
}

// Helper to type `setState`-style methods that contain either a new value
// or a function to go from old value to new value.
export type FnOrValue<T> = T | ((prevCubes: T) => T);

export const [useStore, api] = create((set, get) => ({
  user: undefined,
  infoVisible: false,
  grid: {
    properties: {
      color: "lightgray",
      dimensions: {
        cellWidth: GRID.x,
        cellLength: GRID.z,
      },
    },
  },
  editMode: EditMode.Move,
  hangars: undoable.create([
    [
      { x: 0, z: 0 },
      { x: GRID.x, z: 0 },
      { x: GRID.x, z: GRID.z * 4 },
      { x: 0, z: GRID.z * 4 },
    ],
  ]),
  setEditMode: (newEditMode) => set((state) => ({ editMode: newEditMode })),
  setHangars: (fnOrValue: FnOrValue<undoable.Undoable<Array<Cube>>>) =>
    set((state) => ({
      hangars:
        typeof fnOrValue === "function" ? fnOrValue(state.hangars) : fnOrValue,
    })),
  toggleInfoPanel: () => set(() => ({ infoVisible: !get().infoVisible })),
  set: (fn) => set(produce(fn)),
}));

window["api"] = api;
