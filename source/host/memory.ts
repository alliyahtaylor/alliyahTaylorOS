module TSOS{
    export class Memory {
       private memory;
        constructor(size : number){
            this.memory = new Array(size);
        }

        public init(): void{
            this.memory(256);
            for (var i = 0; i < this.memory.length; i++){
                this.memory.push('00');
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