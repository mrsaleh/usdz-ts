import { BinaryReader } from "Utils/BinaryReader";
import { Int8, Int16, Int32 } from "Utils/IntegralPrimitives";
import 'Utils/DataViewExtension';
import {BitWriter} from 'Utils/BitWriter';
import { BinaryWriter } from "./BinaryWriter";
import { Utils } from "./Utils";

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

In this case the output size is 13 bytes compared to the original input which
was 28 bytes.  In the best possible case the output is (asymptotically) 2 bits
per integer (6.25% the original size), in the worst possible case it is
(asymptotically) 34 bits per integer (106.25% the original size).

*/

export class IntegerEncoder{

    constructor(){

    }

    public static CalculateDiffs(values:Array<number>):Array<number>{
        let previousValue = values[0]; //this._mData.GetInt32();
        const diffValues =  [previousValue];
        
        for(let i=1;i<values.length;i++){
            const el = values[i];
            diffValues.push(el - previousValue);
            previousValue = el;
        }
        return diffValues;   
    }

    public static FindMostCommonOccurance(values:Array<number>){
        const repeats:Array<number> = [];
        const numbers:Array<number> = [];

        for(let i=0;i<values.length;i++){
            const val = values[i];
            const valIndex = numbers.indexOf(val);
            if( valIndex === -1){
                numbers.push(val)
                repeats.push(0);
            }else
                repeats[valIndex] += 1;
        }

        let i=0;
        let max = repeats[i];
        let maxIndex = i;
        for(i=1;i<repeats.length;i++){
            if(repeats[i]>max){
                max = repeats[i];                
                maxIndex = i;
            }                
        }

        return numbers[maxIndex];
    }

    public static CalculateBits(values:Array<number>,mostCommonOccurance:number):Array<number>{
        const bits = new BitWriter();
        for(let i=0;i<values.length;i++){
            if(values[i] === mostCommonOccurance){
                bits.writeMulti([0 ,0]);
            }else if(values[i]<Int8.Max && values[i]>Int8.Min){
                bits.writeMulti([0 ,1]);
            }else if(values[i]<Int16.Max && values[i]>Int16.Min){
                bits.writeMulti([1 ,0]);
            }else if (values[i]<Int32.Max && values[i]>Int32.Min){
                bits.writeMulti([1 ,1]);
            }
        }
        
        return bits.getAsNumbers();
    }    
    

    public Encode(data:Array<number>):Uint8Array{
        const diffs = IntegerEncoder.CalculateDiffs(data);
        const mostCommonOccurance = IntegerEncoder.FindMostCommonOccurance(diffs);
        const bits = IntegerEncoder.CalculateBits(diffs,mostCommonOccurance);        
        const dictionaryBytes = Utils.BitsArrayToInt8Array(bits);

        const writer = new BinaryWriter();

        writer.PutInt32(mostCommonOccurance);
        writer.PutBytesArray(dictionaryBytes);        

        let valueIndex = 0;
        for(let i=0;i<bits.length;i+=2){
            const valueType =bits[i] * 2 + bits[i+1];
            if(valueType === 0){
                valueIndex += 1;
                
            }else if(valueType === 1){
                writer.PutInt8(diffs[valueIndex]);
                valueIndex += 1;                
                
            }else if(valueType === 2){
                writer.PutInt16(diffs[valueIndex]);
                valueIndex += 1;
                
            }else if(valueType === 3){
                writer.PutInt32(diffs[valueIndex]);
                valueIndex += 1;
                
            }
        }    

        return writer.ToUint8Array();
    }
}