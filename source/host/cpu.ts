///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public currPCB: TSOS.Pcb = null,
                    public isExecuting: boolean = false,
                    public opCode: string = ' ') {

        }

        public init(): void {
            //there was stuff in here, but it ended up breaking everything
            //so don't do that
            }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            switch (this.opCode) {
                case "A9": //Load the accumulator with a constant
                    this.loadAccCon();
                    break;
                case "AD": //Load the accumulator from memory
                    this.loadAccMem();
                    break;
                case "8D": //Store the accumulator in memory
                    this.storeAccMem();
                    break;
                case "6D": //Add with carry
                    this.addWithCarry();
                    break;
                case "A2": // Load the X reg with a constant
                    this.loadXCon();
                    break;
                case "AE": // Load the X reg from memory
                    this.loadXMem();
                    break;
                case "A0": // Load the Y reg with a constant
                    this.loadYCon();
                    break;
                case "AC": // Load the Y reg from memory
                    this.loadYMem();
                    break;
                case "EA": //No Operation
                    this.PC++;
                    break;
                case "00": //Break, actually system call
                    this.sysBreak();
                    break;
                case "EC": //Compare byte in mem to x reg, set z flag if equal
                    this.compareX();
                    break;
                case "D0": // Branch n bytes if z flag = 0
                    this.branch();
                    break;
                case "EE": //Increment the value of a byte
                    this.incrementByte();
                    break;
                case "FF": //System call
                    this.sysCall();
                    break;
                default:
                    this.sysBreak();
                    this.isExecuting = false;
                    break;

            }
        }
        //The below has a lot of PC++ to increment PC every single time we read/write an opCode
        private loadAccCon(){
            //increment PC for the instruction you just read.
            this.PC++;
            //Load the accumulator
            this.Acc = parseInt(_MemManager.readMem(this.currPCB, this.PC),16);
            //Increment PC for THAT instruction too
            this.PC++;
        }
        private loadAccMem(){
            this.PC++;
            var addr = parseInt (_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++
            this.Acc = parseInt(_MemManager.readMem(this.currPCB, addr), 16)
            this.PC++;
        }
        private storeAccMem(){
            this.PC++
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++
            _MemManager.writeMem(this.currPCB, addr, this.Acc.toString(16));
            this.PC++
        }
        private addWithCarry(){
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            this.Acc += parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            this.PC++;
        }
        private loadXCon(){
            this.PC++;
            this.Xreg = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
        }
        private loadXMem(){
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            this.Xreg = parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            this.PC++;
        }
        private loadYCon(){
            this.PC++;
            this.Yreg = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
        }
        private loadYMem(){
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            this.Yreg = parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            this.PC++;
        }
        private compareX(){
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            this.PC++;
            if (this.Xreg === parseInt(_MemManager.readMem(this.currPCB, addr), 16)){
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }
            this.PC++;
        }
        private branch(){
            this.PC++;
            if (this.Zflag === 0){
                var hex = _MemManager.readMem(this.currPCB, this.PC);
                this.PC++;
                var br = parseInt(hex, 16);
                this.PC+= br; //jump forward in instructions instead of just inc to next one
            } else{
                this.PC++ //otherwise increment as normal to account for the instruction
            }

        }
        private incrementByte(){
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            var val = parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            val++;
            _MemManager.writeMem(this.currPCB, addr, val.toString(16));
            this.PC++;
        }
        private sysCall(){

        }
        private sysBreak(){
            this.isExecuting = false;
        }
    }
}
