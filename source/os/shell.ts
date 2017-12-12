///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Shows the current date.");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellWhere,
                                  "whereami",
                                  "- Shows the user's current location.");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellPower,
                "morepower",
                "- Transfers more power to the engines. SOUND WARNING");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellStatus,
                "status",
                "<string> - Sets the status.");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellBSOD,
                "error",
                "- A test error.");
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand (this.shellLoad,
                "load",
                "- Loads program into memory." );
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellRun,
                "run",
                "- Runs the program specified by user.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellClearMem,
                "clearmem",
                "- Clears the entire memory.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellRunAll,
                "runall",
                "- Runs all programs in memory.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellQuantum,
                "quantum",
                "- Changes the quantum for round robin scheduling.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellPS,
                "ps",
                "- Shows all running processes.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellKill,
                "kill",
                "- kills a process.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellCreate,
                "create",
                "- Creates a file with the given filename.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellRead,
                "read",
                "- Reads the contents of the given filename")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellDelete,
                "delete",
                "- Deletes the given filename from storage.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellFormat,
                "format",
                "- Formats the drive.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellWrite,
                "write",
                "- Writes to a previously created file.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellls,
                "ls",
                "- Lists all files on the disk.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellGetSchedule,
                "getschedule",
                "- returns the currently selected scheduling algorithm.")
            this.commandList[this.commandList.length] = sc;
            sc = new ShellCommand (this.shellSetSchedule,
                "setschedule",
                "- rr, fcfs, priority. Changes the scheduling algorithm.")
            this.commandList[this.commandList.length] = sc;

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver displays the current version data for the Operating System.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown ends OS simulation. But you wouldn't do that, would you?");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears the screen and returns cursor to top of canvas.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace turns OS trace on or off. User must indicate on or off status");
                        break;
                    case "man":
                        _StdOut.putText("Man displays manual page for topic. USer must include topic. How did you even get here?");
                        break;
                    case "morepower":
                        _StdOut.putText("SOUND WARNING. Morepower transfers power to the engines.");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 does rot13 encoding on given text. For when Alan wants to curse in his code.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt changes the CLI prompt. Must provide a string.");
                        break;
                    case "date":
                        _StdOut.putText("Date shows the current (star)date.");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami shows the user's approximate location.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
         }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        public shellDate(args) {
            _StdOut.putText("The current stardate is " + Date().toLocaleString() + ".");
                //Okay, so not quite a stardate yet.
                //TODO Pick a style of stardate and express it via ts.
        }
        public shellWhere(args) {
            var locations = ['Farpoint Station', 'The Neutral Zone', 'Ceti Alpha V', 'Starfleet Academy','Rubicun III','Vulcan','Omicron Ceti III','Main Engineering aboard the USS Enterprise','The lifeless void of space. How sad','Risa' ];
            var place = locations[Math.floor(Math.random() * locations.length)];
                //Picking a "random" place to show the user each time.
            _StdOut.putText("You are current located at " + place + ".");
        }
        public shellPower(args) {
            _StdOut.putText("I'm givin' her all she's got, captain!!");
                //I know this line was never exactly said in TOS, please don't take my Trekkie cred.
            document.getElementById('body').style.backgroundImage= "url('distrib/images/warp.jpg')";
            var allshesgot = <HTMLAudioElement>document.getElementById('scottyPlayer');
            allshesgot.play();

        }
        public shellStatus(args) {
            //Go through args array to display multiple words in the status
            if (args.length > 0) {
                _Status = "";
                //set global var _Status equal to user input
                for (var i = 0; i<args.length; i++){
                    _Status += args[i] + " ";
                }
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
            TSOS.Control.dateTimeStatusUpdate();
        }

        //Sends a test error to activate the BSOD
        public shellBSOD(args){
            _Kernel.krnTrapError("Test Error, Stand By For Security Drill.");
        }

        //This was a horrible clusterfuck, so hopefully we can fix that.
        public shellLoad(args){
            //get the user input from the input box
            var userProg = (<HTMLInputElement>document.getElementById('taProgramInput')).value;
            //split it into a program array.
            var progArr = userProg.split(' ');

            if(_MemManager.validateProgram(progArr, userProg)){
              if(_MemManager.availPart() != null){
                  var PID = _MemManager.PIDList[_MemManager.PIDList.length -1];
                  var newPCB = new Pcb();
                  newPCB.init(PID);
                  if (_cpuScheduler.priority){
                      var priority;
                      if (args.length === 0){
                          newPCB.priority = 32;
                      }else{
                          newPCB.priority = parseInt(args[0]);}}
                  _PCBArr.push(newPCB);
                  _MemManager.load(newPCB, progArr);
              }  else{
                  _StdOut.putText('No memory available. Please clear the memory.');
              }
            }

        }

        public shellRun(args){
            if(args.length === 0){
                _StdOut.putText('Please provide a PID')
            }else{
                var PID = parseInt(args[0]);
                _cpuScheduler.addQueue(_PCBArr[PID]);
                _CPU.runProc(PID);
            }
        }
        public shellClearMem(){
            if (_CPU.isExecuting){
                _StdOut.putText('You may not clear memory while programs are executing.')
            }else{
            _MemManager.eraseAll();}
        }

        public shellRunAll(){
           var length = _PCBArr.length;
        for(var i = 0; i< length; i++){
            _cpuScheduler.loadQueue();
            _CPU.isExecuting = true;
        }
        }
        public shellQuantum(args){
            //Make sure the user provides a number for the quantum
            if (args.length === 0){
                _StdOut.putText('Please provide a number for the quantum');
            //Make sure the user actually provides a number, not something stupid
            }else if(isNaN(args)) {
                _StdOut.putText('The quantum must be a number.');
            }else {
                _cpuScheduler.quantum = parseInt(args);
                _StdOut.putText('Quantum successfully set to ' + args);
                }

        }
        public shellPS (){
            _StdOut.putText('Active Processes:');
            if(_cpuScheduler.readyQueue.isEmpty){
                if(_CPU.isExecuting == false){
                    _StdOut.putText(' None.');

                }else if(_CPU.isExecuting == true){
                    _StdOut.putText(_CPU.currPCB.pID.toString());
                }
            }else{
                _StdOut.putText('test');
                let procStr = _CPU.currPCB.pID + '';
                for (var i = -1; i < _cpuScheduler.readyQueue.getSize(); i++){
                    var actPID = _cpuScheduler.readyQueue.q[i].pID.toString();
                    procStr += actPID + ' ';
                }
                _StdOut.putText(procStr);
            }

        }
        public shellKill(args){
            if (args.length === 0){
                _StdOut.putText('Please provide a PID');
                //Make sure the user actually provides a number, not something stupid
            }else if(isNaN(args)) {
                _StdOut.putText('The PID must be a number.');
            }else {
                var PID = parseInt(args);
                _MemManager.clearPart(PID);
                var PCB = _PCBArr[PID];
                PCB.State = 'Terminated';
            }

        }
        public shellCreate(args){
           if (args.length < 1){
               _StdOut.putText('Please include a file name.');
           } else if (args.length > 60){
               _StdOut.putText('File names must be no longer than 60 characters.');
           }else{
               if(!_krnHardDriveDriver.formatted){
                   _StdOut.putText('The hard drive must be formatted to create a file.');
               }else{
                   _krnHardDriveDriver.createFile(args.toString());
               }
           }
        }
        public shellRead(args){
        if (_krnHardDriveDriver.formatted){
            if(args.length >0){
                _StdOut.putText(_krnHardDriveDriver.readFile(args[0]));
            }else{
                _StdOut.putText('Please include a file name.');
            }
        }else{
            _StdOut.putText('Hard drive must be formatted first.');
        }
        }
        public shellDelete(args){
            if(!_krnHardDriveDriver.formatted){
                _StdOut.putText('Hard drive must be formatted first.');
            }else if(args.length < 1){
                _StdOut.putText('Please include a file name.');
            }else{
                _krnHardDriveDriver.deleteFile(args[0]);
            }
        }
        public shellFormat(){

            if (_CPU.isExecuting === true){
                _StdOut.putText('The drive cannot be formatted while programs are running.');
            }else{
                _krnHardDriveDriver.krnHDDFormat();
            }

        }
        public shellWrite(args){
            if(!_krnHardDriveDriver.formatted){
                //Don't print out 'Yo, format the shit. That's just rude.
                _StdOut.putText('Hard drive must be formatted first.');
            }else if (args.length < 2){
                _StdOut.putText('Please include filename and \"data\" in that order.');
            }else if(args[1].charAt(0) != "\"" || args[args.length-1].charAt(args[args.length-1].length-1) != "\"") {
                _StdOut.putText('Data must be within quotation marks.');
            }else{
                var name = args[0];
                var data = '';
                for (var i = 1; i < args.length; i++){
                    //Include spaces if there's more data after
                    if ((i+1) <= args.length){
                        data +=' ';
                    }
                    data += args[i];
                }
                _krnHardDriveDriver.writeFile(name, data);
                _StdOut.putText('Data successfully written to ' + name);
            }
        }
        public shellls(){
            if(!_krnHardDriveDriver.formatted){
                _StdOut.putText('The hard drive must be formatted first.')
            }else {
                _krnHardDriveDriver.listFiles();
            }
        }
        shellSetSchedule(args){
            if (args.length < 1){
                _StdOut.putText('Please include which algorithm you would like to set (rr, fcfs, priority)');
            } else if (args[0].toLowerCase() === 'rr'){
                _cpuScheduler.RR = true;
            } else if (args[0].toLowerCase() === 'fcfs'){
                _cpuScheduler.fcfs = true;
            } else if (args[0].toLowerCase() === 'priority'){
                _cpuScheduler.priority = true;
            }else{
                _StdOut.putText('Algorithm may only be rr, fcfs, or priority.');
            }
        }
        shellGetSchedule(){
            if (_cpuScheduler.RR){
                _StdOut.putText('Round Robin Scheduling Active.')
            }else if(_cpuScheduler.fcfs){
                _StdOut.putText('First Come, First Serve Scheduling Active.');
            }else if(_cpuScheduler.priority){
                _StdOut.putText('Priority Scheduling Active.');
            }else{
                _StdOut.putText('No Algorithm selected. Defaulting to Round Robin Scheduling.');
            }
        }
    }
}
