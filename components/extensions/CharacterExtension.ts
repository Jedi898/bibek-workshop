import { Extension } from '@tiptap/core';

interface CharacterExtensionOptions {
  names: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    character: {
      highlightCharacter: (name: string) => ReturnType;
    };
  }
}

export default Extension.create<CharacterExtensionOptions>({
  name: 'character',

  addOptions() {
    return {
      names: [],
    };
  },

  addCommands() {
    return {
      highlightCharacter: (name: string) => ({ commands }) => {
        return commands.setMark('character', { name });
      },
    };
  },

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-character'),
        renderHTML: (attributes: { name?: string | null }) => {
          if (!attributes.name) {
            return {};
          }

          return {
            'data-character': attributes.name,
            class: 'character-highlight',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-character]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['span', HTMLAttributes, 0];
  },
});
