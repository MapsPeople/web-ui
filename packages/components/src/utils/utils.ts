export function format(first: string, middle: string, last: string): string {
    return (
        (first || '') +
        (middle ? ` ${middle}` : '') +
        (last ? ` ${last}` : '')
    );
}

export function isNumber(str: string | number): boolean {
    return str !== null && str > '' && !isNaN(Number(str));
}

export function formatNumber(n: string | number): string {
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0 });
}

export function isNullOrUndefined(input: string): boolean {
    return (input === null || input === undefined);
}

/**
 * Check if current browser is Internet Explorer.
 *
 * @export
 * @returns {boolean}
 */
export function isInternetExplorer(): boolean {
    return (navigator.userAgent.match(/Trident/g) || navigator.userAgent.match(/MSIE/g)) ? true : false;
}

/**
 * Check if string is a valid URL.
 * @param {string} urlString
 * @returns {boolean}
 */
export function isUrlValid(urlString): boolean {
    try {
        new URL(urlString);

        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Append query parameters to image URL hosted by MapsIndoors to request with specific size or scale depending on hostname.
 * @param {string} imageURL - URL for image
 * @param {number} iconDisplaySize - The width and height that the icon should be displayed in
 * @returns string
 */
export function appendMapsIndoorsImageQueryParameters(imageURL: string, iconDisplaySize: number): string {
    if (isUrlValid(imageURL) === false) {
        return;
    }

    const url = new URL(imageURL);
    const hostname = url.hostname;

    if (hostname === 'image.mapsindoors.com') {
        // Add query parameters for image size and fitMode.
        const devicePixelRatio = Math.max(2, window.devicePixelRatio || 1); // Forced minimum of 2 to circumvent poor scaling quality delivered from the image API (see MIBAPI-2566)
        const imageRequestWidth = iconDisplaySize * devicePixelRatio;
        const imageRequestHeight = iconDisplaySize * devicePixelRatio;
        url.searchParams.set('width', imageRequestWidth.toString());
        url.searchParams.set('height', imageRequestHeight.toString());
        url.searchParams.set('fitMode', 'cover');
    }

    if (['app.mapsindoors.com', 'v2.mapsindoors.com'].includes(hostname)) {
        // For legacy images, add a scale parameter
        url.searchParams.set('scale', '2');
    }

    return url.toString();
}