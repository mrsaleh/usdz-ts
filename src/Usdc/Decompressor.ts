import { calcUncompressedLen, uncompressBlock } from "lz4";
import {ChunkInfo} from 'Usdc/ChunkInfo'
import {Utils} from 'Utils'
import { BinaryReader } from "Usdc//BinaryReader";
import { BinaryWriter } from "./BinaryWriter";


export class Decompressor{    
    public static DecompressFromBuffer(compressedBuffer:Uint8Array,workspaceSize:number):Uint8Array{
        const compressedReader = new BinaryReader(compressedBuffer.buffer);
        const uncompressedWriter = new BinaryWriter(workspaceSize);        


        const chunkCount = compressedReader.GetByte();
        console.log(`Chunk count: ${chunkCount}`);
        if(chunkCount === 0){                        
            const compressedBytes = compressedReader.GetRemainingBytes();            
            uncompressedWriter.Decompress(compressedBytes);            
        }else{                        
            for(let i=0;i<chunkCount;i++){
                const compressedChunkSize = compressedReader.GetInt32();
                const compressedChunkData = compressedReader.GetBytes(compressedChunkSize);
                uncompressedWriter.Decompress(compressedChunkData);            
            }    
        }


        return uncompressedWriter.ToUint8Array();
    }
}
