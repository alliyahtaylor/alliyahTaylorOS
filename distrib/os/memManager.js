///<reference path="../globals.ts" />
///<reference path="../os/pcb.ts" />
///<reference path="../host/memory.ts" />
var TSOS;
(function (TSOS) {
    var MemManager = /** @class */ (function () {
        function MemManager() {
        }
        MemManager.prototype.init = function () {
        };
        MemManager.load = function (program) {
            //create a new pcb
            /* var pcb = new TSOS.Pcb();
            for (var i = 0; i < 256; i++){
                if (i > 256){
                    break;
                }
             _Memory.setOp(i, program[i]);
            }*/
            var pID = 0;
            return pID;
        };
        MemManager.prototype.setProgram = function (code) {
            var opArr = code.split(' ');
            for (var i = 0; i < opArr.length; i++) {
                var opCode = opArr[i];
                _Memory[i] = opCode;
            }
            TSOS.Control.updateMemTable();
        };
        MemManager.prototype.readMem = function (PCB, loc) {
            return _Memory.getOp(loc);
        };
        MemManager.prototype.writeMem = function (PCB, loc, code) {
            _Memory.setOp(loc, code);
        };
        return MemManager;
    }());
    TSOS.MemManager = MemManager;
})(TSOS || (TSOS = {}));
