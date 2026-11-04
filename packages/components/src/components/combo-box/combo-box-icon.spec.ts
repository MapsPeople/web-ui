import { readComboBoxItemIcon, readComboBoxItemRichText } from './combo-box-icon';

describe('readComboBoxItemIcon', () => {
    it('returns nothing when the item has no icon', () => {
        const item = document.createElement('combo-box-item');
        expect(readComboBoxItemIcon(item)).toBeNull();
        expect(readComboBoxItemIcon(null)).toBeNull();
    });

    it('reads the icon markup and its tooltip', () => {
        const item = document.createElement('combo-box-item');
        item.innerHTML = '<span class="combo-box-item__icon" title="Development"><svg><path></path></svg></span>';

        expect(readComboBoxItemIcon(item)).toEqual({
            html: '<svg><path></path></svg>',
            label: 'Development'
        });
    });

    it('ignores an empty icon marker', () => {
        const item = document.createElement('combo-box-item');
        item.innerHTML = '<span class="combo-box-item__icon" title="Development"></span>';
        expect(readComboBoxItemIcon(item)).toBeNull();
    });
});

describe('readComboBoxItemRichText', () => {
    it('reads text when the item has no icon', () => {
        const item = document.createElement('combo-box-item');
        item.innerHTML = '<em>Plane</em>';
        expect(readComboBoxItemRichText(item)).toBe('Plane');
        expect(readComboBoxItemRichText(null)).toBe('');
    });

    it('ignores svg title and text inside the icon', () => {
        const item = document.createElement('combo-box-item');
        item.innerHTML = '<span class="combo-box-item__icon"><svg><title>Development</title><text>Dev</text></svg></span>';
        expect(readComboBoxItemRichText(item)).toBe('');
    });

    it('keeps label text outside the icon', () => {
        const item = document.createElement('combo-box-item');
        item.innerHTML = '<span class="combo-box-item__icon"><svg><title>Icon</title></svg></span><strong>Development</strong>';
        expect(readComboBoxItemRichText(item)).toBe('Development');
    });
});
