///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverHardDrive.ts

   Requires deviceDriver.ts
   ---------------------------------- */
//This makes me want to die :)
//HTML5 Storage is actually pretty cool, though.
module TSOS{
    export class DeviceDriverHardDrive extends DeviceDriver {
        public formatted: boolean;
        constructor(){
            //Override base method pointers
            super();
            this.driverEntry = this.krnHDDDriverEntry;
            this.formatted = false;
        }

        //Init
        public krnHDDDriverEntry(){
            this.status = 'loaded';
        }

        //Format the Hard Drive. No warnings, we die like me(mory)
        public krnHDDFormat(){
            //Create the Master Boot Record
            var mbr = '1~~~MBR';
            //Make an empty block
            var emptyBlock = '0~~~';
            for (var i = 0; i < BLOCK_SIZE -4; i++){
                emptyBlock += "00";
            }
            //write the empty blocks
            for (var t = 0; t < TRACKS; t++){
                for (var s = 0; s < SECTORS; s++){
                    for (var b = 0; b < BLOCKS; b++){
                        var tsb: string = '' + t + s + b;
                        if (tsb === '000'){
                            _HardDrive.write(tsb, mbr);
                        }else{
                            _HardDrive.write(tsb, emptyBlock);
                        }
                    }
                }
            }
            this.formatted = true;
            _StdOut.putText('Format Successful.');
        }

        //Find a free directory block
        public findFreeDir(){
            var t = 0;
            var resultTSB: string = '';
            var success = false;

            //loop through the sectors and blocks
            for(var s = 0; s < SECTORS && !success; s++){
                for(var b = 0; b < BLOCKS && !success; b++){
                    resultTSB = '' + t + s + b;
                    if(!this.inUse(resultTSB)){
                        success = true;
                    }
                }
            }
            if (!success){
                return '';
            }else{
                return resultTSB;
            }
        }

        //find a free data block
        public findFreeFile(){
            var resultTSB: string = '';
            var success: boolean = false;

            //loop through the possbile TSBs. Nested For loops are ugly
            //start t at 1 because this isn't a directory
            for(var t = 1; t < TRACKS && !success; t++){
                for (var s = 0; s < SECTORS && !success; s++){
                    for (var b = 0; b < BLOCKS && !success; b++){
                        resultTSB = '' + t + s + b;
                        if(!this.inUse(resultTSB)){
                            success = true;
                        }
                    }
                }
            }
            if (!success){
                return '';
            } else {
                var emptyBlock = '0~~~';
                for (var i = 0; i < BLOCK_SIZE - 4; i++) {
                    emptyBlock += "00";
                }
                _HardDrive.write(resultTSB, emptyBlock);
            }
            return resultTSB;
        }

        //Create File
        public createFile(name: string){
            var fileTSB : string = this.findFreeFile().toString();
            var i: number;
            if(fileTSB !== ''){
                this.setUse(fileTSB, true);
                //create directory block
                var dirBlock = '1' + fileTSB;
                for (i = 0; i < name.length; i++){
                    var code = name.charCodeAt(i).toString(16).toUpperCase();
                    dirBlock += code;
                }
                //Zero the rest out
                for (i; i < BLOCK_SIZE - 4; i++){
                    dirBlock += '00';
                }
                var dirTSB = this.findFreeDir();
                if (dirTSB !== ''){
                    _HardDrive.write(dirTSB, dirBlock);
                }else {
                    _StdOut.putText('No free space in the directory.');
                }
            }else{
                _StdOut.putText('No free file space available.');
            }
            _StdOut.putText('File ' + name + ' successfully created');
        }

        //Write File
        public writeFile(name, data){
            var dirTSB = this.getFile(name);

            if(dirTSB === ''){
                _StdOut.putText('That file does not exist.');
            } else {
                var size = data.length;
                var fileTSB = this.getTSB(dirTSB);

                if (this.getTSB(fileTSB) !== '~~~'){
                    this.clearData(fileTSB);
                }
                this.setData(fileTSB, data, size, false);

            }
        }

        //Read File
        public readFile(name){
           var TSB = this.getFile(name);
           if(TSB === ''){
               return('That file does not exist.');
           }else{
               return this.readData(TSB, false);
           }
        }
        //Read Data
        public readData(tsb, isProgram){
            var data = '';
            if (isProgram){
                data = this.getHexData(tsb);
            }else {
                data = this.getData(tsb);
            }
            if (this.getTSB(tsb) === '~~~'){
                return data;
            }else{
                var newTSB = this.getTSB(tsb);
                return (data + this.readData(newTSB, isProgram));
            }
        }

        //Delete File
        public deleteFile(name){
            var dirTSB = this.getFile(name);
            if (dirTSB.toString() === ''){
                _StdOut.putText('Error, file not found');
            }else{
                var fileTSB = this.getTSB(dirTSB);
                this.clearData(fileTSB);
                this.setUse(dirTSB, false);
                _StdOut.putText('File deleted.');
            }
        }


        //Check if something is in use
        public inUse(tsb){
            if (_HardDrive.read(tsb).charAt(0) === "1"){
                return true;
            }else{
                return false;
            }
        }
        //set something in use
        public setUse(tsb, status){
            var block: string = _HardDrive.read(tsb);
            block = block.slice(1, block.length - 1);
            if(status){
                block = '1' + block;
            }else{
                block = '0' + block;
            }
            _HardDrive.write(tsb, block);
    }
        //Find a file by its name
        public getFile(name){
            var tsb = '';
            var t = 0;
            var success = false;
            //go through the directory for the file name
            for (var s = 0; s < SECTORS && !success; s++){
                for (var b = 0; b < BLOCKS && !success; b++){
                    tsb = '' + t + s + b;
                    if (this.inUse(tsb)){
                        //check the file name
                     if(this.checkName(name, tsb)){
                         success = true
                     }
                    }
                }
            }
            if(success){
                return tsb;
            }else{
                return '';
            }
        }
        public checkName(name, tsb){
            var data = this.getData(tsb);
            if (data.localeCompare(name) === 0){
                return true;
            }else{
                return false;
            }
        }
        //Get TSB from dir
        public getTSB(tsb: string){
           var block = _HardDrive.read(tsb);
            //TODO Change how this is done
            var tsb = '' + block.charAt(1) + block.charAt(2) + block.charAt(3);
            return tsb;
        }
        //write data to the file
        public setData(TSB, data, size, isProgram){
            var limit = 60;
            var block = '';
            var i;
            if(isProgram){
                limit = limit * 2;
                block += data.substring(0, limit);
            }else{
                for (i = 0; i < data.length && i < limit; i++){
                    block += data.charCodeAt(i).toString(16);
                }
            }
            if (size <= limit){
                for (var j = i; j < BLOCK_SIZE - 4; j++){
                    block += '00';
                }
                block = '1~~~' + block;
                _HardDrive.write(TSB, block);
            }else{
                var newTSB = this.findFreeFile();
                this.setUse(newTSB, true);
                block = '1' + newTSB + block;
                _HardDrive.write(TSB, block);
                var leftovers = data.substring(limit, data.length);
                this.setData(newTSB, leftovers, size-limit, isProgram);
            }
        }
        public clearData(tsb){
            this.setUse(tsb, false);
            if(this.getTSB(tsb) === "~~~"){

            }else{
                var nextTSB = this.getTSB(tsb);
                this.clearData(nextTSB);
        }

    }

        public getData(tsb){
            var data = _HardDrive.read(tsb);
            var str = '';
            var byte = '';
            var i = 4;
            while (i +1 < BLOCK_SIZE * 2 && byte != '00'){
                byte = data.charAt(i) + data.charAt(i +1);
                i +=2;
                str += String.fromCharCode(parseInt(byte, 16));
            }
            return str;
        }
        public getHexData(tsb){
            var data = _HardDrive.read(tsb);
            data = data.substring(4, data.length);
            return data;
        }
        public listFiles(){
            var tsb = '';
            var t = 0;
            var listarr =[];

            for(var s = 0; s < SECTORS; s++){
                for(var b = 0; b < BLOCKS; b++){
                    tsb = '' + t + s + b;
                    if(this.inUse(tsb)){
                    listarr.push(this.getData(tsb));}
                }
            }
            if (listarr.length < 1){
                _StdOut.putText('There are currently no files in the directory.');
            }else{
                _StdOut.putText(listarr.toString());
            }
        }
        //out of mem, onto disk
       public rollOut(program, part, PCB){
            //if file does not exist, create it.
           var PID = PCB.pID.toString();
           var name = 'PID' + PID;
           if (this.getFile(name) !== ''){
               var dirTSB = this.getFile(name);
               var fileTSB = this.getTSB(dirTSB);
           }else{
               this.createFile(name);
               _StdOut.advanceLine();
               var dirTSB = this.getFile(name);
               var fileTSB = this.getTSB(dirTSB);
           }

            this.setUse(fileTSB, true);
            this.setData(fileTSB, program.toString(), program.length, true);
            if(part !== -1){
                _MemManager.clearPart(part);
            }
            PCB.onDisk = true;
       }
       //into mem, off disk
       public rollIn(PCB){
           var PID = PCB.pID.toString();
           var name = 'PID' + PID;
           var dirTSB = this.getFile(name);
           var TSB = this.getTSB(dirTSB);
           if (!PCB.onDisk){
               _StdOut.putText(PCB.pID + 'is already in memory');
           }else{
               var prog = this.readData(TSB, true);
               var program = prog.split(',');
               //this.clearData(TSB);
               _MemManager.load(PCB , program);
           }
       }
    }

}