///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.memory = [{ length: 256 }];
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.memory.length; i++) {
                this.memory[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
