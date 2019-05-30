import domHelper from './DomHelper'

export default {
    inserted(el, binding){
        if (binding.value.disabled){
            return;
        }
        if (binding.value.collapsed){
            el.collapsed = true;
            domHelper.addClass(el,'f-hide');
        }
        el.sliding = false;
    },
    update(el,binding){
        if (binding.value.disabled){
            return;
        }
        if (binding.value.collapsed == el.collapsed){
            return;
        }
        if (binding.value.animate){
            if (el.sliding){
                return;
            }
            el.sliding = true;
            if (binding.value.collapsed){
                domHelper.slideUp(el, ()=>{
                    el.sliding = false;
                    el.collapsed = true;
                });
            } else {
                domHelper.slideDown(el, ()=>{
                    el.sliding = false;
                    el.collapsed = false;
                });
            }
            setTimeout(() => {
                el.sliding = false;
            },400);
        } else {
            el.collapsed = binding.value.collapsed;
            if (el.collapsed){
                domHelper.addClass(el,'f-hide');
            } else {
                domHelper.removeClass(el,'f-hide');
            }
        }
    }
}