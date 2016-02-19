'use strict';

export interface IGrid {
    set(first:number, second:number, third?:number):void;
    get(first:number, second?:number):number;
}