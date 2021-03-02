import { Version } from "./Version";
import {uncompressBlock} from 'Utils/lz4'

export class BinaryReader{
    private _mData:DataView;    
    private _mOffset:number;
    private _mLittleEndian:boolean;

    constructor(filedata:ArrayBuffer,littleEndian:boolean = true){
        this._mOffset = 0;
        this._mData = new DataView(filedata);
        this._mLittleEndian = littleEndian;
    }

    public GetUint64() :number{
        const value = this._mData.getUint64(this._mOffset, this._mLittleEndian);
        this._mOffset += 8;
        return value;
    }

    public GetInt8():number{
        const value = this._mData.getInt8(this._mOffset);
        this._mOffset += 1;
        return value;
    }

    public GetInt16():number{
        const value = this._mData.getInt16(this._mOffset,this._mLittleEndian);
        this._mOffset += 1;
        return value;
    }

    public GetInt32() :number{
        const value = this._mData.getInt32(this._mOffset, this._mLittleEndian);
        this._mOffset += 4;
        return value;
    }

    public GetString(length:number) :string{
        const value = this._mData.getString(this._mOffset, length);
        this._mOffset += length;
        return value;
    }

    public GetByte():number{                         
        const value = this._mData.getUint8(this._mOffset);
        this._mOffset += 1;
        return value;
    }

    public GetBytes(length:number) :Uint8Array{
        const value = this._mData.getUint8Array(this._mOffset, length);
        this._mOffset += length;
        return value;
    }

    public GetRemainingBytes():Uint8Array{
        const value = this._mData.getUint8Array(this._mOffset, this._mData.byteLength - this._mOffset );
        return value;
    }

    public GetVersion() : Version {
        const versionBytes = this.GetBytes(3);
        const major = versionBytes[0];
        const minor = versionBytes[1];
        const patch = versionBytes[2];
        const version = new Version(major, minor, patch);
        //5 bytes of version are unused
        this.Skip(5);
        return version;
    }

    public Skip(length:number) :void {
        this._mOffset += length;
    }

    public Goto(offset:number) :void{
        this._mOffset = offset;
    }

    public Decompress(length:number,dest:Uint8Array):number{
        return uncompressBlock(this.GetBytes(length),dest);       
    }

}