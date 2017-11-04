var TSOS;
(function (TSOS) {
    var MemManager = /** @class */ (function () {
        function MemManager(currPID) {
            if (currPID === void 0) { currPID = [0]; }
            this.currPID = currPID;
        }
        MemManager.prototype.incPID = function () {
            var n = this.currPID.length;
            this.currPID.push(n);
            //Create a new PCB and load op codes into memory
            /*  for ( let i = 0; i < 255; i++){
                  let opCode = '';
              if(program[i] === undefined){
                  opCode = '00'
              } else {
                  opCode = program[i].toString();
              }
              _Memory.setOp(i, opCode);}}*/
        };
        MemManager.prototype.readMem = function (PCB, loc) {
            return _Memory.getOp(loc);
        };
        MemManager.prototype.writeMem = function (loc, code) {
            _Memory.setOp(loc, code);
        };
        return MemManager;
    }());
    TSOS.MemManager = MemManager;
})(TSOS || (TSOS = {}));
