///<reference path="queue.ts" />
///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = /** @class */ (function () {
        function cpuScheduler(quantum, count, readyQueue) {
            if (quantum === void 0) { quantum = 6; }
            if (count === void 0) { count = 0; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            this.quantum = quantum;
            this.count = count;
            this.readyQueue = readyQueue;
            this.readyQueue = readyQueue;
        }
        cpuScheduler.prototype.addQueue = function (PCB) {
            this.readyQueue.enqueue(PCB);
        };
        cpuScheduler.prototype.contextSwitch = function () {
            if (this.readyQueue.isEmpty()) {
                _CPU.isExecuting = false;
            }
            else {
                if (_CPU.currPCB.State != 'Terminated') {
                    _CPU.currPCB.State = 'Ready';
                    this.readyQueue.enqueue(_CPU.currPCB);
                }
                _CPU.IR = ' ';
                var next = this.readyQueue.dequeue();
                _CPU.currPCB = next;
                _CPU.currPCB.State = 'Running';
                _CPU.loadFromPCB();
            }
        };
        cpuScheduler.prototype.loadQueue = function () {
            for (var i = 0; i < _PCBArr.length; i++) {
                if (_PCBArr[i].State != 'Terminated') {
                    this.readyQueue.enqueue(_PCBArr[i]);
                }
            }
            _CPU.currPCB = this.readyQueue.dequeue();
            _CPU.currPCB.State = 'Running';
        };
        cpuScheduler.prototype.counter = function () {
            if (this.count < this.quantum) {
                this.count++;
            }
            else {
                this.count = 0;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CON_SWITCH_IRQ, 'Scheduling Event'));
            }
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
