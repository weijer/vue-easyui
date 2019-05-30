import DraggableClass from '../draggable/DraggableClass';
import DroppableClass from './DroppableClass';

export default {
    name: 'Droppable',
    bind(el, binding){
        el._dropInstance = new DroppableClass(el, binding.value);
        DraggableClass.droppables.push(el._dropInstance);
    },
    unbind(el){
        let index = DraggableClass.droppables.indexOf(el._dropInstance);
		if (index >= 0){
			DraggableClass.droppables.splice(index, 1);
        }
        el._dropInstance = null;
    }
}