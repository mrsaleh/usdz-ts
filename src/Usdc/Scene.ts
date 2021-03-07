import { Purpose, Visibility } from "Usdc/Enums";

// Simple bidirectional Path(string) <-> index lookup
class StringAndIdMap {
    _mIndexStringMap:Map<number,string>;  // index -> string
    _mStringIndexMap:Map<string,number>;  // string -> index

    constructor(){
        this._mIndexStringMap = new Map<number,string>();
        this._mStringIndexMap = new Map<string,number>();
    }

    GetString(i:number):string|undefined { return this._mIndexStringMap.get(i); }
  
    GetNumber(s:string):number|undefined { return this._mStringIndexMap.get(s); }

    Add(i:number,s:string):void{
        this._mIndexStringMap.set(i,s);
        this._mStringIndexMap.set(s,i);
    }

    /*
    void add(int32_t key, const std::string &val) {
      _i_to_s[key] = val;
      _s_to_i[val] = key;
    }
  
    void add(const std::string &key, int32_t val) {
      _s_to_i[key] = val;
      _i_to_s[val] = key;
    }
  
    size_t count(int32_t i) const { return _i_to_s.count(i); }
  
    size_t count(const std::string &s) const { return _s_to_i.count(s); }
    */  
    
  };


// Corresponds to USD's Scope.
// `Scope` is uncommon term in graphics community, so we use `Group`.
// From USD doc: Scope is the simplest grouping primitive, and does not carry
// the baggage of transformability.
class Group {
    name:string;
    parent_id:number;  
    visibility:Visibility;
    purpose:Purpose;

    constructor(){
        this.name = '';
        this.parent_id = -1;
        this.visibility = Visibility.Inherited;
        this.purpose = Purpose.Default;
    }
};


/*
class Scene {
    name:string;       // Scene name
    default_root_node:number= -1;  // index to default root node
  
    // Node hierarchies
    // Scene can have multiple nodes.
    nodes:Array<Node>;
  
    // Scene global setting
    upAxis:string = "Y";
    defaultPrim:string;           // prim node name
    metersPerUnit:number = 1.0;        // default [m]
    timeCodesPerSecond:number = 24.0;  // default 24 fps
  
    //
    // glTF-like scene objects
    // TODO(syoyo): Use std::variant(C++17) like static polymorphism
    //
    xforms:Array<Xform>;
    geom_meshes:Array<GeomMesh>;
    geom_basis_curves:Array<GeomBasisCurves>;
    geom_points:Array<GeomPoints>;
    materials:Array<Material>;
    shaders:Array<PreviewSurface>;  // TODO(syoyo): Support othre shaders
    groups:Array<Group>;
  
    geom_meshes_map:StringAndIdMap;  // Path <-> array index map
    materials_map:StringAndIdMap;    // Path <-> array index map
  
    // TODO(syoyo): User defined custom layer data
    // "customLayerData"
  };*/