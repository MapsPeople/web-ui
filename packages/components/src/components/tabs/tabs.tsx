import { Component, JSX, Host, h, Prop, Element, State } from '@stencil/core';

@Component({
    tag: 'mi-tabs',
    styleUrl: 'tabs.scss',
    shadow: true
})
export class Tabs {
    @Element() el: HTMLDivElement;

    @Prop() active: number = 0;

    /**
     * Sets a border surrounding the content view.
     */
    @Prop() bordered = false;

    @State() tabs: Array<any>;

    connectedCallback(): void {
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(this.componentWillRender.bind(this));

        // Start observing the target node for configured mutations
        observer.observe(this.el, { childList: true });
    }

    componentWillRender() {
        const tabs = this.el.querySelectorAll('mi-tab');

        this.tabs = Array.from(tabs).reduce((tabs, tab, index) => {
            const content = Array.from(this.el.getElementsByTagName('mi-tab-panel')).find(el => el.id === tab.tabFor);

            if (content) {
                tabs.push({ label: tab.label, content: content });
            }

            return tabs;
        }, []);
    }

    componentDidRender(): void {
        this.selectTab(this.active);
    }

    async selectTab(index): Promise<void> {
        const isTabActive = await this.tabs[index].content.active();

        if (!isTabActive) {
            this.active = index;
            this.tabs.forEach((tab, tabIndex) => tab.content.active(tabIndex === index));
        }
    }

    render(): JSX.Element {
        return (
            <Host>
                <nav class={`nav ${this.bordered === true ? 'nav--borderless-bottom' : ''}`}>
                    <ul>
                        {this.tabs.map((tab, index) => {
                            return (
                                <li class={this.active === index ? 'active' : ''} onClick={() => { this.selectTab(index); }}> {tab.label} </li>
                            );
                        })}
                    </ul>
                </nav>

                <section class={`content ${this.bordered === true ? 'content--bordered' : ''}`}>
                    <slot />
                </section>
            </Host>
        );
    }

}
