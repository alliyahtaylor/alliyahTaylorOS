var TSOS;
(function (TSOS) {
    var MemManager = /** @class */ (function () {
        function MemManager(///Initialize ALL the arrays
            PIDList, //List of loaded PIDs
            memParts, //Memory Partitions
            executed) {
            if (PIDList === void 0) { PIDList = [0]; }
            if (memParts === void 0) { memParts = [-1, -1, -1]; }
            if (executed === void 0) { executed = []; }
            this.PIDList = PIDList;
            this.memParts = memParts;
            this.executed = executed;
        }
        MemManager.prototype.incPID = function () {
            var n = this.PIDList.length;
            this.PIDList.push(n);
        };
        MemManager.prototype.load = function (PCB, program) {
            //Find an available partition in memory
            var part = this.availPart();
            if (part === -1) {
                if (_krnHardDriveDriver.formatted) {
                    _krnHardDriveDriver.rollOut(program, part, PCB);
                }
                else {
                    _StdOut.putText('Format the hard drive.');
                }
            }
            else {
                //PID in the memory partition for easy clearing later
                this.memParts[part] = PCB.Pid;
                //account for which memory partition PCB is located in
                PCB.Base = part * 256;
                PCB.Limit = part + 255;
                //Write op codes to memory
                for (var i = 0; i < 256; i++) {
                    var opCode = '';
                    if (program[i] === undefined) {
                        opCode = '00';
                    }
                    else {
                        opCode = program[i];
                    }
                    _Memory.setOp(PCB.Base + i, opCode);
                }
                _StdOut.putText('Loaded PID' + PCB.pID);
                TSOS.Control.updateMemTable();
                _cpuScheduler.loadQueue();
            }
            this.incPID();
        };
        MemManager.prototype.readMem = function (PCB, loc) {
            return _Memory.getOp(PCB.Base + loc);
        };
        MemManager.prototype.writeMem = function (PCB, loc, code) {
            _Memory.setOp(PCB.Base + loc, code);
        };
        MemManager.prototype.getPCB = function (PID) {
            return _PCBArr[PID];
        };
        MemManager.prototype.getProgram = function (PCB) {
            var program = '';
            for (var i = PCB.base; i < PCB.limit; i++) {
                var byte = this.readMem(PCB, i);
                program += byte.toString(16);
            }
            return program;
        };
        //Find available partition
        MemManager.prototype.availPart = function () {
            if (this.memParts[0] === -1) {
                return 0;
            }
            else if (this.memParts[1] === -1) {
                return 1;
            }
            else if (this.memParts[2] === -1) {
                return 2;
            }
            else {
                return -1;
            }
        };
        //clear specific memory partition
        MemManager.prototype.clearPart = function (PID) {
            if (this.memParts.indexOf(PID) === 0) {
                for (var i = 0; i < 256; i++) {
                    _Memory.memory[i] = '00';
                }
                this.memParts[0] = -1;
            }
            else if (this.memParts.indexOf(PID) === 1) {
                for (var i = 256; i < 512; i++) {
                    _Memory.memory[i] = '00';
                }
                this.memParts[1] = -1;
            }
            else if (this.memParts.indexOf(PID) === 2) {
                for (var i = 512; i < 768; i++) {
                    _Memory.memory[i] = '00';
                }
                this.memParts[2] = -1;
            }
        };
        //Clear all memory partitions
        MemManager.prototype.eraseAll = function () {
            _Memory.init();
            this.memParts = [-1, -1, -1];
            this.executed.push(this.PIDList);
        };
        MemManager.prototype.getPart = function (PCB) {
            return this.memParts.indexOf(PCB.pID);
        };
        MemManager.prototype.validateProgram = function (program, val) {
            if (program.length < 1) {
                _StdOut.putText('Please input a program');
                return false;
            }
            else if (program.length > 256) {
                _StdOut.putText('Program exceeds the maximum length.');
                return false;
            }
            else {
                var hexTest = new RegExp(/^[A-Fa-f0-9\s]+$/);
                if (val.match(hexTest)) {
                    return true;
                }
                else {
                    _StdOut.putText('Program may not contain non-hex digits.');
                    return false;
                }
            }
        };
        return MemManager;
    }());
    TSOS.MemManager = MemManager;
})(TSOS || (TSOS = {}));
