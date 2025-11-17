// ShepLang Grammar (Alpha v0.1)
grammar Shep

entry ShepFile: app=AppDecl;

AppDecl:
  'app' name=ID '{' decls+=TopDecl* '}';

TopDecl: DataDecl | ViewDecl | ActionDecl;

DataDecl:
  'data' name=ID '{'
    'fields' ':' '{' fields+=FieldDecl* '}'
    ('rules' ':' '{' rules+=RuleDecl* '}')?
  '}';

FieldDecl: name=ID ':' type=TypeRef;
TypeRef: base=('text'|'number'|'yes/no'|'id'|'date'|'email'|ID);

RuleDecl: '-' text=STRING;

ViewDecl:
  'view' name=ID '{' widgets+=WidgetDecl* '}';

WidgetDecl: ListDecl | ButtonDecl;
ListDecl: 'list' ref=[DataDecl];
ButtonDecl: 'button' label=STRING '->' target=[ActionDecl];

ActionDecl:
  'action' name=ID '(' (params+=ParamDecl (',' params+=ParamDecl)*)? ')' '{'
     statements+=Stmt*
  '}';

ParamDecl: name=ID (':' type=TypeRef)?;
Stmt: AddStmt | ShowStmt | CallStmt | LoadStmt | RawStmt;

AddStmt:
  'add' ref=[DataDecl] 'with' fields+=FieldValue (',' fields+=FieldValue)*;

ShowStmt:
  'show' view=[ViewDecl];

CallStmt:
  'call' method=HttpMethod path=STRING ('(' (args+=Expr (',' args+=Expr)*)? ')')?;

LoadStmt:
  'load' method=HttpMethod path=STRING 'into' target=ID;

HttpMethod returns string: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

FieldValue: name=ID ('=' value=Expr)?;

Expr: StringLiteral | BooleanLiteral | IdentifierRef | NumberLiteral;
NumberLiteral: value=NUMBER;
StringLiteral: value=STRING;
BooleanLiteral: value=('true'|'false');
IdentifierRef: ref=ID;

RawStmt: '~' text=STRING;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"[^"]*"|'[^']*'/;
terminal NUMBER: /[0-9]+(\.[0-9]+)?/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
