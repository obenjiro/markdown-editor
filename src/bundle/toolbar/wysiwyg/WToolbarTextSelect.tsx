import React from 'react';

import {ToolbarBaseProps} from 'src/bundle/toolbar/types';

import {ActionStorage} from '../../../core';
import {wHeadingListConfig} from '../../config/w-heading-config';
import {ToolbarSelect} from '../ToolbarSelect';

export type WToolbarTextSelectProps = ToolbarBaseProps<ActionStorage> & {};

export const WToolbarTextSelect: React.FC<WToolbarTextSelectProps> = ({
    focus,
    onClick,
    editor,
    className,
}) => {
    const items = React.useMemo(() => wHeadingListConfig.data, []);
    return (
        <ToolbarSelect
            items={items}
            focus={focus}
            editor={editor}
            onClick={onClick}
            className={className}
        />
    );
};
