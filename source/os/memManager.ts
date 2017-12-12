module TSOS {
    export class MemManager {
        constructor( ///Initialize ALL the arrays
                    public PIDList = [0], //List of loaded PIDs
                    public memParts = [-1,-1,-1], //Memory Partitions
                    public executed = []){     //PIDs we ran already
        }
        public incPID() {
            var n = this.PIDList.length;
            this.PIDList.push(n);

        }
        public load(PCB, program){
            //Find an available partition in memory
            var part = this.availPart();
            if (part === -1){
                if (_krnHardDriveDriver.formatted){
                _krnHardDriveDriver.rollOut(program, part, PCB);}
                else{
                    _StdOut.putText('Format the hard drive.');
                }
            }else{
            //PID in the memory partition for easy clearing later
            this.memParts[part] = PCB.Pid;
            //account for which memory partition PCB is located in
            PCB.Base = part * 256;
            PCB.Limit = part + 255;
            //Write op codes to memory
            for(var i = 0; i < 256; i++){
              var opCode ='';
               if (program[i] === undefined){
                   opCode = '00';
               }else{
                   opCode = program[i];
               }
                _Memory.setOp(PCB.Base + i, opCode);
            }
                _StdOut.putText ('Loaded PID' + PCB.pID);
                TSOS.Control.updateMemTable();
                _cpuScheduler.loadQueue();
            }
            this.incPID();
                    }

        public readMem(PCB, loc){
            return _Memory.getOp(PCB.Base + loc);
        }
        public writeMem(PCB, loc, code){
            _Memory.setOp(PCB.Base + loc, code);
        }
        public getPCB(PID){
            return _PCBArr[PID];
        }
        public getProgram(PCB){
            var program = '';
            for (var i = PCB.base; i < PCB.limit; i++){
                var byte = this.readMem(PCB, i);
                program += byte.toString(16);
            }
            return program;
        }
        //Find available partition
        public availPart(){
            if (this.memParts[0] === -1){
                return 0;
            } else if (this.memParts[1] === -1){
                return 1;
            } else if (this.memParts[2] === -1){
                return 2;
            } else{
                return -1;
            }
        }
        //clear specific memory partition
        public clearPart(PID) {
            if (this.memParts.indexOf(PID) === 0) {
                for (let i = 0; i < 256; i++) {
                    _Memory.memory[i] = '00';
                } this.memParts[0] = -1;
            } else if (this.memParts.indexOf(PID) === 1) {
                for (let i = 256; i < 512; i++) {
                    _Memory.memory[i] = '00';
                } this.memParts[1] = -1;
            } else if (this.memParts.indexOf(PID) === 2) {
                for (let i = 512; i < 768; i++) {
                    _Memory.memory[i] = '00';
                } this.memParts[2] = -1;
            }
        }
        //Clear all memory partitions
        public eraseAll(){
            _Memory.init();
            this.memParts = [-1, -1, -1];
            this.executed.push(this.PIDList);
        }
        public getPart(PCB){
            return this.memParts.indexOf(PCB.pID);
        }
        public validateProgram(program, val){
            if(program.length < 1){
                _StdOut.putText('Please input a program');
                return false;
            }else if(program.length > 256){
                _StdOut.putText('Program exceeds the maximum length.');
                return false;
            }else{
                var hexTest = new RegExp(/^[A-Fa-f0-9\s]+$/);
                if (val.match(hexTest)){
                return true;
                }else{
                    _StdOut.putText('Program may not contain non-hex digits.');
                    return false;
                }
            }
        }
    }
}