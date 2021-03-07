import { Utils } from "./Utils";

export class BitWriter {
    _mBits: Array<number>;
    _mOffset: number;

    constructor() {        
        this._mOffset = 0;
        this._mBits = [];
    }

    write(bit: number) :void{
        if (bit !== 0 && bit !== 1)
            throw new Error('Bit value only can be 0 or 1');
        this._mBits.push(bit);
        this._mOffset += 1;
    }

    writeMulti(bits: Array<number>):void {        
        for (let i = 0; i < bits.length; i++) {
            const bit = bits[i];
            if (bit !== 0 && bit !== 1)
                throw new Error('Bit value only can be 0 or 1');
            this._mBits.push(bit);
        }
    }

    getAsNumbers():Array<number>{
        return this._mBits;
    }    

    getAsBytes():Uint8Array{
        return Utils.BitsArrayToInt8Array(this._mBits);
    }

    
}
