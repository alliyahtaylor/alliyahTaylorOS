///<reference path="../globals.ts" />
///<reference path="../os/pcb.ts" />
///<reference path="../host/memory.ts" />
module TSOS {
    export class MemManager {
        constructor() {}
        public init() : void{
        }

        public load(program) {
        //create a new pcb
           /* var pcb = new TSOS.Pcb();
           for (var i = 0; i < 256; i++){
               if (i > 256){
                   break;
               }
            _Memory.setOp(i, program[i]);
           }*/
          var pID = 0;
            return pID;
        }

        public setProgram(code) {
            var opArr = code.split(' ');

            for (var i = 0; i < opArr.length; i++) {
                var opCode = opArr[i];
                _Memory[i] = opCode;
            }
            Control.updateMemTable();

        }

      public readMem(PCB, loc){
            return _Memory.getOp(loc);
        }
        public writeMem(PCB, loc, code){
            _Memory.setOp(loc, code);
        }
    }
}