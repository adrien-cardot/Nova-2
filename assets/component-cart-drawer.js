import Component, { Topic } from 'component';
import { replaceContent, assert, uuid, toNum } from 'utils';
import { CART_DRAWER_CONTENT_ID, ReqSection, ENTER_KEY_IDENTIFIER } from 'constants';
export const LINE_ITEM_DATA_ATTR = 'data-line-item';
export const NOTES_TEXT_DATA_ATTR = 'data-cart-notes-text';
export const MODAL_ID_ATTR = 'modal-id';
export const NOTES_TRIGGER_DATA_ATTR = 'data-notes-trigger';
export const NOTES_OPENER_DATA_ATTR = 'data-notes-opener';
customElements.define('x-cart-drawer', class extends Component {
    constructor() {
        super();
        this.$element.content = this.querySelector('[data-cart-drawer-element="content"]');
    }
    modal;
    TUID = null;
    notesText = null;
    triggerInteractionsHandler = this.handleTriggerInteractions.bind(this);
    triggers;
    render() {
        this.modal = document.getElementById(this.getAttribute(MODAL_ID_ATTR));
        assert(this.modal, `Cart drawer is missing dialog element`);
        this.on(this, 'change', this.handleCartChange);
        this.notesText = this.querySelector(`[${NOTES_TEXT_DATA_ATTR}]`);
        if (this.notesText) {
            this.updateCartNotesFlow();
        }
        this.sub(Topic.CART_UPDATE, ({ data, error, TUID }) => {
            if (this.TUID && this.TUID === TUID) {
                this.loading(false);
            }
            if (error) {
            }
            if (data) {
                const { sections, openDrawer } = data;
                const targetDoc = sections[ReqSection.CART_DRAWER];
                if (targetDoc && this.updateContent(targetDoc)) {
                    if (openDrawer) {
                        this.modal.open();
                    }
                    if (this.notesText) {
                        this.updateCartNotesFlow();
                    }
                }
            }
        }, { global: true });
        this.sub(Topic.NEWSLETTER_POPUP_OPENED, () => this.modal.refreshLayer(), { global: true, once: true });
    }
    loading(state) {
        this.classList.toggle('cart-drawer--loading', state);
    }
    async handleCartChange(e) {
        const target = e.target;
        if (!target) {
            return;
        }
        if (target.hasAttribute(NOTES_TEXT_DATA_ATTR)) {
            this.pub(Topic.CART_NOTES, target.value);
            return;
        }
        const lineItem = target.getAttribute(LINE_ITEM_DATA_ATTR);
        if (!lineItem) {
            return;
        }
        const value = toNum(target.value);
        if (value === null) {
            console.error('Invalid value');
            return;
        }
        this.TUID = uuid();
        this.pub(Topic.CART_CHANGE, {
            TUID: this.TUID,
            id: lineItem,
            qty: value
        });
        this.loading(true);
    }
    updateContent(updatedDoc) {
        const updatedContent = updatedDoc.getElementById(CART_DRAWER_CONTENT_ID);
        if (!updatedContent) {
            console.error('No cart drawer container within response section');
            return false;
        }
        replaceContent(this.$element.content, updatedContent, true);
        return true;
    }
    handleTriggerInteractions(e) {
        if ((e instanceof KeyboardEvent && e.key === ENTER_KEY_IDENTIFIER) || e instanceof MouseEvent) {
            const target = e.currentTarget;
            e.preventDefault();
            e.stopPropagation();
            this.classList.toggle('cart-drawer--notes-open');
            if (target.hasAttribute(NOTES_OPENER_DATA_ATTR)) {
                this.notesText?.focus();
            }
        }
    }
    updateCartNotesFlow() {
        this.triggers = this.querySelectorAll(`[${NOTES_TRIGGER_DATA_ATTR}]`);
        this.triggers?.forEach(el => {
            if (el) {
                el.addEventListener('keypress', this.triggerInteractionsHandler);
                el.addEventListener('click', this.triggerInteractionsHandler);
            }
        });
    }
});
