"use strict";

import {Grid} from "./Grid";
import {ISudokuGrid} from "./ISudokuGrid";
import {IEliminator} from "./IEliminator";
import {Eliminator} from "./Eliminator";

export class SudokuGrid extends Grid implements ISudokuGrid {

    private static _UNASSIGNED: number = 0;
    private static _DIMENSION: number = 9;
    private static _CELL_COUNT: number = SudokuGrid.DIMENSION * SudokuGrid.DIMENSION;
    private static _WIDTH: number = SudokuGrid.DIMENSION;
    private static _HEIGHT: number = SudokuGrid.DIMENSION;
    private static _BOX_DIMENSION: number = 3;

    private _eliminator: IEliminator;

    constructor(initial: number[]) {
        super(SudokuGrid.WIDTH, SudokuGrid.HEIGHT, initial);
        this._eliminator = new Eliminator(this);
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

    public static count(data: any[]): number {
        return data.reduce((count: number) => {
            return ++count;
        });
    }

    public static first(data: any[]): any {
        for (let datum of data) {
            if (datum !== undefined) {
                return datum;
            }
        }
        return undefined;
    }

    public static calculateBoxX(offset: number): number {
        return Grid.calculateDimensionX(offset, SudokuGrid.BOX_DIMENSION);
    }

    public static calculateBoxY(offset: number): number {
        return Grid.calculateDimensionY(offset, SudokuGrid.BOX_DIMENSION);
    }

    public getPossibilities(offset: number): number[] {
        return this._eliminator.getPossibilities(offset);
    }

    public getOffset(index: number): number {
        return this._eliminator.getOffset(index);
    }

    public eliminate(): void {
        do {
            this._eliminator.eliminate();
        } while (this._transferSingularPossibilities());
        this._eliminator.buildOffsets();
        console.log(this._eliminator.toString());
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
                if (SudokuGrid.calculateBoxX(x + 1) === 0 && x + 1 < SudokuGrid.WIDTH) {
                    output += "|";
                }
            }
            if (SudokuGrid.calculateBoxX(y + 1) === 0 && y + 1 < SudokuGrid.WIDTH) {
                output += "\n --------+---------+--------";
            }
            output += "\n";
        }
        return output;
    }

    private _transferSingularPossibilities(): boolean {
        let transfer: boolean = false;
        let possibles: number[][] = this._eliminator.getPossibles();
        possibles.forEach((possible: number[], offset: number) => {
            let count: number = SudokuGrid.count(possible);
            if (count === 1) {
                let singular: number = SudokuGrid.first(possible);
                this.set(offset, singular);
                delete possibles[offset];
                transfer = true;
            }
        });
        return transfer;
    }
}
