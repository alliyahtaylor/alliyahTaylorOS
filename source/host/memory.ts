module TSOS{
    export class Memory {
        public memory = [];
        constructor(public size: number){
            this.memory = new Array(size);
            this.init();
        }

        public init(): void{
            for (var i = 0; i < 256; i++){
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