import treeHelper from '../base/TreeHelper';
import ComboBase from '../base/ComboBase';
import { INPUTBASE_INNER_TEMPLATE } from '../base/InputBase';
import { COMBO_BASE_ARROW_TEMPLATE } from '../base/ComboBase';

export const COMBOTREE_PANEL_TEMPLATE = `
	<div ref="panelRef" v-if="!panelClosed"
			class="panel-body panel-body-noheader combo-panel combo-p f-row"
            :style="[panelStyle,{left:panelLeft+'px',top:panelTop+'px'}]">
        <slot name="tree"></slot>
    </div>
`;

export const COMBOTREE_TEMPLATE = `
    <span class="f-field" :class="baseClasses">
` + INPUTBASE_INNER_TEMPLATE + COMBO_BASE_ARROW_TEMPLATE + COMBOTREE_PANEL_TEMPLATE + `
    </span>
`;

export default {
    name: 'ComboTree',
    template: COMBOTREE_TEMPLATE,
    extends: ComboBase,
    props: {
        data: Array,
        value: [String,Number,Array],
        valueField: {
            type: String,
            default: 'id'
        },
        textField: {
            type: String,
            default: 'text'
        },
        multiple: {
            type: Boolean,
            default: false
        },
        editable: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            innerData: this.data,
            mappingTexts: {},
            displayingText: null,
            inputingText: null,
            updatingText: false,
            selection: null,
            timer: null
        }
    },
    computed: {
        text(){
            if (!this.focused){
                if (this.valueState != null && this.displayingText == null){
                    this.updateText();
                }
                this.textState = (this.textFormatter||this.defaultTextFormatter)(this.displayingText);
            }
            return this.textState;
        },
        tree: {
            cache: false,
            get() {
                if (this.$children){
                    for(let i=0; i<this.$children.length; i++){
                        let c = this.$children[i];
                        if (c.$options.name == 'Tree'){
                            return c;
                        }
                    }
                }
                return null;
            }
        }
    },
    watch: {
        data(){
            this.innerData = this.data;
        }
    },
    created() {
        treeHelper.$vue = this;
    },
    mounted() {
        this.$on('valueChange', () => {
            if (!this.updatingText){
                this.updateText();
            }
        });
        this.$on('blur', this.onBlur);
    },
    methods: {
        setTree(){
            if (this.tree){
                this.tree.checkboxState = this.multiple;
                this.tree.innerData = this.innerData;
                this.tree.$on('selectionChange', (node) => {
                    this.selection = node;
                    if (!this.multiple){
                        this.setValue(node[this.valueField]);
                        this.closePanel();
                    }
                });
                this.tree.$on('checkChange', (nodes) => {
                    if (this.multiple && !this.updatingText){
                        let vv = nodes.map(node => node[this.valueField]);
                        this.setValue(vv);
                    }
                });
                this.$nextTick(() => {
                    this.$refs.panelRef.scrollTop = this.scrollTop;
                });
                treeHelper.cascadeCheck = this.tree.cascadeCheck;
            }
        },
        onInput(event){
            this.textState = event.target.value;
            if (this.focused){
                this.inputingText = this.textState;
                if (this.panelClosed){
                    this.openPanel();
                }
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.doFilter(this.textState);
                }, this.delay);
            }
        },
        onBlur(){
            if (this.inputingText == null){
                return;
            }
            let text = this.inputingText.trim();
            if (!text){
                this.setValue(null);
                return;
            }
            if (this.multiple){
                let vv = [];
                let tt = text.split(this.separator);
                for(let val of this.value){
                    let text = this.mappingTexts[val];
                    if (tt.indexOf(text) != -1){
                        vv.push(val);
                    }
                }
                if (this.value.length != vv.length){
                    this.setValue(vv);
                }
            } else {
                if (this.inputingText != this.displayingText){
                    this.setValue(null);
                }
            }
            this.inputingText = null;
        },
        doFilter(value) {
            if (!this.tree){
                return;
            }
            if (value){
                if (this.multiple){
                    let tt = value.trim().split(this.separator);
                    let val = tt[tt.length-1];
                    this.tree.doFilter(val);
                } else {
                    this.tree.doFilter(value);
                }
            } else {
                this.tree.doFilter('');
            }
        },
        openPanel(){
            ComboBase.methods.openPanel.call(this);
            this.$nextTick(() => {
                this.setTree();
                this.updateText();
                if (this.editable){
                    this.doFilter('');
                }
            });
        },
        updateText() {
            if (!this.tree){
                // return;
            }
            this.updatingText = true;
            if (this.valueState == null) {
                this.mappingTexts = {};
                this.displayingText = null;
                this.selection = null;
                if (this.multiple){
                    treeHelper.uncheckAllNodes(this.innerData, ()=>{});
                }
            } else {
                let mt = {};
                let tt = [];
                if (this.multiple){
                    treeHelper.uncheckAllNodes(this.innerData, ()=>{});
                    for(let val of this.valueState){
                        let node = treeHelper.findNode(this.innerData, this.valueField, val);
                        if (node){
                            treeHelper.checkNode(node, ()=>{});
                        }
                    }
                    let vv = [];
                    treeHelper.forNodes(this.innerData, (node) => {
                        if (node.checkState == 'checked'){
                            vv.push(node[this.valueField]);
                            mt[node[this.valueField]] = node[this.textField];
                            tt.push(node[this.textField]);
                        }
                    })
                    this.valueState.filter(val => vv.indexOf(val) == -1).forEach(val => {
                        vv.push(val);
                        mt[val] = this.mappingTexts[val] || val;
                        tt.push(mt[val]);
                    });
                    this.setValue(vv);
                } else {
                    let node = treeHelper.findNode(this.innerData, this.valueField, this.valueState);
                    if (node){
                        mt[this.valueState] = node[this.textField];
                        if (this.tree){
                            this.tree.selectionState = node;
                        }
                    } else {
                        mt[this.valueState] = this.mappingTexts[this.valueState] || this.valueState;
                    }
                    tt.push(mt[this.valueState]);
                }
                this.mappingTexts = mt;
                this.displayingText = tt.join(this.separator);
            }
            this.updatingText = false;
        }

    }
}