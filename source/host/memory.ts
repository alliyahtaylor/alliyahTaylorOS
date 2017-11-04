module TSOS{
    export class Memory {
        constructor(public memory = []){}

        public init(): void{
            for (var i = 0; i < 768; i++){
                this.memory.push(0);
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