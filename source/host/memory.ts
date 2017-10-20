module TSOS{
    export class Memory {
        public memory = [];
        constructor(public size: number){
            this.memory = new Array(size);
        }

        public init(): void{
            for (var i = 0; i < this.memory.length; i++){
                this.memory[i] = '00';
            }
        }
        public setOp(loc, code){
            this.memory[loc] = code;
        }

        public getOp(loc){
            return this.memory[loc];
        }

    }
}