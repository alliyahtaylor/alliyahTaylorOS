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
                _Memory.setOp(PCB.Base +i, opCode);
            }
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
        //Find available partition
        public availPart(){
            if (this.memParts[0] === -1){
                return 0;
            } else if (this.memParts[1] === -1){
                return 1;
            } else if (this.memParts[2] === -1){
                return 2;
            } else{
                return null;
            }
        }
        //clear specific memory partition
        public clearPart(PID) {
            if (this.memParts.indexOf(PID) === 0) {
                for (let i = 0; i < 256; i++) {
                    _Memory.memory[i] = '00';
                }
            } else if (this.memParts.indexOf(PID) === 1) {
                for (let i = 256; i < 512; i++) {
                    _Memory.memory[i] = '00';
                }
            } else if (this.memParts.indexOf(PID) === 2) {
                for (let i = 512; i < 768; i++) {
                    _Memory.memory[i] = '00';
                }
            }
        }
        //Clear all memory partitions
        public eraseAll(){
            _Memory.init();
            this.memParts = [-1, -1, -1];
            this.executed.push(this.PIDList);
        }
    }
}