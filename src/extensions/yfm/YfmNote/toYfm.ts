import type {SerializerNodeToken} from '../../../core';
import {NoteAttrs, NoteNode} from './const';

export const toYfm: Record<NoteNode, SerializerNodeToken> = {
    [NoteNode.Note]: (state, node) => {
        state.renderContent(node);
        state.write('{% endnote %}');
        state.closeBlock(node);
    },

    [NoteNode.NoteTitle]: (state, node, parent) => {
        state.write(`{% note ${parent.attrs[NoteAttrs.Type]} `);
        if (node.textContent) {
            state.write('"');
            state.renderInline(node);
            state.write('"');
        }
        state.write(' %}\n');
        state.write('\n');
        state.closeBlock();
    },
};
