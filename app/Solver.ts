'use strict';

import {SudokuGrid} from "./SudokuGrid";

/**
 * From: https://see.stanford.edu/materials/icspacs106b/H19-RecBacktrackExamples.pdf
 *
 */
export class Solver {

    private grid:SudokuGrid;
    private width:number;
    private height:number;

    constructor(start:SudokuGrid) {
        this.grid = start;
        this.width = this.grid.width;
        this.height = this.grid.height;
    }

    solve() {
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
    private _partialSolve(index:number):boolean {

        let offset = this.grid.getOffset(index);

        if (offset === -1) {
            return true; // success!
        }

        let numbers = this.grid.getPossibilities(offset);

        let x = offset % SudokuGrid.DIMENSION;
        let y = Math.floor(offset / SudokuGrid.DIMENSION);
        for (let number in numbers) {
            if (this._isAvailable(x, y, number)) { // if looks promising,
                this.grid.set(offset, number); // make tentative assignment
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
    _isAvailable(x:number, y:number, number:number):boolean {
        return !this._isUsedInRow(y, number)
            && !this._isUsedInColumn(x, number)
            && !this._isUsedInBox(x - x % SudokuGrid.BOX_DIMENSION, y - y % SudokuGrid.BOX_DIMENSION, number);
    }

    /*
     * Function: _isUsedInRow
     * ----------------------
     * Returns a boolean which indicates whether any assigned entry
     * in the specified row matches the given number.
     */
    _isUsedInRow(y:number, number:number):boolean {
        let offset = y * SudokuGrid.DIMENSION;
        for (let x = 0; x < this.width; ++x) {
            if (this.grid.get(offset++) === number) {
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
    _isUsedInColumn(x:number, number:number):boolean {
        let offset = x;
        for (let y = 0; y < this.height; ++y) {
            if (this.grid.get(offset) === number) {
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
    _isUsedInBox(boxStartX:number, boxStartY:number, number:number):boolean {
        for (let yOffset = 0; yOffset < SudokuGrid.BOX_DIMENSION; ++yOffset) {
            let y = yOffset + boxStartY;
            let offset = boxStartX + y * SudokuGrid.DIMENSION;
            for (let xOffset = 0; xOffset < SudokuGrid.BOX_DIMENSION; ++xOffset) {
                if (this.grid.get(offset++) === number) {
                    return true;
                }
            }
        }
        return false;
    }
}
