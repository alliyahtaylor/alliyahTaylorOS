var TSOS;
(function (TSOS) {
    var Pcb = /** @class */ (function () {
        function Pcb() {
            this.pID = _PCBArr.length++;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.PC = 0;
        }
        return Pcb;
    }());
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
