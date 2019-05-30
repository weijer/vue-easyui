export default class DroppableClass {
    constructor(el, value=null){
        this.updateOptions(value);
        this.$el = el;
	}
    updateOptions(value){
        let opts = Object.assign({
            scope: null,
            disabled: false,
            dragEnter: () => {},
            dragOver: () => {},
            dragLeave: () => {},
            drop: () => {}
        }, this, value||{});
        Object.assign(this, opts);
    }
	checkDrop(scope=null) {
		if (!scope || !this.scope){
			return true;
		}
		if (typeof this.scope == 'string' && this.scope == scope){
			return true;
		} else if (this.scope instanceof Array){
			for(let i=0; i<this.scope.length; i++){
				if (this.scope[i] == scope){
					return true;
				}
			}
		}
		return false;
	}
}