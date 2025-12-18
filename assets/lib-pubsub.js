export var Topic;
(function (Topic) {
    Topic[Topic["CAROUSEL_PAGINATION_UPDATE"] = 0] = "CAROUSEL_PAGINATION_UPDATE";
    Topic[Topic["CAROUSEL_PAGINATION_SET"] = 1] = "CAROUSEL_PAGINATION_SET";
    Topic[Topic["PRODUCT_OPTION_CHANGE"] = 2] = "PRODUCT_OPTION_CHANGE";
    Topic[Topic["PRODUCT_GALLERY_UPDATE"] = 3] = "PRODUCT_GALLERY_UPDATE";
    Topic[Topic["CART_INDICATOR"] = 4] = "CART_INDICATOR";
    Topic[Topic["COLLECTION_FILTER_PRICE_UPDATE"] = 5] = "COLLECTION_FILTER_PRICE_UPDATE";
    Topic[Topic["COLLECTION_FILTER_PRICE_INIT"] = 6] = "COLLECTION_FILTER_PRICE_INIT";
    Topic[Topic["COLLECTION_CONTENT_RENDERED"] = 7] = "COLLECTION_CONTENT_RENDERED";
    Topic[Topic["PAGINATION_PAGE_CHANGE"] = 8] = "PAGINATION_PAGE_CHANGE";
    Topic[Topic["STAGE_LOAD"] = 9] = "STAGE_LOAD";
    Topic[Topic["CART_ADD"] = 10] = "CART_ADD";
    Topic[Topic["CART_CHANGE"] = 11] = "CART_CHANGE";
    Topic[Topic["CART_UPDATE"] = 12] = "CART_UPDATE";
    Topic[Topic["CART_ERROR"] = 13] = "CART_ERROR";
    Topic[Topic["CART_NOTES"] = 14] = "CART_NOTES";
    Topic[Topic["SHOW_TOAST"] = 15] = "SHOW_TOAST";
    Topic[Topic["NEWSLETTER_POPUP_OPENED"] = 16] = "NEWSLETTER_POPUP_OPENED";
})(Topic || (Topic = {}));
export const GLOBAL_CONTEXT = Symbol.for('GLOBAL_CONTEXT');
function isGlobalContext(context) {
    return context === GLOBAL_CONTEXT;
}
function contextMatch(c1, c2) {
    return (c1 !== undefined) && (c1 === c2);
}
function uidCheck(u1, u2) {
    return u1 === undefined || u1 !== u2;
}
class PubSub {
    topics = new Map();
    publish(topic, data, options) {
        if (!this.topics.has(topic)) {
            return;
        }
        const target = this.topics.get(topic);
        target.forEach((sub) => {
            const [callback, ctx, once, uid] = sub;
            if ((isGlobalContext(ctx)
                || contextMatch(ctx, options?.context)) && uidCheck(uid, options?.uid)) {
                queueMicrotask(() => {
                    callback(data);
                });
                if (once) {
                    target.delete(sub);
                }
            }
        });
    }
    subscribe(topic, callback, options) {
        const sub = [callback, options?.context, options?.once, options?.uid];
        if (!this.topics.has(topic)) {
            this.topics.set(topic, new Set([sub]));
        }
        else {
            this.topics.get(topic).add(sub);
        }
        return () => {
            this.topics.get(topic)?.delete(sub);
        };
    }
}
export default new PubSub();
