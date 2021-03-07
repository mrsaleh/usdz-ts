
export class UsdcField {
    private _mName: string;
    private _mFlags: number;
    private _mType: ValueTypeId;
    private _mIsArray: boolean;
    private _mIsInlined: boolean;
    private _mIsCompressed: boolean;
    private _mPayload: number;

    public get Name():string{
        return this._mName;
    }

    public get Type():ValueTypeId{
        return this._mType;
    }

    public get IsArray():boolean{
        return this._mIsArray;
    }

    public get IsInlined():boolean{
        return this._mIsInlined;
    }

    public get IsCompressed():boolean{
        return this._mIsCompressed;
    }

    public get Payload():number{
        return this._mPayload;
    }
    
    constructor(name:string,flags:number){
        this._mName=name;
        this._mFlags = flags;
        //Calculates diffrent properties according to flags            
        this._mType = (flags >> 48) & 0xff;
        this._mIsArray = (flags & (1 << 63)) > 0;        
        this._mIsInlined = (flags & (1 << 62)) > 0;
        this._mIsCompressed = (flags & (1 << 61)) > 0;
        this._mPayload  = (flags & (1 << 48) - 1);
    }
}

export enum ValueTypeId {
    ValueTypeInvaldOrUnsupported = 0,
    ValueTypeBool = 1,
    ValueTypeUChar = 2,
    ValueTypeInt = 3,
    ValueTypeUInt = 4,
    ValueTypeInt64 = 5,
    ValueTypeUInt64 = 6,
    ValueTypeHalf = 7,
    ValueTypeFloat = 8,
    ValueTypeDouble = 9,
    ValueTypeString = 10,
    ValueTypeToken = 11,
    ValueTypeAssetPath = 12,
    ValueTypeMatrix2d = 13,
    ValueTypeMatrix3d = 14,
    ValueTypeMatrix4d = 15,
    ValueTypeQuatd = 16,
    ValueTypeQuatf = 17,
    ValueTypeQuath = 18,
    ValueTypeVec2d = 19,
    ValueTypeVec2f = 20,
    ValueTypeVec2h = 21,
    ValueTypeVec2i = 22,
    ValueTypeVec3d = 23,
    ValueTypeVec3f = 24,
    ValueTypeVec3h = 25,
    ValueTypeVec3i = 26,
    ValueTypeVec4d = 27,
    ValueTypeVec4f = 28,
    ValueTypeVec4h = 29,
    ValueTypeVec4i = 30,
    ValueTypeDictionary = 31,
    ValueTypeTokenListOp = 32,
    ValueTypeStringListOp = 33,
    ValueTypePathListOp = 34,
    ValueTypeReferenceListOp = 35,
    ValueTypeIntListOp = 36,
    ValueTypeInt64ListOp = 37,
    ValueTypeUIntListOp = 38,
    ValueTypeUInt64ListOp = 39,
    ValueTypePathVector = 40,
    ValueTypeTokenVector = 41,
    ValueTypeSpecifier = 42,
    ValueTypePermission = 43,
    ValueTypeVariability = 44,
    ValueTypeVariantSelectionMap = 45,
    ValueTypeTimeSamples = 46,
    ValueTypePayload = 47,
    ValueTypeDoubleVector = 48,
    ValueTypeLayerOffsetVector = 49,
    ValueTypeStringVector = 50,
    ValueTypeValueBlock = 51,
    ValueTypeValue = 52,
    ValueTypeUnregisteredValue = 53,
    ValueTypeUnregisteredValueListOp = 54,
    ValueTypePayloadListOp = 55,
    ValueTypeTimeCode = 56
}

