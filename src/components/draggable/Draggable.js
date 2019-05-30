import DraggableClass from './DraggableClass';

export default {
    name: 'Draggable',
    bind(el, binding){
        el._dragInstance = new DraggableClass(el, binding.value);
        el._dragInstance.bindEvents();
    },
    update(el, binding){
        el._dragInstance.updateOptions(binding.value);
    },
    unbind(el){
        el._dragInstance.unbindEvents();
    }
}