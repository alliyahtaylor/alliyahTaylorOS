///<reference path = "../globals.ts" />

module TSOS{

    export class hardDrive{

        public write (tsb, data){
            sessionStorage[tsb] = data;
        }
        public read(tsb){
            return sessionStorage[tsb];
        }
    }

}
