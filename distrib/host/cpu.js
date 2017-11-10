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
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, currPCB, isExecuting, IR) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (currPCB === void 0) { currPCB = null; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (IR === void 0) { IR = ''; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.currPCB = currPCB;
            this.isExecuting = isExecuting;
            this.IR = IR;
        }
        Cpu.prototype.init = function () { };
        Cpu.prototype.cycle = function () {
            if (this.currPCB !== null && this.isExecuting) {
                _Kernel.krnTrace('CPU cycle');
                // TODO: Accumulate CPU usage and profiling statistics here.
                // Do the real work here. Be sure to set this.isExecuting appropriately.
                this.currPCB.State = 'Running';
                this.IR = _MemManager.readMem(this.currPCB, this.PC);
                //Figure out what to do with each opCode.
                switch (this.IR) {
                    case "A9"://Load the accumulator with a constant
                        this.loadAccCon();
                        break;
                    case "AD"://Load the accumulator from memory
                        this.loadAccMem();
                        break;
                    case "8D"://Store the accumulator in memory
                        this.storeAccMem();
                        break;
                    case "6D"://Add with carry
                        this.addWithCarry();
                        break;
                    case "A2":// Load the X reg with a constant
                        this.loadXCon();
                        break;
                    case "AE":// Load the X reg from memory
                        this.loadXMem();
                        break;
                    case "A0":// Load the Y reg with a constant
                        this.loadYCon();
                        break;
                    case "AC":// Load the Y reg from memory
                        this.loadYMem();
                        break;
                    case "EA"://No Operation
                        this.PC++;
                        break;
                    case "00"://Break, actually system call
                        this.sysBreak();
                        break;
                    case "EC"://Compare byte in mem to x reg, set z flag if equal
                        this.compareX();
                        break;
                    case "D0":// Branch n bytes if z flag = 0
                        this.branch();
                        break;
                    case "EE"://Increment the value of a byte
                        this.incrementByte();
                        break;
                    case "FF"://System call
                        this.sysCall();
                        break;
                    default:
                        this.sysBreak();
                        break;
                }
                this.PC = this.PC % 256;
                //Keep PCB up to date
                this.updatePCB();
                TSOS.Control.updateMemTable();
                if (!_cpuScheduler.readyQueue.isEmpty() && _cpuScheduler.readyQueue.q.length != 1) {
                    _cpuScheduler.counter();
                }
            }
        }; //end cycle
        Cpu.prototype.runProc = function (PID) {
            this.currPCB = _MemManager.getPCB(PID);
            //this.currPCB.State = 'Ready';
            this.loadFromPCB();
            this.isExecuting = true;
        };
        Cpu.prototype.loadProc = function (PCB) {
            this.currPCB = PCB;
            PCB.State = 'Running';
            this.loadFromPCB();
        };
        //Op Code Programs
        Cpu.prototype.loadAccCon = function () {
            this.PC++;
            this.Acc = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
        };
        Cpu.prototype.loadAccMem = function () {
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            this.Acc = parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            this.PC++;
        };
        Cpu.prototype.storeAccMem = function () {
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            _MemManager.writeMem(this.currPCB, addr, this.Acc.toString(16));
            this.PC++;
        };
        Cpu.prototype.addWithCarry = function () {
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            this.Acc += parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            this.PC++;
        };
        Cpu.prototype.loadXCon = function () {
            this.PC++;
            this.Xreg = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
        };
        Cpu.prototype.loadXMem = function () {
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            this.Xreg = parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            this.PC++;
        };
        Cpu.prototype.loadYCon = function () {
            this.PC++;
            this.Yreg = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
        };
        Cpu.prototype.loadYMem = function () {
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            this.Yreg = parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            this.PC++;
        };
        Cpu.prototype.compareX = function () {
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            this.Zflag = (this.Xreg === parseInt(_MemManager.readMem(this.currPCB, addr), 16)) ? 1 : 0;
            this.PC++;
        };
        Cpu.prototype.branch = function () {
            this.PC++;
            if (this.Zflag === 0) {
                var hex = _MemManager.readMem(this.currPCB, this.PC);
                this.PC++;
                var br = parseInt(hex, 16);
                this.PC += br; //jump forward in instructions instead of just inc to next one
            }
            else {
                this.PC++; //otherwise increment as normal to account for the instruction
            }
        };
        Cpu.prototype.incrementByte = function () {
            this.PC++;
            var addr = parseInt(_MemManager.readMem(this.currPCB, this.PC), 16);
            this.PC++;
            var val = parseInt(_MemManager.readMem(this.currPCB, addr), 16);
            val++;
            _MemManager.writeMem(this.currPCB, addr, val.toString(16));
            this.PC++;
        };
        Cpu.prototype.sysCall = function () {
            // if 1 in X register, print byte in Y register
            // else if 2 in X register, print 00 terminated string at addr stored in Y register
            if (this.Xreg === 1) {
                var params = { output: this.Yreg.toString() };
            }
            else {
                var output = '';
                var addr = this.Yreg;
                var code = _MemManager.readMem(this.currPCB, addr);
                while (code !== '00') {
                    var letter = String.fromCharCode(parseInt(code, 16));
                    output += letter;
                    addr++;
                    var code = _MemManager.readMem(this.currPCB, addr);
                }
                var params = { output: output };
            }
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, params), 1);
            this.PC++;
        };
        Cpu.prototype.sysBreak = function () {
            this.currPCB.State = 'Terminated';
            this.updatePCB();
            //Clear memory partition
            _MemManager.clearPart(this.currPCB.pID);
            //Push PID to executed array
            _MemManager.executed.push(this.currPCB.pID);
            this.clearPCB();
            //ClearMem
            //Array of Executed programs
            this.isExecuting = false;
        };
        Cpu.prototype.clearPCB = function () {
            this.currPCB = null;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.PC = 0;
        };
        Cpu.prototype.loadFromPCB = function () {
            this.PC = this.currPCB.PC;
            this.Acc = this.currPCB.Acc;
            this.Xreg = this.currPCB.Xreg;
            this.Yreg = this.currPCB.Yreg;
            this.Zflag = this.currPCB.Zflag;
        };
        Cpu.prototype.updatePCB = function () {
            this.currPCB.update(this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag);
            TSOS.Control.updateProcTable(this.currPCB, this.IR);
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
