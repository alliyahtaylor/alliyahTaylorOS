module TSOS{
    export class Pcb {
       constructor(public pID = 0,
                   public PC = 0,
                   public Acc = 0,
                   public Xreg = 0,
                   public Yreg = 0,
                   public Zflag = 0,
                   public Base = 0,
                   public Limit = 0,
                   public State = ''
    ){}
    //TODO Fix this awful Base/Limit thing you have going on wtf
        public init(pID){
               this.pID = pID;
               this.Limit = 768/pID+1;
               this.Base= this.Limit - 256;
         }

        public update(PC, Acc, XReg, YReg, Zflag){
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = XReg;
            this.Yreg = YReg;
            this.Zflag = Zflag;
        }
    }
}