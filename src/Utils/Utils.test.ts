import { Utils } from "Utils/Utils";

test('Array comparision',()=>{
    expect(Utils.IsEqual([1,2,3,4],[1,2,3,4])).toBe(true);
}) 

test('Bits to Bytes',()=>{
    const input = [0,0,0,0,0,0,1,1];
    const output = Utils.BitsArrayToInt8Array(input);    
    const expectedOuput = new Uint8Array([192]) ;
    expect(Utils.IsEqual(Array.from(output),Array.from(expectedOuput))).toBe(true);
})


test('Big numbers for 64 bit',()=>{
    const n :number=  18446744073709551615;    
    expect(n).toBe(18446744073709551615);
})