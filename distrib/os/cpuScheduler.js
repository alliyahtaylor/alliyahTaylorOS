///<reference path="queue.ts" />
///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = /** @class */ (function () {
        function cpuScheduler(quantum, RoundRobin, count, readyQueue) {
            if (quantum === void 0) { quantum = 6; }
            if (RoundRobin === void 0) { RoundRobin = false; }
            if (count === void 0) { count = 1; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            this.quantum = quantum;
            this.RoundRobin = RoundRobin;
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
                _CPU.currPCB.State = 'Ready';
                this.readyQueue.enqueue(_CPU.currPCB);
                _CPU.currPCB = this.readyQueue.dequeue();
                _CPU.currPCB.State = 'Running';
            }
        };
        cpuScheduler.prototype.loadQueue = function () {
            for (var i = 0; i < _PCBArr.length; i++) {
                this.readyQueue.enqueue(_PCBArr[i]);
            }
            _CPU.currPCB = this.readyQueue.dequeue();
            _CPU.currPCB.State = 'Running';
        };
        cpuScheduler.prototype.counter = function () {
            if (this.count < this.quantum) {
                this.count++;
            }
            else {
                this.count = 1;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CON_SWITCH_IRQ, 'Scheduling Event'));
            }
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
