!function(e){var t={};function a(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,a),r.l=!0,r.exports}a.m=e,a.c=t,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(n,r,function(t){return e[t]}.bind(null,r));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a(a.s=17)}({17:function(e,t){!function(){var e,t;function a(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"POST";return fetch("",{method:t,body:e}).then(function(e){return e.json()}).then(function(e){for(var t=document.querySelector(".main"),a=document.querySelector(".guestList"),o=document.querySelector(".TablePlannerTabs");o.firstChild;)o.removeChild(o.firstChild);for(;t.firstChild;)t.removeChild(t.firstChild);for(;a.firstChild;)a.removeChild(a.firstChild);var d=new DocumentFragment,s=new DocumentFragment,c=new DocumentFragment,l=document.createElement("a");l.className="RSVP-submit active",l.setAttribute("data-index","0"),l.textContent="All",c.appendChild(l),e.response.forEach(function(e){var t=document.createElement("div");t.className="guest",t.setAttribute("data-id",e.guest__pk),t.setAttribute("draggable","true"),t.textContent="".concat(e.guest__first_name," ").concat(e.guest__last_name),s.appendChild(t)});for(var i=Object.keys(e.tables),u=0;u<i.length;u++){var m=e.tables[i[u]],f=document.createElement("div");f.className="table",f.setAttribute("data-id",m.pk);var p=document.createElement("div");p.className="table-content",f.appendChild(p);var v=document.createElement("div");v.className="header",p.appendChild(v),v.textContent=i[u],d.appendChild(f);var g=document.createElement("a");g.className="RSVP-submit",g.setAttribute("data-index",String(u+1)),g.textContent=i[u],c.appendChild(g),m.seats.length&&function(){var e=document.createElement("ul");m.seats.forEach(function(t,a){var n=document.createElement("li"),r=document.createElement("span"),o=document.createElement("span");o.className="js-remove-guest",o.textContent="❌",n.setAttribute("data-id",t.pk),n.setAttribute("draggable","true"),n.className="seat",r.textContent="".concat(a+1,". ").concat(t.guest__first_name," ").concat(t.guest__last_name),n.appendChild(r),n.appendChild(o),e.appendChild(n)}),p.appendChild(e)}()}t.classList.remove("zoom"),t.style.transform="",t.appendChild(d),a.appendChild(s),o.appendChild(c),n(),r(document.querySelector('input[name="filter"]'))})}function n(){var e=[];document.querySelectorAll(".guest").forEach(function(t){e.push([t.textContent.toLowerCase(),t.dataset.id])}),t=e}function r(e){var a=e.value,n=t.filter(function(e){return e[0].match("^"+a.toLowerCase())}).map(function(e){return e[1]});document.querySelectorAll(".guest").forEach(function(e){n.indexOf(e.dataset.id)>-1?e.style.display="block":e.style.display="none"})}window.addEventListener("DOMContentLoaded",function(){var t;(t=document.getElementById("tableName")).addEventListener("submit",function(e){e.preventDefault(),a(new FormData(t))}),document.querySelector('input[name="filter"]').addEventListener("input",function(e){r(e.target)}),n(),function(){var t=document.querySelector(".main");t.addEventListener("dragover",function(t){t.preventDefault();var a=t.path.find(function(e){return"table"==e.className});a&&e!==a&&(e=a,a.style.backgroundColor="#ccc")}),t.addEventListener("dragleave",function(t){t.preventDefault();var a=t.path.find(function(e){return"table"==e.className});a&&(e=void 0,a.style.backgroundColor="")}),t.addEventListener("drop",function(e){e.preventDefault();for(var n=e.target,r=null;!t.isEqualNode(n)||!r;)(n=n.parentElement).dataset.id&&(r=n);if(r){var o=new FormData,d=null;r.style.backgroundColor="";var s=e.dataTransfer.getData("action"),c=e.dataTransfer.getData("guestName"),l=r.dataset.id;if("newTable"==s){var i=e.dataTransfer.getData("guestId");o.append("guestId",i),o.append("tableId",l),o.append("action","addGuest")}if("updateGuest"==s){var u=e.dataTransfer.getData("seatId");o.append("seatId",u),o.append("tableId",l),o.append("action","updateGuest"),(d=document.querySelector('li.seat[data-id="'.concat(u,'"]'))).style.display="none"}var m=document.createElement("li");m.textContent=c;var f=r.querySelector(".table-content ul");f?f.appendChild(m):((f=document.createElement("ul")).appendChild(m),r.querySelector(".table-content").appendChild(f)),a(o).catch(function(){d&&(d.style.display="block"),m.remove()})}}),document.querySelector(".guestList").addEventListener("dragstart",function(e){var t=e.target;console.log(),t&&(e.dataTransfer.setData("guestId",t.dataset.id),e.dataTransfer.setData("guestName",t.textContent),e.dataTransfer.setData("action","newTable"))}),document.querySelector(".main").addEventListener("dragstart",function(e){var t=e.target;console.log(e),t&&(e.dataTransfer.setData("seatId",t.dataset.id),e.dataTransfer.setData("guestName",t.querySelector("span").textContent),e.dataTransfer.setData("action","updateGuest"))})}(),document.querySelector(".main").addEventListener("click",function(e){if(e.target.classList.contains("js-remove-guest")){var t=new FormData;t.append("tableGuestPk",e.target.parentNode.dataset.id),t.append("action","removeGuest"),a(t)}}),document.querySelector(".TablePlannerTabs").addEventListener("click",function(e){if("A"==e.target.nodeName){var t=document.querySelector(".main");document.querySelectorAll(".TablePlannerTabs a").forEach(function(e){return e.classList.remove("active")});var a=parseInt(e.target.dataset.index);e.target.classList.add("active"),a?(t.classList.add("zoom"),t.style.transform="translateX(-".concat(100*(a-1),"%)")):(t.classList.remove("zoom"),t.style.transform="")}})})}()}});