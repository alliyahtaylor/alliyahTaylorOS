///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public recallBuffer = [], //for recalling old input
                    public recallIndex = -1
         ) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...

                    //Save the buffer to the recallBuffer array
                    this.recallBuffer.push(this.buffer)
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if( chr === String.fromCharCode(8)) { //Backspace Key
                    this.backspace(this.buffer.charAt(this.buffer.length-1));
                }
                  else if( chr == String.fromCharCode(9) ) // Tab
                {   //Make sure there is code to complete.
                    if (this.buffer.length > 0){
                        var tempBuffer = this.codeComplete(this.buffer);
                            if(tempBuffer.length > 0){
                                this.backspace(this.buffer);
                                this.buffer = tempBuffer;
                                this.putText(this.buffer);}
                    }
                }
                  else if (chr == String.fromCharCode(38)){
                    if (this.recallBuffer.length > 0){
                        this.codeRecallUp();
                    }

                }
                  else if(chr == String.fromCharCode(40)){
                      if (this.recallBuffer.length>0){
                      this.codeRecallDown(); }
                }
                  else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            if (this.currentYPosition > _Canvas.height){
                //A variable that equals the size of one line, used to delete a line and leave space at the bottom.
                var oneLine = _FontHeightMargin + _DefaultFontSize;
                //considering subbing out 500 and 500 for _Canvas width and height in case I change things with CSS.
                //Takes a snapshot of what is currently drawn on the canvas.
              var scrollBuffer = _DrawingContext.getImageData(0, oneLine, 500, 500);
                //Clears the canvas.
              this.clearScreen();
                //Pastes the buffer image back into the canvas.
              _DrawingContext.putImageData(scrollBuffer, 0,0)
                this.currentYPosition = _Canvas.height - oneLine;
            };
        }


        public backspace(text){
           if (text!== ""){
               //Remove the last character from the buffer (So that it's actually gone instead of 'invisible')
               this.buffer = this.buffer.slice(0,-1);
               var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
               //Move the cursor to account for the deleted character
               this.currentXPosition -= offset;
               //Draw a rectangle over the deleted character (No pattern buffer ghosts in MY transporter room.)
               _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 1, offset, this.currentFontSize* 2);

           }
        }

            //There's probably a clever way to do this.
        public codeComplete (str){
            //Consider setting up an array for manual and finding a way to pull from that
            //Otherwise, update this every time you add commands
            var commandArray = ["ver", "help", "shutdown", "cls", "man", "trace", "rot13", "prompt", "date", "whereami", "morepower", "status", "error", "load"];
            //Create an empty array to put code-complete options into.
            var optionsArray = [];
            var optionsIndex = 0;
            //Use a regular expression to find a match
            var search = new RegExp("^" + str + "\\w");
            //A for loop to go through the whole thing.
            for(var i =0; i < commandArray.length; i++) {
                if(commandArray[i].toString().match(search)){
                    optionsArray.push(commandArray[i].toString());
                }
            }
            if (optionsArray.length > 0) {
               var completion = optionsArray[optionsIndex];
                optionsIndex++;
                if (optionsIndex > optionsArray.length - 1){
                    optionsIndex = 0;}
            }
            return completion;
        };
            //code recall if you press the up key
        public codeRecallUp(){
                //If the index is smaller than the last index, let it increment up
            if (this.recallIndex < this.recallBuffer.length -1)
                //move forward through the array
                this.recallIndex++;

            if (this.buffer != "")
                    this.backspace(this.buffer);
            //set buffer to recalled code
            this.buffer = this.recallBuffer[this.recallIndex];
            //show recalled code
            this.putText(this.buffer);
            }
            //Code recall if you press the down key
        public codeRecallDown(){
            //If the index is bigger than the first index, let it increment down
            if (this.recallIndex > 0)
                //move back in the array
                this.recallIndex--;
            if (this.buffer != " ")
                this.backspace(this.buffer);
            //set the buffer to the recalled code
            this.buffer = this.recallBuffer[this.recallIndex];
            //Show recalled code
            this.putText(this.buffer);
        }
    }

}


