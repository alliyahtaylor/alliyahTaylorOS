module TSOS {
    export class MemManager {
        constructor(public currPID = [0]){
        }
        public incPID() {
            var n = this.currPID.length;
            this.currPID.push(n);

       //Create a new PCB and load op codes into memory


          /*  for ( let i = 0; i < 255; i++){
                let opCode = '';
            if(program[i] === undefined){
                opCode = '00'
            } else {
                opCode = program[i].toString();
            }
            _Memory.setOp(i, opCode);}}*/
        }

      public readMem(PCB, loc){
            return _Memory.getOp(loc);
        }
        public writeMem(loc, code){
            _Memory.setOp(loc, code);
        }
    }
}