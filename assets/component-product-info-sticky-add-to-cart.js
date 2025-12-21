import Component, { Topic } from 'component';
import { assert } from 'utils';
import { BUTTON_LOADING_ATTR } from 'constants';
import { FOOTER_ID } from 'constants';
const SHOW_ATTR = 'show';
export const TRIGGER_ID_ATTR = 'data-observer-trigger';
export const ADD_BUTTON_ATTR = 'data-add-button';
customElements.define('x-product-info-sticky-add-to-cart', class extends Component {
    constructor() {
        super();
    }
    triggerId;
    observer;
    addButton = null;
    render() {
        this.triggerId = this.getAttribute(TRIGGER_ID_ATTR);
        assert(this.triggerId, 'Provide observer trigger id for sticky add bar');
        this.sub(Topic.CART_UPDATE, () => {
            this.loading(false);
        }, { global: true });
        this.handleButton();
        this.observer = new IntersectionObserver(this.observerCallback.bind(this));
        this.toogleObserver(true);
    }
    toogleObserver(state) {
        [this.triggerId, FOOTER_ID].forEach(id => {
            const el = document.getElementById(id);
            if (!el) {
                console.warn(`Element with id ${id} was not found`);
                return;
            }
            state ? this.observer.observe(el) : this.observer.unobserve(el);
        });
    }
    handleButton() {
        this.addButton = this.querySelector(`[${ADD_BUTTON_ATTR}]`);
        assert(this.addButton, "Sticky add button element is not defined");
        this.on(this.addButton, 'click', () => {
            this.loading(true);
        });
    }
    observerCallback(entries) {
        if (entries.length > 1) {
            return;
        }
        const [entry] = entries;
        if (entry.target.id === this.triggerId) {
            this.active = !entry.isIntersecting && (entry.boundingClientRect.top < 1);
        }
        if (entry.target.id === FOOTER_ID) {
            this.active = !entry.isIntersecting;
        }
    }
    set active(state) {
        this.toggleAttribute(SHOW_ATTR, state);
    }
    loading(state) {
        if (this.addButton) {
            this.addButton.toggleAttribute(BUTTON_LOADING_ATTR, state);
        }
    }
    destroy() {
        this.toogleObserver(false);
    }
});
