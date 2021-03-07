import {calcUncompressedLen, compressBlock,uncompressBlock} from 'Utils/lz4'
import { Utils } from 'Utils/Utils';



export class BinaryWriter{
    private _mOffset:number;
    private _mData:DataView;
    private _mBuffer:Uint8Array;
    private _mCapacity:number;    
    private _mLittleEndian:boolean;
    private _mAllowedToExtend:boolean;

    constructor(capacity:number = 32){
        this._mOffset = 0;
        this._mCapacity = capacity;        
        this._mBuffer = new Uint8Array(capacity);
        this._mData = new DataView(this._mBuffer.buffer);
        this._mLittleEndian = true;
        this._mAllowedToExtend = true;
    }

    public SetUnderlyingBuffer(userBuffer:Uint8Array,allowedToExtend:boolean = false){
        this._mBuffer = userBuffer;
        this._mData = new DataView(this._mBuffer.buffer);
        this._mAllowedToExtend = allowedToExtend;
    }
    

    private Extend():void{
        if(this._mAllowedToExtend){
            const oldData = this._mBuffer;
            this._mBuffer = new Uint8Array(this._mCapacity * 2);
            this._mBuffer.set(oldData);            
        }
    }    

    private CheckExtend(bytesCount:number){
        if(this._mOffset + bytesCount>=this._mCapacity)
            this.Extend();
    }

    public IsAtEndOfBuffer(){
        return (this._mOffset >=this._mData.byteLength);
    }

    public PutBytesArray(bytes:Uint8Array){
        this.CheckExtend(bytes.length);
        for(let i=0;i<bytes.length;i++){
            this._mData.setInt8(this._mOffset,bytes[i]);
            this._mOffset += 1;
        }                
    }
   
    public PutInt8(value:number):number{
        this.CheckExtend(1);
        this._mData.setInt8(this._mOffset,value);
        this._mOffset += 1;
        return value;
    }

    public PutInt16(value:number):number{
        this.CheckExtend(2);
        this._mData.setInt16(this._mOffset,value,this._mLittleEndian);
        this._mOffset += 2;
        return value;
    }

    public PutInt32(value:number) :number{
        this.CheckExtend(4);
        this._mData.setInt32(this._mOffset,value, this._mLittleEndian);
        this._mOffset += 4;
        return value;
    }    

    public PutUint64(value:bigint) :void{
        this.CheckExtend(8);
        this._mData.setBigUint64(this._mOffset,value, this._mLittleEndian);
        this._mOffset += 8;        
    }

    public PutInt64(value:bigint) :void{
        this.CheckExtend(8);
        this._mData.setBigInt64(this._mOffset,value, this._mLittleEndian);
        this._mOffset += 8;        
    }


    public Compress(uncompressedData:Uint8Array){
        const target = this._mBuffer.slice(this._mOffset);        
        const compressedDataSize = compressBlock(uncompressedData,target,0);
        this._mOffset += compressedDataSize;
    }

    public Decompress(compressedData:Uint8Array){
        const expectedUncompressBufferSize = calcUncompressedLen(compressedData);
        console.info('expectedUncompressBufferSize',expectedUncompressBufferSize)
        const uncompressedBytes =  new Uint8Array(expectedUncompressBufferSize);
        const uncompressedBytesLength = uncompressBlock(compressedData,uncompressedBytes);
        Utils.Assert(()=>expectedUncompressBufferSize ===  uncompressedBytesLength);            

        for(let i=0;i<uncompressedBytesLength;i++){
            this._mData.setUint8(this._mOffset,uncompressedBytes[i]);            
            this._mOffset++;
        }
            
        this._mOffset += uncompressedBytesLength;
    }

    public ToUint8Array():Uint8Array{
        return this._mBuffer.slice(0,this._mOffset );
    }
}