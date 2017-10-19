var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(size) {
            this.memory = new Array(size);
        }
        Memory.prototype.init = function () {
            this.memory(256);
            for (var i = 0; i < this.memory.length; i++) {
                this.memory.push('00');
            }
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
