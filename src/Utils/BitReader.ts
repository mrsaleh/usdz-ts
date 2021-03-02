export class BitReader {
    _mSourceBytes: Uint8Array;
    _mBits: Uint8Array;
    _mOffset: number;

    constructor(bytes: Uint8Array) {
        this._mSourceBytes = bytes;
        this._mBits = bytes;
        this._mOffset = 0;
    }

    Read() {
        const byteIndex = Math.floor(this._mOffset / 8);
        const bitIndex = this._mOffset % 8;
        const byte = this._mSourceBytes[byteIndex];
        const mask = 1 << bitIndex;
        let resultBit = 0;
        if ((byte & mask) === mask)
            resultBit = 1;
        this._mOffset += 1;
        return resultBit;
    }

    ReadMulti(length: number): Uint8Array {
        const result = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            result[i] = this.Read();
        }
        return result;
    }
}
