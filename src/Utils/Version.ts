export class Version {
    major: number;
    minor: number;
    patch: number;

    constructor(_major:number,_minor:number,_patch:number){
        this.major = _major;
        this.minor = _minor;
        this.patch = _patch;
    }

    Compare(other:Version):number{
        return Version.Compare(this,other);
    }

    IsGreateThan(other:Version):boolean{
        return (this.Compare(other) === -1)
    }

    IsGreateEqualThan(other:Version):boolean{
        return (this.Compare(other) === -1) || (this.Compare(other) === 0)
    }

    IsLowerThan(other:Version):boolean{
        return (this.Compare(other) === -1)
    }

    IsLowerEqualThan(other:Version):boolean{
        return (this.Compare(other) === -1) || (this.Compare(other) === 0)
    }    

    static Compare(
        first:Version ,
        second:Version ,
    ){
        if(first.major> second.major)
            return 1;
        if(first.major<second.major)
            return -1;
        if(first.minor>second.minor)
            return 1;
        if(first.minor<second.minor)
            return -1;
        if(first.patch>second.patch)
            return 1;
        if(first.patch<second.patch)
            return -1;
        return 0;
    }    
}


