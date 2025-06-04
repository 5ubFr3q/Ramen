import {cn} from "../lib/utils"
import {useStore} from "../state"
import type * as ast from "../types/ast"

function useSelection(id: string) {
    const selectionId = useStore((state) => state.selectionId)
    const setSelectionId = useStore((state) => state.setSelectionId)
    const isSelected = id === selectionId
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectionId(id)
    }
    return {isSelected, handleClick}
}

function useInsertionCursor() {
    const mode = useStore((state) => state.mode)
    const insertionCursor = useStore((state) => state.insertionCursor)
    const insertionText = useStore((state) => state.insertionText)
    const setInsertionText = useStore((state) => state.setInsertionText)
    return {mode, insertionCursor, insertionText, setInsertionText}
}

function InsertionCursor() {
    const {insertionText, setInsertionText} = useInsertionCursor()
    const exitInsertMode = useStore((state) => state.exitInsertMode)
    const commitInsertion = useStore((state) => state.commitInsertion)

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            commitInsertion()
        } else if (e.key === "Escape") {
            e.preventDefault()
            exitInsertMode()
        }
    }

    return (
        <input
            type="text"
            value={insertionText}
            onChange={(e) => setInsertionText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border border-green-500 bg-green-50 px-1 text-sm font-mono min-w-20 max-w-32 outline-none focus:ring-2 focus:ring-green-200"
            placeholder="type..."
            autoFocus
        />
    )
}

function VerticalInsertionCursor() {
    const {insertionText, setInsertionText} = useInsertionCursor()
    const exitInsertMode = useStore((state) => state.exitInsertMode)
    const commitInsertion = useStore((state) => state.commitInsertion)

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            commitInsertion()
        } else if (e.key === "Escape") {
            e.preventDefault()
            exitInsertMode()
        }
    }

    return (
        <div className="flex items-center">
            <div className="w-0.5 h-4 bg-green-500 mx-1" />
            <input
                type="text"
                value={insertionText}
                onChange={(e) => setInsertionText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border border-green-500 bg-green-50 px-1 text-sm font-mono min-w-16 max-w-24 outline-none focus:ring-2 focus:ring-green-200"
                placeholder="..."
                autoFocus
            />
        </div>
    )
}

function ExpressionContainer({
    expr,
    children,
    className = "",
}: {
    expr: ast.Expression
    children: React.ReactNode
    className?: string
}) {
    const {isSelected, handleClick} = useSelection(expr.id)
    return (
        <div
            className={cn(
                "cursor-pointer border-2 rounded transition-all duration-150",
                isSelected
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                    : "border-transparent hover:not-[:has(div:hover)]:bg-blue-100",
                className
            )}
            onClick={handleClick}
        >
            {children}
        </div>
    )
}

function StackExpression({expr}: {expr: ast.StackExpression}) {
    const {mode, insertionCursor} = useInsertionCursor()

    return (
        <ExpressionContainer expr={expr} className="flex flex-col gap-1 p-1">
            {expr.expressions.map((e) => (
                <div key={e.id}>
                    {mode == "insert" && insertionCursor == e.id && <InsertionCursor />}
                    <Expression expr={e} />
                </div>
            ))}
            {mode == "insert" && insertionCursor == `${expr.id}:append` && (
                <InsertionCursor />
            )}
        </ExpressionContainer>
    )
}

function FunctionCallExpression({expr}: {expr: ast.FunctionCallExpression}) {
    const {mode, insertionCursor} = useInsertionCursor()

    return (
        <ExpressionContainer expr={expr} className="flex items-center gap-0.5 px-1 ">
            <span className="font-mono font-semibold text-sm">{expr.functionName}</span>
            <span className="font-mono text-sm">(</span>
            {expr.arguments.map((arg, i) => (
                <div key={arg.id} className="flex items-center">
                    {i > 0 && <span className="font-mono mr-0.5 text-sm">,</span>}
                    {mode == "insert" && insertionCursor == arg.id && (
                        <VerticalInsertionCursor />
                    )}
                    <Expression expr={arg} />
                </div>
            ))}
            {mode == "insert" &&
                insertionCursor == `${expr.id}:append` &&
                expr.arguments.length > 0 && (
                    <span className="font-mono mr-0.5 text-sm">,</span>
                )}
            {mode == "insert" && insertionCursor == `${expr.id}:append` && (
                <VerticalInsertionCursor />
            )}
            <span className="font-mono text-sm">)</span>
        </ExpressionContainer>
    )
}

function ValueExpression({expr}: {expr: ast.ValueExpression}) {
    const isStr = typeof expr.value == "string"
    const color = isStr ? "text-green-600" : "text-blue-600"
    const display = isStr ? `"${expr.value}"` : expr.value

    return (
        <ExpressionContainer expr={expr} className={`font-mono px-1  text-sm ${color}`}>
            {display}
        </ExpressionContainer>
    )
}

function WhileExpression({expr}: {expr: ast.WhileExpression}) {
    const {mode, insertionCursor} = useInsertionCursor()

    return (
        <ExpressionContainer
            expr={expr}
            className="flex flex-col gap-1 p-1 bg-yellow-50"
        >
            <div className="flex items-center gap-1">
                <span className="font-mono font-semibold text-sm">while</span>
                {mode == "insert" && insertionCursor == expr.condition.id && (
                    <VerticalInsertionCursor />
                )}
                <Expression expr={expr.condition} />
            </div>
            <div className="ml-3">
                {mode == "insert" && insertionCursor == expr.body.id && (
                    <InsertionCursor />
                )}
                <Expression expr={expr.body} />
            </div>
        </ExpressionContainer>
    )
}

function AssignmentExpression({expr}: {expr: ast.AssignmentExpression}) {
    const {mode, insertionCursor} = useInsertionCursor()

    return (
        <ExpressionContainer expr={expr} className="flex items-center gap-1 px-1 ">
            <span className="font-mono font-semibold text-purple-600 text-sm">
                {expr.variableName}
            </span>
            <span className="font-mono text-sm">=</span>
            {mode == "insert" && insertionCursor == expr.value.id && (
                <VerticalInsertionCursor />
            )}
            <Expression expr={expr.value} />
        </ExpressionContainer>
    )
}

function VariableExpression({expr}: {expr: ast.VariableExpression}) {
    return (
        <ExpressionContainer
            expr={expr}
            className="font-mono text-purple-600 px-1  text-sm"
        >
            {expr.variableName}
        </ExpressionContainer>
    )
}

function IfExpression({expr}: {expr: ast.IfExpression}) {
    const {mode, insertionCursor} = useInsertionCursor()

    return (
        <ExpressionContainer
            expr={expr}
            className="flex flex-col gap-1 p-1 bg-orange-50"
        >
            <div className="flex items-center gap-1">
                <span className="font-mono font-semibold text-sm">if</span>
                {mode == "insert" && insertionCursor == expr.condition.id && (
                    <VerticalInsertionCursor />
                )}
                <Expression expr={expr.condition} />
            </div>
            <div className="ml-3">
                <div className="text-xs text-gray-500 font-mono">then:</div>
                {mode == "insert" && insertionCursor == expr.thenBranch.id && (
                    <InsertionCursor />
                )}
                <Expression expr={expr.thenBranch} />
            </div>
            {expr.elseBranch && (
                <div className="ml-3">
                    <div className="text-xs text-gray-500 font-mono">else:</div>
                    {mode == "insert" && insertionCursor == expr.elseBranch.id && (
                        <InsertionCursor />
                    )}
                    <Expression expr={expr.elseBranch} />
                </div>
            )}
        </ExpressionContainer>
    )
}

function FunctionDefinitionExpression({
    expr,
}: {
    expr: ast.FunctionDefinitionExpression
}) {
    const {mode, insertionCursor} = useInsertionCursor()

    return (
        <ExpressionContainer expr={expr} className="flex flex-col gap-1 p-1 bg-cyan-50">
            <div className="flex items-center gap-1">
                <span className="font-mono font-semibold text-sm">fn</span>
                <span className="font-mono font-semibold text-cyan-600 text-sm">
                    {expr.functionName}
                </span>
                <span className="font-mono text-sm">(</span>
                {expr.parameters.map((param, i) => (
                    <span key={param} className="font-mono text-sm text-gray-600">
                        {i > 0 && ", "}
                        {param}
                    </span>
                ))}
                <span className="font-mono text-sm">)</span>
            </div>
            <div className="ml-3">
                {mode == "insert" && insertionCursor == expr.body.id && (
                    <InsertionCursor />
                )}
                <Expression expr={expr.body} />
            </div>
        </ExpressionContainer>
    )
}

function BooleanExpression({expr}: {expr: ast.BooleanExpression}) {
    const {mode, insertionCursor} = useInsertionCursor()

    if (expr.operator === "not") {
        return (
            <ExpressionContainer expr={expr} className="flex items-center gap-1 px-1">
                <span className="font-mono font-semibold text-red-600 text-sm">
                    not
                </span>
                {mode == "insert" && insertionCursor == expr.left?.id && (
                    <VerticalInsertionCursor />
                )}
                {expr.left && <Expression expr={expr.left} />}
            </ExpressionContainer>
        )
    }

    const operatorSymbol =
        {
            and: "&&",
            or: "||",
            equals: "==",
            lessThan: "<",
            greaterThan: ">",
        }[expr.operator] || expr.operator

    return (
        <ExpressionContainer expr={expr} className="flex items-center gap-1 px-1">
            {mode == "insert" && insertionCursor == expr.left?.id && (
                <VerticalInsertionCursor />
            )}
            {expr.left && <Expression expr={expr.left} />}
            <span className="font-mono font-semibold text-red-600 text-sm">
                {operatorSymbol}
            </span>
            {mode == "insert" && insertionCursor == expr.right?.id && (
                <VerticalInsertionCursor />
            )}
            {expr.right && <Expression expr={expr.right} />}
        </ExpressionContainer>
    )
}

export function Expression({expr}: {expr: ast.Expression}) {
    switch (expr.kind) {
        case "StackExpression":
            return <StackExpression expr={expr} />
        case "FunctionCallExpression":
            return <FunctionCallExpression expr={expr} />
        case "ValueExpression":
            return <ValueExpression expr={expr} />
        case "WhileExpression":
            return <WhileExpression expr={expr} />
        case "AssignmentExpression":
            return <AssignmentExpression expr={expr} />
        case "VariableExpression":
            return <VariableExpression expr={expr} />
        case "IfExpression":
            return <IfExpression expr={expr} />
        case "FunctionDefinitionExpression":
            return <FunctionDefinitionExpression expr={expr} />
        case "BooleanExpression":
            return <BooleanExpression expr={expr} />
        default:
            expr satisfies never
    }
}
