import { Utils } from 'Utils/Utils'
import 'Utils/DataViewExtension'
import { Decompressor } from 'Utils/Decompressor';
import { UsdcField } from 'Usdc/Field';
import { IntegerDecoder } from 'Utils/PixarIntegerDecoder';
import { Section } from 'Usdc/Section';
import {Helpers} from 'Utils/Helpers';
import {Version} from 'Utils/Version';
import { BinaryReader } from 'Utils/BinaryReader';


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
    _mReader:BinaryReader;
    _mTokens:Array<string>

    constructor(filedata:ArrayBuffer){
        this._mReader = new BinaryReader(filedata);
        this._mTokens = [];
    }

    ReadToc():Array<Section>{
        const sections:Array<Section> = [];

        const sectionsCount = this._mReader.GetUint64();
        console.log(`sections count: ${sectionsCount}`);        

        this.ReadSections(sectionsCount, sections);        

        return sections;
    }
    

    ReadSections(sectionsCount: number, sections: Section[]) {
        for (let i = 0; i < sectionsCount; i++) {
            const section = new Section();
            section.token = this._mReader.GetString(16);
            section.offset = this._mReader.GetUint64();
            section.size = this._mReader.GetUint64();
            
            sections.push(section);

            console.info('section', section);

        }
    }

   
    ReadTokens(size:number):void{
        console.log("%cParsing TOKENS section",'color:blue');
        const tokenCount = this._mReader.GetUint64();
        console.log(`Tokens count: ${tokenCount}`);
        
        const uncompressedSize = this._mReader.GetUint64();
        const compressedSize = this._mReader.GetUint64();
        console.log(`# of tokens = ${tokenCount}, uncompressedSize = ${uncompressedSize}, compressedSize = ${compressedSize}`);
        Utils.Assert(()=>compressedSize+24 === size )
        
        const uncompressedBuffer = this.Decompress(compressedSize, uncompressedSize);

        this._mTokens = Helpers.SplitTokensBufferIntoStrings(uncompressedBuffer);
        
        console.info('tokens',this._mTokens);
        console.info('tokens.length',this._mTokens.length);
        console.info('tokenCount',tokenCount);
        Utils.Assert(()=>this._mTokens.length === tokenCount);
    }

    ReadFields(size:number){
        const  indices = this.ExtractIndices();                


        const repsSize = this._mReader.GetUint64();
        console.info('reps size:',repsSize);
        

        const flagsListBytes = this.Decompress(repsSize,indices.length * 8)
        const flagsListReader = new BinaryReader(flagsListBytes.buffer);        
        const flagsList = new Array<number>();        
        for(let i=0;i<indices.length;i++){
            flagsList.push(flagsListReader.GetUint64());
        }
        
        const fields = new Array<UsdcField>();
        for(let i=0;i<indices.length;i++){
            const field = new UsdcField();
            field.name = this._mTokens[indices[i]];
            field.flags = flagsList[i];
            fields.push(field);            
        }
        
        console.info('UsdcFields',fields);
    }

    /*
    private ExtractIndices2(indicesCount: number):Array<number> {
        const indicesSize = this._mReader.GetUint64();
        const compressedBuffer = this._mReader.GetBytes(indicesSize);
        const uncompressedSize = Helpers.GetUncompressedSize(Helpers.GetEncodedBufferSize(indicesCount));
        const uncompressedBuffer = Decompressor.DecompressFromBuffer(compressedBuffer, uncompressedSize);
        const indicesDecoder = new IntegerDecoder(uncompressedBuffer, indicesCount);
        const indices = indicesDecoder.DecodeIntegers();
        Utils.Assert(() => indices.length == indicesCount);
        console.log(indices);
        return indices;
    }
    */

    private ExtractIndices(indicesCount:number|undefined = undefined) {
        if(indicesCount === undefined)
            indicesCount = this._mReader.GetUint64();
        const indicesSize = this._mReader.GetUint64();
        const compressedBuffer = this._mReader.GetBytes(indicesSize);        
        const uncompressedSize = Helpers.GetUncompressedSize(Helpers.GetEncodedBufferSize(indicesCount));
        const uncompressedBuffer = Decompressor.DecompressFromBuffer(compressedBuffer, uncompressedSize);
        const indicesDecoder = new IntegerDecoder(uncompressedBuffer, indicesCount);
        const indices = indicesDecoder.DecodeIntegers();
        Utils.Assert(()=>indices.length == indicesCount)            
        console.log(indices);
        return  indices ;
    }

    private Decompress(compressedSize: number, uncompressedSize: number) {
        const compressedBuffer = this._mReader.GetBytes(compressedSize);
        const uncompressedBuffer = Decompressor.DecompressFromBuffer(compressedBuffer, uncompressedSize);                
        return uncompressedBuffer;
    }

    ReadStrings(size:number){
        const indexCount = this._mReader.GetUint64();
        Utils.Assert(()=>indexCount*4+8 === size);

        const indices:Array<number> = [];
        for(let i=0;i<indexCount;i++){
            const index = this._mReader.GetInt32();
            indices.push(index);
        }
        return indices;
    }    

    ReadFieldSets(size:number){
        const fieldSetsIndices = this.ExtractIndices();

        //TODO : Complete this one
    }

    ReadPaths(size:number){
        const pathesCount = this._mReader.GetUint64();

        // We build up three integer arrays representing the paths:
        // - pathIndexes[] :
        //     the index in _paths corresponding to this item.
        // - elementTokenIndexes[] :
        //     the element to append to the parent to get this path -- negative
        //     elements are prim property path elements.
        // - jumps[] :
        //     0=only a sibling, -1=only a child, -2=leaf, else has both, positive
        //     sibling index offset.
        //
        // This is vaguely similar to the _PathItemHeader struct used in prior
        // versions.

        // Write the # of encoded paths.  This can differ from the size of _paths
        // since we do not write out the empty path.

        const pathesIndices = this.ExtractIndices();
        console.log(pathesIndices);

        const elementTokenIndexes = this.ExtractIndices(pathesCount);

        const jumps = this.ExtractIndices(pathesCount);
        
    }

    

    ReadSpecs(size:number){
        const specsCount = this._mReader.GetUint64();

        const pathIndices = this.ExtractIndices(specsCount);

        const fieldSetIndices = this.ExtractIndices(specsCount);

        const specTypes = this.ExtractIndices(specsCount);
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
            this._mReader.Goto(section.offset);    

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
        const magicStringBytes = this._mReader.GetString(8);
        console.log(magicStringBytes);
        Utils.Assert(() => magicStringBytes === 'PXR-USDC');
        const fileVersion = this._mReader.GetVersion();
        const supportedVersion = new Version(0, 4, 0);

        console.log(`File version: ${fileVersion.major}.${fileVersion.minor}.${fileVersion.patch}`);
        if (fileVersion.IsLowerThan(supportedVersion))
            throw new Error("Unsupported usdc writer version, It is too old!");
        
        const tocOffset = this._mReader.GetUint64(); //Table of content
        this._mReader.Goto(tocOffset);        
    }


}