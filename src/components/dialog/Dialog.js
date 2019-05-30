import domHelper from '../base/DomHelper';
import { PANEL_INNER_TEMPLATE } from '../panel/Panel';
import Panel from '../panel/Panel';
import Draggable from '../draggable/Draggable';
import Resizable from '../resizable/Resizable';

window.DialogZIndex = window.DialogZIndex || 9000;

export const DIALOG_TEMPLATE = 
'<div class="dialog-inline">' +
    '<div ref="panelRef" v-if="!closedState" v-Draggable="dragOpts" v-Resizable="resizeOpts" :class="panelClasses" :style="panelStyles">' +
    PANEL_INNER_TEMPLATE +
    '</div>' +
'</div>'
;

export default {
    name: 'Dialog',
    template: DIALOG_TEMPLATE,
    extends: Panel,
    directives: {
        Draggable,
        Resizable
    },
    props: {
        title: String,
        border: {
            type: Boolean,
            default: false
        },
        borderType: {
            type: String,
            default: 'thick'    // thin,thick,none
        },
        closable: {
            type: Boolean,
            default: true
        },
        dialogCls: String,
        dialogStyle: Object,
        modal: {
            type: Boolean,
            default: false
        },
        draggable: {
            type: Boolean,
            default: false
        },
        resizable: {
            type: Boolean,
            default: false
        },
        draggableOptions: Object,
        resizableOptions: Object
    },
    data() {
        return {
            dragOpts: null,
            resizeOpts: null,
            maskEl: null,
            left: null,
            top: null,
            width: null,
            height: null
        }
    },
    computed: {
        panelStyles(){
            return [this.panelStyle, this.dialogStyle, {
                left: this.left?this.left+'px':(this.dialogStyle?this.dialogStyle.left:null),
                top: this.left?this.top+'px':(this.dialogStyle?this.dialogStyle.top:null),
                width: this.width?this.width+'px':(this.dialogStyle?this.dialogStyle.width:null),
                height: this.height?this.height+'px':(this.dialogStyle?this.dialogStyle.height:null)
            }];
        },
        panelClasses(){
            let cls = 'window window-shadow';
            if (this.borderType == 'none'){
                cls += ' window-thinborder window-noborder';
            } else if (this.borderType == 'thin'){
                cls += ' window-thinborder';
            }        
            return ['panel f-column', cls, this.panelCls, this.dialogCls];
        },
        headerClasses(){
            return Panel.computed.headerClasses.call(this).concat('window-header');
        },
        bodyClasses(){
            let cls = 'window-body';
            if (!this.hasHeader){
                cls += ' window-body-noheader';
            }
            return Panel.computed.bodyClasses.call(this).concat(cls);
        },
        footerClasses(){
            return Panel.computed.footerClasses.call(this).concat('window-footer');
        }
    },
    watch: {
        draggable(){
            this.setDragOpts();
        },
        resizable(){
            this.setResizeOpts();
        },
        draggableOptions(){
            this.setDragOpts();
        },
        resizableOptions(){
            this.setResizeOpts();
        },
        closedState(){
            this.$nextTick(() => {
                this.initDialog();
                this.setDragOpts();
                this.setResizeOpts();
            });
            if (this.closedState){
                this.$emit('close');
            } else {
                this.$emit('open');
            }
        }
    },
    mounted() {
        this.setDragOpts();
        this.setResizeOpts();
        this.initDialog();
    },
    methods: {
        setDragOpts(){
            this.dragOpts = Object.assign({
                edge: 5,
                disabled: !this.draggable,
                handle: this.$refs.headerRef
            }, this.draggableOptions, {
                dragEnd: (state) => {
                    this.left = state.left;
                    this.top = state.top;
                    if (this.draggableOptions && this.draggableOptions.dragEnd){
                        this.draggableOptions.dragEnd(state);
                    }
                }
            });
        },
        setResizeOpts(){
            this.resizeOpts = Object.assign({
                edge: 5,
                disabled: !this.resizable
            }, this.resizableOptions, {
                resizeStop: (state) => {
                    this.width = state.width;
                    this.height = state.height;
                    if (this.resizableOptions && this.resizableOptions.resizeStop){
                        this.resizableOptions.resizeStop(state);
                    }
                }
            });
        },
        initDialog() {
            if (!this.closedState){
                if (this.$refs.panelRef){
                    document.body.appendChild(this.$refs.panelRef);
                    this.openMask();
                    this.displaying();
                }
            } else {
                this.closeMask();
            }
        },
        openMask() {
            if (this.modal && !this.maskEl){
                this.maskEl = document.createElement('div');
                domHelper.addClass(this.maskEl, 'window-mask');
                document.body.appendChild(this.maskEl);
            }
        },
        closeMask() {
            if (this.maskEl){
                document.body.removeChild(this.maskEl);
                this.maskEl = null;
            }
        },
        open() {
            this.closedState = false;
        },
        close() {
            this.closedState = true;
        },
        displaying() {
            this.moveToTop();
            this.left = parseInt(this.$refs.panelRef.style.left)||null;
            this.top = parseInt(this.$refs.panelRef.style.top)||null;
            if (this.left == null){
                this.hcenter();
            }
            if (this.top == null){
                this.vcenter();
            }
        },
        moveToTop() {
            if (this.maskEl){
                this.maskEl.style.zIndex = String(window.DialogZIndex++);
            }
            if (this.$refs.panelRef){
                this.$refs.panelRef.style.zIndex = String(window.DialogZIndex++);
            }
        },
        hcenter() {
            if (this.$refs.panelRef){
                let view = domHelper.getViewport();
                let width = domHelper.outerWidth(this.$refs.panelRef);
                this.left = (view.width - width) / 2;
            }
        },
        vcenter() {
            if (this.$refs.panelRef){
                let view = domHelper.getViewport();
                let height = domHelper.outerHeight(this.$refs.panelRef);
                let scrollTop = domHelper.getScrollTop();
                this.top = (view.height - height) / 2 + scrollTop;
            }
        },
        center() {
            this.hcenter();
            this.vcenter();
        }
    }
}