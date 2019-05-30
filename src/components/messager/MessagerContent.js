export const MESSAGER_CONTENT_TEMPLATE = `
<div class="f-column f-full">
    <div class="messager-body f-full f-column">
        <div class="f-row f-full">
            <div v-if="messagerIcon" class="f-noshrink messager-icon" :class="messagerIcon"></div>
            <div class="f-full" style="margin-bottom:20px">
                {{msg}}
            </div>
        </div>
        <div v-if="messagerType=='prompt'">
            <input ref="input" class="messager-input" v-model="inputValue">
        </div>
    </div>
    <div v-if="buttons" class="dialog-button messager-button f-noshrink">
        <LinkButton v-for="button in buttons" :key="button.text" :text="button.text" @click="closeDialog(button)"></LinkButton>
    </div>
</div>
`;

export default {
    name: 'MessagerContent',
    template: MESSAGER_CONTENT_TEMPLATE,
    props: {
        messagerType: String,
        title: String,
        icon: String,
        msg: String,
        buttons: Array
    },
    data() {
        return {
            inputValue: null
        }
    },
    computed: {
        messagerIcon() {
            return this.icon ? 'messager-' + this.icon : null;
        },
        dialog() {
            return this.$parent;
        }
    },
    mounted() {
        if (this.$refs.input){
            setTimeout(() => {
                this.$refs.input.focus();
            },300);
        }
    },
    methods: {
        closeDialog(button){
            if (this.messagerType == 'prompt' && button && button['value'] == true){
                this.dialog.resultValue = this.inputValue;
            } else {
                this.dialog.resultValue = button ? button['value'] : null;
            }
            this.dialog.close();
        }
    }
}