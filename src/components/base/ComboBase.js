import domHelper from '../base/DomHelper';
import { INPUTBASE_INNER_TEMPLATE } from './InputBase';
import InputBase from './InputBase';

export const COMBO_BASE_ARROW_TEMPLATE = `
    <span ref="arrowRef" v-if="hasDownArrow" :class="arrowClasses" @click="togglePanel()">
        <span class="textbox-icon f-full" :class="arrowIconCls"></span>
    </span>
`;
export const COMBO_BASE_PANEL_TEMPLATE = `
	<div ref="panelRef" v-if="!panelClosed"
			class="panel-body panel-body-noheader combo-panel"
            :style="[panelStyle,{left:panelLeft+'px',top:panelTop+'px'}]">
	</div>
`;
export const COMBO_BASE_TEMPLATE = `
    <span class="f-field" :class="baseClasses">
` + INPUTBASE_INNER_TEMPLATE + COMBO_BASE_ARROW_TEMPLATE + COMBO_BASE_PANEL_TEMPLATE + `
    </span>
`;

export default {
    name: 'ComboBase',
    template: COMBO_BASE_TEMPLATE,
    extends: InputBase,
    props: {
        hasDownArrow: {
            type: Boolean,
            default: true
        },
        arrowIconCls: {
            type: String,
            default: 'combo-arrow'
        },
        arrowAlign: {
            type: String,
            default: 'right'
        },
        panelAlign: {
            type: String,
            default: 'left'
        },
        panelStyle: Object,
        multiple: {
            type: Boolean,
            default: false
        },
        separator: {
            type: String,
            default: ','
        },
        delay: {
            type: Number,
            default: 200
        },
        cls: String
    },
    data() {
        return {
            panelClosed: true,
            panelLeft: 0,
            panelTop: 0,
            scrollTop: 0
        }
    },
    computed: {
        baseClasses() {
            return ['textbox f-inline-row combo', this.cls, {
                'textbox-disabled':this.disabled,
                'textbox-readonly':this.readonly,
                'textbox-focused':this.focused,
                'textbox-invalid':this.invalidState
            }];
        },
        arrowClasses(){
            return ['textbox-addon f-column f-noshrink', {
                'f-order0':this.arrowAlign=='left',
                'f-order6':this.arrowAlign=='right'
            }];
        }
    },
    mounted() {
        domHelper.bind(document, 'click', this.onDocumentClick);
        domHelper.bind(document, 'mousewheel', this.onDocumentMouseWheel);
    },
    beforeDestroy() {
        if (this.$refs.panelRef){
            this.$el.appendChild(this.$refs.panelRef);
        }
        domHelper.unbind(document, 'click', this.onDocumentClick);
        domHelper.unbind(document, 'mousewheel', this.onDocumentMouseWheel);
    },
    methods: {
        onDocumentClick(event){
            if (!this.disabled && !this.editable){
                if (domHelper.isChild(event.target, this.$refs.inputRef)){
                    event.stopPropagation();
                    this.togglePanel();
                    return false;
                }
            }
            if (this.$refs.panelRef){
                event.stopPropagation();
                if (domHelper.isChild(event.target, this.$el)){
                    return false;
                }
                if (!domHelper.isChild(event.target, this.$refs.panelRef)){
                    this.closePanel();
                }
            }
        },
        onDocumentMouseWheel(event){
            if (this.$refs.panelRef){
                event.stopPropagation();
                if (domHelper.isChild(event.target, this.$refs.panelRef)){
                    //return false;
                } else {
                    this.closePanel();
                }
            }
        },
        togglePanel(){
            if (this.disabled || this.readonly){
                return;
            }
            this.panelClosed ? this.openPanel() : this.closePanel();
            this.focus();
        },
        alignPanel(){
            let view = domHelper.getViewport();
            let pos = domHelper.offset(this.$el);
            let hwidth = domHelper.outerWidth(this.$el);
            let pwidth = domHelper.outerWidth(this.$refs.panelRef);
            let hheight = domHelper.outerHeight(this.$el);	// host height
            let pheight = domHelper.outerHeight(this.$refs.panelRef);		// panel height
            let left = pos.left;
            if (this.panelAlign == 'right'){
                left += hwidth - pwidth;
            }
            if (left + pwidth > view.width + domHelper.getScrollLeft()){
                left = view.width + domHelper.getScrollLeft() - pwidth;
            }
            if (left < 0){
                left = 0;
            }
            let top = pos.top + hheight;
            if (top + pheight > view.height + domHelper.getScrollTop()){
                top = pos.top - pheight;
            }
            if (top < domHelper.getScrollTop()){
                top = pos.top + hheight;
            }
            this.panelTop = top;
            this.panelLeft = left;
    
        },
    
        openPanel(){
            if (!this.panelClosed){
                return;
            }
            this.panelClosed = false;
            this.alignPanel();
            this.$nextTick(() => {
                document.body.appendChild(this.$refs.panelRef);
                let hwidth = domHelper.outerWidth(this.$el);
                let pwidth = domHelper.outerWidth(this.$refs.panelRef);
                if (pwidth < hwidth || !this.panelStyle || !this.panelStyle['width']){
                    this.$refs.panelRef.style.width = hwidth+'px';
                }
                this.alignPanel();
                this.$refs.panelRef.scrollTop = this.scrollTop;
            });
        },
        closePanel(){
            if (!this.panelClosed){
                this.scrollTop = this.$refs.panelRef.scrollTop;
                this.panelClosed = true;
            }
        }
    }
}