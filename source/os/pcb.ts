module TSOS{
    export class Pcb {
        public pID: number;
        public PC: number;
        public Acc: number;
        public Xreg: number;
        public Yreg: number;
        public Zflag: number;

        constructor(){
            this.pID = _PCBArr.length++;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.PC = 0;

        }

    }
}