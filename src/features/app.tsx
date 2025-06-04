import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {ScrollArea} from "@/components/ui/scroll-area"
import {useCallback, useEffect, useRef, useState} from "react"
import {Expression} from "../components/Expression"
import {HelpPanel} from "../components/HelpPanel"
import {useKeyboard} from "../hooks/useKeyboard"
import {createEnvironment, interpret, InterpreterError} from "../interpreter"
import {useStore} from "../state"

export function App() {
    const prog = useStore((state) => state.program)
    const mode = useStore((state) => state.mode)
    const insertionText = useStore((state) => state.insertionText)
    const moveSelectionRight = useStore((state) => state.moveSelectionRight)
    const moveSelectionLeft = useStore((state) => state.moveSelectionLeft)
    const moveSelectionUp = useStore((state) => state.moveSelectionUp)
    const moveSelectionDown = useStore((state) => state.moveSelectionDown)
    const enterInsertMode = useStore((state) => state.enterInsertMode)
    const deleteNode = useStore((state) => state.deleteNode)

    // Console state
    const [consoleOutput, setConsoleOutput] = useState<string[]>([
        "Welcome to Ramen Console",
        "Type commands here...",
    ])
    const [consoleInput, setConsoleInput] = useState("")
    const consoleOutputRef = useRef<HTMLDivElement>(null)

    // Right panel tab state
    const [activeTab, setActiveTab] = useState<"console" | "help">("console")

    // Maximum number of lines to keep in scrollback (prevents memory issues)
    const MAX_CONSOLE_LINES = 1000

    // Helper function to add lines to console with scrollback limit
    const addToConsole = useCallback(
        (lines: string[]) => {
            setConsoleOutput((prev) => {
                const newOutput = [...prev, ...lines]
                // Keep only the last MAX_CONSOLE_LINES lines
                if (newOutput.length > MAX_CONSOLE_LINES) {
                    return newOutput.slice(-MAX_CONSOLE_LINES)
                }
                return newOutput
            })
        },
        [MAX_CONSOLE_LINES]
    )

    // Auto-scroll to bottom when new content is added
    useEffect(() => {
        if (consoleOutputRef.current) {
            consoleOutputRef.current.scrollTop = consoleOutputRef.current.scrollHeight
        }
    }, [consoleOutput])

    const handleConsoleSubmit = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && consoleInput.trim()) {
                // Simple command processing
                if (consoleInput.trim() === "clear") {
                    setConsoleOutput([])
                } else if (consoleInput.trim() === "help") {
                    addToConsole([
                        `> ${consoleInput}`,
                        "Available commands: clear, help, interpret",
                    ])
                } else if (consoleInput.trim() === "interpret") {
                    try {
                        const env = createEnvironment()

                        // Capture console.log output
                        const originalLog = console.log
                        const capturedOutput: string[] = []
                        console.log = (...args: unknown[]) => {
                            capturedOutput.push(
                                args.map((arg) => String(arg)).join(" ")
                            )
                        }

                        const result = interpret(prog, env)

                        // Restore console.log
                        console.log = originalLog

                        // Build output lines
                        const outputLines = [`> ${consoleInput}`]
                        outputLines.push(...capturedOutput)

                        // Add final result if it's not null
                        if (result !== null) {
                            outputLines.push(`Result: ${String(result)}`)
                        }

                        addToConsole(outputLines)
                    } catch (error) {
                        const errorLines = [`> ${consoleInput}`]
                        if (error instanceof InterpreterError) {
                            errorLines.push(`Interpreter Error: ${error.message}`)
                        } else {
                            errorLines.push(`Error: ${String(error)}`)
                        }
                        addToConsole(errorLines)
                    }
                } else {
                    addToConsole([
                        `> ${consoleInput}`,
                        `Command not recognized: ${consoleInput}`,
                    ])
                }

                setConsoleInput("")
            }
        },
        [consoleInput, addToConsole, prog]
    )

    const clearConsole = useCallback(() => {
        setConsoleOutput([])
    }, [])

    const executeProgram = useCallback(() => {
        try {
            const env = createEnvironment()

            // Capture console.log output
            const originalLog = console.log
            const capturedOutput: string[] = []
            console.log = (...args: unknown[]) => {
                capturedOutput.push(args.map((arg) => String(arg)).join(" "))
            }

            const result = interpret(prog, env)

            // Restore console.log
            console.log = originalLog

            // Build output lines
            const outputLines = ["> Execute Program"]
            outputLines.push(...capturedOutput)

            // Add final result if it's not null
            if (result !== null) {
                outputLines.push(`Result: ${String(result)}`)
            }

            addToConsole(outputLines)
        } catch (error) {
            const errorLines = ["> Execute Program"]
            if (error instanceof InterpreterError) {
                errorLines.push(`Interpreter Error: ${error.message}`)
            } else {
                errorLines.push(`Error: ${String(error)}`)
            }
            addToConsole(errorLines)
        }
    }, [prog, addToConsole])

    // Resizable panel state
    const [rightPanelWidth, setRightPanelWidth] = useState(600)
    const [isResizing, setIsResizing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsResizing(true)
        e.preventDefault()
    }, [])

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return

            const containerRect = containerRef.current.getBoundingClientRect()
            const newWidth = containerRect.right - e.clientX
            const minWidth = 200
            const maxWidth = containerRect.width * 0.6

            setRightPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)))
        },
        [isResizing]
    )

    const handleMouseUp = useCallback(() => {
        setIsResizing(false)
    }, [])

    // Add global mouse event listeners for resizing
    useEffect(() => {
        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
            document.body.style.cursor = "col-resize"
            document.body.style.userSelect = "none"
        } else {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            document.body.style.cursor = ""
            document.body.style.userSelect = ""
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            document.body.style.cursor = ""
            document.body.style.userSelect = ""
        }
    }, [isResizing, handleMouseMove, handleMouseUp])

    const normalModeKeys = [
        {key: "l", callback: moveSelectionRight},
        {key: "h", callback: moveSelectionLeft},
        {key: "k", callback: moveSelectionUp},
        {key: "j", callback: moveSelectionDown},
        {key: "a", callback: enterInsertMode},
        {key: "d", callback: deleteNode},
        {key: "?", callback: () => setActiveTab("help")},
    ]

    const insertModeKeys = [{key: "?", callback: () => setActiveTab("help")}]

    const shortcuts = mode == "normal" ? normalModeKeys : insertModeKeys

    useKeyboard(shortcuts)

    return (
        <div ref={containerRef} className="flex h-screen flex-col">
            {/* Header Bar */}
            <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold text-gray-900">Ramen IDE</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Mode:</span>
                            <Badge
                                variant={mode === "normal" ? "default" : "secondary"}
                            >
                                {mode === "normal" ? "NORMAL" : "INSERT"}
                            </Badge>
                        </div>
                        {mode === "insert" && insertionText && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Text:</span>
                                <Badge variant="outline" className="text-green-600">
                                    "{insertionText}"
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    onClick={executeProgram}
                    size="default"
                    className="font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    ▶ RUN PROGRAM
                </Button>
            </div>

            {/* Main content container */}
            <div className="flex flex-1">
                {/* Main content area */}
                <div
                    className="flex-1 p-4 overflow-auto"
                    style={{marginRight: rightPanelWidth}}
                >
                    <Expression expr={prog} />
                </div>

                {/* Resize handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className={`w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors ${
                        isResizing ? "bg-gray-400" : ""
                    } relative z-10`}
                    style={{
                        position: "fixed",
                        right: rightPanelWidth,
                        top: "61px", // Header height: py-3 (24px top + 24px bottom) + border-b (1px) + text height (~12px)
                        height: "calc(100vh - 61px)",
                    }}
                />

                {/* Right panel */}
                <div
                    className="border-l border-gray-300 bg-gray-50 p-2 fixed right-0 flex flex-col"
                    style={{
                        width: rightPanelWidth,
                        top: "61px", // Header height: py-3 (24px top + 24px bottom) + border-b (1px) + text height (~12px)
                        height: "calc(100vh - 61px)",
                    }}
                >
                    {/* Tab headers */}
                    <div className="flex items-center mb-2 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("console")}
                            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "console"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            Console
                        </button>
                        <button
                            onClick={() => setActiveTab("help")}
                            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "help"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            Help
                        </button>
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {activeTab === "console" ? (
                            <>
                                {/* Console header */}
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <h3 className="text-lg font-semibold">Console</h3>
                                    <Button
                                        onClick={clearConsole}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Clear
                                    </Button>
                                </div>

                                {/* Console output */}
                                <ScrollArea className="bg-black text-green-400 font-mono text-sm p-3 rounded border mb-2 flex-1">
                                    <div ref={consoleOutputRef}>
                                        {consoleOutput.map((line, index) => (
                                            <div key={index} className="mb-1">
                                                {line}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {/* Console input */}
                                <div className="flex items-center gap-2 px-1">
                                    <span className="text-sm font-mono text-gray-600">
                                        $
                                    </span>
                                    <Input
                                        type="text"
                                        value={consoleInput}
                                        onChange={(e) =>
                                            setConsoleInput(e.target.value)
                                        }
                                        onKeyDown={handleConsoleSubmit}
                                        className="flex-1 text-sm font-mono"
                                        placeholder="Type a command..."
                                    />
                                </div>
                            </>
                        ) : (
                            <HelpPanel />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
