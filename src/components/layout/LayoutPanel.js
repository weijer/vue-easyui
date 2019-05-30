import domHelper from '../base/DomHelper';
import Resizable from '../resizable/Resizable';
import Panel from '../panel/Panel';
import { PANEL_INNER_TEMPLATE } from '../panel/Panel';

export const LAYOUTPANEL_TEMPLATE = 
    '<div v-if="!closedState" v-Resizable="resizeOpts" :class="panelClasses" :style="panelStyles">' +
    PANEL_INNER_TEMPLATE +
    '</div>';

export default {
    name: 'LayoutPanel',
    template: LAYOUTPANEL_TEMPLATE,
    extends: Panel,
    directives: {
        Resizable
    },
    props: {
        title: String,
        region: {
            type: String,
            default: 'center'
        },
        float: {
            type: Boolean,
            default: false
        },
        split: {
            type: Boolean,
            default: false
        },
        animate: {
            type: Boolean,
            default: true
        },
        collapsible: {
            type: Boolean,
            default: false
        },
        expandIconCls: String,
        collapseIconCls: String
    },
    data() {
        return {
            isExpanding: false,
            collapseToShrinkBody: false,
            resizeOpts: null
        }
    },
    mounted(){
        this.setResizeOpts();
        this.$parent.addPanel(this);
        domHelper.bind(this.$el, 'transitionend', this.onSlideEnd);
    },
    destroyed(){
        this.$parent.removePanel(this);
        domHelper.unbind(this.$el);
    },
    computed: {
        layout(){
            return this.$parent;
        },
        panelClasses(){
            return ['panel f-column layout-panel', this.panelCls, {
                'layout-collapsed':this.collapsedState,
                'layout-animate':this.animate,
                'layout-panel-east':this.region=='east',
                'layout-panel-west':this.region=='west',
                'layout-panel-south':this.region=='south',
                'layout-panel-north':this.region=='north',
                'layout-panel-center':this.region=='center',
                'layout-split-east':this.split&&this.region=='east',
                'layout-split-west':this.split&&this.region=='west',
                'layout-split-south':this.split&&this.region=='south',
                'layout-split-north':this.split&&this.region=='north',
                'layout-split-center':this.split&&this.region=='center'
            }];
        },
        panelStyles(){
            return [this.panelStyle, {
                top: this.top?(this.top+'px'):null,
                bottom: this.bottom?(this.bottom+'px'):null
            }]
        },
        collapsibleClasses(){
            let icons = {
                'west': 'left',
                'east': 'right',
                'north': 'up',
                'south': 'down'
            };
            if (this.collapsedState){
                return this.expandIconCls ? this.expandIconCls : 'layout-button-'+icons[this.region];
            } else {
                return this.collapseIconCls ? this.collapseIconCls : 'layout-button-'+icons[this.region];
            }
        },
        top(){
            if (this.region == 'west' || this.region == 'east'){
                return this.layout.paddingTop;
            }
            return null;
        },
        bottom(){
            if (this.region == 'west' || this.region == 'east'){
                return this.layout.paddingBottom;
            }
            return null;
        }
    },
    watch: {
        collapsed(){
            this.collapsed ? this.collapse() : this.expand()
        }
    },
    methods: {
        setResizeOpts(){
            const handles = {north:'s',south:'n',east:'w',west:'e'}
            const handler = () => {
                if (this.region == 'west' || this.region == 'east'){
                    this.$el.style.left = null;
                } else {
                    this.$el.style.top = null;
                }
                this.$parent.updatePaddings();
            }
            this.resizeOpts = {
                edge: 5,
                handles: handles[this.region]||'',
                disabled: !this.split,
                resizing: handler,
                resizeStop: handler
            }
        },
        onSlideEnd(){
            this.layout.updatePaddings();
        },
        clickCollapsibleTool(){
            this.collapse();
            this.layout.updatePaddings();
        },
        expand(){
            this.collapsedState = false;
            this.isExpanding = true;
            this.$nextTick(() => this.isExpanding = false);
        },
        collapse(){
            this.collapsedState = true;
            this.layout.updatePaddings();
        }
    }
}