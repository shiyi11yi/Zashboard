if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const f=e||("document"in self?document.currentScript.src:"")||location.href;if(i[f])return;let o={};const d=e=>s(e,f),t={module:{uri:f},exports:o,require:d};i[f]=Promise.all(n.map((e=>t[e]||d(e)))).then((e=>(r(...e),o)))}}define(["./workbox-3e8df8c8"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-BBp93IKo.js",revision:null},{url:"assets/index-D6RY8yQT.css",revision:null},{url:"index.html",revision:"2e27f886a323405b7c949b2147d73f0a"},{url:"registerSW.js",revision:"402b66900e731ca748771b6fc5e7a068"},{url:"favicon.svg",revision:"7f1c4521acc10694fefef8f72dd2ea5f"},{url:"pwa-192x192.png",revision:"021df52501f4357c03eebd808f40dc6a"},{url:"pwa-512x512.png",revision:"d2f759aaabcb2c44ff52b27fde3de6e0"},{url:"pwa-maskable-192x192.png",revision:"7cd11dc5f0490b349d23eef5591d10e5"},{url:"pwa-maskable-512x512.png",revision:"8c97dc367a85a5a1eba523b24f79d03b"},{url:"manifest.webmanifest",revision:"c452912633990899ffe790f985ad0db9"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
