import { readComboBoxItemIcon } from './combo-box-icon';

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
