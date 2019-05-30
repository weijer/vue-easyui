import LinkButton from '../linkbutton/LinkButton';

window.FileButtonFileId = window.FileButtonFileId || 1;

export const FILEBUTTON_TEMPLATE = `
    <a ref="btnRef" 
        :href="href||'#'" 
        :class="innerCls" 
        :style="btnStyle" 
        @click="onClick($event)"
        @focus="focus()" 
        @blur="blur()">
        <span :class="btnLeftCls">
            <span class="l-btn-text" :class="{'l-btn-empty':isEmpty}"><slot v-if="!text"></slot><template v-else>{{text}}</template><template v-if="isEmpty">&nbsp;</template></span>
            <span :class="btnIconCls"></span>
        </span>
        <label class="filebox-label" :for="fileId">
            <input type="file" style="position:absolute;left:-500000px"
                ref="fileRef"    
                :id="fileId"
                :disabled="disabled"
                :multiple="multiple"
                :accept="accept"
                :capture="capture"
                @change="onFileSelect($event)"
            >
        </label>
    </a>
`;

export default {
    name: 'FileButton',
    template: FILEBUTTON_TEMPLATE,
    extends: LinkButton,
    props: {
        href: {
            type: String,
            default: 'javascript:;'
        },
        name: {
            type: String,
            default: 'file'
        },
        accept: String,
        capture: String,
        multiple: {
            type: Boolean,
            default: false
        },
        url: String,
        method: {
            type: String,
            default: 'POST'
        },
        autoUpload: {
            type: Boolean,
            default: true
        },
        withCredentials: {
            type: Boolean,
            default: true
        }
    },
    data(){
        return{
            fileId: '_easyui_file_'+window.FileButtonFileId++,
            files: []
        }
    },
    methods: {
        onFileSelect(event){
            this.files = [];
            for(let i=0; i<event.target.files.length; i++){
                this.files.push(event.target.files[i]);
            }
            this.$emit('select', this.files);
            if (this.files.length && this.autoUpload){
                this.upload();
            }
        },
        upload() {
            if (!this.url){
                return;
            }
            let xhr = new XMLHttpRequest();
            let formData = new FormData();
            for(let i=0; i<this.files.length; i++){
                let file = this.files[i];
                formData.append(this.name, file, file.name);
            }
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable){
                    let total = e.total;
                    let position = e.loaded;
                    let percent = Math.ceil(position * 100 / total);
                    this.$emit('progress', percent);
                }
            }, false);
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4){
                    if (xhr.status >= 200 && xhr.status < 300){
                        this.$emit('success', {xhr:xhr,files:this.files});
                    } else {
                        this.$emit('error', {xhr:xhr,files:this.files});
                    }
                }
            };
            xhr.open(this.method, this.url, true);
            xhr.withCredentials = this.withCredentials;
            xhr.send(formData);
        },
        clear(){
            this.fileRef.nativeElement.value = '';
        }
    }
}