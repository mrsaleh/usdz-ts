import { UndefinedGuard } from "./PixarIntegerDecoder";

class Optional<T> {
    private _mValue: T | undefined;
    private _mHasValue: boolean;

    public get value(): T {
        return UndefinedGuard<T>(this._mValue);
    }

    public set value(newValue: T) {
        this._mValue = newValue;
    }

    public get HasValue(): boolean {
        return this._mHasValue;
    }

    constructor(value: T | undefined = undefined) {
        if (value !== undefined) {
            this._mValue = value;
            this._mHasValue = true;
        } else {
            this._mValue = undefined;
            this._mHasValue = false;
        }
    }
}
