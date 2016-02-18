'use strict';

import {Grid} from "./Grid";
import {ISudokuGrid} from "./ISudokuGrid";

export class SudokuGrid extends Grid implements ISudokuGrid {

    private static _UNASSIGNED: number = 0;
    private static _DIMENSION: number = 9;
    private static _CELL_COUNT: number = SudokuGrid._DIMENSION * SudokuGrid._DIMENSION;
    private static _WIDTH: number = SudokuGrid._DIMENSION;
    private static _HEIGHT: number = SudokuGrid._DIMENSION;
    private static _BOX_DIMENSION: number = 3;

    private _possibles: Array<Array<number>> = [];
    private _offsets: Array<number> = [];

    constructor(initial:Array<number>) {

        super(SudokuGrid._WIDTH, SudokuGrid._HEIGHT, initial);

        let numbers = [];
        for (let i = 1; i < (SudokuGrid.DIMENSION + 1); ++i) {
            numbers[i] = i;
        }

        for (let offset = 0; offset < SudokuGrid.CELL_COUNT; ++offset) {
            if (this.get(offset) === SudokuGrid.UNASSIGNED) {
                this._possibles[offset] = numbers.slice(0);
            }
        }
    }

    static get UNASSIGNED():number {
        return SudokuGrid._UNASSIGNED;
    }

    static get DIMENSION():number {
        return SudokuGrid._DIMENSION;
    }

    static get CELL_COUNT():number {
        return SudokuGrid._CELL_COUNT;
    }

    static get WIDTH():number {
        return SudokuGrid._WIDTH;
    }

    static get HEIGHT():number {
        return SudokuGrid._HEIGHT;
    }

    static get BOX_DIMENSION():number {
        return SudokuGrid._BOX_DIMENSION;
    }

    getPossibilities(offset:number):Array<number> {
        return this._possibles[offset];
    }

    getOffset(index:number):number {
        if (index + 1 > this._offsetCount) {
            return -1;
        }
        return this._offsets[index];
    }

    private get _offsetCount():number {
        return this._offsets.length;
    }

    public  eliminate():void {
        do {
            this._eliminateAssigned();
            this._eliminateDangling();
        } while (this._transferSingularPossibilities());

        for (let i = 0; i < SudokuGrid.CELL_COUNT; ++i) {
            let possible = this._possibles[i];
            if (possible !== undefined) {
                let possibleCount = SudokuGrid.count(possible);
                if (possibleCount > 1) {
                    this._offsets.push(i);
                }
            }
        }
    }

    private _eliminateDangling():void {
        this._eliminateRowDangling();
        this._eliminateColumnDangling();
        this._eliminateBoxDangling();
    }

    private _eliminateRowDangling():void {
        for (let y = 0; y < SudokuGrid.HEIGHT; ++y) {
            let offset = y * SudokuGrid.DIMENSION;
            let counters = [];
            for (let x = 0; x < SudokuGrid.WIDTH; ++x) {
                this._adjustPossibleCounters(counters, offset++);
            }
            this._transferCountedEliminations(counters);
        }
    }

    private _eliminateColumnDangling():void {
        for (let x = 0; x < SudokuGrid.WIDTH; ++x) {
            let offset = x;
            let counters = [];
            for (let y = 0; y < SudokuGrid.HEIGHT; ++y) {
                this._adjustPossibleCounters(counters, offset);
                offset += SudokuGrid.DIMENSION;
            }
            this._transferCountedEliminations(counters);
        }
    }

    private _eliminateBoxDangling():void {
        for (let y = 0; y < SudokuGrid.HEIGHT; y += SudokuGrid.BOX_DIMENSION) {
            let boxStartY = y - y % SudokuGrid.BOX_DIMENSION;
            for (let x = 0; x < SudokuGrid.WIDTH; x += SudokuGrid.BOX_DIMENSION) {
                let counters = [];
                let boxStartX = x - x % SudokuGrid.BOX_DIMENSION;
                for (let yOffset = 0; yOffset < SudokuGrid.BOX_DIMENSION; ++yOffset) {
                    let boxY = yOffset + boxStartY;
                    let offset = boxStartX + boxY * SudokuGrid.DIMENSION;
                    for (let xOffset = 0; xOffset < SudokuGrid.BOX_DIMENSION; ++xOffset) {
                        this._adjustPossibleCounters(counters, offset++);
                    }
                }
                this._transferCountedEliminations(counters);
            }
        }
    }

    private _transferCountedEliminations(counters:Array<Array<number>>):void {
        for (let i = 1; i < (SudokuGrid.DIMENSION + 1); ++i) {
            let counter = counters[i];
            if (counter !== undefined) {
                if (counter.length == 1) {
                    let cell = counter[0];
                    delete this._possibles[cell];
                    this._possibles[cell] = [ i ];
                }
            }
        }
    }

    private _adjustPossibleCounters(counters:Array<Array<number>>, offset:number):void {
        let possibles = this._possibles[offset];
        if (possibles !== undefined) {
            for (let possible in possibles) {
                let counter = counters[possible];
                if (counter === undefined) {
                    counter = [];
                    counters[possible] = counter;
                }
                counter.push(offset);
            }
        }
    }

    private _eliminateAssigned():void {
        for (let y = 0; y < SudokuGrid.HEIGHT; ++y) {
            let boxY = y - y % SudokuGrid.BOX_DIMENSION;
            for (let x = 0; x < SudokuGrid.WIDTH; ++x) {
                let current = this.get(x, y);
                if (current !== SudokuGrid.UNASSIGNED) {
                    this._clearRowPossibles(y, current);
                    this._clearColumnPossibles(x, current);
                    let boxX = x - x % SudokuGrid.BOX_DIMENSION;
                    this._clearBoxPossibilities(boxX, boxY, current);
                }
            }
        }
    }

    private _transferSingularPossibilities():boolean {
        let transfer = false;
        for (let offset = 0; offset < SudokuGrid.CELL_COUNT; ++offset) {
            let possible = this._possibles[offset];
            if (possible !== undefined) {
                let count = SudokuGrid.count(possible);
                if (count === 1) {
                    let singular = SudokuGrid.first(possible);
                    this.set(offset, singular);
                    delete this._possibles[offset];
                    transfer = true;
                }
            }
        }
        return transfer;
    }

    private _clearRowPossibles(y:number, current:number):void {
        let offset = y * SudokuGrid.DIMENSION;
        for (let x = 0; x < SudokuGrid.WIDTH; ++x) {
            let possibles = this._possibles[offset++];
            if (possibles !== undefined) {
                delete possibles[current];
            }
        }
    }

    private _clearColumnPossibles(x:number, current:number):void {
        let offset = x;
        for (let y = 0; y < SudokuGrid.HEIGHT; ++y) {
            let possibles = this._possibles[offset];
            if (possibles !== undefined) {
                delete possibles[current];
            }
            offset += SudokuGrid.DIMENSION;
        }
    }

    private _clearBoxPossibilities(boxStartX:number, boxStartY:number, current:number):void {
        for (let yOffset = 0; yOffset < SudokuGrid.BOX_DIMENSION; ++yOffset) {
            let y = yOffset + boxStartY;
            let offset = boxStartX + y * SudokuGrid.DIMENSION;
            for (let xOffset = 0; xOffset < SudokuGrid.BOX_DIMENSION; ++xOffset) {
                let possibles = this._possibles[offset++];
                if (possibles !== undefined) {
                    delete possibles[current];
                }
            }
        }
    }

    private static count(data:Array<any>):number {
        let count = 0;
        for (let datum in data) {
            ++count;
        }
        return count
    }

    private static first(data:Array<any>):any {
        let count = data.length;
        for (let i = 0; i < count; ++i) {
            let element = data[i];
            if (element !== undefined) {
                return element;
            }
        }
        return null;
    }

    toString():string {
        let output = '\n';
        let height = this.height;
        for (let y = 0; y < height; ++y) {
            let width = this.width;
            for (let x = 0; x < width; ++x) {
                let number = this.get(x, y);
                output += ' ';
                if (number === SudokuGrid.UNASSIGNED) {
                    output += '-';
                } else {
                    output += number;
                }
                output += ' ';
                if ((x + 1) % SudokuGrid.BOX_DIMENSION === 0 && x + 1 < width) {
                    output += '|';
                }
            }
            if ((y + 1) % SudokuGrid.BOX_DIMENSION === 0 && y + 1 < width) {
                output += "\n --------+---------+--------";
            }
            output += '\n';
        }
        return output;
    }
}
