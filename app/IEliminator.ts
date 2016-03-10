export interface IEliminator {

    getPossibles(): number[][];
    getPossibilities(offset: number): number[];
    getOffset(index: number): number;

    eliminate(): void;

    buildOffsets(): void;
}
