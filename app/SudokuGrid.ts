"use strict";

import {Grid} from "./Grid";
import {ISudokuGrid} from "./ISudokuGrid";

export class SudokuGrid extends Grid implements ISudokuGrid {

    private static _UNASSIGNED: number = 0;
    private static _DIMENSION: number = 9;
    private static _CELL_COUNT: number = SudokuGrid.DIMENSION * SudokuGrid.DIMENSION;
    private static _WIDTH: number = SudokuGrid.DIMENSION;
    private static _HEIGHT: number = SudokuGrid.DIMENSION;
    private static _BOX_DIMENSION: number = 3;

    private _possibles: Array<Array<number>> = [];
    private _offsets: Array<number> = [];

    constructor(initial: Array<number>) {

        super(SudokuGrid.WIDTH, SudokuGrid.HEIGHT, initial);

        let numbers: Array<number> = [];
        for (let i: number = 1; i < (SudokuGrid.DIMENSION + 1); ++i) {
            numbers[i] = i;
        }

        for (let offset: number = 0; offset < SudokuGrid.CELL_COUNT; ++offset) {
            if (this.get(offset) === SudokuGrid.UNASSIGNED) {
                this._possibles[offset] = numbers.slice();
            }
        }
    }

    static get UNASSIGNED(): number {
        return SudokuGrid._UNASSIGNED;
    }

    static get DIMENSION(): number {
        return SudokuGrid._DIMENSION;
    }

    static get CELL_COUNT(): number {
        return SudokuGrid._CELL_COUNT;
    }

    static get WIDTH(): number {
        return SudokuGrid._WIDTH;
    }

    static get HEIGHT(): number {
        return SudokuGrid._HEIGHT;
    }

    static get BOX_DIMENSION(): number {
        return SudokuGrid._BOX_DIMENSION;
    }

    private static count(data: Array<any>): number {
        return data.reduce((count: number) => {
            return ++count;
        });
    }

    private static first(data: Array<any>): any {
        for (let datum of data) {
            if (datum !== undefined) {
                return datum;
            }
        }
        return undefined;
    }

    public getPossibilities(offset: number): Array<number> {
        return this._possibles[offset];
    }

    public getOffset(index: number): number {
        if (index + 1 > this._offsetCount) {
            return -1;
        }
        return this._offsets[index];
    }

    private get _offsetCount(): number {
        return this._offsets.length;
    }

    public eliminate(): void {
        do {
            this._eliminateAssigned();
            this._eliminateDangling();
        } while (this._transferSingularPossibilities());

        this._buildOffsets();
    }

    public toString(): string {
        let output: string = "\n";
        for (let y: number = 0; y < SudokuGrid.HEIGHT; ++y) {
            for (let x: number = 0; x < SudokuGrid.WIDTH; ++x) {
                let content: number = this.get(x, y);
                output += " ";
                if (content === SudokuGrid.UNASSIGNED) {
                    output += "-";
                } else {
                    output += content;
                }
                output += " ";
                if ((x + 1) % SudokuGrid.BOX_DIMENSION === 0 && x + 1 < SudokuGrid.WIDTH) {
                    output += "|";
                }
            }
            if ((y + 1) % SudokuGrid.BOX_DIMENSION === 0 && y + 1 < SudokuGrid.WIDTH) {
                output += "\n --------+---------+--------";
            }
            output += "\n";
        }
        return output;
    }

    private _eliminateDangling(): void {
        this._eliminateRowDangling();
        this._eliminateColumnDangling();
        this._eliminateBoxDangling();
    }

    private _eliminateRowDangling(): void {
        for (let y: number = 0; y < SudokuGrid.HEIGHT; ++y) {
            let offset: number = y * SudokuGrid.DIMENSION;
            let counters: Array<Array<number>> = [];
            for (let x: number = 0; x < SudokuGrid.WIDTH; ++x) {
                this._adjustPossibleCounters(counters, offset++);
            }
            this._transferCountedEliminations(counters);
        }
    }

    private _eliminateColumnDangling(): void {
        for (let x: number = 0; x < SudokuGrid.WIDTH; ++x) {
            let offset: number = x;
            let counters: Array<Array<number>> = [];
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
                let counters: Array<Array<number>> = [];
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

    private _transferCountedEliminations(counters: Array<Array<number>>): void {
        counters.forEach((counter: Array<number>, i: number) => {
            if (counter.length === 1) {
                let cell: number = counter[0];
                delete this._possibles[cell];
                this._possibles[cell] = [i];
            }
        });
    }

    private _adjustPossibleCounters(counters: Array<Array<number>>, offset: number): void {
        let possibles: Array<number> = this._possibles[offset];
        if (possibles !== undefined) {
            possibles.forEach((possible: number) => {
                let counter: Array<number> = counters[possible];
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
                let current: number = this.get(x, y);
                if (current !== SudokuGrid.UNASSIGNED) {
                    this._clearRowPossibles(y, current);
                    this._clearColumnPossibles(x, current);
                    let boxX: number = x - x % SudokuGrid.BOX_DIMENSION;
                    this._clearBoxPossibilities(boxX, boxY, current);
                }
            }
        }
    }

    private _transferSingularPossibilities(): boolean {
        let transfer: boolean = false;
        this._possibles.forEach((possible: Array<number>, offset: number) => {
            let count: number = SudokuGrid.count(possible);
            if (count === 1) {
                let singular: number = SudokuGrid.first(possible);
                this.set(offset, singular);
                delete this._possibles[offset];
                transfer = true;
            }
        });
        return transfer;
    }

    private _clearRowPossibles(y: number, current: number): void {
        let offset: number = y * SudokuGrid.DIMENSION;
        for (let x: number = 0; x < SudokuGrid.WIDTH; ++x) {
            let possibles: Array<number> = this._possibles[offset++];
            if (possibles !== undefined) {
                delete possibles[current];
            }
        }
    }

    private _clearColumnPossibles(x: number, current: number): void {
        let offset: number = x;
        for (let y: number = 0; y < SudokuGrid.HEIGHT; ++y) {
            let possibles: Array<number> = this._possibles[offset];
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
                let possibles: Array<number> = this._possibles[offset++];
                if (possibles !== undefined) {
                    delete possibles[current];
                }
            }
        }
    }

    private _buildOffsets(): void {
        this._possibles.forEach((possible: Array<number>, i: number) => {
            let possibleCount: number = SudokuGrid.count(possible);
            if (possibleCount > 1) {
                this._offsets.push(i);
            }
        });
    };
}
