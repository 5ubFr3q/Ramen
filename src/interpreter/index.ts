import type {Expression, Value} from "../types/ast"

export interface RuntimeEnvironment {
    variables: Map<string, Value>
    functions: Map<string, (args: Value[]) => Value>
}

export class InterpreterError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "InterpreterError"
    }
}

function createStandardLibrary(): Map<string, (args: Value[]) => Value> {
    const functions = new Map<string, (args: Value[]) => Value>()

    functions.set("print", (args: Value[]) => {
        const output = args.map((arg) => String(arg)).join(" ")
        console.log(output)
        return output
    })

    functions.set("add", (args: Value[]) => {
        if (args.length !== 2)
            throw new InterpreterError("add requires exactly 2 arguments")
        const [a, b] = args
        if (typeof a !== "number" || typeof b !== "number") {
            throw new InterpreterError("add requires numeric arguments")
        }
        return a + b
    })

    functions.set("subtract", (args: Value[]) => {
        if (args.length !== 2)
            throw new InterpreterError("subtract requires exactly 2 arguments")
        const [a, b] = args
        if (typeof a !== "number" || typeof b !== "number") {
            throw new InterpreterError("subtract requires numeric arguments")
        }
        return a - b
    })

    functions.set("multiply", (args: Value[]) => {
        if (args.length !== 2)
            throw new InterpreterError("multiply requires exactly 2 arguments")
        const [a, b] = args
        if (typeof a !== "number" || typeof b !== "number") {
            throw new InterpreterError("multiply requires numeric arguments")
        }
        return a * b
    })

    functions.set("divide", (args: Value[]) => {
        if (args.length !== 2)
            throw new InterpreterError("divide requires exactly 2 arguments")
        const [a, b] = args
        if (typeof a !== "number" || typeof b !== "number") {
            throw new InterpreterError("divide requires numeric arguments")
        }
        if (b === 0) throw new InterpreterError("division by zero")
        return a / b
    })

    functions.set("lessThan", (args: Value[]) => {
        if (args.length !== 2)
            throw new InterpreterError("lessThan requires exactly 2 arguments")
        const [a, b] = args
        if (typeof a !== "number" || typeof b !== "number") {
            throw new InterpreterError("lessThan requires numeric arguments")
        }
        return a < b
    })

    functions.set("greaterThan", (args: Value[]) => {
        if (args.length !== 2)
            throw new InterpreterError("greaterThan requires exactly 2 arguments")
        const [a, b] = args
        if (typeof a !== "number" || typeof b !== "number") {
            throw new InterpreterError("greaterThan requires numeric arguments")
        }
        return a > b
    })

    functions.set("equals", (args: Value[]) => {
        if (args.length !== 2)
            throw new InterpreterError("equals requires exactly 2 arguments")
        const [a, b] = args
        return a === b
    })

    return functions
}

export function createEnvironment(): RuntimeEnvironment {
    return {
        variables: new Map(),
        functions: createStandardLibrary(),
    }
}

export function interpret(expr: Expression, env: RuntimeEnvironment): Value | null {
    switch (expr.kind) {
        case "ValueExpression": {
            return expr.value
        }

        case "VariableExpression": {
            if (!env.variables.has(expr.variableName)) {
                throw new InterpreterError(
                    `Variable '${expr.variableName}' is not defined`
                )
            }
            return env.variables.get(expr.variableName)!
        }

        case "AssignmentExpression": {
            const value = interpret(expr.value, env)
            if (value !== null) {
                env.variables.set(expr.variableName, value)
                return value
            }
            throw new InterpreterError("Cannot assign null value")
        }

        case "FunctionCallExpression": {
            if (!env.functions.has(expr.functionName)) {
                throw new InterpreterError(
                    `Function '${expr.functionName}' is not defined`
                )
            }
            const func = env.functions.get(expr.functionName)!
            const args: Value[] = []
            for (const arg of expr.arguments) {
                const argValue = interpret(arg, env)
                if (argValue !== null) {
                    args.push(argValue)
                } else {
                    throw new InterpreterError("Cannot pass null value as argument")
                }
            }
            return func(args)
        }

        case "StackExpression": {
            let lastValue: Value | null = null
            for (const childExpr of expr.expressions) {
                lastValue = interpret(childExpr, env)
            }
            return lastValue
        }

        case "BooleanExpression": {
            switch (expr.operator) {
                case "not": {
                    if (!expr.left)
                        throw new InterpreterError("not operator requires an operand")
                    const leftValue = interpret(expr.left, env)
                    if (leftValue === null || typeof leftValue !== "boolean") {
                        throw new InterpreterError(
                            "not operator requires a boolean operand"
                        )
                    }
                    return !leftValue
                }

                case "and": {
                    if (!expr.left || !expr.right) {
                        throw new InterpreterError("and operator requires two operands")
                    }
                    const leftAnd = interpret(expr.left, env)
                    if (leftAnd === null || typeof leftAnd !== "boolean") {
                        throw new InterpreterError(
                            "and operator requires boolean operands"
                        )
                    }
                    if (!leftAnd) return false
                    const rightAnd = interpret(expr.right, env)
                    if (rightAnd === null || typeof rightAnd !== "boolean") {
                        throw new InterpreterError(
                            "and operator requires boolean operands"
                        )
                    }
                    return rightAnd
                }

                case "or": {
                    if (!expr.left || !expr.right) {
                        throw new InterpreterError("or operator requires two operands")
                    }
                    const leftOr = interpret(expr.left, env)
                    if (leftOr === null || typeof leftOr !== "boolean") {
                        throw new InterpreterError(
                            "or operator requires boolean operands"
                        )
                    }
                    if (leftOr) return true
                    const rightOr = interpret(expr.right, env)
                    if (rightOr === null || typeof rightOr !== "boolean") {
                        throw new InterpreterError(
                            "or operator requires boolean operands"
                        )
                    }
                    return rightOr
                }

                case "equals": {
                    if (!expr.left || !expr.right) {
                        throw new InterpreterError(
                            "equals operator requires two operands"
                        )
                    }
                    return interpret(expr.left, env) === interpret(expr.right, env)
                }

                case "lessThan": {
                    if (!expr.left || !expr.right) {
                        throw new InterpreterError(
                            "lessThan operator requires two operands"
                        )
                    }
                    const leftLt = interpret(expr.left, env)
                    const rightLt = interpret(expr.right, env)
                    if (
                        leftLt === null ||
                        rightLt === null ||
                        typeof leftLt !== "number" ||
                        typeof rightLt !== "number"
                    ) {
                        throw new InterpreterError(
                            "lessThan operator requires numeric operands"
                        )
                    }
                    return leftLt < rightLt
                }

                case "greaterThan": {
                    if (!expr.left || !expr.right) {
                        throw new InterpreterError(
                            "greaterThan operator requires two operands"
                        )
                    }
                    const leftGt = interpret(expr.left, env)
                    const rightGt = interpret(expr.right, env)
                    if (
                        leftGt === null ||
                        rightGt === null ||
                        typeof leftGt !== "number" ||
                        typeof rightGt !== "number"
                    ) {
                        throw new InterpreterError(
                            "greaterThan operator requires numeric operands"
                        )
                    }
                    return leftGt > rightGt
                }

                default: {
                    throw new InterpreterError(
                        `Unknown boolean operator: ${expr.operator}`
                    )
                }
            }
        }

        case "IfExpression": {
            const condition = interpret(expr.condition, env)
            if (condition === null || typeof condition !== "boolean") {
                throw new InterpreterError("if condition must be a boolean")
            }
            if (condition) {
                return interpret(expr.thenBranch, env)
            } else if (expr.elseBranch) {
                return interpret(expr.elseBranch, env)
            }
            return null
        }

        case "WhileExpression": {
            let result: Value | null = null
            while (true) {
                const condition = interpret(expr.condition, env)
                if (condition === null || typeof condition !== "boolean") {
                    throw new InterpreterError("while condition must be a boolean")
                }
                if (!condition) break
                result = interpret(expr.body, env)
            }
            return result
        }

        case "FunctionDefinitionExpression": {
            const userFunction = (args: Value[]) => {
                if (args.length !== expr.parameters.length) {
                    throw new InterpreterError(
                        `Function '${expr.functionName}' expects ${expr.parameters.length} arguments, got ${args.length}`
                    )
                }

                const newEnv: RuntimeEnvironment = {
                    variables: new Map(env.variables),
                    functions: new Map(env.functions),
                }

                for (let i = 0; i < expr.parameters.length; i++) {
                    newEnv.variables.set(expr.parameters[i], args[i])
                }

                const result = interpret(expr.body, newEnv)
                return result || false // Return false if result is null
            }

            env.functions.set(expr.functionName, userFunction)
            return null
        }

        default: {
            expr satisfies never
            throw new InterpreterError(`Unknown expression kind`)
        }
    }
}
