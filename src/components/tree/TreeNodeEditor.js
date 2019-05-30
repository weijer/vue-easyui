import domHelper from '../base/DomHelper';
import Form from '../form/Form';
import Tooltip from '../tooltip/Tooltip';

export default {
    name: 'TreeNodeEditor',
    components: {
        Form
    },
    directives: {
        Tooltip
    },
    props: {
        tree: Object,
        node: Object
    },
    data(){
        return {
            width: 50,
            error: null
        }
    },
    mounted(){
        this.autoSizeInput();
        const input = this.getInput();
        domHelper.bind(input, 'keydown', this.onKeyDown);
        this.$refs.form.validate();
        this.$nextTick(() => input.focus());
    },
    beforeDestroy(){
        domHelper.unbind(this.getInput(), 'keydown', this.onKeyDown);
    },
    methods: {
        onKeyDown(event){
            if (event.keyCode == 13){   // enter
                this.tree.endEdit();
            } else if (event.keyCode == 27){    // esc
                this.tree.cancelEdit();
            }
            setTimeout(() => this.autoSizeInput())
        },
        getInput(){
            return this.$el.querySelector('.textbox-text');
        },
        autoSizeInput() {
            const input = this.getInput();
            if (!input){
                return;
            }
            let style = getComputedStyle(input);
            let tmp = document.createElement('span');
            Object.assign(tmp.style, {
                position: 'absolute',
                top: -9999,
                left: -9999,
                width: 'auto',
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                whiteSpace: 'nowrap'
            });
            tmp.innerHTML = input.value;
            document.body.appendChild(tmp);
    
            let getWidth = (val) => {
                val = val || '';
                var s = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                tmp.innerHTML = s;
                return domHelper.outerWidth(tmp);
            };
            let width = getWidth(input.value);
            document.body.removeChild(tmp);
            this.width = width + 50;
        }
    },
    render(h){
        let editor = null;
        if (this.tree.$scopedSlots.editor){
            editor = this.tree.$scopedSlots.editor(this.node);
            editor[0].data.class = 'f-full';
            // editor[0].data.style = {verticalAlign:'top',height:'auto'};
        } else {
            editor = h('TextBox', {
                'class': 'f-full',
                'props': {
                    'value': this.node.text,
                    'name': 'text'
                },
                'on': {
                    'valueChange': (e) => {
                        this.node.text = e.currentValue;
                        this.$refs.form.validate();
                    }
                }
            })
        }
        return h('Form', {
            'ref': 'form',
            'class': 'tree-title tree-editing f-inline-row',
            'style': {width: this.width+'px'},
            props: {
                model: this.node,
                rules: {'text':this.tree.editRules}
            },
            on: {
                validate: (errors) => {
                    if (errors && errors['text'].length){
                        this.tree.editingItem.invalid = true;
                        this.error = errors['text'][0];
                    } else {
                        this.tree.editingItem.invalid = false;
                        this.error = null;
                    }
                }
            },
            nativeOn: {
                submit: (e) => {
                    e.preventDefault();
                }
            },
            directives: [{
                name: 'Tooltip',
                value: Object.assign({
                    closed: !this.error,
                    content: this.error
                }, this.tree.tipOptions)
            }]
        }, [
            editor
        ])
    }
}