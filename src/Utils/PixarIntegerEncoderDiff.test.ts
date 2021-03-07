import {IntegerEncoder} from 'Utils/PixarIntegerEncoder'
import { Utils } from 'Utils/Utils';

const input = [123, 124, 125, 100125, 100125, 100126, 100126];
const expected_output = [123, 1, 1, 100000, 0, 1, 0];

const output = IntegerEncoder.CalculateDiffs(input);

const isEqual = Utils.IsEqual(expected_output,output);

test('Diff Array', () => {
    expect(isEqual).toBe(true);
});