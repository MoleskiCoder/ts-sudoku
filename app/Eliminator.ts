"use strict";

import {ISudokuGrid} from "./ISudokuGrid";
import {SudokuGrid} from "./SudokuGrid";

export class Eliminator {

    private _grid: ISudokuGrid;

    private _possibles: number[][] = [];
    private _offsets: number[] = [];

    constructor(grid: ISudokuGrid) {

        this._grid = grid;

        let numbers: number[] = [];
        for (let i: number = 1; i < (SudokuGrid.DIMENSION + 1); ++i) {
            numbers[i] = i;
        }

        for (let offset: number = 0; offset < SudokuGrid.CELL_COUNT; ++offset) {
            if (this._grid.get(offset) === SudokuGrid.UNASSIGNED) {
                this._possibles[offset] = numbers.slice();
            }
        }
    }

    private get _offsetCount(): number {
        return this._offsets.length;
    }

    public getPossibles(): number[][] {
        return this._possibles;
    }

    public getPossibilities(offset: number): number[] {
        return this._possibles[offset];
    }

    public getOffset(index: number): number {
        if (index + 1 > this._offsetCount) {
            return -1;
        }
        return this._offsets[index];
    }

    public eliminate(): void {
        this._eliminateAssigned();
        this._eliminateDangling();
    }

    public buildOffsets(): void {
        this._possibles.forEach((possible: number[], i: number) => {
            let possibleCount: number = SudokuGrid.count(possible);
            if (possibleCount > 1) {
                this._offsets.push(i);
            }
        });
    }

    private _eliminateDangling(): void {
        this._eliminateRowDangling();
        this._eliminateColumnDangling();
        this._eliminateBoxDangling();
    }

    private _eliminateRowDangling(): void {
        for (let y: number = 0; y < SudokuGrid.HEIGHT; ++y) {
            let offset: number = y * SudokuGrid.DIMENSION;
            let counters: number[][] = [];
            for (let x: number = 0; x < SudokuGrid.WIDTH; ++x) {
                this._adjustPossibleCounters(counters, offset++);
            }
            this._transferCountedEliminations(counters);
        }
    }

    private _eliminateColumnDangling(): void {
        for (let x: number = 0; x < SudokuGrid.WIDTH; ++x) {
            let offset: number = x;
            let counters: number[][] = [];
            for (let y: number = 0; y < SudokuGrid.HEIGHT; ++y) {
                this._adjustPossibleCounters(counters, offset);
                offset += SudokuGrid.DIMENSION;
            }
            this._transferCountedEliminations(counters);
        }
    }

    private _eliminateBoxDangling(): void {
        for (let y: number = 0; y < SudokuGrid.HEIGHT; y += SudokuGrid.BOX_DIMENSION) {
            let boxStartY: number = y - y % SudokuGrid.BOX_DIMENSION;
            for (let x: number = 0; x < SudokuGrid.WIDTH; x += SudokuGrid.BOX_DIMENSION) {
                let counters: number[][] = [];
                let boxStartX: number = x - x % SudokuGrid.BOX_DIMENSION;
                for (let yOffset: number = 0; yOffset < SudokuGrid.BOX_DIMENSION; ++yOffset) {
                    let boxY: number = yOffset + boxStartY;
                    let offset: number = boxStartX + boxY * SudokuGrid.DIMENSION;
                    for (let xOffset: number = 0; xOffset < SudokuGrid.BOX_DIMENSION; ++xOffset) {
                        this._adjustPossibleCounters(counters, offset++);
                    }
                }
                this._transferCountedEliminations(counters);
            }
        }
    }

    private _transferCountedEliminations(counters: number[][]): void {
        counters.forEach((counter: number[], i: number) => {
            if (counter.length === 1) {
                let cell: number = counter[0];
                this._possibles[cell] = [i];
            }
        });
    }

    private _adjustPossibleCounters(counters: number[][], offset: number): void {
        let possibles: number[] = this._possibles[offset];
        if (possibles !== undefined) {
            possibles.forEach((possible: number) => {
                let counter: number[] = counters[possible];
                if (counter === undefined) {
                    counter = [];
                    counters[possible] = counter;
                }
                counter.push(offset);
            });
        }
    }

    private _eliminateAssigned(): void {
        for (let y: number = 0; y < SudokuGrid.HEIGHT; ++y) {
            let boxY: number = y - y % SudokuGrid.BOX_DIMENSION;
            for (let x: number = 0; x < SudokuGrid.WIDTH; ++x) {
                let current: number = this._grid.get(x, y);
                if (current !== SudokuGrid.UNASSIGNED) {
                    this._clearRowPossibles(y, current);
                    this._clearColumnPossibles(x, current);
                    let boxX: number = x - x % SudokuGrid.BOX_DIMENSION;
                    this._clearBoxPossibilities(boxX, boxY, current);
                }
            }
        }
    }

    private _clearRowPossibles(y: number, current: number): void {
        let offset: number = y * SudokuGrid.DIMENSION;
        for (let x: number = 0; x < SudokuGrid.WIDTH; ++x) {
            let possibles: number[] = this._possibles[offset++];
            if (possibles !== undefined) {
                delete possibles[current];
            }
        }
    }

    private _clearColumnPossibles(x: number, current: number): void {
        let offset: number = x;
        for (let y: number = 0; y < SudokuGrid.HEIGHT; ++y) {
            let possibles: number[] = this._possibles[offset];
            if (possibles !== undefined) {
                delete possibles[current];
            }
            offset += SudokuGrid.DIMENSION;
        }
    }

    private _clearBoxPossibilities(boxStartX: number, boxStartY: number, current: number): void {
        for (let yOffset: number = 0; yOffset < SudokuGrid.BOX_DIMENSION; ++yOffset) {
            let y: number = yOffset + boxStartY;
            let offset: number = boxStartX + y * SudokuGrid.DIMENSION;
            for (let xOffset: number = 0; xOffset < SudokuGrid.BOX_DIMENSION; ++xOffset) {
                let possibles: number[] = this._possibles[offset++];
                if (possibles !== undefined) {
                    delete possibles[current];
                }
            }
        }
    }
}
