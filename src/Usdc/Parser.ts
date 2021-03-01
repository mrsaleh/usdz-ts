import { Utils } from 'Utils'
import 'DataViewExtension'
import { Decompressor } from 'Usdc/Decompressor';
import { UsdcField } from 'Usdc/Field';
import { IntegerDecoder } from 'Usdc/IntegerDecoder';
import { Section } from 'Usdc/Section';
import {Helpers} from 'Usdc/Helpers';
import {Version} from 'Usdc/Version';
import { BinaryReader } from 'Usdc/BinaryReader';


/**
 * Usdc format is the usd crate files designed by pixar , 
 * USD stands for Universal Scene Descriptor.
 * USDC files are binary.
 * USDC file contains a bootstrap section at start which 
 * describe the version of writer which creates the file
 * and an offset to Table of Content (TOC).
 * Table Of Content contains several sections that we read
 * and parse. Sections data compressed using lz4 compression
 * format.
 */
export class Usdc{
    reader:BinaryReader;


    constructor(filedata:ArrayBuffer){
        this.reader = new BinaryReader(filedata);
    }

    ReadToc():Array<Section>{
        const sections:Array<Section> = [];

        const sectionsCount = this.reader.GetUint64();
        console.log(`sections count: ${sectionsCount}`);        

        this.ReadSections(sectionsCount, sections);        

        return sections;
    }
    

    ReadSections(sectionsCount: number, sections: Section[]) {
        for (let i = 0; i < sectionsCount; i++) {
            const section = new Section();
            section.token = this.reader.GetString(16);
            section.offset = this.reader.GetUint64();
            section.size = this.reader.GetUint64();
            
            sections.push(section);

            console.info('section', section);

        }
    }

   
    ReadTokens(size:number){
        console.log("%cParsing TOKENS section",'color:blue');
        const tokenCount = this.reader.GetUint64();
        console.log(`Tokens count: ${tokenCount}`);
        
        const uncompressedSize = this.reader.GetUint64();
        const compressedSize = this.reader.GetUint64();
        console.log(`# of tokens = ${tokenCount}, uncompressedSize = ${uncompressedSize}, compressedSize = ${compressedSize}`);
        Utils.Assert(()=>compressedSize+24 === size )
        
        const uncompressedBuffer = this.Decompress(compressedSize, uncompressedSize);

        const tokens = Helpers.SplitTokensBufferIntoStrings(uncompressedBuffer);

        
        console.info('tokens',tokens);
        console.info('tokens.length',tokens.length);
        console.info('tokenCount',tokenCount);
        Utils.Assert(()=>tokens.length === tokenCount);
        return tokens;
    }

    ReadFields(size:number){
        const fieldsCount = this.reader.GetUint64();
        const tokenIndexesSize = this.reader.GetUint64();
        const compressedBuffer = this.reader.GetBytes(tokenIndexesSize);
        console.info('fields count:',fieldsCount);

        const workspaceSize = Helpers.GetCompressedBufferSize(Helpers.GetEncodedBufferSize(fieldsCount));   
 
        console.log(compressedBuffer)
        const uncompressedBuffer = Decompressor.DecompressFromBuffer(compressedBuffer,workspaceSize);
        console.log(Array.from(uncompressedBuffer))
        const indices = IntegerDecoder.DecodeIntegers(uncompressedBuffer,fieldsCount);
        console.log(fieldsCount)
        console.log(indices.length)
        if(indices.length != fieldsCount)
            throw new Error('Unexpected field count!');
        console.info('workspace size:',workspaceSize);                
        const repsSize = this.reader.GetUint64();
        console.info('reps size:',repsSize);
        const compressedBuffer2 = this.reader.GetBytes(repsSize);
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

    private Decompress(compressedSize: number, uncompressedSize: number) {
        const compressedBuffer = this.reader.GetBytes(compressedSize);
        const uncompressedBuffer = Decompressor.DecompressFromBuffer(compressedBuffer, uncompressedSize);                
        return uncompressedBuffer;
    }

    ReadStrings(size:number){
        const indexCount = this.reader.GetUint64();
        Utils.Assert(()=>indexCount*4+8 === size);

        const indices:Array<number> = [];
        for(let i=0;i<indexCount;i++){
            const index = this.reader.GetInt32();
            indices.push(index);
        }
        return indices;
    }    

    ReadFieldSets(size:number){
        const fieldSetCount = this.reader.GetUint64();
        const fieldSetSize = this.reader.GetUint64();

        //TODO : Complete this one
    }

    ReadPaths(size:number){
        const pathCount = this.reader.GetUint64();

    }

    ReadSpecs(size:number){

    }
    

    Parse(){        
        //BootStrap structure.  Appears at start of file, houses version, file
        //identifier string and offset to Table Of Contents.
        this.ReadBootstrap();
        const sections = this.ReadToc()
        console.log(sections.length);
        console.info('sections',sections);
        for(let i=0;i<sections.length;i++){                    
            const section = sections[i];   
            console.info('section.token',section.token);                 
            this.reader.Goto(section.offset);    

            if(section.token === 'TOKENS'){                                            
                this.ReadTokens(section.size);
            }else if(section.token === 'STRINGS'){
                console.log("%cParsing STRINGS section",'color:blue');
                this.ReadStrings(section.size);
            }else if(section.token === 'FIELDS'){                    
                console.log("%cParsing FIELDS section",'color:blue');    
                this.ReadFields(section.size);
            }else if(section.token === 'FIELDSETS'){
                console.log("%cParsing FIELDSETS section",'color:blue');
                this.ReadFieldSets(section.size);
            }else if(section.token === 'PATHS'){
                console.log("%cParsing PATHS section",'color:blue');
                this.ReadPaths(section.size);
            }else if(section.token === 'SPECS'){
                console.log("%cParsing SPECS section",'color:blue');
                this.ReadSpecs(section.size);
            }            
        }         
    }

    private ReadBootstrap() {
        const magicStringBytes = this.reader.GetString(8);
        console.log(magicStringBytes);
        Utils.Assert(() => magicStringBytes === 'PXR-USDC');
        const fileVersion = this.reader.GetVersion();
        const supportedVersion = new Version(0, 4, 0);

        console.log(`File version: ${fileVersion.major}.${fileVersion.minor}.${fileVersion.patch}`);
        if (fileVersion.IsLowerThan(supportedVersion))
            throw new Error("Unsupported usdc writer version, It is too old!");
        
        const tocOffset = this.reader.GetUint64(); //Table of content
        this.reader.Goto(tocOffset);        
    }


}