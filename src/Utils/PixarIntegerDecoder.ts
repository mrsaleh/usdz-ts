import { Utils } from "Utils/Utils";
import { BinaryReader } from "./BinaryReader";
import { Int32, Uint8 } from "./IntegralPrimitives";
import { BitReader } from "./BitReader";


export function UndefinedGuard<T>(value:T|undefined):T{
    if(value === undefined)
        throw new Error('value can not be undefined!')
    return value;
}

/**

These integer coding & compression routines are tailored for what are typically
lists of indexes into other tables.  The binary "usdc" file format has lots of
these in its "structural sections" that define the object hierarchy.

The basic idea is to take a contiguous list of 32-bit integers and encode them
in a buffer that is not only smaller, but also still quite compressible by a
general compression algorithm, and then compress that buffer to produce a final
result.  Decompression proceeds by going in reverse.  The general compressor is
LZ4 via TfFastCompression.  The integer coding scheme implemented here is
described below.

We encode a list of integers as follows.  First we transform the input to
produce a new list of integers where each element is the difference between it
and the previous integer in the input sequence.  This is the sequence we encode.
Next we find the most common value in the sequence and write it to the output.
Then we write 2-bit codes, one for each integer, classifying it.  Finally we
write a variable length section of integer data.  The decoder uses the 2-bit
codes to understand how to interpret this variable length data.

Given a list of integers, say:

input = [123, 124, 125, 100125, 100125, 100126, 100126]

We encode as follows.  First, we transform the list to be the list of
differences to the previous integer, or the integer itself for the first element
in the list (this can be considered a difference to 0) to get:

input_diffs = [123, 1, 1, 100000, 0, 1, 0]

Then we find the most commonly occurring value in this sequence, which is '1'.
We write this most commonly occurring value into the output stream.

output = [int32(1)]

Next we write two sections, first a fixed length section, 2-bit codes per
integer, followed by a variable length section of integer data.  The two bit
code indicates what "kind" of integer we have:

00: The most common value
01:  8-bit integer
10: 16-bit integer
11: 32-bit integer

For our example this gives:

input  = [123, 124, 125, 100125, 100125, 100126, 10026]
output = [int32(1) 01 00 00 11 01 00 01 XX int8(123) int32(100000) int8(0) int8(0)]

Where 'XX' represents unused bits in the last byte of the codes section to round
up to an even number of bytes.

In this case the output size is 12 bytes compared to the original input which
was 28 bytes.  In the best possible case the output is (asymptotically) 2 bits
per integer (6.25% the original size), in the worst possible case it is
(asymptotically) 34 bits per integer (106.25% the original size).

*/
export class IntegerDecoder{                

    /**
     * Arrays must have equal length that this function can compare , or 
     * it will throw an assertion error!
     * @param first 
     * @param second 
     */
    private static IsEqual(first:Array<number>,second:Array<number>) : boolean{
        Utils.Assert(()=>first.length === second.length);
        for(let i=0;i<first.length;i++){
            if(first[i] !== second[i])
                return false;
        }
        return true;
    }


    private _mCodedBytes:Uint8Array;
    private _mCount:number;
    private _mBytesReader:BinaryReader;

    constructor(codedBytes:Uint8Array,count:number){
        this._mCodedBytes = codedBytes;
        this._mCount = count;
        this._mBytesReader = new BinaryReader(this._mCodedBytes.buffer);
    }

    public DecodeIntegers():Array<number>
    {
        console.info('decoder number count:',this._mCount);
        
        const mostCommonOccurance = this.ReadMostCommonOccuranceValue();
        const bitsReader = this.InitBitsReader();
        console.info('Most Common Occurance is :',mostCommonOccurance)
        const result = new Array<number>();
        const previousValue = new Int32(0);

        for(let i=0;i<this._mCount;i++){
            const valueType = this.ReadValueType(bitsReader) ;
            console.log(valueType)
            if(this.IsMostCommonOccurance(valueType)){
                previousValue.value += mostCommonOccurance;
                result.push(previousValue.value);
            }else if(this.Is8BitsData(valueType)){
                let int8Value = this._mBytesReader.GetInt8();                
                previousValue.value += int8Value;
                result.push(previousValue.value);
            }else if(this.Is16BitsData(valueType)){
                let int16Value = this._mBytesReader.GetInt16();                                
                previousValue.value += int16Value;
                result.push(previousValue.value);
            }else if(this.Is32BitsData(valueType)){
                let int32Value = this._mBytesReader.GetInt32();                
                previousValue.value += int32Value;
                result.push(previousValue.value);
            }
        }

        return result;    

    }        

    private Is32BitsData(valueType: number[]) {
        const Data32Bits = [1,1];
        return IntegerDecoder.IsEqual(valueType, Data32Bits);
    }

    private Is16BitsData(valueType: number[]) {
        const Data16Bits = [1,0];
        return IntegerDecoder.IsEqual(valueType, Data16Bits);
    }

    private Is8BitsData(valueType: number[]) {
        const Data8Bits = [0,1];
        return IntegerDecoder.IsEqual(valueType, Data8Bits);
    }

    private IsMostCommonOccurance(valueType: number[]) {
        const MostCommonOccuranceFlags = [0,0];
        return IntegerDecoder.IsEqual(valueType, MostCommonOccuranceFlags);
    }

    private ReadValueType(bitsReader: BitReader) {
        return Array.from(bitsReader.ReadMulti(2));
    }

    private ReadMostCommonOccuranceValue() {
        return this._mBytesReader.GetInt32();
    }

    private InitBitsReader() {
        const BitsPerByte = 8;
        const bits = this._mBytesReader.GetBytes(Math.ceil(this._mCount / BitsPerByte));
        const bitsReader = new BitReader(bits);
        return bitsReader;
    }
} 



