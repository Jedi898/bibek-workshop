import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const screenplayTypes = ['scene-heading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];

export const ScreenplayExtension = Extension.create({
  name: 'screenplay',

  addAttributes() {
    return {
      type: {
        default: 'action',
        parseHTML: element => element.getAttribute('data-type') || 'action',
        renderHTML: attributes => ({
          'data-type': attributes.type,
        }),
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const { type } = editor.getAttributes('paragraph');
        const currentIndex = screenplayTypes.indexOf(type);
        const nextIndex = (currentIndex + 1) % screenplayTypes.length;
        const nextType = screenplayTypes[nextIndex];

        editor.chain().focus().updateAttributes('paragraph', { type: nextType }).run();
        return true;
      },
      Enter: ({ editor }) => {
        const { type } = editor.getAttributes('paragraph');
        const currentIndex = screenplayTypes.indexOf(type);
        const nextIndex = (currentIndex + 1) % screenplayTypes.length;
        const nextType = screenplayTypes[nextIndex];

        editor.chain().focus().insertContent(`<p data-type="${nextType}"></p>`).run();
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('screenplay-auto-uppercase'),
        appendTransaction: (transactions, oldState, newState) => {
          let tr = newState.tr;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'paragraph' && node.textContent) {
              const type = node.attrs.type;
              if (['scene-heading', 'character', 'transition'].includes(type)) {
                const upperText = node.textContent.toUpperCase();
                if (node.textContent !== upperText) {
                  tr = tr.replaceWith(
                    pos + 1,
                    pos + 1 + node.textContent.length,
                    newState.schema.text(upperText)
                  );
                  modified = true;
                }
              }
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});
