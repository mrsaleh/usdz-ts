export namespace Utils{
    export function ReadBytesRange(data:DataView,offset:number,length:number):Uint8Array{
        let bytes = new Uint8Array(length);
        for(let i=0;i<bytes.length;i++){                    
            const b =  data.getUint8(offset + i);
            bytes[i] = b;
        }
        return bytes;
    }

    export function WriteBytesRange(target:DataView,offset:number,data:Uint8Array):void{        
        for(let i=0;i<length;i++){                    
            target.setUint8(offset + i,data[i]);                
        }        
    }


    export function StringFromUint8Array(buffer:Uint8Array):string{
        let result = '';
        for(let i=0;i<buffer.length;i++){
            if(buffer[i]==0)
                break;
            result += String.fromCharCode(buffer[i])
        }
        return result;
    }

    export function Assert(exp:()=>boolean){
        if(!exp())
            throw new Error(`Expression failed : ${exp.toString()}`);
        else
            console.log(`%c Passed!  ${exp}`,'color:green');
    }

    export function CopyByteRange(source:Uint8Array,sourceOffset:number,dest:Uint8Array,destOffset:number,length:number){
        for(let i=0;i<length;i++){
            source[sourceOffset + i] = dest[destOffset + i];
        }
    }

    
    export function SendDataToUserDownloads(filename:string,data:Uint8Array){
        const dataBlob = new Blob([data])    
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob)
        downloadLink.setAttribute('download', filename);    
        downloadLink.click();
    }

    export function GetFileExtension(filename:string){
        const i = filename.lastIndexOf('.')
        if(i==-1)
            return ''
        else
            return filename.substring(i);
    }

    /**
     * Arrays must have equal length that this function can compare , or 
     * it will throw an assertion error!
     * @param first 
     * @param second 
     */
    export function IsEqual(first:Array<number>,second:Array<number>) : boolean{
        //Utils.Assert(()=>first.length === second.length);
        if(first.length !== second.length)
            return false;

        for(let i=0;i<first.length;i++){
            if(first[i] !== second[i])
                return false;
        }
        return true;
    }

    export function BitsArrayToInt8Array(bits:Array<number>):Uint8Array{
        const bytesLength = Math.ceil(bits.length / 8);
        const bytes = new Uint8Array(bytesLength);
        for(let i=0;i<bits.length;i++){
            const byteIndex = Math.floor(i / 8);
            const bitOffset = i % 8;
            const bitValue = bits[i];
            if(bitValue==1)
                bytes[byteIndex] = bytes[byteIndex] | (bitValue << bitOffset);   
        }

        return bytes;

    }
}