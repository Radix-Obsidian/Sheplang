"use strict";
/**
 * Prisma Schema Parser v2.0
 *
 * Parses Prisma schema files and generates ShepLang v0.3 syntax.
 *
 * Supports:
 * - Model definitions with brace syntax
 * - Optional fields (?)
 * - Default values (= value or = now)
 * - Field attributes (@id, @unique, @updatedAt)
 * - Enum declarations
 * - Relations with referential actions
 * - Array fields ([])
 * - All Prisma types → ShepLang type mapping
 *
 * Updated: November 26, 2025
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPrismaSchema = findPrismaSchema;
exports.parsePrismaSchema = parsePrismaSchema;
exports.generateShepLangFromPrisma = generateShepLangFromPrisma;
exports.importPrismaProject = importPrismaProject;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Find Prisma schema file in project
 */
function findPrismaSchema(projectRoot) {
    const locations = [
        path.join(projectRoot, 'prisma', 'schema.prisma'),
        path.join(projectRoot, 'prisma.schema'),
        path.join(projectRoot, 'schema.prisma')
    ];
    for (const location of locations) {
        if (fs.existsSync(location)) {
            return location;
        }
    }
    return null;
}
/**
 * Parse a Prisma schema file
 */
function parsePrismaSchema(schemaPath) {
    if (!fs.existsSync(schemaPath)) {
        return { models: [], enums: [] };
    }
    const content = fs.readFileSync(schemaPath, 'utf-8');
    const schema = {
        models: [],
        enums: []
    };
    // Extract all enums FIRST (needed for type checking)
    const enumMatches = content.matchAll(/enum\s+(\w+)\s*\{([^}]+)\}/g);
    for (const match of enumMatches) {
        const enumName = match[1];
        const enumBody = match[2];
        const values = enumBody
            .split('\n')
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('//'));
        schema.enums.push({ name: enumName, values });
    }
    // Extract all models using balanced brace matching
    const modelRegex = /model\s+(\w+)\s*\{/g;
    let modelMatch;
    while ((modelMatch = modelRegex.exec(content)) !== null) {
        const modelName = modelMatch[1];
        const startIndex = modelMatch.index + modelMatch[0].length;
        const modelBody = extractBalancedBraces(content, startIndex);
        const model = {
            name: modelName,
            fields: [],
            modelAttributes: []
        };
        // Parse fields
        const lines = modelBody.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
        for (const line of lines) {
            // Model-level attributes (@@unique, @@index, @@map, @@id)
            if (line.startsWith('@@')) {
                const attrMatch = line.match(/@@(\w+)\(([^)]*)\)/);
                if (attrMatch) {
                    model.modelAttributes.push(line);
                }
                continue;
            }
            // Parse field line
            const field = parseFieldLine(line, schema.enums.map(e => e.name));
            if (field) {
                model.fields.push(field);
            }
        }
        schema.models.push(model);
    }
    return schema;
}
/**
 * Extract content between balanced braces
 */
function extractBalancedBraces(content, startIndex) {
    let depth = 1;
    let i = startIndex;
    while (i < content.length && depth > 0) {
        if (content[i] === '{')
            depth++;
        if (content[i] === '}')
            depth--;
        i++;
    }
    return content.substring(startIndex, i - 1);
}
/**
 * Parse a single field line
 */
function parseFieldLine(line, enumNames) {
    // Match: fieldName Type[]? @attributes
    const match = line.match(/^(\w+)\s+(\w+)(\[\])?(\?)?\s*(.*)?$/);
    if (!match)
        return null;
    const fieldName = match[1];
    const fieldType = match[2];
    const isArray = !!match[3];
    const isOptional = !!match[4];
    const attributes = match[5] || '';
    // Check if it's an enum type
    const isEnum = enumNames.includes(fieldType);
    // Check if it's a relation (another model)
    const prismaTypes = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Decimal', 'BigInt', 'Bytes'];
    const isRelation = !prismaTypes.includes(fieldType) && !isEnum;
    const field = {
        name: fieldName,
        type: fieldType,
        shepType: isEnum ? fieldType : mapPrismaTypeToShepLang(fieldType),
        isArray,
        isOptional,
        isUnique: attributes.includes('@unique'),
        isId: attributes.includes('@id'),
        isUpdatedAt: attributes.includes('@updatedAt'),
        isRelation,
        relatedModel: isRelation ? fieldType : undefined
    };
    // Extract default value - use greedy match for nested parens
    const defaultMatch = attributes.match(/@default\((\w+\(\)?|"[^"]*"|'[^']*'|\w+)\)/);
    if (defaultMatch) {
        const defaultVal = defaultMatch[1].trim();
        // Check for functions (with or without trailing parens)
        if (defaultVal === 'now()' || defaultVal === 'now') {
            field.defaultFunction = 'now';
        }
        else if (defaultVal === 'autoincrement()' || defaultVal === 'autoincrement') {
            field.defaultFunction = 'auto';
        }
        else if (defaultVal === 'uuid()' || defaultVal === 'uuid') {
            field.defaultFunction = 'uuid';
        }
        else if (defaultVal === 'cuid()' || defaultVal === 'cuid') {
            field.defaultFunction = 'cuid';
        }
        else if (defaultVal === 'ulid()' || defaultVal === 'ulid') {
            field.defaultFunction = 'ulid';
        }
        else if (defaultVal === 'true' || defaultVal === 'false') {
            field.defaultValue = defaultVal;
        }
        else if (defaultVal.startsWith('"') && defaultVal.endsWith('"')) {
            field.defaultValue = defaultVal; // Keep quotes
        }
        else {
            // Could be an enum value or number
            field.defaultValue = defaultVal;
        }
    }
    // Extract onDelete for relations
    const onDeleteMatch = attributes.match(/onDelete:\s*(\w+)/);
    if (onDeleteMatch) {
        field.onDelete = onDeleteMatch[1].toLowerCase();
    }
    return field;
}
/**
 * Map Prisma types to ShepLang types (v0.3)
 */
function mapPrismaTypeToShepLang(prismaType) {
    const typeMap = {
        'String': 'text',
        'Int': 'number',
        'Float': 'number',
        'Decimal': 'decimal',
        'BigInt': 'bigint',
        'Boolean': 'yes/no',
        'DateTime': 'datetime',
        'Json': 'json',
        'Bytes': 'bytes'
    };
    return typeMap[prismaType] || 'text';
}
/**
 * Generate ShepLang v0.3 code from Prisma schema
 */
function generateShepLangFromPrisma(schema, appName = 'ImportedApp') {
    let output = `app ${appName} {\n\n`;
    // Generate enum declarations
    for (const enum_ of schema.enums) {
        output += `  enum ${enum_.name} {\n`;
        output += `    ${enum_.values.join(', ')}\n`;
        output += `  }\n\n`;
    }
    // Generate data blocks
    for (const model of schema.models) {
        output += `  data ${model.name} {\n`;
        output += `    fields: {\n`;
        for (const field of model.fields) {
            // Skip relation back-reference fields (like authorId)
            if (field.name.endsWith('Id') && model.fields.some(f => f.isRelation && f.relatedModel + 'Id' === field.name)) {
                continue;
            }
            output += `      ${field.name}: `;
            if (field.isRelation) {
                output += `ref[${field.relatedModel}]`;
                if (field.isArray)
                    output += '[]';
                if (field.onDelete)
                    output += ` @onDelete(${field.onDelete})`;
            }
            else {
                output += field.shepType;
                if (field.isArray)
                    output += '[]';
            }
            // Optional marker
            if (field.isOptional)
                output += '?';
            // Default value
            if (field.defaultFunction) {
                output += ` = ${field.defaultFunction}`;
            }
            else if (field.defaultValue) {
                output += ` = ${field.defaultValue}`;
            }
            // Attributes
            if (field.isId)
                output += ' @id';
            if (field.isUnique)
                output += ' @unique';
            if (field.isUpdatedAt)
                output += ' @updatedAt';
            output += '\n';
        }
        output += `    }\n`;
        // Model-level attributes
        for (const attr of model.modelAttributes) {
            const uniqueMatch = attr.match(/@@unique\(\[([^\]]+)\]\)/);
            const indexMatch = attr.match(/@@index\(\[([^\]]+)\]\)/);
            if (uniqueMatch) {
                const fields = uniqueMatch[1].split(',').map(f => f.trim());
                output += `    @@unique(${fields.join(', ')})\n`;
            }
            else if (indexMatch) {
                const fields = indexMatch[1].split(',').map(f => f.trim());
                output += `    @@index(${fields.join(', ')})\n`;
            }
        }
        output += `  }\n\n`;
    }
    // Generate basic views
    output += `  // Generated views\n`;
    for (const model of schema.models) {
        output += `  view ${model.name}List {\n`;
        output += `    list ${model.name}\n`;
        output += `    button "New ${model.name}" -> Create${model.name}\n`;
        output += `  }\n\n`;
    }
    // Generate placeholder actions
    output += `  // Generated actions\n`;
    for (const model of schema.models) {
        const editableFields = model.fields
            .filter(f => !f.isId && !f.isUpdatedAt && !f.isRelation && !f.defaultFunction && !f.defaultValue)
            .map(f => f.name);
        output += `  action Create${model.name}(${editableFields.join(', ')}) {\n`;
        output += `    call POST "/api/${model.name.toLowerCase()}s" with ${editableFields.join(', ')}\n`;
        output += `    show ${model.name}List\n`;
        output += `  }\n\n`;
    }
    output += `}\n`;
    return output;
}
/**
 * Import a Prisma schema and convert to ShepLang
 */
function importPrismaProject(projectRoot, appName) {
    const schemaPath = findPrismaSchema(projectRoot);
    if (!schemaPath) {
        return null;
    }
    const schema = parsePrismaSchema(schemaPath);
    if (schema.models.length === 0) {
        return null;
    }
    const finalAppName = appName || path.basename(projectRoot).replace(/[^a-zA-Z0-9]/g, '') || 'ImportedApp';
    return generateShepLangFromPrisma(schema, finalAppName);
}
//# sourceMappingURL=prismaParser.js.map