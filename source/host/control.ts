///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static memTable(): void {
            var display = document.getElementById('memTable');
            var htmlString = '';

            // For each row in the table, generate each column
            for(var i = 0; i < 768; i += 8){
                var iStr = i.toString();
                if(i < 10){
                    iStr = '0' + iStr;
                }
                if(i < 100){
                    iStr = '0' + iStr;
                }
                htmlString += '<tr>' + '<th>0x' + iStr + '</th>' + '<th>00</th>' + '<th>00</th>' + '<th>00</th>' + '<th>00</th>';
                htmlString += '<th>00</th>' + '<th>00</th>' + '<th>00</th>' + '<th>00</th>' + '</tr>' ;
            }
            display.innerHTML = htmlString;
        }

        public static updateMemTable(): void {
            var display = document.getElementById('memTable');
            var htmlString = '';
            var memArr = _Memory.memory;
            var memPointer = 0;

            // For each row in the table, generate each column
            for(var i = 0; i < 768; i += 8){
                var iStr = i.toString();
                if(i < 10){
                    iStr = '0' + iStr;
                }
                if(i < 100){
                    iStr = '0' + iStr;
                }
                htmlString += '<tr>' + '<th>0x' + iStr + '</th>' + '<th>' + memArr[memPointer++] + '</th>' + '<th>' + memArr[memPointer++];
                htmlString += '</th>' + '<th>' + memArr[memPointer++] + '</th>' + '<th>' + memArr[memPointer++] + '</th>';
                htmlString += '<th>' + memArr[memPointer++] + '</th>' + '<th>' + memArr[memPointer++] + '</th>' + '<th>' + memArr[memPointer++];
                htmlString += '</th>' + '<th>' + memArr[memPointer++] + '</th>' + '</tr>' ;
            }
            display.innerHTML = htmlString;
        }
        public static updateProcTable(pcb, opCode){
            var procTable = document.getElementById('procTable');
            procTable.innerHTML = '<tr><th>OpCode</th><th>PC</th><th>Acc</th><th>X</th><th>Y</th><th>Z</th></tr>' + '<tr>' +'<td>' + opCode + '</td>' + '<td>' + pcb.PC + '</td>' + '<td>' + pcb.Acc + '</td>' + '<td>' + pcb.Xreg + '</td>' + '<td>' + pcb.Yreg + '</td>' + '<td>' + pcb.Zflag + '</td>' + '</tr>';
        }


        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            //build the memory display
            Control.memTable();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
            //Update Earth Time on the host
            this.dateTimeStatusUpdate();
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            //Update Date and Status
            Control.dateTimeStatusUpdate();
            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU and Memory (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _Memory = new Memory();
            _Memory.init();
            _MemManager = new MemManager();
            _PCB = new Pcb();
            _HardDrive = new hardDrive();
            //Won't catch me forgetting to do this stuff again.
            _cpuScheduler = new cpuScheduler();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.



        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        public static dateTimeStatusUpdate(){
            //Create new date variable
            var earthTime = new Date();
            //Establishing date format so that it isn't ugly.
            var options ={
                hour: "2-digit", minute: "2-digit"
            };
            //Change the earthTime label to display the current date.
            document.getElementById("earthTimeLabel").innerHTML = "Earth Time: " + earthTime.toLocaleDateString("en-US", options);
            document.getElementById("statusLabel").innerHTML = "Current Status: " + _Status;
        }
        public static updateHardDriveTBL(){
            var table = '';
            var data = '';
            var tsb = '';
            var display = document.getElementById("hardDriveTBLBod");
            for (var t = 0; t < TRACKS; t++){
                for (var b = 0; b < BLOCKS; b++){
                    for(var s = 0; s < BLOCKS; s++){
                        tsb = '' + t + s + b;
                        data = _HardDrive.read(tsb);
                        table += "<tr><td>" + tsb + "</td><td>" + data + "</td>";
                    }
                }
            }
            display.innerHTML = table;
        }

    }
}
