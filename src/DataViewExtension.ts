import {Utils} from 'Utils'

declare global {
    //DataView Extension for easier use
    export interface DataView{
        getInt64(byteOffset:number,littleEndian?:boolean):number;
        getUint64(byteOffset:number,littleEndian?:boolean):number;
        getUint8Array(byteOffset:number,length:number):Uint8Array;
        getString(byteOffset:number,length:number):string;    
    }            
}

const shift:number = 2**32;

DataView.prototype.getUint64 = function (byteOffset:number,littleEndian?:boolean){

    // split 64-bit number into two 32-bit parts
    let left =  this.getUint32(byteOffset, littleEndian);
    let right = this.getUint32(byteOffset + 4, littleEndian);  
    
    // combine the two 32-bit values
    const combined = littleEndian? left + shift*right : shift* left + right;
    
    //if (!Number.isSafeInteger(combined))
        //console.warn(combined, 'exceeds MAX_SAFE_INTEGER. Precision may be lost.');
    
    return combined;
}

DataView.prototype.getInt64 = function (byteOffset:number,littleEndian?:boolean){

    // split 64-bit number into two 32-bit parts
    let left =  this.getInt32(byteOffset, littleEndian);
    let right = this.getInt32(byteOffset + 4, littleEndian);  
    
    // combine the two 32-bit values
    const combined = littleEndian? left + shift*right : shift* left + right;
    
    //if (!Number.isSafeInteger(combined))
        //console.warn(combined, 'exceeds MAX_SAFE_INTEGER. Precision may be lost.');
    
    return combined;
}
    
DataView.prototype.getUint8Array = function (byteOffset:number,length:number){
    return Utils.ReadBytesRange(this,byteOffset,length);    
}

DataView.prototype.getString = function (byteOffset:number,length:number){
    return Utils.StringFromUint8Array(Utils.ReadBytesRange(this,byteOffset,length)); 
}