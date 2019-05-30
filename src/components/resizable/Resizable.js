import ResizableClass from './ResizableClass';

export default {
    name: 'Resizable',
    bind(el, binding){
        el._resizeInstance = new ResizableClass(el, binding.value);
        el._resizeInstance.bindEvents();
    },
    update(el, binding){
        el._resizeInstance.updateOptions(binding.value);
    },
    unbind(el){
        el._resizeInstance.unbindEvents();
    }
}