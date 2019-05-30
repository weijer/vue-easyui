import domHelper from '../base/DomHelper';

export const LAYOUT_TEMPLATE = `
<div ref="layoutRef" :class="layoutClasses" :style="layoutStyles" @click="onClick($event)">
    <slot></slot>
</div>
`;

export default {
    name: 'Layout',
    template: LAYOUT_TEMPLATE,
    props: {
        layoutCls: String,
        layoutStyle: Object
    },
    data() {
        return {
            panels: [],
            paddings: null,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0
        }
    },
    computed: {
        layoutClasses(){
            return ['layout', this.layoutCls];
        },
        layoutStyles(){
            return [this.layoutStyle, {padding:this.paddings}];
        }
    },
    watch: {
        panels(){
            this.updatePaddings();
            this.$nextTick(() => this.updatePaddings());
        }
    },
    created() {
        if (window.EventHub){
            window.EventHub.$on('tabSelect', (tab) => {
                if (domHelper.isChild(this.$el, tab.$el)){
                    this.updatePaddings();
                }
            });
        }
    },
    methods: {
        addPanel(panel){
            this.panels.push(panel);
        },
        removePanel(panel){
            let index = this.panels.indexOf(panel);
            if (index >= 0){
                this.panels.splice(index,1);
            }
        },
        getPanel(region){
            let pp = this.panels.filter(p => p.region == region);
            return pp.length ? pp[0] : null;
        },
        getPaddingValue(region) {
            let panel = this.getPanel(region);
            let val = 0;
            if (panel && !panel.collapsedState && !panel.float){
                if (region == 'west' || region == 'east'){
                    val = domHelper.outerWidth(panel.$el);
                } else {
                    val = domHelper.outerHeight(panel.$el);
                }
                if (!panel.split && panel.border){
                    val -= 1;
                }
            }
            return val;
        },
        updatePaddings() {
            this.paddingLeft = this.getPaddingValue('west');
            this.paddingRight = this.getPaddingValue('east');
            this.paddingTop = this.getPaddingValue('north');
            this.paddingBottom = this.getPaddingValue('south');
            this.paddings = [this.paddingTop, this.paddingRight, this.paddingBottom, this.paddingLeft].map(v => v + 'px').join(' ');
        },
        onClick(event){
            let cp = domHelper.closest(event.target, '.layout-panel');
            this.panels.filter(p => p.$el != cp).forEach(p => {
                if (p.isExpanding){
                    return;
                }
                if (p.float && !p.collapsedState){
                    p.collapse();
                }
            });
        }
            
    }
}