"use strict";

export interface IGrid {
    set(first: number, second: number, third?: number): void;
    get(first: number, second?: number): number;

    calculateX(offset: number): number;
    calculateY(offset: number): number;
}
