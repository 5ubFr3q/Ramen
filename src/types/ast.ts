export type Value = number | string | boolean

export type Expression =
    | StackExpression
    | FunctionCallExpression
    | ValueExpression
    | WhileExpression
    | AssignmentExpression
    | VariableExpression
    | IfExpression
    | FunctionDefinitionExpression
    | BooleanExpression

export interface BaseExpression {
    id: string
}

export interface StackExpression extends BaseExpression {
    kind: "StackExpression"
    expressions: Expression[]
}

export interface FunctionCallExpression extends BaseExpression {
    kind: "FunctionCallExpression"
    functionName: string
    arguments: Expression[]
}

export interface ValueExpression extends BaseExpression {
    kind: "ValueExpression"
    value: Value
}

export interface WhileExpression extends BaseExpression {
    kind: "WhileExpression"
    condition: Expression
    body: Expression
}

export interface AssignmentExpression extends BaseExpression {
    kind: "AssignmentExpression"
    variableName: string
    value: Expression
}

export interface VariableExpression extends BaseExpression {
    kind: "VariableExpression"
    variableName: string
}

export interface IfExpression extends BaseExpression {
    kind: "IfExpression"
    condition: Expression
    thenBranch: Expression
    elseBranch?: Expression
}

export interface FunctionDefinitionExpression extends BaseExpression {
    kind: "FunctionDefinitionExpression"
    functionName: string
    parameters: string[]
    body: Expression
}

export interface BooleanExpression extends BaseExpression {
    kind: "BooleanExpression"
    operator: "and" | "or" | "not" | "equals" | "lessThan" | "greaterThan"
    left?: Expression
    right?: Expression
}
