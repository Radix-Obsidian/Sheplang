# Slice 3 – Entity Extraction (Prisma + Heuristics)

## Goal
Build ShepLang `data` models by extracting entities from React projects using Prisma schema parsing and component state heuristics.

## Primary Path: Prisma Schema Parsing
**Input**: Prisma schema file path from ImportManifest  
**Output**: Entity[] with models, fields, relations, enums

### Implementation Steps
1. Use `@prisma/internals` to parse schema with `getDMMF()`
2. Extract model definitions with field types
3. Identify relations (@relation, foreign keys)
4. Extract enum definitions
5. Map Prisma types to ShepLang primitives:
   - `String` → `text`
   - `Boolean` → `yes/no`
   - `Int` → `number`
   - `DateTime` → `date`
   - `Json` → `object`

### Expected Schema Output
```typescript
interface Entity {
  name: string;
  fields: EntityField[];
  relations: EntityRelation[];
  enums: string[];
}

interface EntityField {
  name: string;
  type: ShepLangPrimitive;
  required: boolean;
  default?: any;
}

interface EntityRelation {
  name: string;
  target: string;
  type: 'hasOne' | 'hasMany' | 'belongsTo';
}
```

## Fallback Path: Component State Heuristics
**Input**: ReactComponent[] from Slice 2 parser  
**Output**: Entity[] with basic models inferred from useState patterns

### Implementation Steps
1. Analyze `useState<Type[]>` patterns in components
2. Extract interface/type definitions for arrays
3. Parse interface fields to basic entity structure
4. Look for patterns like:
   ```tsx
   const [todos, setTodos] = useState<Todo[]>([])
   // Extract Todo entity from Todo interface
   ```
5. Handle simple nested objects:
   ```tsx
   interface Todo {
     id: number;
     title: string;
     completed: boolean;
   }
   ```

## Test Cases

### Prisma Schema Tests
- ✅ Parse Next.js+Prisma fixture schema
- ✅ Extract Task and User models correctly
- ✅ Map field types to ShepLang primitives
- ✅ Detect relations between models
- ✅ Handle enum definitions

### Heuristic Tests
- ✅ Infer Todo entity from Vite+React fixture useState
- ✅ Extract fields from TypeScript interfaces
- ✅ Handle primitive types (string, number, boolean)
- ✅ Ignore complex patterns (unions, generics)

### Integration Tests
- ✅ Primary path takes precedence over heuristics
- ✅ Fallback path works when no Prisma schema
- ✅ Combined results don't duplicate entities
- ✅ Entity names are normalized (PascalCase)

## Files to Implement/Modify
1. `extension/src/parsers/entityExtractor.ts` - New file for entity extraction
2. `extension/src/types/Entity.ts` - Entity type definitions
3. `test/importer/entityExtractor.test.ts` - Test suite
4. Update `extension/src/parsers/reactParser.ts` to expose state patterns

## Success Criteria
- Parse Prisma schema from Next.js fixture correctly
- Extract 2 models (Task, User) with proper field types
- Fallback heuristics infer Todo entity from Vite fixture
- All tests pass (target: 8-10 tests)
- No regressions in Slice 0-2 functionality

## Known Limitations
- Complex Prisma features (views, raw database) ignored
- Heuristic path only handles simple interfaces
- No field validation rules extracted
- Relation cardinality simplified

---
*Spec follows Golden Sheep methodology: Build narrow, Test deep, Ship confidently*
