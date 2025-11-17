// Source location metadata for click-to-navigate
export type SourceLocation = {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
};

export type AppModel = {
  name: string;
  __location?: SourceLocation;
  datas: { 
    name: string; 
    fields: { name: string; type: string }[]; 
    rules: string[];
    __location?: SourceLocation;
  }[];
  views: { 
    name: string; 
    list?: string; 
    buttons: { label: string; action: string; __location?: SourceLocation }[];
    __location?: SourceLocation;
  }[];
  actions: {
    name: string;
    params: { name: string; type?: string }[];
    ops: (
      | { kind: 'add'; data: string; fields: Record<string, string> }
      | { kind: 'show'; view: string }
      | { kind: 'call'; method: string; path: string; args?: any[] }
      | { kind: 'load'; method: string; path: string; target: string }
      | { kind: 'raw'; text: string }
    )[];
    __location?: SourceLocation;
  }[];
};
