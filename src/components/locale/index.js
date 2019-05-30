let lang = null;

export const t = (path, defValue=null) => {
    if (lang){
        let value = lang;
        let pp = path.split('.');
        for(let i=0; i<pp.length; i++){
            let key = pp[i];
            if (value[key]){
                value = value[key];
            } else {
                return defValue;
            }
        }
        return value||defValue;
    }
    return defValue;
};

export const use = (l) => {
    lang = l || lang;
};

export default {
    use,
    t
};
