'use strict';

import { SudokuGrid } from './SudokuGrid';
import { Solver } from './Solver';

// http://www.telegraph.co.uk/news/science/science-news/9359579/Worlds-hardest-sudoku-can-you-crack-it.html
let data = [
    8, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 3, 6, 0, 0, 0, 0, 0,
    0, 7, 0, 0, 9, 0, 2, 0, 0,
    0, 5, 0, 0, 0, 7, 0, 0, 0,
    0, 0, 0, 0, 4, 5, 7, 0, 0,
    0, 0, 0, 1, 0, 0, 0, 3, 0,
    0, 0, 1, 0, 0, 0, 0, 6, 8,
    0, 0, 8, 5, 0, 0, 0, 1, 0,
    0, 9, 0, 0, 0, 0, 4, 0, 0
];

let puzzle = new SudokuGrid(data);
let solver = new Solver(puzzle);

let start = Date.now();
let solved = solver.solve();
let finish = Date.now();

if (solved) {

    console.log(puzzle.toString());

    let elapsed = finish - start;
    let seconds = elapsed / 1000.0 + (elapsed % 1000) / 1000.0;

    console.log("Time taken " + seconds + " seconds");
}
else
{
    console.log("No solution exists");
}
