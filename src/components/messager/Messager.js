import MessagerDialog from './MessagerDialog';
import MessagerContent from './MessagerContent';


export default class Messager {
    constructor(){
        this.ok = window.Locale.t('Messager.ok', 'Ok');
        this.cancel = window.Locale.t('Messager.cancel', 'Cancel');
        this.template = null;
    }

    alert(options){
        if (!options.buttons || !options.buttons.length){
            options.buttons = [{text: this.ok, value: true}];
        }
        this.openDialog(options, 'alert');
    }

    confirm(options){
        if (!options.icon){
			options.icon = 'question';
		}
		if (!options.buttons || !options.buttons.length){
			options.buttons = [
				{text: this.ok, value: true},
				{text: this.cancel, value: false}
			];
		}
        this.openDialog(options, 'confirm');
    }

    prompt(options){
		if (!options.icon){
			options.icon = 'question';
		}
		if (!options.buttons || !options.buttons.length){
			options.buttons = [
				{text: this.ok, value: true},
				{text: this.cancel, value: false}
			];
		}
        this.openDialog(options, 'prompt');
    }

    openDialog(options, type='alert'){
        options.messagerType = type;
        if (options.template || this.template){
            options.component = {
                template: options.template||this.template,
                extends: MessagerContent
            };
        }
        const MessageDialogConstructor = window.Vue.extend(MessagerDialog);
        let dialog = new MessageDialogConstructor({
            propsData: options
        });
        dialog.$mount();
        document.body.appendChild(dialog.$el);
        dialog.open();
        dialog.$on('close', () => {
            dialog.$nextTick(() => {
                document.body.removeChild(dialog.$el);
                dialog.$destroy();
                if (options.result){
                    options.result(dialog.resultValue);
                }
            });
        });
    }
}