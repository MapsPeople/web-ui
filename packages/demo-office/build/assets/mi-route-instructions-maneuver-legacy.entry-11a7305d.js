import{r as s,h as i,H as r}from"./index-584d014c.js";import{U as o}from"./unit-system.enum-eaefb53e-55614e45.js";const l=':host{display:flex;padding-top:12px;padding-bottom:12px;font-family:Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"}.icon{width:48px;display:flex;justify-content:center}.icon mi-icon{width:24px;height:24px}.description{display:flex;flex-direction:column;flex:1}.description p{margin:0;padding-right:16px;font-size:0.875rem;word-break:break-all}.description__distance{display:flex;align-items:center}.description__distance mi-distance{font-size:0.75rem;padding-right:12px}.description__distance-border{flex:1;width:100%;height:0;border-bottom:1px solid #e5e7eb}',h=class{constructor(t){s(this,t),this.maneuver=void 0,this.maneuverData=void 0,this.translations=void 0,this.translationsData=void 0,this.unit=o.Metric}parseManeuverProp(){this.maneuverData=JSON.parse(this.maneuver)}parseTranslationsProp(){this.translationsData=JSON.parse(this.translations)}componentWillLoad(){this.parseManeuverProp(),this.parseTranslationsProp()}getManeuverName(t){if(t.includes("straight"))return"straight";if(t.includes("sharp right"))return"sharp-right";if(t.includes("sharp left"))return"sharp-left";if(t.includes("slight right"))return"slight-right";if(t.includes("slight left"))return"slight-left";if(t.includes("right"))return"right";if(t.includes("left"))return"left";if(t.includes("uturn"))return"u-turn";if(t.includes("depart"))return"straight"}render(){return this.maneuverData&&this.translationsData?this.renderManeuver():null}renderManeuver(){const t={straight:this.translationsData.continueStraightAhead,left:`${this.translationsData.goLeft} ${this.translationsData.andContinue}`,"sharp-left":`${this.translationsData.goSharpLeft} ${this.translationsData.andContinue}`,"slight-left":`${this.translationsData.goSlightLeft} ${this.translationsData.andContinue}`,right:`${this.translationsData.goRight} ${this.translationsData.andContinue}`,"sharp-right":`${this.translationsData.goSharpRight} ${this.translationsData.andContinue}`,"slight-right":`${this.translationsData.goSlightRight} ${this.translationsData.andContinue}`,"u-turn":`${this.translationsData.turnAround} ${this.translationsData.andContinue}`},a=this.getManeuverName(this.maneuverData.maneuver.toLowerCase()),n=`arrow-${a}`,e=this.maneuverData.instructions?this.maneuverData.instructions:t[a];return i(r,null,i("div",{class:"icon"},a?i("mi-icon",{part:"maneuver-icon","icon-name":n}):null),i("div",{class:"description"},i("p",{part:"maneuver-description"},e),i("div",{class:"description__distance"},i("mi-distance",{part:"maneuver-description-distance",meters:this.maneuverData.distance.value,unit:this.unit}),i("span",{part:"maneuver-description-distance-border",class:"description__distance-border"}))))}static get watchers(){return{maneuver:["parseManeuverProp"],translations:["parseTranslationsProp"]}}};h.style=l;export{h as mi_route_instructions_maneuver_legacy};
//# sourceMappingURL=mi-route-instructions-maneuver-legacy.entry-11a7305d.js.map
