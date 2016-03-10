"use strict";

import {ISudokuGrid} from "./ISudokuGrid";
import {SudokuGrid} from "./SudokuGrid";
import {ISolver} from "./ISolver";

/**
 * From: https://see.stanford.edu/materials/icspacs106b/H19-RecBacktrackExamples.pdf
 *
 */
export class Solver implements ISolver {

    private grid: ISudokuGrid;

    private recursed: number = 0;
    private looped: number = 0;

    constructor(start: ISudokuGrid) {
        this.grid = start;
    }

    public solve(): boolean {
        this.grid.eliminate();
        return this._partialSolve(0);
    }

    /*
     * Function: _partialSolve
     * -----------------------
     * Takes a partially filled-in grid and attempts to assign values to all
     * unassigned locations in such a way to meet the requirements for sudoku
     * solution (non-duplication across rows, columns, and boxes). The function
     * operates via recursive backtracking: it finds an unassigned location with
     * the grid and then considers all digits from 1 to 9 in a loop. If a digit
     * is found that has no existing conflicts, tentatively assign it and recur
     * to attempt to fill in rest of grid. If this was successful, the puzzle is
     * solved. If not, unmake that decision and try again. If all digits have
     * been examined and none worked out, return false to backtrack to previous
     * decision point.
     */
    private _partialSolve(index: number): boolean {

        ++this.recursed;

        let offset: number = this.grid.getOffset(index);

        if (offset === -1) {
            return true; // success!
        }

        let numbers: number[] = this.grid.getPossibilities(offset);

        let x: number = offset % SudokuGrid.DIMENSION;
        let y: number = Math.floor(offset / SudokuGrid.DIMENSION);
        for (let check of numbers) {
            if (check === undefined) {
                continue;
            }

            ++this.looped;
            if (this._isAvailable(x, y, check)) { // if looks promising,
                this.grid.set(offset, check); // make tentative assignment
                if (this._partialSolve(index + 1)) {
                    return true; // recur, if success, yay!
                }
            }
        }
        this.grid.set(offset, SudokuGrid.UNASSIGNED); // failure, unmake & try again
        return false; // this triggers backtracking
    }

    /*
     * Function: _isAvailable
     * ----------------------
     * Returns a boolean which indicates whether it will be legal to assign
     * number to the given row,column location. As assignment is legal if it that
     * number is not already used in the row, column, or box.
     */
    private _isAvailable(x: number, y: number, check: number): boolean {
        return !this._isUsedInRow(y, check)
            && !this._isUsedInColumn(x, check)
            && !this._isUsedInBox(x - x % SudokuGrid.BOX_DIMENSION, y - y % SudokuGrid.BOX_DIMENSION, check);
    }

    /*
     * Function: _isUsedInRow
     * ----------------------
     * Returns a boolean which indicates whether any assigned entry
     * in the specified row matches the given number.
     */
    private _isUsedInRow(y: number, check: number): boolean {
        let offset: number = y * SudokuGrid.DIMENSION;
        for (let x: number = 0; x < SudokuGrid.WIDTH; ++x) {
            if (this.grid.get(offset++) === check) {
                return true;
            }
        }
        return false;
    }

    /*
     * Function: _isUsedInColumn
     * -------------------------
     * Returns a boolean which indicates whether any assigned entry
     * in the specified column matches the given number.
     */
    private _isUsedInColumn(x: number, check: number): boolean {
        let offset: number = x;
        for (let y: number = 0; y < SudokuGrid.HEIGHT; ++y) {
            if (this.grid.get(offset) === check) {
                return true;
            }
            offset += SudokuGrid.DIMENSION;
        }
        return false;
    }

    /*
     * Function: _isUsedInBox
     * ----------------------
     * Returns a boolean which indicates whether any assigned entry
     * within the specified 3x3 box matches the given number.
     */
    private _isUsedInBox(boxStartX: number, boxStartY: number, check: number): boolean {
        for (let yOffset: number = 0; yOffset < SudokuGrid.BOX_DIMENSION; ++yOffset) {
            let y: number = yOffset + boxStartY;
            let offset: number = boxStartX + y * SudokuGrid.DIMENSION;
            for (let xOffset: number = 0; xOffset < SudokuGrid.BOX_DIMENSION; ++xOffset) {
                if (this.grid.get(offset++) === check) {
                    return true;
                }
            }
        }
        return false;
    }
}
