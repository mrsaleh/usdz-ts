
export class UsdcField {
    name: string;
    flags: number;
    type: ValueTypeId;
    isArray: boolean;
    isInlined: boolean;
    isCompressed: boolean;
    payload: number;

    constructor(){
        this.name=''
        this.flags = 0
        this.type = ValueTypeId.ValueTypeInvaldOrUnsupported;
        this.isArray = false;
        this.isInlined = false;
        this.isCompressed = false;
        this.payload  = 0;
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

export enum SpecType {
    SpecTypeUnknown = 0,
    SpecTypeAttribute,
    SpecTypeConnection,
    SpecTypeExpression,
    SpecTypeMapper,
    SpecTypeMapperArg,
    SpecTypePrim,
    SpecTypePseudoRoot,
    SpecTypeRelationship,
    SpecTypeRelationshipTarget,
    SpecTypeVariant,
    SpecTypeVariantSet,
    NumSpecTypes
}

export enum Orientation {
    OrientationRightHanded,
    OrientationLeftHanded
}

export enum Visibility {
    VisibilityInherited,
    VisibilityInvisible
}

export enum Purpose {
    PurposeDefault,
    PurposeRender,
    PurposeProxy,
    PurposeGuide
}

export enum SubdivisionScheme {
    SubdivisionSchemeCatmullClark,
    SubdivisionSchemeLoop,
    SubdivisionSchemeBilinear,
    SubdivisionSchemeNone
}

export enum Specifier {
    SpecifierDef,
    SpecifierOver,
    SpecifierClass,
    NumSpecifiers
}

export enum Permission {
    PermissionPublic,
    PermissionPrivate,
    NumPermissions
}

export enum Variability {
    VariabilityVarying,
    VariabilityUniform,
    VariabilityConfig,
    NumVariabilities
}