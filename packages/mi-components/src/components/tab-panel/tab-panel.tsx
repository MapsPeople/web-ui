import { Component, h, Method, State } from '@stencil/core';

@Component({
    tag: 'mi-tab-panel',
    styleUrl: './tab-panel.scss',
    shadow: true
})
export class TabPanel {

    @State()
    isActive: boolean = false;

    @Method()
    async active(active?: boolean) {
        if (active !== undefined) {
            this.isActive = !!active;
        }
        return this.isActive;
    }

    render() {
        const classList = {
            'active': this.isActive
        };
        return (
            <div class={classList}>
                <slot />
            </div>
        );
    }

}
