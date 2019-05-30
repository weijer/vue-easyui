import { PANEL_HEADER_TEMPLATE, PANEL_FOOTER_TEMPLATE } from '../panel/Panel';
import Dialog from '../dialog/Dialog';
import MessagerContent from './MessagerContent';

export const MESSAGERDIALOG_INNER_TEMPLATE = PANEL_HEADER_TEMPLATE + `
<div ref="bodyRef" v-SlideUpDown="{animate:animateState,collapsed:collapsedState,disabled:!collapseToShrinkBody}" class="f-column" :class="bodyClasses" :style="bodyStyle">
    <component :is="component"
            :messagerType="messagerType" 
            :title="title" 
            :msg="msg" 
            :icon="icon"
            :buttons="buttons">
    </component>
</div>
` + PANEL_FOOTER_TEMPLATE;

export const MESSAGERDIALOG_TEMPLATE = 
'<div class="dialog-inline">' +
    '<div ref="panelRef" v-if="!closedState" v-Draggable="dragOpts" v-Resizable="resizeOpts" :class="panelClasses" :style="panelStyles">' +
    MESSAGERDIALOG_INNER_TEMPLATE +
    '</div>' +
'</div>';

export default {
    name: 'MessagerDialog',
    template: MESSAGERDIALOG_TEMPLATE,
    extends: Dialog,
    props: {
        component: {
            type: [String,Object],
            default: () => {return MessagerContent}
        },
        messagerType: String,
        dialogStyle: {
            type: Object,
            default: () => {return {width:'360px',minHeight:'130px'}}
        },
        modal: {
            type: Boolean,
            default: true
        },
        closed: {
            type: Boolean,
            default: true
        },
        title: String,
        msg: String,
        icon: String,
        buttons: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            resultValue: null
        }
    },
    computed: {
        messagerIcon() {
            return this.icon ? 'messager-' + this.icon : null;
        }
    }
}