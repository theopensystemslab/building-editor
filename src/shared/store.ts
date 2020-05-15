import { Howl } from "howler";
import produce from "immer";
import create from "zustand";
import * as undoable from "../utils/undoable";
import grid from "./grid";

const GRID = grid("mm");

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
  editMode: EditMode;
  hangars: undoable.Undoable<Array<Hangar>>;
  grid: {
    properties: {
      color: string;
      dimensions: {
        cellWidth: number;
        cellLength: number;
        numXCells?: number;
        numZCells?: number;
      };
    };
  };
}

export const [useStore, api] = create((set): State & { set: any } => ({
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
      { x: GRID.x, z: GRID.z },
      { x: 0, z: GRID.z },
    ],
  ]),
  set: (fn) => set(produce(fn)),
}));

window["api"] = api;

// rudimentarily save state to localStorage if grid.occupiedCells changes

const popSoundEffect = new Howl({
  src: ["sounds/260614__kwahmah-02__pop.wav"],
});
