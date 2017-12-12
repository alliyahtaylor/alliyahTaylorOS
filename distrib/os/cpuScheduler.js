///<reference path="queue.ts" />
///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var cpuScheduler = /** @class */ (function () {
        function cpuScheduler(quantum, count, readyQueue, RR, fcfs, priority) {
            if (quantum === void 0) { quantum = 6; }
            if (count === void 0) { count = 0; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            if (RR === void 0) { RR = false; }
            if (fcfs === void 0) { fcfs = false; }
            if (priority === void 0) { priority = false; }
            this.quantum = quantum;
            this.count = count;
            this.readyQueue = readyQueue;
            this.RR = RR;
            this.fcfs = fcfs;
            this.priority = priority;
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
                    _CPU.updatePCB();
                    _CPU.currPCB.State = 'Ready';
                    this.readyQueue.enqueue(_CPU.currPCB);
                }
                _CPU.IR = ' ';
                var last = _CPU.currPCB;
                var next = this.readyQueue.dequeue();
                if (next.onDisk) {
                    this.swap(last, next);
                }
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
            if (this.priority) {
                //Sort the queue here to make sure it stays in order
                this.sortQueue();
            }
            _CPU.currPCB = this.readyQueue.dequeue();
            _CPU.currPCB.State = 'Running';
        };
        cpuScheduler.prototype.counter = function () {
            if (this.RR) {
                this.quantum = 6;
            }
            else if (this.fcfs) {
                //cheating with a huge quantum
                this.quantum = 100000;
            }
            else if (this.priority) {
                this.quantum = 100000;
            }
            else {
                this.quantum = 6; //I just wanna make sure cheating above doesn't mess things up later
                this.RR = true;
            }
            if (this.count < this.quantum) {
                this.count++;
            }
            else {
                this.count = 0;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CON_SWITCH_IRQ, 'Scheduling Event'));
            }
        };
        //for Priority Scheduling
        cpuScheduler.prototype.sortQueue = function () {
            var PCBs = [];
            var priorities = [];
            var length = this.readyQueue.getSize();
            //get pcbs from queue
            for (var i = 0; i < length; i++) {
                var PCB = this.readyQueue.dequeue();
                PCBs.push(PCB);
                priorities.push(PCB.priority);
            }
            var sorted = [];
            //sort the priorities separately because it's easy
            priorities = priorities.sort();
            //push PCBs into an array in priority order
            for (var i = 0; i < length; i++) {
                var priority = priorities[i];
                for (var j = 0; j < PCBs.length; j++) {
                    if (PCBs[j].priority == priority) {
                        sorted.push(PCBs.splice(j, 1));
                    }
                }
            }
            //load sorted PCBs back into queueu
            for (var i = 0; i < sorted.length; i++) {
                this.readyQueue.enqueue(sorted[i][0]);
            }
        };
        //Rollin/Rollout
        cpuScheduler.prototype.swap = function (MemPCB, HDDPCB) {
            var program = _MemManager.getProgram(MemPCB);
            if (MemPCB.State !== 'Terminated') {
                _krnHardDriveDriver.rollOut(program, _MemManager.getPart(MemPCB), MemPCB);
            }
            _krnHardDriveDriver.rollIn(HDDPCB);
        };
        return cpuScheduler;
    }());
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
