import{r as c,c as d,h as n,H as p,g as u}from"./index-584d014c.js";import{S as m,f as g}from"./sort-order.enum-64ce8998-3581a21f.js";import"./_commonjsHelpers-ba3f0406-a4eace81.js";const f=`.mi-input[type=text],.mi-input[type=search],.mi-input[type=number],.mi-input[type=password],.mi-input[type=tel]{font-size:1rem;padding:8px;border-style:solid;border-width:1px;border-color:#8d98aa;border-radius:4px}.mi-input[type=text],.mi-input[type=search],.mi-input[type=number],.mi-input[type=password],.mi-input[type=range],.mi-input[type=tel]{display:block}.mi-input[type=radio],.mi-input[type=checkbox]{margin:0px;transform:scale(1.2, 1.2)}.mi-input[type=search]{padding-left:32px;background:url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 22' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.6267 8.43836C14.6267 11.8561 11.8561 14.6267 8.43836 14.6267C5.02062 14.6267 2.25 11.8561 2.25 8.43836C2.25 5.02062 5.02062 2.25 8.43836 2.25C11.8561 2.25 14.6267 5.02062 14.6267 8.43836Z' stroke='%23aeb9cb' stroke-width='2.5'/%3E%3Crect x='15.0979' y='14.1614' width='7.34678' height='1.32449' rx='0.662244' transform='rotate(45 15.0979 14.1614)' fill='%23aeb9cb' stroke='%23aeb9cb'/%3E%3Crect x='13.7847' y='13.2916' width='1.05276' height='0.697347' transform='rotate(45 13.7847 13.2916)' stroke='%23aeb9cb' stroke-width='0.697346'/%3E%3C/svg%3E%0A") no-repeat scroll 8px center, white}.mi-input:disabled{opacity:0.48;cursor:not-allowed}.mi-label{font-style:normal;display:block;font-size:1rem;font-weight:500;color:#1e2025}.mi-label>*{margin-top:4px}.mi-label>input[type=radio],.mi-label>input[type=checkbox],.mi-label>label.mi-toggle-btn{margin-right:8px}combo-box-item{display:none}:host{display:inline-block;position:relative;font-family:Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"}:host(.open) .button::after{border-top-color:transparent;border-bottom-color:#1f2937;margin-top:-8px}:host(.open) section{display:flex}:host(.open) svg{transform:rotate(180deg)}.input{position:relative;display:flex;justify-content:flex-start;align-items:center;height:100%;width:100%;font-family:inherit;background:linear-gradient(#f9fafb, #f3f4f6);border-radius:4px;border-width:1px;border-style:solid;border-color:#d1d5db;color:#1c1917;font-size:1rem;font-weight:500;line-height:1rem;padding-right:40px;padding-left:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.input__svg{margin-left:auto;position:absolute;top:50%;right:-42px}.input__label{padding-top:12px;padding-bottom:12px;margin-right:8px;display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.input__label--from-inner-html{display:flex;flex-direction:row;align-items:center;gap:8px}.input:disabled{opacity:0.72;cursor:not-allowed}.content{padding-top:12px;padding-bottom:12px;margin-top:12px;margin-bottom:12px;border-radius:8px;color:#1c1917;font-size:1rem;font-weight:500;background-color:#fcfcfc;box-shadow:0px 2px 2px rgba(0, 0, 0, 0.2), 0px 4px 4px rgba(0, 0, 0, 0.18), 0px 8px 8px rgba(0, 0, 0, 0.16);min-width:320px;max-width:480px;max-height:580px;display:none;flex-direction:column;position:fixed;z-index:10000}.content .list{padding:0;margin:0;list-style:none;overflow-y:auto}.content .list__item{cursor:pointer}.content .list__item--highlighted{background-color:#f3f4f6}.empty-page{display:flex;align-items:left;flex-direction:column;margin-left:16px;margin-bottom:12px}.empty-page>*{margin:0}.empty-page__header{font-size:1rem;font-weight:400;color:#374151}.label{display:flex;flex-direction:row;align-items:center;padding-left:16px;padding-right:16px;padding-top:8px;padding-bottom:8px}.label__item{display:inline-block;margin-top:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.label__item--from-inner-html{display:flex;flex-direction:row;align-items:center;gap:8px}.label__checkbox{margin-right:12px}.label__checkbox--hidden{display:none}`;var l;(function(e){e.ArrowDown="ArrowDown",e.ArrowUp="ArrowUp",e.Enter="Enter",e.Esc="Escape"})(l||(l={}));const x=class{constructor(e){c(this,e),this.change=d(this,"change",3),this.isFilterSelectionDisabled=!1,this.isMouseOverEventDisabled=!1,this.currentItemIndex=0,this.selectedItemIndex=0,this.highlightedItemClassName="list__item--highlighted",this.open=!1,this.items=[],this.itemsOrder=void 0,this.filterable=!1,this.selected=[],this.noResultsMessage="No results found",this.currentItems=[],this.disabled=!1}onItemsChanged(e){if(e.some(t=>t.tagName.toLowerCase()!=="combo-box-item"))throw new Error("Items contains unknown element(s).");if(Object.values(m).includes(this.itemsOrder)&&(e=this.getSortedItems(e)),this.currentItems=[...e],this.filter(),!this.filterable){const t=this.currentItems.findIndex(i=>i.selected);this.currentItemIndex=t>-1?t:0,this.selectedItemIndex=this.currentItemIndex}this.items.forEach((t,i)=>{t.dataset.index=i.toString()}),this.selectFirstMiDropdownItem()}onCurrentItemsChange(){this.isFilterSelectionDisabled=this.currentItems.length===0}checkForClickOutside(e){var t;!this.hostElement.contains(e.target)&&this.noResultsMessage&&(this.clearFilter(),this.filterElement.value=(t=this.selected[0])===null||t===void 0?void 0:t.text,this.open=!1)}onClickExists(e){this.open=!0,e.target.type="text",this.filterElement.select()}mouseMoveEventHandler(){this.isMouseOverEventDisabled=!1}scrollEventHandler(e){const t=e.target;(!t||!this.hostElement.contains(t))&&(this.open=!1)}resizeEventHandler(){this.calculateDropDownPosition()}componentDidLoad(){this.createMiDropdownItemsFromDocument(),this.selectFirstMiDropdownItem(),this.enableKeyboardNavigationEvents();const e=new IntersectionObserver(t=>{t.forEach(i=>{i.isIntersecting===!0&&this.filterElement.blur()})});this.filterElement!==void 0&&(e.observe(this.filterElement),this.filterElement.addEventListener("keydown",t=>{(t.key===l.ArrowDown||t.key===l.ArrowUp)&&t.preventDefault()}))}componentDidRender(){this.calculateDropDownPosition(),this.filterable||this.highlightItem(this.currentItemIndex,!0)}createMiDropdownItemsFromDocument(){const e=this.items&&this.items.length>0?this.items:this.hostElement.querySelectorAll("combo-box-item");e.length>0&&(this.items=Array.from(e))}selectFirstMiDropdownItem(){var e;if(!this.filterable){const t=(e=this.items)===null||e===void 0?void 0:e.findIndex(i=>i.selected);this.selected=[this.items[t>-1?t:0]]}}enableKeyboardNavigationEvents(){this.hostElement.addEventListener("keydown",e=>{if(this.open===!1&&e.key===l.ArrowDown){this.isMouseOverEventDisabled=!0,this.toggleContentWindow(),e.preventDefault();return}if(this.open===!0&&!this.filterable)switch(e.key){case(l.ArrowDown||l.ArrowUp):this.isMouseOverEventDisabled=!0,this.currentItemIndex=(this.currentItemIndex+1)%this.currentItems.length,this.highlightItem(this.currentItemIndex,!0),e.preventDefault();break;case l.ArrowUp:this.isMouseOverEventDisabled=!0,this.currentItemIndex=(this.currentItemIndex+this.currentItems.length-1)%this.currentItems.length,this.highlightItem(this.currentItemIndex,!0),e.preventDefault();break;case l.Enter:if(this.hostElement.shadowRoot.activeElement===this.clearButtonElement)return;this.currentItems[this.currentItemIndex]!==void 0&&this.onSelect(this.currentItems[this.currentItemIndex]),e.preventDefault();break}e.key===l.Esc&&(this.filterable||(this.currentItemIndex=this.selectedItemIndex,this.highlightItem(this.currentItemIndex)),this.toggleContentWindow(),this.clearFilter())})}highlightItem(e,t=!1){var i,s;const r=this.hostElement.shadowRoot.querySelectorAll(".list__item");r.forEach(a=>{a.classList.remove(this.highlightedItemClassName)}),(i=r[e])===null||i===void 0||i.classList.add(this.highlightedItemClassName),t&&((s=r[e])===null||s===void 0||s.scrollIntoView({block:"nearest",inline:"nearest"}))}getSortedItems(e){return this.itemsOrder===m.Asc?e.sort((t,i)=>(t.text||t.innerText).trimStart().toLowerCase().localeCompare((i.text||i.innerText).trimStart().toLowerCase(),void 0,{numeric:!0})):e.sort((t,i)=>(i.text||i.innerText).trimStart().toLowerCase().localeCompare((t.text||t.innerText).trimStart().toLowerCase(),void 0,{numeric:!0})),e}onChangedHandler(){this.selected=[...this.items.filter(e=>e.selected)],this.change.emit(this.selected)}toggleContentWindow(){this.open=!this.open}onSelect(e){this.filterable||(this.open=!1,Array.from(this.items).forEach(i=>{i.selected=!1}),this.clearFilter()),e.selected=!e.selected,this.currentItemIndex=Number(e.dataset.index),this.selectedItemIndex=this.currentItemIndex,this.onChangedHandler()}onMouseOver(e){!this.isMouseOverEventDisabled&&!this.filterable&&(this.highlightItem(e),this.currentItemIndex=e)}filter(){if(this.filterElement){const e=this.filterElement.value,t=this.items.map(o=>o.text||o.innerText),i=this.currentItems.length;if(e==="")return this.currentItemIndex=this.selectedItemIndex,this.currentItems=[...this.items];const s={limit:50,allowTypo:!1,threshold:-1e4},a=g.go(e,t,s).map(o=>this.items.find(h=>(h.text||h.innerText)===o.target));this.currentItems=a,i!==this.currentItems.length&&(this.currentItemIndex=0)}}clearFilter(){var e;this.filterElement&&(this.filterElement.value=(e=this.selected[0])===null||e===void 0?void 0:e.text,this.filterElement.blur(),this.currentItems=this.items)}render(){var e;const t=n("ul",{class:"list"},this.currentItems.map((i,s)=>this.renderListItem(i,s,this.filterable)));return n(p,{class:{open:this.open}},n("input",{type:"text",class:"input",onFocus:i=>this.onClickExists(i),ref:i=>this.filterElement=i,onInput:()=>this.filter(),tabIndex:0,value:(e=this.selected[0])===null||e===void 0?void 0:e.text}),n("svg",{role:"button",class:"input__svg",part:"icon-down-arrow",width:"12",height:"6",viewBox:"0 0 18 10",xmlns:"http://www.w3.org/2000/svg",onClick:()=>this.toggleContentWindow()},n("path",{d:"M9.37165 9.58706C9.17303 9.80775 8.82697 9.80775 8.62835 9.58706L0.751035 0.834484C0.46145 0.512722 0.689796 7.73699e-08 1.12268 1.25924e-07L16.8773 1.89302e-06C17.3102 1.94157e-06 17.5386 0.512723 17.249 0.834484L9.37165 9.58706Z"})),n("section",{ref:i=>this.listElement=i,part:"dropdown-container",class:"content"},this.currentItems.length===0?this.renderNoResultsTemplate():t))}renderNoResultsTemplate(){return n("div",{class:"empty-page"},n("p",{class:"empty-page__header"},this.noResultsMessage))}renderListItem(e,t,i){let s;const r=e.getAttribute("title")||e.text||e.innerText;return e.innerText.length>0?s=n("div",{class:"label__item label__item--from-inner-html",innerHTML:e.innerHTML}):s=n("div",{class:"label__item",innerHTML:e.text}),n("li",{class:"list__item",title:r,onMouseOver:()=>{this.onMouseOver(t)}},n("label",{class:"mi-label label",tabindex:"-1"},n("input",{class:{label__checkbox:!0,"label__checkbox--hidden":!i,"mi-input":!0},type:"checkbox",value:t,checked:e.selected,onChange:()=>this.onSelect(e)}),s))}calculateDropDownPosition(){this.listElement.style.bottom=null,this.listElement.style.left=null,this.listElement.style.right=null,this.listElement.style.top=null,this.listElement.style.maxHeight=null,this.listElement.style.minWidth=null;const{clientWidth:e,clientHeight:t}=document.documentElement,i=this.hostElement.getBoundingClientRect(),s=this.listElement.getBoundingClientRect(),r=t-i.bottom,a=i.top,o=580,h=12;e<=s.width||i.right-s.width<0&&s.right>e?(this.listElement.style.right=`${h}px`,this.listElement.style.left=`${h}px`,this.listElement.style.minWidth="unset"):s.right>e?(this.listElement.style.left="unset",this.listElement.style.right=`${e-i.right}px`):(this.listElement.style.left=`${i.left}px`,this.listElement.style.right="unset"),a>r?(this.listElement.style.maxHeight=`${Math.min(a,o)}px`,this.listElement.style.top="unset",this.listElement.style.bottom=`${t-i.top}px`):(this.listElement.style.top=`${i.bottom}px`,this.listElement.style.bottom="unset",this.listElement.style.maxHeight=`${Math.min(r-h*2,o)}px`)}get hostElement(){return u(this)}static get watchers(){return{items:["onItemsChanged"],currentItems:["onCurrentItemsChange"]}}};x.style=f;export{x as mi_combo_box};
//# sourceMappingURL=mi-combo-box.entry-74a6341c.js.map
