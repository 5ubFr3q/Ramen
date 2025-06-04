export type Value = number | string

export type Expression =
    | StackExpression
    | FunctionCallExpression
    | ValueExpression
    | WhileExpression
    | AssignmentExpression
    | VariableExpression

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
