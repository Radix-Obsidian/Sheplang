export type AppModel = {
  name: string;
  datas: { name: string; fields: { name: string; type: string }[]; rules: string[] }[];
  views: { name: string; list?: string; buttons: { label: string; action: string }[] }[];
  actions: {
    name: string;
    params: { name: string; type?: string }[];
    ops: (
      | { kind: 'add'; data: string; fields: Record<string, string> }
      | { kind: 'show'; view: string }
      | { kind: 'call'; method: string; path: string; fields: string[] }
      | { kind: 'load'; method: string; path: string; variable: string }
      | { kind: 'raw'; text: string }
    )[];
  }[];
};
