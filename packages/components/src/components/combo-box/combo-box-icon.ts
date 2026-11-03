/** Class callers put on an optional leading icon inside a combo-box-item. */
export const comboBoxItemIconClass = 'combo-box-item__icon';

export interface ComboBoxItemIcon {
    html: string;
    label: string;
}

/**
 * Reads an optional icon from a combo-box item.
 * Items without the marker stay on the plain text layout.
 *
 * @param {ParentNode | null | undefined} item
 * @returns {ComboBoxItemIcon | null}
 */
export function readComboBoxItemIcon(item: ParentNode | null | undefined): ComboBoxItemIcon | null {
    const icon = item?.querySelector(`.${comboBoxItemIconClass}`);
    if (!icon) {
        return null;
    }

    const html = icon.innerHTML.trim();
    if (!html) {
        return null;
    }

    return {
        html,
        label: icon.getAttribute('title') || icon.getAttribute('aria-label') || ''
    };
}

/**
 * Text outside the optional icon. SVG title and text inside the icon marker
 * must not count, or the item renders without its label.
 *
 * @param {ParentNode | null | undefined} item
 * @returns {string}
 */
export function readComboBoxItemRichText(item: ParentNode | null | undefined): string {
    if (!item || !('innerText' in item)) {
        return '';
    }

    const element = item as HTMLElement;
    const icon = element.querySelector(`.${comboBoxItemIconClass}`);
    if (!icon) {
        return (element.innerText || '').trim();
    }

    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelectorAll(`.${comboBoxItemIconClass}`).forEach((node) => node.remove());
    return (copy.innerText || '').trim();
}
