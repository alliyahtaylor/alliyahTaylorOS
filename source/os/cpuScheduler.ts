///<reference path="queue.ts" />
///<reference path="../globals.ts" />

module TSOS{
    export class cpuScheduler{
        constructor(public quantum = 6,
                    public count = 0,
                    public readyQueue = new Queue()){
            this.readyQueue = readyQueue;
        }

        public addQueue(PCB){
            this.readyQueue.enqueue(PCB);
        }

        public contextSwitch(){ //For RR Scheduling
            if(this.readyQueue.isEmpty()){
               _CPU.isExecuting = false;
            }else{
                if (_CPU.currPCB.State != 'Terminated'){
                _CPU.currPCB.State = 'Ready';
                this.readyQueue.enqueue(_CPU.currPCB);}
                _CPU.IR = ' ';
                var next = this.readyQueue.dequeue();
                _CPU.currPCB = next;
                _CPU.currPCB.State = 'Running';
                _CPU.loadFromPCB();

            }
        }
        public loadQueue(){
            for (let i = 0; i < _PCBArr.length; i++){
                if(_PCBArr[i].State != 'Terminated'){
                    this.readyQueue.enqueue(_PCBArr[i]);}
            }
            _CPU.currPCB = this.readyQueue.dequeue();
            _CPU.currPCB.State = 'Running';
        }

        public counter(){
            if (this.count < this.quantum ){
                this.count++
            }else{
                this.count = 0;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CON_SWITCH_IRQ, 'Scheduling Event'));
            }
        }
    }
}