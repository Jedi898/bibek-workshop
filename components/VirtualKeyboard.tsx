'use client'

import React, { useState } from 'react'
import { nepaliMap } from '../lib/nepaliTransliteration'
import { useLanguage } from './LanguageContext'

const VirtualKeyboard = () => {
  const { showVirtualKeyboard, setShowVirtualKeyboard } = useLanguage()
  const [isShift, setIsShift] = useState(false)

  if (!showVirtualKeyboard) return null

  const rows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
  ]

  const handleKeyPress = (key: string) => {
    const char = isShift ? key.toUpperCase() : key
    const nepaliChar = nepaliMap[char] || char
    
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart || 0
      const end = activeElement.selectionEnd || 0
      const value = activeElement.value
      const newValue = value.substring(0, start) + nepaliChar + value.substring(end)
      
      // React controlled component hack to trigger state updates
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

      if (activeElement.tagName === 'INPUT' && nativeInputValueSetter) {
          nativeInputValueSetter.call(activeElement, newValue);
      } else if (activeElement.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
          nativeTextAreaValueSetter.call(activeElement, newValue);
      } else {
          activeElement.value = newValue;
      }

      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      
      activeElement.focus()
      activeElement.setSelectionRange(start + nepaliChar.length, start + nepaliChar.length)
    }
  }

  const handleBackspace = () => {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart || 0
      const end = activeElement.selectionEnd || 0
      const value = activeElement.value
      
      let newValue = value
      let newCursorPos = start

      if (start === end) {
        if (start > 0) {
          newValue = value.substring(0, start - 1) + value.substring(end)
          newCursorPos = start - 1
        }
      } else {
        newValue = value.substring(0, start) + value.substring(end)
        newCursorPos = start
      }

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

      if (activeElement.tagName === 'INPUT' && nativeInputValueSetter) {
          nativeInputValueSetter.call(activeElement, newValue);
      } else if (activeElement.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
          nativeTextAreaValueSetter.call(activeElement, newValue);
      } else {
          activeElement.value = newValue;
      }

      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      activeElement.focus()
      activeElement.setSelectionRange(newCursorPos, newCursorPos)
    }
  }

  return (
    <div 
      onMouseDown={(e) => e.preventDefault()}
      className="fixed bottom-0 left-0 right-0 bg-gray-900 p-4 border-t border-gray-700 z-50 shadow-lg select-none"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">Nepali Virtual Keyboard</span>
          <button onClick={() => setShowVirtualKeyboard(false)} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {row.map((key) => {
                const char = isShift ? key.toUpperCase() : key
                const nepaliChar = nepaliMap[char] || char
                return (
                  <button
                    key={key}
                    onMouseDown={(e) => { e.preventDefault(); handleKeyPress(key); }}
                    className="w-8 h-10 md:w-10 md:h-12 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium flex flex-col items-center justify-center shadow active:bg-gray-800"
                  >
                    <span className="text-lg leading-none">{nepaliChar}</span>
                    <span className="text-[10px] text-gray-400 leading-none">{char}</span>
                  </button>
                )
              })}
            </div>
          ))}
          <div className="flex justify-center gap-2 mt-1">
            <button
              onMouseDown={(e) => { e.preventDefault(); setIsShift(!isShift); }}
              className={`px-6 py-2 rounded font-medium shadow ${isShift ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Shift
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); handleKeyPress(' '); }}
              className="w-64 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium shadow"
            >
              Space
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); handleBackspace(); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium shadow"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VirtualKeyboard