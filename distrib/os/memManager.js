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
                return null;
            }
        };
        //clear specific memory partition
        MemManager.prototype.clearPart = function (PID) {
            if (this.memParts.indexOf(PID) === 0) {
                for (var i = 0; i < 256; i++) {
                    _Memory.memory[i] = '00';
                }
            }
            else if (this.memParts.indexOf(PID) === 1) {
                for (var i = 256; i < 512; i++) {
                    _Memory.memory[i] = '00';
                }
            }
            else if (this.memParts.indexOf(PID) === 2) {
                for (var i = 512; i < 768; i++) {
                    _Memory.memory[i] = '00';
                }
            }
        };
        //Clear all memory partitions
        MemManager.prototype.eraseAll = function () {
            _Memory.init();
            this.memParts = [-1, -1, -1];
            this.executed.push(this.PIDList);
        };
        return MemManager;
    }());
    TSOS.MemManager = MemManager;
})(TSOS || (TSOS = {}));
