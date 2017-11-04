module TSOS{
    export class Pcb {
       constructor(public pID = 0,
                   public PC = 0,
                   public Acc = 0,
                   public Xreg = 0,
                   public Yreg = 0,
                   public Zflag = 0,
                   public Base = 0,
                   public Limit = 0
    ){}
    public init(pID){
           this.pID = pID;
           this.Limit = 768/pID;
           this.Base= this.Base - 256;
    }
    }
}