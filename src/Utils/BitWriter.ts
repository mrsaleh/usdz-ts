class BitWriter {
    _mBits: Uint8Array;
    _mOffset: number;

    constructor() {
        this._mBits = new Uint8Array();
        this._mOffset = 0;
    }

    write(bit: number) {
        if (bit !== 0 && bit !== 1)
            throw new Error('Bit value only can be 0 or 1');
        this._mBits[this._mOffset] = bit;
        this._mOffset += 1;
    }
}
