import ValidateRules from './components/form/rules';
import Locale from './components/locale';
import { Panel } from './components/panel'
import { Accordion, AccordionPanel } from './components/accordion'
import { LinkButton, ButtonGroup } from './components/linkbutton';
import { FileButton } from './components/filebutton';
import { Pagination } from './components/pagination';
import { DataList } from './components/datalist';
import { VirtualScroll, Addon, Label } from './components/base';
import { GridBase, GridColumn, GridColumnGroup, GridHeaderRow } from './components/gridbase';
import { DataGrid } from './components/datagrid';
import { TextBox } from './components/textbox';
import { NumberBox } from './components/numberbox';
import { ComboBox } from './components/combobox';
import { SwitchButton } from './components/switchbutton';
import { CheckBox } from './components/checkbox';
import { RadioButton } from './components/radiobutton';
import { Tree } from './components/tree';
import { Tabs, TabPanel } from './components/tabs';
import { TimeSpinner } from './components/timespinner';
import { DateTimeSpinner } from './components/datetimespinner';
import { Layout, LayoutPanel } from './components/layout';
import { Menu, MenuItem, SubMenu, MenuSep } from './components/menu';
import { MenuButton } from './components/menubutton';
import { SplitButton } from './components/splitbutton';
import { Tooltip } from './components/tooltip';
import { PasswordBox } from './components/passwordbox';
import { Calendar } from './components/calendar';
import { DateBox } from './components/datebox';
import { Draggable, DraggableProxy } from './components/draggable';
import { Droppable } from './components/droppable';
import { Resizable } from './components/resizable';
import { Dialog } from './components/dialog';
import { ProgressBar } from './components/progressbar';
import { TreeGrid } from './components/treegrid';
import { Slider } from './components/slider';
import { TagBox } from './components/tagbox';
import { SearchBox } from './components/searchbox';
import { Form, FormField } from './components/form';
import { SideMenu } from './components/sidemenu';
import { Messager, MessagerDialog } from './components/messager';
import { ComboTree } from './components/combotree';
import { ComboGrid } from './components/combogrid';
import { DateTimeBox } from './components/datetimebox';
import { Split } from './components/split';
const components = [
    VirtualScroll,
    Panel,
    Dialog,
    Accordion,
    AccordionPanel,
    Tabs,
    TabPanel,
    Layout,
    LayoutPanel,
    LinkButton,
    ButtonGroup,
    FileButton,
    MenuButton,
    SplitButton,
    Pagination,
    DataList,
    GridBase,
    GridColumn,
    GridColumnGroup,
    GridHeaderRow,
    DataGrid,
    TreeGrid,
    TextBox,
    PasswordBox,
    Addon,
    Label,
    NumberBox,
    TimeSpinner,
    DateTimeSpinner,
    ComboBox,
    ComboTree,
    ComboGrid,
    SwitchButton,
    CheckBox,
    RadioButton,
    Tree,
    Menu,
    MenuItem,
    SubMenu,
    MenuSep,
    Calendar,
    DateBox,
    DateTimeBox,
    DraggableProxy,
    ProgressBar,
    Slider,
    TagBox,
    SearchBox,
    Form,
    FormField,
    SideMenu,
    MessagerDialog,
	Split
];

const directives = [
    Tooltip,
    Draggable,
    Droppable,
    Resizable
];

const install = function(Vue, opts={}){
    window.Vue = Vue;
    Locale.use(opts.locale);
    Object.assign(window.ValidateRules, opts.rules||{});
    components.forEach(component => {
        Vue.component(component.name, component);
    });
    directives.forEach(directive => {
        Vue.directive(directive.name, directive);
    });
    Vue.prototype.$messager = new Messager();
    window.EventHub = new Vue();
}

window.Locale = Locale;
window.ValidateRules = ValidateRules;
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

const EasyUI = {
    install
};

export * from './components/base';
export * from './components/panel';
export * from './components/accordion';
export * from './components/linkbutton';
export * from './components/filebutton';
export * from './components/datalist';
export * from './components/gridbase';
export * from './components/pagination';
export * from './components/textbox';
export * from './components/numberbox';
export * from './components/tree';
export * from './components/tooltip';
export * from './components/calendar';
export * from './components/checkbox';
export * from './components/combobox';
export * from './components/combotree';
export * from './components/combogrid';
export * from './components/switchbutton';
export * from './components/radiobutton';
export * from './components/tabs';
export * from './components/timespinner';
export * from './components/datetimespinner';
export * from './components/layout';
export * from './components/menu';
export * from './components/menubutton';
export * from './components/splitbutton';
export * from './components/passwordbox';
export * from './components/datebox';
export * from './components/datetimebox';
export * from './components/draggable';
export * from './components/droppable';
export * from './components/resizable';
export * from './components/dialog';
export * from './components/progressbar';
export * from './components/treegrid';
export * from './components/slider';
export * from './components/tagbox';
export * from './components/searchbox';
export * from './components/form';
export * from './components/sidemenu';
export * from './components/messager';

export default EasyUI;
