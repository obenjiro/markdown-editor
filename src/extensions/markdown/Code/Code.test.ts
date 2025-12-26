import {builders} from 'prosemirror-test-builder';

import {parseDOM} from '../../../../tests/parse-dom';
import {createMarkupChecker} from '../../../../tests/sameMarkup';
import {applyCommand} from '../../../../tests/utils';
import {ExtensionsManager} from '../../../core';
import {BaseNode, BaseSchemaSpecs} from '../../base/specs';
import {BoldSpecs, boldMarkName} from '../Bold/BoldSpecs';
import {ItalicSpecs, italicMarkName} from '../Italic/ItalicSpecs';
import {CommonMarkPreset} from '../../../presets/commonmark';
import {EditorState, TextSelection} from 'prosemirror-state';
import {toggleMark} from 'prosemirror-commands';
import {WysiwygEditor} from '../../../core/Editor';
import {Code} from './';
import {Html} from '../Html';
import {ReactRenderStorage, ReactRendererExtension} from '../../behavior/ReactRenderer';

import {CodeSpecs, codeMarkName} from './CodeSpecs';

const {
    schema,
    markupParser: parser,
    serializer,
} = new ExtensionsManager({
    extensions: (builder) =>
        builder.use(BaseSchemaSpecs, {}).use(BoldSpecs).use(CodeSpecs).use(ItalicSpecs),
}).buildDeps();

const {doc, p, b, i, c} = builders<'doc' | 'p', 'b' | 'i' | 'c'>(schema, {
    doc: {nodeType: BaseNode.Doc},
    p: {nodeType: BaseNode.Paragraph},
    b: {nodeType: boldMarkName},
    i: {nodeType: italicMarkName},
    c: {nodeType: codeMarkName},
});

const {same} = createMarkupChecker({parser, serializer});

describe('Code extension', () => {
    it('should parse code', () => same('`hello!`', doc(p(c('hello!')))));

    it('should parse code inside text', () =>
        same('he`llo wor`ld!', doc(p('he', c('llo wor'), 'ld!'))));

    it('should parse and serialize overlapping inline marks', () =>
        same(
            'This is **strong *emphasized text with `code` in* it**',
            doc(p('This is ', b('strong ', i('emphasized text with ', c('code'), ' in'), ' it'))),
        ));

    it('should parse html - code tag', () => {
        parseDOM(schema, '<code>code inline</code>', doc(p(c('code inline'))));
    });

    it('should parse new line in code', () => {
        same('`\\n`', doc(p(c('\\n'))));
    });

    it('should keep angle brackets inside code', () => {
        const expectedDoc = doc(
            p(schema.text("Toplevelocation<P>['id']", [schema.marks[codeMarkName].create()])),
        );

        expect(parser.parse("`Toplevelocation<P>['id']`")).toMatchNode(expectedDoc);
        expect(serializer.serialize(expectedDoc)).toBe("`Toplevelocation<P>['id']`");
    });

    it('should preserve angle brackets when toggling code mark in wysiwyg mode', () => {
        const {schema: wysiwygSchema, serializer: wysiwygSerializer, plugins} =
            new ExtensionsManager({
                extensions: (builder) => builder.use(CommonMarkPreset, {}),
            }).build();

        const paragraph = wysiwygSchema.nodes[BaseNode.Paragraph].createAndFill(null, [
            wysiwygSchema.text("Toplevelocation<P>['id']"),
        ])!;

        const initialState = EditorState.create({
            schema: wysiwygSchema,
            doc: wysiwygSchema.nodes[BaseNode.Doc].createAndFill(null, [paragraph])!,
            plugins,
        });

        const selection = TextSelection.create(
            initialState.doc,
            1,
            1 + initialState.doc.firstChild!.content.size,
        );
        const stateWithSelection = initialState.apply(initialState.tr.setSelection(selection));

        const {res, tr} = applyCommand(
            stateWithSelection,
            toggleMark(wysiwygSchema.marks[codeMarkName]),
        );

        expect(res).toBe(true);

        const nextState = stateWithSelection.apply(tr);

        expect(nextState.doc.textContent).toBe("Toplevelocation<P>['id']");
        expect(wysiwygSerializer.serialize(nextState.doc)).toBe("`Toplevelocation<P>['id']`");
    });

    it('should keep angle brackets when using code action in wysiwyg editor', () => {
        const host = document.createElement('div');
        const editor = new WysiwygEditor({
            domElem: host,
            extensions: (builder) => builder.use(BaseSchemaSpecs, {}).use(Html).use(Code),
            mdPreset: 'zero',
        });

        const {view} = editor;

        view.dispatch(view.state.tr.insertText("Toplevelocation<P>['id']"));

        const selectAll = TextSelection.create(
            view.state.doc,
            1,
            1 + view.state.doc.firstChild!.content.size,
        );

        view.dispatch(view.state.tr.setSelection(selectAll));

        editor.actions.code.run();

        expect(editor.getValue()).toBe("`Toplevelocation<P>['id']`");

        editor.destroy();
    });

    it('should keep angle brackets when wrapping selection with backtick shortcut', () => {
        const host = document.createElement('div');
        const editor = new WysiwygEditor({
            domElem: host,
            extensions: (builder) => builder.use(BaseSchemaSpecs, {}).use(Html).use(Code),
            mdPreset: 'zero',
        });

        const {view} = editor;

        view.dispatch(view.state.tr.insertText("Toplevelocation<P>['id']"));

        const selectAll = TextSelection.create(
            view.state.doc,
            1,
            1 + view.state.doc.firstChild!.content.size,
        );

        view.dispatch(view.state.tr.setSelection(selectAll));

        const event = new KeyboardEvent('keydown', {key: '`'});
        let handled = false;

        view.someProp('handleKeyDown', (f) => {
            handled = f(view, event) || handled;
        });

        expect(handled).toBe(true);
        expect(editor.getValue()).toBe("`Toplevelocation<P>['id']`");

        editor.destroy();
    });

    it('should keep angle brackets with full preset code action', () => {
        const host = document.createElement('div');
        const renderStorage = new ReactRenderStorage('test');

        const editor = new WysiwygEditor({
            domElem: host,
            extensions: (builder) =>
                builder.use(ReactRendererExtension, renderStorage).use(CommonMarkPreset, {}),
            mdPreset: 'commonmark',
        });

        const {view} = editor;

        view.dispatch(view.state.tr.insertText("Toplevelocation<P>['id']"));
        const selectAll = TextSelection.create(
            view.state.doc,
            1,
            1 + view.state.doc.firstChild!.content.size,
        );

        view.dispatch(view.state.tr.setSelection(selectAll));

        editor.actions.code.run();

        expect(editor.getValue()).toBe("`Toplevelocation<P>['id']`");

        editor.destroy();
    });
});
