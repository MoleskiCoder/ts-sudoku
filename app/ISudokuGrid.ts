"use strict";

import {IGrid} from "./IGrid";

export interface ISudokuGrid extends IGrid {

    getPossibilities(offset: number): number[];
    getOffset(index: number): number;
    eliminate(): void;

    toString(): string;
}
