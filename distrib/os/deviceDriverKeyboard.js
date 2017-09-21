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
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this) || this;
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) || // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) || // digits
                (keyCode == 32) || // space
                (keyCode == 13) || // enter
                (keyCode == 8) || // backspace -- I honestly have no idea why this is broken.
                (keyCode == 9)) {
                //there has to be a cleaner way to do this
                if (isShifted) {
                    switch (keyCode) {
                        case 48:
                            keyCode = 41;
                            break;
                        case 49:
                            keyCode = 33;
                            break;
                        case 50:
                            keyCode = 64;
                            break;
                        case 51:
                            keyCode = 35;
                            break;
                        case 52:
                            keyCode = 36;
                            break;
                        case 53:
                            keyCode = 37;
                            break;
                        case 54:
                            keyCode = 94;
                            break;
                        case 55:
                            keyCode = 38;
                            break;
                        case 56:
                            keyCode = 42;
                            break;
                        case 57:
                            keyCode = 40;
                            break;
                    }
                }
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 186) && (keyCode <= 192)) || ((keyCode >= 219) && (keyCode <= 222))) {
                if (isShifted) {
                    switch (keyCode) {
                        case 186:
                            keyCode = 59; //;
                            break;
                        case 187:
                            keyCode = 43; //+
                            break;
                        case 188:
                            keyCode = 60; //<
                            break;
                        case 189:
                            keyCode = 95; //_
                            break;
                        case 190:
                            keyCode = 62; //>
                            break;
                        case 191:
                            keyCode = 63; //?
                            break;
                        case 192:
                            keyCode = 126; //~
                            break;
                        case 219:
                            keyCode = 123; //{
                            break;
                        case 220:
                            keyCode = 124; //|
                            break;
                        case 221:
                            keyCode = 125; //}
                            break;
                        case 222:
                            keyCode = 34; //"
                            break;
                    }
                    ;
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
                else {
                    switch (keyCode) {
                        case 186:
                            keyCode = 59; //;
                            break;
                        case 187:
                            keyCode = 61; //=
                            break;
                        case 188:
                            keyCode = 44; //,
                            break;
                        case 189:
                            keyCode = 45; //-
                            break;
                        case 190:
                            keyCode = 46; //.
                            break;
                        case 191:
                            keyCode = 47; ///
                            break;
                        case 192:
                            keyCode = 96; //`
                            break;
                        case 219:
                            keyCode = 91; //[
                            break;
                        case 220:
                            keyCode = 92; //\
                            break;
                        case 221:
                            keyCode = 93; //]
                            break;
                        case 222:
                            keyCode = 39; //"
                            break;
                    }
                    ;
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
