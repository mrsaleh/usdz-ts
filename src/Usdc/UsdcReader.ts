import { Utils } from 'Utils/Utils'
import 'Utils/DataViewExtension'
import { Decompressor } from 'Utils/Decompressor';
import { UsdcField } from 'Usdc/Field';
import { IntegerDecoder } from 'Utils/PixarIntegerDecoder';
import { Section } from 'Usdc/Section';
import {Helpers} from 'Utils/Helpers';
import {Version} from 'Utils/Version';
import { BinaryReader } from 'Utils/BinaryReader';
import { FieldValuePair, LiveFieldSet } from 'Usdc/LiveFieldSet';


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
export class UsdcReader{
    private _mReader:BinaryReader;
    private _mTokens:Array<string>;
    private specsCount :number;
    private pathIndices :Array<number>;
    private fieldSetIndices :Array<number>;
    private specTypes :Array<number>;
    private fields:Array<UsdcField>;

    constructor(filedata:ArrayBuffer){
        this._mReader = new BinaryReader(filedata);
        this._mTokens = [];
        this.specsCount = 0;
        this.pathIndices = [];
        this.fieldSetIndices = [];
        this.specTypes = [];
        this.fields = [];
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
        
        this.fields = new Array<UsdcField>();
        for(let i=0;i<indices.length;i++){
            const field = new UsdcField(
                this._mTokens[indices[i]],
                flagsList[i]
            );
            this.fields.push(field);            
        }
        
        console.info('UsdcFields',this.fields);
    }

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
        this.specsCount = this._mReader.GetUint64();

        this.pathIndices = this.ExtractIndices(this.specsCount);

        this.fieldSetIndices = this.ExtractIndices(this.specsCount);

        this.specTypes = this.ExtractIndices(this.specsCount);
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
        
        console.log("%cBuilding Live Field Sets",'color:blue');
        this.BuildLiveFieldSets();
    }

    private BuildLiveFieldSets(){
        console.log
        const liveFieldSets = new Array<LiveFieldSet>();
        
        console.log(this.fieldSetIndices.length)

        // let start = 0;
        for(let i=0;i<this.fieldSetIndices.length;i++){
            
            // console.log(this.fieldSetIndices[i])            
            // const count = i - start;
            // console.log(`range size = count`);

            // const liveFieldSet = new LiveFieldSet(start);
            // for(let j=start;j< start + count;j++){
            //     const field = this.fields[this.fieldSetIndices[j]];
            //     const first = field.Name;
            //     const second = this.UnpackField(field);
            //     const fieldValuePair = new FieldValuePair(first,second);
            //     liveFieldSet.FieldValuePairs.push(fieldValuePair);
            // }
            // liveFieldSets.push(liveFieldSet);

            // start = i + 1;
        }
    }

    private UnpackField(field:UsdcField) :object|null{
        // TODO : Compelete this code
        return field.IsInlined ? this.UnpackInlined(field) : this.UnpackNotInlined(field);                            
    }

    private UnpackInlined(field:UsdcField){
        console.log(`Inline field: ${field.Type} payload:${field.Payload}`)
        console.info('field',field);
        return null;
    }

    private UnpackNotInlined(field:UsdcField){
        return null;
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