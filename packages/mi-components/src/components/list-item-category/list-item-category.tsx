import midtIcon from '@mapsindoors/midt/tokens/icon.json';
import { Component, Event, EventEmitter, h, Host, Prop } from '@stencil/core';
import { appendMapsIndoorsImageQueryParameters } from '../../utils/utils';

@Component({
    tag: 'mi-list-item-category',
    styleUrl: 'list-item-category.scss',
    shadow: true
})
export class ListItemCategory {
    /**
     * @description Array of Categories.
     * @type {Array<Category>}
     */
    @Prop() category;

    /**
     * @description List orientation. Accepts the following values: 'vertical' and 'horizontal'.
     * @type {string}
     */
    @Prop({ reflect: true }) orientation = 'vertical';

    /**
     * @description Emits the clicked category.
     * @type {EventEmitter<Category>}
     */
    @Event() categoryClicked: EventEmitter;

    /**
     * @description Emits a component render event.
     * @type {EventEmitter}
     */
    @Event() listItemDidRender: EventEmitter;

    private image: HTMLImageElement;

    componentDidRender(): void {
        this.listItemDidRender.emit();

        // IE fallback for 'object-fit' css property
        if ('objectFit' in document.documentElement.style === false) {
            this.objectFitImage(this.image);
        }
    }

    /**
     * @description Emits the category object to event listeners.
     * @private
     * @param {*} category - Category object.
     * @memberof ListItemCategory
     */
    private categoryClickedHandler(category): void {
        this.categoryClicked.emit(category);
    }

    /**
     * @description Set image as background image.
     * @private
     * @param {HTMLImageElement} image
     */
    private objectFitImage(image: HTMLImageElement): void {
        image.setAttribute('style', `background: no-repeat center center url("${this.category.iconUrl}"); background-size: cover;`);
        image.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${image.width}' height='${image.height}'%3E%3C/svg%3E`;
    }

    render(): any {
        const iconDisplaySize = this.orientation.toUpperCase() === 'VERTICAL' ? parseInt(midtIcon.icon.size.medium.value) : parseInt(midtIcon.icon.size['xx-large'].value);
        const iconURL = appendMapsIndoorsImageQueryParameters(this.category.iconUrl, iconDisplaySize);

        return (
            <Host onClick={() => this.categoryClickedHandler(this.category)}>
                <img ref={(el) => this.image = el as HTMLImageElement} src={iconURL} />
                <p>{this.category.name}</p>
            </Host>
        );
    }
}
