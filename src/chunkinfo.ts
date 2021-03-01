export class ChunkInfo{
    public readonly Count:number;
    public readonly ChunkSize:number;
    public readonly CompressedBuffer:Uint8Array;
    public readonly UncompressedBuffer:Uint8Array;
    public Offset:number;
    public TotalDecompressed:number;

    constructor(count:number,chunkSize:number, compressedBuffer:Uint8Array,uncompressedBuffer:Uint8Array, offset:number){
        this.Count = count;
        this.ChunkSize = chunkSize;
        this.CompressedBuffer = compressedBuffer;
        this.UncompressedBuffer = uncompressedBuffer
        this.Offset = offset;
        this.TotalDecompressed = 0;
    }
}