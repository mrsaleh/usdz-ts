import {Utils} from 'utils'
import { UsdcField } from "UsdcField";
import { calcUncompressedLen, uncompressBlock } from 'lz4'
import { Decompressor } from "decompressor";


//Parse USDC(USD crate) file format
export namespace USDC{

    
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

    function GetCompressedBufferSize(inputSize:number):number
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

    function GetEncodedBufferSize(count:number):number
    {            
        return count > 0 ? (sizeOfInteger) + Math.floor((count * 2 + 7) / 8) + (count * sizeOfInteger) : 0;
    }       


    class IntegerDecoder{            

        public static DecodeIntegers(codedBytes:Uint8Array, count:number):Array<number>
        {
            const bufferDataView =new DataView(codedBytes.buffer);

            const common = bufferDataView.getInt32(0);
            const numcodesBytes = Math.floor((count * 2 + 7) / 8);
            
            const codesIn = new Uint8Array(numcodesBytes);
            Utils.CopyByteRange(codedBytes,4,codesIn,0,codesIn.length);
            const vintsIn = new Uint8Array(codedBytes.length - numcodesBytes - 4);
            const vintsInDataView = new DataView(vintsIn.buffer);
            Utils.CopyByteRange(codedBytes,4 + codesIn.length,vintsIn,0,vintsIn.length);

            let vintsOffset = 0;
            let codeInOffset = 0;

            const results:Array<number> = [];

            let preVal:number = 0;
            let intsLeft = count;

            while (intsLeft > 0)
            {
                const toProcess = Math.min(intsLeft, 4);
                
                const codeByte = codesIn[codeInOffset];            

                for (let i = 0; i < count; i++)
                {
                    const x = (codeByte & (3 << (2 * i))) >> (2 * i);
                    if (x == 0) preVal += common;
                    else if (x == 1){
                        preVal += vintsInDataView.getInt8(vintsOffset);
                        vintsOffset += 1;
                    }
                    else if (x == 2){
                        preVal += vintsInDataView.getInt16(vintsOffset);
                        vintsOffset += 2;
                    }
                    else if (x == 4){
                        preVal += vintsInDataView.getInt32(vintsOffset);
                        vintsOffset += 4;
                    }
                    results.push(preVal);
                }

                codeInOffset++;
                intsLeft -= toProcess;
            }

            return results
        }        
    } 


    export class Section {
        token: string;
        offset: number;
        size: number;

        constructor(){
            this.token = '';
            this.offset = 0;
            this.size = 0;
        }

    }

    export function ReadToc(data:DataView,offset:number):Array<Section>{
        const sections:Array<Section> = [];

        const sectionsCount = data.getUint64(offset,true);
        console.log(`sections count: ${sectionsCount}`);
        console.info('data size: ',data.byteLength);
        

        offset+=8;

        for(let i=0;i<sectionsCount;i++){
            const section = new Section();
            section.token = data.getString(offset,16);
            offset+=16;
            section.offset = data.getUint64(offset,true);
            offset+=8;
            section.size = data.getUint64(offset,true);
            offset+=8;
            sections.push(section);

            console.info('section',section)

            console.info('offset: ',offset);
        }        

        return sections;
    }

    function SplitTokensBufferIntoStrings(buffer:Uint8Array) :Array<String>{
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

    export function ReadTokens(data:DataView,offset:number,size:number){
        const tokenCount = data.getUint64(offset,true);
        offset += 8;
        //read token data size
        //read compressed size
        
        const uncompressedSize = data.getUint64(offset,true);
        offset += 8;
        const compressedSize = data.getUint64(offset,true);
        offset += 8;
        console.log(`# of tokens = ${tokenCount}, uncompressedSize = ${uncompressedSize}, compressedSize = ${compressedSize}`);
        Utils.Assert(()=>compressedSize+24 === size )
        const compressedBuffer = data.getUint8Array(offset,compressedSize);
        offset += compressedSize; 
        const uncompressedBuffer = Decompressor.DecompressFromBuffer(compressedBuffer, uncompressedSize);
        const tokens = SplitTokensBufferIntoStrings(uncompressedBuffer);

        
        console.info('tokens',tokens);
        console.info('tokens.length',tokens.length);
        console.info('tokenCount',tokenCount);
        Utils.Assert(()=>tokens.length === tokenCount);
        return tokens;
    }

    export function ReadStrings(data:DataView,offset:number,size:number){
        const indexCount = data.getUint64(offset,true);
        offset += 8;
        Utils.Assert(()=>indexCount*4+8 === size);

        const indices:Array<number> = [];
        for(let i=0;i<indexCount;i++){
            const index = data.getInt32(offset);
            offset += 4;
            indices.push(index);
        }
        return indices;
    }

    export function ReadFields(data:DataView,offset:number,size:number){
        const fieldsCount = data.getUint64(offset,true);
        offset += 8;
        const tokenIndexesSize = data.getUint64(offset,true);
        offset += 8;
        const compressedBuffer = data.getUint8Array(offset,tokenIndexesSize);
        offset += tokenIndexesSize;

        const workspaceSize = GetCompressedBufferSize(GetEncodedBufferSize(fieldsCount));       
        const uncompressedBuffer = Decompressor.DecompressFromBuffer(compressedBuffer,workspaceSize);
        const indices = IntegerDecoder.DecodeIntegers(uncompressedBuffer,fieldsCount);
        console.log(fieldsCount)
        console.log(indices.length)
        if(indices.length != fieldsCount)
            throw new Error('Unexpected field count!');
        console.info('workspace size:',workspaceSize);                

        const repsSize = data.getUint64(offset);
        offset +=8;
        const compressedBuffer2 = data.getUint8Array(offset,repsSize);
        const uncompressedBuffer2 = Decompressor.DecompressFromBuffer(compressedBuffer2,fieldsCount * 8);
        const uncompressedBufferView = new DataView(uncompressedBuffer2.buffer);

        
        let bufferOffset = 0;
        const fields = new Array<UsdcField>();
        for(let i=0;i<fieldsCount;i++){            
            const field =new  UsdcField();
            //field.name = tokens[indices[i]];
            field.flags  = uncompressedBufferView.getUint64(bufferOffset);
            console.log(field.flags);
            bufferOffset += 8;
        }
        
        console.info('UsdcFields',fields);
    }

    export function ReadFieldSets(data:DataView,offset:number,size:number){
        const fieldSetCount = data.getUint64(offset,true);
        offset += 8;
        const fieldSetSize = data.getUint64(offset,true);
        offset += 8;

        //TODO : Complete this one
    }

    export function ReadPaths(data:DataView,offset:number,size:number){
        const pathCount = data.getUint64(offset,true);

    }

    export function ReadSpecs(data:DataView,offset:number,size:number){

    }


    function CompareVersion(
            firstMajor:number,firstMinor:number,firstPatch:number,
            secondMajor:number,secondMinor:number,secondPatch:number,
        ){
            if(firstMajor> secondMajor)
                return 1;
            if(firstMajor<secondMajor)
                return -1;
            if(firstMinor>secondMinor)
                return 1;
            if(firstMinor<secondMinor)
                return -1;
            if(firstPatch>secondPatch)
                return 1;
            if(firstPatch<secondPatch)
                return -1;
            return 0;
    }


    export function Parse(filedata:Uint8Array){
        console.log(filedata)
        const usdcData = new DataView(filedata.buffer);
        //BootStrap structure.  Appears at start of file, houses version, file
        //identifier string and offset to _TableOfContents.
        let offset = 0;
        const magicStringBytes = usdcData.getString(offset,8);
        offset += 8;
        console.log(magicStringBytes)
        Utils.Assert(()=>magicStringBytes ==='PXR-USDC');
        const versionBytes = Utils.ReadBytesRange(usdcData,offset,16);
        const majver = versionBytes[0];
        const minver = versionBytes[1];
        const patchver = versionBytes[2];

        console.log(`Writer version: ${majver}.${minver}.${patchver}`);

        if(CompareVersion(majver,minver,patchver,0,4,0) === -1)
            throw new Error("Unsupported usdc writer version, It is too old!");

        

        offset += 8;
        const tocOffset = usdcData.getUint64(offset,true) ; //Table of content
        offset +=8;                
        const sections = USDC.ReadToc(usdcData,tocOffset)
        console.log(sections.length);
        console.info('sections',sections);
        for(let i=0;i<sections.length;i++){                    
            const section = sections[i];   
            console.info('section.token',section.token);                 
            if(section.token === 'TOKENS'){
                console.log("%cParsing TOKENS section",'color:blue');
                USDC.ReadTokens(usdcData,section.offset,section.size);
            }else if(section.token === 'STRINGS'){
                console.log("%cParsing STRINGS section",'color:blue');
                USDC.ReadStrings(usdcData,section.offset,section.size);
            }else if(section.token === 'FIELDS'){                    
                console.log("%cParsing FIELDS section",'color:blue');    
                USDC.ReadFields(usdcData,section.offset,section.size);
            }else if(section.token === 'FIELDSETS'){
                console.log("%cParsing FIELDSETS section",'color:blue');
                USDC.ReadFieldSets(usdcData,section.offset,section.size);
            }else if(section.token === 'PATHS'){
                console.log("%cParsing PATHS section",'color:blue');
                USDC.ReadPaths(usdcData,section.offset,section.size);
            }else if(section.token === 'SPECS'){
                console.log("%cParsing SPECS section",'color:blue');
                USDC.ReadSpecs(usdcData,section.offset,section.size);
            }
            
        }         
    }
}