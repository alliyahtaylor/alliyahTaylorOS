///<reference path="../globals.ts" />
module TSOS {
    export class Memory {
        public memory = [{length: 256}];

        public init(){
            for (let i = 0; i < this.memory.length; i++) {
                this.memory[i] = "00";
            }
        }
    }
}