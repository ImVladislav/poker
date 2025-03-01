const SETTLE_DURATION = 100;
const DROP_DURATION = 200;
const CARDS_AMOUNT = 4;
// spades, hearts, diamons, clubs
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARDS = VALUES.flatMap((value, i) => SUITS.map((suit, j) => ({
  id: `${i}-${j}`,
  value,
  suit
})));

var script = {
  data() {
    return {
      lastCardId: 0,
      cards: [],
      isDeckEnabled: true,
    };
  },
  methods: {
    enter(el, done) {
      el.classList.add('hand__card--enter');
      el.classList.add('hand__card--flipped');
      el.style.pointerEvents = 'none';
      setTimeout(() => {
        el.addEventListener('transitionend', () => {
          el.style.pointerEvents = 'all';
          done();
        }, false);
        el.classList.remove('hand__card--enter');
      }, 0);
    },
    leave(el, done) {
      this.isDeckEnabled = false;
      el.classList.add('hand__card--leave');
      el.classList.remove('hand__card--flipped');
      const onLeave = () => {
        el.removeEventListener('transitionend', onLeave);
        this.isDeckEnabled = true;
        setTimeout(done, SETTLE_DURATION);
      };
      el.addEventListener('transitionend', onLeave, false);
    },
    takeCard() {
      if (!this.isDeckEnabled) { return; }
      if (this.cards.length === CARDS_AMOUNT) {
        this.cards.shift();
      }
      
      const randomIndex = Math.floor(Math.random() * CARDS.length);
      
      this.cards.push(...CARDS.splice(randomIndex, 1));
    },
    dropCard(id) {
      const dropId = this.cards.findIndex(card => card.id === id);
      
      if (dropId !== -1) {
        CARDS.push(...this.cards.splice(dropId, 1));
      }
    }
  },
  mounted() {
    let amount = 0;
    const intervalId = setInterval(() => {
      if (amount++ === CARDS_AMOUNT) {
        clearInterval(intervalId);
        return;
      }
      
      this.takeCard();
    }, DROP_DURATION);
  },
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "container" },
    [
      _c("div", { staticClass: "deck card", on: { click: _vm.takeCard } }, [
        _c("div", { staticClass: "card__back" })
      ]),
      _vm._v(" "),
      _c(
        "transition-group",
        {
          staticClass: "hand",
          attrs: { name: "hand-card", tag: "div", css: false },
          on: { enter: _vm.enter, leave: _vm.leave }
        },
        _vm._l(_vm.cards, function(card, index) {
          return _c(
            "div",
            {
              key: card.id,
              staticClass: "hand__card card",
              class: ["card--" + card.suit],
              on: {
                click: function($event) {
                  return _vm.dropCard(card.id)
                }
              }
            },
            [
              _c(
                "div",
                { staticClass: "card__face" },
                [
                  _vm._l(2, function(i) {
                    return _c("div", {
                      staticClass: "card__value",
                      attrs: {
                        "data-value": card.value,
                        "data-suit": card.suit
                      }
                    })
                  }),
                  _vm._v(" "),
                  _c("div", { staticClass: "card__suit" }, [
                    _vm._v(_vm._s(card.suit))
                  ])
                ],
                2
              ),
              _vm._v(" "),
              _c("div", { staticClass: "card__back" })
            ]
          )
        }),
        0
      )
    ],
    1
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-183b0669_0", { source: "@charset \"UTF-8\";\nhtml {\n  --card-width: 20vmin;\n  --card-height: calc(var(--card-width) * 1.6);\n  --color-table: #4d5265;\n  --color-card-face: #ecebf3;\n  --color-card-back: #920114;\n  --color-suits-black: #0c120c;\n  --color-suits-red: #c20114;\n  --color-deck-shadow: #401111;\n  font-family: Georgia, serif;\n}\nbody,\nhtml {\n  width: 100%;\n  \n}\nbody {\n  margin: 0;\n \n  ;\n}\nbody,\n.container {\n  display: flex;\n  flex-flow: column;\n  align-items: center;\n}\n.container {\n  flex: 1;\n  padding-bottom: 10vmax;\n  justify-content: center;\n}\n.card {\n  font-size: calc(var(--card-width) / 5);\n  position: relative;\n  cursor: pointer;\n  display: block;\n  width: var(--card-width);\n  height: var(--card-height);\n  transform-style: preserve-3d;\n  backface-visibility: visible;\n  perspective: 100px;\n}\n.card--♠, .card--♣ {\n  color: var(--color-suits-black);\n}\n.card--♥, .card--♦ {\n  color: var(--color-suits-red);\n}\n.card__face, .card__back {\n  position: absolute;\n  top: 10px;\n  left: 10px;\n  right: 10px;\n  bottom: 10px;\n  border-radius: 0.4em;\n  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.5);\n  backface-visibility: hidden;\n  transition: box-shadow 600ms ease-out;\n}\n.card__back {\n  transform: rotate3d(0, 1, 0, 0deg);\n  background-color: var(--color-card-back);\n  background-image: repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) 10%, transparent 0%, transparent 20%), repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) 10%, transparent 0%, transparent 20%);\n  background-position: center center;\n}\n.card__face {\n  padding: 0.5em;\n  display: flex;\n  flex-flow: column;\n  justify-content: center;\n  align-items: center;\n  transform: rotate3d(0, 1, 0, 180deg);\n  background: var(--color-card-face);\n}\n.card__suit {\n  font-size: 2.5em;\n}\n.card__value {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  padding: 0.2em;\n  display: flex;\n  flex-flow: column;\n  align-items: center;\n  transform: scale(-1);\n  line-height: 1;\n}\n.card__value:first-of-type {\n  bottom: auto;\n  right: auto;\n  top: 0;\n  left: 0;\n  transform: none;\n}\n.card__value::before {\n  content: attr(data-value);\n}\n.card__value::after {\n  font-size: 0.7em;\n  content: attr(data-suit);\n}\n.deck.card {\n  transform: rotate3d(0, 1, 0, 0deg);\n}\n.deck.card .card__back {\n  box-shadow: 0 6px 0 0 var(--color-deck-shadow), 2px 6px 16px 0 rgba(0, 0, 0, 0.6);\n}\n.hand {\n  position: relative;\n  width: calc(var(--card-width) * 5.5);\n  height: var(--card-height);\n  ;\n  perspective-origin: 50% 100%;\n}\n.hand__card {\n  --base-offset-y: 20%;\n  --rotation-x-ratio: 0;\n  --translate-z: 100px;\n  --translate-y: 0%;\n  --rotation-z: 0deg;\n  position: absolute;\n  top: 0;\n  transform: translate3d(-50%, calc(var(--base-offset-y) + var(--translate-y)), var(--translate-z)) rotate3d(var(--rotation-x-ratio), 1, 0.1, var(--rotation-z));\n  transition: all 620ms ease-out;\n  will-change: left, top, transform;\n}\n.hand__card:hover {\n  --translate-z: 150px;\n}\n.hand__card--flipped {\n  --rotation-z: 180deg;\n}\n.hand__card--enter.hand__card:nth-child(n):nth-last-child(n), .hand__card--leave.hand__card:nth-child(n):nth-last-child(n) {\n  --base-offset-y: 0%;\n  --rotation-z: 0deg;\n  --rotation-x-ratio: 0;\n  --translate-y: 0%;\n  --translate-z: 0px;\n  left: 50%;\n  top: -100%;\n  pointer-events: none;\n}\n.hand__card--enter.hand__card:nth-child(n):nth-last-child(n) .card__face,\n.hand__card--enter.hand__card:nth-child(n):nth-last-child(n) .card__back, .hand__card--leave.hand__card:nth-child(n):nth-last-child(n) .card__face,\n.hand__card--leave.hand__card:nth-child(n):nth-last-child(n) .card__back {\n  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);\n}\n.hand__card--enter {\n  transition: none;\n  z-index: 1;\n}\n.hand__card--leave {\n  z-index: 1;\n}\n.hand__card:nth-child(1):nth-last-child(1) {\n  left: 50%;\n}\n.hand__card:nth-child(1):nth-last-child(2) {\n  --translate-y: 10%;\n  --rotation-x-ratio: 0.1;\n  left: 33.3333333333%;\n}\n.hand__card:nth-child(2):nth-last-child(1) {\n  --translate-y: 10%;\n  --rotation-x-ratio: -0.1;\n  left: 66.6666666667%;\n}\n.hand__card:nth-child(1):nth-last-child(3) {\n  --translate-y: 10%;\n  --rotation-x-ratio: 0.1;\n  left: 25%;\n}\n.hand__card:nth-child(2):nth-last-child(2) {\n  left: 50%;\n}\n.hand__card:nth-child(3):nth-last-child(1) {\n  --translate-y: 10%;\n  --rotation-x-ratio: -0.1;\n  left: 75%;\n}\n.hand__card:nth-child(1):nth-last-child(4) {\n  --translate-y: 10%;\n  --rotation-x-ratio: 0.1;\n  left: 20%;\n}\n.hand__card:nth-child(2):nth-last-child(3) {\n  --rotation-x-ratio: 0.05;\n  left: 40%;\n}\n.hand__card:nth-child(3):nth-last-child(2) {\n  --rotation-x-ratio: -0.05;\n  left: 60%;\n}\n.hand__card:nth-child(4):nth-last-child(1) {\n  --translate-y: 10%;\n  --rotation-x-ratio: -0.1;\n  left: 80%;\n}\n.hand__card:nth-child(2):nth-last-child(4) {\n  --translate-y: 10%;\n  --rotation-x-ratio: 0.1;\n  left: 20%;\n}\n.hand__card:nth-child(3):nth-last-child(3) {\n  --rotation-x-ratio: 0.05;\n  left: 40%;\n}\n.hand__card:nth-child(4):nth-last-child(2) {\n  --rotation-x-ratio: -0.05;\n  left: 60%;\n}\n.hand__card:nth-child(5):nth-last-child(1) {\n  --translate-y: 10%;\n  --rotation-x-ratio: -0.1;\n  left: 80%;\n}\n\n/*# sourceMappingURL=pen.vue.map */", map: {"version":3,"sources":["pen.vue","/tmp/codepen/vuejs/src/pen.vue"],"names":[],"mappings":"AAAA,gBAAgB;ACmWhB;EACA,oBAAA;EACA,4CAAA;EAEA,sBAAA;EACA,0BAAA;EACA,0BAAA;EAEA,4BAAA;EACA,0BAAA;EAEA,4BAAA;EAEA,2BAAA;ADrWA;ACwWA;;EAEA,WAAA;EACA,YAAA;ADrWA;ACwWA;EACA,SAAA;EACA,8BAAA;EACA,gBAAA;ADrWA;ACwWA;;EAEA,aAAA;EACA,iBAAA;EACA,mBAAA;ADrWA;ACwWA;EACA,OAAA;EACA,sBAAA;EACA,uBAAA;ADrWA;ACwWA;EACA,sCAAA;EACA,kBAAA;EACA,eAAA;EACA,cAAA;EACA,wBAAA;EACA,0BAAA;EACA,4BAAA;EACA,4BAAA;EACA,kBAAA;ADrWA;ACyWA;EAEA,+BAAA;ADxWA;AC2WA;EAEA,6BAAA;AD1WA;AC6WA;EAEA,kBAAA;EACA,SAfA;EAgBA,UAhBA;EAiBA,WAjBA;EAkBA,YAlBA;EAmBA,oBAAA;EACA,yCAAA;EACA,2BAAA;EACA,qCAAA;AD5WA;AC+WA;EACA,kCAAA;EACA,wCAAA;EACA,+OACA;EAcA,kCAAA;AD3XA;AC8XA;EACA,cAAA;EACA,aAAA;EACA,iBAAA;EACA,uBAAA;EACA,mBAAA;EACA,oCAAA;EACA,kCAAA;AD5XA;AC+XA;EACA,gBAAA;AD7XA;ACgYA;EACA,kBAAA;EACA,SAAA;EACA,QAAA;EACA,cAAA;EACA,aAAA;EACA,iBAAA;EACA,mBAAA;EACA,oBAAA;EACA,cAAA;AD9XA;ACgYA;EACA,YAAA;EACA,WAAA;EACA,MAAA;EACA,OAAA;EACA,eAAA;AD9XA;ACiYA;EACA,yBAAA;AD/XA;ACiYA;EACA,gBAAA;EACA,wBAAA;AD/XA;ACqYA;EACA,kCAAA;ADlYA;ACoYA;EACA,iFACA;ADnYA;ACyYA;EACA,kBAAA;EACA,oCAAA;EACA,0BAAA;EACA,mBAAA;EACA,4BAAA;ADtYA;ACwYA;EACA,oBAAA;EACA,qBAAA;EACA,oBAAA;EACA,iBAAA;EACA,kBAAA;EAEA,kBAAA;EACA,MAAA;EACA,8JACA;EAWA,8BAAA;EACA,iCAAA;ADlZA;ACoZA;EACA,oBAAA;ADlZA;ACqZA;EACA,oBAAA;ADnZA;ACsZA;EAEA,mBAAA;EACA,kBAAA;EACA,qBAAA;EACA,iBAAA;EACA,kBAAA;EAEA,SAAA;EACA,UAAA;EACA,oBAAA;ADtZA;ACwZA;;;EAEA,oCAAA;ADrZA;ACwZA;EACA,gBAAA;EACA,UAAA;ADtZA;ACwZA;EACA,UAAA;ADtZA;ACkaA;EASA,SAAA;ADxaA;AC+ZA;EAEA,kBAAA;EACA,uBAAA;EAMA,oBAAA;ADnaA;AC0ZA;EAEA,kBAAA;EACA,wBAAA;EAMA,oBAAA;AD9ZA;ACqZA;EAEA,kBAAA;EACA,uBAAA;EAMA,SAAA;ADzZA;ACgZA;EASA,SAAA;ADtZA;AC6YA;EAEA,kBAAA;EACA,wBAAA;EAMA,SAAA;ADjZA;ACwYA;EAEA,kBAAA;EACA,uBAAA;EAMA,SAAA;AD5YA;ACmYA;EAMA,wBAAA;EAGA,SAAA;ADxYA;AC+XA;EAMA,yBAAA;EAGA,SAAA;ADpYA;AC2XA;EAEA,kBAAA;EACA,wBAAA;EAMA,SAAA;AD/XA;ACsXA;EAEA,kBAAA;EACA,uBAAA;EAMA,SAAA;AD1XA;ACiXA;EAMA,wBAAA;EAGA,SAAA;ADtXA;AC6WA;EAMA,yBAAA;EAGA,SAAA;ADlXA;ACyWA;EAEA,kBAAA;EACA,wBAAA;EAMA,SAAA;AD7WA;;AAEA,kCAAkC","file":"pen.vue","sourcesContent":["@charset \"UTF-8\";\nhtml {\n  --card-width: 20vmin;\n  --card-height: calc(var(--card-width) * 1.6);\n  --color-table: #4d5265;\n  --color-card-face: #ecebf3;\n  --color-card-back: #920114;\n  --color-suits-black: #0c120c;\n  --color-suits-red: #c20114;\n  --color-deck-shadow: #401111;\n  font-family: Georgia, serif;\n}\n\nbody,\nhtml {\n  width: 100%;\n  \n}\n\nbody {\n  margin: 0;\n \n  ;\n}\n\nbody,\n.container {\n  display: flex;\n  flex-flow: column;\n  align-items: center;\n}\n\n.container {\n  flex: 1;\n  padding-bottom: 10vmax;\n  justify-content: center;\n}\n\n.card {\n  font-size: calc(var(--card-width) / 5);\n  position: relative;\n  cursor: pointer;\n  display: block;\n  width: var(--card-width);\n  height: var(--card-height);\n  transform-style: preserve-3d;\n  backface-visibility: visible;\n  perspective: 100px;\n}\n.card--♠, .card--♣ {\n  color: var(--color-suits-black);\n}\n.card--♥, .card--♦ {\n  color: var(--color-suits-red);\n}\n.card__face, .card__back {\n  position: absolute;\n  top: 10px;\n  left: 10px;\n  right: 10px;\n  bottom: 10px;\n  border-radius: 0.4em;\n  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.5);\n  backface-visibility: hidden;\n  transition: box-shadow 600ms ease-out;\n}\n.card__back {\n  transform: rotate3d(0, 1, 0, 0deg);\n  background-color: var(--color-card-back);\n  background-image: repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) 10%, transparent 0%, transparent 20%), repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) 10%, transparent 0%, transparent 20%);\n  background-position: center center;\n}\n.card__face {\n  padding: 0.5em;\n  display: flex;\n  flex-flow: column;\n  justify-content: center;\n  align-items: center;\n  transform: rotate3d(0, 1, 0, 180deg);\n  background: var(--color-card-face);\n}\n.card__suit {\n  font-size: 2.5em;\n}\n.card__value {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  padding: 0.2em;\n  display: flex;\n  flex-flow: column;\n  align-items: center;\n  transform: scale(-1);\n  line-height: 1;\n}\n.card__value:first-of-type {\n  bottom: auto;\n  right: auto;\n  top: 0;\n  left: 0;\n  transform: none;\n}\n.card__value::before {\n  content: attr(data-value);\n}\n.card__value::after {\n  font-size: 0.7em;\n  content: attr(data-suit);\n}\n\n.deck.card {\n  transform: rotate3d(0, 1, 0, 0deg);\n}\n.deck.card .card__back {\n  box-shadow: 0 6px 0 0 var(--color-deck-shadow), 2px 6px 16px 0 rgba(0, 0, 0, 0.6);\n}\n\n.hand {\n  position: relative;\n  width: calc(var(--card-width) * 5.5);\n  height: var(--card-height);\n  ;\n  perspective-origin: 50% 100%;\n}\n.hand__card {\n  --base-offset-y: 20%;\n  --rotation-x-ratio: 0;\n  --translate-z: 100px;\n  --translate-y: 0%;\n  --rotation-z: 0deg;\n  position: absolute;\n  top: 0;\n  transform: translate3d(-50%, calc(var(--base-offset-y) + var(--translate-y)), var(--translate-z)) rotate3d(var(--rotation-x-ratio), 1, 0.1, var(--rotation-z));\n  transition: all 620ms ease-out;\n  will-change: left, top, transform;\n}\n.hand__card:hover {\n  --translate-z: 150px;\n}\n.hand__card--flipped {\n  --rotation-z: 180deg;\n}\n.hand__card--enter.hand__card:nth-child(n):nth-last-child(n), .hand__card--leave.hand__card:nth-child(n):nth-last-child(n) {\n  --base-offset-y: 0%;\n  --rotation-z: 0deg;\n  --rotation-x-ratio: 0;\n  --translate-y: 0%;\n  --translate-z: 0px;\n  left: 50%;\n  top: -100%;\n  pointer-events: none;\n}\n.hand__card--enter.hand__card:nth-child(n):nth-last-child(n) .card__face,\n.hand__card--enter.hand__card:nth-child(n):nth-last-child(n) .card__back, .hand__card--leave.hand__card:nth-child(n):nth-last-child(n) .card__face,\n.hand__card--leave.hand__card:nth-child(n):nth-last-child(n) .card__back {\n  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);\n}\n.hand__card--enter {\n  transition: none;\n  z-index: 1;\n}\n.hand__card--leave {\n  z-index: 1;\n}\n.hand__card:nth-child(1):nth-last-child(1) {\n  left: 50%;\n}\n.hand__card:nth-child(1):nth-last-child(2) {\n  --translate-y: 10%;\n  --rotation-x-ratio: 0.1;\n  left: 33.3333333333%;\n}\n.hand__card:nth-child(2):nth-last-child(1) {\n  --translate-y: 10%;\n  --rotation-x-ratio: -0.1;\n  left: 66.6666666667%;\n}\n.hand__card:nth-child(1):nth-last-child(3) {\n  --translate-y: 10%;\n  --rotation-x-ratio: 0.1;\n  left: 25%;\n}\n.hand__card:nth-child(2):nth-last-child(2) {\n  left: 50%;\n}\n.hand__card:nth-child(3):nth-last-child(1) {\n  --translate-y: 10%;\n  --rotation-x-ratio: -0.1;\n  left: 75%;\n}\n.hand__card:nth-child(1):nth-last-child(4) {\n  --translate-y: 10%;\n  --rotation-x-ratio: 0.1;\n  left: 20%;\n}\n.hand__card:nth-child(2):nth-last-child(3) {\n  --rotation-x-ratio: 0.05;\n  left: 40%;\n}\n.hand__card:nth-child(3):nth-last-child(2) {\n  --rotation-x-ratio: -0.05;\n  left: 60%;\n}\n.hand__card:nth-child(4):nth-last-child(1) {\n  --translate-y: 10%;\n  --rotation-x-ratio: -0.1;\n  left: 80%;\n}\n.hand__card:nth-child(2):nth-last-child(4) {\n  --translate-y: 10%;\n  --rotation-x-ratio: 0.1;\n  left: 20%;\n}\n.hand__card:nth-child(3):nth-last-child(3) {\n  --rotation-x-ratio: 0.05;\n  left: 40%;\n}\n.hand__card:nth-child(4):nth-last-child(2) {\n  --rotation-x-ratio: -0.05;\n  left: 60%;\n}\n.hand__card:nth-child(5):nth-last-child(1) {\n  --translate-y: 10%;\n  --rotation-x-ratio: -0.1;\n  left: 80%;\n}\n\n/*# sourceMappingURL=pen.vue.map */","<template>\n  <div class=\"container\">\n    <div class=\"deck card\" \n         @click=\"takeCard\">\n      <div class=\"card__back\"></div>\n    </div>\n    <transition-group name=\"hand-card\" \n                      tag=\"div\"\n                      :css=\"false\"\n                      @enter=\"enter\"\n                      @leave=\"leave\"\n                      class=\"hand\">\n      <div v-for=\"(card, index) in cards\" \n           :key=\"card.id\" \n           class=\"hand__card card\"\n           :class=\"['card--' + card.suit]\"\n           @click=\"dropCard(card.id)\">\n        <div class=\"card__face\">\n          <div class=\"card__value\" \n               v-for=\"i in 2\"\n               :data-value=\"card.value\"\n               :data-suit=\"card.suit\"></div>\n          <div class=\"card__suit\">{{ card.suit }}</div>\n        </div>\n        <div class=\"card__back\"></div>\n      </div>\n    </transition-group>\n  </div>\n</template>\n\n<script>\n  const SETTLE_DURATION = 100;\n  const DROP_DURATION = 200;\n  const CARDS_AMOUNT = 4;\n  // spades, hearts, diamons, clubs\n  const SUITS = ['♠', '♥', '♦', '♣'];\n  const VALUES = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];\n  const CARDS = VALUES.flatMap((value, i) => SUITS.map((suit, j) => ({\n    id: `${i}-${j}`,\n    value,\n    suit\n  })));\n  \n  export default {\n    data() {\n      return {\n        lastCardId: 0,\n        cards: [],\n        isDeckEnabled: true,\n      };\n    },\n    methods: {\n      enter(el, done) {\n        el.classList.add('hand__card--enter');\n        el.classList.add('hand__card--flipped');\n        el.style.pointerEvents = 'none';\n        setTimeout(() => {\n          el.addEventListener('transitionend', () => {\n            el.style.pointerEvents = 'all';\n            done();\n          }, false);\n          el.classList.remove('hand__card--enter');\n        }, 0);\n      },\n      leave(el, done) {\n        this.isDeckEnabled = false;\n        el.classList.add('hand__card--leave');\n        el.classList.remove('hand__card--flipped');\n        const onLeave = () => {\n          el.removeEventListener('transitionend', onLeave);\n          this.isDeckEnabled = true;\n          setTimeout(done, SETTLE_DURATION);\n        };\n        el.addEventListener('transitionend', onLeave, false);\n      },\n      takeCard() {\n        if (!this.isDeckEnabled) { return; }\n        if (this.cards.length === CARDS_AMOUNT) {\n          this.cards.shift();\n        }\n        \n        const randomIndex = Math.floor(Math.random() * CARDS.length);\n        \n        this.cards.push(...CARDS.splice(randomIndex, 1));\n      },\n      dropCard(id) {\n        const dropId = this.cards.findIndex(card => card.id === id);\n        \n        if (dropId !== -1) {\n          CARDS.push(...this.cards.splice(dropId, 1));\n        }\n      }\n    },\n    mounted() {\n      let amount = 0;\n      const intervalId = setInterval(() => {\n        if (amount++ === CARDS_AMOUNT) {\n          clearInterval(intervalId);\n          return;\n        }\n        \n        this.takeCard();\n      }, DROP_DURATION)\n    },\n  };\n</script>\n\n<style lang=\"scss\">\n  $cards-amount: 4;\n  \n  html {\n    --card-width: 20vmin;\n    --card-height: calc(var(--card-width) * 1.6);\n    \n    --color-table: #4d5265;\n    --color-card-face: #ecebf3;\n    --color-card-back: #920114;\n    \n    --color-suits-black: #0c120c;\n    --color-suits-red: #c20114;\n    \n    --color-deck-shadow: #401111;\n    \n    font-family: Georgia, serif;\n  }\n  \n  body,\n  html {\n    width: 100%;\n    \n  }\n\n  body {\n    margin: 0;\n   \n    ;\n  }\n  \n  body,\n  .container {\n    display: flex;\n    flex-flow: column;\n    align-items: center;\n  }\n  \n  .container {\n    flex: 1;\n    padding-bottom: 10vmax;\n    justify-content: center;\n  }\n  \n  .card {\n    font-size: calc(var(--card-width) / 5);\n    position: relative;\n    cursor: pointer;\n    display: block;\n    width: var(--card-width);\n    height: var(--card-height);\n    transform-style: preserve-3d;\n    backface-visibility: visible;\n    perspective: 100px;\n    \n    $offset: 10px;\n    \n    &--♠, \n    &--♣ {\n      color: var(--color-suits-black);\n    }\n\n    &--♥,\n    &--♦ {\n      color: var(--color-suits-red);\n    }\n    \n    &__face,\n    &__back {\n      position: absolute;\n      top: $offset;\n      left: $offset;\n      right: $offset;\n      bottom: $offset;\n      border-radius: 0.4em;\n      box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.5);\n      backface-visibility: hidden;\n      transition: box-shadow 600ms ease-out;\n    }\n    \n    &__back {\n      transform: rotate3d(0, 1, 0, 0deg);\n      background-color: var(--color-card-back);\n      background-image: \n        repeating-linear-gradient(\n          45deg,\n          rgba(0,0,0,0.3),\n          rgba(0,0,0,0.3) 10%,\n          transparent 0%,\n          transparent 20%\n        ),\n        repeating-linear-gradient(\n          -45deg,\n          rgba(0,0,0,0.3),\n          rgba(0,0,0,0.3) 10%,\n          transparent 0%,\n          transparent 20%\n        );\n      background-position: center center;\n    }\n    \n    &__face {\n      padding: 0.5em;\n      display: flex;\n      flex-flow: column;\n      justify-content: center;\n      align-items: center;\n      transform: rotate3d(0, 1, 0, 180deg);\n      background: var(--color-card-face);\n    }\n    \n    &__suit {\n      font-size: 2.5em;\n    }\n    \n    &__value {\n      position: absolute;\n      bottom: 0;\n      right: 0;\n      padding: 0.2em;\n      display: flex;\n      flex-flow: column;\n      align-items: center;\n      transform: scale(-1);\n      line-height: 1;\n      \n      &:first-of-type {\n        bottom: auto;\n        right: auto;\n        top: 0;\n        left: 0;\n        transform: none;\n      }\n      \n      &::before {\n        content: attr(data-value);\n      }\n      &::after {\n        font-size: 0.7em;\n        content: attr(data-suit);\n      }\n    }\n  }\n  \n  .deck {\n    &.card {\n      transform: rotate3d(0, 1, 0, 0deg);\n      \n      .card__back {\n        box-shadow: \n          0 6px 0 0 var(--color-deck-shadow),\n          2px 6px 16px 0 rgba(0, 0, 0, 0.6)\n      }\n    }\n  }\n  \n  .hand {\n    position: relative;\n    width: calc(var(--card-width) * #{ $cards-amount + 1.5 });\n    height: var(--card-height);\n    ;\n    perspective-origin: 50% 100%;\n    \n    &__card {\n      --base-offset-y: 20%;\n      --rotation-x-ratio: 0;\n      --translate-z: 100px;\n      --translate-y: 0%;\n      --rotation-z: 0deg;\n      \n      position: absolute;\n      top: 0;\n      transform: \n        translate3d(\n          -50%, \n          calc(var(--base-offset-y) + var(--translate-y)), \n          var(--translate-z)\n        )\n        rotate3d(\n          var(--rotation-x-ratio), \n          1, \n          0.1, \n          var(--rotation-z)\n        );\n      transition: all 620ms ease-out;  \n      will-change: left, top, transform;\n      \n      &:hover {\n        --translate-z: 150px;\n      }\n      \n      &--flipped {\n        --rotation-z: 180deg;\n      }\n      \n      &--enter.hand__card:nth-child(n):nth-last-child(n),\n      &--leave.hand__card:nth-child(n):nth-last-child(n) {\n        --base-offset-y: 0%;\n        --rotation-z: 0deg;\n        --rotation-x-ratio: 0;\n        --translate-y: 0%;\n        --translate-z: 0px;\n        \n        left: 50%;\n        top: -100%;\n        pointer-events: none;\n        \n        .card__face,\n        .card__back {\n          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);\n        }\n      }\n      &--enter {\n        transition: none;\n        z-index: 1;\n      }\n      &--leave {\n        z-index: 1;\n      }\n      \n      $offset-y: 10%;\n      $base-x-ratio: 0.1;\n      \n      @for $i from 1 through ($cards-amount + 1) {\n        $amount: if($i > $cards-amount, $cards-amount, $i);\n        $shift: if($i > $cards-amount, 1, 0);\n        $step: 100% / ($amount + 1);\n        \n        @for $j from 1 through $amount {\n          &:nth-child(#{ $j + $shift }):nth-last-child(#{ $i - $j + 1 - $shift }) {\n            @if ($i > 1 and ($j == 1 or $j == $amount)) {\n              --translate-y: #{ $offset-y };      \n              --rotation-x-ratio: #{ $base-x-ratio * if($j == 1, 1, -1) };\n            }\n            @if ($i > 3 and ($j == 2 or $j == 3)) {\n              --rotation-x-ratio: #{ $base-x-ratio * if($j == 2, 1, -1) / 2 };\n            }\n            \n            left: $step * $j;\n          }\n        }\n      }\n    } \n  }\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

export default __vue_component__;