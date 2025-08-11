import {InputRule} from 'prosemirror-inputrules';

import type {ExtensionAuto} from '../../../core';
import {hasCodeMark} from '../../../utils/inputrules';

const ellipsisInputRule = new InputRule(/\.\.\.$/, (state, match, start, end) => {
    if (hasCodeMark(state, match, start, end)) return null;
    return state.tr.insertText('…', start, end);
});

export const BaseInputRules: ExtensionAuto = (builder) => {
    builder.addInputRules(() => ({rules: [ellipsisInputRule]}));
};
