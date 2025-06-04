import {create} from "zustand"
import type {Expression, Value} from "../types/ast"

const defaultProgram: Expression = {
    id: "0",
    kind: "StackExpression",
    expressions: [
        {
            id: "1",
            kind: "AssignmentExpression",
            variableName: "counter",
            value: {
                id: "2",
                kind: "ValueExpression",
                value: 0,
            },
        },
        {
            id: "3",
            kind: "AssignmentExpression",
            variableName: "message",
            value: {
                id: "4",
                kind: "ValueExpression",
                value: "Hello, world!",
            },
        },
        {
            id: "5",
            kind: "WhileExpression",
            condition: {
                id: "6",
                kind: "FunctionCallExpression",
                functionName: "lessThan",
                arguments: [
                    {
                        id: "7",
                        kind: "VariableExpression",
                        variableName: "counter",
                    },
                    {
                        id: "8",
                        kind: "ValueExpression",
                        value: 3,
                    },
                ],
            },
            body: {
                id: "9",
                kind: "StackExpression",
                expressions: [
                    {
                        id: "10",
                        kind: "FunctionCallExpression",
                        functionName: "print",
                        arguments: [
                            {
                                id: "11",
                                kind: "VariableExpression",
                                variableName: "message",
                            },
                        ],
                    },
                    {
                        id: "12",
                        kind: "AssignmentExpression",
                        variableName: "counter",
                        value: {
                            id: "13",
                            kind: "FunctionCallExpression",
                            functionName: "add",
                            arguments: [
                                {
                                    id: "14",
                                    kind: "VariableExpression",
                                    variableName: "counter",
                                },
                                {
                                    id: "15",
                                    kind: "ValueExpression",
                                    value: 1,
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            id: "16",
            kind: "AssignmentExpression",
            variableName: "output",
            value: {
                id: "17",
                kind: "VariableExpression",
                variableName: "message",
            },
        },
    ],
}

function getAllIds(expr: Expression): string[] {
    const ids = [expr.id]
    if (expr.kind == "StackExpression") {
        expr.expressions.forEach((e) => ids.push(...getAllIds(e)))
    } else if (expr.kind == "FunctionCallExpression") {
        expr.arguments.forEach((e) => ids.push(...getAllIds(e)))
    } else if (expr.kind == "WhileExpression") {
        ids.push(...getAllIds(expr.condition))
        ids.push(...getAllIds(expr.body))
    } else if (expr.kind == "AssignmentExpression") {
        ids.push(...getAllIds(expr.value))
    } else if (expr.kind == "IfExpression") {
        ids.push(...getAllIds(expr.condition))
        ids.push(...getAllIds(expr.thenBranch))
        if (expr.elseBranch) {
            ids.push(...getAllIds(expr.elseBranch))
        }
    } else if (expr.kind == "FunctionDefinitionExpression") {
        ids.push(...getAllIds(expr.body))
    } else if (expr.kind == "BooleanExpression") {
        if (expr.left) {
            ids.push(...getAllIds(expr.left))
        }
        if (expr.right) {
            ids.push(...getAllIds(expr.right))
        }
    }
    return ids
}

function getAllVariables(expr: Expression): string[] {
    const vars: string[] = []
    if (expr.kind == "StackExpression") {
        expr.expressions.forEach((e) => vars.push(...getAllVariables(e)))
    } else if (expr.kind == "FunctionCallExpression") {
        expr.arguments.forEach((e) => vars.push(...getAllVariables(e)))
    } else if (expr.kind == "WhileExpression") {
        vars.push(...getAllVariables(expr.condition))
        vars.push(...getAllVariables(expr.body))
    } else if (expr.kind == "AssignmentExpression") {
        vars.push(expr.variableName)
        vars.push(...getAllVariables(expr.value))
    } else if (expr.kind == "VariableExpression") {
        vars.push(expr.variableName)
    } else if (expr.kind == "IfExpression") {
        vars.push(...getAllVariables(expr.condition))
        vars.push(...getAllVariables(expr.thenBranch))
        if (expr.elseBranch) {
            vars.push(...getAllVariables(expr.elseBranch))
        }
    } else if (expr.kind == "FunctionDefinitionExpression") {
        vars.push(...expr.parameters)
        vars.push(...getAllVariables(expr.body))
    } else if (expr.kind == "BooleanExpression") {
        if (expr.left) {
            vars.push(...getAllVariables(expr.left))
        }
        if (expr.right) {
            vars.push(...getAllVariables(expr.right))
        }
    }
    return [...new Set(vars)]
}

function findParent(expr: Expression, targetId: string): string | null {
    if (expr.kind == "StackExpression") {
        for (const child of expr.expressions) {
            if (child.id == targetId) return expr.id
            const parent = findParent(child, targetId)
            if (parent) return parent
        }
    } else if (expr.kind == "FunctionCallExpression") {
        for (const child of expr.arguments) {
            if (child.id == targetId) return expr.id
            const parent = findParent(child, targetId)
            if (parent) return parent
        }
    } else if (expr.kind == "WhileExpression") {
        if (expr.condition.id == targetId || expr.body.id == targetId) return expr.id
        const parent =
            findParent(expr.condition, targetId) || findParent(expr.body, targetId)
        if (parent) return parent
    } else if (expr.kind == "AssignmentExpression") {
        if (expr.value.id == targetId) return expr.id
        const parent = findParent(expr.value, targetId)
        if (parent) return parent
    } else if (expr.kind == "IfExpression") {
        if (
            expr.condition.id == targetId ||
            expr.thenBranch.id == targetId ||
            (expr.elseBranch && expr.elseBranch.id == targetId)
        )
            return expr.id
        const parent =
            findParent(expr.condition, targetId) ||
            findParent(expr.thenBranch, targetId) ||
            (expr.elseBranch && findParent(expr.elseBranch, targetId))
        if (parent) return parent
    } else if (expr.kind == "FunctionDefinitionExpression") {
        if (expr.body.id == targetId) return expr.id
        const parent = findParent(expr.body, targetId)
        if (parent) return parent
    } else if (expr.kind == "BooleanExpression") {
        if (
            (expr.left && expr.left.id == targetId) ||
            (expr.right && expr.right.id == targetId)
        )
            return expr.id
        const parent =
            (expr.left && findParent(expr.left, targetId)) ||
            (expr.right && findParent(expr.right, targetId))
        if (parent) return parent
    }
    return null
}

function findNextSibling(expr: Expression, targetId: string): string | null {
    if (expr.kind == "StackExpression") {
        const idx = expr.expressions.findIndex((e) => e.id == targetId)
        if (idx != -1 && idx < expr.expressions.length - 1) {
            return expr.expressions[idx + 1].id
        }
        for (const child of expr.expressions) {
            const sibling = findNextSibling(child, targetId)
            if (sibling) return sibling
        }
    } else if (expr.kind == "FunctionCallExpression") {
        const idx = expr.arguments.findIndex((e) => e.id == targetId)
        if (idx != -1 && idx < expr.arguments.length - 1) {
            return expr.arguments[idx + 1].id
        }
        for (const child of expr.arguments) {
            const sibling = findNextSibling(child, targetId)
            if (sibling) return sibling
        }
    } else if (expr.kind == "WhileExpression") {
        if (expr.condition.id == targetId) return expr.body.id
        const sibling =
            findNextSibling(expr.condition, targetId) ||
            findNextSibling(expr.body, targetId)
        if (sibling) return sibling
    } else if (expr.kind == "AssignmentExpression") {
        const sibling = findNextSibling(expr.value, targetId)
        if (sibling) return sibling
    } else if (expr.kind == "IfExpression") {
        if (expr.condition.id == targetId) return expr.thenBranch.id
        if (expr.thenBranch.id == targetId && expr.elseBranch) return expr.elseBranch.id
        const sibling =
            findNextSibling(expr.condition, targetId) ||
            findNextSibling(expr.thenBranch, targetId) ||
            (expr.elseBranch && findNextSibling(expr.elseBranch, targetId))
        if (sibling) return sibling
    } else if (expr.kind == "FunctionDefinitionExpression") {
        const sibling = findNextSibling(expr.body, targetId)
        if (sibling) return sibling
    } else if (expr.kind == "BooleanExpression") {
        if (expr.left?.id == targetId && expr.right) return expr.right.id
        const sibling =
            (expr.left && findNextSibling(expr.left, targetId)) ||
            (expr.right && findNextSibling(expr.right, targetId))
        if (sibling) return sibling
    }
    return null
}

function findPreviousSibling(expr: Expression, targetId: string): string | null {
    if (expr.kind == "StackExpression") {
        const idx = expr.expressions.findIndex((e) => e.id == targetId)
        if (idx > 0) {
            return expr.expressions[idx - 1].id
        }
        for (const child of expr.expressions) {
            const sibling = findPreviousSibling(child, targetId)
            if (sibling) return sibling
        }
    } else if (expr.kind == "FunctionCallExpression") {
        const idx = expr.arguments.findIndex((e) => e.id == targetId)
        if (idx > 0) {
            return expr.arguments[idx - 1].id
        }
        for (const child of expr.arguments) {
            const sibling = findPreviousSibling(child, targetId)
            if (sibling) return sibling
        }
    } else if (expr.kind == "WhileExpression") {
        if (expr.body.id == targetId) return expr.condition.id
        const sibling =
            findPreviousSibling(expr.condition, targetId) ||
            findPreviousSibling(expr.body, targetId)
        if (sibling) return sibling
    } else if (expr.kind == "AssignmentExpression") {
        const sibling = findPreviousSibling(expr.value, targetId)
        if (sibling) return sibling
    } else if (expr.kind == "IfExpression") {
        if (expr.thenBranch.id == targetId) return expr.condition.id
        if (expr.elseBranch?.id == targetId) return expr.thenBranch.id
        const sibling =
            findPreviousSibling(expr.condition, targetId) ||
            findPreviousSibling(expr.thenBranch, targetId) ||
            (expr.elseBranch && findPreviousSibling(expr.elseBranch, targetId))
        if (sibling) return sibling
    } else if (expr.kind == "FunctionDefinitionExpression") {
        const sibling = findPreviousSibling(expr.body, targetId)
        if (sibling) return sibling
    } else if (expr.kind == "BooleanExpression") {
        if (expr.right?.id == targetId && expr.left) return expr.left.id
        const sibling =
            (expr.left && findPreviousSibling(expr.left, targetId)) ||
            (expr.right && findPreviousSibling(expr.right, targetId))
        if (sibling) return sibling
    }
    return null
}

function findNextSiblingRecursive(
    program: Expression,
    targetId: string
): string | null {
    const directSibling = findNextSibling(program, targetId)
    if (directSibling) return directSibling

    const parentId = findParent(program, targetId)
    if (!parentId) return null

    return findNextSiblingRecursive(program, parentId)
}

function findPreviousSiblingRecursive(
    program: Expression,
    targetId: string
): string | null {
    const directSibling = findPreviousSibling(program, targetId)
    if (directSibling) return directSibling

    const parentId = findParent(program, targetId)
    if (!parentId) return null

    return findPreviousSiblingRecursive(program, parentId)
}

function findExpressionById(expr: Expression, targetId: string): Expression | null {
    if (expr.id == targetId) return expr
    if (expr.kind == "StackExpression") {
        for (const child of expr.expressions) {
            const found = findExpressionById(child, targetId)
            if (found) return found
        }
    } else if (expr.kind == "FunctionCallExpression") {
        for (const child of expr.arguments) {
            const found = findExpressionById(child, targetId)
            if (found) return found
        }
    } else if (expr.kind == "WhileExpression") {
        const found =
            findExpressionById(expr.condition, targetId) ||
            findExpressionById(expr.body, targetId)
        if (found) return found
    } else if (expr.kind == "AssignmentExpression") {
        const found = findExpressionById(expr.value, targetId)
        if (found) return found
    } else if (expr.kind == "IfExpression") {
        const found =
            findExpressionById(expr.condition, targetId) ||
            findExpressionById(expr.thenBranch, targetId) ||
            (expr.elseBranch && findExpressionById(expr.elseBranch, targetId))
        if (found) return found
    } else if (expr.kind == "FunctionDefinitionExpression") {
        const found = findExpressionById(expr.body, targetId)
        if (found) return found
    } else if (expr.kind == "BooleanExpression") {
        const found =
            (expr.left && findExpressionById(expr.left, targetId)) ||
            (expr.right && findExpressionById(expr.right, targetId))
        if (found) return found
    }
    return null
}

function appendArgumentToFunctionCall(
    expr: Expression,
    functionId: string,
    newArg: Expression
): Expression {
    if (expr.id == functionId && expr.kind == "FunctionCallExpression") {
        return {...expr, arguments: [...expr.arguments, newArg]}
    }
    if (expr.kind == "StackExpression") {
        return {
            ...expr,
            expressions: expr.expressions.map((e) =>
                appendArgumentToFunctionCall(e, functionId, newArg)
            ),
        }
    } else if (expr.kind == "FunctionCallExpression") {
        return {
            ...expr,
            arguments: expr.arguments.map((e) =>
                appendArgumentToFunctionCall(e, functionId, newArg)
            ),
        }
    } else if (expr.kind == "WhileExpression") {
        return {
            ...expr,
            condition: appendArgumentToFunctionCall(expr.condition, functionId, newArg),
            body: appendArgumentToFunctionCall(expr.body, functionId, newArg),
        }
    } else if (expr.kind == "AssignmentExpression") {
        return {
            ...expr,
            value: appendArgumentToFunctionCall(expr.value, functionId, newArg),
        }
    } else if (expr.kind == "IfExpression") {
        return {
            ...expr,
            condition: appendArgumentToFunctionCall(expr.condition, functionId, newArg),
            thenBranch: appendArgumentToFunctionCall(
                expr.thenBranch,
                functionId,
                newArg
            ),
            elseBranch: expr.elseBranch
                ? appendArgumentToFunctionCall(expr.elseBranch, functionId, newArg)
                : undefined,
        }
    } else if (expr.kind == "FunctionDefinitionExpression") {
        return {
            ...expr,
            body: appendArgumentToFunctionCall(expr.body, functionId, newArg),
        }
    } else if (expr.kind == "BooleanExpression") {
        return {
            ...expr,
            left: expr.left
                ? appendArgumentToFunctionCall(expr.left, functionId, newArg)
                : undefined,
            right: expr.right
                ? appendArgumentToFunctionCall(expr.right, functionId, newArg)
                : undefined,
        }
    }
    return expr
}

function insertExpressionAtCursor(
    expr: Expression,
    cursorId: string,
    newExpr: Expression
): Expression {
    const isAppendMode = cursorId.endsWith(":append")
    const actualCursorId = isAppendMode ? cursorId.slice(0, -7) : cursorId

    if (expr.id == actualCursorId && isAppendMode) {
        if (expr.kind == "StackExpression") {
            return {...expr, expressions: [...expr.expressions, newExpr]}
        } else if (expr.kind == "FunctionCallExpression") {
            return {...expr, arguments: [...expr.arguments, newExpr]}
        }
    }

    if (expr.kind == "StackExpression") {
        const idx = expr.expressions.findIndex((e) => e.id == actualCursorId)
        if (idx != -1) {
            const newExprs = [...expr.expressions]
            newExprs.splice(idx, 0, newExpr)
            return {...expr, expressions: newExprs}
        }
        return {
            ...expr,
            expressions: expr.expressions.map((e) =>
                insertExpressionAtCursor(e, cursorId, newExpr)
            ),
        }
    } else if (expr.kind == "FunctionCallExpression") {
        const idx = expr.arguments.findIndex((e) => e.id == actualCursorId)
        if (idx != -1) {
            const newArgs = [...expr.arguments]
            newArgs.splice(idx, 0, newExpr)
            return {...expr, arguments: newArgs}
        }
        return {
            ...expr,
            arguments: expr.arguments.map((e) =>
                insertExpressionAtCursor(e, cursorId, newExpr)
            ),
        }
    } else if (expr.kind == "WhileExpression") {
        return {
            ...expr,
            condition: insertExpressionAtCursor(expr.condition, cursorId, newExpr),
            body: insertExpressionAtCursor(expr.body, cursorId, newExpr),
        }
    } else if (expr.kind == "AssignmentExpression") {
        return {
            ...expr,
            value: insertExpressionAtCursor(expr.value, cursorId, newExpr),
        }
    } else if (expr.kind == "IfExpression") {
        return {
            ...expr,
            condition: insertExpressionAtCursor(expr.condition, cursorId, newExpr),
            thenBranch: insertExpressionAtCursor(expr.thenBranch, cursorId, newExpr),
            elseBranch: expr.elseBranch
                ? insertExpressionAtCursor(expr.elseBranch, cursorId, newExpr)
                : undefined,
        }
    } else if (expr.kind == "FunctionDefinitionExpression") {
        return {
            ...expr,
            body: insertExpressionAtCursor(expr.body, cursorId, newExpr),
        }
    } else if (expr.kind == "BooleanExpression") {
        return {
            ...expr,
            left: expr.left
                ? insertExpressionAtCursor(expr.left, cursorId, newExpr)
                : expr.left,
            right: expr.right
                ? insertExpressionAtCursor(expr.right, cursorId, newExpr)
                : expr.right,
        }
    }
    return expr
}

function deleteExpressionById(expr: Expression, targetId: string): Expression | null {
    if (expr.id === targetId) {
        // Cannot delete the root expression
        return null
    }

    if (expr.kind === "StackExpression") {
        const newExpressions = expr.expressions.filter((e) => e.id !== targetId)
        if (newExpressions.length !== expr.expressions.length) {
            // Found and removed the target
            return {...expr, expressions: newExpressions}
        }
        // Recursively delete from children
        return {
            ...expr,
            expressions: expr.expressions
                .map((e) => deleteExpressionById(e, targetId))
                .filter((e) => e !== null) as Expression[],
        }
    } else if (expr.kind === "FunctionCallExpression") {
        const newArguments = expr.arguments.filter((e) => e.id !== targetId)
        if (newArguments.length !== expr.arguments.length) {
            // Found and removed the target
            return {...expr, arguments: newArguments}
        }
        // Recursively delete from children
        return {
            ...expr,
            arguments: expr.arguments
                .map((e) => deleteExpressionById(e, targetId))
                .filter((e) => e !== null) as Expression[],
        }
    } else if (expr.kind === "WhileExpression") {
        if (expr.condition.id === targetId || expr.body.id === targetId) {
            // Cannot delete condition or body of while loop - these are required
            return expr
        }
        const newCondition = deleteExpressionById(expr.condition, targetId)
        const newBody = deleteExpressionById(expr.body, targetId)
        return {
            ...expr,
            condition: newCondition || expr.condition,
            body: newBody || expr.body,
        }
    } else if (expr.kind === "AssignmentExpression") {
        if (expr.value.id === targetId) {
            // Cannot delete the value of assignment - it's required
            return expr
        }
        const newValue = deleteExpressionById(expr.value, targetId)
        return {
            ...expr,
            value: newValue || expr.value,
        }
    } else if (expr.kind === "IfExpression") {
        if (expr.condition.id === targetId || expr.thenBranch.id === targetId) {
            // Cannot delete condition or then branch - they are required
            return expr
        }
        if (expr.elseBranch?.id === targetId) {
            // Can delete else branch
            return {
                ...expr,
                elseBranch: undefined,
            }
        }
        const newCondition = deleteExpressionById(expr.condition, targetId)
        const newThenBranch = deleteExpressionById(expr.thenBranch, targetId)
        const newElseBranch = expr.elseBranch
            ? deleteExpressionById(expr.elseBranch, targetId)
            : undefined
        return {
            ...expr,
            condition: newCondition || expr.condition,
            thenBranch: newThenBranch || expr.thenBranch,
            elseBranch: newElseBranch || expr.elseBranch,
        }
    } else if (expr.kind === "FunctionDefinitionExpression") {
        if (expr.body.id === targetId) {
            // Cannot delete the body of function definition - it's required
            return expr
        }
        const newBody = deleteExpressionById(expr.body, targetId)
        return {
            ...expr,
            body: newBody || expr.body,
        }
    } else if (expr.kind === "BooleanExpression") {
        if (expr.left?.id === targetId || expr.right?.id === targetId) {
            // Cannot delete operands of boolean expression - they are required
            return expr
        }
        const newLeft = expr.left
            ? deleteExpressionById(expr.left, targetId)
            : undefined
        const newRight = expr.right
            ? deleteExpressionById(expr.right, targetId)
            : undefined
        return {
            ...expr,
            left: newLeft || expr.left,
            right: newRight || expr.right,
        }
    }
    return expr
}

function generateId(): string {
    return Math.random().toString(36).substr(2, 9)
}

function parseExpression(text: string): Expression | null {
    const trimmed = text.trim()

    if (!trimmed) return null

    // Parse numbers
    const numVal = parseFloat(trimmed)
    if (!isNaN(numVal) && numVal.toString() === trimmed) {
        return {
            id: generateId(),
            kind: "ValueExpression",
            value: numVal,
        }
    }

    // Parse boolean values
    if (trimmed === "true" || trimmed === "false") {
        return {
            id: generateId(),
            kind: "ValueExpression",
            value: trimmed === "true",
        }
    }

    // Parse quoted strings
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return {
            id: generateId(),
            kind: "ValueExpression",
            value: trimmed.slice(1, -1),
        }
    }

    // Parse while loops: while condition { body }
    const whileMatch = trimmed.match(/^while\s+(.+?)\s*\{(.+)\}$/)
    if (whileMatch) {
        const conditionExpr = parseExpression(whileMatch[1])
        const bodyExpr = parseExpression(whileMatch[2])
        if (conditionExpr && bodyExpr) {
            return {
                id: generateId(),
                kind: "WhileExpression",
                condition: conditionExpr,
                body: bodyExpr,
            }
        }
    }

    // Parse if expressions: if condition { then } else { else }
    const ifMatch = trimmed.match(/^if\s+(.+?)\s*\{(.+?)\}(?:\s*else\s*\{(.+)\})?$/)
    if (ifMatch) {
        const conditionExpr = parseExpression(ifMatch[1])
        const thenExpr = parseExpression(ifMatch[2])
        const elseExpr = ifMatch[3] ? parseExpression(ifMatch[3]) : undefined
        if (conditionExpr && thenExpr) {
            return {
                id: generateId(),
                kind: "IfExpression",
                condition: conditionExpr,
                thenBranch: thenExpr,
                elseBranch: elseExpr || undefined,
            }
        }
    }

    // Parse function definitions: fn name(param1, param2) { body }
    const fnMatch = trimmed.match(/^fn\s+(\w+)\s*\(([^)]*)\)\s*\{(.+)\}$/)
    if (fnMatch) {
        const funcName = fnMatch[1]
        const params = fnMatch[2]
            ? fnMatch[2]
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p)
            : []
        const bodyExpr = parseExpression(fnMatch[3])
        if (bodyExpr) {
            return {
                id: generateId(),
                kind: "FunctionDefinitionExpression",
                functionName: funcName,
                parameters: params,
                body: bodyExpr,
            }
        }
    }

    // Parse assignments: name = value
    const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/)
    if (assignMatch) {
        const varName = assignMatch[1]
        const valueExpr = parseExpression(assignMatch[2])
        if (valueExpr) {
            return {
                id: generateId(),
                kind: "AssignmentExpression",
                variableName: varName,
                value: valueExpr,
            }
        }
    }

    // Parse function calls: funcName(arg1, arg2, ...)
    const funcCallMatch = trimmed.match(/^(\w+)\s*\(([^)]*)\)$/)
    if (funcCallMatch) {
        const funcName = funcCallMatch[1]
        const argsStr = funcCallMatch[2].trim()
        const args: Expression[] = []

        if (argsStr) {
            // Simple comma splitting (doesn't handle nested function calls properly)
            const argParts = argsStr.split(",")
            for (const argPart of argParts) {
                const argExpr = parseExpression(argPart.trim())
                if (argExpr) {
                    args.push(argExpr)
                }
            }
        }

        return {
            id: generateId(),
            kind: "FunctionCallExpression",
            functionName: funcName,
            arguments: args,
        }
    }

    // Parse boolean expressions
    // Handle binary operators
    const binaryOps = [
        {pattern: /^(.+?)\s+and\s+(.+)$/, op: "and" as const},
        {pattern: /^(.+?)\s+or\s+(.+)$/, op: "or" as const},
        {pattern: /^(.+?)\s*==\s*(.+)$/, op: "equals" as const},
        {pattern: /^(.+?)\s*<\s*(.+)$/, op: "lessThan" as const},
        {pattern: /^(.+?)\s*>\s*(.+)$/, op: "greaterThan" as const},
    ]

    for (const binaryOp of binaryOps) {
        const match = trimmed.match(binaryOp.pattern)
        if (match) {
            const leftExpr = parseExpression(match[1])
            const rightExpr = parseExpression(match[2])
            if (leftExpr && rightExpr) {
                return {
                    id: generateId(),
                    kind: "BooleanExpression",
                    operator: binaryOp.op,
                    left: leftExpr,
                    right: rightExpr,
                }
            }
        }
    }

    // Handle unary not operator
    const notMatch = trimmed.match(/^not\s+(.+)$/)
    if (notMatch) {
        const expr = parseExpression(notMatch[1])
        if (expr) {
            return {
                id: generateId(),
                kind: "BooleanExpression",
                operator: "not",
                left: expr,
            }
        }
    }

    // Parse stack expressions (multiple statements separated by semicolons)
    if (trimmed.includes(";")) {
        const statements = trimmed
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s)
        const expressions: Expression[] = []

        for (const statement of statements) {
            const expr = parseExpression(statement)
            if (expr) {
                expressions.push(expr)
            }
        }

        if (expressions.length > 0) {
            return {
                id: generateId(),
                kind: "StackExpression",
                expressions,
            }
        }
    }

    // Default to variable expression
    if (/^\w+$/.test(trimmed)) {
        return {
            id: generateId(),
            kind: "VariableExpression",
            variableName: trimmed,
        }
    }

    return null
}

export type EditorMode = "normal" | "insert"

export interface Store {
    program: Expression
    selectionId: string | null
    mode: EditorMode
    insertionCursor: string | null
    insertionText: string
    setSelectionId: (id: string) => void
    moveSelectionRight: () => void
    moveSelectionLeft: () => void
    moveSelectionUp: () => void
    moveSelectionDown: () => void
    enterInsertMode: () => void
    exitInsertMode: () => void
    setInsertionText: (text: string) => void
    commitInsertion: () => void
    getAllVariables: () => string[]
    appendArgument: (functionId: string, arg: Expression) => void
    canAppendArgument: (functionId: string) => boolean
    createValueExpression: (value: Value) => Expression
    createVariableExpression: (variableName: string) => Expression
    deleteNode: () => void
}

export const useStore = create<Store>()((set, get) => ({
    program: defaultProgram,
    selectionId: "0",
    mode: "normal",
    insertionCursor: null,
    insertionText: "",
    setSelectionId: (id: string) => set({selectionId: id}),
    moveSelectionRight: () => {
        const {program, selectionId} = get()
        if (!selectionId) return
        const allIds = getAllIds(program)
        const idx = allIds.indexOf(selectionId)
        if (idx != -1 && idx < allIds.length - 1) {
            set({selectionId: allIds[idx + 1]})
        }
    },
    moveSelectionLeft: () => {
        const {program, selectionId} = get()
        if (!selectionId) return
        const allIds = getAllIds(program)
        const idx = allIds.indexOf(selectionId)
        if (idx > 0) {
            set({selectionId: allIds[idx - 1]})
        }
    },
    moveSelectionUp: () => {
        const {program, selectionId} = get()
        if (!selectionId) return
        const siblingId = findPreviousSiblingRecursive(program, selectionId)
        if (siblingId) {
            set({selectionId: siblingId})
        }
    },
    moveSelectionDown: () => {
        const {program, selectionId} = get()
        if (!selectionId) return
        const siblingId = findNextSiblingRecursive(program, selectionId)
        if (siblingId) {
            set({selectionId: siblingId})
        }
    },
    enterInsertMode: () => {
        const {program, selectionId} = get()
        if (!selectionId) return

        const selectedExpr = findExpressionById(program, selectionId)
        const parentId = findParent(program, selectionId)
        const parent = parentId ? findExpressionById(program, parentId) : null

        if (selectedExpr?.kind == "FunctionCallExpression") {
            set({
                mode: "insert",
                insertionCursor: `${selectionId}:append`,
                insertionText: "",
            })
        } else if (selectedExpr?.kind == "StackExpression") {
            set({
                mode: "insert",
                insertionCursor: `${selectionId}:append`,
                insertionText: "",
            })
        } else if (parent?.kind == "FunctionCallExpression") {
            const isLastArg =
                parent.arguments[parent.arguments.length - 1]?.id == selectionId
            if (isLastArg) {
                set({
                    mode: "insert",
                    insertionCursor: `${parentId}:append`,
                    insertionText: "",
                })
            } else {
                const nextSibling = findNextSibling(program, selectionId)
                set({
                    mode: "insert",
                    insertionCursor: nextSibling || selectionId,
                    insertionText: "",
                })
            }
        } else if (parent?.kind == "StackExpression") {
            const isLastExpr =
                parent.expressions[parent.expressions.length - 1]?.id == selectionId
            if (isLastExpr) {
                set({
                    mode: "insert",
                    insertionCursor: `${parentId}:append`,
                    insertionText: "",
                })
            } else {
                const nextSibling = findNextSibling(program, selectionId)
                set({
                    mode: "insert",
                    insertionCursor: nextSibling || selectionId,
                    insertionText: "",
                })
            }
        } else if (
            parent?.kind == "IfExpression" ||
            parent?.kind == "WhileExpression" ||
            parent?.kind == "FunctionDefinitionExpression" ||
            parent?.kind == "BooleanExpression"
        ) {
            // For these expression types, insert after the current selection
            const nextSibling = findNextSiblingRecursive(program, selectionId)
            set({
                mode: "insert",
                insertionCursor: nextSibling || selectionId,
                insertionText: "",
            })
        } else {
            const nextSibling = findNextSiblingRecursive(program, selectionId)
            set({
                mode: "insert",
                insertionCursor: nextSibling || selectionId,
                insertionText: "",
            })
        }
    },
    exitInsertMode: () => {
        set({mode: "normal", insertionCursor: null, insertionText: ""})
    },
    setInsertionText: (text: string) => {
        set({insertionText: text})
    },
    commitInsertion: () => {
        const {program, insertionCursor, insertionText} = get()
        if (!insertionCursor || !insertionText.trim()) {
            set({mode: "normal", insertionCursor: null, insertionText: ""})
            return
        }

        const newExpr = parseExpression(insertionText)
        if (!newExpr) {
            // Fallback to variable expression if parsing fails
            const fallbackExpr: Expression = {
                id: generateId(),
                kind: "VariableExpression",
                variableName: insertionText.trim(),
            }
            const newProgram = insertExpressionAtCursor(
                program,
                insertionCursor,
                fallbackExpr
            )
            set({
                program: newProgram,
                mode: "normal",
                insertionCursor: null,
                insertionText: "",
                selectionId: fallbackExpr.id,
            })
            return
        }

        const newProgram = insertExpressionAtCursor(program, insertionCursor, newExpr)
        set({
            program: newProgram,
            mode: "normal",
            insertionCursor: null,
            insertionText: "",
            selectionId: newExpr.id,
        })
    },
    getAllVariables: () => {
        const {program} = get()
        return getAllVariables(program)
    },
    appendArgument: (functionId: string, arg: Expression) => {
        const {program} = get()
        const newProgram = appendArgumentToFunctionCall(program, functionId, arg)
        set({program: newProgram})
    },
    canAppendArgument: (functionId: string) => {
        const {program} = get()
        const expr = findExpressionById(program, functionId)
        return expr?.kind == "FunctionCallExpression"
    },
    createValueExpression: (value: Value) => ({
        id: generateId(),
        kind: "ValueExpression" as const,
        value,
    }),
    createVariableExpression: (variableName: string) => ({
        id: generateId(),
        kind: "VariableExpression" as const,
        variableName,
    }),
    deleteNode: () => {
        const {program, selectionId} = get()
        if (!selectionId || selectionId === "0") return // Cannot delete root or if nothing selected

        const newProgram = deleteExpressionById(program, selectionId)
        if (newProgram) {
            // Find a new selection after deletion
            const allIds = getAllIds(newProgram)
            const newSelectionId = allIds.length > 0 ? allIds[0] : "0"
            set({program: newProgram, selectionId: newSelectionId})
        }
    },
}))
