import {IntegerEncoder} from 'Utils/PixarIntegerEncoder'
import { Utils } from 'Utils/Utils';

const input = [123, 1, 1, 100000, 0, 1, 0];

const mostCommonOccurance = 1;

const output = IntegerEncoder.CalculateBits(input,mostCommonOccurance);

//01 00 00 11 01 00 01 XX
const expectedOuput = [0,1 ,0,0 ,0,0 ,1,1 ,0,1, 0,0, 0,1]; 

const isEqual =  Utils.IsEqual(output,expectedOuput);

test('Encoder bits', () => {
    expect(isEqual).toBe(true);
});
