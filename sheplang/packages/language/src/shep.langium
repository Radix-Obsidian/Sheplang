// ShepLang Grammar (Alpha v0.3 - Full-Stack Parity)
// Implements: Prisma (11 features) + Next.js (4 features)
grammar Shep

entry ShepFile: app=AppDecl;

AppDecl:
  'app' name=ID '{' decls+=TopDecl* '}';

TopDecl: DataDecl | ViewDecl | ActionDecl | FlowDecl | JobDecl | WorkflowDecl | EnumDecl | LayoutDecl;

DataDecl:
  'data' name=ShepIdentifier '{'
    'fields' ':' '{' fields+=FieldDecl* '}'
    statusBlock=StatusBlock?
    ('rules' ':' '{' rules+=RuleDecl* '}')?
    modelAttrs+=ModelAttribute*
  '}';

// Gap #3: Enum type declarations (Prisma parity)
EnumDecl:
  'enum' name=ShepIdentifier '{' values+=EnumValue (',' values+=EnumValue)* '}';

EnumValue: name=ID;

StatusBlock:
  'states' ':' chain=TransitionChain;

TransitionChain:
  states+=ShepIdentifier ('->' states+=ShepIdentifier)+;

// Contextual keyword support - allows keywords as identifiers per Langium docs
// Extended to include common field names from Prisma schemas
// Added 'scheduler' for JobDecl keyword support
ShepIdentifier returns string: ID | 'status' | 'job' | 'scheduler' | 'background' | 'states' | 'schedule' | 'action' | 'step' |
  'id' | 'email' | 'name' | 'title' | 'content' | 'author' | 'user' | 'post' | 'comment' |
  'createdAt' | 'updatedAt' | 'deletedAt' | 'completed' | 'priority' | 'role' | 'password' |
  'text' | 'number' | 'date' | 'image' | 'file' | 'url' | 'phone';

// Gap #1, #2, #7, #8, #10: Optional, defaults, attributes (Prisma parity)
FieldDecl: 
  name=ShepIdentifier ':' type=TypeRef 
  optional?='?'?                          // Gap #1: Optional fields (text?)
  defaultValue=DefaultValue?              // Gap #2: Default values (= "value")
  fieldAttrs+=FieldAttribute*             // Gap #7, #10: Field attributes (@unique, @updatedAt)
  constraints+=Constraint*;

Constraint:
  kind=('required' | 'unique' | 'optional')
| 'max' '=' max=NUMBER
| 'min' '=' min=NUMBER
| 'isEmail' '=' emailValidation=('true'|'false')
| 'pattern' '=' pattern=STRING
| 'minLength' '=' minLength=NUMBER
| 'maxLength' '=' maxLength=NUMBER;

// Gap #2: Inline default value syntax (= "value" or = functionName)
DefaultValue:
  '=' value=(STRING | NUMBER | BooleanLiteral | DefaultFunction | ShepIdentifier);

// Default functions from Prisma: auto, cuid, uuid, ulid, now
DefaultFunction:
  func=('auto' | 'cuid' | 'uuid' | 'ulid' | 'now') ('(' ')')?;

// Gap #7, #10: Field-level attributes (@unique, @updatedAt, @id)
FieldAttribute:
  '@' name=('unique' | 'updatedAt' | 'id');

// Gap #11: Model-level attributes (@@id, @@unique, @@index)
ModelAttribute:
  '@@' name=('id' | 'unique' | 'index') '(' fields+=ShepIdentifier (',' fields+=ShepIdentifier)* ')';

// Gap #4: Array fields already supported (text[])
TypeRef: base=BaseType isArray?='[]'?;

BaseType: SimpleType | RefType | EnumRefType;

// Gap #3: Reference to enum type
EnumRefType: ref=[EnumDecl];
// Gap #5, #6, #8: New types for Prisma parity (bigint, json, bytes, decimal, uuid)
// Note: Removed ShepIdentifier from here to avoid grammar ambiguity with field names
SimpleType: value=(
  'text' | 'number' | 'yes/no' | 'id' | 'date' | 
  'email' | 'money' | 'image' | 'datetime' | 'richtext' | 'file' |
  'bigint' |    // Gap #5: Large integers (Prisma BigInt)
  'json' |      // Gap #6: JSON data (Prisma Json)
  'bytes' |     // Gap #8: Binary data (Prisma Bytes)
  'decimal' |   // Precise decimals (Prisma Decimal)
  'uuid' |      // UUID strings
  'url' |       // URL strings
  'phone'       // Phone numbers
);
// Gap #9: Referential actions (onDelete, onUpdate) for Prisma parity
RefType: 
  'ref' '[' entity=ShepIdentifier ']' 
  refActions+=RefAction*;

RefAction:
  '@' actionType=('onDelete' | 'onUpdate') '(' action=ReferentialAction ')';

ReferentialAction returns string:
  'cascade' | 'restrict' | 'setNull' | 'setDefault' | 'noAction';

RuleDecl: '-' text=STRING;

// Next.js Parity: Layout declarations for shared UI structure
LayoutDecl:
  'layout' name=ShepIdentifier '{'
    ('header' ':' header=[ViewDecl])?
    ('sidebar' ':' sidebar=[ViewDecl])?
    ('nav' ':' nav=[ViewDecl])?
    ('footer' ':' footer=[ViewDecl])?
  '}';

// Next.js Parity: Views with parameters, layout, loading, and error references
ViewDecl:
  'view' name=ShepIdentifier ('(' params+=ParamDecl (',' params+=ParamDecl)* ')')? '{'
    ('layout' ':' layout=[LayoutDecl])?
    ('loading' ':' loading=[ViewDecl])?
    ('error' ':' errorHandler=[ActionDecl])?
    widgets+=WidgetDecl*
  '}';

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
// Supports both 'job' and 'scheduler' keywords
JobDecl:
  ('job' | 'scheduler') name=ShepIdentifier '{' 
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
  ('daily' 'at' time=TimeValue) |
  ('weekly' 'on' day=DayName 'at' time=TimeValue) |
  ('every' frequency=FrequencyExpression) |
  ('every' frequency=FrequencyExpression 'at' time=TimeValue);

// Time values can be quoted strings or time literals (9am, 10pm, 14:30)
TimeValue: value=(STRING | TIME | ID);

FrequencyExpression:
  amount=NUMBER unit=TimeUnit;

TimeUnit returns string:
  'minutes' | 'hours' | 'days' | 'weeks' | 'months';

DayName returns string:
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

TriggerEvent:
  ('on' entity=ShepIdentifier '.' eventType=EventType) |
  ('on' entity=ShepIdentifier '.' field=ShepIdentifier '->' value=ShepIdentifier);

// EventType uses UPPERCASE to avoid conflicts with common field names like 'created', 'updated'
EventType returns string:
  'CREATED' | 'UPDATED' | 'DELETED';

ParamDecl: name=ShepIdentifier (':' type=TypeRef)?;
Stmt: AddStmt | ShowStmt | CallStmt | LoadStmt | UpdateStmt | DeleteStmt | IfStmt | ForStmt | AssignStmt | WorkflowStmt | RawStmt;

// Phase 3: Workflow Engine - Simple step → step → step syntax
WorkflowStmt:
  steps+=WorkflowStep ('->' steps+=WorkflowStep)*
  ('on' 'error' '->' errorHandler=[ActionDecl])?;

WorkflowStep:
  'step' name=ShepIdentifier '{' body+=Stmt* '}';

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

// Raw statement for comments/pseudocode - text MUST be quoted
// (Terminals are context-free in Langium, so unquoted would be too greedy)
RawStmt: '~' text=STRING;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"[^"]*"|'[^']*'/;
// TIME must come BEFORE NUMBER for correct precedence (9am vs 9)
terminal TIME: /[0-9]{1,2}(:[0-9]{2})?(am|pm)/;
terminal NUMBER: /[0-9]+(\.[0-9]+)?/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
