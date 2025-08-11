import {EditorState, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {builders} from 'prosemirror-test-builder';

import {ExtensionsManager} from '../../../core';
import {BaseSchemaSpecs, BaseNode} from '../specs';
import {CodeSpecs, codeMarkName} from '../../markdown/Code/CodeSpecs';
import {BaseInputRules} from './index';

const {
    schema,
    plugins,
} = new ExtensionsManager({
    extensions: (builder) =>
        builder.use(BaseSchemaSpecs, {}).use(CodeSpecs).use(BaseInputRules),
}).build();

const {doc, p, c} = builders<'doc' | 'p', 'c'>(schema, {
    doc: {nodeType: BaseNode.Doc},
    p: {nodeType: BaseNode.Paragraph},
    c: {markType: codeMarkName},
});

describe('BaseInputRules ellipsis', () => {
    it('does not replace triple dots inside inline code', () => {
        const startDoc = doc(p(c('text<a>')));
        const state = EditorState.create({
            schema,
            doc: startDoc,
            selection: TextSelection.create(startDoc, startDoc.tag.a),
            plugins,
        });
        const view = new EditorView(document.createElement('div'), {state});

        const handled = view.someProp('handleTextInput', (f: any) =>
            f(view, startDoc.tag.a, startDoc.tag.a, '...'),
        );

        if (!handled) {
            view.dispatch(view.state.tr.insertText('...', startDoc.tag.a, startDoc.tag.a));
        }

        expect(view.state.doc).toMatchNode(doc(p(c('text...'))));
    });

    it('replaces triple dots in regular text', () => {
        const startDoc = doc(p('text<a>'));
        const state = EditorState.create({
            schema,
            doc: startDoc,
            selection: TextSelection.create(startDoc, startDoc.tag.a),
            plugins,
        });
        const view = new EditorView(document.createElement('div'), {state});

        const handled = view.someProp('handleTextInput', (f: any) =>
            f(view, startDoc.tag.a, startDoc.tag.a, '...'),
        );

        if (!handled) {
            view.dispatch(view.state.tr.insertText('...', startDoc.tag.a, startDoc.tag.a));
        }

        expect(view.state.doc).toMatchNode(doc(p('text…')));
    });
});
