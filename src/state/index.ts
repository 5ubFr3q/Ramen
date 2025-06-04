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
    }
    return expr
}

function generateId(): string {
    return Math.random().toString(36).substr(2, 9)
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

        const numVal = parseFloat(insertionText)
        const newExpr =
            !isNaN(numVal) && numVal.toString() == insertionText.trim()
                ? {id: generateId(), kind: "ValueExpression" as const, value: numVal}
                : insertionText.trim().startsWith('"') &&
                  insertionText.trim().endsWith('"')
                ? {
                      id: generateId(),
                      kind: "ValueExpression" as const,
                      value: insertionText.trim().slice(1, -1),
                  }
                : {
                      id: generateId(),
                      kind: "VariableExpression" as const,
                      variableName: insertionText.trim(),
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
}))
