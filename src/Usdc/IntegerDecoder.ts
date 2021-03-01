import { Utils } from "Utils";

export class IntegerDecoder{            

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
