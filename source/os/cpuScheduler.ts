///<reference path="queue.ts" />
///<reference path="../globals.ts" />

module TSOS{
    export class cpuScheduler{
        constructor(public quantum = 6,
                    public count = 0,
                    public readyQueue = new Queue(),
                    public RR = false,
                    public fcfs = false,
                    public priority = false){
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
                    _CPU.updatePCB();
                    _CPU.currPCB.State = 'Ready';
                    this.readyQueue.enqueue(_CPU.currPCB);
                }
                _CPU.IR = ' ';
                var last = _CPU.currPCB;
                var next = this.readyQueue.dequeue();
                if (next.onDisk){
                    this.swap(last, next);
                }
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
            if(this.priority){
                //Sort the queue here to make sure it stays in order
                this.sortQueue();
            }
            _CPU.currPCB = this.readyQueue.dequeue();
            _CPU.currPCB.State = 'Running';
        }

        public counter(){
            if (this.RR){
                this.quantum = 6;
            }else if(this.fcfs){
                //cheating with a huge quantum
                this.quantum = 100000;
            }else if(this.priority){
                this.quantum = 100000;
            }else{
                this.quantum = 6; //I just wanna make sure cheating above doesn't mess things up later
                this.RR = true;
            }
            if (this.count < this.quantum ){
                this.count++
            }else{
                this.count = 0;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CON_SWITCH_IRQ, 'Scheduling Event'));
            }
        }
        //for Priority Scheduling
        public sortQueue(){
            var PCBs = [];
            var priorities = [];
            var length = this.readyQueue.getSize();

            //get pcbs from queue
            for(var i = 0; i < length; i++){
                var PCB = this.readyQueue.dequeue();
                PCBs.push(PCB);
                priorities.push(PCB.priority);
            }
            var sorted = [];
            //sort the priorities separately because it's easy
            priorities = priorities.sort();

            //push PCBs into an array in priority order
            for (var i = 0; i < length; i++){
                var priority = priorities[i];
                for(var j = 0; j < PCBs.length; j++){
                    if(PCBs[j].priority == priority){
                    sorted.push(PCBs.splice(j,1));
                    }
                }
            }
            //load sorted PCBs back into queueu
            for (var i=0; i < sorted.length; i++){
                this.readyQueue.enqueue(sorted[i][0]);
            }
        }
        //Rollin/Rollout
        public swap(MemPCB, HDDPCB){
            var program = _MemManager.getProgram(MemPCB);
           if(MemPCB.State !== 'Terminated'){ _krnHardDriveDriver.rollOut(program, _MemManager.getPart(MemPCB), MemPCB);}
            _krnHardDriveDriver.rollIn(HDDPCB);
        }
    }
}