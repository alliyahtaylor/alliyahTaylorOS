///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverHardDrive.ts

   Requires deviceDriver.ts
   ---------------------------------- */
//This makes me want to die :)
//HTML5 Storage is actually pretty cool, though.
var TSOS;
(function (TSOS) {
    var DeviceDriverHardDrive = /** @class */ (function (_super) {
        __extends(DeviceDriverHardDrive, _super);
        function DeviceDriverHardDrive() {
            var _this = 
            //Override base method pointers
            _super.call(this) || this;
            _this.driverEntry = _this.krnHDDDriverEntry;
            _this.formatted = false;
            return _this;
        }
        //Init
        DeviceDriverHardDrive.prototype.krnHDDDriverEntry = function () {
            this.status = 'loaded';
        };
        //Format the Hard Drive. No warnings, we die like me(mory)
        DeviceDriverHardDrive.prototype.krnHDDFormat = function () {
            //Create the Master Boot Record
            var mbr = '1~~~MBR';
            //Make an empty block
            var emptyBlock = '0~~~';
            for (var i = 0; i < BLOCK_SIZE - 4; i++) {
                emptyBlock += "00";
            }
            //write the empty blocks
            for (var t = 0; t < TRACKS; t++) {
                for (var s = 0; s < SECTORS; s++) {
                    for (var b = 0; b < BLOCKS; b++) {
                        var tsb = '' + t + s + b;
                        if (tsb === '000') {
                            _HardDrive.write(tsb, mbr);
                        }
                        else {
                            _HardDrive.write(tsb, emptyBlock);
                        }
                    }
                }
            }
            this.formatted = true;
            _StdOut.putText('Format Successful.');
        };
        //Find a free directory block
        DeviceDriverHardDrive.prototype.findFreeDir = function () {
            var t = 0;
            var resultTSB = '';
            var success = false;
            //loop through the sectors and blocks
            for (var s = 0; s < SECTORS && !success; s++) {
                for (var b = 0; b < BLOCKS && !success; b++) {
                    resultTSB = '' + t + s + b;
                    if (!this.inUse(resultTSB)) {
                        success = true;
                    }
                }
            }
            if (!success) {
                return '';
            }
            else {
                return resultTSB;
            }
        };
        //find a free data block
        DeviceDriverHardDrive.prototype.findFreeFile = function () {
            var resultTSB = '';
            var success = false;
            //loop through the possbile TSBs. Nested For loops are ugly
            //start t at 1 because this isn't a directory
            for (var t = 1; t < TRACKS && !success; t++) {
                for (var s = 0; s < SECTORS && !success; s++) {
                    for (var b = 0; b < BLOCKS && !success; b++) {
                        resultTSB = '' + t + s + b;
                        if (!this.inUse(resultTSB)) {
                            success = true;
                        }
                    }
                }
            }
            if (!success) {
                return '';
            }
            else {
                var emptyBlock = '0~~~';
                for (var i = 0; i < BLOCK_SIZE - 4; i++) {
                    emptyBlock += "00";
                }
                _HardDrive.write(resultTSB, emptyBlock);
            }
            return resultTSB;
        };
        //Create File
        DeviceDriverHardDrive.prototype.createFile = function (name) {
            var fileTSB = this.findFreeFile().toString();
            var i;
            if (fileTSB !== '') {
                this.setUse(fileTSB, true);
                //create directory block
                var dirBlock = '1' + fileTSB;
                for (i = 0; i < name.length; i++) {
                    var code = name.charCodeAt(i).toString(16).toUpperCase();
                    dirBlock += code;
                }
                //Zero the rest out
                for (i; i < BLOCK_SIZE - 4; i++) {
                    dirBlock += '00';
                }
                var dirTSB = this.findFreeDir();
                if (dirTSB !== '') {
                    _HardDrive.write(dirTSB, dirBlock);
                }
                else {
                    _StdOut.putText('No free space in the directory.');
                }
            }
            else {
                _StdOut.putText('No free file space available.');
            }
            _StdOut.putText('File ' + name + ' successfully created');
        };
        //Write File
        DeviceDriverHardDrive.prototype.writeFile = function (name, data) {
            var dirTSB = this.getFile(name);
            if (dirTSB === '') {
                _StdOut.putText('That file does not exist.');
            }
            else {
                var size = data.length;
                var fileTSB = this.getTSB(dirTSB);
                if (this.getTSB(fileTSB) !== '~~~') {
                    this.clearData(fileTSB);
                }
                this.setData(fileTSB, data, size, false);
            }
        };
        //Read File
        DeviceDriverHardDrive.prototype.readFile = function (name) {
            var TSB = this.getFile(name);
            if (TSB === '') {
                return ('That file does not exist.');
            }
            else {
                return this.readData(TSB, false);
            }
        };
        //Read Data
        DeviceDriverHardDrive.prototype.readData = function (tsb, isProgram) {
            var data = '';
            if (isProgram) {
                data = this.getHexData(tsb);
            }
            else {
                data = this.getData(tsb);
            }
            if (this.getTSB(tsb) === '~~~') {
                return data;
            }
            else {
                var newTSB = this.getTSB(tsb);
                return (data + this.readData(newTSB, isProgram));
            }
        };
        //Delete File
        DeviceDriverHardDrive.prototype.deleteFile = function (name) {
            var dirTSB = this.getFile(name);
            if (dirTSB.toString() === '') {
                _StdOut.putText('Error, file not found');
            }
            else {
                var fileTSB = this.getTSB(dirTSB);
                this.clearData(fileTSB);
                this.setUse(dirTSB, false);
                _StdOut.putText('File deleted.');
            }
        };
        //Check if something is in use
        DeviceDriverHardDrive.prototype.inUse = function (tsb) {
            if (_HardDrive.read(tsb).charAt(0) === "1") {
                return true;
            }
            else {
                return false;
            }
        };
        //set something in use
        DeviceDriverHardDrive.prototype.setUse = function (tsb, status) {
            var block = _HardDrive.read(tsb);
            block = block.slice(1, block.length - 1);
            if (status) {
                block = '1' + block;
            }
            else {
                block = '0' + block;
            }
            _HardDrive.write(tsb, block);
        };
        //Find a file by its name
        DeviceDriverHardDrive.prototype.getFile = function (name) {
            var tsb = '';
            var t = 0;
            var success = false;
            //go through the directory for the file name
            for (var s = 0; s < SECTORS && !success; s++) {
                for (var b = 0; b < BLOCKS && !success; b++) {
                    tsb = '' + t + s + b;
                    if (this.inUse(tsb)) {
                        //check the file name
                        if (this.checkName(name, tsb)) {
                            success = true;
                        }
                    }
                }
            }
            if (success) {
                return tsb;
            }
            else {
                return '';
            }
        };
        DeviceDriverHardDrive.prototype.checkName = function (name, tsb) {
            var data = this.getData(tsb);
            if (data.localeCompare(name) === 0) {
                return true;
            }
            else {
                return false;
            }
        };
        //Get TSB from dir
        DeviceDriverHardDrive.prototype.getTSB = function (tsb) {
            var block = _HardDrive.read(tsb);
            //TODO Change how this is done
            var tsb = '' + block.charAt(1) + block.charAt(2) + block.charAt(3);
            return tsb;
        };
        //write data to the file
        DeviceDriverHardDrive.prototype.setData = function (TSB, data, size, isProgram) {
            var limit = 60;
            var block = '';
            var i;
            if (isProgram) {
                limit = limit * 2;
                block += data.substring(0, limit);
            }
            else {
                for (i = 0; i < data.length && i < limit; i++) {
                    block += data.charCodeAt(i).toString(16);
                }
            }
            if (size <= limit) {
                for (var j = i; j < BLOCK_SIZE - 4; j++) {
                    block += '00';
                }
                block = '1~~~' + block;
                _HardDrive.write(TSB, block);
            }
            else {
                var newTSB = this.findFreeFile();
                this.setUse(newTSB, true);
                block = '1' + newTSB + block;
                _HardDrive.write(TSB, block);
                var leftovers = data.substring(limit, data.length);
                this.setData(newTSB, leftovers, size - limit, isProgram);
            }
        };
        DeviceDriverHardDrive.prototype.clearData = function (tsb) {
            this.setUse(tsb, false);
            if (this.getTSB(tsb) === "~~~") {
            }
            else {
                var nextTSB = this.getTSB(tsb);
                this.clearData(nextTSB);
            }
        };
        DeviceDriverHardDrive.prototype.getData = function (tsb) {
            var data = _HardDrive.read(tsb);
            var str = '';
            var byte = '';
            var i = 4;
            while (i + 1 < BLOCK_SIZE * 2 && byte != '00') {
                byte = data.charAt(i) + data.charAt(i + 1);
                i += 2;
                str += String.fromCharCode(parseInt(byte, 16));
            }
            return str;
        };
        DeviceDriverHardDrive.prototype.getHexData = function (tsb) {
            var data = _HardDrive.read(tsb);
            data = data.substring(4, data.length);
            return data;
        };
        DeviceDriverHardDrive.prototype.listFiles = function () {
            var tsb = '';
            var t = 0;
            var listarr = [];
            for (var s = 0; s < SECTORS; s++) {
                for (var b = 0; b < BLOCKS; b++) {
                    tsb = '' + t + s + b;
                    if (this.inUse(tsb)) {
                        listarr.push(this.getData(tsb));
                    }
                }
            }
            if (listarr.length < 1) {
                _StdOut.putText('There are currently no files in the directory.');
            }
            else {
                _StdOut.putText(listarr.toString());
            }
        };
        //out of mem, onto disk
        DeviceDriverHardDrive.prototype.rollOut = function (program, part, PCB) {
            //if file does not exist, create it.
            var PID = PCB.pID.toString();
            var name = 'PID' + PID;
            if (this.getFile(name) !== '') {
                var dirTSB = this.getFile(name);
                var fileTSB = this.getTSB(dirTSB);
            }
            else {
                this.createFile(name);
                _StdOut.advanceLine();
                var dirTSB = this.getFile(name);
                var fileTSB = this.getTSB(dirTSB);
            }
            this.setUse(fileTSB, true);
            this.setData(fileTSB, program.toString(), program.length, true);
            if (part !== -1) {
                _MemManager.clearPart(part);
            }
            PCB.onDisk = true;
        };
        //into mem, off disk
        DeviceDriverHardDrive.prototype.rollIn = function (PCB) {
            var PID = PCB.pID.toString();
            var name = 'PID' + PID;
            var dirTSB = this.getFile(name);
            var TSB = this.getTSB(dirTSB);
            if (!PCB.onDisk) {
                _StdOut.putText(PCB.pID + 'is already in memory');
            }
            else {
                var prog = this.readData(TSB, true);
                var program = prog.split(',');
                //this.clearData(TSB);
                _MemManager.load(PCB, program);
            }
        };
        return DeviceDriverHardDrive;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverHardDrive = DeviceDriverHardDrive;
})(TSOS || (TSOS = {}));
