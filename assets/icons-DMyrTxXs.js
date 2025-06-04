import{R as h,r as x,j as e}from"./vendor-20RkeJz5.js";var w={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},f=h.createContext&&h.createContext(w),L=["attr","size","title"];function j(t,r){if(t==null)return{};var a=b(t,r),n,c;if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);for(c=0;c<o.length;c++)n=o[c],!(r.indexOf(n)>=0)&&Object.prototype.propertyIsEnumerable.call(t,n)&&(a[n]=t[n])}return a}function b(t,r){if(t==null)return{};var a={};for(var n in t)if(Object.prototype.hasOwnProperty.call(t,n)){if(r.indexOf(n)>=0)continue;a[n]=t[n]}return a}function C(){return C=Object.assign?Object.assign.bind():function(t){for(var r=1;r<arguments.length;r++){var a=arguments[r];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(t[n]=a[n])}return t},C.apply(this,arguments)}function u(t,r){var a=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);r&&(n=n.filter(function(c){return Object.getOwnPropertyDescriptor(t,c).enumerable})),a.push.apply(a,n)}return a}function y(t){for(var r=1;r<arguments.length;r++){var a=arguments[r]!=null?arguments[r]:{};r%2?u(Object(a),!0).forEach(function(n){A(t,n,a[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):u(Object(a)).forEach(function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(a,n))})}return t}function A(t,r,a){return r=H(r),r in t?Object.defineProperty(t,r,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[r]=a,t}function H(t){var r=z(t,"string");return typeof r=="symbol"?r:r+""}function z(t,r){if(typeof t!="object"||!t)return t;var a=t[Symbol.toPrimitive];if(a!==void 0){var n=a.call(t,r);if(typeof n!="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(r==="string"?String:Number)(t)}function v(t){return t&&t.map((r,a)=>h.createElement(r.tag,y({key:a},r.attr),v(r.child)))}function s(t){return r=>h.createElement(Z,C({attr:y({},t.attr)},r),v(t.child))}function Z(t){var r=a=>{var{attr:n,size:c,title:o}=t,p=j(t,L),d=c||a.size||"1em",i;return a.className&&(i=a.className),t.className&&(i=(i?i+" ":"")+t.className),h.createElement("svg",C({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},a.attr,n,p,{className:i,style:y(y({color:t.color||a.color},a.style),t.style),height:d,width:d,xmlns:"http://www.w3.org/2000/svg"}),o&&h.createElement("title",null,o),t.children)};return f!==void 0?h.createElement(f.Consumer,null,a=>r(a)):r(w)}function P(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M21 16.42V19.9561C21 20.4811 20.5941 20.9167 20.0705 20.9537C19.6331 20.9846 19.2763 21 19 21C10.1634 21 3 13.8366 3 5C3 4.72371 3.01545 4.36687 3.04635 3.9295C3.08337 3.40588 3.51894 3 4.04386 3H7.5801C7.83678 3 8.05176 3.19442 8.07753 3.4498C8.10067 3.67907 8.12218 3.86314 8.14207 4.00202C8.34435 5.41472 8.75753 6.75936 9.3487 8.00303C9.44359 8.20265 9.38171 8.44159 9.20185 8.57006L7.04355 10.1118C8.35752 13.1811 10.8189 15.6425 13.8882 16.9565L15.4271 14.8019C15.5572 14.6199 15.799 14.5573 16.001 14.6532C17.2446 15.2439 18.5891 15.6566 20.0016 15.8584C20.1396 15.8782 20.3225 15.8995 20.5502 15.9225C20.8056 15.9483 21 16.1633 21 16.42Z"},child:[]}]})(t)}function D(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M6.00488 9H19.9433L20.4433 7H8.00488V5H21.7241C22.2764 5 22.7241 5.44772 22.7241 6C22.7241 6.08176 22.7141 6.16322 22.6942 6.24254L20.1942 16.2425C20.083 16.6877 19.683 17 19.2241 17H5.00488C4.4526 17 4.00488 16.5523 4.00488 16V4H2.00488V2H5.00488C5.55717 2 6.00488 2.44772 6.00488 3V9ZM6.00488 23C4.90031 23 4.00488 22.1046 4.00488 21C4.00488 19.8954 4.90031 19 6.00488 19C7.10945 19 8.00488 19.8954 8.00488 21C8.00488 22.1046 7.10945 23 6.00488 23ZM18.0049 23C16.9003 23 16.0049 22.1046 16.0049 21C16.0049 19.8954 16.9003 19 18.0049 19C19.1095 19 20.0049 19.8954 20.0049 21C20.0049 22.1046 19.1095 23 18.0049 23Z"},child:[]}]})(t)}function B(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z"},child:[]}]})(t)}function S(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"},child:[]}]})(t)}function R(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"},child:[]}]})(t)}function E(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"},child:[]}]})(t)}function _(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M3 4H21V6H3V4ZM9 11H21V13H9V11ZM3 18H21V20H3V18Z"},child:[]}]})(t)}function q(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"},child:[]}]})(t)}function I(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z"},child:[]}]})(t)}function U(t){return s({attr:{viewBox:"0 0 24 24",fill:"currentColor"},child:[{tag:"path",attr:{d:"M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"},child:[]}]})(t)}function N(t){return s({attr:{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},child:[{tag:"path",attr:{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"},child:[]}]})(t)}/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var V={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),l=(t,r)=>{const a=x.forwardRef(({color:n="currentColor",size:c=24,strokeWidth:o=2,absoluteStrokeWidth:p,className:d="",children:i,...g},k)=>x.createElement("svg",{ref:k,...V,width:c,height:c,stroke:n,strokeWidth:p?Number(o)*24/Number(c):o,className:["lucide",`lucide-${O(t)}`,d].join(" "),...g},[...r.map(([M,m])=>x.createElement(M,m)),...Array.isArray(i)?i:[i]]));return a.displayName=`${t}`,a};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=l("ArrowDownAZ",[["path",{d:"m3 16 4 4 4-4",key:"1co6wj"}],["path",{d:"M7 20V4",key:"1yoxec"}],["path",{d:"M20 8h-5",key:"1vsyxs"}],["path",{d:"M15 10V6.5a2.5 2.5 0 0 1 5 0V10",key:"ag13bf"}],["path",{d:"M15 14h5l-5 6h5",key:"ur5jdg"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=l("ArrowUpZA",[["path",{d:"m3 8 4-4 4 4",key:"11wl7u"}],["path",{d:"M7 4v16",key:"1glfcx"}],["path",{d:"M15 4h5l-5 6h5",key:"8asdl1"}],["path",{d:"M15 20v-3.5a2.5 2.5 0 0 1 5 0V20",key:"r6l5cz"}],["path",{d:"M20 18h-5",key:"18j1r2"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=l("BarChart",[["line",{x1:"12",x2:"12",y1:"20",y2:"10",key:"1vz5eb"}],["line",{x1:"18",x2:"18",y1:"20",y2:"4",key:"cun8e5"}],["line",{x1:"6",x2:"6",y1:"20",y2:"16",key:"hq0ia6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=l("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=l("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=l("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=l("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=l("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=l("CreditCard",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t1=l("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const e1=l("Filter",[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r1=l("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a1=l("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n1=l("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l1=l("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c1=l("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s1=l("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i1=l("Package",[["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}],["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o1=l("Phone",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h1=l("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d1=l("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C1=l("ShoppingBag",[["path",{d:"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",key:"hou9p0"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M16 10a4 4 0 0 1-8 0",key:"1ltviw"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y1=l("ShoppingCart",[["circle",{cx:"8",cy:"21",r:"1",key:"jimo8o"}],["circle",{cx:"19",cy:"21",r:"1",key:"13723u"}],["path",{d:"M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",key:"9zh506"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p1=l("Star",[["polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",key:"8f66p6"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x1=l("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f1=l("Truck",[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u1=l("UserX",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w1=l("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v1=l("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g1=l("XCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k1=l("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),M1=t=>e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{transform:"scale(0.75)"},children:[e.jsx("path",{d:"M12 2V18M12 22V18M12 18L15 21M12 18L9 21M15 3L12 6L9 3",stroke:"#6CA0DC",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M3.33978 7.00042L6.80389 9.00042M6.80389 9.00042L17.1962 15.0004M6.80389 9.00042L5.70581 4.90234M6.80389 9.00042L2.70581 10.0985M17.1962 15.0004L20.6603 17.0004M17.1962 15.0004L21.2943 13.9023M17.1962 15.0004L18.2943 19.0985",stroke:"#6CA0DC",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("path",{d:"M20.66 7.00042L17.1959 9.00042M17.1959 9.00042L6.80364 15.0004M17.1959 9.00042L18.294 4.90234M17.1959 9.00042L21.294 10.0985M6.80364 15.0004L3.33954 17.0004M6.80364 15.0004L2.70557 13.9023M6.80364 15.0004L5.70557 19.0985",stroke:"#6CA0DC",strokeWidth:"1.5",strokeLinecap:"round"})]}),m1=t=>e.jsxs("svg",{height:"24",width:"24",viewBox:"0 0 512 512",xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",style:{transform:"scale(0.7)"},children:[e.jsx("path",{style:{fill:"#FFA733"},d:"M256,512L256,512c-6.679,0-12.712-3.978-15.342-10.12l-42.827-105.456L96.913,436.783c-6.212,2.489-13.293,1.022-18.006-3.695c-4.723-4.717-6.18-11.804-3.695-18.011l40.37-100.902L10.12,271.348C3.978,268.718,0,262.674,0,256s3.978-12.718,10.12-15.348l105.462-42.827L75.212,96.924c-2.483-6.206-1.027-13.293,3.695-18.011c4.712-4.728,11.794-6.185,18.006-3.695l100.919,40.359L240.658,10.12C243.288,3.978,249.321,0,256,0"}),e.jsx("path",{style:{fill:"#FFA733"},d:"M256,0c6.679,0,12.712,3.978,15.342,10.12l42.831,105.456l100.913-40.359c6.212-2.489,13.293-1.033,18.006,3.695c4.723,4.717,6.18,11.804,3.695,18l-40.365,100.924l105.456,42.815C508.022,243.282,512,249.326,512,256s-3.978,12.718-10.12,15.348l-105.456,42.815l40.365,100.924c2.483,6.195,1.027,13.283-3.695,18c-4.712,4.717-11.794,6.185-18.006,3.695l-100.913-40.359L271.343,501.88C268.712,508.022,262.679,512,256,512z"}),e.jsx("path",{style:{fill:"#FFDA44"},d:"M256,406.261c-82.853,0-150.261-67.403-150.261-150.261S173.147,105.739,256,105.739S406.261,173.142,406.261,256S338.853,406.261,256,406.261z"}),e.jsx("path",{style:{fill:"#FFDA44"},d:"M406.261,256c0-82.858-67.408-150.261-150.261-150.261v300.522C338.853,406.261,406.261,338.858,406.261,256z"})]}),L1=t=>e.jsxs("svg",{height:"1.5em",width:"1.6em",viewBox:"0 0 512 512",xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",style:{transform:"scale(0.7)"},children:[e.jsx("path",{style:{fill:"#FFA733"},d:"M256,512L256,512c-6.679,0-12.712-3.978-15.342-10.12l-42.827-105.456L96.913,436.783c-6.212,2.489-13.293,1.022-18.006-3.695c-4.723-4.717-6.18-11.804-3.695-18.011l40.37-100.902L10.12,271.348C3.978,268.718,0,262.674,0,256s3.978-12.718,10.12-15.348l105.462-42.827L75.212,96.924c-2.483-6.206-1.027-13.293,3.695-18.011c4.712-4.728,11.794-6.185,18.006-3.695l100.919,40.359L240.658,10.12C243.288,3.978,249.321,0,256,0",transform:"translate(-20, 0)"}),e.jsx("path",{style:{fill:"#3078cb"},d:"M256,0c6.679,0,12.712,3.978,15.342,10.12l42.831,105.456l100.913-40.359c6.212-2.489,13.293-1.033,18.006,3.695c4.723,4.717,6.18,11.804,3.695,18l-40.365,100.924l105.456,42.815C508.022,243.282,512,249.326,512,256s-3.978,12.718-10.12,15.348l-105.456,42.815l40.365,100.924c2.483,6.195,1.027,13.283-3.695,18c-4.712,4.717-11.794,6.185-18.006,3.695l-100.913-40.359L271.343,501.88C268.712,508.022,262.679,512,256,512z",transform:"translate(20, 0)"}),e.jsx("path",{style:{fill:"#FFDA44"},d:"M256,406.261c-82.853,0-150.261-67.403-150.261-150.261S173.147,105.739,256,105.739v300.522z",transform:"translate(-20, 0)"}),e.jsx("path",{style:{fill:"#5793d7"},d:"M256,105.739c82.853,0,150.261,67.403,150.261,150.261S338.853,406.261,256,406.261V105.739z",transform:"translate(20, 0)"})]}),j1=({fillColor:t="#6CA0DC",strokeColor:r="#ffffff",...a})=>e.jsxs("svg",{width:"65",height:"64",viewBox:"0 0 65 64",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{transform:"scale(0.5)"},...a,children:[e.jsx("path",{fill:t,d:`
        M30.12 9.57
        A2.5 2.5 0 0 1 34.88 9.57
        L43.76 12.46
        A2.5 2.5 0 0 1 47.61 15.25
        L53.11 22.81
        A2.5 2.5 0 0 1 54.58 27.33
        L54.58 36.67
        A2.5 2.5 0 0 1 53.11 41.19
        L47.61 48.75
        A2.5 2.5 0 0 1 43.76 51.54
        L34.88 54.43
        A2.5 2.5 0 0 1 30.12 54.43
        L21.24 51.54
        A2.5 2.5 0 0 1 17.39 48.75
        L11.90 41.19
        A2.5 2.5 0 0 1 10.43 36.67
        L10.43 27.33
        A2.5 2.5 0 0 1 11.90 22.81
        L17.39 15.25
        A2.5 2.5 0 0 1 21.24 12.46
        L30.12 9.57
        Z`}),e.jsx("path",{d:"M25.6 31.5L31.1 37L40.6 27.5",stroke:r,strokeWidth:"4",strokeLinecap:"square"})]}),b1=t=>e.jsxs("svg",{viewBox:"0 0 1024 824",width:"1em",height:"1em",style:{transform:"scale(1.2)"},...t,children:[e.jsx("path",{d:"M1001 695.3H121c-50.8 0-92-41.2-92-92v-156c0-41.1 36.5-72.5 77.1-66.4l43.6 6.5 127.4-99.1c23.1-18 51.5-27.7 80.7-27.7h168c30.1 0 59.2 10.3 82.6 29.2l120.8 97.6s227.9 15.1 271.7 126.8v181.1z",fill:"#6CA0DC"}),e.jsx("path",{d:"M1001 704.3H121c-55.7 0-101-45.3-101-101v-156c0-22.2 9.6-43.2 26.5-57.7s39-20.9 61-17.6l39.8 6 124.3-96.7c24.5-19.1 55.2-29.6 86.2-29.6h168c32 0 63.4 11.1 88.3 31.2l118.6 95.8c12.5 1 63 5.9 118.4 21.6 37.1 10.5 68.6 23.8 93.6 39.4 32.1 20 53.8 44 64.5 71.3 0.4 1 0.6 2.2 0.6 3.3v181.1c0.2 4.9-3.8 8.9-8.8 8.9zM96.1 389.1c-13.8 0-27.3 4.9-37.9 14.1C45.4 414.3 38 430.3 38 447.3v156c0 45.8 37.3 83 83 83h871V516c-42.8-103.8-261.1-119.4-263.3-119.5-1.9-0.1-3.6-0.8-5.1-2l-120.8-97.6c-21.7-17.5-49-27.2-77-27.2h-168c-27.1 0-53.8 9.2-75.2 25.8l-127.4 99.1a8.89 8.89 0 0 1-6.9 1.8l-43.6-6.5c-2.8-0.6-5.7-0.8-8.6-0.8z",fill:"#3E4152"}),e.jsx("path",{d:"M255.4 665.1m-108.7 0a108.7 108.7 0 1 0 217.4 0 108.7 108.7 0 1 0-217.4 0Z",fill:"#8599A4"}),e.jsx("path",{d:"M255.4 782.8c-64.9 0-117.7-52.8-117.7-117.7s52.8-117.7 117.7-117.7 117.7 52.8 117.7 117.7-52.8 117.7-117.7 117.7z m0-217.3c-55 0-99.7 44.7-99.7 99.7s44.7 99.7 99.7 99.7 99.7-44.7 99.7-99.7-44.7-99.7-99.7-99.7z",fill:"#3E4152"}),e.jsx("path",{d:"M753.5 665.1m-108.7 0a108.7 108.7 0 1 0 217.4 0 108.7 108.7 0 1 0-217.4 0Z",fill:"#8599A4"}),e.jsx("path",{d:"M753.5 782.8c-64.9 0-117.7-52.8-117.7-117.7s52.8-117.7 117.7-117.7 117.7 52.8 117.7 117.7-52.8 117.7-117.7 117.7z m0-217.3c-55 0-99.7 44.7-99.7 99.7s44.7 99.7 99.7 99.7 99.7-44.7 99.7-99.7c-0.1-55-44.8-99.7-99.7-99.7z",fill:"#3E4152"}),e.jsx("path",{d:"M596.5 478H300.7V375.3H515z",fill:"#6CA0DC"}),e.jsx("path",{d:"M596.5 487H300.7c-5 0-9-4-9-9V375.3c0-5 4-9 9-9H515c2.7 0 5.3 1.3 7 3.4l81.5 102.6c2.1 2.7 2.6 6.4 1.1 9.5-1.5 3.2-4.6 5.2-8.1 5.2z m-286.8-18h268.2l-67.2-84.6h-201V469z",fill:"#3E4152"})]}),A1=t=>e.jsxs("svg",{version:"1.1",id:"fuel",xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",viewBox:"0 0 256 256",style:{transform:"scale(1.1)"},...t,children:[e.jsx("path",{d:`M44.656,241.007c-14.974,0-27.156-11.226-27.156-25.024c0-8.113,4.36-15.707,11.413-20.356
         c-0.271-1.428-0.413-2.899-0.413-4.403V42.043c0-13.001,10.577-23.578,23.577-23.578h78
         c9.155,0,17.108,5.245,21.013,12.888c3.441-3.103,7.963-4.88,12.674-4.88c4.023,0,7.871,1.255,11.127,3.629
         l47.129,34.384c4.836,3.528,7.736,9.209,7.758,15.195l0.332,93.23c0.135,4.919-0.363,21.069-11.496,32.685
         c-6.701,6.985-15.672,10.678-25.944,10.678c-22.791,0-35.979-19.063-38.658-36.893l-0.354-1.727v13.564
         c0,1.506-0.141,2.979-0.411,4.404c7.053,4.648,11.413,12.244,11.413,20.357c0,13.799-12.184,25.023-27.157,25.023
         H44.656V241.007z M191.346,173.55c0.143,0.89,0.434,1.908,0.777,2.815c0.141-0.864,0.225-1.725,0.22-2.37
         c-0.01-0.238-0.015-0.478-0.015-0.716l-0.18-49.989c-9.01-2.329-16.025-7.021-20.922-14.011
         c-6.863-9.795-8.365-22.941-4.447-38.323l-13.123-9.573v57.185c28.232,8.455,33.404,33.811,36.855,50.734l0.616,2.996
         C191.21,172.68,191.284,173.111,191.346,173.55z`,fill:"none"}),e.jsx("path",{d:`M52.078,204.798h78c7.468,0,13.578-6.108,13.578-13.577v-46.606v-18.05v-84.52
         c0-7.468-6.11-13.578-13.578-13.578h-78c-7.467,0-13.577,6.109-13.577,13.578v149.177
         C38.5,198.688,44.61,204.798,52.078,204.798z
         M59.512,58.051c0-6.009,4.915-10.924,10.924-10.924h41.287
         c6.009,0,10.924,4.915,10.924,10.924v26.761l0,0c0,6.009-4.916,10.924-10.924,10.924H70.436
         c-6.009,0-10.924-4.916-10.924-10.924V58.051z
         M220.111,173.075l-0.334-93.358c-0.01-2.829-1.366-5.484-3.651-7.151l-47.128-34.383
         c-3.967-2.894-9.529-2.024-12.424,1.943c-2.896,3.968-2.025,9.53,1.941,12.425l19.879,14.501
         c-3.772,10.862-6.506,25.746,1.022,36.491c4.67,6.667,12.285,10.444,22.701,11.281l0.209,58.455
         c0,0.113,0.002,0.228,0.008,0.341c0.069,1.675-0.381,9.204-3.778,12.747c-0.875,0.91-2.436,2.121-5.89,2.121
         c-9.171,0-11.149-13.012-11.222-13.514c-0.028-0.219-0.064-0.437-0.11-0.651c-0.209-1.011-0.416-2.019-0.621-3.022
         c-3.466-16.994-7.655-37.471-31.786-43.668V146.4c9.463,4.496,11.454,14.209,14.361,28.455
         c0.189,0.927,0.38,1.856,0.572,2.791c1.451,10.109,9.227,28.627,28.807,28.627
         c7.482,0,13.958-2.627,18.727-7.599C220.217,189.473,220.186,175.463,220.111,173.075z
         M191.068,95.377c-2.738-3.908-2.848-10.969-0.53-19.467l11.471,8.37l0.058,16.236
         C197.542,99.992,193.302,98.564,191.068,95.377z
         M154.657,215.982c0,8.264-7.722,15.023-17.157,15.023H44.656
         c-9.436,0-17.156-6.761-17.156-15.023c0-5.869,3.907-10.967,9.547-13.436
         c3.444,4.559,8.891,7.521,15.03,7.521h78.002c6.14,0,11.586-2.963,15.03-7.521
         C150.749,205.016,154.657,210.113,154.657,215.982z`,fill:"#6CA0DC"})]}),H1=t=>e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{transform:"scale(0.8)"},children:[e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M12.0303 14.9697C12.3232 15.2626 12.3232 15.7374 12.0303 16.0303L10.0303 18.0303C9.73744 18.3232 9.26256 18.3232 8.96967 18.0303C8.67678 17.7374 8.67678 17.2626 8.96967 16.9697L10.9697 14.9697C11.2626 14.6768 11.7374 14.6768 12.0303 14.9697ZM16.5303 14.9697C16.8232 15.2626 16.8232 15.7374 16.5303 16.0303L14.5303 18.0303C14.2374 18.3232 13.7626 18.3232 13.4697 18.0303C13.1768 17.7374 13.1768 17.2626 13.4697 16.9697L15.4697 14.9697C15.7626 14.6768 16.2374 14.6768 16.5303 14.9697ZM8.03033 18.4697C8.32322 18.7626 8.32322 19.2374 8.03033 19.5303L6.03033 21.5303C5.73744 21.8232 5.26256 21.8232 4.96967 21.5303C4.67678 21.2374 4.67678 20.7626 4.96967 20.4697L6.96967 18.4697C7.26256 18.1768 7.73744 18.1768 8.03033 18.4697ZM17.5303 18.4697C17.8232 18.7626 17.8232 19.2374 17.5303 19.5303L15.5303 21.5303C15.2374 21.8232 14.7626 21.8232 14.4697 21.5303C14.1768 21.2374 14.1768 20.7626 14.4697 20.4697L16.4697 18.4697C16.7626 18.1768 17.2374 18.1768 17.5303 18.4697ZM12.5303 19.4697C12.8232 19.7626 12.8232 20.2374 12.5303 20.5303L10.5303 22.5303C10.2374 22.8232 9.76256 22.8232 9.46967 22.5303C9.17678 22.2374 9.17678 21.7626 9.46967 21.4697L11.4697 19.4697C11.7626 19.1768 12.2374 19.1768 12.5303 19.4697Z",fill:"#6CA0DC"}),e.jsx("path",{d:"M19.1238 18.2554C19.0156 17.9463 18.838 17.6561 18.591 17.409C18.3514 17.1694 18.0712 16.9951 17.7725 16.8862C18.4648 16.0033 18.4043 14.7223 17.591 13.909C16.7123 13.0303 15.2877 13.0303 14.409 13.909L13.6075 14.7105C13.4982 14.4182 13.326 14.1441 13.091 13.909C12.2123 13.0303 10.7877 13.0303 9.90901 13.909L7.90901 15.909C7.6625 16.1555 7.48514 16.445 7.37695 16.7533C6.8428 16.7824 6.31704 17.001 5.90901 17.409L4.64108 18.6769C3.09035 18.0396 2 16.528 2 14.7647C2 12.4256 3.91878 10.5294 6.28571 10.5294C6.56983 10.5294 6.8475 10.5567 7.11616 10.6089C6.88706 9.9978 6.7619 9.33687 6.7619 8.64706C6.7619 5.52827 9.32028 3 12.4762 3C15.4159 3 17.8371 5.19371 18.1551 8.01498C20.393 8.78024 22 10.8811 22 13.3529C22 15.4509 20.8423 17.2817 19.1238 18.2554Z",fill:"#6CA0DC"})]}),z1=t=>e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{transform:"scale(0.7)"},children:[e.jsxs("g",{clipPath:"url(#clip0_525_159)",children:[e.jsx("path",{d:"M13.5 3.30132C13.5 1.55256 11.4138 0.646005 10.1354 1.83922L4.60584 7.00011H1C0.447715 7.00011 0 7.44783 0 8.00011V16.0001C0 16.5524 0.447715 17.0001 1 17.0001H4.60584L10.1354 22.161C11.4138 23.3542 13.5 22.4477 13.5 20.6989V3.30132Z",fill:"#6CA0DC"}),e.jsx("path",{d:"M15.1164 17.7028C14.8417 17.2237 15.0075 16.6126 15.4866 16.3379C16.2492 15.9008 16.8831 15.2703 17.3243 14.5101C17.7656 13.7499 17.9986 12.8868 18 12.0078C18.0013 11.1288 17.771 10.265 17.3321 9.50346C16.8931 8.74189 16.2612 8.10948 15.5 7.66998C15.0217 7.39384 14.8578 6.78225 15.134 6.30396C15.4101 5.82567 16.0217 5.66179 16.5 5.93793C17.5657 6.55323 18.4504 7.4386 19.0649 8.50479C19.6793 9.57099 20.0019 10.7803 20 12.0109C19.9981 13.2415 19.6718 14.4498 19.0541 15.5141C18.4363 16.5784 17.5489 17.4611 16.4813 18.0731C16.0021 18.3477 15.391 18.182 15.1164 17.7028Z",fill:"#6CA0DC"}),e.jsx("path",{d:"M17.4759 19.8082C16.9968 20.0828 16.831 20.6939 17.1057 21.1731C17.3803 21.6522 17.9914 21.818 18.4706 21.5433C20.1482 20.5816 21.5428 19.1946 22.5135 17.5221C23.4843 15.8497 23.997 13.9509 24 12.0171C24.003 10.0833 23.4961 8.1829 22.5305 6.50745C21.5649 4.832 20.1747 3.44071 18.5 2.47382C18.0217 2.19767 17.4101 2.36155 17.134 2.83984C16.8578 3.31813 17.0217 3.92972 17.5 4.20587C18.8702 4.99696 20.0077 6.13529 20.7977 7.50611C21.5877 8.87694 22.0024 10.4318 22 12.014C21.9976 13.5962 21.5781 15.1498 20.7838 16.5181C19.9895 17.8865 18.8486 19.0213 17.4759 19.8082Z",fill:"#6CA0DC"})]}),e.jsx("defs",{children:e.jsx("clipPath",{id:"clip0_525_159",children:e.jsx("rect",{width:"24",height:"24",fill:"white"})})})]}),Z1=t=>e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 1024 1024",xmlns:"http://www.w3.org/2000/svg",style:{transform:"scale(0.8)"},children:[e.jsx("path",{d:"M896 192H128c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h576.6l191.6 127.7L896 832c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64z",fill:"#5793d7"}),e.jsx("path",{d:"M640 512c0-125.4-51.5-238.7-134.5-320H128c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h377.5c83-81.3 134.5-194.6 134.5-320z",fill:"#6CA0DC"}),e.jsx("path",{d:"M256 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z",fill:"#FFFF8D"}),e.jsx("path",{d:"M512 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z",fill:"#FFFF00"}),e.jsx("path",{d:"M768 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z",fill:"#FFEA00"})]}),V1=({width:t="100px",height:r="40px",...a})=>e.jsxs("svg",{width:t,height:r,viewBox:"0 0 100 40",xmlns:"http://www.w3.org/2000/svg",style:{transform:"scale(2.5)"},...a,children:[e.jsx("rect",{x:"0",y:"0",width:"100",height:"40",rx:"10",fill:"#ef4444"}),e.jsx("text",{x:"50%",y:"50%",textAnchor:"middle",alignmentBaseline:"middle",fill:"white",fontSize:"25",fontWeight:"bold",children:"акція"})]});export{v1 as A,X as B,$ as C,V1 as D,d1 as E,N as F,A1 as G,r1 as H,t1 as I,s1 as J,u1 as K,n1 as L,Z1 as M,h1 as N,Q as O,o1 as P,W as Q,R,m1 as S,x1 as T,w1 as U,z1 as V,T as W,k1 as X,G as Y,K as Z,E as a,M1 as b,L1 as c,P as d,I as e,S as f,U as g,B as h,q as i,D as j,y1 as k,g1 as l,_ as m,j1 as n,p1 as o,b1 as p,H1 as q,e1 as r,c1 as s,l1 as t,i1 as u,f1 as v,Y as w,J as x,a1 as y,C1 as z};
//# sourceMappingURL=icons-DMyrTxXs.js.map
