var TSOS;
(function (TSOS) {
    var Pcb = /** @class */ (function () {
        function Pcb(pID, PC, Acc, Xreg, Yreg, Zflag, Base, Limit) {
            if (pID === void 0) { pID = 0; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (Base === void 0) { Base = 0; }
            if (Limit === void 0) { Limit = 0; }
            this.pID = pID;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.Base = Base;
            this.Limit = Limit;
        }
        Pcb.prototype.init = function (pID) {
            this.pID = pID;
            this.Limit = 768 / pID;
            this.Base = this.Base - 256;
        };
        return Pcb;
    }());
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
