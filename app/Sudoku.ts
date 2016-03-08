"use strict";

import { SudokuGrid } from "./SudokuGrid";
import { Solver } from "./Solver";
import { ISudokuGrid } from "./ISudokuGrid";
import { ISolver } from "./ISolver";

// http://www.telegraph.co.uk/news/science/science-news/9359579/Worlds-hardest-sudoku-can-you-crack-it.html
let data: number[] = [
    8, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 3, 6, 0, 0, 0, 0, 0,
    0, 7, 0, 0, 9, 0, 2, 0, 0,
    0, 5, 0, 0, 0, 7, 0, 0, 0,
    0, 0, 0, 0, 4, 5, 7, 0, 0,
    0, 0, 0, 1, 0, 0, 0, 3, 0,
    0, 0, 1, 0, 0, 0, 0, 6, 8,
    0, 0, 8, 5, 0, 0, 0, 1, 0,
    0, 9, 0, 0, 0, 0, 4, 0, 0,
];

let puzzle: ISudokuGrid = new SudokuGrid(data);
let solver: ISolver = new Solver(puzzle);

let start: number = Date.now();
let solved: boolean = solver.solve();
let finish: number = Date.now();

if (solved) {

    console.log(puzzle.toString());

    let elapsed: number = finish - start;
    let seconds: number = elapsed / 1000 + (elapsed % 1000) / 1000;

    console.log("Time taken " + seconds + " seconds");
} else {
    console.log("No solution exists");
}
