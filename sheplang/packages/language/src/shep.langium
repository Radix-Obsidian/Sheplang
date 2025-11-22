// ShepLang Grammar (Alpha v0.1)
grammar Shep

entry ShepFile: app=AppDecl;

AppDecl:
  'app' name=ID '{' decls+=TopDecl* '}';

TopDecl: DataDecl | ViewDecl | ActionDecl | FlowDecl | JobDecl | WorkflowDecl;

DataDecl:
  'data' name=ShepIdentifier '{'
    'fields' ':' '{' fields+=FieldDecl* '}'
    statusBlock=StatusBlock?
    ('rules' ':' '{' rules+=RuleDecl* '}')?
  '}';

StatusBlock:
  'states' ':' chain=TransitionChain;

TransitionChain:
  states+=ShepIdentifier ('->' states+=ShepIdentifier)+;

// Contextual keyword support - allows keywords as identifiers per Langium docs
ShepIdentifier returns string: ID | 'status' | 'job' | 'background' | 'states' | 'schedule' | 'action';

FieldDecl: name=ShepIdentifier ':' type=TypeRef constraints+=Constraint*;

Constraint:
  kind=('required' | 'unique' | 'optional')
| 'max' '=' max=NUMBER
| 'default' '=' value=(STRING | NUMBER | BooleanLiteral | ShepIdentifier);

TypeRef: base=BaseType isArray?='[]'?;

BaseType: SimpleType | RefType;
SimpleType: value=('text'|'number'|'yes/no'|'id'|'date'|'email'|'money'|'image'|'datetime'|'richtext'|'file'|ShepIdentifier);
RefType: 'ref' '[' entity=ShepIdentifier ']';

RuleDecl: '-' text=STRING;

ViewDecl:
  'view' name=ShepIdentifier '{' widgets+=WidgetDecl* '}';

WidgetDecl: ListDecl | ButtonDecl;
ListDecl: 'list' ref=[DataDecl];
ButtonDecl: 'button' label=STRING '->' target=[ActionDecl];

ActionDecl:
  'action' name=ShepIdentifier '(' (params+=ParamDecl (',' params+=ParamDecl)*)? ')' '{'
     statements+=Stmt*
  '}';

FlowDecl:
  'flow' name=ShepIdentifier ':'
    'from' ':' from=ShepIdentifier
    'trigger' ':' trigger=STRING
    'steps' ':' steps+=FlowStep*;

FlowStep:
  '-' description=STRING;

// Phase II: Background Jobs Grammar with direct alternatives
JobDecl:
  'job' name=ShepIdentifier '{' 
  timing=(JobSchedule | JobTrigger)
  (delay=JobDelay)?
  'action' '{' actions+=Stmt* '}'
  '}';

JobSchedule:
  'schedule' ':' timing=ScheduleTiming;

JobTrigger:
  'trigger' ':' event=TriggerEvent;

JobDelay:
  'delay' ':' duration=FrequencyExpression;

WorkflowDecl:
  'workflow' name=ShepIdentifier '{' events+=WorkflowEvent* '}';

WorkflowEvent:
  'on' state=ShepIdentifier '{' actions+=WorkflowAction* '}';

WorkflowAction:
  'event' name=ShepIdentifier (':' condition=WorkflowCondition)? '->' target=ShepIdentifier;

WorkflowCondition:
  'if' expression=Expression ('else' alternative=ShepIdentifier)?;

// Supporting rules for JobDecl
ScheduleTiming:
  CronExpression | NaturalLanguage;

CronExpression:
  'cron' pattern=STRING;

NaturalLanguage:
  ('daily' 'at' time=STRING) |
  ('weekly' 'on' day=DayName 'at' time=STRING) |
  ('every' frequency=FrequencyExpression) |
  ('every' frequency=FrequencyExpression 'at' time=STRING);

FrequencyExpression:
  amount=NUMBER unit=TimeUnit;

TimeUnit returns string:
  'minutes' | 'hours' | 'days' | 'weeks' | 'months';

DayName returns string:
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

TriggerEvent:
  ('on' entity=ShepIdentifier '.' eventType=EventType) |
  ('on' entity=ShepIdentifier '.' field=ShepIdentifier '->' value=ShepIdentifier);

EventType returns string:
  'created' | 'updated' | 'deleted';

ParamDecl: name=ShepIdentifier (':' type=TypeRef)?;
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
  variable=ShepIdentifier 'in' collection=Expression;

ForRangeClause:
  variable=ShepIdentifier 'from' start=Expression 'to' end=Expression;

AssignStmt:
  target=ShepIdentifier '=' value=Expression;

Assignment:
  field=ShepIdentifier '=' value=Expression;

ShowStmt:
  'show' view=[ViewDecl];

CallStmt:
  'call' method=('GET'|'POST'|'PUT'|'PATCH'|'DELETE') path=STRING ('with' fields+=ShepIdentifier (',' fields+=ShepIdentifier)*)?;

LoadStmt:
  'load' method=('GET'|'POST'|'PUT'|'PATCH'|'DELETE') path=STRING 'into' variable=ShepIdentifier;

FieldValue: name=ShepIdentifier ('=' value=Expression)?;

// Expression hierarchy with proper precedence (research-backed from Go spec)
Expression: LogicalOrExpr;

LogicalOrExpr:
  LogicalAndExpr ({infer BinaryExpr.left=current} op='or' right=LogicalAndExpr)*;

LogicalAndExpr:
  ComparisonExpr ({infer BinaryExpr.left=current} op='and' right=ComparisonExpr)*;

ComparisonExpr:
  AdditionExpr ({infer BinaryExpr.left=current} op=('==' | '=' | '!=' | '<' | '<=' | '>' | '>=') right=AdditionExpr)?;

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
  object=IdentifierName '.' field=IdentifierName;

FunctionCall:
  func=IdentifierName '(' (args+=Expression (',' args+=Expression)*)? ')';

NumberLiteral: value=NUMBER;
StringLiteral: value=STRING;
BooleanLiteral: value=('true'|'false');
IdentifierRef: ref=IdentifierName;

// Data type rule to allow type keywords as identifiers (Langium best practice)
IdentifierName returns string: ID | 'id' | 'text' | 'number' | 'date' | 'email';

RawStmt: '~' text=STRING;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"[^"]*"|'[^']*'/;
terminal NUMBER: /[0-9]+(\.[0-9]+)?/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
