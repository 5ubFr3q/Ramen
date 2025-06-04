import {Badge} from "@/components/ui/badge"
import {KeyboardKey, KeyCombination} from "@/components/ui/keyboard-key"
import {ScrollArea} from "@/components/ui/scroll-area"

interface KeyBinding {
    key: string
    description: string
    mode?: "normal" | "insert" | "global"
}

export function HelpPanel() {
    const keyBindings: KeyBinding[] = [
        // Global shortcuts
        {key: "Ctrl+B", description: "Toggle sidebar", mode: "global"},
        {key: "?", description: "Show help panel", mode: "global"},

        // Normal mode shortcuts
        {key: "h", description: "Move selection left", mode: "normal"},
        {key: "j", description: "Move selection down", mode: "normal"},
        {key: "k", description: "Move selection up", mode: "normal"},
        {key: "l", description: "Move selection right", mode: "normal"},
        {key: "a", description: "Enter insert mode", mode: "normal"},
        {key: "d", description: "Delete selected node", mode: "normal"},

        // Insert mode shortcuts
        {key: "Esc", description: "Return to normal mode", mode: "insert"},
    ]

    const globalBindings = keyBindings.filter((kb) => kb.mode === "global")
    const normalBindings = keyBindings.filter((kb) => kb.mode === "normal")
    const insertBindings = keyBindings.filter((kb) => kb.mode === "insert")

    const renderKey = (keyString: string) => {
        // Handle key combinations (e.g., "Ctrl+B")
        if (keyString.includes("+")) {
            const keys = keyString.split("+")
            return <KeyCombination keys={keys} />
        }

        // Handle single keys
        return <KeyboardKey size="sm">{keyString}</KeyboardKey>
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    Help
                    <Badge variant="outline" className="text-xs">
                        Shortcuts
                    </Badge>
                </h3>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-4 pr-2">
                    {/* Global shortcuts */}
                    <div>
                        <h4 className="text-sm font-medium mb-2 text-gray-800">
                            Global
                        </h4>
                        <div className="space-y-1">
                            {globalBindings.map((binding) => (
                                <div
                                    key={binding.key}
                                    className="flex items-center justify-between py-1"
                                >
                                    <span className="text-xs text-gray-600 flex-1 pr-2">
                                        {binding.description}
                                    </span>
                                    {renderKey(binding.key)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Normal mode shortcuts */}
                    <div>
                        <h4 className="text-sm font-medium mb-2 text-gray-800 flex items-center gap-1">
                            Normal
                            <Badge variant="default" className="text-xs px-1 py-0">
                                N
                            </Badge>
                        </h4>
                        <div className="space-y-1">
                            {normalBindings.map((binding) => (
                                <div
                                    key={binding.key}
                                    className="flex items-center justify-between py-1"
                                >
                                    <span className="text-xs text-gray-600 flex-1 pr-2">
                                        {binding.description}
                                    </span>
                                    {renderKey(binding.key)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insert mode shortcuts */}
                    <div>
                        <h4 className="text-sm font-medium mb-2 text-gray-800 flex items-center gap-1">
                            Insert
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                                I
                            </Badge>
                        </h4>
                        <div className="space-y-1">
                            {insertBindings.map((binding) => (
                                <div
                                    key={binding.key}
                                    className="flex items-center justify-between py-1"
                                >
                                    <span className="text-xs text-gray-600 flex-1 pr-2">
                                        {binding.description}
                                    </span>
                                    {renderKey(binding.key)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
