export namespace Utils{
    export function ReadBytesRange(data:DataView,offset:number,length:number):Uint8Array{
        let bytes = new Uint8Array(length);
        for(let i=0;i<bytes.length;i++){                    
            const b =  data.getUint8(offset + i);
            bytes[i] = b;
        }
        return bytes;
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
}