export namespace Helpers{
    const LZ4_MAX_INPUT_SIZE:number = 0x7E000000;
    const sizeOfInteger:number = 4;
    
    function GetMaxInputSize():number
    {
        return 127 * LZ4_MAX_INPUT_SIZE;
    }
    
    function LZ4_compressBound(size:number):number
    {
        return size > LZ4_MAX_INPUT_SIZE ? 0 : size + Math.floor(size / 255) + 16;
    }        
    
    export function GetCompressedBufferSize(inputSize:number):number
    {
        if (inputSize > GetMaxInputSize())
        {
            return 0;
        }
    
        if (inputSize <= LZ4_MAX_INPUT_SIZE)
        {
            return LZ4_compressBound(inputSize) + 1;
        }
        const nWholeChunks:number = Math.floor( inputSize / LZ4_MAX_INPUT_SIZE);
        const partChunkSz:number = inputSize % LZ4_MAX_INPUT_SIZE;
        let sz:number = 1 + nWholeChunks * (LZ4_compressBound(LZ4_MAX_INPUT_SIZE) +
        sizeOfInteger);
    
        if (partChunkSz > 0)
        {
            const sizeOfInteger = 4;
            sz += LZ4_compressBound(partChunkSz) + sizeOfInteger;
        }
        return sz;
    }
    
    export function GetEncodedBufferSize(count:number):number
    {            
        return count > 0 ? (sizeOfInteger) + Math.floor((count * 2 + 7) / 8) + (count * sizeOfInteger) : 0;
    }    

    export function SplitTokensBufferIntoStrings(buffer:Uint8Array) :Array<String>{
        const result = new Array<String>();
        let str = '';

        for(let i=0;i<buffer.length;i++){
            if(buffer[i] === 0){
                result.push(str);
                str = '';
            }else{
                str += String.fromCharCode(buffer[i]);
            }
        }
        if(str.trim().length>0)
            result.push(str);

        return result;
    }
}

