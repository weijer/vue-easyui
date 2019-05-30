import SlideUpDown from '../base/SlideUpDown';

export const PANEL_HEADER_TEMPLATE = `
    <div v-if="hasHeader" ref="headerRef" :class="headerClasses" :style="headerStyle">
        <slot name="header"></slot>
        <div v-if="!$slots['header']" :class="['panel-title',{'panel-with-icon':iconCls}]">{{title}}</div>
        <div v-if="iconCls" :class="['panel-icon',iconCls]"></div>
        <div class="panel-tool" v-if="collapsible || closable">
			<a v-if="collapsible" href="javascript:;" :class="collapsibleClasses" @click="clickCollapsibleTool"></a>
			<a v-if="closable" href="javascript:;" :class="closableClasses" @click="clickCloseTool"></a>
        </div>
    </div>
`;
export const PANEL_BODY_TEMPLATE = `
    <div ref="bodyRef" v-SlideUpDown="{animate:animateState,collapsed:collapsedState,disabled:!collapseToShrinkBody}" :class="bodyClasses" :style="bodyStyle">
        <slot></slot>
    </div>
`;
export const PANEL_FOOTER_TEMPLATE = `
    <div v-if="hasFooter" ref="footerRef" :class="footerClasses" :style="footerStyle">
        <slot name="footer"></slot>
    </div>
`;
export const PANEL_INNER_TEMPLATE = PANEL_HEADER_TEMPLATE+PANEL_BODY_TEMPLATE+PANEL_FOOTER_TEMPLATE;

export const PANEL_TEMPLATE = 
    '<div v-if="!closedState" :class="panelClasses" :style="panelStyle">' +
    PANEL_INNER_TEMPLATE +
    '</div>';
export default {
    template: PANEL_TEMPLATE,
    name: 'Panel',
    directives: {SlideUpDown},
    props: {
        title: String,
        iconCls: String,
        border: {
            type: Boolean,
            default: true
        },
        animate: {
            type: Boolean,
            default: false
        },
        closed: {
            type: Boolean,
            default: false
        },
        collapsed: {
            type: Boolean,
            default: false
        },
        collapsible: {
            type: Boolean,
            default: false
        },
        closable: {
            type: Boolean,
            default: false
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        showFooter: {
            type: Boolean,
            default: true
        },
        expandIconCls: {
            type: String,
            default: 'panel-tool-expand'
        },
        collapseIconCls: {
            type: String,
            default: 'panel-tool-collapse'
        },
        closeIconCls: {
            type: String,
            default: 'panel-tool-close'
        },
        panelCls: String,
        panelStyle: Object,
        headerCls: String,
        headerStyle: Object,
        bodyCls: String,
        bodyStyle: Object,
        footerCls: String,
        footerStyle: Object
    },
    data(){
        return {
            collapsedState: this.collapsed,
            closedState: this.closed,
            animateState: this.animate,
            collapseToShrinkBody: true
        }
    },
    computed: {
        hasHeader(){
            if (!this.showHeader){
                return false;
            }
            if (this.$slots['header'] || this.title){
                return true;
            } else {
                return false;
            }
        },
        hasFooter(){
            if (!this.showFooter){
                return false;
            }
            if (this.$slots['footer']){
                return true;
            } else {
                return false;
            }
        },
        panelClasses(){
            return ['panel f-column', this.panelCls];
        },
        headerClasses(){
            return ['panel-header f-noshrink',this.headerCls,
                {'panel-header-noborder':!this.border}
            ];
        },
        bodyClasses(){
            return ['panel-body f-full', this.bodyCls, {
                'panel-body-noheader':!this.hasHeader,
                'panel-body-nobottom':this.$slots['footer'],
                'panel-body-noborder':!this.border
            }];
        },
        footerClasses(){
            return ['panel-footer', this.footerCls, {
                'panel-footer-noborder':!this.border
            }];
        },
        collapsibleClasses(){
            return this.collapsedState?this.expandIconCls:this.collapseIconCls;
        },
        closableClasses(){
            return this.closeIconCls;
        }
    },
    watch: {
        closed(value){
            this.closedState = value;
        },
        collapsed(value){
            this.collapsedState = value;
        },
        animate(value){
            this.animateState = value;
        }
    },
    methods:{
        clickCollapsibleTool(){
            this.collapsedState = !this.collapsedState;
        },
        clickCloseTool(){
            this.closedState = true;
        }
    }
}