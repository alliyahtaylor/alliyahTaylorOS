///<reference path="queue.ts" />
///<reference path="../globals.ts" />

module TSOS{
    export class cpuScheduler{
        constructor(public quantum = 6,
                    public RoundRobin = false,
                    public count = 1,
                    public readyQueue = new Queue()){
            this.readyQueue = readyQueue;
        }

        public addQueue(PCB){
            this.readyQueue.enqueue(PCB);
        }

        public contextSwitch(){
            if(this.readyQueue.isEmpty()){
                _CPU.isExecuting = false;
            }else{
                _CPU.currPCB.State = 'Ready';
                this.readyQueue.enqueue(_CPU.currPCB);
                _CPU.currPCB = this.readyQueue.dequeue();
                _CPU.currPCB.State = 'Running';
            }
        }
        public loadQueue(){
            for (let i = 0; i < _PCBArr.length; i++){
                this.readyQueue.enqueue(_PCBArr[i]);
            }
            _CPU.currPCB = this.readyQueue.dequeue();
            _CPU.currPCB.State = 'Running';
        }

        public counter(){
            if (this.count < this.quantum){
                this.count++
            }else{
                this.count=1;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CON_SWITCH_IRQ, 'Scheduling Event'));
            }
        }



    }
}