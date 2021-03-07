export enum SpecType {
    Unknown = 0,
    Attribute,
    Connection,
    Expression,
    Mapper,
    MapperArg,
    Prim,
    PseudoRoot,
    Relationship,
    RelationshipTarget,
    Variant,
    VariantSet,
    NumSpecTypes
}

export enum Orientation {
    RightHanded,
    LeftHanded
}

export enum Visibility {
    Inherited,
    Invisible
}

export enum Purpose {
    Default,
    Render,
    Proxy,
    Guide
}

export enum SubdivisionScheme {
    SchemeCatmullClark,
    SchemeLoop,
    SchemeBilinear,
    SchemeNone
}

export enum Specifier {
    Def,
    Over,
    Class,
    NumSpecifiers
}

export enum Permission {
    Public,
    Private,
    NumPermissions
}

export enum Variability {
    Varying,
    Uniform,
    Config,
    NumVariabilities
}
