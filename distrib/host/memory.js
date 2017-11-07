var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memory) {
            if (memory === void 0) { memory = []; }
            this.memory = memory;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < 768; i++) {
                this.setOp(i, '00');
            }
            TSOS.Control.updateMemTable();
        };
        Memory.prototype.setOp = function (loc, code) {
            this.memory[loc] = code;
        };
        Memory.prototype.getOp = function (loc) {
            return this.memory[loc];
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
