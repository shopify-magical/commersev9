/**
 * Sweet Layers Bakery Assistant Agent
 * Built with Cloudflare Agents SDK
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Agent, callable } from 'agents';
let BakeryAssistantAgent = (() => {
    let _classSuper = Agent;
    let _instanceExtraInitializers = [];
    let _initializeSession_decorators;
    let _sendMessage_decorators;
    let _searchProducts_decorators;
    let _getChatHistory_decorators;
    let _getCustomerPreferences_decorators;
    let _clearSession_decorators;
    return class BakeryAssistantAgent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _initializeSession_decorators = [callable()];
            _sendMessage_decorators = [callable()];
            _searchProducts_decorators = [callable()];
            _getChatHistory_decorators = [callable()];
            _getCustomerPreferences_decorators = [callable()];
            _clearSession_decorators = [callable()];
            __esDecorate(this, null, _initializeSession_decorators, { kind: "method", name: "initializeSession", static: false, private: false, access: { has: obj => "initializeSession" in obj, get: obj => obj.initializeSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _sendMessage_decorators, { kind: "method", name: "sendMessage", static: false, private: false, access: { has: obj => "sendMessage" in obj, get: obj => obj.sendMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _searchProducts_decorators, { kind: "method", name: "searchProducts", static: false, private: false, access: { has: obj => "searchProducts" in obj, get: obj => obj.searchProducts }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getChatHistory_decorators, { kind: "method", name: "getChatHistory", static: false, private: false, access: { has: obj => "getChatHistory" in obj, get: obj => obj.getChatHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getCustomerPreferences_decorators, { kind: "method", name: "getCustomerPreferences", static: false, private: false, access: { has: obj => "getCustomerPreferences" in obj, get: obj => obj.getCustomerPreferences }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clearSession_decorators, { kind: "method", name: "clearSession", static: false, private: false, access: { has: obj => "clearSession" in obj, get: obj => obj.clearSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        initialState = (__runInitializers(this, _instanceExtraInitializers), {
            chatHistory: [],
            customerPreferences: {
                favoriteCategories: [],
                lastViewedProducts: [],
                orderCount: 0,
            },
            currentSession: {
                sessionId: '',
                startedAt: Date.now(),
                lastActivity: Date.now(),
            },
        });
        // Product catalog
        productCatalog = [
            { id: 'mooncake-traditional', name: 'Traditional Mooncakes', desc: 'Lotus paste, red bean, mung bean with salted egg yolk', price: 'From $8', tags: ['mooncake', 'classic', 'lotus', 'red bean', 'mung bean', 'traditional', 'gift'], img: 'images/mooncake-traditional.webp', category: 'Classic' },
            { id: 'pastry-arrangement', name: 'Pastry Arrangement Box', desc: 'Curated gift boxes with assorted pastries', price: 'From $45', tags: ['gift', 'box', 'arrangement', 'assorted', 'curated', 'present'], img: 'images/pastry-arrangement.webp', category: 'Signature' },
            { id: 'pandan-custard', name: 'Pandan Custard Cake', desc: 'Fragrant pandan sponge layered with silky coconut custard cream', price: 'From $32', tags: ['pandan', 'custard', 'cake', 'coconut', 'layer', 'popular'], img: 'images/pandan-custard.webp', category: 'Popular' },
            { id: 'black-sesame', name: 'Black Sesame Layer Cake', desc: 'Rich roasted sesame cream between delicate sponge layers', price: 'From $35', tags: ['sesame', 'black', 'cake', 'layer', 'roasted', 'specialty'], img: 'images/black-sesame.webp', category: 'Specialty' },
            { id: 'salted-egg', name: 'Salted Egg Lava Pastry', desc: 'Flaky crust with molten salted egg custard center', price: 'From $6', tags: ['salted', 'egg', 'lava', 'pastry', 'flaky', 'custard', 'new'], img: 'images/salted-egg.webp', category: 'New' },
            { id: 'taro-coconut', name: 'Taro Coconut Cake', desc: 'Creamy taro mousse with coconut shreds on a buttery biscuit base', price: 'From $28', tags: ['taro', 'coconut', 'cake', 'mousse', 'seasonal'], img: 'images/taro-coconut.webp', category: 'Seasonal' },
            { id: 'mung-bean', name: 'Mung Bean Pastry', desc: 'Smooth mung bean paste in a golden, flaky traditional pastry shell', price: 'From $5', tags: ['mung', 'bean', 'pastry', 'flaky', 'traditional', 'heritage'], img: 'images/mung-bean.webp', category: 'Heritage' },
            { id: 'red-bean', name: 'Red Bean Delight', desc: 'Sweet red bean paste wrapped in a soft, pillowy mochi-style shell', price: 'From $5', tags: ['red', 'bean', 'mochi', 'sweet', 'classic'], img: 'images/red-bean.webp', category: 'Classic' },
        ];
        async initializeSession(sessionId) {
            this.setState({
                ...this.state,
                currentSession: {
                    sessionId,
                    startedAt: Date.now(),
                    lastActivity: Date.now(),
                },
            });
            return { success: true, sessionId };
        }
        async sendMessage(message) {
            // Add user message to history
            const userMessage = {
                role: 'user',
                content: message,
                timestamp: Date.now(),
            };
            this.setState({
                ...this.state,
                chatHistory: [...this.state.chatHistory, userMessage],
                currentSession: {
                    ...this.state.currentSession,
                    lastActivity: Date.now(),
                },
            });
            // Generate response based on message content
            const response = this.generateResponse(message.toLowerCase());
            // Add assistant response to history
            const assistantMessage = {
                role: 'assistant',
                content: response.text,
                timestamp: Date.now(),
            };
            this.setState({
                ...this.state,
                chatHistory: [...this.state.chatHistory, userMessage, assistantMessage],
            });
            // Update customer preferences based on message
            this.updatePreferences(message);
            return {
                response: response.text,
                products: response.products,
                timestamp: Date.now(),
            };
        }
        async searchProducts(query) {
            const products = this.getRelevantProducts(query);
            return { products };
        }
        async getChatHistory() {
            return this.state.chatHistory;
        }
        async getCustomerPreferences() {
            return this.state.customerPreferences;
        }
        async clearSession() {
            this.setState({
                ...this.state,
                chatHistory: [],
                currentSession: {
                    sessionId: '',
                    startedAt: Date.now(),
                    lastActivity: Date.now(),
                },
            });
            return { success: true };
        }
        generateResponse(message) {
            let response = '';
            let products = [];
            if (message.includes('mooncake') || message.includes('moon')) {
                response = "Our Traditional Mooncakes are hand-pressed with lotus paste and salted egg yolk — a timeless delicacy perfect for gifting. We also have seasonal varieties available. Would you like to see our mooncake collection?";
                products = this.productCatalog.filter(p => p.tags.includes('mooncake'));
            }
            else if (message.includes('pandan')) {
                response = "Our Pandan Custard Cake features fragrant pandan sponge layered with silky coconut custard cream. It's one of our most popular items! The combination of aromatic pandan and rich coconut is absolutely divine.";
                products = this.productCatalog.filter(p => p.tags.includes('pandan'));
            }
            else if (message.includes('gift') || message.includes('box')) {
                response = "Our Pastry Arrangement Boxes are perfect for gifting! We offer curated gift boxes with assorted pastries starting from $45. They make excellent presents for holidays, celebrations, or corporate events.";
                products = this.productCatalog.filter(p => p.tags.includes('gift') || p.tags.includes('box'));
            }
            else if (message.includes('sesame')) {
                response = "Our Black Sesame Layer Cake features rich roasted sesame cream between delicate sponge layers. It's a specialty item that's become quite popular for its unique nutty flavor profile.";
                products = this.productCatalog.filter(p => p.tags.includes('sesame'));
            }
            else if (message.includes('salted egg') || message.includes('lava')) {
                response = "Our Salted Egg Lava Pastry has a flaky crust with molten salted egg custard center — absolutely irresistible! It's one of our newer items that customers are loving.";
                products = this.productCatalog.filter(p => p.tags.includes('salted') || p.tags.includes('lava'));
            }
            else if (message.includes('order') || message.includes('buy')) {
                response = "I'd be happy to help you place an order! You can add items directly from our recommendations, or browse our full menu. Would you like me to suggest some items based on your preferences?";
                products = this.productCatalog.slice(0, 4);
            }
            else if (message.includes('recommend') || message.includes('suggest')) {
                response = "Based on our popular items, I'd recommend our Pandan Custard Cake for a classic choice, or our Pastry Arrangement Box if you're looking for something special. What occasion are you shopping for?";
                products = this.productCatalog.filter(p => p.category === 'Popular' || p.category === 'Signature');
            }
            else if (message.includes('price') || message.includes('cost')) {
                response = "Our prices range from $5 for individual pastries up to $45 for large gift boxes. Traditional Mooncakes start at $8 each, and our layer cakes range from $28-$35. All prices are very competitive for the quality!";
                products = [];
            }
            else if (message.includes('delivery') || message.includes('shipping')) {
                response = "We offer same-day delivery for orders placed before 12pm, and next-day standard delivery. All our pastries are baked fresh and carefully packaged to ensure they arrive in perfect condition!";
                products = [];
            }
            else {
                response = "I'd be happy to help you find the perfect pastries! We have traditional mooncakes, layer cakes, gift boxes, and specialty items. What type of pastry are you interested in, or would you like me to recommend something based on an occasion?";
                products = this.productCatalog.slice(0, 4);
            }
            return { text: response, products };
        }
        getRelevantProducts(query) {
            if (!query || query.trim().length === 0)
                return [];
            const q = query.toLowerCase().trim();
            const words = q.split(/\s+/);
            return this.productCatalog
                .map(product => {
                let score = 0;
                const nameLower = product.name.toLowerCase();
                const descLower = product.desc.toLowerCase();
                const tagsStr = product.tags.join(' ').toLowerCase();
                const catLower = product.category.toLowerCase();
                for (const word of words) {
                    if (nameLower.includes(word))
                        score += 10;
                    if (catLower.includes(word))
                        score += 5;
                    if (tagsStr.includes(word))
                        score += 3;
                    if (descLower.includes(word))
                        score += 1;
                }
                if (nameLower === q)
                    score += 20;
                if (nameLower.startsWith(q))
                    score += 8;
                return { ...product, score };
            })
                .filter(p => p.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 4);
        }
        updatePreferences(message) {
            const categories = this.state.customerPreferences.favoriteCategories;
            const newCategories = [...categories];
            // Detect category interests from message
            if (message.includes('mooncake') && !newCategories.includes('Classic')) {
                newCategories.push('Classic');
            }
            if (message.includes('gift') && !newCategories.includes('Signature')) {
                newCategories.push('Signature');
            }
            if (message.includes('pandan') && !newCategories.includes('Popular')) {
                newCategories.push('Popular');
            }
            this.setState({
                ...this.state,
                customerPreferences: {
                    ...this.state.customerPreferences,
                    favoriteCategories: newCategories,
                },
            });
        }
    };
})();
export { BakeryAssistantAgent };
//# sourceMappingURL=bakery-agent.js.map