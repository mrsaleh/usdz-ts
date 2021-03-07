import {IntegerEncoder} from 'Utils/PixarIntegerEncoder'
import { Utils } from 'Utils/Utils';

const input = [123, 1, 1, 100000, 0, 1, 0];

const output = IntegerEncoder.FindMostCommonOccurance(input);

test('Most common occurance', () => {
    expect(output).toBe(1);
});