import {useEffect} from "react"

type ModifierKeys = {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
}

type KeyboardShortcut = {
    key: string
    modifiers?: ModifierKeys
    callback: () => void
}

function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    if (event.key.toLowerCase() != shortcut.key.toLowerCase()) return false
    const {modifiers = {}} = shortcut
    return (
        !!event.ctrlKey == !!modifiers.ctrl &&
        !!event.altKey == !!modifiers.alt &&
        !!event.shiftKey == !!modifiers.shift &&
        !!event.metaKey == !!modifiers.meta
    )
}

export function useKeyboard(shortcuts: KeyboardShortcut[]) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

            for (const shortcut of shortcuts) {
                if (matchesShortcut(event, shortcut)) {
                    event.preventDefault()
                    shortcut.callback()
                    break
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [shortcuts])
}
