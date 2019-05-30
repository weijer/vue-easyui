import domHelper from '../base/DomHelper';
import TooltipContent from './TooltipContent';

let getOptions = (el, value) => {
    let opts = typeof value == 'object'
            ? Object.assign({}, value)
            : {content: String(value)};
    return Object.assign({
        showEvent: 'mouseenter',
        hideEvent: 'mouseleave',
        target: el
    }, opts);
};

let bindEvents = (el, showEvent='', hideEvent='') => {
    let bind = (key, eventName, handler) => {
        if (el[key]){
            if (el[key] != eventName){
                el[key].split(' ').forEach(event => {
                    domHelper.unbind(el, event, handler);
                });
                el[key] = eventName;
                el[key].split(' ').forEach(event => {
                    domHelper.bind(el, event, handler);
                });
            }
        } else {
            el[key] = eventName;
            el[key].split(' ').forEach(event => {
                domHelper.bind(el, event, handler);
            });
        }
    }
    bind('_showEvent', showEvent, el._activeHandler);
    bind('_hideEvent', hideEvent, el._deactiveHandler);
};

export default {
    name: 'Tooltip',
    bind(el, binding){
        el._activeHandler = function(){
            if (!el._tip){
                let Tip = window.Vue.extend(TooltipContent);
                el._tip = new Tip({
                    propsData: el._opts
                });
                el._tip.$mount();
            } else {
                Object.assign(el._tip, el._opts);
            }
            el._tip.show();
        };
        el._deactiveHandler = function(){
            if (el._tip){
                el._tip.hide();
            }
        }
        el._opts = getOptions(el, binding.value);
        bindEvents(el, el._opts.showEvent, el._opts.hideEvent);
    },
    update(el, binding){
        el._opts = getOptions(el, binding.value);
        if (el._tip){
            Object.assign(el._tip, el._opts)
        }
        bindEvents(el, el._opts.showEvent, el._opts.hideEvent);
    },
    unbind(el){
        if (el._tip){
            el._tip.$destroy();
            el._tip = null;
        }
        bindEvents(el, '', '');
    }
}
