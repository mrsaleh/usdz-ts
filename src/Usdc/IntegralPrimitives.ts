/**
 * Equivalent to Unsigned Char
 */
export class Uint8{
    public static Max = 255;
    public static Min = 0;
    public static SizeInBytes = 1;
    
    private _mValue:Uint8Array;


    constructor(value:number){
        this._mValue = new Uint8Array(1);
        this._mValue[0] = value;
    }
}

export type Char = Uint8;
export type Byte = Uint8;
export type SignedChar = Int8;

/**
 * Equivalent to Signed Char
 */
export class Int8{
    public static Max = 127;
    public static Min = -128;
    public static SizeInBytes = 1;
    
    private _mValue:Int8Array;

    public set value(new_value:number){        
        this._mValue[0] = new_value;
    }

    public get value():number{        
        return this._mValue[0];
    }

    constructor(value:number){
        this._mValue = new Int8Array(1);
        this._mValue[0] = value;
    }
}

/**
 * Equivalent to Unsigned Short
 */
export class Uint16{
    public static Max = 65535 ;
    public static Min = 0;
    public static SizeInBytes = 2;
    
    private _mValue:Uint16Array;

    public set value(new_value:number){        
        this._mValue[0] = new_value;
    }

    public get value():number{        
        return this._mValue[0];
    }

    constructor(value:number){
        this._mValue = new Uint16Array(1);
        this._mValue[0] = value;
    }
}

/**
 * Equivalent to Signed Short
 */
export class Int16{
    public static Max = 32767;
    public static Min = -32768;
    public static SizeInBytes = 2;
    
    private _mValue:Int16Array;

    public set value(new_value:number){        
        this._mValue[0] = new_value;
    }

    public get value():number{        
        return this._mValue[0];
    }

    constructor(value:number){
        this._mValue = new Int16Array(1);
        this._mValue[0] = value;
    }
}

export type Short = Int16;
export type UnsignedShort = Uint16;
export type SignedShort = Int16;

/**
 * Equivalent to Unsigned Short
 */
export class Uint32{
    public static Max = 4294967295  ;
    public static Min = 0;
    public static SizeInBytes = 4;
    
    private _mValue:Uint32Array;

    public set value(new_value:number){        
        this._mValue[0] = new_value;
    }

    public get value():number{        
        return this._mValue[0];
    }

    constructor(value:number){
        this._mValue = new Uint32Array(1);
        this._mValue[0] = value;
    }
}

/**
 * Equivalent to Signed Short
 */
export class Int32{
    public static Max = 2147483647;
    public static Min = -2147483648;
    public static SizeInBytes = 4;
    
    private _mValue:Int32Array;

    public set value(new_value:number){        
        this._mValue[0] = new_value;
    }

    public get value():number{        
        return this._mValue[0];
    }

    constructor(value:number){
        this._mValue = new Int32Array(1);
        this._mValue[0] = value;
    }
}

export type Int = Int32;
export type Integer = Int32;
export type SignedInt = Int32;
export type UnsignedInt = Uint32;