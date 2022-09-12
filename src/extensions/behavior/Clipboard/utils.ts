/** Сontains all data formats known to us */
export enum DataTransferType {
    Text = 'text/plain',
    Html = 'text/html',
    UriList = 'text/uri-list',
    Files = 'Files',
}

export function isIosSafariShare({types}: DataTransfer): boolean {
    // if link is copied from ios safari share button,
    // then data transfer only have text/uri-list data type
    return (
        types.includes(DataTransferType.UriList) &&
        !types.includes(DataTransferType.Text) &&
        !types.includes(DataTransferType.Html)
    );
}

export function isFilesOnly({types}: DataTransfer): boolean {
    return types.length === 1 && types[0] === DataTransferType.Files;
}

export function isFilesFromHtml({types}: DataTransfer): boolean {
    return (
        types.length === 2 &&
        types.includes(DataTransferType.Files) &&
        types.includes(DataTransferType.Html)
    );
}

export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}
