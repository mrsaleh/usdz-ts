import { calcUncompressedLen, uncompressBlock } from "lz4";
import {ChunkInfo} from 'Usdc/ChunkInfo'
import {Utils} from 'Utils'

export class Decompressor{
    public static ProcessChunk(chunkInfo:ChunkInfo):void{
        let currentChunkSize = chunkInfo.ChunkSize;                        
        const compressedBufferView = new DataView(chunkInfo.CompressedBuffer.buffer);

        if(chunkInfo.Count != 0){
            currentChunkSize = compressedBufferView.getInt32(chunkInfo.Offset);
            chunkInfo.Offset += 4; 
        }
        console.log(`Chunk size: ${chunkInfo.ChunkSize}`)
        console.log(`Chunk offset: ${chunkInfo.Offset}`)

        //Decompress from offset to size of compressed buffer to 
        const chunkCompressed = chunkInfo.CompressedBuffer.subarray(chunkInfo.Offset,chunkInfo.Offset+currentChunkSize)
        console.log(JSON.stringify(Array.from(chunkCompressed)) );
        const uncompressedBufferSize = chunkInfo.UncompressedBuffer.length - chunkInfo.TotalDecompressed +2;
        const chunkUncompressed = chunkInfo.UncompressedBuffer.subarray(chunkInfo.TotalDecompressed,uncompressedBufferSize);
        console.log(` uncompressed size: ${uncompressedBufferSize} chunk size: ${currentChunkSize}`);
        //This line is just used to debug which I must remove it later for performance reasons
        const precalcDecompressedSize = calcUncompressedLen(chunkCompressed);
        console.log(precalcDecompressedSize)
        console.log(chunkUncompressed.length)
        Utils.Assert(()=>precalcDecompressedSize === chunkUncompressed.length)        
        const decompressedSize = uncompressBlock(chunkCompressed,chunkUncompressed);
        console.log(`Decompressed to {decompressedSize} bytes length`)
        if (decompressedSize < 0)
        {
            throw new Error("Unexpected decompressed chunk size");
        }

        chunkInfo.Offset += currentChunkSize;
        chunkInfo.TotalDecompressed += decompressedSize;
        
    }

    public static DecompressFromBuffer(compressedBuffer:Uint8Array,workspaceSize:number):Uint8Array{
        
        const workspaceBuffer = new Uint8Array(workspaceSize);
        console.info('workspace buffer: ',workspaceSize);
        const chunkInfo = new ChunkInfo(compressedBuffer[0],compressedBuffer.length-1,
            compressedBuffer,workspaceBuffer,1);
            console.info('chunks count',chunkInfo.Count);
        if(chunkInfo.Count == 0)
            Decompressor.ProcessChunk(chunkInfo);
        else
        {            
            for(let i=0;i<chunkInfo.Count;i++){
                Decompressor.ProcessChunk(chunkInfo);
            }
        }

        if(chunkInfo.TotalDecompressed === workspaceSize){
            return workspaceBuffer;
        }

        const result = new Uint8Array(chunkInfo.TotalDecompressed);
        Utils.CopyByteRange(workspaceBuffer,0,result,0,chunkInfo.TotalDecompressed);
        
        return result;        
    }
}
