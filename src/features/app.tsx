import {Expression} from "../components/Expression"
import {useKeyboard} from "../hooks/useKeyboard"
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

    const normalModeKeys = [
        {key: "l", callback: moveSelectionRight},
        {key: "h", callback: moveSelectionLeft},
        {key: "k", callback: moveSelectionUp},
        {key: "j", callback: moveSelectionDown},
        {key: "a", callback: enterInsertMode},
    ]

    const insertModeKeys: never[] = []

    const shortcuts = mode == "normal" ? normalModeKeys : insertModeKeys

    useKeyboard(shortcuts)

    return (
        <div>
            <div className="mb-4 p-2 bg-gray-100 rounded">
                <span className="text-sm font-mono">
                    Mode: {mode == "normal" ? "NORMAL" : "INSERT"}
                    {mode == "insert" && insertionText && (
                        <span className="ml-4 text-green-600">
                            Text: "{insertionText}"
                        </span>
                    )}
                </span>
            </div>
            <Expression expr={prog} />
        </div>
    )
}
