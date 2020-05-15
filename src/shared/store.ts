import { Howl } from "howler";
import produce from "immer";
import { uniq } from "ramda";
import create from "zustand";
import { nextOddInt } from "../utils";
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
  flyoutVisible: boolean;
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
    occupiedCells: Record<
      string,
      {
        module?: string;
        rotation?: number;
      }
    >;
  };
}

/*
 * calculates size of grid so that there is always a 'padding'
 * of a single grid cell surrounding all of the occupied cells
 */
const calcSize = (x, i) => {
  const numbers = uniq(Object.keys(x).map((k) => Number(k.split(",")[i])));
  const largestAbsoluteNumber = Math.max.apply(null, numbers.map(Math.abs));

  return nextOddInt(Math.max(numbers.length, largestAbsoluteNumber * 2) + 2);
};

/*
 * wraps the store, writes static outputs to the store iself if dependencies
 * change, effectively caching the results
 */
const selectorMiddleware = (config) => (set, get, api) =>
  config(
    (args) => {
      const previousState = get().grid.occupiedCells;

      set(args);

      const currentState = get().grid.occupiedCells;

      if (JSON.stringify(previousState) !== JSON.stringify(currentState)) {
        set((state: State) => {
          state.grid.properties.dimensions.numXCells = calcSize(
            currentState,
            0
          );
          state.grid.properties.dimensions.numZCells = calcSize(
            currentState,
            1
          );
        });
      }
    },
    get,
    api
  );

// Helper to type `setState`-style methods that contain either a new value
// or a function to go from old value to new value.
export type FnOrValue<T> = T | ((prevCubes: T) => T);

export const [useStore, api] = create(
  selectorMiddleware((set) => ({
    user: undefined,
    flyoutVisible: true,
    grid: {
      properties: {
        color: "lightgray",
        dimensions: {
          cellWidth: GRID.x,
          cellLength: GRID.z,
        },
      },
      occupiedCells: {},
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
          typeof fnOrValue === "function"
            ? fnOrValue(state.hangars)
            : fnOrValue,
      })),
    set: (fn) => set(produce(fn)),
  }))
);

// set the grid initial grid value AFTER creating the store
// so that the data gets processed by the selector middleware

api.getState().set((state: State) => {
  // try to load existing state from localStorage, otherwise use object below
  state.grid.occupiedCells = JSON?.parse(localStorage.getItem("cache")) || {
    "0,-1": {
      module: "A2_01",
    },
    "0,0": {
      module: "B2_01",
    },
    "0,1": {
      module: "C2_01",
    },
  };
});

window["api"] = api;

// rudimentarily save state to localStorage if grid.occupiedCells changes

const popSoundEffect = new Howl({
  src: ["sounds/260614__kwahmah-02__pop.wav"],
});

api.subscribe(
  (occupiedCells: State) => {
    localStorage.setItem("cache", JSON.stringify(occupiedCells));
    popSoundEffect.play();
  },
  (state) => state.grid.occupiedCells
);
