import {IntegerEncoder} from 'Utils/PixarIntegerEncoder'
import { Utils } from 'Utils/Utils';

//input  = [123, 124, 125, 100125, 100125, 100126, 10026]
//input_diffs = [123, 1, 1, 100000, 0, 1, 0]
//output = [int32(1) 01 00 00 11 01 00 01 XX int8(123) int32(100000) int8(0) int8(0)]

const input = [123, 124, 125, 100125, 100125, 100126, 100126]

const encoder = new IntegerEncoder();

const encodedData: Uint8Array= encoder.Encode(input);


test('Encoder bits', () => {
    expect(encodedData.length).toBe(13);
});
