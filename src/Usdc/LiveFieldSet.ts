export class LiveFieldSet
{
    Index:number;
    FieldValuePairs:Array<FieldValuePair>;

    constructor(index:number){
        this.Index = index;
        this.FieldValuePairs = [];
    }
}

export class FieldValuePair
{
    Name:string
    Object:object|null;

    constructor(name:string,object:Object|null){
        this.Name = name;
        this.Object = object;
    }
}