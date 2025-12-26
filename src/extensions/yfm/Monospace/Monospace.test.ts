import {builders} from 'prosemirror-test-builder';

import {createMarkupChecker} from '../../../../tests/sameMarkup';
import {ExtensionsManager} from '../../../core';
import {BaseNode, BaseSchemaSpecs} from '../../base/specs';

import {MonospaceSpecs, monospaceMarkName} from './MonospaceSpecs';

const {schema, markupParser: parser, serializer} = new ExtensionsManager({
    extensions: (builder) => builder.use(BaseSchemaSpecs, {}).use(MonospaceSpecs),
}).buildDeps();

const {doc, p} = builders(schema, {
    doc: {nodeType: BaseNode.Doc},
    p: {nodeType: BaseNode.Paragraph},
});

const {same} = createMarkupChecker({parser, serializer});

describe('Monospace extension', () => {
    it('should keep angle brackets inside monospace', () => {
        const text = schema.text("Toplevelocation<P>['id']", [schema.marks[monospaceMarkName].create()]);

        same('##Toplevelocation<P>[\'id\']##', doc(p(text)));
    });
});
