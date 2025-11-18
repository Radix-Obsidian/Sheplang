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
Stmt: AddStmt | ShowStmt | CallStmt | LoadStmt | UpdateStmt | DeleteStmt | IfStmt | ForStmt | AssignStmt | RawStmt;

AddStmt:
  'add' ref=[DataDecl] 'with' fields+=FieldValue (',' fields+=FieldValue)*;

UpdateStmt:
  'update' model=[DataDecl] 'where' condition=Expression 'set' assignments+=Assignment (',' assignments+=Assignment)*;

DeleteStmt:
  'delete' model=[DataDecl] 'where' condition=Expression;

IfStmt:
  'if' condition=Expression ':' '{' thenBranch+=Stmt* '}'
  (elseIfs+=ElseIfClause)*
  ('else' ':' '{' elseBranch+=Stmt* '}')?;

ElseIfClause:
  'else' 'if' condition=Expression ':' '{' body+=Stmt* '}';

ForStmt:
  'for' loop=(ForEachClause | ForRangeClause) ':' '{' body+=Stmt* '}';

ForEachClause:
  variable=ID 'in' collection=Expression;

ForRangeClause:
  variable=ID 'from' start=Expression 'to' end=Expression;

AssignStmt:
  target=ID '=' value=Expression;

Assignment:
  field=ID '=' value=Expression;

ShowStmt:
  'show' view=[ViewDecl];

CallStmt:
  'call' method=('GET'|'POST'|'PUT'|'PATCH'|'DELETE') path=STRING ('with' fields+=ID (',' fields+=ID)*)?;

LoadStmt:
  'load' method=('GET'|'POST'|'PUT'|'PATCH'|'DELETE') path=STRING 'into' variable=ID;

FieldValue: name=ID ('=' value=Expression)?;

// Expression hierarchy with proper precedence (research-backed from Go spec)
Expression: LogicalOrExpr;

LogicalOrExpr:
  LogicalAndExpr ({infer BinaryExpr.left=current} op='or' right=LogicalAndExpr)*;

LogicalAndExpr:
  ComparisonExpr ({infer BinaryExpr.left=current} op='and' right=ComparisonExpr)*;

ComparisonExpr:
  AdditionExpr ({infer BinaryExpr.left=current} op=('==' | '!=' | '<' | '<=' | '>' | '>=') right=AdditionExpr)?;

AdditionExpr:
  MultiplicationExpr ({infer BinaryExpr.left=current} op=('+' | '-') right=MultiplicationExpr)*;

MultiplicationExpr:
  UnaryExpr ({infer BinaryExpr.left=current} op=('*' | '/' | '%') right=UnaryExpr)*;

UnaryExpr:
  {infer UnaryExpr} op=('not' | '-') operand=PrimaryExpr | PrimaryExpr;

PrimaryExpr:
  NumberLiteral | StringLiteral | BooleanLiteral | 
  IdentifierRef | FieldAccess | FunctionCall | 
  '(' Expression ')';

FieldAccess:
  object=ID '.' field=ID;

FunctionCall:
  func=ID '(' (args+=Expression (',' args+=Expression)*)? ')';

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
