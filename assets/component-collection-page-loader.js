import Component, { Topic } from 'component';
import { BUTTON_LOADING_ATTR } from 'constants';
const OBSERVER_BOTTOM_OFFSET = '25%';
export const TRIGGER_TYPE_ATTR = 'trigger-type';
export const CURR_PAGE_ATTR = 'current-page';
export const TOTAL_PAGES_ATTR = 'total-pages';
export const BUTTON_ATTR = 'load-more-button';
customElements.define('x-collection-page-loader', class extends Component {
    constructor() {
        super();
    }
    currentPage = 1;
    totalPages = 1;
    observer = null;
    loadButton = null;
    render() {
        const paginationType = this.getAttribute(TRIGGER_TYPE_ATTR);
        if (!paginationType || paginationType === 'pages') {
            console.error('Provide a correct paginationType');
            this.remove();
        }
        this.setState();
        if (this.isLastPage) {
            this.remove();
            return;
        }
        if (paginationType === 'infiniteScroll') {
            this.handleScroll();
        }
        if (paginationType === 'button') {
            this.handleButton();
        }
        this.sub(Topic.COLLECTION_CONTENT_RENDERED, () => {
            this.loading = false;
            if (this.isLastPage) {
                this.remove();
            }
        });
    }
    setState() {
        const currPage = this.getAttribute(CURR_PAGE_ATTR);
        if (currPage) {
            this.currentPage = +currPage;
        }
        const totalPages = this.getAttribute(TOTAL_PAGES_ATTR);
        if (totalPages) {
            this.totalPages = +totalPages;
        }
    }
    handleScroll() {
        this.observer = new IntersectionObserver(([entry]) => {
            entry.isIntersecting && this.setNextPage();
        }, {
            rootMargin: `0px 0px ${OBSERVER_BOTTOM_OFFSET} 0px`
        });
        this.observer.observe(this);
    }
    handleButton() {
        this.loadButton = this.querySelector(`[${BUTTON_ATTR}]`);
        if (!this.loadButton) {
            console.error('Load pagination button not found');
            return;
        }
        this.on(this, 'click', this.setNextPage);
    }
    async setNextPage() {
        this.loading = true;
        this.currentPage += 1;
        this.pub(Topic.PAGINATION_PAGE_CHANGE, this.currentPage);
    }
    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }
    set loading(state) {
        this.loadButton?.toggleAttribute(BUTTON_LOADING_ATTR, state);
        this.classList.toggle('collection-page-loader--loading', state);
    }
    destroy() {
        this.observer?.unobserve(this);
    }
});
