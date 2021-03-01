import {calcUncompressedLen, compressBlock,uncompressBlock} from 'lz4'
import { Utils } from 'Utils';

export class BinaryWriter{
    private _mOffset:number;
    private _mData:DataView;
    private _mBuffer:Uint8Array;

    constructor(length:number){
        this._mOffset = 0;
        this._mBuffer = new Uint8Array(length);
        this._mData = new DataView(this._mBuffer.buffer);
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
        return this._mBuffer;
    }
}