import {Utils} from 'Utils/Utils'


/**
 * Zip archives are files with some records , for example we have file records , which
 * contain file description and data. Records distinguish by their first 4 bytes which 
 * is their signature
 */
export namespace Zip{    
    
    export class Archive{
        private _mZipFile:File
        private _mBytes : ArrayBuffer;
        private _mBytesView : DataView;
        private _mLoaded :boolean;

        constructor(zipFile:File){            
            this._mZipFile = zipFile;   
            this._mBytes = new ArrayBuffer(0);         
            this._mBytesView = new DataView(this._mBytes);
            this._mLoaded = false;
        }

        public async Load():Promise<void>{
            this._mBytes = await this._mZipFile.arrayBuffer();
            this._mBytesView = new DataView(this._mBytes);
            this._mLoaded = true;
        }
        
        private GotoNextRecord(offset: number, file: SimplifiedFileRecord) {
            Utils.Assert(()=>this._mLoaded === true);
            offset = file.dataOffset + file.compressedSize;
            return offset;
        }

        public QueryFilesRecords():Array<SimplifiedFileRecord>{
            Utils.Assert(()=>this._mLoaded === true);

            const records :Array<SimplifiedFileRecord> = []
            
            let offset = 0;
            while(true){
                const sig = ReadSignature(this._mBytesView,offset);
                if(sig === FileSignature ){
                    const file = ReadFileRecord(this._mBytesView,offset);
                    records.push(file);
                    offset = this.GotoNextRecord(offset, file);                    
                }else if (sig === EndOfCentralDirectorySignature){
                    console.warn('Zip.Archive: Now we don\'t support End Of Central Directory record!');
                    break;
                }else if(sig === CentralDirectorySignature){
                    console.warn('Zip.Archive: Now we don\'t support Central Directory Header record!');
                    break;
                }else{
                    console.error('Zip.Archive: Unsupported record!');
                    break;
                }              
            }
    
            return records;
            
        }

        public ExtractFileData(file: SimplifiedFileRecord) {
            Utils.Assert(()=>this._mLoaded === true);
            return this._mBytes.slice(file.dataOffset, file.dataOffset + file.uncompressedSize);
        }

        
    }


    const CentralDirectorySignature = 0x02014b50; // Central Directory Header signature
    const EndOfCentralDirectorySignature = 0x06054b50; //End Of Central Directory signature
    const FileSignature = 0x04034b50; //local File Header signature

    export class SimplifiedFileRecord{
        filename:string;
        compressedSize:number;
        uncompressedSize:number;
        modificationTime:number;
        modificationDate:number;
        uncompressedCrc32:number;
        compressionMethod:number;
        dataOffset:number;

        constructor(){
            this.filename = '';
            this.compressedSize = 0;
            this.uncompressedSize = 0;
            this.modificationTime = 0;
            this.modificationDate= 0;
            this.uncompressedCrc32 =0;
            this.compressionMethod=0;
            this.dataOffset = 0;
        }
    }

    const FileRecordDescription = {
        signature:4,
        version:2,
        generalPurposeBitFlag:2,
        compressionMethod:2,
        lastModificationTime:2,
        lastModificationDate:2,
        crc32:4,
        compressedSize:4,
        uncompressedSize:4,
        filenameLength:2,
        extraFieldLength:2
    }

    class FileRecord {
        signature:number;
        version:number;
        generalPurposeBitFlag:number;
        compressionMethod:number;
        lastModificationTime:number;
        lastModificationDate:number;
        crc32:number;
        compressedSize:number;
        uncompressedSize:number;
        filenameLength:number;
        extraFieldLength:number;

        constructor(){
            this.signature =0;
            this.version =0;
            this.generalPurposeBitFlag =0;
            this.compressionMethod=0;
            this.lastModificationTime=0;
            this.lastModificationDate = 0;
            this.crc32 = 0;
            this.compressedSize =0;
            this.uncompressedSize=0;
            this.filenameLength =0;
            this.extraFieldLength =0;
        }
    }

    function ReadRecord<T>(data:DataView,record:any,recordDescription:any,signature:number,offset:number) : T{        
        record['signature'] = data.getUint32(offset,true)
        offset += 4;    
        if(record['signature'] !== signature)
            throw 'Invalid zip record format';
        
        for(const field in recordDescription){  
            //Skips signature field ,because the function read this before to validate the record type
            if(field === 'signature')    
                continue;

            const fieldBytesSize = recordDescription[field]            
            switch(fieldBytesSize){
                case 2:
                    {
                        const value = data.getUint16(offset,true);
                        record[field] = value;
                    }                    
                    break;
                case 4:
                    {
                        const value = data.getUint32(offset,true);
                        record[field] = value;
                    }                
                    break;
            }
            offset+=fieldBytesSize;
        }
        return record;
    }

    function getRecordSize(recordDescription:any){
        let size = 0;
        for(const field in recordDescription){
            size += recordDescription[field]
        }
        return size;
    }

    function ReadLFHRecord(data:DataView,offset:number):FileRecord{        
        const record = new FileRecord();
        return ReadRecord<FileRecord>(data,record,FileRecordDescription,FileSignature,offset);
    }        

    function ReadFileRecord(data:DataView,offset:number) :SimplifiedFileRecord{
        const recordSize = getRecordSize(FileRecordDescription)
        const record = ReadLFHRecord(data,offset);
        const filenameBytes = Utils.ReadBytesRange(data,offset+recordSize,record.filenameLength);
        const filename = Utils.StringFromUint8Array(filenameBytes);
        const extraFieldOffset = offset+recordSize+record.filenameLength;
        const extraFieldBytes = Utils.ReadBytesRange(data,extraFieldOffset,record.extraFieldLength);

        const fileHeader = new SimplifiedFileRecord();
        fileHeader.compressedSize = record.compressedSize;
        fileHeader.uncompressedSize = record.uncompressedSize;
        fileHeader.compressionMethod = record.compressionMethod;
        fileHeader.filename = filename;
        fileHeader.modificationDate = record.lastModificationDate;
        fileHeader.modificationTime = record.lastModificationTime;
        fileHeader.uncompressedCrc32 = record.crc32;
        fileHeader.dataOffset = extraFieldOffset + record.extraFieldLength;

        return fileHeader;
    }
    
    function ReadSignature(data:DataView,offset:number){
        return data.getUint32(offset,true);
    }    

}