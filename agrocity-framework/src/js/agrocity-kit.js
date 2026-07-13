/**
 * @file Agrocity Kit — Mini-framework UI vanilla (sin dependencias)
 * @version 1.2.0
 * @license MIT
 * @author Agrocity Framework
 *
 * @module AgrocityKit
 * @description Framework UI ligero inspirado en Bootstrap 5 y Material Design,
 * optimizado para aplicaciones agrícolas y de gestión de recursos naturales.
 * Expone un único objeto global: window.AgrocityKit
 *
 * API pública:
 *   AgrocityKit.select(selector, options)     -> Inicializa custom select(s)
 *   AgrocityKit.dataTable(selector, options)   -> Inicializa data table(s)
 *   AgrocityKit.theme(mode)                     -> 'light' | 'dark' | 'toggle'
 *   AgrocityKit.destroy(selector)               -> Destruye instancia(s)
 *   AgrocityKit.getInstance(el)                 -> Devuelve instancia asociada
 *   AgrocityKit.autoInit()                      -> Inicializa por data-attributes
 *   AgrocityKit.modal/offcanvas/collapse/dropdown/tab/toast/tooltip/popover/carousel/scrollspy/alert/button
 *   AgrocityKit.showToast(message, options)     -> Crea toast programáticamente
 *   AgrocityKit.loader(show, [messages])         -> Muestra/oculta loader pantalla completa
 *   AgrocityKit.alert(msg)                        -> Diálogo alerta
 *   AgrocityKit.confirm(msg, callback)            -> Diálogo confirmación
 *   AgrocityKit.prompt(msg, default, callback)    -> Diálogo prompt
 *
 * Secciones:
 *   1. Helpers   (debounce, DOM, eventos, utilidades)
 *   2. Core      (registro de instancias, objeto global, theme, destroy)
 *   3. Select    (clase AkSelect - búsqueda, múltiple, remoto, accesible)
 *   4. DataTable (clase AkDataTable - paginación, orden, filtro, export CSV)
 *   5. Plugins   (Bootstrap parity: modal, offcanvas, collapse, dropdown, tab, toast, tooltip, popover, carousel, scrollspy, alert, button)
 *   6. Auto-init (data-ak-* attributes)
 *
 * Opcional:
 *   agrocity-icons.js   -> AgrocityKit.icon(name, size) para +50 iconos SVG
 */
/* ============================================================================
 * AGROCITY KIT — Mini-framework UI (vanilla JS ES6+, sin dependencias)
 * ----------------------------------------------------------------------------
 * Expone un único objeto global: window.AgrocityKit
 *
 * API pública:
 *   AgrocityKit.select(selector, options)     -> inicializa custom select(s)
 *   AgrocityKit.dataTable(selector, options)   -> inicializa data table(s)
 *   AgrocityKit.theme(mode)                     -> 'light' | 'dark' | 'toggle'
 *   AgrocityKit.destroy(selector)               -> destruye instancia(s)
 *   AgrocityKit.getInstance(el)                 -> devuelve instancia asociada
 *   AgrocityKit.autoInit()                      -> inicializa por data-attributes
 *
 * Secciones:
 *   1. Helpers   (debounce, DOM, eventos, utilidades)
 *   2. Core      (registro de instancias, objeto global, theme, destroy)
 *   3. Select    (clase AkSelect)
 *   4. DataTable (clase AkDataTable)
 *   5. Auto-init (data-ak-select / data-ak-datatable)
 * ============================================================================ */
(function (window, document) {
  "use strict";

  /* ==========================================================================
   * 1. HELPERS
   * ======================================================================== */
  const Helpers = {
    /** Debounce: retrasa la ejecución hasta que pasen `wait` ms sin llamadas. */
    debounce(fn, wait = 150) {
      let t;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    },

    /** Crea un elemento con atributos y contenido. */
    el(tag, attrs = {}, children = []) {
      const node = document.createElement(tag);
      for (const key in attrs) {
        if (key === "class") node.className = attrs[key];
        else if (key === "html") node.innerHTML = attrs[key];
        else if (key === "text") node.textContent = attrs[key];
        else if (key.startsWith("on") && typeof attrs[key] === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
        } else if (attrs[key] != null && attrs[key] !== false) {
          node.setAttribute(key, attrs[key]);
        }
      }
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null) return;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
      return node;
    },

    /** Resuelve un selector/elemento/lista a un array de elementos. */
    resolveElements(target) {
      if (!target) return [];
      if (typeof target === "string") {
        return Array.from(document.querySelectorAll(target));
      }
      if (target instanceof Element) return [target];
      if (target instanceof NodeList || Array.isArray(target)) {
        return Array.from(target);
      }
      return [];
    },

    /** Dispara un CustomEvent en el elemento con detalle dado. */
    emit(el, name, detail = {}) {
      el.dispatchEvent(
        new CustomEvent(name, { detail, bubbles: true, cancelable: true })
      );
    },

    /** Escapa texto para inserción segura en HTML. */
    escapeHtml(value) {
      if (value == null) return "";
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    },

    /** Warning en consola sin romper la ejecución. */
    warn(msg) {
      if (window.console && console.warn) console.warn("[AgrocityKit] " + msg);
    },

    /** Comparación natural para ordenamiento (números y strings). */
    compare(a, b) {
      if (a == null) a = "";
      if (b == null) b = "";
      const na = parseFloat(a);
      const nb = parseFloat(b);
      if (!isNaN(na) && !isNaN(nb) && String(a).trim() !== "" && String(b).trim() !== "") {
        return na - nb;
      }
      return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
    },

    /** Detecta viewport móvil. */
    isMobile() {
      return window.matchMedia("(max-width: 640px)").matches;
    },

    /** Inicializa validación reactiva en un formulario. */
    formValidationInit(target, options) {
      const forms = Helpers.resolveElements(target);
      forms.forEach(form => {
        if (form._akFvInit) return;
        form._akFvInit = true;

        const opts = options || {};

        // Auto-agregar * a labels de campos required que falten
        form.querySelectorAll('.ak-form-field-content [required]').forEach(function(field) {
          var content = field.closest('.ak-form-field-content');
          if (!content) return;
          var label = content.querySelector('.ak-form-label');
          if (!label) return;
          if (label.querySelector('.ak-asterisk-field')) return;
          var span = document.createElement('span');
          span.className = 'ak-asterisk-field';
          span.textContent = '*';
          label.appendChild(span);
        });

        const getContainer = (el) => {
          if (el.type === 'file' || el.closest('.ak-form-file')) {
            return el.closest('.ak-form-file') || el;
          }
          if (el.hasAttribute('data-ak-select')) {
            var next = el.nextElementSibling;
            return (next && next.classList.contains('ak-select')) ? next : el;
          }
          if (el.closest('.ak-select')) {
            return el.closest('.ak-select');
          }
          if (el.closest('.ak-datepicker')) {
            return el.closest('.ak-datepicker');
          }
          if (el.closest('.ak-timepicker')) {
            return el.closest('.ak-timepicker');
          }
          if (el.closest('.ak-password-wrap')) {
            return el.closest('.ak-password-wrap');
          }
          if (el.closest('.ak-input-group')) {
            return el.closest('.ak-input-group');
          }
          if (el.type === 'checkbox' || el.type === 'radio') {
            return el.closest('.ak-form-check') || el;
          }
          return el;
        };

        const getValue = (el) => {
          if (el.type === 'file') {
            return el.files && el.files.length > 0 ? 'filled' : '';
          }
          if (el.closest('.ak-form-file')) {
            const input = el.closest('.ak-form-file').querySelector('.ak-form-file-input');
            return input && input.files && input.files.length > 0 ? 'filled' : '';
          }
          if (el.hasAttribute('data-ak-select')) {
            return el.value || '';
          }
          if (el.type === 'checkbox') {
            return el.checked ? (el.value || 'on') : '';
          }
          if (el.type === 'radio') {
            if (!el.name) return el.checked ? (el.value || 'on') : '';
            const form = el.form;
            const selector = 'input[type="radio"][name="' + el.name.replace(/["\\]/g, '\\$&') + '"]';
            const radios = form ? form.querySelectorAll(selector) : document.querySelectorAll(selector);
            for (var i = 0; i < radios.length; i++) {
              if (radios[i].checked) return radios[i].value || 'on';
            }
            return '';
          }
          return el.value;
        };

        const getControl = (el) => {
          if (el.hasAttribute('data-ak-select')) {
            var container = el.nextElementSibling;
            if (!container || !container.classList.contains('ak-select')) container = el;
            var search = container.querySelector('.ak-select__search');
            return search || el;
          }
          return el;
        };

        const getMsg = (el, rule, fallback) => {
          return el.getAttribute('data-ak-msg-' + rule) || el.getAttribute('data-ak-msg') || fallback;
        };

        const parseRules = (el) => {
          const str = el.getAttribute('data-ak-validate');
          if (!str) return {};
          return str.split('|').reduce((acc, r) => {
            const [k, ...v] = r.split(':');
            acc[k] = v.length ? v.join(':') : true;
            return acc;
          }, {});
        };

        const validateField = (el) => {
          const rules = parseRules(el);
          if (!Object.keys(rules).length) return true;

          const container = getContainer(el);
          const value = getValue(el);
          const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
          let valid = true;
          let errorMsg = '';

          if (rules.required && isEmpty) {
            valid = false;
            errorMsg = getMsg(el, 'required', 'Este campo es obligatorio');
          }

          if (valid && rules.email && !isEmpty) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              valid = false;
              errorMsg = getMsg(el, 'email', 'Formato de email inválido');
            }
          }

          if (valid && rules.min && !isEmpty) {
            if (el.type === 'number') {
              if (parseFloat(value) < parseFloat(rules.min)) {
                valid = false;
                errorMsg = getMsg(el, 'min', 'Valor mínimo ' + rules.min);
              }
            } else if (value.length < parseInt(rules.min, 10)) {
              valid = false;
              errorMsg = getMsg(el, 'min', 'Mínimo ' + rules.min + ' caracteres');
            }
          }

          if (valid && rules.max && !isEmpty) {
            if (el.type === 'number') {
              if (parseFloat(value) > parseFloat(rules.max)) {
                valid = false;
                errorMsg = getMsg(el, 'max', 'Valor máximo ' + rules.max);
              }
            } else if (value.length > parseInt(rules.max, 10)) {
              valid = false;
              errorMsg = getMsg(el, 'max', 'Máximo ' + rules.max + ' caracteres');
            }
          }

          if (valid && rules.pattern && !isEmpty) {
            try {
              if (!new RegExp(rules.pattern).test(value)) {
                valid = false;
                errorMsg = getMsg(el, 'pattern', 'Formato inválido');
              }
            } catch (_) { /* ignore invalid regex */ }
          }

          // Actualizar clases visuales (solo error)
          container.classList.toggle('ak-is-invalid', !valid);
          container.classList.remove('ak-is-valid');

          // Radio group: limpiar error de todos los radios del mismo grupo al validar uno
          if (el.type === 'radio' && valid && el.name) {
            var radios = form.querySelectorAll('input[type="radio"][name="' + el.name.replace(/["\\]/g, '\\$&') + '"]');
            radios.forEach(function(r) {
              if (r !== el) {
                var c = getContainer(r);
                c.classList.remove('ak-is-invalid');
                c.classList.remove('ak-is-valid');
              }
            });
          }

          // Mostrar feedback y label (auto-crea si no existe)
          const parent = container.parentElement;
          if (!parent) return valid;

          const label = parent.querySelector('.ak-form-label');
          if (label) {
            label.classList.toggle('ak-text-danger', !valid);
            if (valid) label.classList.remove('ak-text-success');
          }

          // Custom Select: usar sistema de error nativo (.ak-has-error + .ak-select__error-msg)
          if (container.classList.contains('ak-select')) {
            container.classList.toggle('ak-has-error', !valid);
            const errMsg = container.querySelector('.ak-select__error-msg');
            if (errMsg) errMsg.textContent = !valid ? errorMsg : '';
            return valid;
          }

          let invalidEl = parent.querySelector('.ak-invalid-feedback');

          if (!invalidEl && parent !== form) {
            invalidEl = document.createElement('div');
            invalidEl.className = 'ak-invalid-feedback';
            parent.appendChild(invalidEl);
          }

          if (!valid && invalidEl) {
            invalidEl.textContent = errorMsg;
            invalidEl.style.display = 'block';
          } else if (invalidEl) {
            invalidEl.style.display = 'none';
          }

          return valid;
        };

        // Eventos en tiempo real
        form.querySelectorAll('[data-ak-validate]').forEach(el => {
          const events = el.type === 'file' || el.closest('.ak-form-file') || el.type === 'checkbox' || el.type === 'radio'
            ? ['change']
            : ['blur', 'input', 'change'];
          events.forEach(evt => {
            el.addEventListener(evt, () => {
              if (form.classList.contains('ak-was-validated') ||
                  el.classList.contains('ak-is-invalid') ||
                  el.classList.contains('ak-is-valid')) {
                validateField(el);
              }
            });
          });
        });

        // Submit handler
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          form.classList.add('ak-was-validated');
          const errors = [];
          form.querySelectorAll('[data-ak-validate]').forEach(el => {
            if (!validateField(el)) errors.push(el);
          });

          if (errors.length) {
            if (opts.onError) opts.onError(form, errors);
            const first = errors[0];
            const input = getControl(first);
            if (input && input.focus) input.focus();
            return;
          }

          if (opts.onSuccess) {
            opts.onSuccess(form);
          } else if (form.getAttribute('action')) {
            form.submit();
          } else {
            Helpers.emit(form, 'ak:form:valid', { form });
          }
        });
      });
    },
  };

  /* ==========================================================================
   * 2. CORE — registro de instancias y objeto global
   * ======================================================================== */
  const registry = new WeakMap(); // elemento -> instancia
  let uid = 0;
  const nextId = () => "ak-" + ++uid;

  const AgrocityKit = {
    version: "1.2.0",

    /** Inicializa uno o varios custom selects. Devuelve instancia o array. */
    select(target, options = {}) {
      const els = Helpers.resolveElements(target);
      if (!els.length) {
        Helpers.warn("select(): no se encontró ningún elemento para '" + target + "'.");
        return null;
      }
      const instances = els.map((el) => {
        if (registry.has(el)) return registry.get(el);
        try {
          const inst = new AkSelect(el, options);
          registry.set(el, inst);
          return inst;
        } catch (err) {
          Helpers.warn("Error al inicializar select: " + err.message);
          return null;
        }
      });
      return instances.length === 1 ? instances[0] : instances;
    },

    /** Inicializa una o varias data tables. */
    dataTable(target, options = {}) {
      const els = Helpers.resolveElements(target);
      if (!els.length) {
        Helpers.warn("dataTable(): no se encontró ningún elemento para '" + target + "'.");
        return null;
      }
      const instances = els.map((el) => {
        if (registry.has(el)) return registry.get(el);
        try {
          const inst = new AkDataTable(el, options);
          registry.set(el, inst);
          return inst;
        } catch (err) {
          Helpers.warn("Error al inicializar dataTable: " + err.message);
          return null;
        }
      });
      return instances.length === 1 ? instances[0] : instances;
    },

    /** Inicializa uno o varios datepickers. Devuelve instancia o array. */
    datepicker(target, options = {}) {
      const els = Helpers.resolveElements(target);
      if (!els.length) {
        Helpers.warn("datepicker(): no se encontró ningún elemento para '" + target + "'.");
        return null;
      }
      const instances = els.map((el) => {
        if (registry.has(el)) return registry.get(el);
        try {
          const inst = new AkDatePicker(el, options);
          registry.set(el, inst);
          return inst;
        } catch (err) {
          Helpers.warn("Error al inicializar datepicker: " + err.message);
          return null;
        }
      });
      return instances.length === 1 ? instances[0] : instances;
    },

    /** Inicializa uno o varios timepickers. Devuelve instancia o array. */
    timepicker(target, options = {}) {
      const els = Helpers.resolveElements(target);
      if (!els.length) {
        Helpers.warn("timepicker(): no se encontró ningún elemento para '" + target + "'.");
        return null;
      }
      const instances = els.map((el) => {
        if (registry.has(el)) return registry.get(el);
        try {
          const inst = new AkTimePicker(el, options);
          registry.set(el, inst);
          return inst;
        } catch (err) {
          Helpers.warn("Error al inicializar timepicker: " + err.message);
          return null;
        }
      });
      return instances.length === 1 ? instances[0] : instances;
    },

    /** Crea un rango de fechas vinculando dos DatePickers (inicio y fin). */
    dateRange(startInput, endInput, options = {}) {
      return new AkDateRange(startInput, endInput, options);
    },

    /** Crea un rango de horas vinculando dos TimePickers (inicio y fin). */
    timeRange(startInput, endInput, options = {}) {
      return new AkTimeRange(startInput, endInput, options);
    },

    /** API de datos geográficos de México (ESTADO → Municipio → Colonia) */
    geo: {
      baseUrl: 'https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/mxGeoJSON/',
      cache: {},
      loading: {},

      /**
       * @desc Carga la lista de estados desde index.json.
       * @returns {Promise<Array<{id:string, name:string}>>}
       */
      fetchStates() {
        if (this.cache.states) return Promise.resolve(this.cache.states);
        if (this.loading.states) return this.loading.states;
        this.loading.states = fetch(this.baseUrl + 'index.json')
          .then(function(r) { if (!r.ok) throw new Error('Error al cargar estados'); return r.json(); })
          .then(function(data) { this.cache.states = data; delete this.loading.states; return data; }.bind(this))
          .catch(function(e) { delete this.loading.states; Helpers.warn('geo.fetchStates: ' + e.message); return []; }.bind(this));
        return this.loading.states;
      },

      /**
       * @desc Carga los datos completos de un estado (municipios + colonias).
       * @param {string} stateId - Código INEGI del estado (01-32)
       * @returns {Promise<Object>}
       */
      fetchStateData(stateId) {
        if (this.cache[stateId]) return Promise.resolve(this.cache[stateId]);
        if (this.loading[stateId]) return this.loading[stateId];
        this.loading[stateId] = fetch(this.baseUrl + stateId + '.json')
          .then(function(r) { if (!r.ok) throw new Error('Error al cargar estado ' + stateId); return r.json(); })
          .then(function(data) { this.cache[stateId] = data; delete this.loading[stateId]; return data; }.bind(this))
          .catch(function(e) { delete this.loading[stateId]; Helpers.warn('geo.fetchStateData: ' + e.message); return { municipalities: [] }; }.bind(this));
        return this.loading[stateId];
      },

      /**
       * @desc Devuelve los municipios de un estado.
       * @param {string} stateId
       * @returns {Promise<Array<{id:string, name:string, neighborhoods?:Array}>>}
       */
      fetchMunicipalities(stateId) {
        return this.fetchStateData(stateId).then(function(data) { return data.municipalities || []; });
      },

      /**
       * @desc Devuelve las colonias de un municipio.
       * @param {string} stateId
       * @param {string} municipalityId
       * @returns {Promise<Array<{name:string, zip?:string}>>}
       */
      fetchNeighborhoods(stateId, municipalityId) {
        return this.fetchStateData(stateId).then(function(data) {
          var municipalities = data.municipalities || [];
          for (var i = 0; i < municipalities.length; i++) {
            var m = municipalities[i];
            if (m && m.id === municipalityId) return m.neighborhoods || [];
          }
          return [];
        });
      }
    },

    /** Cambia el tema: 'light', 'dark' o 'toggle'. Devuelve el tema aplicado. */
    theme(mode = "toggle") {
      const root = document.documentElement;
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      let next = mode;
      if (mode === "toggle") next = current === "dark" ? "light" : "dark";
      if (next === "dark") root.setAttribute("data-theme", "dark");
      else root.removeAttribute("data-theme");
      Helpers.emit(document, "ak:theme:change", { theme: next });
      if (next !== current) applyCustomTheme_();
      return next;
    },

    /**
     * @desc Configura colores personalizados globales para modo light y dark.
     *       Inyecta un bloque <style> con :root y [data-theme="dark"].
     *       Aplica inmediatamente según el tema actual.
     * @param {Object} config - { light: { --ak-primary: '...', ... }, dark: { ... } }
     */
    setTheme(config) {
      if (!config || (!config.light && !config.dark)) return;
      var expanded = {};
      if (config.light) expanded.light = deriveThemeVars_(config.light);
      if (config.dark) expanded.dark = deriveThemeVars_(config.dark);
      customThemeConfig_ = expanded;
      var style = document.getElementById("ak-custom-theme") || (function() {
        var s = document.createElement("style");
        s.id = "ak-custom-theme";
        document.head.appendChild(s);
        return s;
      })();
      var css = "";
      var buildRule = function(selector, vars) {
        if (!vars || !Object.keys(vars).length) return "";
        return selector + " {\n    " + Object.keys(vars).map(function(k) { return k + ": " + vars[k] + ";"; }).join("\n    ") + "\n  }";
      };
      if (expanded.light) css += buildRule(":root", expanded.light) + "\n";
      if (expanded.dark) css += buildRule('[data-theme="dark"]', expanded.dark);
      style.textContent = css;
      applyCustomTheme_();
    },

    /** Devuelve la instancia asociada a un elemento (o null). */
    getInstance(target) {
      const els = Helpers.resolveElements(target);
      return els.length ? registry.get(els[0]) || null : null;
    },

    /** Destruye instancia(s) y restaura el DOM original. */
    destroy(target) {
      const els = Helpers.resolveElements(target);
      els.forEach((el) => {
        const inst = registry.get(el);
        if (inst && typeof inst.destroy === "function") inst.destroy();
        registry.delete(el);
      });
    },

    /** Inicializa un elemento (o contenedor) con componentes data-ak-* de forma dinámica.
     *  Útil para elementos creados después de la carga inicial de la página.
     *  @param {Element|string} target - Elemento o selector contenedor con hijos data-ak-*
     *  @param {boolean} [deep=true] - Escanea también hijos profundos
     */
    initElement(target, deep = true) {
      const root = typeof target === "string" ? document.querySelector(target) : target;
      if (!root) { Helpers.warn("initElement(): elemento no encontrado."); return; }

      const scan = (el) => {
        const els = deep ? [el, ...el.querySelectorAll("*")] : [el];
        els.forEach((node) => {
          if (!(node instanceof HTMLElement) || registry.has(node)) return;

          if (node.tagName === "SELECT" && node.hasAttribute("data-ak-select")) {
            AgrocityKit.select(node, parseDataOptions(node, "akSelect"));
          }
          if (node.hasAttribute("data-ak-datatable")) {
            AgrocityKit.dataTable(node, {});
          }
          if (node.tagName === "INPUT" && node.hasAttribute("data-ak-datepicker")) {
            AgrocityKit.datepicker(node, parseDataOptions(node, "akDatepicker"));
          }
          if (node.tagName === "INPUT" && node.hasAttribute("data-ak-timepicker")) {
            AgrocityKit.timepicker(node, parseDataOptions(node, "akTimepicker"));
          }
          if (node.hasAttribute("data-ak-tooltip")) {
            AgrocityKit.tooltip(node, {
              placement: node.getAttribute("data-ak-placement") || "top",
            });
          }
          if (node.hasAttribute("data-ak-popover")) {
            AgrocityKit.popover(node, {
              placement: node.getAttribute("data-ak-placement") || "top",
              trigger: node.getAttribute("data-ak-trigger") || "click",
            });
          }
          if (node.hasAttribute("data-ak-carousel")) {
            AgrocityKit.carousel(node, {
              interval: Number(node.getAttribute("data-ak-interval")) || 5000,
            });
          }
          if (node.hasAttribute("data-ak-scrollspy")) {
            AgrocityKit.scrollspy(node, { target: node.getAttribute("data-ak-target") });
          }
          if (node.tagName === "FORM" && node.hasAttribute("data-ak-validation")) {
            AgrocityKit.formValidation("init", node, {});
          }
        });
      };

      // Si el root mismo tiene data-ak-file-input o es password, lo inicializamos
      if (root.tagName === "INPUT" && root.type === "password" && !root.hasAttribute("data-ak-no-toggle")) {
        AgrocityKit.passwordToggle(root);
      }
      if (root.matches && root.matches(".ak-form-file-input")) {
        AgrocityKit.fileInput(root.closest(".ak-form-file") ? root.closest(".ak-form-file").parentNode : document);
      }

      scan(root);

      // Vincular rangos fecha en contenedores data-ak-date-range
      const dateRangeContainers = root.hasAttribute("data-ak-date-range")
        ? [root]
        : [...root.querySelectorAll("[data-ak-date-range]")];
      dateRangeContainers.forEach((container) => {
        const inputs = container.querySelectorAll("input[data-ak-datepicker]");
        if (inputs.length === 2) {
          AgrocityKit.dateRange(inputs[0], inputs[1]);
        }
      });

      // Vincular rangos hora en contenedores data-ak-time-range
      const timeRangeContainers = root.hasAttribute("data-ak-time-range")
        ? [root]
        : [...root.querySelectorAll("[data-ak-time-range]")];
      timeRangeContainers.forEach((container) => {
        const inputs = container.querySelectorAll("input[data-ak-timepicker]");
        if (inputs.length === 2) {
          AgrocityKit.timeRange(inputs[0], inputs[1]);
        }
      });
    },

    /** Inicializa automáticamente por atributos data-*. */
    autoInit() {
      document.querySelectorAll("select[data-ak-select]").forEach((el) => {
        if (registry.has(el)) return;
        const opts = parseDataOptions(el, "akSelect");
        AgrocityKit.select(el, opts);
      });
      document.querySelectorAll("[data-ak-datatable]").forEach((el) => {
        if (registry.has(el)) return;
        AgrocityKit.dataTable(el, {});
      });
      document.querySelectorAll("input[data-ak-datepicker]").forEach((el) => {
        if (registry.has(el)) return;
        AgrocityKit.datepicker(el, parseDataOptions(el, "akDatepicker"));
      });
      document.querySelectorAll("input[data-ak-timepicker]").forEach((el) => {
        if (registry.has(el)) return;
        AgrocityKit.timepicker(el, parseDataOptions(el, "akTimepicker"));
      });
      document.querySelectorAll("[data-ak-date-range]").forEach((container) => {
        const inputs = container.querySelectorAll("input[data-ak-datepicker]");
        if (inputs.length === 2) {
          AgrocityKit.dateRange(inputs[0], inputs[1]);
        }
      });
      document.querySelectorAll("[data-ak-time-range]").forEach((container) => {
        const inputs = container.querySelectorAll("input[data-ak-timepicker]");
        if (inputs.length === 2) {
          AgrocityKit.timeRange(inputs[0], inputs[1]);
        }
      });
      AgrocityKit.passwordToggle();
      AgrocityKit.fileInput();
      document.querySelectorAll("form[data-ak-validation]").forEach((el) => {
        if (el._akFvInit) return;
        AgrocityKit.formValidation("init", el, {});
      });
    },

    /**
     * Inicializa toggles de visibilidad en campos password.
     * Agrega un botón con ícono de ojo para mostrar/ocultar contraseña.
     * Se omite si el input tiene data-ak-no-toggle o data-ak-password-toggle="false".
     * @param {string|Element|NodeList} [target] - Opcional: selector o elemento(s)
     * @returns {void}
     */
    passwordToggle(target) {
      const inputs = target
        ? Helpers.resolveElements(target).filter(el => el instanceof HTMLInputElement && el.type === "password")
        : document.querySelectorAll('input[type="password"]:not([data-ak-no-toggle]):not([data-ak-password-toggle="false"])');
      inputs.forEach((input) => {
        if (input.closest(".ak-password-wrap")) return; // ya inicializado
        const wrap = document.createElement("span");
        wrap.className = "ak-password-wrap";
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        const btn = Helpers.el("button", {
          type: "button",
          class: "ak-password-toggle",
          "aria-label": "Mostrar contraseña",
          onclick: function () {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            this.classList.toggle("ak-visible", !isPassword);
            this.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
          },
        });
        btn.innerHTML =
          '<svg class="ak-eye" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
          '<circle cx="12" cy="12" r="3"/>' +
          '</svg>' +
          '<svg class="ak-eye-off" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>' +
          '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>' +
          '<line x1="1" y1="1" x2="23" y2="23"/>' +
          '</svg>';
        wrap.appendChild(btn);
      });
    },

    /**
     * Inicializa inputs tipo file con diseño form-control.
     * Soporta drag & drop, botón limpiar (×), popover con lista
     * (data-ak-file-list) y validación (data-ak-max-files,
     * data-ak-max-size, data-ak-accept).
     * @param {Element|Document} [root] - Opcional: raíz donde buscar
     * @returns {void}
     */
    fileInput(root) {
      root = root || document;
      const parseSize = (str) => {
        const m = str.match(/^([\d.]+)\s*(B|KB|MB|GB)?$/i);
        if (!m) return parseInt(str, 10) || 0;
        const u = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 };
        return Math.round(parseFloat(m[1]) * (u[(m[2] || "B").toUpperCase()] || 1));
      };
      const fmtSize = (b) => {
        if (b >= 1073741824) return (b / 1073741824).toFixed(1) + " GB";
        if (b >= 1048576) return (b / 1048576).toFixed(1) + " MB";
        if (b >= 1024) return (b / 1024).toFixed(0) + " KB";
        return b + " B";
      };

      root.querySelectorAll(".ak-form-file-input").forEach((input) => {
        if (input._akFileInit) return;
        input._akFileInit = true;

        let container = input.closest(".ak-form-file");
        const H = Helpers;

        // Auto-build si no existe contenedor .ak-form-file
        if (!container) {
          container = H.el("div", { class: "ak-form-file" });
          input.parentNode.insertBefore(container, input);
          container.appendChild(input);
          // Copiar atributos data-ak-* del input al contenedor
          ["accept", "max-files", "max-size", "file-list"].forEach((a) => {
            var v = input.getAttribute("data-ak-" + a);
            if (v !== null) container.setAttribute("data-ak-" + a, v);
          });
          // Construir field
          var fieldHtml = '<div class="ak-form-file-field"><span class="ak-form-file-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg></span><span class="ak-form-file-text">Seleccionar archivo...</span><button class="ak-form-file-clear" type="button" aria-label="Eliminar">&times;</button><button class="ak-form-file-list-btn" type="button" aria-label="Lista de archivos"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></button></div>';
          container.insertAdjacentHTML("beforeend", fieldHtml);
          container.insertAdjacentHTML("beforeend", '<div class="ak-form-file-popover"></div>');
          container.insertAdjacentHTML("beforeend", '<div class="ak-form-file-error"></div>');
        }

        const textEl = container.querySelector(".ak-form-file-text");
        const field = container.querySelector(".ak-form-file-field");
        const clearBtn = container.querySelector(".ak-form-file-clear");
        const listBtn = container.querySelector(".ak-form-file-list-btn");
        const popover = container.querySelector(".ak-form-file-popover");
        if (popover) document.body.appendChild(popover);
        let popoverScrollHandler = null;
        let popoverResizeHandler = null;
        let errorEl = container.querySelector(".ak-form-file-error");
        if (!errorEl) {
          errorEl = document.createElement("div");
          errorEl.className = "ak-form-file-error";
          container.appendChild(errorEl);
        }

        const showError = (msgs) => {
          errorEl.innerHTML = msgs.map((m) => "<div>" + m + "</div>").join("");
          errorEl.style.display = msgs.length ? "block" : "none";
        };

        const processFiles = (fileList) => {
          const errors = [];
          let files = Array.from(fileList);

          const acceptAttr =
            container.getAttribute("data-ak-accept") ||
            input.getAttribute("accept");
          if (acceptAttr) {
            input.accept = acceptAttr;
            const allowed = acceptAttr
              .split(",")
              .map((s) => s.trim().toLowerCase());
            const valid = [];
            for (const f of files) {
              const ext = f.name.split(".").pop()?.toLowerCase();
              const mime = f.type.toLowerCase();
              const ok = allowed.some((a) => {
                if (a.startsWith(".")) return ext === a.slice(1);
                if (a.endsWith("/*")) return mime.startsWith(a.slice(0, -1));
                return mime === a || ext === a;
              });
              if (ok) valid.push(f);
              else
                errors.push(
                  '"' + f.name + '" no es un tipo de archivo v\u00e1lido.'
                );
            }
            files = valid;
          }

          const maxSize = container.getAttribute("data-ak-max-size");
          if (maxSize) {
            const bytes = parseSize(maxSize);
            const valid = [];
            for (const f of files) {
              if (f.size <= bytes) valid.push(f);
              else
                errors.push(
                  '"' +
                    f.name +
                    '" excede el tama\u00f1o m\u00e1ximo (' +
                    fmtSize(bytes) +
                    ")."
                );
            }
            files = valid;
          }

          const maxFiles = container.getAttribute("data-ak-max-files");
          if (maxFiles && files.length > parseInt(maxFiles, 10)) {
            errors.push(
              "M\u00e1ximo " +
                maxFiles +
                " archivos. Se tomaron los primeros " +
                maxFiles +
                "."
            );
            files = files.slice(0, parseInt(maxFiles, 10));
          }

          const dt = new DataTransfer();
          for (const f of files) dt.items.add(f);
          return { files: dt.files, errors };
        };

        const buildList = () => {
          if (!popover || !container.hasAttribute("data-ak-file-list"))
            return;
          popover.innerHTML = "";
          if (!input.files || input.files.length === 0) return;
          Array.from(input.files).forEach((file, i) => {
            const item = document.createElement("div");
            item.className = "ak-form-file-popover-item";
            item.innerHTML =
              '<svg class="ak-form-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><span>' +
              file.name +
              '</span><button class="ak-form-file-remove" type="button" aria-label="Eliminar">&times;</button>';
            const rm = item.querySelector(".ak-form-file-remove");
            rm.addEventListener("click", (e) => {
              e.stopPropagation();
              const dt = new DataTransfer();
              Array.from(input.files).forEach((f, idx) => {
                if (idx !== i) dt.items.add(f);
              });
              input.files = dt.files;
              updateUI();
              showError([]);
              H.emit(input, "change");
            });
            popover.appendChild(item);
          });
        };

        const positionPopover = () => {
          if (!popover || !popover.classList.contains("open")) return;
          var rect = (field || container).getBoundingClientRect();
          popover.style.position = "fixed";
          popover.style.top = (rect.bottom + 4) + "px";
          popover.style.left = rect.left + "px";
          popover.style.right = "auto";
          popover.style.width = rect.width + "px";
          popover.style.minWidth = "200px";
        };

        const closePopover = () => {
          if (popover) {
            popover.classList.remove("open");
            if (popoverScrollHandler) document.removeEventListener("scroll", popoverScrollHandler, true);
            if (popoverResizeHandler) window.removeEventListener("resize", popoverResizeHandler);
            popoverScrollHandler = null;
            popoverResizeHandler = null;
          }
        };

        const updateUI = () => {
          if (input.files && input.files.length > 0) {
            container.classList.add("has-file");
            const names = Array.from(input.files).map((f) => f.name);
            if (textEl) {
              textEl.textContent =
                names.length === 1
                  ? names[0]
                  : names.length + " archivos seleccionados";
            }
          } else {
            container.classList.remove("has-file");
            closePopover();
            if (textEl)
              textEl.textContent =
                textEl.getAttribute("data-placeholder") ||
                "Seleccionar archivo";
            if (popover) popover.innerHTML = "";
          }
        };

        if (field) {
          field.addEventListener("click", (e) => {
            if (
              e.target.closest(
                ".ak-form-file-clear, .ak-form-file-list-btn, .ak-form-file-remove"
              )
            )
              return;
            input.click();
          });

          ["dragenter", "dragover"].forEach((evt) => {
            field.addEventListener(evt, (e) => {
              e.preventDefault();
              e.stopPropagation();
              field.classList.add("ak-dragover");
            });
          });
          ["dragleave", "drop"].forEach((evt) => {
            field.addEventListener(evt, (e) => {
              e.preventDefault();
              e.stopPropagation();
              field.classList.remove("ak-dragover");
            });
          });
          field.addEventListener("drop", (e) => {
            const files = e.dataTransfer.files;
            if (!files || files.length === 0) return;
            const result = processFiles(files);
            showError(result.errors);
            if (result.files.length === 0) return;
            input.files = result.files;
            updateUI();
            if (popover && popover.classList.contains("open")) buildList();
            H.emit(input, "change");
          });
        }

        if (clearBtn) {
          clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            input.value = "";
            updateUI();
            showError([]);
            H.emit(input, "change");
          });
        }

        if (listBtn) {
          listBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!popover) return;
            const isOpen = popover.classList.contains("open");
            if (isOpen) {
              closePopover();
            } else {
              buildList();
              popover.classList.add("open");
              positionPopover();
              popoverScrollHandler = () => positionPopover();
              popoverResizeHandler = () => positionPopover();
              document.addEventListener("scroll", popoverScrollHandler, true);
              window.addEventListener("resize", popoverResizeHandler);
            }
          });
        }

        document.addEventListener("click", (e) => {
          if (popover && !container.contains(e.target) && !popover.contains(e.target)) {
            closePopover();
          }
        });

        input.addEventListener("change", () => {
          if (!input.files || input.files.length === 0) {
            updateUI();
            showError([]);
            return;
          }
          const result = processFiles(input.files);
          showError(result.errors);
          input.files = result.files;
          updateUI();
          if (popover && popover.classList.contains("open")) buildList();
        });
        updateUI();
      });
    },

    /**
     * Validación reactiva de formularios con feedback visual.
     * Soporta campos estándar (input, select, textarea) y personalizados (ak-form-file).
     *
     * Modos:
     *   'init'    — Inicializa validación en un formulario.
     *               target: selector/elemento form. options: { onSuccess, onError }
     *   'field'   — Re-valida un campo individual. Retorna true/false.
     *               target: elemento del campo.
     *
     * Declarativo: usar data-ak-validation en el <form> y data-ak-validate en cada campo.
     *   data-ak-validate="required|email|min:3|max:100|pattern:^[a-z]+$"
     *   data-ak-msg="Mensaje genérico"
     *   data-ak-msg-required="Mensaje específico para required"
     *   data-ak-msg-email="Email inválido"
     */
    formValidation(action, target, options) {
      if (action === 'init') {
        return Helpers.formValidationInit(target, options);
      }
      if (action === 'field') {
        // Force re-validate a single field
        if (!target || !target.closest) return true;
        const form = target.closest('[data-ak-validation]') || target.closest('form');
        if (!form || !form._akFvInit) return true;
        // Trigger validation by dispatching blur
        target.dispatchEvent(new Event('blur', { bubbles: true }));
        return !target.classList.contains('ak-is-invalid');
      }
    },

    _helpers: Helpers,
  };

  /**
   * @desc Parsea opciones desde data-attributes del elemento.
   * @param {HTMLElement} el - Elemento con atributos data-*
   * @param {string} prefix - Prefijo del componente (ej. akSelect)
   * @returns {Object} Opciones parseadas
   */
  function parseDataOptions(el, prefix) {
    const opts = {};
    for (const attr in el.dataset) {
      if (attr === prefix) continue;
      let key, val;
      if (attr.startsWith(prefix)) {
        key = attr.slice(prefix.length);
        key = key.charAt(0).toLowerCase() + key.slice(1);
      } else if (attr.startsWith("ak")) {
        key = attr.charAt(2).toLowerCase() + attr.slice(3);
      } else {
        continue;
      }
      val = el.dataset[attr];
      if (val === "" || val === "true") val = true;
      else if (val === "false") val = false;
      else if (val !== "" && !isNaN(val)) val = Number(val);
      opts[key] = val;
    }
    if (el.multiple) opts.multiple = true;
    if (el.hasAttribute("data-ak-select-remote")) {
      opts.remoteUrl = el.getAttribute("data-ak-select-remote");
    }
    return opts;
  }

  /* ==========================================================================
   * 3. SELECT — clase AkSelect
   * ======================================================================== */
  /**
   * Custom Select con búsqueda, múltiple, carga remota y accesibilidad.
   * @class
   * @param {HTMLSelectElement} native - Elemento <select> nativo a reemplazar
   * @param {Object} options - Opciones de configuración
   * @param {boolean} [options.search=true] - Habilita buscador interno
   * @param {boolean} [options.multiple] - Selección múltiple (hereda de native.multiple)
   * @param {string} [options.placeholder="Selecciona una opción..."]
   * @param {string} [options.noResultsText="Sin resultados"]
   * @param {string} [options.searchPlaceholder="Buscar..."]
   * @param {number} [options.maxSelectedLabels=3] - Máx chips visibles en múltiple
   * @param {boolean} [options.closeOnSelect] - Cerrar al seleccionar (true en simple)
   * @param {boolean} [options.allowClear=true] - Botón limpiar selección
   * @param {string} [options.remoteUrl] - URL para carga AJAX de opciones
   * @param {Function} [options.remote] - Callback (query, done) => done(items[])
   * @fires ak:select:change - Cuando cambia la selección {value, selected}
   * @fires ak:select:open - Cuando se abre el dropdown
   * @fires ak:select:close - Cuando se cierra el dropdown
   */
  class AkSelect {
    constructor(native, options) {
      if (!(native instanceof HTMLSelectElement)) {
        throw new Error("select() requiere un elemento <select>.");
      }
      this.native = native;
      this.id = native.id || nextId();

      // Opciones con defaults
      this.opts = Object.assign(
        {
          search: true,
          multiple: native.multiple,
          placeholder: "Selecciona una opción...",
          noResultsText: "Sin resultados",
          searchPlaceholder: "Buscar...",
          maxSelectedLabels: 3,
          closeOnSelect: !native.multiple,
          allowClear: true,
          disabled: native.disabled,
          readonly: false,
          error: false,
          errorText: "",
          debounce: 150,
          remoteUrl: null,       // URL para carga AJAX
          remote: null,          // callback (query, done) => done(items[])
          selectAllText: "Seleccionar todo",
          clearAllText: "Limpiar",
          loading: false,
        },
        options
      );

      this.state = {
        open: false,
        activeIndex: -1,
        query: "",
        loading: !!this.opts.loading,
      };

      // Modelo de opciones: [{value, label, group, disabled, selected}]
      this.items = [];
      this._boundOutside = this._onOutsideClick.bind(this);
      this._boundResize = this._onResize.bind(this);

      this._build();
      this._readNativeOptions();

      if (this.opts.remoteUrl || this.opts.remote) {
        this._loadRemote("");
      } else {
        this._renderOptions();
      }
      this._renderValue();
      this._applyStates();
    }

    /** @desc Construye el DOM del custom select, control, dropdown y backdrop. */
    _build() {
      const H = Helpers;
      this.native.classList.add("ak-select-native-hidden");
      this.native.setAttribute("aria-hidden", "true");
      this.native.setAttribute("tabindex", "-1");

      // Contenedor raíz
      this.root = H.el("div", {
        class: "ak-select",
        "data-ak-instance": this.id,
      });
      if (H.isMobile()) this.root.classList.add("ak-is-mobile");

      // Control
      this.control = H.el("div", {
        class: "ak-select__control",
        role: "combobox",
        tabindex: this.opts.disabled ? "-1" : "0",
        "aria-haspopup": "listbox",
        "aria-expanded": "false",
        "aria-controls": this.id + "-listbox",
      });

      this.valueWrap = H.el("div", { class: "ak-select__value" });
      this.control.appendChild(this.valueWrap);

      // Indicadores (spinner/clear/flecha)
      this.indicators = H.el("div", { class: "ak-select__indicators" });
      this.arrow = H.el("span", { class: "ak-select__arrow", "aria-hidden": "true" });
      this.indicators.appendChild(this.arrow);
      this.control.appendChild(this.indicators);

      // Dropdown
      this.dropdown = H.el("div", { class: "ak-select__dropdown" });

      // Header (solo visible en bottom-sheet móvil)
      const header = H.el("div", { class: "ak-select__dropdown-header" }, [
        H.el("span", { text: this.opts.placeholder }),
        H.el("button", {
          class: "ak-select__dropdown-close",
          type: "button",
          "aria-label": "Cerrar",
          html: "&times;",
          onclick: () => this.close(),
        }),
      ]);
      this.dropdown.appendChild(header);

      // Buscador
      if (this.opts.search) {
        const searchWrap = H.el("div", { class: "ak-select__search-wrap" });
        this.searchInput = H.el("input", {
          class: "ak-select__search",
          type: "text",
          placeholder: this.opts.searchPlaceholder,
          "aria-label": this.opts.searchPlaceholder,
          autocomplete: "off",
        });
        const onSearch = H.debounce((e) => this._onSearch(e.target.value), this.opts.debounce);
        this.searchInput.addEventListener("input", onSearch);
        searchWrap.appendChild(this.searchInput);
        this.dropdown.appendChild(searchWrap);
      }

      // Acciones (seleccionar todo / limpiar) solo en múltiple
      if (this.opts.multiple) {
        this.actions = H.el("div", { class: "ak-select__actions" }, [
          H.el("button", {
            class: "ak-select__action",
            type: "button",
            text: this.opts.selectAllText,
            onclick: () => this._selectAll(),
          }),
          H.el("button", {
            class: "ak-select__action",
            type: "button",
            text: this.opts.clearAllText,
            onclick: () => this.clear(),
          }),
        ]);
        this.dropdown.appendChild(this.actions);
      }

      // Lista de opciones
      this.list = H.el("ul", {
        class: "ak-select__options",
        role: "listbox",
        id: this.id + "-listbox",
        "aria-multiselectable": this.opts.multiple ? "true" : "false",
      });
      this.dropdown.appendChild(this.list);

      // Backdrop (bottom-sheet)
      this.backdrop = H.el("div", {
        class: "ak-select__backdrop",
        onclick: () => this.close(),
      });

      // Mensaje de error
      this.errorMsg = H.el("div", { class: "ak-select__error-msg" });

      // Ensamblar
      this.root.appendChild(this.control);
      this.root.appendChild(this.errorMsg);

      this.native.parentNode.insertBefore(this.root, this.native.nextSibling);

      // Dropdown y backdrop van al body para evitar clipping
      document.body.appendChild(this.dropdown);
      document.body.appendChild(this.backdrop);

      // Eventos del control
      this.control.addEventListener("click", (e) => {
        if (e.target.closest(".ak-select__chip-remove")) return;
        if (e.target.closest(".ak-select__clear")) return;
        this.toggle();
      });
      this.control.addEventListener("keydown", (e) => this._onKeydown(e));
      window.addEventListener("resize", this._boundResize);
    }

    /** @desc Lee las opciones del <select> nativo al modelo interno. */
    _readNativeOptions() {
      this.items = [];
      const walk = (parent, group) => {
        Array.from(parent.children).forEach((child) => {
          if (child.tagName === "OPTGROUP") {
            walk(child, child.getAttribute("label") || "");
          } else if (child.tagName === "OPTION") {
            if (child.value === "" && !child.textContent.trim()) return;
            this.items.push({
              value: child.value,
              label: child.textContent.trim(),
              group: group || null,
              disabled: child.disabled,
              selected: child.selected,
            });
          }
        });
      };
      walk(this.native, null);
    }

    /** @desc Carga opciones vía fetch o callback remoto.
     *  @param {string} query - Texto de búsqueda */
    _loadRemote(query) {
      this.state.loading = true;
      this._renderSpinner(true);
      this._renderOptions();

      const done = (items) => {
        this.state.loading = false;
        this._renderSpinner(false);
        // Preserva selección previa
        const selectedValues = new Set(this.items.filter((i) => i.selected).map((i) => i.value));
        this.items = (items || []).map((it) => ({
          value: String(it.value),
          label: String(it.label),
          group: it.group || null,
          disabled: !!it.disabled,
          selected: selectedValues.has(String(it.value)) || !!it.selected,
        }));
        this._syncNativeFromItems();
        this._renderOptions();
        this._renderValue();
      };

      if (typeof this.opts.remote === "function") {
        this.opts.remote(query, done);
      } else if (this.opts.remoteUrl) {
        const url = this.opts.remoteUrl + (this.opts.remoteUrl.includes("?") ? "&" : "?") + "q=" + encodeURIComponent(query);
        fetch(url)
          .then((r) => r.json())
          .then((data) => done(Array.isArray(data) ? data : data.items || []))
          .catch((err) => {
            Helpers.warn("Fallo carga remota: " + err.message);
            this.state.loading = false;
            this._renderSpinner(false);
            this._renderOptions();
          });
      }
    }

    /** @desc Muestra/oculta el spinner de carga en los indicadores.
     *  @param {boolean} show */
    _renderSpinner(show) {
      let sp = this.indicators.querySelector(".ak-select__spinner");
      if (show && !sp) {
        sp = Helpers.el("span", { class: "ak-select__spinner", "aria-label": "Cargando" });
        this.indicators.insertBefore(sp, this.arrow);
      } else if (!show && sp) {
        sp.remove();
      }
    }

    /** @desc Renderiza la lista de opciones en el dropdown, con filtro y agrupación. */
    _renderOptions() {
      const H = Helpers;
      this.list.innerHTML = "";
      const q = this.state.query.toLowerCase();

      if (this.state.loading) {
        this.list.appendChild(
          H.el("li", { class: "ak-select__no-results" }, [
            H.el("span", { class: "ak-spinner" }),
          ])
        );
        return;
      }

      const filtered = this.items.filter((it) => !q || it.label.toLowerCase().includes(q));

      if (!filtered.length) {
        this.list.appendChild(
          H.el("li", { class: "ak-select__no-results", text: this.opts.noResultsText })
        );
        return;
      }

      // Agrupar por optgroup
      const groups = new Map();
      filtered.forEach((it) => {
        const key = it.group || "__nogroup__";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(it);
      });

      this._visibleItems = []; // para navegación por teclado
      groups.forEach((groupItems, groupKey) => {
        if (groupKey !== "__nogroup__") {
          this.list.appendChild(
            H.el("li", { class: "ak-select__optgroup-label", text: groupKey, role: "presentation" })
          );
        }
        groupItems.forEach((it) => {
          const idx = this._visibleItems.length;
          this._visibleItems.push(it);
          const li = H.el("li", {
            class:
              "ak-select__option" +
              (it.selected ? " ak-is-selected" : "") +
              (idx === this.state.activeIndex ? " ak-is-active" : ""),
            role: "option",
            "aria-selected": it.selected ? "true" : "false",
            "aria-disabled": it.disabled ? "true" : "false",
            "data-value": it.value,
            "data-index": idx,
          });

          if (this.opts.multiple) {
            li.appendChild(H.el("span", { class: "ak-select__checkbox", "aria-hidden": "true" }));
          }
          li.appendChild(H.el("span", { class: "ak-select__option-label", text: it.label }));
          if (!this.opts.multiple) {
            li.appendChild(H.el("span", { class: "ak-select__check-single", html: "&#10003;", "aria-hidden": "true" }));
          }

          if (!it.disabled) {
            li.addEventListener("click", () => this._toggleItem(it));
            li.addEventListener("mousemove", () => {
              this.state.activeIndex = idx;
              this._highlightActive();
            });
          }
          this.list.appendChild(li);
        });
      });
    }

    /** @desc Resalta la opción activa en la lista y la hace visible. */
    _highlightActive() {
      const options = this.list.querySelectorAll(".ak-select__option");
      options.forEach((o) => {
        const idx = Number(o.getAttribute("data-index"));
        o.classList.toggle("ak-is-active", idx === this.state.activeIndex);
        if (idx === this.state.activeIndex) {
          this.control.setAttribute("aria-activedescendant", "");
          o.scrollIntoView({ block: "nearest" });
        }
      });
    }

    /* ---- Selección ----------------------------------------------------- */
    /** @desc Alterna la selección de un item (multiple) o selecciona uno solo (simple). */
    _toggleItem(item) {
      if (item.disabled) return;
      if (this.opts.multiple) {
        item.selected = !item.selected;
      } else {
        this.items.forEach((i) => (i.selected = false));
        item.selected = true;
      }
      this._syncNativeFromItems();
      this._renderOptions();
      this._renderValue();
      this._emitChange();
      if (this.opts.closeOnSelect) this.close();
    }

    /** @desc Selecciona todos los items visibles (filtrados). */
    _selectAll() {
      const q = this.state.query.toLowerCase();
      this.items.forEach((it) => {
        if (!it.disabled && (!q || it.label.toLowerCase().includes(q))) it.selected = true;
      });
      this._syncNativeFromItems();
      this._renderOptions();
      this._renderValue();
      this._emitChange();
    }

    /** Limpia toda la selección. */
    clear() {
      this.items.forEach((i) => (i.selected = false));
      this._syncNativeFromItems();
      this._renderOptions();
      this._renderValue();
      this._emitChange();
    }

    /** @desc Sincroniza el <select> nativo con el modelo interno de items. */
    _syncNativeFromItems() {
      const selected = new Set(this.items.filter((i) => i.selected).map((i) => i.value));
      // Reconstruye options nativas si vinieron de remoto
      if (this.opts.remoteUrl || this.opts.remote) {
        this.native.innerHTML = "";
        this.items.forEach((it) => {
          const opt = document.createElement("option");
          opt.value = it.value;
          opt.textContent = it.label;
          opt.selected = it.selected;
          this.native.appendChild(opt);
        });
      } else {
        Array.from(this.native.options).forEach((opt) => {
          opt.selected = selected.has(opt.value);
        });
      }
      Helpers.emit(this.native, "change", { source: "agrocity-kit" });
    }

    /** @desc Renderiza el valor seleccionado: chips en múltiple, texto en simple. */
    _renderValue() {
      const H = Helpers;
      this.valueWrap.innerHTML = "";
      const selected = this.items.filter((i) => i.selected);

      // Botón clear global
      let clearBtn = this.indicators.querySelector(".ak-select__clear");
      if (this.opts.allowClear && selected.length && !this.opts.disabled && !this.opts.readonly) {
        if (!clearBtn) {
          clearBtn = H.el("button", {
            class: "ak-select__clear",
            type: "button",
            "aria-label": "Limpiar selección",
            html: "&times;",
            onclick: (e) => {
              e.stopPropagation();
              this.clear();
            },
          });
          this.indicators.insertBefore(clearBtn, this.arrow);
        }
      } else if (clearBtn) {
        clearBtn.remove();
      }

      if (!selected.length) {
        this.valueWrap.appendChild(
          H.el("span", { class: "ak-select__placeholder", text: this.opts.placeholder })
        );
        return;
      }

      if (this.opts.multiple) {
        const chips = H.el("div", { class: "ak-select__chips" });
        const max = this.opts.maxSelectedLabels;
        const toShow = selected.slice(0, max);
        toShow.forEach((it) => {
          const chip = H.el("span", { class: "ak-select__chip" }, [
            H.el("span", { class: "ak-select__chip-label", text: it.label }),
          ]);
          if (!this.opts.disabled && !this.opts.readonly) {
            chip.appendChild(
              H.el("button", {
                class: "ak-select__chip-remove",
                type: "button",
                "aria-label": "Quitar " + it.label,
                html: "&times;",
                onclick: (e) => {
                  e.stopPropagation();
                  this._toggleItem(it);
                },
              })
            );
          }
          chips.appendChild(chip);
        });
        if (selected.length > max) {
          chips.appendChild(
            H.el("span", {
              class: "ak-select__count-badge",
              text: "+" + (selected.length - max) + " seleccionados",
            })
          );
        }
        this.valueWrap.appendChild(chips);
      } else {
        this.valueWrap.appendChild(
          H.el("span", { class: "ak-select__single-value", text: selected[0].label })
        );
      }
    }

    /** @desc Aplica las clases CSS de estado (disabled, readonly, error). */
    _applyStates() {
      this.root.classList.toggle("ak-is-disabled", !!this.opts.disabled);
      this.root.classList.toggle("ak-is-readonly", !!this.opts.readonly);
      this.setError(this.opts.error, this.opts.errorText);
      this.control.setAttribute("tabindex", this.opts.disabled ? "-1" : "0");
    }

    /** Activa/desactiva el estado de error con mensaje opcional. */
    setError(isError, message = "") {
      this.opts.error = !!isError;
      this.root.classList.toggle("ak-has-error", !!isError);
      this.control.setAttribute("aria-invalid", isError ? "true" : "false");
      this.errorMsg.textContent = message || this.opts.errorText || "";
    }

    /** Activa/desactiva estado disabled. */
    setDisabled(disabled) {
      this.opts.disabled = !!disabled;
      this.native.disabled = !!disabled;
      if (disabled) this.close();
      this._applyStates();
      this._renderValue();
    }

    /* ---- Abrir / cerrar ------------------------------------------------ */
    /** @desc Alterna el estado abierto/cerrado del dropdown. */
    toggle() {
      if (this.opts.disabled || this.opts.readonly) return;
      this.state.open ? this.close() : this.open();
    }

    /** @desc Abre el dropdown y posiciona el overlay. */
    open() {
      if (this.opts.disabled || this.opts.readonly || this.state.open) return;
      this.state.open = true;
      this.root.classList.add("ak-is-open");
      this.control.setAttribute("aria-expanded", "true");
      var isMobile = Helpers.isMobile();
      this.root.classList.toggle("ak-is-mobile", isMobile);
      this.dropdown.classList.add("ak-is-open");
      this.dropdown.classList.toggle("ak-is-mobile", isMobile);
      this.backdrop.classList.add("ak-is-open");
      this.backdrop.classList.toggle("ak-is-mobile", isMobile);
      // Posicionar dropdown sobre body
      if (!isMobile) {
        this._positionDropdown();
        this._scrollHandler = () => this._positionDropdown();
        this._resizeHandler = () => this.close();
        document.addEventListener("scroll", this._scrollHandler, true);
        window.addEventListener("resize", this._resizeHandler);
      }
      document.addEventListener("click", this._boundOutside, true);
      // Foco al buscador o al control
      setTimeout(() => {
        if (this.searchInput) this.searchInput.focus();
      }, 0);
      Helpers.emit(this.native, "ak:select:open", { instance: this });
    }

    /** @desc Posiciona el dropdown flotante respecto al control. */
    _positionDropdown() {
      var rect = this.control.getBoundingClientRect();
      this.dropdown.style.position = "fixed";
      this.dropdown.style.top = (rect.bottom + 4) + "px";
      this.dropdown.style.left = rect.left + "px";
      this.dropdown.style.right = "auto";
      this.dropdown.style.width = rect.width + "px";
    }

    /** @desc Cierra el dropdown y limpia event listeners. */
    close() {
      if (!this.state.open) return;
      this.state.open = false;
      this.state.activeIndex = -1;
      this.root.classList.remove("ak-is-open", "ak-is-mobile");
      this.dropdown.classList.remove("ak-is-open", "ak-is-mobile");
      this.backdrop.classList.remove("ak-is-open", "ak-is-mobile");
      this.control.setAttribute("aria-expanded", "false");
      if (this._scrollHandler) document.removeEventListener("scroll", this._scrollHandler, true);
      if (this._resizeHandler) window.removeEventListener("resize", this._resizeHandler);
      this._scrollHandler = null;
      this._resizeHandler = null;
      document.removeEventListener("click", this._boundOutside, true);
      Helpers.emit(this.native, "ak:select:close", { instance: this });
    }

    /** @desc Cierra el dropdown al hacer clic fuera. */
    _onOutsideClick(e) {
      if (this.root.contains(e.target) || this.dropdown.contains(e.target)) return;
      this.close();
    }

    /** @desc Actualiza clase mobile al redimensionar ventana. */
    _onResize() {
      this.root.classList.toggle("ak-is-mobile", Helpers.isMobile());
    }

    /* ---- Búsqueda ------------------------------------------------------ */
    /** @desc Maneja el input de búsqueda y actualiza opciones. @param {string} value */
    _onSearch(value) {
      this.state.query = value.trim();
      this.state.activeIndex = -1;
      if (this.opts.remoteUrl || this.opts.remote) {
        this._loadRemote(this.state.query);
      } else {
        this._renderOptions();
      }
    }

    /* ---- Navegación por teclado ---------------------------------------- */
    /** @desc Maneja teclas Enter, Escape, flechas, Tab en el control. @param {KeyboardEvent} e */
    _onKeydown(e) {
      const key = e.key;
      if (!this.state.open) {
        if (key === "Enter" || key === " " || key === "ArrowDown") {
          e.preventDefault();
          this.open();
        }
        return;
      }
      const count = (this._visibleItems || []).length;
      switch (key) {
        case "ArrowDown":
          e.preventDefault();
          this.state.activeIndex = Math.min(count - 1, this.state.activeIndex + 1);
          this._highlightActive();
          break;
        case "ArrowUp":
          e.preventDefault();
          this.state.activeIndex = Math.max(0, this.state.activeIndex - 1);
          this._highlightActive();
          break;
        case "Enter":
          e.preventDefault();
          if (this.state.activeIndex >= 0 && this._visibleItems[this.state.activeIndex]) {
            this._toggleItem(this._visibleItems[this.state.activeIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          this.close();
          this.control.focus();
          break;
        case "Tab":
          this.close();
          break;
      }
    }

    /** @desc Emite evento ak:select:change con el valor seleccionado. */
    _emitChange() {
      const selected = this.items.filter((i) => i.selected);
      Helpers.emit(this.native, "ak:select:change", {
        instance: this,
        value: this.opts.multiple
          ? selected.map((i) => i.value)
          : selected.length
          ? selected[0].value
          : null,
        selected: selected.map((i) => ({ value: i.value, label: i.label })),
      });
    }

    /* ---- API pública de instancia -------------------------------------- */
    /** Devuelve el/los valor(es) seleccionado(s). */
    getValue() {
      const selected = this.items.filter((i) => i.selected);
      return this.opts.multiple
        ? selected.map((i) => i.value)
        : selected.length
        ? selected[0].value
        : null;
    }

    /** Establece la selección por valor(es). */
    setValue(value) {
      const values = new Set((Array.isArray(value) ? value : [value]).map(String));
      this.items.forEach((i) => (i.selected = values.has(String(i.value))));
      this._syncNativeFromItems();
      this._renderOptions();
      this._renderValue();
      this._emitChange();
    }

    /** Reemplaza dinámicamente el conjunto de opciones. */
    setOptions(items) {
      this.items = (items || []).map((it) => ({
        value: String(it.value),
        label: String(it.label),
        group: it.group || null,
        disabled: !!it.disabled,
        selected: !!it.selected,
      }));
      this._syncNativeFromItems();
      this._renderOptions();
      this._renderValue();
    }

    /** Muestra/oculta estado de carga. */
    setLoading(loading) {
      this.state.loading = !!loading;
      this._renderSpinner(!!loading);
      this._renderOptions();
    }

    /** Destruye la instancia y restaura el <select> nativo. */
    destroy() {
      this.close();
      document.removeEventListener("click", this._boundOutside, true);
      window.removeEventListener("resize", this._boundResize);
      if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
      if (this.dropdown && this.dropdown.parentNode) this.dropdown.parentNode.removeChild(this.dropdown);
      if (this.backdrop && this.backdrop.parentNode) this.backdrop.parentNode.removeChild(this.backdrop);
      this.native.classList.remove("ak-select-native-hidden");
      this.native.removeAttribute("aria-hidden");
      this.native.removeAttribute("tabindex");
      registry.delete(this.native);
    }
  }

  /* ==========================================================================
   * 4. DATATABLE — clase AkDataTable
   * ======================================================================== */
  /**
   * Data Table interactiva con paginación, orden, búsqueda y export CSV.
   * @class
   * @param {HTMLElement} target - Elemento contenedor o <table> existente
   * @param {Object} [options] - Opciones de configuración
   * @param {Array} [options.data] - Array de objetos para los datos
   * @param {Array} [options.columns] - Definición de columnas [{key, label, sortable, render}]
   * @param {boolean} [options.search=true] - Habilita búsqueda global
   * @param {boolean} [options.pagination=true] - Habilita paginación
   * @param {number} [options.pageSize=10] - Filas por página
   * @param {boolean} [options.sortable=true] - Habilita orden por columnas
   * @param {boolean} [options.stickyHeader=true] - Cabecera fija al hacer scroll
   * @param {boolean} [options.exportCsv=false] - Muestra botón exportar CSV
   * @param {boolean} [options.responsiveCards=true] - Vista tipo cards en móvil
   * @fires ak:datatable:sort - Al ordenar {key, dir}
   * @fires ak:datatable:page - Al cambiar página {page}
   * @fires ak:datatable:export - Al exportar CSV {rows}
   */
  class AkDataTable {
    constructor(target, options) {
      this.target = target;
      this.id = target.id || nextId();

      this.opts = Object.assign(
        {
          data: null,
          columns: null,
          search: true,
          searchPlaceholder: "Buscar...",
          pagination: true,
          pageSize: 10,
          pageSizeOptions: [10, 25, 50, 100],
          stickyHeader: true,
          sortable: true,
          emptyText: "No se encontraron resultados",
          exportCsv: false,
          exportFileName: "export.csv",
          responsiveCards: true,
          loading: false,
        },
        options
      );

      this.state = {
        query: "",
        sortKey: null,
        sortDir: null, // 'asc' | 'desc' | null
        page: 1,
        pageSize: this.opts.pageSize,
        loading: !!this.opts.loading,
      };

      this._extractDataIfNeeded();
      this._build();
      this.render();
    }

    /** @desc Extrae data/columns desde una <table> HTML si no se proveyeron. */
    _extractDataIfNeeded() {
      var hasData = this.opts.data && Array.isArray(this.opts.data) && this.opts.data.length;
      if (this.opts.columns && hasData) return;
      const table = this.target.tagName === "TABLE" ? this.target : this.target.querySelector("table");
      if (!table) return;

      var ths = Array.from(table.querySelectorAll("thead th"));

      if (!this.opts.columns) {
        this.opts.columns = ths.map(function(th, i) {
          var col = {
            key: th.getAttribute("data-key") || "col" + i,
            label: th.textContent.trim(),
            sortable: th.hasAttribute("data-sortable") ? th.getAttribute("data-sortable") !== "false" : this.opts.sortable,
          };
          var attrs = {};
          Array.from(th.attributes).forEach(function(a) {
            if (a.name === "data-key") return;
            attrs[a.name] = a.value;
          });
          var keys = Object.keys(attrs);
          if (keys.length) col.thAttrs = attrs;
          return col;
        }.bind(this));
      } else {
        ths.forEach(function(th, i) {
          var col = this.opts.columns[i];
          if (!col) return;
          if (th.hasAttribute("data-sortable")) {
            col.sortable = th.getAttribute("data-sortable") !== "false";
          }
          var attrs = {};
          Array.from(th.attributes).forEach(function(a) {
            if (a.name === "data-key") return;
            attrs[a.name] = a.value;
          });
          var keys = Object.keys(attrs);
          if (keys.length) col.thAttrs = attrs;
        }.bind(this));
      }
      if (!this.opts.data) {
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        this.opts.data = rows.map(function(tr) {
          const obj = {};
          Array.from(tr.children).forEach(function(td, i) {
            const col = this.opts.columns[i];
            if (col) obj[col.key] = td.textContent.trim();
          }.bind(this));
          return obj;
        }.bind(this));
      }
    }

    /** @desc Construye el DOM del DataTable: toolbar, tabla, footer. */
    _build() {
      const H = Helpers;
      this.data = Array.isArray(this.opts.data) ? this.opts.data.slice() : [];
      this.columns = this.opts.columns || [];

      // Contenedor raíz que reemplaza al target
      this.root = H.el("div", { class: "ak-dt", "data-ak-instance": this.id });
      if (this.opts.responsiveCards) this.root.classList.add("ak-dt--cards");

      // Toolbar (búsqueda + export)
      if (this.opts.search || this.opts.exportCsv) {
        this.toolbar = H.el("div", { class: "ak-dt__toolbar" });
        if (this.opts.search) {
          this.searchInput = H.el("input", {
            class: "ak-dt__search",
            type: "search",
            placeholder: this.opts.searchPlaceholder,
            "aria-label": this.opts.searchPlaceholder,
          });
          this.searchInput.addEventListener(
            "input",
            H.debounce((e) => {
              this.state.query = e.target.value.trim().toLowerCase();
              this.state.page = 1;
              this.render();
            }, 150)
          );
          this.toolbar.appendChild(this.searchInput);
        }
        if (this.opts.exportCsv) {
          this.exportBtn = H.el("button", {
            class: "ak-dt__export",
            type: "button",
            html: '<span aria-hidden="true">&#8681;</span> CSV',
            onclick: () => this.exportCsv(),
          });
          this.toolbar.appendChild(this.exportBtn);
        }
        this.root.appendChild(this.toolbar);
      }

      // Contenedor de tabla (scrollable)
      this.tableWrap = H.el("div", { class: "ak-dt__table-wrap" });
      if (this.opts.stickyHeader) this.root.classList.add("ak-dt--sticky");
      this.table = H.el("table", {
        class: "ak-dt__table",
        role: "table",
        "aria-rowcount": this.data.length,
      });
      var origTable = this.target.tagName === "TABLE" ? this.target : this.target.querySelector("table");
      if (origTable) {
        Array.from(origTable.attributes).forEach(function(a) {
          var n = a.name;
          if (n === "class") {
            a.value.split(/\s+/).forEach(function(c) { if (c) this.table.classList.add(c); }.bind(this));
          } else if (n !== "role" && n !== "aria-rowcount" && !n.startsWith("data-ak-")) {
            this.table.setAttribute(n, a.value);
          }
        }.bind(this));
      }
      this.thead = H.el("thead");
      this.tbody = H.el("tbody");
      this.table.appendChild(this.thead);
      this.table.appendChild(this.tbody);
      this.tableWrap.appendChild(this.table);
      this.root.appendChild(this.tableWrap);

      // Footer (paginación + info)
      this.footer = H.el("div", { class: "ak-dt__footer" });
      this.root.appendChild(this.footer);

      // Reemplaza el target por el root
      this.target.parentNode.insertBefore(this.root, this.target);
      this.target.style.display = "none";
      if (this.target.tagName === "TABLE") {
        this.target.setAttribute("data-ak-original", "true");
      }

      this._renderHead();
    }

    /** @desc Renderiza el thead con columnas sorteables. */
    _renderHead() {
      const H = Helpers;
      this.thead.innerHTML = "";
      const tr = H.el("tr");
      this.columns.forEach((col) => {
        const sortable = this.opts.sortable && col.sortable !== false;
        const th = H.el("th", { scope: "col" });
        if (col.thAttrs) {
          Object.keys(col.thAttrs).forEach(function(name) {
            if (name === "class") {
              col.thAttrs[name].split(/\s+/).forEach(function(cls) {
                if (cls) th.classList.add(cls);
              });
            } else if (name !== "scope") {
              th.setAttribute(name, col.thAttrs[name]);
            }
          });
        }
        if (sortable) {
          th.classList.add("ak-dt__th-sortable");
          const dir =
            this.state.sortKey === col.key
              ? this.state.sortDir === "asc"
                ? "ascending"
                : this.state.sortDir === "desc"
                ? "descending"
                : "none"
              : "none";
          th.setAttribute("aria-sort", dir);
          th.appendChild(
            H.el("span", { class: "ak-dt__th-content" }, [
              H.el("span", { text: col.label }),
              H.el("span", { class: "ak-dt__sort-icon", "aria-hidden": "true" }),
            ])
          );
          th.addEventListener("click", () => this._toggleSort(col.key));
        } else {
          th.textContent = col.label;
        }
        tr.appendChild(th);
      });
      this.thead.appendChild(tr);
    }

    /** @desc Alterna orden asc/desc/null para una columna. @param {string} key */
    _toggleSort(key) {
      if (this.state.sortKey === key) {
        this.state.sortDir =
          this.state.sortDir === "asc" ? "desc" : this.state.sortDir === "desc" ? null : "asc";
        if (!this.state.sortDir) this.state.sortKey = null;
      } else {
        this.state.sortKey = key;
        this.state.sortDir = "asc";
      }
      this._renderHead();
      this.render();
      Helpers.emit(this.root, "ak:datatable:sort", {
        instance: this,
        key: this.state.sortKey,
        dir: this.state.sortDir,
      });
    }

    /** @desc Aplica filtro y orden a los datos. @returns {Array} */
    _getProcessedData() {
      let rows = this.data;
      // Filtro global
      if (this.state.query) {
        rows = rows.filter((row) =>
          this.columns.some((col) => {
            const v = row[col.key];
            return v != null && String(v).toLowerCase().includes(this.state.query);
          })
        );
      }
      // Orden
      if (this.state.sortKey && this.state.sortDir) {
        const key = this.state.sortKey;
        const factor = this.state.sortDir === "asc" ? 1 : -1;
        rows = rows.slice().sort((a, b) => factor * Helpers.compare(a[key], b[key]));
      }
      return rows;
    }

    /** @desc Renderiza cuerpo, paginación e info del DataTable. */
    render() {
      if (this.state.loading) {
        this._renderSkeleton();
        this.footer.innerHTML = "";
        return;
      }

      const processed = this._getProcessedData();
      const total = processed.length;

      // Paginación
      let pageRows = processed;
      let start = 0;
      let end = total;
      if (this.opts.pagination) {
        const size = this.state.pageSize;
        const totalPages = Math.max(1, Math.ceil(total / size));
        if (this.state.page > totalPages) this.state.page = totalPages;
        start = (this.state.page - 1) * size;
        end = Math.min(start + size, total);
        pageRows = processed.slice(start, end);
      }

      this._renderBody(pageRows, total);
      this._renderFooter(total, start, end);
    }

    /** @desc Renderiza el tbody con filas y estado vacío. @param {Array} rows @param {number} total */
    _renderBody(rows, total) {
      const H = Helpers;
      this.tbody.innerHTML = "";

      if (!total) {
        const tr = H.el("tr");
        const td = H.el("td", { colspan: this.columns.length });
        td.appendChild(this._emptyState());
        tr.appendChild(td);
        this.tbody.appendChild(tr);
        return;
      }

      rows.forEach((row) => {
        const tr = H.el("tr");
        this.columns.forEach((col) => {
          const td = H.el("td", { "data-label": col.label });
          let content = row[col.key];
          if (typeof col.render === "function") {
            const rendered = col.render(content, row);
            if (rendered instanceof Node) td.appendChild(rendered);
            else td.innerHTML = rendered == null ? "" : String(rendered);
          } else {
            td.textContent = content == null ? "" : String(content);
          }
          tr.appendChild(td);
        });
        this.tbody.appendChild(tr);
      });
    }

    /** @desc Crea el elemento de estado vacío con ilustración. @returns {HTMLElement} */
    _emptyState() {
      const H = Helpers;
      const wrap = H.el("div", { class: "ak-dt__empty" });
      const illustration = H.el("div", { class: "ak-dt__empty-illustration" });
      illustration.innerHTML =
        '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<rect x="8" y="14" width="48" height="36" rx="4" stroke="currentColor" stroke-width="2"/>' +
        '<line x1="8" y1="24" x2="56" y2="24" stroke="currentColor" stroke-width="2"/>' +
        '<line x1="20" y1="34" x2="44" y2="34" stroke="currentColor" stroke-width="2"/>' +
        '<line x1="20" y1="42" x2="36" y2="42" stroke="currentColor" stroke-width="2"/>' +
        '<circle cx="46" cy="46" r="10" fill="var(--ak-bg)" stroke="currentColor" stroke-width="2"/>' +
        '<line x1="53" y1="53" x2="60" y2="60" stroke="currentColor" stroke-width="2"/>' +
        "</svg>";
      wrap.appendChild(illustration);
      wrap.appendChild(H.el("div", { text: this.opts.emptyText }));
      return wrap;
    }

    /** @desc Renderiza filas skeleton para estado de carga. */
    _renderSkeleton() {
      const H = Helpers;
      this.tbody.innerHTML = "";
      const rows = this.state.pageSize > 10 ? 10 : this.state.pageSize;
      for (let r = 0; r < rows; r++) {
        const tr = H.el("tr", { class: "ak-dt__skeleton-row" });
        this.columns.forEach(() => {
          const td = H.el("td");
          td.appendChild(H.el("span", { class: "ak-skeleton", style: "width:" + (50 + Math.random() * 45) + "%" }));
          tr.appendChild(td);
        });
        this.tbody.appendChild(tr);
      }
    }

    /** @desc Renderiza paginación, info de registros y selector de pageSize. */
    _renderFooter(total, start, end) {
      const H = Helpers;
      this.footer.innerHTML = "";
      if (!this.opts.pagination) {
        this.footer.appendChild(
          H.el("div", { class: "ak-dt__info", text: total + " registros" })
        );
        return;
      }

      // Selector de tamaño de página
      const sizeWrap = H.el("div", { class: "ak-dt__page-size" }, [
        H.el("span", { text: "Filas:" }),
      ]);
      const sel = H.el("select", { "aria-label": "Filas por página" });
      this.opts.pageSizeOptions.forEach((n) => {
        const o = H.el("option", { value: n, text: String(n) });
        if (n === this.state.pageSize) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", (e) => {
        this.state.pageSize = Number(e.target.value);
        this.state.page = 1;
        this.render();
      });
      sizeWrap.appendChild(sel);

      // Indicador Mostrando X-Y de Z
      const info = H.el("div", {
        class: "ak-dt__info",
        text: total
          ? "Mostrando " + (start + 1) + "-" + end + " de " + total + " registros"
          : "Sin registros",
      });

      // Botones de paginación
      const totalPages = Math.max(1, Math.ceil(total / this.state.pageSize));
      const page = this.state.page;
      const pag = H.el("div", { class: "ak-dt__pagination", role: "navigation", "aria-label": "Paginación" });

      const mkBtn = (label, targetPage, opts = {}) => {
        const btn = H.el("button", {
          class: "ak-dt__page-btn" + (opts.active ? " ak-is-active" : ""),
          type: "button",
          html: label,
          "aria-label": opts.ariaLabel || undefined,
        });
        if (opts.disabled) btn.disabled = true;
        if (opts.active) btn.setAttribute("aria-current", "page");
        btn.addEventListener("click", () => {
          this.state.page = targetPage;
          this.render();
          Helpers.emit(this.root, "ak:datatable:page", { instance: this, page: targetPage });
        });
        return btn;
      };

      pag.appendChild(mkBtn("&laquo;", 1, { disabled: page === 1, ariaLabel: "Primera página" }));
      pag.appendChild(mkBtn("&lsaquo;", page - 1, { disabled: page === 1, ariaLabel: "Anterior" }));

      // Rango de números (máx 5 visibles centrados)
      const windowSize = 5;
      let from = Math.max(1, page - Math.floor(windowSize / 2));
      let to = Math.min(totalPages, from + windowSize - 1);
      from = Math.max(1, to - windowSize + 1);
      for (let p = from; p <= to; p++) {
        pag.appendChild(mkBtn(String(p), p, { active: p === page, ariaLabel: "Página " + p }));
      }

      pag.appendChild(mkBtn("&rsaquo;", page + 1, { disabled: page === totalPages, ariaLabel: "Siguiente" }));
      pag.appendChild(mkBtn("&raquo;", totalPages, { disabled: page === totalPages, ariaLabel: "Última página" }));

      this.footer.appendChild(sizeWrap);
      this.footer.appendChild(info);
      this.footer.appendChild(pag);
    }

    /* ---- Exportación CSV (dataset filtrado) ---------------------------- */
    exportCsv() {
      const rows = this._getProcessedData();
      const headers = this.columns.map((c) => c.label);
      const escapeCsv = (v) => {
        if (v == null) return "";
        const s = String(v);
        return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      const lines = [headers.map(escapeCsv).join(",")];
      rows.forEach((row) => {
        lines.push(this.columns.map((c) => escapeCsv(row[c.key])).join(","));
      });
      const csv = "\uFEFF" + lines.join("\r\n"); // BOM para Excel
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = Helpers.el("a", { href: url, download: this.opts.exportFileName });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Helpers.emit(this.root, "ak:datatable:export", { instance: this, rows: rows.length });
    }

    /* ---- API pública de instancia -------------------------------------- */
    /** Reemplaza los datos y re-renderiza. */
    setData(data) {
      this.data = Array.isArray(data) ? data.slice() : [];
      this.state.page = 1;
      this.table.setAttribute("aria-rowcount", this.data.length);
      this.render();
    }

    /** Muestra/oculta estado de carga (skeleton). */
    setLoading(loading) {
      this.state.loading = !!loading;
      this.render();
    }

    /** Refresca el render con el estado actual. */
    refresh() {
      this.render();
    }

    /** Destruye la instancia y restaura el elemento original. */
    destroy() {
      if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
      this.target.style.display = "";
      registry.delete(this.target);
    }
  }

  /* ==========================================================================
   * 6. DATEPICKER — clase AkDatePicker (3 vistas: días, meses, años)
   * Basado en el patrón de bootstrap-datepicker.
   * ======================================================================== */
  /**
   * DatePicker con 3 vistas (días, meses, años), soporte de minDate/maxDate/
   * excludeDates/daysOfWeekDisabled, footer con todayBtn/clearBtn, y
   * encadenamiento de rango (DateRange).
   *
   * Navegación:
   *   - Vista días:  ←  Mes Año  →   (clic en mes/año → vista meses)
   *   - Vista meses: ←   Año    →   (clic en año → vista años; clic mes → días)
   *   - Vista años:  ←  década  →   (clic año → vista meses)
   *
   * @class
   * @param {HTMLInputElement} input - Elemento input
   * @param {Object} [options]
   * @param {string} [options.format="YYYY-MM-DD"]
   * @param {string} [options.placeholder="Selecciona fecha..."]
   * @param {string} [options.minDate] - Fecha mínima (YYYY-MM-DD)
   * @param {string} [options.maxDate] - Fecha máxima (YYYY-MM-DD)
   * @param {string[]} [options.excludeDates] - Fechas deshabilitadas
   * @param {number[]} [options.daysOfWeekDisabled] - Días de semana [0..6]
   * @param {boolean} [options.autoclose=true] - Cerrar al seleccionar fecha
   * @param {boolean} [options.todayBtn=true] - Botón "Hoy"
   * @param {boolean} [options.clearBtn=true] - Botón "Limpiar"
   * @param {boolean} [options.todayHighlight=true] - Resaltar hoy
   * @param {number} [options.startView=0] - 0=días, 1=meses, 2=años
   * @fires ak:datepicker:change - Al seleccionar fecha {value, date}
   */
  const V_DAYS = 0, V_MONTHS = 1, V_YEARS = 2, V_TIME = 3;

  class AkDatePicker {
    constructor(input, options = {}) {
      if (!(input instanceof HTMLInputElement)) {
        throw new Error("datepicker() requiere un elemento <input>.");
      }
      this.input = input;
      this.id = input.id || nextId();

      const now = new Date();
      this.opts = Object.assign({
        format: "YYYY-MM-DD",
        placeholder: "Selecciona fecha...",
        minDate: null,
        maxDate: null,
        excludeDates: [],
        daysOfWeekDisabled: [],
        autoclose: true,
        todayBtn: true,
        clearBtn: true,
        todayHighlight: true,
        startView: V_DAYS,
        showTrigger: true,
      }, options);

      this.hasTime = /HH|mm/.test(this.opts.format);

      if (typeof this.opts.excludeDates === "string") {
        this.opts.excludeDates = this.opts.excludeDates.split(",").map(s => s.trim()).filter(Boolean);
      }
      if (typeof this.opts.daysOfWeekDisabled === "string") {
        this.opts.daysOfWeekDisabled = this.opts.daysOfWeekDisabled.split(",").map(s => parseInt(s, 10)).filter(n => !isNaN(n));
      }
      if (input.getAttribute("min")) this.opts.minDate = input.getAttribute("min");
      if (input.getAttribute("max")) this.opts.maxDate = input.getAttribute("max");

      this.state = {
        viewDate: new Date(now.getFullYear(), now.getMonth(), 1),
        selectedDate: null,
        viewLevel: this.opts.startView,
        open: false,
        hour: this.hasTime ? now.getHours() : 0,
        minute: this.hasTime ? now.getMinutes() : 0,
        activeSegment: "hour",
      };

      if (this.input.value) {
        const d = this._parseDate(this.input.value);
        if (d) {
          this.state.selectedDate = d;
          if (this.hasTime) {
            this.state.hour = d.getHours();
            this.state.minute = d.getMinutes();
          }
        }
      }

      this._build();
      this._bind();
    }

    /** @desc Construye el DOM del datepicker container, trigger y overlay. */
    _build() {
      const H = Helpers;
      this.input.setAttribute("autocomplete", "off");
      this.input.setAttribute("readonly", "readonly");
      this.input.classList.add("ak-datepicker-input");
      this.input.placeholder = this.opts.placeholder;

      this.container = H.el("div", { class: "ak-datepicker" });
      this.input.parentNode.insertBefore(this.container, this.input.nextSibling);
      this.container.appendChild(this.input);

      if (this.opts.showTrigger) {
        const trigger = H.el("button", {
          type: "button",
          class: "ak-datepicker-trigger",
          "aria-label": "Abrir calendario",
          tabindex: "-1",
          onclick: (e) => { e.stopPropagation(); this._open(); },
        });
        trigger.innerHTML =
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' +
          '</svg>';
        this.container.appendChild(trigger);
      }

      this.overlay = H.el("div", { class: "ak-datepicker__overlay" });
      document.body.appendChild(this.overlay);

      this._render();
    }

    /** @desc Vincula eventos de click y teclado al input. */
    _bind() {
      this.input.addEventListener("focus", () => this._open());
      document.addEventListener("click", (e) => {
        if (this.state.open && !this.container.contains(e.target) && !this.overlay.contains(e.target)) this._close();
      });
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this._close();
      });
      this.input.addEventListener("keydown", (e) => {
        if (this.state.open) this._handleKeyboard(e);
      });
    }

    /** @desc Maneja navegación por teclado en las vistas. @param {KeyboardEvent} e */
    _handleKeyboard(e) {
      if (this.state.viewLevel === V_TIME) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (this.state.activeSegment === "hour") this.state.hour = (this.state.hour + 1) % 24;
          else this.state.minute = (this.state.minute + 5) % 60;
          this._updateTimeValue();
          this._render();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (this.state.activeSegment === "hour") this.state.hour = (this.state.hour + 23) % 24;
          else this.state.minute = (this.state.minute + 55) % 60;
          this._updateTimeValue();
          this._render();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          this.state.activeSegment = this.state.activeSegment === "hour" ? "minute" : "hour";
          this._render();
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (this.state.selectedDate) {
            this.state.selectedDate.setHours(this.state.hour, this.state.minute, 0, 0);
            this.input.value = this._fmtDate(this.state.selectedDate);
          }
          this.state.viewLevel = V_DAYS;
          this._render();
        }
        return;
      }
      if (this.state.viewLevel !== V_DAYS) return;
      const d = this.state.viewDate;
      let moved = false;
      switch (e.key) {
        case "ArrowLeft":  d.setDate(d.getDate() - 1); moved = true; break;
        case "ArrowRight": d.setDate(d.getDate() + 1); moved = true; break;
        case "ArrowUp":    d.setDate(d.getDate() - 7); moved = true; break;
        case "ArrowDown":  d.setDate(d.getDate() + 7); moved = true; break;
        case "Enter": {
          const sel = this._findClosestEnabled(d);
          if (sel) { this._selectDate(sel); e.preventDefault(); }
          return;
        }
      }
      if (moved) {
        const clamped = this._clampViewDate(d);
        this.state.viewDate = clamped;
        this._render();
        e.preventDefault();
      }
    }

    /** @desc Actualiza el input con la hora/minuto actual del estado. */
    _updateTimeValue() {
      if (this.state.selectedDate) {
        this.state.selectedDate.setHours(this.state.hour, this.state.minute, 0, 0);
        this.input.value = this._fmtDate(this.state.selectedDate);
      }
    }

    /** @desc Busca la fecha habilitada más cercana. @param {Date} date @returns {Date} */
    _findClosestEnabled(date) {
      for (let offset = 0; offset < 31; offset++) {
        const fwd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
        const bwd = new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
        if (!this._isDisabled(fwd)) return fwd;
        if (!this._isDisabled(bwd)) return bwd;
      }
      return date;
    }

    /** @desc Limita la fecha de navegación entre minDate y maxDate. @param {Date} d @returns {Date} */
    _clampViewDate(d) {
      const clamped = new Date(d);
      if (this.opts.minDate && clamped < this._parseDate(this.opts.minDate)) {
        return this._parseDate(this.opts.minDate);
      }
      if (this.opts.maxDate && clamped > this._parseDate(this.opts.maxDate)) {
        return this._parseDate(this.opts.maxDate);
      }
      return clamped;
    }

    /** @desc Renderiza la vista activa (días, meses, años o tiempo). */
    _render() {
      this.overlay.innerHTML = "";
      switch (this.state.viewLevel) {
        case V_YEARS: this._renderYearsView(); break;
        case V_MONTHS: this._renderMonthsView(); break;
        case V_TIME: this._renderTimeView(); break;
        default: this._renderDaysView(); break;
      }
      this._renderFooter();
      if (this.state.viewLevel === V_TIME) this.input.focus({ preventScroll: true });
    }

    /* ---- Header compartido ------------------------------------------ */

    /**
     * @param {string} label
     * @param {Function} prevClick
     * @param {Function} nextClick
     * @param {Function} [titleClick]  — va a vista superior
     */
    _mkHeader(label, prevClick, nextClick, titleClick) {
      const H = Helpers;
      const h = H.el("div", { class: "ak-datepicker__header" });
      h.appendChild(H.el("button", {
        type: "button", class: "ak-datepicker__nav", html: "‹",
        onclick: (e) => { e.stopPropagation(); prevClick(); },
      }));
      const title = H.el("span", { class: "ak-datepicker__month-label", text: label });
      if (titleClick) {
        title.style.cursor = "pointer";
        title.addEventListener("click", (e) => { e.stopPropagation(); titleClick(); });
      }
      h.appendChild(title);
      h.appendChild(H.el("button", {
        type: "button", class: "ak-datepicker__nav", html: "›",
        onclick: (e) => { e.stopPropagation(); nextClick(); },
      }));
      return h;
    }

    /** @desc Renderiza footer con botones Hoy, Limpiar y selector hora. */
    _renderFooter() {
      const H = Helpers;
      const showToday = this.opts.todayBtn;
      const showClear = this.opts.clearBtn;
      if (!showToday && !showClear && !this.hasTime) return;

      const footer = H.el("div", { class: "ak-datepicker__footer" });

      // Clock icon button (for datetime format, only in day view)
      if (this.hasTime && this.state.viewLevel !== V_TIME) {
        const timeRow = H.el("div", { style: "display:flex;align-items:center;justify-content:center;gap:8px;padding:4px 0 8px;border-bottom:1px solid var(--ak-border);margin-bottom:8px;width:100%;" });
        const clockBtn = H.el("button", {
          type: "button",
          style: "background:none;border:none;cursor:pointer;color:var(--ak-text-muted);padding:4px 8px;border-radius:4px;display:flex;align-items:center;gap:6px;font-size:.85rem;font-family:inherit;transition:color var(--ak-transition),background var(--ak-transition);",
          html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <span>' + String(this.state.hour).padStart(2, "0") + ':' + String(this.state.minute).padStart(2, "0") + '</span>',
          onclick: (e) => {
            e.stopPropagation();
            this.state.viewLevel = V_TIME;
            this._render();
          },
        });
        timeRow.appendChild(clockBtn);
        footer.appendChild(timeRow);
      }

      if (showToday || showClear || this.hasTime) {
        const btnRow = H.el("div", { style: "display:flex;gap:6px;justify-content:center;" });
        if (showToday) {
          btnRow.appendChild(H.el("button", {
            type: "button", class: "ak-btn ak-btn-sm ak-btn-primary",
            text: "Hoy",
            onclick: (e) => {
              e.stopPropagation();
              const today = new Date();
              if (this.hasTime) { today.setHours(this.state.hour, this.state.minute, 0, 0); }
              else { today.setHours(0, 0, 0, 0); }
              if (!this._isDisabled(today)) this._selectDate(today);
            },
          }));
        }
        if (showClear) {
          btnRow.appendChild(H.el("button", {
            type: "button", class: "ak-btn ak-btn-sm ak-btn-light",
            text: "Limpiar",
            onclick: (e) => {
              e.stopPropagation();
              this._clearDate();
            },
          }));
        }
        if (this.hasTime && this.state.viewLevel !== V_TIME) {
          btnRow.appendChild(H.el("button", {
            type: "button", class: "ak-btn ak-btn-sm ak-btn-primary",
            text: "OK",
            onclick: (e) => { e.stopPropagation(); this._close(); },
          }));
        }
        footer.appendChild(btnRow);
      }
      this.overlay.appendChild(footer);
    }

    /** @desc Verifica si una fecha está deshabilitada. @param {Date} date @returns {boolean} */
    _isDisabled(date) {
      if (!date) return true;
      const ds = this._fmtDate(date);
      if (this.opts.excludeDates && this.opts.excludeDates.includes(ds)) return true;
      if (this.opts.daysOfWeekDisabled && this.opts.daysOfWeekDisabled.includes(date.getDay())) return true;
      if (this.opts.minDate && date < this._parseDate(this.opts.minDate)) return true;
      if (this.opts.maxDate && date > this._parseDate(this.opts.maxDate)) return true;
      return false;
    }

    /** @desc Renderiza la vista de días del calendario. */
    _renderDaysView() {
      const H = Helpers;
      const year = this.state.viewDate.getFullYear();
      const month = this.state.viewDate.getMonth();
      const MONTHS = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
      ];
      const DAYS = ["Do","Lu","Ma","Mi","Ju","Vi","Sa"];

      this.overlay.appendChild(this._mkHeader(
        MONTHS[month] + " " + year,
        () => { this.state.viewDate.setMonth(month - 1); this._render(); },
        () => { this.state.viewDate.setMonth(month + 1); this._render(); },
        () => { this.state.viewLevel = V_MONTHS; this._render(); }
      ));

      const dayHeader = H.el("div", { class: "ak-datepicker__day-header" });
      DAYS.forEach(d => dayHeader.appendChild(H.el("span", { text: d })));
      this.overlay.appendChild(dayHeader);

      const grid = H.el("div", { class: "ak-datepicker__grid" });
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      const todayStr = this._fmtDate(today);

      for (let i = 0; i < firstDay; i++) {
        grid.appendChild(H.el("span", { class: "ak-datepicker__day ak-datepicker__day--empty" }));
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dateStr = this._fmtDate(date);
        const classes = ["ak-datepicker__day"];
        if (this.opts.todayHighlight && dateStr === todayStr) classes.push("ak-datepicker__day--today");
        if (this.state.selectedDate && dateStr === this._fmtDate(this.state.selectedDate)) {
          classes.push("ak-datepicker__day--selected");
        } else if (!this.state.selectedDate && dateStr === todayStr) {
          classes.push("ak-datepicker__day--selected");
        }
        if (this._isDisabled(date)) classes.push("ak-datepicker__day--disabled");

        const dayEl = H.el("span", { class: classes.join(" "), text: String(d) });
        if (!classes.includes("ak-datepicker__day--disabled")) {
          dayEl.addEventListener("click", (e) => {
            e.stopPropagation();
            this._selectDate(date);
          });
        }
        grid.appendChild(dayEl);
      }
      this.overlay.appendChild(grid);
    }

    /** @desc Renderiza la vista de meses del calendario. */
    _renderMonthsView() {
      const H = Helpers;
      const year = this.state.viewDate.getFullYear();
      const SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

      this.overlay.appendChild(this._mkHeader(
        String(year),
        () => { this.state.viewDate.setFullYear(year - 1); this._render(); },
        () => { this.state.viewDate.setFullYear(year + 1); this._render(); },
        () => { this.state.viewLevel = V_YEARS; this._render(); }
      ));

      const grid = H.el("div", { class: "ak-datepicker__month-grid" });
      for (let m = 0; m < 12; m++) {
        const classes = ["ak-datepicker__item"];
        const firstOfMonth = new Date(year, m, 1);
        const lastOfMonth = new Date(year, m + 1, 0);
        if (this.state.selectedDate &&
            this.state.selectedDate.getFullYear() === year &&
            this.state.selectedDate.getMonth() === m) {
          classes.push("ak-datepicker__item--selected");
        }
        if (this.opts.maxDate && firstOfMonth > this._parseDate(this.opts.maxDate)) {
          classes.push("ak-datepicker__item--disabled");
        }
        if (this.opts.minDate && lastOfMonth < this._parseDate(this.opts.minDate)) {
          classes.push("ak-datepicker__item--disabled");
        }
        const el = H.el("span", { class: classes.join(" "), text: SHORT[m] });
        if (!classes.includes("ak-datepicker__item--disabled")) {
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            this.state.viewDate.setFullYear(year);
            this.state.viewDate.setMonth(m);
            this.state.viewLevel = V_DAYS;
            this._render();
          });
        }
        grid.appendChild(el);
      }
      this.overlay.appendChild(grid);
    }

    /** @desc Renderiza la vista de años (década). */
    _renderYearsView() {
      const H = Helpers;
      const year = this.state.viewDate.getFullYear();
      const startDecade = Math.floor(year / 10) * 10;

      this.overlay.appendChild(this._mkHeader(
        startDecade + "–" + (startDecade + 9),
        () => { this.state.viewDate.setFullYear(startDecade - 10); this._render(); },
        () => { this.state.viewDate.setFullYear(startDecade + 10); this._render(); },
        null
      ));

      const grid = H.el("div", { class: "ak-datepicker__year-grid" });
      for (let i = 0; i < 12; i++) {
        const y = startDecade + i;
        const classes = ["ak-datepicker__item"];
        if (this.state.selectedDate && this.state.selectedDate.getFullYear() === y) {
          classes.push("ak-datepicker__item--selected");
        }
        const jan1 = new Date(y, 0, 1);
        const dec31 = new Date(y, 11, 31);
        if (this.opts.maxDate && jan1 > this._parseDate(this.opts.maxDate)) {
          classes.push("ak-datepicker__item--disabled");
        }
        if (this.opts.minDate && dec31 < this._parseDate(this.opts.minDate)) {
          classes.push("ak-datepicker__item--disabled");
        }
        const el = H.el("span", { class: classes.join(" "), text: String(y) });
        if (!classes.includes("ak-datepicker__item--disabled")) {
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            this.state.viewDate.setFullYear(y);
            this.state.viewLevel = V_MONTHS;
            this._render();
          });
        }
        grid.appendChild(el);
      }
      this.overlay.appendChild(grid);
    }

    /** @desc Renderiza la vista de selección de hora/minuto. */
    _renderTimeView() {
      const H = Helpers;
      const header = H.el("div", { class: "ak-datepicker__header" });
      const backBtn = H.el("button", {
        type: "button", class: "ak-datepicker__nav", html: "‹",
        onclick: (e) => { e.stopPropagation(); this.state.viewLevel = V_DAYS; this._render(); },
      });
      header.appendChild(backBtn);
      const label = H.el("span", { class: "ak-datepicker__month-label", text: "Seleccionar hora" });
      header.appendChild(label);
      const spacer = H.el("span", { class: "ak-datepicker__nav", style: "visibility:hidden;", html: "›" });
      header.appendChild(spacer);
      this.overlay.appendChild(header);

      const body = H.el("div", { class: "ak-timepicker__body" });
      const activeSeg = this.state.activeSegment || "hour";

      // Columna hora
      body.appendChild(this._mkTimeCol(
        String(this.state.hour).padStart(2, "0"),
        activeSeg === "hour",
        () => { this.state.hour = (this.state.hour + 1) % 24; this._render(); },
        () => { this.state.hour = (this.state.hour + 23) % 24; this._render(); },
        () => { this.state.activeSegment = "hour"; this._render(); }
      ));

      // Separador
      body.appendChild(H.el("span", { class: "ak-timepicker__sep", text: ":" }));

      // Columna minutos
      body.appendChild(this._mkTimeCol(
        String(this.state.minute).padStart(2, "0"),
        activeSeg === "minute",
        () => { this.state.minute = (this.state.minute + 5) % 60; this._render(); },
        () => { this.state.minute = (this.state.minute + 55) % 60; this._render(); },
        () => { this.state.activeSegment = "minute"; this._render(); }
      ));

      this.overlay.appendChild(body);

      // Apply time button
      const applyRow = H.el("div", { style: "display:flex;justify-content:center;padding:8px 0 4px;" });
      applyRow.appendChild(H.el("button", {
        type: "button", class: "ak-btn ak-btn-sm ak-btn-primary",
        text: "Aplicar hora",
        onclick: (e) => {
          e.stopPropagation();
          if (this.state.selectedDate) {
            this.state.selectedDate.setHours(this.state.hour, this.state.minute, 0, 0);
            this.input.value = this._fmtDate(this.state.selectedDate);
          }
          this.state.viewLevel = V_DAYS;
          this._render();
        },
      }));
      this.overlay.appendChild(applyRow);
    }

    /** @desc Crea columna de hora/minuto con flechas arriba/abajo.
     *  @param {string} value @param {boolean} active @param {Function} onUp @param {Function} onDown @param {Function} onClick @returns {HTMLElement} */
    _mkTimeCol(value, active, onUp, onDown, onClick) {
      const H = Helpers;
      const col = H.el("div", { class: "ak-timepicker__col" });
      const mkArrow = (dir, action) => {
        const d = dir === "up"
          ? "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
          : "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ak-timepicker__arrow";
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="${d}"/></svg>`;
        btn.onclick = (e) => { e.stopPropagation(); action(); };
        return btn;
      };
      col.appendChild(mkArrow("up", onUp));
      col.appendChild(H.el("span", {
        class: "ak-timepicker__value" + (active ? " ak-timepicker__value--active" : ""),
        text: value,
        onclick: (e) => { e.stopPropagation(); if (!active) onClick(); },
      }));
      col.appendChild(mkArrow("down", onDown));
      return col;
    }

    /** @desc Selecciona una fecha, actualiza el input y emite evento. @param {Date} date */
    _selectDate(date) {
      this.state.selectedDate = date;
      if (this.hasTime) {
        date.setHours(this.state.hour, this.state.minute, 0, 0);
      }
      const formatted = this._fmtDate(date);
      this.input.value = formatted;
      if (this.opts.autoclose && !this.hasTime) this._close();
      else if (this.state.open) this._render();
      Helpers.emit(this.input, "ak:datepicker:change", { value: formatted, date });
      Helpers.emit(this.input, "change", { source: "agrocity-kit" });
    }

    /** @desc Limpia la fecha seleccionada y emite evento. */
    _clearDate() {
      this.state.selectedDate = null;
      this.input.value = "";
      if (this.state.open) this._render();
      Helpers.emit(this.input, "ak:datepicker:change", { value: null, date: null });
      Helpers.emit(this.input, "change", { source: "agrocity-kit" });
    }

    /** @desc Parsea un string según el formato configurado. @param {string} str @returns {Date|null} */
    _parseDate(str) {
      if (!str) return null;
      const fmt = this.opts.format;
      const parts = str.match(/\d+/g);
      if (!parts) return null;
      const fparts = fmt.match(/YYYY|MM|DD|HH|mm/g) || [];
      let y, mo, d, h = 0, mi = 0;
      for (let i = 0; i < fparts.length; i++) {
        const v = Number(parts[i] || 0);
        if (fparts[i] === "YYYY") y = v;
        else if (fparts[i] === "MM") mo = v - 1;
        else if (fparts[i] === "DD") d = v;
        else if (fparts[i] === "HH") h = v;
        else if (fparts[i] === "mm") mi = v;
      }
      if (y != null && mo != null && d != null) return new Date(y, mo, d, h, mi);
      return null;
    }

    /** @desc Formatea una fecha según el formato configurado. @param {Date} date @returns {string} */
    _fmtDate(date) {
      if (!date) return "";
      let out = this.opts.format;
      const y = date.getFullYear();
      const mo = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const h = String(date.getHours()).padStart(2, "0");
      const mi = String(date.getMinutes()).padStart(2, "0");
      out = out.replace("YYYY", y).replace("MM", mo).replace("DD", d);
      if (this.hasTime) {
        out = out.replace("HH", h).replace("mm", mi);
      }
      return out;
    }

    /** @desc Abre el overlay del datepicker y lo posiciona. */
    _open() {
      if (this.state.open) return;
      this.state.open = true;
      this.state.viewLevel = this.opts.startView;
      this.state.viewDate = this.state.selectedDate
        ? new Date(this.state.selectedDate.getFullYear(), this.state.selectedDate.getMonth(), 1)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      this._render();
      this._positionOverlay();
      this.overlay.classList.add("ak-datepicker__overlay--open");
      this.container.classList.add("ak-datepicker--open");
      this._scrollHandler = () => this._positionOverlay();
      this._resizeHandler = () => this._close();
      document.addEventListener("scroll", this._scrollHandler, true);
      window.addEventListener("resize", this._resizeHandler);
    }

    /** @desc Posiciona el overlay flotante respecto al contenedor. */
    _positionOverlay() {
      var rect = this.container.getBoundingClientRect();
      this.overlay.style.position = "fixed";
      this.overlay.style.top = (rect.bottom + 4) + "px";
      this.overlay.style.left = rect.left + "px";
      this.overlay.style.right = "auto";
    }

    /** @desc Cierra el overlay y limpia event listeners. */
    _close() {
      if (!this.state.open) return;
      this.state.open = false;
      this.overlay.classList.remove("ak-datepicker__overlay--open");
      this.container.classList.remove("ak-datepicker--open");
      if (this._scrollHandler) document.removeEventListener("scroll", this._scrollHandler, true);
      if (this._resizeHandler) window.removeEventListener("resize", this._resizeHandler);
      this._scrollHandler = null;
      this._resizeHandler = null;
    }

    /* ---- API pública ------------------------------------------------- */

    /** @desc Abre el datepicker programáticamente. */
    show() { this._open(); }
    /** @desc Cierra el datepicker programáticamente. */
    hide() { this._close(); }
    /** @desc Alterna el estado abierto/cerrado. */
    toggle() { this.state.open ? this._close() : this._open(); }

    /** @returns {string|null} Fecha formateada o null. */
    getValue() { return this.input.value || null; }
    /** @param {string|Date} date - Fecha en formato configurado o Date */
    setValue(date) {
      if (date instanceof Date) {
        this.state.selectedDate = new Date(date);
        this.input.value = this._fmtDate(date);
        this.state.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
        if (this.state.open) { this.state.viewLevel = V_DAYS; this._render(); }
        return;
      }
      const d = this._parseDate(date);
      this.state.selectedDate = d;
      this.input.value = date || "";
      if (d) { this.state.viewDate = new Date(d.getFullYear(), d.getMonth(), 1); }
      if (this.state.open) { this.state.viewLevel = V_DAYS; this._render(); }
    }

    /** @desc Re-renderiza si está abierto. */
    refresh() {
      if (this.state.open) this._render();
    }

    /** @desc Destruye la instancia y limpia el DOM. */
    destroy() {
      this._close();
      if (this.overlay && this.overlay.parentNode) this.overlay.remove();
      this.input.classList.remove("ak-datepicker-input");
      this.input.removeAttribute("readonly");
      this.input.removeAttribute("autocomplete");
      registry.delete(this.input);
    }
  }

  /* ==========================================================================
   * 6b. DATE RANGE — clase AkDateRange
   * Enlaza dos DatePickers para que se validen mutuamente:
   *   - El campo "fin" no puede ser menor que "inicio"
   *   - El campo "inicio" no puede ser mayor que "fin"
   * ======================================================================== */
  /**
   * Vincula dos DatePickers como rango inicio-fin.
   * @class
   * @param {HTMLInputElement|string} startInput - Input o selector de inicio
   * @param {HTMLInputElement|string} endInput - Input o selector de fin
   * @param {Object} [options] - Opciones para ambos pickers
   */
  class AkDateRange {
    constructor(startInput, endInput, options = {}) {
      this.start = AgrocityKit.datepicker(startInput, Object.assign({}, options, { placeholder: "Fecha inicio" }));
      this.end = AgrocityKit.datepicker(endInput, Object.assign({}, options, { placeholder: "Fecha fin" }));
      if (!this.start || !this.end) {
        Helpers.warn("dateRange(): no se pudieron inicializar ambos campos.");
        return;
      }
      this._syncEnd();
      this._syncStart();
      this.start.input.addEventListener("ak:datepicker:change", () => this._syncEnd());
      this.end.input.addEventListener("ak:datepicker:change", () => this._syncStart());
    }

    /** @desc Sincroniza minDate del picker fin con la fecha inicio. */
    _syncEnd() {
      const startVal = this.start.getValue();
      if (startVal) {
        this.end.opts.minDate = startVal;
      } else {
        this.end.opts.minDate = null;
      }
      this.end.refresh();
    }

    /** @desc Sincroniza maxDate del picker inicio con la fecha fin. */
    _syncStart() {
      const endVal = this.end.getValue();
      if (endVal) {
        this.start.opts.maxDate = endVal;
      } else {
        this.start.opts.maxDate = null;
      }
      this.start.refresh();
    }

    /** @returns {AkDatePicker} Instancia del picker inicio. */
    getStart() { return this.start; }
    /** @returns {AkDatePicker} Instancia del picker fin. */
    getEnd() { return this.end; }

    /** @desc Destruye ambos datepickers. */
    destroy() {
      if (this.start && this.start.destroy) this.start.destroy();
      if (this.end && this.end.destroy) this.end.destroy();
    }
  }

  /* ==========================================================================
   * 6c. TIMEPICKER — clase AkTimePicker (rediseñado, más compacto)
   * ======================================================================== */
  /**
   * TimePicker con dropdown de hora y minutos, diseño compacto.
   * @class
   * @param {HTMLInputElement} input
   * @param {Object} [options]
   * @param {boolean} [options.ampm=false] - Formato 12h
   * @param {string} [options.placeholder="Selecciona hora..."]
   * @param {number} [options.minuteStep=5]
   * @param {boolean} [options.autoclose=true]
   * @param {boolean} [options.showTrigger=true] - Muestra botón trigger con icono de reloj
   * @param {string} [options.triggerLabel="Abrir selector de hora"]
   * @fires ak:timepicker:change
   */
  class AkTimePicker {
    constructor(input, options = {}) {
      if (!(input instanceof HTMLInputElement)) {
        throw new Error("timepicker() requiere un elemento <input>.");
      }
      this.input = input;
      this.id = input.id || nextId();

      this.opts = Object.assign({
        ampm: false,
        placeholder: "Selecciona hora...",
        minuteStep: 5,
        autoclose: true,
        clearBtn: true,
        showTrigger: true,
        triggerLabel: "Abrir selector de hora",
      }, options);

      this.state = {
        open: false,
        hour: 12,
        minute: 0,
        ampm: "AM",
        activeSegment: "hour",
      };

      this._parseFromValue();
      this._build();
      this._bind();
    }

    /** @desc Parsea el valor inicial del input al estado interno. */
    _parseFromValue() {
      if (this.input.value) {
        const m = this.input.value.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
        if (m) {
          let h = parseInt(m[1], 10);
          this.state.minute = parseInt(m[2], 10);
          if (m[3]) this.state.ampm = m[3].toUpperCase();
          if (this.opts.ampm) {
            if (m[3] && m[3].toUpperCase() === "PM" && h !== 12) h -= 12;
            if (m[3] && m[3].toUpperCase() === "AM" && h === 12) h = 0;
            this.state.ampm = m[3] ? m[3].toUpperCase() : "AM";
            this.state.hour = h;
          } else {
            this.state.hour = h;
          }
        }
      }
    }

    /** @desc Construye el DOM del timepicker. */
    _build() {
      const H = Helpers;
      this.input.setAttribute("autocomplete", "off");
      this.input.setAttribute("readonly", "readonly");
      this.input.classList.add("ak-timepicker-input");
      this.input.placeholder = this.opts.placeholder;

      this.container = H.el("div", { class: "ak-timepicker" });
      this.input.parentNode.insertBefore(this.container, this.input.nextSibling);
      this.container.appendChild(this.input);

      // Botón trigger (reloj)
      if (this.opts.showTrigger !== false) {
        const trigger = H.el("button", {
          type: "button",
          class: "ak-timepicker-trigger",
          "aria-label": this.opts.triggerLabel,
          tabindex: "-1",
          onclick: (e) => { e.stopPropagation(); this._open(); },
        });
        trigger.innerHTML =
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' +
          '</svg>';
        this.container.appendChild(trigger);
      }

      this.overlay = H.el("div", { class: "ak-timepicker__overlay" });
      document.body.appendChild(this.overlay);

      this._renderPicker();
    }

    /** @desc Renderiza el cuerpo del timepicker con columnas y botones. */
    _renderPicker() {
      const H = Helpers;
      this.overlay.innerHTML = "";

      const body = H.el("div", { class: "ak-timepicker__body" });

      const isHourActive = this.state.activeSegment === "hour";
      const isMinActive = this.state.activeSegment === "minute";

      // Columna hora
      body.appendChild(this._mkCol(
        this._displayHour(),
        isHourActive,
        () => this._adjustHour(1),
        () => this._adjustHour(-1),
        () => { if (!isHourActive) { this.state.activeSegment = "hour"; this._renderPicker(); } }
      ));

      // Separador
      body.appendChild(H.el("span", { class: "ak-timepicker__sep", text: ":" }));

      // Columna minutos
      body.appendChild(this._mkCol(
        String(this.state.minute).padStart(2, "0"),
        isMinActive,
        () => this._adjustMinute(1),
        () => this._adjustMinute(-1),
        () => { if (!isMinActive) { this.state.activeSegment = "minute"; this._renderPicker(); } }
      ));

      // AM/PM — dos botones
      if (this.opts.ampm) {
        const g = H.el("div", { class: "ak-timepicker__ampm-group" });
        ["AM", "PM"].forEach(label => {
          g.appendChild(H.el("button", {
            type: "button",
            class: "ak-timepicker__ampm" + (this.state.ampm === label ? " ak-timepicker__ampm--active" : ""),
            text: label,
            onclick: (e) => { e.stopPropagation(); this.state.ampm = label; this._updateValue(); this._renderPicker(); },
          }));
        });
        body.appendChild(g);
      }

      this.overlay.appendChild(body);

      /* Footer con botones OK y Limpiar */
      const footer = H.el("div", { class: "ak-timepicker__footer" });
      if (this.opts.clearBtn) {
        footer.appendChild(H.el("button", {
          type: "button",
          class: "ak-btn ak-btn-sm ak-btn-light",
          text: "Limpiar",
          onclick: (e) => { e.stopPropagation(); this._clearValue(); },
        }));
      }
      footer.appendChild(H.el("button", {
        type: "button",
        class: "ak-btn ak-btn-sm ak-btn-primary",
        text: "OK",
        onclick: (e) => { e.stopPropagation(); this._updateValue(); this._close(); },
      }));
      this.overlay.appendChild(footer);
    }

    /** @desc Crea columna de hora/minuto con chevrones arriba/abajo.
     *  @param {string} value @param {boolean} active @param {Function} onUp @param {Function} onDown @param {Function} onClick @returns {HTMLElement} */
    _mkCol(value, active, onUp, onDown, onClick) {
      const H = Helpers;
      const col = H.el("div", { class: "ak-timepicker__col" });
      col.appendChild(this._mkChevron("up", onUp));
      col.appendChild(H.el("span", {
        class: "ak-timepicker__value" + (active ? " ak-timepicker__value--active" : ""),
        text: value,
        onclick: (e) => {
          e.stopPropagation();
          if (!active) { onClick(); this.input.focus({ preventScroll: true }); }
        },
      }));
      col.appendChild(this._mkChevron("down", onDown));
      return col;
    }

    /** @desc Crea un botón chevron (arriba/abajo). @param {string} dir @param {Function} action @returns {HTMLElement} */
    _mkChevron(dir, action) {
      const H = Helpers;
      const d = dir === "up"
        ? "M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
        : "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ak-timepicker__arrow";
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="${d}"/></svg>`;
      btn.onclick = (e) => { e.stopPropagation(); action(); this.input.focus({ preventScroll: true }); };
      return btn;
    }

    /** @desc Retorna la hora en formato 12h o 24h. @returns {string} */
    _displayHour() {
      if (this.opts.ampm) {
        if (this.state.hour === 0) return "12";
        if (this.state.hour > 12) return String(this.state.hour - 12).padStart(2, "0");
        return String(this.state.hour).padStart(2, "0");
      }
      return String(this.state.hour).padStart(2, "0");
    }

    /** @desc Ajusta la hora con dirección (+1 o -1). @param {number} dir */
    _adjustHour(dir) {
      let h = this.state.hour + dir;
      if (this.opts.ampm) {
        if (h > 12) h = 1;
        if (h < 1) h = 12;
      } else {
        if (h > 23) h = 0;
        if (h < 0) h = 23;
      }
      this.state.hour = h;
      this._updateValue();
      this._renderPicker();
    }

    /** @desc Ajusta los minutos con dirección (+1 o -1). @param {number} dir */
    _adjustMinute(dir) {
      let m = this.state.minute + dir * this.opts.minuteStep;
      if (m >= 60) m = 0;
      if (m < 0) m = 60 - this.opts.minuteStep;
      this.state.minute = m;
      this._updateValue();
      this._renderPicker();
    }

    /** @desc Formatea hora y minutos a string según ampm. @returns {string} */
    _formatValue() {
      let displayH = this._displayHour();
      let m = String(this.state.minute).padStart(2, "0");
      if (this.opts.ampm) {
        let h24 = this.state.hour;
        if (this.state.ampm === "PM" && h24 !== 12) h24 += 12;
        if (this.state.ampm === "AM" && h24 === 12) h24 = 0;
        return String(h24).padStart(2, "0") + ":" + m + " " + this.state.ampm;
      }
      return displayH + ":" + m;
    }

    /** @desc Actualiza el input con el valor formateado y emite evento. */
    _updateValue() {
      const val = this._formatValue();
      this.input.value = val;
      Helpers.emit(this.input, "ak:timepicker:change", { value: val });
      Helpers.emit(this.input, "change", { source: "agrocity-kit" });
    }

    /** @desc Limpia el valor del input y resetea el estado. */
    _clearValue() {
      this.input.value = "";
      this.state.hour = 12;
      this.state.minute = 0;
      this.state.ampm = "AM";
      this._close();
      Helpers.emit(this.input, "ak:timepicker:change", { value: null });
      Helpers.emit(this.input, "change", { source: "agrocity-kit" });
    }

    /** @desc Vincula eventos de click, teclado y focus al input. */
    _bind() {
      this.input.addEventListener("focus", () => this._open());
      document.addEventListener("click", (e) => {
        if (this.state.open && !this.container.contains(e.target) && !this.overlay.contains(e.target)) this._close();
      });
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { this._close(); return; }
        if (!this.state.open) return;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (this.state.activeSegment === "hour") this._adjustHour(1);
          else this._adjustMinute(1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (this.state.activeSegment === "hour") this._adjustHour(-1);
          else this._adjustMinute(-1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          this.state.activeSegment = this.state.activeSegment === "hour" ? "minute" : "hour";
          this._renderPicker();
        }
      });
    }

    /** @desc Abre el overlay del timepicker. */
    _open() {
      if (this.state.open) return;
      this.state.open = true;
      this._renderPicker();
      this._positionOverlay();
      this.overlay.classList.add("ak-timepicker__overlay--open");
      this.container.classList.add("ak-timepicker--open");
      this._scrollHandler = () => this._positionOverlay();
      this._resizeHandler = () => this._close();
      document.addEventListener("scroll", this._scrollHandler, true);
      window.addEventListener("resize", this._resizeHandler);
    }

    /** @desc Posiciona el overlay flotante respecto al contenedor. */
    _positionOverlay() {
      var rect = this.container.getBoundingClientRect();
      this.overlay.style.position = "fixed";
      this.overlay.style.top = (rect.bottom + 4) + "px";
      this.overlay.style.left = rect.left + "px";
      this.overlay.style.right = "auto";
    }

    /** @desc Cierra el overlay y limpia event listeners. */
    _close() {
      if (!this.state.open) return;
      this.state.open = false;
      this.overlay.classList.remove("ak-timepicker__overlay--open");
      this.container.classList.remove("ak-timepicker--open");
      if (this._scrollHandler) document.removeEventListener("scroll", this._scrollHandler, true);
      if (this._resizeHandler) window.removeEventListener("resize", this._resizeHandler);
      this._scrollHandler = null;
      this._resizeHandler = null;
    }

    /* ---- API pública ------------------------------------------------- */

    /** @desc Abre el timepicker programáticamente. */
    show() { this._open(); }
    /** @desc Cierra el timepicker programáticamente. */
    hide() { this._close(); }
    /** @desc Alterna el estado abierto/cerrado. */
    toggle() { this.state.open ? this._close() : this._open(); }

    /** @returns {string|null} Hora formateada o null. */
    getValue() { return this.input.value || null; }
    /** @param {string|Date} val - Hora en formato HH:mm o Date */
    setValue(val) {
      if (val instanceof Date) {
        var h24 = val.getHours();
        var m = String(val.getMinutes()).padStart(2, "0");
        if (this.opts.ampm) {
          var h12 = h24 % 12 || 12;
          var ampm = h24 >= 12 ? "PM" : "AM";
          val = String(h12).padStart(2, "0") + ":" + m + " " + ampm;
        } else {
          val = String(h24).padStart(2, "0") + ":" + m;
        }
      }
      this.input.value = val || "";
      this._parseFromValue();
      if (this.state.open) this._renderPicker();
    }

    /** @desc Re-renderiza si está abierto. */
    refresh() {
      if (this.state.open) this._renderPicker();
    }

    /** @desc Destruye la instancia y limpia el DOM. */
    destroy() {
      this._close();
      if (this.overlay && this.overlay.parentNode) this.overlay.remove();
      this.input.classList.remove("ak-timepicker-input");
      this.input.removeAttribute("readonly");

      this.input.removeAttribute("autocomplete");
      registry.delete(this.input);
    }
  }

  /* ==========================================================================
   * 6d. TIME RANGE — clase AkTimeRange
   * ======================================================================== */
  /**
   * Vincula dos TimePickers como rango inicio-fin.
   * Marca los campos con .ak-is-invalid si inicio >= fin.
   * @class
   * @param {HTMLInputElement|string} startInput - Input o selector de inicio
   * @param {HTMLInputElement|string} endInput - Input o selector de fin
   * @param {Object} [options] - Opciones para ambos pickers
   */
  class AkTimeRange {
    constructor(startInput, endInput, options = {}) {
      this.start = AgrocityKit.timepicker(startInput, Object.assign({}, options, { placeholder: "Hora inicio" }));
      this.end = AgrocityKit.timepicker(endInput, Object.assign({}, options, { placeholder: "Hora fin" }));
      if (!this.start || !this.end) {
        Helpers.warn("timeRange(): no se pudieron inicializar ambos campos.");
        return;
      }
      this._validate();
      this.start.input.addEventListener("ak:timepicker:change", () => this._validate());
      this.end.input.addEventListener("ak:timepicker:change", () => this._validate());
    }

    /** @param {string} val - Hora en formato HH:mm */
    _toMinutes(val) {
      const m = (val || "").match(/^(\d{1,2}):(\d{2})/);
      return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
    }

    /** Valida que inicio < fin, marca .ak-is-invalid si no cumple */
    _validate() {
      const sv = this.start.getValue();
      const ev = this.end.getValue();
      if (sv && ev) {
        const sm = this._toMinutes(sv);
        const em = this._toMinutes(ev);
        if (sm !== null && em !== null && sm >= em) {
          this.start.input.classList.add("ak-is-invalid");
          this.end.input.classList.add("ak-is-invalid");
          return;
        }
      }
      this.start.input.classList.remove("ak-is-invalid");
      this.end.input.classList.remove("ak-is-invalid");
    }

    /** @returns {AkTimePicker} */
    getStart() { return this.start; }
    /** @returns {AkTimePicker} */
    getEnd() { return this.end; }

    /** Destruye ambos TimePickers */
    destroy() {
      if (this.start && this.start.destroy) this.start.destroy();
      if (this.end && this.end.destroy) this.end.destroy();
    }
  }

  /* ==========================================================================
   * 7. PLUGINS DE COMPORTAMIENTO (Bootstrap parity)
   * --------------------------------------------------------------------------
   * Controlables por atributos data-ak-* o por API JS:
   *   AgrocityKit.modal(target).show()/hide()/toggle()
   *   AgrocityKit.offcanvas / collapse / tab / dropdown / toast
   *   AgrocityKit.tooltip / popover / carousel / alert
   * ======================================================================== */
  const H = Helpers;

  /* ---- Utilidad: resolver un único elemento --------------------------- */
  /** @desc Resuelve un selector/elemento a un único elemento DOM.
   *  @param {string|Element} target @returns {Element|null} */
  function one(target) {
    const els = H.resolveElements(target);
    return els.length ? els[0] : null;
  }

  /* ---- ALERT (dismiss) ------------------------------------------------- */
  /**
   * Alerta descartable. Se cierra con botón data-ak-dismiss="alert".
   * @class
   * @param {HTMLElement} el - Elemento .ak-alert
   * @fires ak:alert:close - Antes de cerrar
   * @fires ak:alert:closed - Después de eliminar
   */
  class AkAlert {
    /** @param {HTMLElement} el */
    constructor(el) { this.el = el; }
    /** @desc Cierra la alerta con animación. */
    close() {
      H.emit(this.el, "ak:alert:close", {});
      this.el.classList.add("ak-hiding");
      const remove = () => {
        this.el.remove();
        H.emit(document, "ak:alert:closed", {});
      };
      if (this.el.classList.contains("ak-fade")) {
        setTimeout(remove, 200);
      } else remove();
    }
  }

  /* ---- BUTTON (toggle) ------------------------------------------------- */
  /**
   * Botón con estado toggle (active/inactive).
   * @class
   * @param {HTMLElement} el - Elemento botón
   */
  class AkButton {
    /** @param {HTMLElement} el */
    constructor(el) { this.el = el; }
    /** @desc Alterna estado active/inactive del botón. */
    toggle() {
      const active = this.el.classList.toggle("ak-active");
      this.el.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  /* ---- COLLAPSE -------------------------------------------------------- */
  /**
   * Collapse con animación de altura. Controlable por API o data-ak-toggle="collapse".
   * @class
   * @param {HTMLElement} el - Elemento a colapsar
   * @fires ak:collapse:show - Cuando se abre
   * @fires ak:collapse:hide - Cuando se cierra
   */
  class AkCollapse {
    /** @param {HTMLElement} el */
    constructor(el) { this.el = el; }
    /** @desc Verifica si está visible. @returns {boolean} */
    _isShown() { return this.el.classList.contains("ak-show"); }
    /** @desc Abre el collapse con animación. */
    show() {
      if (this._isShown()) return;
      this.el.classList.remove("ak-collapse");
      this.el.classList.add("ak-collapsing");
      this.el.style.height = "0px";
      const target = this.el.scrollHeight;
      requestAnimationFrame(() => { this.el.style.height = target + "px"; });
      const done = () => {
        this.el.classList.remove("ak-collapsing");
        this.el.classList.add("ak-collapse", "ak-show");
        this.el.style.height = "";
        this.el.removeEventListener("transitionend", done);
      };
      this.el.addEventListener("transitionend", done);
      H.emit(this.el, "ak:collapse:show", {});
    }
    /** @desc Cierra el collapse con animación. */
    hide() {
      if (!this._isShown()) return;
      this.el.style.height = this.el.scrollHeight + "px";
      this.el.classList.add("ak-collapsing");
      this.el.classList.remove("ak-collapse", "ak-show");
      requestAnimationFrame(() => { this.el.style.height = "0px"; });
      const done = () => {
        this.el.classList.remove("ak-collapsing");
        this.el.classList.add("ak-collapse");
        this.el.style.height = "";
        this.el.removeEventListener("transitionend", done);
      };
      this.el.addEventListener("transitionend", done);
      H.emit(this.el, "ak:collapse:hide", {});
    }
    /** @desc Alterna el estado del collapse. */
    toggle() { this._isShown() ? this.hide() : this.show(); }
  }

  /* ---- DROPDOWN -------------------------------------------------------- */
  const openDropdowns = new Set();
  /**
   * Dropdown toggle. Controlable por API o data-ak-toggle="dropdown".
   * @class
   * @param {HTMLElement} el - Botón toggler dentro de .ak-dropdown
   * @fires ak:dropdown:show - Cuando se abre
   * @fires ak:dropdown:hide - Cuando se cierra
   */
  class AkDropdown {
    /** @param {HTMLElement} el - Botón toggler dentro de .ak-dropdown */
    constructor(el) {
      // el es el toggler; busca el menú hermano dentro del contenedor .ak-dropdown
      this.toggle = el;
      this.container = el.closest(".ak-dropdown") || el.parentNode;
      this.menu = this.container.querySelector(".ak-dropdown-menu");
      this.toggle.setAttribute("aria-haspopup", "true");
      this.toggle.setAttribute("aria-expanded", "false");
    }
    show() {
      if (!this.menu) return;
      this.menu.classList.add("ak-show");
      this.toggle.setAttribute("aria-expanded", "true");
      openDropdowns.add(this);
      H.emit(this.toggle, "ak:dropdown:show", {});
    }
    hide() {
      if (!this.menu) return;
      this.menu.classList.remove("ak-show");
      this.toggle.setAttribute("aria-expanded", "false");
      openDropdowns.delete(this);
      H.emit(this.toggle, "ak:dropdown:hide", {});
    }
    /** @desc Alterna la visibilidad del menú. */
    toggleMenu() {
      this.menu && this.menu.classList.contains("ak-show") ? this.hide() : this.show();
    }
  }
  // Cierre global de dropdowns al clic fuera
  document.addEventListener("click", (e) => {
    openDropdowns.forEach((dd) => {
      if (!dd.container.contains(e.target)) dd.hide();
    });
  });

  /* ---- MODAL ----------------------------------------------------------- */
  /**
   * Modal con backdrop y teclado (Escape). Controlable por API o data-ak-toggle="modal".
   * @class
   * @param {HTMLElement} el - Elemento .ak-modal
   * @param {Object} [options]
   * @param {boolean|string} [options.backdrop=true] - true, false, o "static"
   * @param {boolean} [options.keyboard=true] - Cerrar con Escape
   * @fires ak:modal:show - Cuando se abre
   * @fires ak:modal:hide - Cuando empieza a cerrarse
   * @fires ak:modal:hidden - Cuando termina de cerrarse
   */
  class AkModal {
    /** @param {HTMLElement} el @param {Object} [options] */
    constructor(el, options = {}) {
      this.el = el;
      this.opts = Object.assign({ backdrop: true, keyboard: true }, options);
      this.backdrop = null;
      this._onKey = (e) => { if (e.key === "Escape" && this.opts.keyboard) this.hide(); };
    }
    show() {
      if (this.el.classList.contains("ak-show")) return;
      if (this.opts.backdrop) {
        this.backdrop = H.el("div", { class: "ak-modal-backdrop" });
        document.body.appendChild(this.backdrop);
        if (this.opts.backdrop !== "static") {
          this.backdrop.addEventListener("click", () => this.hide());
        }
        requestAnimationFrame(() => this.backdrop.classList.add("ak-show"));
      }
      this.el.style.display = "block";
      document.body.classList.add("ak-modal-open");
      requestAnimationFrame(() => this.el.classList.add("ak-show"));
      document.addEventListener("keydown", this._onKey);
      // Botones internos de cierre
      this.el.querySelectorAll("[data-ak-dismiss='modal']").forEach((b) => {
        b.addEventListener("click", () => this.hide(), { once: true });
      });
      H.emit(this.el, "ak:modal:show", {});
    }
    hide() {
      if (!this.el.classList.contains("ak-show")) return;
      this.el.classList.remove("ak-show");
      if (this.backdrop) this.backdrop.classList.remove("ak-show");
      document.removeEventListener("keydown", this._onKey);
      setTimeout(() => {
        this.el.style.display = "none";
        document.body.classList.remove("ak-modal-open");
        if (this.backdrop) { this.backdrop.remove(); this.backdrop = null; }
        H.emit(this.el, "ak:modal:hidden", {});
      }, 200);
      H.emit(this.el, "ak:modal:hide", {});
    }
    toggle() { this.el.classList.contains("ak-show") ? this.hide() : this.show(); }
  }

  /* ---- OFFCANVAS ------------------------------------------------------- */
  /**
   * Panel lateral offcanvas. Controlable por API o data-ak-toggle="offcanvas".
   * @class
   * @param {HTMLElement} el - Elemento .ak-offcanvas
   * @param {Object} [options]
   * @param {boolean} [options.backdrop=true] - Muestra backdrop
   * @param {boolean} [options.keyboard=true] - Cerrar con Escape
   * @fires ak:offcanvas:show - Cuando se abre
   * @fires ak:offcanvas:hide - Cuando se cierra
   */
  class AkOffcanvas {
    /** @param {HTMLElement} el @param {Object} [options] */
    constructor(el, options = {}) {
      this.el = el;
      this.opts = Object.assign({ backdrop: true, keyboard: true }, options);
      this.backdrop = null;
      this._onKey = (e) => { if (e.key === "Escape" && this.opts.keyboard) this.hide(); };
    }
    show() {
      if (this.el.classList.contains("ak-show")) return;
      if (this.opts.backdrop) {
        this.backdrop = H.el("div", { class: "ak-offcanvas-backdrop", onclick: () => this.hide() });
        document.body.appendChild(this.backdrop);
        requestAnimationFrame(() => this.backdrop.classList.add("ak-show"));
      }
      this.el.classList.add("ak-show");
      document.body.classList.add("ak-modal-open");
      document.addEventListener("keydown", this._onKey);
      this.el.querySelectorAll("[data-ak-dismiss='offcanvas']").forEach((b) => {
        b.addEventListener("click", () => this.hide(), { once: true });
      });
      H.emit(this.el, "ak:offcanvas:show", {});
    }
    hide() {
      if (!this.el.classList.contains("ak-show")) return;
      this.el.classList.remove("ak-show");
      document.body.classList.remove("ak-modal-open");
      document.removeEventListener("keydown", this._onKey);
      if (this.backdrop) {
        this.backdrop.classList.remove("ak-show");
        setTimeout(() => { if (this.backdrop) { this.backdrop.remove(); this.backdrop = null; } }, 200);
      }
      H.emit(this.el, "ak:offcanvas:hide", {});
    }
    toggle() { this.el.classList.contains("ak-show") ? this.hide() : this.show(); }
  }

  /* ---- TAB ------------------------------------------------------------- */
  /**
   * Tab pane. Activa el contenido asociado via data-ak-target o href.
   * @class
   * @param {HTMLElement} el - Elemento .ak-nav-link con data-ak-toggle="tab"
   * @fires ak:tab:show - Cuando se activa el tab {target}
   */
  class AkTab {
    /** @param {HTMLElement} el - Elemento nav-link */
    constructor(el) { this.el = el; }
    /** @desc Activa el tab y su panel asociado. */
    show() {
      const targetSel = this.el.getAttribute("data-ak-target") || this.el.getAttribute("href");
      if (!targetSel) return;
      const pane = document.querySelector(targetSel);
      if (!pane) return;
      // Desactivar hermanos del nav
      const navContainer = this.el.closest(".ak-nav") || this.el.parentNode.closest(".ak-nav");
      if (navContainer) {
        navContainer.querySelectorAll(".ak-nav-link").forEach((l) => {
          l.classList.remove("ak-active");
          l.setAttribute("aria-selected", "false");
        });
      }
      // Desactivar panes hermanos
      const content = pane.parentNode;
      content.querySelectorAll(".ak-tab-pane").forEach((p) => p.classList.remove("ak-active"));
      this.el.classList.add("ak-active");
      this.el.setAttribute("aria-selected", "true");
      pane.classList.add("ak-active");
      H.emit(this.el, "ak:tab:show", { target: targetSel });
    }
  }

  /* ---- TOAST ----------------------------------------------------------- */
  /**
   * Toast individual dentro de un contenedor posicionado.
   * @class
   * @param {HTMLElement} el - Elemento .ak-toast
   * @param {Object} [options]
   * @param {number} [options.delay=4000] - Duración en ms (0 = no auto-cierra)
   * @param {boolean} [options.autohide=true] - Cerrar automáticamente
   * @fires ak:toast:show - Cuando se muestra
   * @fires ak:toast:hidden - Cuando se oculta
   */
  class AkToast {
    /** @param {HTMLElement} el @param {Object} [options] */
    constructor(el, options = {}) {
      this.el = el;
      this.opts = Object.assign({ delay: 4000, autohide: true }, options);
    }
    show() {
      this.el.style.display = "";
      requestAnimationFrame(() => this.el.classList.add("ak-show"));
      this.el.querySelectorAll("[data-ak-dismiss='toast']").forEach((b) => {
        b.addEventListener("click", () => this.hide(), { once: true });
      });
      if (this.opts.autohide) {
        this._timer = setTimeout(() => this.hide(), this.opts.delay);
      }
      H.emit(this.el, "ak:toast:show", {});
    }
    hide() {
      clearTimeout(this._timer);
      this.el.classList.remove("ak-show");
      setTimeout(() => {
        this.el.style.display = "none";
        H.emit(this.el, "ak:toast:hidden", {});
      }, 200);
    }
  }

  /**
   * Crea un toast programáticamente en un contenedor posicionado.
   * @param {Object|string} opts - Opciones del toast (o mensaje directo)
   * @param {string} [opts.title=""] - Título del toast
   * @param {string} opts.message - Mensaje del toast
   * @param {string} [opts.position="top-right"] - Posición: top-right, top-left, bottom-right, bottom-left
   * @param {string} [opts.variant="primary"] - Variante de color: success, danger, warning, info, primary
   * @param {number} [opts.delay=4000] - Duración en ms
   * @param {number} [opts.duration=4000] - Alias de delay
   * @param {boolean} [opts.autohide=true] - Auto-cerrar
   * @returns {AkToast} Instancia del toast creado
   */
  function createToast(message, opts) {
    if (typeof message === "string") {
      opts = Object.assign({}, opts || {});
      opts.message = message;
    } else {
      opts = Object.assign({}, message || {});
    }
    const o = Object.assign(
      {
        title: "",
        message: "",
        position: "top-right",
        variant: "primary",
        delay: 4000,
        autohide: true,
      },
      opts
    );
    if (opts.type) o.variant = opts.type;
    if (opts.duration) o.delay = opts.duration;

    const TOAST_SVG = {
      primary:
        '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
      success:
        '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
      danger:
        '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
      warning:
        '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      info: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    };
    const svgPath = TOAST_SVG[o.variant] || TOAST_SVG.primary;
    const iconSvg =
      '<svg class="ak-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      svgPath +
      "</svg>";

    let container = document.querySelector(".ak-toast-container.ak-" + o.position);
    if (!container) {
      container = H.el("div", { class: "ak-toast-container ak-" + o.position });
      document.body.appendChild(container);
    }

    // Cuerpo: título opcional + mensaje
    const bodyChildren = [];
    if (o.title)
      bodyChildren.push(H.el("strong", { class: "ak-toast-title", text: o.title }));
    bodyChildren.push(document.createTextNode(o.message));
    const bodyEl = H.el("div", { class: "ak-toast-body" }, bodyChildren);

    const toastEl = H.el(
      "div",
      { class: "ak-toast ak-toast-" + o.variant, role: "status", "aria-live": "polite" },
      [
        H.el("div", { class: "ak-toast-icon-wrap", html: iconSvg }),
        bodyEl,
        H.el("button", {
          class: "ak-btn-close",
          type: "button",
          "data-ak-dismiss": "toast",
          "aria-label": "Cerrar",
        }),
      ]
    );
    container.appendChild(toastEl);
    const inst = new AkToast(toastEl, { delay: o.delay, autohide: o.autohide });
    inst.show();
    return inst;
  }

  /* ---- TOOLTIP --------------------------------------------------------- */
  /**
   * Tooltip estilo Material. Aparece al hacer hover/focus sobre el elemento.
   * Se controla por API o data-ak-tooltip (con data-ak-title y data-ak-placement).
   * @class
   * @param {HTMLElement} el - Elemento activador
   * @param {Object} [options]
   * @param {string} [options.title=""] - Texto del tooltip
   * @param {string} [options.placement="top"] - Posición: top|bottom|left|right
   */
  class AkTooltip {
    /** @param {HTMLElement} el @param {Object} [options] */
    constructor(el, options = {}) {
      this.el = el;
      this.opts = Object.assign(
        { title: el.getAttribute("data-ak-title") || el.getAttribute("title") || "", placement: "top" },
        options
      );
      if (el.hasAttribute("title")) el.removeAttribute("title"); // evita tooltip nativo
      this.tip = null;
      this._bind();
    }
    /** @desc Vincula eventos mouseenter/mouseleave y focus/blur. */
    _bind() {
      this.el.addEventListener("mouseenter", () => this.show());
      this.el.addEventListener("mouseleave", () => this.hide());
      this.el.addEventListener("focus", () => this.show());
      this.el.addEventListener("blur", () => this.hide());
    }
    /** @desc Muestra el tooltip. */
    show() {
      if (this.tip || !this.opts.title) return;
      this.tip = Helpers.el("div", {
        class: "ak-tooltip",
        role: "tooltip",
        text: this.opts.title,
        "data-placement": this.opts.placement,
      });
      document.body.appendChild(this.tip);
      this._positionPopup(this.tip, this.opts.placement);
      requestAnimationFrame(() => this.tip && this.tip.classList.add("ak-show"));
    }
    /** @desc Calcula posición con auto-flipping según viewport. */
    _positionPopup(tip, preferredPlacement) {
      const r = this.el.getBoundingClientRect();
      const t = tip.getBoundingClientRect();
      const sx = window.scrollX, sy = window.scrollY;
      const gap = 7;
      const space = {
        top: r.top - gap,
        bottom: window.innerHeight - r.bottom - gap,
        left: r.left - gap,
        right: window.innerWidth - r.right - gap,
      };
      let placement = preferredPlacement;
      switch (preferredPlacement) {
        case "top": if (space.top < t.height && space.bottom > space.top) placement = "bottom"; break;
        case "bottom": if (space.bottom < t.height && space.top > space.bottom) placement = "top"; break;
        case "left": if (space.left < t.width && space.right > space.left) placement = "right"; break;
        case "right": if (space.right < t.width && space.left > space.right) placement = "left"; break;
      }
      tip.setAttribute("data-placement", placement);
      let top, left;
      switch (placement) {
        case "bottom": top = r.bottom + sy + gap; left = r.left + sx + (r.width - t.width) / 2; break;
        case "left": top = r.top + sy + (r.height - t.height) / 2; left = r.left + sx - t.width - gap; break;
        case "right": top = r.top + sy + (r.height - t.height) / 2; left = r.right + sx + gap; break;
        default: top = r.top + sy - t.height - gap; left = r.left + sx + (r.width - t.width) / 2;
      }
      tip.style.top = top + "px";
      tip.style.left = Math.max(gap, Math.min(left, window.innerWidth - t.width - gap)) + "px";
    }
    /** @desc Oculta y elimina el tooltip. */
    hide() {
      if (!this.tip) return;
      const tip = this.tip;
      this.tip = null;
      tip.classList.remove("ak-show");
      setTimeout(() => tip.remove(), 150);
    }
  }

  /* ---- POPOVER --------------------------------------------------------- */
  /**
   * Popover con título y contenido HTML. Se activa por clic o hover.
   * Controlable por API o data-ak-popover (con data-ak-title, data-ak-content, data-ak-placement, data-ak-trigger).
   * @class
   * @param {HTMLElement} el - Elemento activador
   * @param {Object} [options]
   * @param {string} [options.title=""] - Título del popover
   * @param {string} [options.content=""] - Contenido HTML
   * @param {string} [options.placement="top"] - Posición: top|bottom|left|right
   * @param {string} [options.trigger="click"] - Activación: click|hover
   */
  class AkPopover {
    /** @param {HTMLElement} el @param {Object} [options] */
    constructor(el, options = {}) {
      this.el = el;
      this.opts = Object.assign(
        {
          title: el.getAttribute("data-ak-title") || "",
          content: el.getAttribute("data-ak-content") || "",
          placement: "top",
          trigger: "click",
        },
        options
      );
      this.pop = null;
      this._bind();
    }
    /** @desc Vincula eventos según trigger configurado (click/hover). */
    _bind() {
      if (this.opts.trigger === "hover") {
        this.el.addEventListener("mouseenter", () => this.show());
        this.el.addEventListener("mouseleave", () => this.hide());
      } else {
        this.el.addEventListener("click", (e) => { e.stopPropagation(); this.toggle(); });
        document.addEventListener("click", (e) => {
          if (this.pop && !this.pop.contains(e.target) && e.target !== this.el) this.hide();
        });
      }
    }
    /** @desc Muestra el popover. */
    show() {
      if (this.pop) return;
      this.pop = Helpers.el("div", { class: "ak-popover", role: "tooltip" }, [
        Helpers.el("div", { class: "ak-popover-arrow" }),
        this.opts.title ? Helpers.el("div", { class: "ak-popover-header", text: this.opts.title }) : null,
        Helpers.el("div", { class: "ak-popover-body", html: this.opts.content }),
      ]);
      document.body.appendChild(this.pop);
      this._positionPopup(this.pop, this.opts.placement);
      requestAnimationFrame(() => this.pop && this.pop.classList.add("ak-show"));
    }
    /** @desc Calcula posición con viewport flipping y posiciona flecha. */
    _positionPopup(pop, preferredPlacement) {
      const r = this.el.getBoundingClientRect();
      const p = pop.getBoundingClientRect();
      const sx = window.scrollX, sy = window.scrollY;
      const arrow = pop.querySelector(".ak-popover-arrow");
      const gap = 10;
      // Detectar espacio disponible en viewport
      const space = {
        top: r.top - gap,
        bottom: window.innerHeight - r.bottom - gap,
        left: r.left - gap,
        right: window.innerWidth - r.right - gap,
      };
      // Elegir la mejor placement según espacio
      let placement = preferredPlacement;
      switch (preferredPlacement) {
        case "top": if (space.top < p.height && space.bottom > space.top) placement = "bottom"; break;
        case "bottom": if (space.bottom < p.height && space.top > space.bottom) placement = "top"; break;
        case "left": if (space.left < p.width && space.right > space.left) placement = "right"; break;
        case "right": if (space.right < p.width && space.left > space.right) placement = "left"; break;
      }
      let top, left;
      switch (placement) {
        case "bottom":
          top = r.bottom + sy + gap;
          left = r.left + sx + (r.width - p.width) / 2;
          break;
        case "left":
          top = r.top + sy + (r.height - p.height) / 2;
          left = r.left + sx - p.width - gap;
          break;
        case "right":
          top = r.top + sy + (r.height - p.height) / 2;
          left = r.right + sx + gap;
          break;
        default: // top
          top = r.top + sy - p.height - gap;
          left = r.left + sx + (r.width - p.width) / 2;
      }
      // Ajustar para no salirse del viewport horizontalmente
      const maxLeft = window.innerWidth - p.width - gap;
      left = Math.max(gap, Math.min(left, maxLeft));
      pop.style.top = top + "px";
      pop.style.left = left + "px";
      // Posicionar flecha
      if (arrow) {
        arrow.className = "ak-popover-arrow ak-popover-arrow--" + placement;
        arrow.style.top = "";
        arrow.style.left = "";
        if (placement === "top" || placement === "bottom") {
          const arrowCenter = r.left + r.width / 2 - left;
          arrow.style.left = Math.max(6, Math.min(arrowCenter - 6, p.width - 18)) + "px";
        } else {
          const arrowCenter = r.top + r.height / 2 - top;
          arrow.style.top = Math.max(6, Math.min(arrowCenter - 6, p.height - 18)) + "px";
        }
      }
    }
    /** @desc Oculta y elimina el popover. */
    hide() {
      if (!this.pop) return;
      const pop = this.pop;
      this.pop = null;
      pop.classList.remove("ak-show");
      setTimeout(() => pop.remove(), 150);
    }
    toggle() { this.pop ? this.hide() : this.show(); }
  }

  /* ---- CAROUSEL -------------------------------------------------------- */
  /**
   * Carrusel de imágenes con auto-play, controles e indicadores.
   * Controlable por API o data-ak-carousel (con data-ak-interval).
   * @class
   * @param {HTMLElement} el - Elemento .ak-carousel
   * @param {Object} [options]
   * @param {number} [options.interval=5000] - Tiempo entre slides en ms
   * @param {boolean} [options.ride=true] - Auto-play al cargar
   * @fires ak:carousel:slide - Al cambiar de slide {index}
   */
  class AkCarousel {
    /** @param {HTMLElement} el @param {Object} [options] */
    constructor(el, options = {}) {
      this.el = el;
      this.opts = Object.assign({ interval: 5000, ride: true }, options);
      this.items = Array.from(el.querySelectorAll(".ak-carousel-item"));
      this.indicators = Array.from(el.querySelectorAll(".ak-carousel-indicators button"));
      this.index = Math.max(0, this.items.findIndex((i) => i.classList.contains("ak-active")));
      if (this.index < 0) this.index = 0;
      this._bind();
      if (this.opts.ride) this._start();
    }
    /** @desc Vincula controles, indicadores y hover pause. */
    _bind() {
      const prev = this.el.querySelector(".ak-carousel-control-prev");
      const next = this.el.querySelector(".ak-carousel-control-next");
      if (prev) prev.addEventListener("click", () => this.prev());
      if (next) next.addEventListener("click", () => this.next());
      this.indicators.forEach((b, i) => b.addEventListener("click", () => this.to(i)));
      this.el.addEventListener("mouseenter", () => this._stop());
      this.el.addEventListener("mouseleave", () => { if (this.opts.ride) this._start(); });
    }
    /** @desc Actualiza slide e indicadores activos. */
    _render() {
      this.items.forEach((it, i) => it.classList.toggle("ak-active", i === this.index));
      this.indicators.forEach((b, i) => b.classList.toggle("ak-active", i === this.index));
      H.emit(this.el, "ak:carousel:slide", { index: this.index });
    }
    /** @desc Va al slide i. @param {number} i */
    to(i) { this.index = (i + this.items.length) % this.items.length; this._render(); }
    /** @desc Va al siguiente slide. */
    next() { this.to(this.index + 1); }
    /** @desc Va al slide anterior. */
    prev() { this.to(this.index - 1); }
    /** @desc Inicia auto-play. */
    _start() { this._stop(); this._timer = setInterval(() => this.next(), this.opts.interval); }
    /** @desc Detiene auto-play. */
    _stop() { clearTimeout(this._timer); clearInterval(this._timer); }
  }

  /* ---- SCROLLSPY ------------------------------------------------------- */
  /**
   * ScrollSpy: actualiza la navegación activa según el scroll del contenedor.
   * Controlable por API o data-ak-scrollspy (con data-ak-target).
   * @class
   * @param {HTMLElement} el - Contenedor con scroll (o document.body)
   * @param {Object} [options]
   * @param {string} [options.target] - Selector del nav con enlaces href="#id"
   * @param {number} [options.offset=10] - Offset en px antes del elemento
   */
  class AkScrollSpy {
    /** @param {HTMLElement} el @param {Object} [options] */
    constructor(el, options = {}) {
      this.el = el; // contenedor con scroll (o window si es body)
      this.opts = Object.assign({ target: null, offset: 10 }, options);
      this.nav = this.opts.target ? one(this.opts.target) : null;
      if (!this.nav) { H.warn("scrollspy: falta data-ak-target"); return; }
      this.links = Array.from(this.nav.querySelectorAll(".ak-nav-link[href^='#'], a[href^='#']"));
      this.targets = this.links
        .map((l) => document.querySelector(l.getAttribute("href")))
        .filter(Boolean);
      this._onScroll = this._spy.bind(this);
      const scroller = el === document.body ? window : el;
      scroller.addEventListener("scroll", this._onScroll, { passive: true });
      this._spy();
    }
    /** @desc Actualiza link activo según posición del scroll. */
    _spy() {
      const scrollY = window.scrollY;
      const scrollTop = (this.el === document.body ? scrollY : this.el.scrollTop) + this.opts.offset + 1;
      let current = null;
      this.targets.forEach((t) => {
        const top = this.el === document.body ? t.getBoundingClientRect().top + scrollY : t.offsetTop;
        if (top <= scrollTop) current = t;
      });
      this.links.forEach((l) => {
        const active = current && l.getAttribute("href") === "#" + current.id;
        l.classList.toggle("ak-active", !!active);
      });
    }
  }

  /* ==========================================================================
   * 6f. LOADER — clase AkLoader (pantalla completa)
   * ======================================================================== */
  let loaderInstance = null;
  let loaderConfig_ = {};
  let customThemeConfig_ = null;

  /**
   * @desc Deriva colores relacionados (hover, on-*, alpha) a partir de colores base.
   *        Solo genera los derivados si no fueron explicitamente proporcionados.
   * @param {Object} vars - Variables CSS base (ej: { '--ak-primary': '#2B7B41' })
   * @return {Object} vars expandidas con derivados
   */
  function deriveThemeVars_(vars) {
    if (!vars) return vars;
    const result = Object.assign({}, vars);

    var hexToRgb = function(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    };

    var darken = function(hex, amount) {
      var rgb = hexToRgb(hex);
      var factor = 1 - amount;
      return 'rgb(' + Math.round(rgb.r * factor) + ', ' + Math.round(rgb.g * factor) + ', ' + Math.round(rgb.b * factor) + ')';
    };

    var luminance = function(hex) {
      var rgb = hexToRgb(hex);
      var rs = rgb.r / 255, gs = rgb.g / 255, bs = rgb.b / 255;
      var rl = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
      var gl = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
      var bl = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
      return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    };

    var toRgba = function(hex, alpha) {
      var rgb = hexToRgb(hex);
      return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
    };

    var colorKeys = {
      '--ak-primary':   { hover: '--ak-primary-hover',   on: '--ak-on-primary' },
      '--ak-secondary': { hover: '--ak-secondary-hover', on: '--ak-on-secondary' },
      '--ak-success':   { hover: '--ak-success-hover',   on: '--ak-on-success' },
      '--ak-danger':    { hover: '--ak-danger-hover',    on: '--ak-on-danger' },
      '--ak-warning':   { hover: '--ak-warning-hover',   on: '--ak-on-warning' },
      '--ak-info':      { hover: '--ak-info-hover',      on: '--ak-on-info' }
    };

    var alphaKeys = {
      '--ak-primary':   [{ v: '--ak-primary-alpha-04', a: 0.04 }, { v: '--ak-primary-alpha-06', a: 0.06 }, { v: '--ak-primary-alpha-08', a: 0.08 }, { v: '--ak-primary-alpha-10', a: 0.10 }, { v: '--ak-primary-alpha-12', a: 0.12 }, { v: '--ak-primary-alpha-13', a: 0.13 }, { v: '--ak-primary-alpha-15', a: 0.15 }, { v: '--ak-primary-alpha-30', a: 0.30 }, { v: '--ak-primary-alpha-50', a: 0.50 }],
      '--ak-danger':    [{ v: '--ak-danger-alpha-10', a: 0.10 }, { v: '--ak-danger-alpha-12', a: 0.12 }, { v: '--ak-danger-alpha-13', a: 0.13 }, { v: '--ak-danger-alpha-15', a: 0.15 }, { v: '--ak-danger-alpha-30', a: 0.30 }],
      '--ak-warning':   [{ v: '--ak-warning-alpha-15', a: 0.15 }, { v: '--ak-warning-alpha-18', a: 0.18 }, { v: '--ak-warning-alpha-40', a: 0.40 }],
      '--ak-info':      [{ v: '--ak-info-alpha-15', a: 0.15 }, { v: '--ak-info-alpha-18', a: 0.18 }, { v: '--ak-info-alpha-40', a: 0.40 }]
    };

    Object.keys(colorKeys).forEach(function(key) {
      var value = result[key];
      if (!value) return;
      var cfg = colorKeys[key];
      if (!result[cfg.hover]) {
        result[cfg.hover] = darken(value, 0.15);
      }
      if (!result[cfg.on]) {
        result[cfg.on] = luminance(value) > 0.5 ? '#1A1A1A' : '#FFFFFF';
      }
    });

    Object.keys(alphaKeys).forEach(function(key) {
      var value = result[key];
      if (!value) return;
      alphaKeys[key].forEach(function(entry) {
        if (!result[entry.v]) {
          result[entry.v] = toRgba(value, entry.a);
        }
      });
    });

    // Deriva --ak-primary-light alpha 14 y 20 si no estan explicitos
    var primaryLight = result['--ak-primary-light'];
    if (primaryLight) {
      if (!result['--ak-primary-alpha-14']) result['--ak-primary-alpha-14'] = toRgba(primaryLight, 0.14);
      if (!result['--ak-primary-alpha-20']) result['--ak-primary-alpha-20'] = toRgba(primaryLight, 0.20);
    }

    return result;
  }

  /**
   * @desc Re-aplica el style custom según el tema actual.
   *        Necesario cuando se llama a theme() después de setTheme().
   */
  function applyCustomTheme_() {
    if (!customThemeConfig_) return;
    var root = document.documentElement;
    var isDark = root.getAttribute("data-theme") === "dark";
    if (isDark && customThemeConfig_.dark) {
      Object.keys(customThemeConfig_.dark).forEach(function(k) { root.style.setProperty(k, customThemeConfig_.dark[k]); });
    } else if (!isDark && customThemeConfig_.light) {
      Object.keys(customThemeConfig_.light).forEach(function(k) { root.style.setProperty(k, customThemeConfig_.light[k]); });
    }
  }

  /**
   * @desc Configura la marca (nombre, slogan) del loader de pantalla completa.
   * @param {Object} config - { brand: { name: 'AGRO<span>CITY</span>', slogan: 'Sembrando tecnología' } }
   */
  function initLoader(config = {}) {
    if (config.brand) {
      loaderConfig_.brand = {
        name: config.brand.name || 'AGRO<span>CITY</span>',
        slogan: config.brand.slogan || 'Sembrando tecnolog&iacute;a'
      };
    }
  }

  /**
   * Loader de pantalla completa con animación agro (pétalos, barra, estados).
   * @class
   * @param {string[]} [messages] - Textos rotativos de estado
   */
  class AkLoader {
    constructor(messages = []) {
      this.messages = messages.length ? messages : ["Loading application", "Please wait"];
      this._build();
    }

    /** Construye y muestra el overlay con la animación */
    _build() {
      const H = Helpers;
      const brand = loaderConfig_.brand || {};
      const brandName = brand.name || 'AGRO<span>CITY</span>';
      const brandSlogan = brand.slogan || 'Sembrando tecnolog&iacute;a';
      this.overlay = H.el("div", { class: "ak-loader-overlay" });
      const wrap = H.el("div", { class: "ak-loader" });

      wrap.innerHTML = `
        <div class="ak-loader__wrap">
          <div class="ak-loader__orbit"></div>
          <div class="ak-loader__petal"></div>
          <div class="ak-loader__petal"></div>
          <div class="ak-loader__petal"></div>
          <div class="ak-loader__bud"></div>
        </div>
        <div class="ak-loader__brand">
          <div class="ak-loader__name">${brandName}</div>
          <div class="ak-loader__slogan">${brandSlogan}</div>
        </div>
        <div class="ak-loader__bar"></div>
        <div class="ak-loader__states">
          ${this.messages.map(m => `<span class="ak-loader__state">${H.escapeHtml(m)}</span>`).join("")}
        </div>
      `;

      this.overlay.appendChild(wrap);
      document.body.appendChild(this.overlay);
      document.body.classList.add("ak-loader-disable-scroll");
      requestAnimationFrame(() => this.overlay.classList.add("ak-loader--open"));
    }

    /** Cierra el loader con fade-out y restaura el scroll */
    close() {
      this.overlay.classList.remove("ak-loader--open");
      this.overlay.classList.add("ak-loader--closing");
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) this.overlay.remove();
        document.body.classList.remove("ak-loader-disable-scroll");
      }, 300);
    }
  }

  /**
   * Muestra u oculta el loader de pantalla completa.
   * @param {boolean} show - true para mostrar, false para ocultar
   * @param {string[]} [messages] - Textos rotativos de estado
   * @returns {AkLoader|undefined}
   */
  function createLoader(show, messages = []) {
    if (show === false) {
      if (loaderInstance) { loaderInstance.close(); loaderInstance = null; }
      return;
    }
    if (loaderInstance) { loaderInstance.close(); loaderInstance = null; }
    loaderInstance = new AkLoader(messages);
    return loaderInstance;
  }

  /* ==========================================================================
   * 6g. DIALOG — alert, confirm, prompt (estilo Bootbox)
   * ======================================================================== */

  /**
   * Construye y muestra un diálogo modal reutilizando estilos .ak-modal-*.
   * @param {Object} opts
   * @param {string} [opts.title] - Título del diálogo
   * @param {string} opts.message - Mensaje
   * @param {string} [opts.type] - "alert" | "confirm" | "prompt"
   * @param {string} [opts.value] - Valor inicial (prompt)
   * @param {string} [opts.placeholder] - Placeholder del input (prompt)
   * @param {Object[]} [opts.buttons] - Botones [{label, variant, action}]
   * @param {Function} [opts.callback] - Callback al cerrar
   * @returns {Object} Referencias {el, backdrop, hide, closeWith, keyHandler, body, footer}
   */
  function showDialog(opts) {
    const H = Helpers;
    if (typeof opts === "string") opts = { message: opts };
    const o = Object.assign({
      title: "",
      message: "",
      type: "alert",
      value: "",
      placeholder: "",
      buttons: [],
      callback: null,
    }, opts);

    const backdrop = H.el("div", { class: "ak-dialog-backdrop" });
    document.body.appendChild(backdrop);

    const content = H.el("div", { class: "ak-modal-content" });
    if (o.title) {
      const hdr = H.el("div", { class: "ak-modal-header" });
      hdr.appendChild(H.el("h5", { class: "ak-modal-title", text: o.title }));
      content.appendChild(hdr);
    }
    const body = H.el("div", { class: "ak-modal-body" });
    body.appendChild(document.createTextNode(o.message));
    if (o.type === "prompt") {
      const input = H.el("input", { type: "text", class: "ak-form-control", value: o.value, placeholder: o.placeholder || o.message });
      body.appendChild(input);
    }
    content.appendChild(body);

    const footer = H.el("div", { class: "ak-modal-footer" });
    o.buttons.forEach(b => {
      footer.appendChild(H.el("button", {
        class: "ak-btn ak-btn-sm ak-btn-" + b.variant,
        text: b.label,
        onclick: (e) => { e.stopPropagation(); b.action(); },
      }));
    });
    content.appendChild(footer);

    const el = H.el("div", { class: "ak-dialog" });
    el.appendChild(content);

    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("ak-show"));

    let closed = false;
    /** @param {*} value - Valor a pasar al callback */
    function closeWith(value) {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", keyHandler);
      el.classList.remove("ak-show");
      backdrop.style.opacity = "0";
      setTimeout(() => {
        el.remove(); backdrop.remove();
        if (o.callback) o.callback(value);
      }, 200);
    }
    const hide = () => closeWith(null);

    const keyHandler = (e) => {
      if (e.key === "Escape") { e.preventDefault(); hide(); }
      if (e.key === "Enter") { e.preventDefault(); closeWith(null); }
    };
    document.addEventListener("keydown", keyHandler);

    return { el, backdrop, hide, closeWith, keyHandler, body, footer };
  }

  /**
   * Normaliza argumentos de alert/confirm a {title, message, callback, buttonText...}.
   * @param {Array} args
   * @returns {Object}
   */
  function _parseDialogArgs(args) {
    if (typeof args[0] === "object" && !Array.isArray(args[0])) return args[0];
    let title = "", message = "", callback = null;
    if (args.length === 1) {
      message = args[0];
    } else if (args.length === 2) {
      if (typeof args[1] === "function") { message = args[0]; callback = args[1]; }
      else { title = args[0]; message = args[1]; }
    } else {
      title = args[0]; message = args[1]; callback = typeof args[2] === "function" ? args[2] : null;
    }
    const obj = typeof args[0] === "object" && !Array.isArray(args[0]) ? args[0] : {};
    return { title, message, callback,
      buttonText: obj.buttonText, buttonVariant: obj.buttonVariant,
      cancelText: obj.cancelText, cancelVariant: obj.cancelVariant,
      confirmText: obj.confirmText, confirmVariant: obj.confirmVariant,
    };
  }

  /**
   * Muestra un diálogo de alerta con un botón.
   * @param {string|Object} title - Mensaje, o {title, message, callback, buttonText, buttonVariant}
   * @param {string} [message] - Mensaje (si title es string)
   * @param {Function} [callback] - Callback al cerrar
   */
  function dialogAlert() {
    const o = _parseDialogArgs(Array.from(arguments));
    const d = showDialog({
      title: o.title || "", message: o.message, type: "alert", callback: o.callback,
      buttons: [{
        label: o.buttonText || "OK",
        variant: o.buttonVariant || "primary",
        action: () => d.closeWith(null),
      }],
    });
  }

  /**
   * Muestra un diálogo de confirmación con dos botones.
   * @param {string|Object} title - Mensaje, o {title, message, callback, cancelText, confirmText, cancelVariant, confirmVariant}
   * @param {string} [message] - Mensaje (si title es string)
   * @param {Function} [callback] - Callback con true/false
   */
  function dialogConfirm() {
    const o = _parseDialogArgs(Array.from(arguments));
    const d = showDialog({
      title: o.title || "", message: o.message, type: "confirm", callback: o.callback,
      buttons: [
        { label: o.cancelText || "Cancelar", variant: o.cancelVariant || "light", action: () => d.closeWith(false) },
        { label: o.confirmText || "Aceptar", variant: o.confirmVariant || "primary", action: () => d.closeWith(true) },
      ],
    });
  }

  /**
   * Muestra un diálogo prompt con input de texto.
   * @param {string|Object} title - Mensaje, o {title, message, value, callback, confirmText, confirmVariant, cancelText, cancelVariant}
   * @param {string} [message] - Mensaje (si title es string)
   * @param {string} [value] - Valor inicial
   * @param {Function} [callback] - Callback con el valor o null
   */
  function dialogPrompt() {
    const args = Array.from(arguments);
    let title = "", message = "", value = "", callback = null;
    if (typeof args[0] === "object" && !Array.isArray(args[0])) {
      const o = args[0];
      title = o.title || ""; message = o.message || ""; value = o.value != null ? o.value : ""; callback = o.callback || null;
    } else if (args.length === 2) {
      if (typeof args[1] === "function") { message = args[0]; callback = args[1]; }
      else { message = args[0]; value = args[1]; }
    } else if (args.length === 3) {
      if (typeof args[2] === "function") { message = args[0]; value = args[1]; callback = args[2]; }
      else { title = args[0]; message = args[1]; value = args[2]; }
    } else if (args.length >= 4) {
      title = args[0]; message = args[1]; value = args[2]; callback = typeof args[3] === "function" ? args[3] : null;
    }
    const d = showDialog({
      title, message, type: "prompt", value, callback,
      buttons: [
        { label: (typeof args[0] === "object" ? args[0].cancelText : null) || "Cancelar",
          variant: (typeof args[0] === "object" ? args[0].cancelVariant : null) || "light",
          action: () => d.closeWith(null) },
        { label: (typeof args[0] === "object" ? args[0].confirmText : null) || "Aceptar",
          variant: (typeof args[0] === "object" ? args[0].confirmVariant : null) || "primary",
          action: () => {
          const input = d.body.querySelector("input");
          d.closeWith(input ? input.value : null);
        }},
      ],
    });
    setTimeout(() => {
      const input = d.body.querySelector("input");
      if (input) {
        input.focus();
        input.select();
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); d.closeWith(input.value); }
        });
      }
    }, 100);
  }

  /* ---- jQuery-lite: Ak() wrapper utilitario -------------------------- */
  /**
   * @class AkCollection
   * @classdesc Colección iterable de elementos DOM con métodos encadenables.
   * Soportado: eventos, manipulación DOM, estilos, clases, navegación.
   */
  function AkCollection(elements) {
    this.length = elements.length;
    for (var i = 0; i < elements.length; i++) { this[i] = elements[i]; }
  }

  /**
   * @desc Itera sobre cada elemento ejecutando fn(indice, elemento).
   * @param {Function} fn
   */
  AkCollection.prototype.each = function (fn) {
    for (var i = 0; i < this.length; i++) fn.call(this[i], i, this[i]);
    return this;
  };

  /** Ejecuta fn cuando el DOM esté listo (solo sobre document) */
  AkCollection.prototype.ready = function (fn) {
    if (this[0] === document) {
      if (document.readyState !== "loading") fn();else document.addEventListener("DOMContentLoaded", fn);
    }
    return this;
  };

  /**
   * Obtiene o asigna el valor del primer elemento del conjunto.
   * @param {string} [value] - Si se omite, retorna el valor actual.
   */
  AkCollection.prototype.val = function (value) {
    if (arguments.length === 0) {
      var el = this[0];
      if (!el) return "";
      if (el.multiple) {
        var a = [];
        for (var i = 0; i < el.options.length; i++) { if (el.options[i].selected) a.push(el.options[i].value); }
        return a;
      }
      return el.value || "";
    }
    return this.each(function () { this.value = value; });
  };

  /** Obtiene o asigna textContent del primer/todos los elementos */
  AkCollection.prototype.text = function (value) {
    if (arguments.length === 0) { return this[0] ? (this[0].textContent || "") : ""; }
    return this.each(function () { this.textContent = value; });
  };

  /** Obtiene o asigna innerHTML del primer/todos los elementos */
  AkCollection.prototype.html = function (value) {
    if (arguments.length === 0) { return this[0] ? (this[0].innerHTML || "") : ""; }
    return this.each(function () { this.innerHTML = value; });
  };

  /** Obtiene o asigna una propiedad del elemento (checked, disabled, etc.) */
  AkCollection.prototype.prop = function (name, value) {
    if (arguments.length === 1) { return this[0] ? this[0][name] : undefined; }
    return this.each(function () { this[name] = value; });
  };

  /** Obtiene o asigna un atributo HTML */
  AkCollection.prototype.attr = function (name, value) {
    if (arguments.length === 1) {
      if (typeof name === 'object' && name !== null) {
        var attrs = name;
        return this.each(function () {
          var el = this;
          Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
        });
      }
      return this[0] ? (this[0].getAttribute(name) || undefined) : undefined;
    }
    return this.each(function () { this.setAttribute(name, value); });
  };

  /** Elimina un atributo HTML */
  AkCollection.prototype.removeAttr = function (name) {
    return this.each(function () { this.removeAttribute(name); });
  };

  /** Muestra los elementos restaurando su display original */
  AkCollection.prototype.show = function () {
    return this.each(function () {
      var prev = this.getAttribute("data-ak-display");
      if (prev) { this.style.display = prev; this.removeAttribute("data-ak-display"); }
      else { this.style.display = ""; }
    });
  };

  /** Oculta los elementos guardando el display anterior */
  AkCollection.prototype.hide = function () {
    return this.each(function () {
      if (this.style.display && this.style.display !== "none") { this.setAttribute("data-ak-display", this.style.display); }
      this.style.display = "none";
    });
  };

  /** Asigna un event listener a cada elemento */
  AkCollection.prototype.on = function (type, fn) {
    return this.each(function () { this.addEventListener(type, fn); });
  };

  /** Remueve un event listener */
  AkCollection.prototype.off = function (type, fn) {
    return this.each(function () { this.removeEventListener(type, fn); });
  };

  /** Asigna handler submit o dispara el evento submit */
  AkCollection.prototype.submit = function (fn) {
    if (fn) return this.each(function () { this.addEventListener("submit", fn); });
    var el = this[0];
    if (el && el.tagName === "FORM") { el.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true })); }
    return this;
  };

  /** Busca descendientes que coincidan con el selector CSS */
  AkCollection.prototype.find = function (sel) {
    var r = [];
    this.each(function () {
      var n = this.querySelectorAll(sel);
      for (var i = 0; i < n.length; i++) r.push(n[i]);
    });
    return new AkCollection(r);
  };

  /** Inserta contenido HTML o elementos al final de cada elemento */
  AkCollection.prototype.append = function (content) {
    if (typeof content === "string") {
      this.each(function () { this.insertAdjacentHTML("beforeend", content); });
    } else if (content instanceof Element) {
      this.each(function () { this.appendChild(content); });
    } else {
      this.each(function () {
        for (var i = 0; i < content.length; i++) { if (content[i] instanceof Element) this.appendChild(content[i]); }
      });
    }
    return this;
  };

  /** Inserta este conjunto como hijo del target (inverso de append) */
  AkCollection.prototype.appendTo = function (target) {
    var t = Ak(target);
    var self = this;
    t.each(function (i, parentEl) {
      self.each(function () {
        var p = this.parentNode;
        if (p) p.removeChild(this);
        parentEl.appendChild(this);
      });
    });
    return this;
  };

  /** Elimina los elementos del DOM */
  AkCollection.prototype.remove = function () {
    return this.each(function () { var p = this.parentNode; if (p) p.removeChild(this); });
  };

  /** Agrega una o más clases CSS */
  AkCollection.prototype.addClass = function (cls) {
    return this.each(function () { this.classList.add(cls); });
  };

  /** Remueve una o más clases CSS */
  AkCollection.prototype.removeClass = function (cls) {
    return this.each(function () { this.classList.remove(cls); });
  };

  /** Alterna una clase CSS */
  AkCollection.prototype.toggleClass = function (cls) {
    return this.each(function () { this.classList.toggle(cls); });
  };

  /** Retorna true si algún elemento tiene la clase especificada */
  AkCollection.prototype.hasClass = function (cls) {
    for (var i = 0; i < this.length; i++) { if (this[i].classList.contains(cls)) return true; }
    return false;
  };

  /** Obtiene o asigna una propiedad de estilo */
  AkCollection.prototype.css = function (prop, value) {
    if (arguments.length === 1) { return this[0] ? getComputedStyle(this[0])[prop] : undefined; }
    return this.each(function () { this.style[prop] = value; });
  };

  /** Retorna una nueva colección con el elemento en el índice dado */
  AkCollection.prototype.eq = function (index) {
    return new AkCollection(index >= 0 && index < this.length ? [this[index]] : []);
  };

  /** Retorna una colección con el primer elemento */
  AkCollection.prototype.first = function () { return this.eq(0); };

  /** Retorna una colección con el último elemento */
  AkCollection.prototype.last = function () { return this.eq(this.length - 1); };

  /** Retorna true si algún elemento coincide con el selector */
  AkCollection.prototype.is = function (sel) {
    for (var i = 0; i < this.length; i++) { if (this[i].matches(sel)) return true; }
    return false;
  };

  /** Retorna el primer ancestro que coincide con el selector */
  AkCollection.prototype.closest = function (sel) {
    var el = this[0];
    return el ? new AkCollection(el.closest(sel) ? [el.closest(sel)] : []) : new AkCollection([]);
  };

  /** Retorna una colección con los padres directos (sin repetir) */
  AkCollection.prototype.parent = function () {
    var r = [];
    this.each(function () { if (this.parentNode && r.indexOf(this.parentNode) === -1) r.push(this.parentNode); });
    return new AkCollection(r);
  };

  /** Retorna los hijos que coinciden con el selector (opcional) */
  AkCollection.prototype.children = function (sel) {
    var r = [];
    this.each(function () {
      var c = sel ? this.querySelectorAll(sel) : this.children;
      for (var i = 0; i < c.length; i++) r.push(c[i]);
    });
    return new AkCollection(r);
  };

  /** Retorna los hermanos que coinciden con el selector (opcional) */
  AkCollection.prototype.siblings = function (sel) {
    var r = [];
    this.each(function () {
      var p = this.parentNode;
      if (!p) return;
      for (var i = 0; i < p.children.length; i++) {
        if (p.children[i] !== this && (!sel || p.children[i].matches(sel))) r.push(p.children[i]);
      }
    });
    return new AkCollection(r);
  };

  /** Dispara un evento personalizado (CustomEvent) en cada elemento */
  AkCollection.prototype.trigger = function (type, detail) {
    return this.each(function () { this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: detail })); });
  };

  /** Enfoca el primer elemento del conjunto */
  AkCollection.prototype.focus = function () {
    var el = this[0];
    if (el) el.focus({ preventScroll: true });
    return this;
  };

  /** Vacía el contenido interno de cada elemento (innerHTML = "") */
  AkCollection.prototype.empty = function () {
    return this.each(function () { this.innerHTML = ""; });
  };

  /** Inserta contenido HTML o elementos al inicio de cada elemento */
  AkCollection.prototype.prepend = function (content) {
    if (typeof content === "string") {
      this.each(function () { this.insertAdjacentHTML("afterbegin", content); });
    } else {
      this.each(function () {
        var ref = this.firstChild;
        for (var i = 0; i < content.length; i++) {
          if (content[i] instanceof Element) this.insertBefore(content[i], ref);
        }
      });
    }
    return this;
  };

  /** Inserta contenido HTML o elementos antes de cada elemento (como hermano) */
  AkCollection.prototype.before = function (content) {
    if (typeof content === "string") {
      this.each(function () { this.insertAdjacentHTML("beforebegin", content); });
    } else {
      this.each(function () {
        var p = this.parentNode;
        if (!p) return;
        for (var i = 0; i < content.length; i++) {
          if (content[i] instanceof Element) p.insertBefore(content[i], this);
        }
      });
    }
    return this;
  };

  /** Inserta contenido HTML o elementos después de cada elemento (como hermano) */
  AkCollection.prototype.after = function (content) {
    if (typeof content === "string") {
      this.each(function () { this.insertAdjacentHTML("afterend", content); });
    } else {
      this.each(function () {
        var p = this.parentNode;
        if (!p) return;
        for (var i = 0; i < content.length; i++) {
          if (content[i] instanceof Element) p.insertBefore(content[i], this.nextSibling);
        }
      });
    }
    return this;
  };

  /** Reemplaza cada elemento en el DOM con nuevo contenido */
  AkCollection.prototype.replaceWith = function (content) {
    if (typeof content === "string") {
      this.each(function () { this.insertAdjacentHTML("afterend", content); }).remove();
    } else {
      this.each(function () {
        var p = this.parentNode;
        if (!p) return;
        for (var i = 0; i < content.length; i++) {
          if (content[i] instanceof Element) p.insertBefore(content[i], this);
        }
        p.removeChild(this);
      });
    }
    return this;
  };

  /** Clona los elementos (deep true) y retorna nueva colección */
  AkCollection.prototype.clone = function () {
    var r = [];
    this.each(function () { r.push(this.cloneNode(true)); });
    return new AkCollection(r);
  };

  /** Retorna el hermano siguiente de cada elemento */
  AkCollection.prototype.next = function (sel) {
    var r = [];
    this.each(function () {
      var n = this.nextElementSibling;
      if (n && (!sel || n.matches(sel))) r.push(n);
    });
    return new AkCollection(r);
  };

  /** Retorna el hermano anterior de cada elemento */
  AkCollection.prototype.prev = function (sel) {
    var r = [];
    this.each(function () {
      var n = this.previousElementSibling;
      if (n && (!sel || n.matches(sel))) r.push(n);
    });
    return new AkCollection(r);
  };

  /** Retorna un subconjunto de la colección entre los índices start y end */
  AkCollection.prototype.slice = function (start, end) {
    var r = [];
    for (var i = start; i < (end !== undefined ? end : this.length); i++) {
      if (this[i]) r.push(this[i]);
    }
    return new AkCollection(r);
  };

  /** Filtra la colección quedándose solo con los que coinciden con el selector */
  AkCollection.prototype.filter = function (sel) {
    var r = [];
    this.each(function () { if (this.matches(sel)) r.push(this); });
    return new AkCollection(r);
  };

  /** Filtra la colección excluyendo los que coinciden con el selector */
  AkCollection.prototype.not = function (sel) {
    var r = [];
    this.each(function () { if (!this.matches(sel)) r.push(this); });
    return new AkCollection(r);
  };

  /** Retorna la posición del primer elemento respecto a su padre (basado en 0) */
  AkCollection.prototype.index = function () {
    var el = this[0];
    if (!el || !el.parentNode) return -1;
    var p = el.parentNode;
    for (var i = 0; i < p.children.length; i++) { if (p.children[i] === el) return i; }
    return -1;
  };

  /** Cache interno para .data() — invisible en HTML */
  var dataCache = typeof WeakMap !== "undefined" ? new WeakMap() : (function () {
    var k = "_akData";
    return { get: function (el) { return el[k]; }, set: function (el, v) { el[k] = v; }, has: function (el) { return k in el; } };
  })();

  /**
   * Obtiene o asigna un valor data (como jQuery .data()).
   * Sin argumentos: retorna objeto con todos los datos del primer elemento.
   * .data(key): retorna el valor de esa clave.
   * .data(key, value): asigna (solo en caché interno, no en HTML).
   */
  AkCollection.prototype.data = function (key, value) {
    var el = this[0];
    if (!el) return arguments.length < 2 ? undefined : this;
    if (!dataCache.has(el)) dataCache.set(el, {});
    var cache = dataCache.get(el);
    if (arguments.length === 0) {
      var all = {};
      for (var k in cache) { if (Object.prototype.hasOwnProperty.call(cache, k)) all[k] = cache[k]; }
      var attrs = el.attributes;
      for (var i = 0; i < attrs.length; i++) {
        var name = attrs[i].name;
        if (name.indexOf("data-") === 0) {
          var ck = name.slice(5).replace(/-([a-z])/g, function (_, l) { return l.toUpperCase(); });
          if (!(ck in cache)) {
            try { cache[ck] = JSON.parse(attrs[i].value); } catch (e) { cache[ck] = attrs[i].value; }
            all[ck] = cache[ck];
          }
        }
      }
      return all;
    }
    if (arguments.length === 1) {
      if (key in cache) return cache[key];
      var attr = el.getAttribute ? el.getAttribute("data-" + key) : null;
      if (attr === null) {
        var k2 = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        attr = el.getAttribute ? el.getAttribute("data-" + k2) : null;
      }
      if (attr !== null) {
        try { cache[key] = JSON.parse(attr); } catch (e) { cache[key] = attr; }
        return cache[key];
      }
      return undefined;
    }
    cache[key] = value;
    return this;
  };

  /** Serializa inputs de formularios a un objeto { name: value } */
  AkCollection.prototype.serialize = function () {
    var obj = {};
    this.find("input, select, textarea").each(function () {
      if (!this.name || this.disabled) return;
      if (this.type === "checkbox" || this.type === "radio") {
        if (this.checked) obj[this.name] = this.value;
        return;
      }
      if (this.multiple) {
        var vals = [];
        for (var i = 0; i < this.options.length; i++) {
          if (this.options[i].selected) vals.push(this.options[i].value);
        }
        if (vals.length) obj[this.name] = vals;
        return;
      }
      obj[this.name] = this.value;
    });
    return obj;
  };

  /**
   * Función principal Ak() — envoltura tipo jQuery.
   * @param {string|Element|NodeList|Array|Function} selector
   * @returns {AkCollection}
   * @description
   *  - string empezando con "<": crea elementos HTML
   *  - string CSS: selecciona por querySelectorAll
   *  - función: ejecuta al estar el DOM listo (ready)
   *  - Element/NodeList/Array/envuelve en AkCollection
   */
  function Ak(selector) {
    if (!selector) return new AkCollection([]);
    if (selector instanceof AkCollection) return selector;
    if (typeof selector === "function") {
      if (document.readyState !== "loading") selector(); else document.addEventListener("DOMContentLoaded", selector);
      return new AkCollection([]);
    }
    if (typeof selector === "string") {
      if (selector.trim().charAt(0) === "<") {
        var d = document.createElement("div");
        d.innerHTML = selector;
        return new AkCollection(Array.from(d.children));
      }
      return new AkCollection(Array.from(document.querySelectorAll(selector)));
    }
    if (selector instanceof Element || selector === window || selector === document) return new AkCollection([selector]);
    if (selector instanceof NodeList || Array.isArray(selector)) return new AkCollection(Array.from(selector));
    return new AkCollection([]);
  }

  /** @desc Elimina espacios al inicio y final del string. @param {string} str @returns {string} */
  Ak.trim = function (str) { return String(str).trim(); };
  /** @desc Itera sobre un array o AkCollection. @param {Array|AkCollection} arr @param {Function} fn */
  Ak.each = function (arr, fn) {
    if (arr instanceof AkCollection) { arr.each(fn); return arr; }
    for (var i = 0; i < arr.length; i++) { fn.call(arr[i], i, arr[i]); }
    return arr;
  };
  /** @desc Transforma cada elemento y retorna nuevo array. @param {Array} arr @param {Function} fn @returns {Array} */
  Ak.map = function (arr, fn) {
    var r = [];
    for (var i = 0; i < arr.length; i++) r.push(fn.call(arr[i], i, arr[i]));
    return r;
  };
  /** @returns {boolean} True si el valor es un array. */
  Ak.isArray = function (v) { return Array.isArray(v); };
  /** @returns {boolean} True si el valor es una función. */
  Ak.isFunction = function (v) { return typeof v === "function"; };
  /** @returns {boolean} True si el valor es un objeto plano. */
  Ak.isPlainObject = function (v) {
    return Object.prototype.toString.call(v) === "[object Object]";
  };
  /** @desc Busca un valor en un array. @param {*} value @param {Array} arr @returns {number} índice o -1 */
  Ak.inArray = function (value, arr) {
    for (var i = 0; i < arr.length; i++) { if (arr[i] === value) return i; }
    return -1;
  };
  /** @desc Mezcla objetos con soporte deep merge. @returns {Object} */
  Ak.extend = function () {
    var deep = false, target = arguments[0] || {}, i = 1, len = arguments.length;
    if (typeof target === "boolean") { deep = target; target = arguments[1] || {}; i = 2; }
    for (; i < len; i++) {
      var src = arguments[i];
      if (!src) continue;
      for (var key in src) {
        if (Object.prototype.hasOwnProperty.call(src, key)) {
          if (deep && Ak.isPlainObject(src[key]) && Ak.isPlainObject(target[key])) {
            target[key] = Ak.extend(true, target[key], src[key]);
          } else {
            target[key] = src[key];
          }
        }
      }
    }
    return target;
  };

  AgrocityKit.Ak = Ak;
  window.Ak = Ak;

  /* ---- Registrar métodos de plugin en AgrocityKit --------------------- */
  /** @desc Fábrica que envuelve un constructor en método AgrocityKit.*().
   *  @param {Function} Ctor - Constructor del plugin @returns {Function} */
  function pluginFactory(Ctor) {
    return function (target, options = {}) {
      const el = one(target);
      if (!el) { H.warn("Elemento no encontrado: " + target); return null; }
      if (registry.has(el)) return registry.get(el);
      const inst = new Ctor(el, options);
      registry.set(el, inst);
      return inst;
    };
  }
  AgrocityKit.alert = pluginFactory(AkAlert);
  AgrocityKit.button = pluginFactory(AkButton);
  AgrocityKit.collapse = pluginFactory(AkCollapse);
  AgrocityKit.dropdown = pluginFactory(AkDropdown);
  AgrocityKit.modal = pluginFactory(AkModal);
  AgrocityKit.offcanvas = pluginFactory(AkOffcanvas);
  AgrocityKit.tab = pluginFactory(AkTab);
  AgrocityKit.toast = pluginFactory(AkToast);
  AgrocityKit.tooltip = pluginFactory(AkTooltip);
  AgrocityKit.popover = pluginFactory(AkPopover);
  AgrocityKit.carousel = pluginFactory(AkCarousel);
  AgrocityKit.scrollspy = pluginFactory(AkScrollSpy);
  AgrocityKit.showToast = createToast;
  AgrocityKit.loader = createLoader;
  AgrocityKit.initLoader = initLoader;
  AgrocityKit.alert = dialogAlert;
  AgrocityKit.confirm = dialogConfirm;
  AgrocityKit.prompt = dialogPrompt;

  /** @desc Conecta manejadores de eventos por data-ak-toggle y data-ak-dismiss. */
  function wireDataAttributes() {
    // Toggles genéricos: data-ak-toggle="modal|offcanvas|collapse|dropdown|tab|tooltip|popover"
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-ak-toggle]");
      if (!trigger) return;
      const type = trigger.getAttribute("data-ak-toggle");
      const targetSel = trigger.getAttribute("data-ak-target") || trigger.getAttribute("href");

      if (type === "modal" && targetSel) {
        e.preventDefault();
        AgrocityKit.modal(targetSel).show();
      } else if (type === "offcanvas" && targetSel) {
        e.preventDefault();
        AgrocityKit.offcanvas(targetSel).show();
      } else if (type === "drawer" && targetSel) {
        e.preventDefault();
        const drawer = document.querySelector(targetSel);
        if (drawer) {
          drawer.classList.add("ak-show");
        }
      } else if (type === "collapse" && targetSel) {
        e.preventDefault();
        AgrocityKit.collapse(targetSel).toggle();
      } else if (type === "dropdown") {
        e.preventDefault();
        AgrocityKit.dropdown(trigger).toggleMenu();
      } else if (type === "tab") {
        e.preventDefault();
        new AkTab(trigger).show();
      } else if (type === "accordion" && targetSel) {
        e.preventDefault();
        const panel = document.querySelector(targetSel);
        if (!panel) return;
        const accordion = trigger.closest(".ak-accordion");
        if (accordion && !accordion.hasAttribute("data-ak-multiple")) {
          accordion.querySelectorAll(".ak-accordion-body.ak-show").forEach((open) => {
            if (open !== panel) {
              open.classList.remove("ak-show");
              open.classList.add("ak-collapse");
              const btn = accordion.querySelector(`[data-ak-target="#${open.id}"]`);
              if (btn) btn.classList.add("ak-collapsed");
            }
          });
        }
        const isOpen = panel.classList.contains("ak-show");
        panel.classList.toggle("ak-show", !isOpen);
        panel.classList.toggle("ak-collapse", isOpen);
        trigger.classList.toggle("ak-collapsed", isOpen);
      } else if (type === "drawer-item" && targetSel) {
        e.preventDefault();
        const drawerContent = trigger.closest(".ak-drawer-content");
        const drawer = trigger.closest(".ak-drawer");
        // 1. Manejar ak-active en items del mismo drawer
        if (drawerContent) {
          drawerContent.querySelectorAll("[data-ak-toggle='drawer-item']").forEach(function(item) {
            item.classList.remove("ak-active");
          });
        }
        trigger.classList.add("ak-active");
        // 2. Mostrar panel target
        const panel = document.querySelector(targetSel);
        if (panel) {
          const container = panel.closest(".ak-drawer-panels") || panel.parentNode;
          if (container) {
            container.querySelectorAll(".ak-page").forEach(function(p) {
              p.classList.remove("ak-active");
            });
          }
          panel.classList.add("ak-active");
          window.scrollTo({ top: 0, behavior: "instant" });
        }
        // 3. Si el item está dentro de un drawer-sub, expandir el submenú padre
        var parentSub = trigger.closest('.ak-drawer-sub');
        if (parentSub) {
          parentSub.classList.add('ak-show');
          var parentToggle = drawerContent ? drawerContent.querySelector('[data-ak-toggle="drawer-sub"][data-ak-target="#' + parentSub.id + '"]') : null;
          if (parentToggle) {
            var chevron = parentToggle.querySelector('.bd-chevron');
            if (chevron) chevron.style.transform = 'rotate(90deg)';
          }
        }
        // 4. Cerrar drawer en móvil (solo si NO es persistent)
        if (drawer && !drawer.classList.contains("ak-drawer-persistent")) {
          drawer.classList.remove("ak-show");
        }
        // 4. Evento personalizado
        Helpers.emit(trigger, "ak:drawer:item:click", { target: targetSel, panel: panel });
        // 5. Callback opcional
        const cb = trigger.getAttribute("data-ak-callback");
        if (cb && typeof window[cb] === "function") {
          window[cb](trigger, panel);
        }
      } else if (type === "drawer-sub" && targetSel) {
        e.preventDefault();
        const sub = document.querySelector(targetSel);
        if (sub) {
          sub.classList.toggle("ak-show");
          const chevron = trigger.querySelector(".bd-chevron");
          if (chevron) chevron.style.transform = sub.classList.contains("ak-show") ? "rotate(90deg)" : "";
        }
      } else if (type === "button") {
        AgrocityKit.button(trigger).toggle();
      }
    });

    // Dismiss: data-ak-dismiss="alert"
    document.addEventListener("click", (e) => {
      const d = e.target.closest("[data-ak-dismiss='alert']");
      if (d) {
        const alertEl = d.closest(".ak-alert");
        if (alertEl) new AkAlert(alertEl).close();
      }
    });

    // Dismiss: data-ak-dismiss="drawer" (also handles offcanvas for backward compat)
    document.addEventListener("click", (e) => {
      const d = e.target.closest("[data-ak-dismiss='drawer'], [data-ak-dismiss='offcanvas']");
      if (d) {
        const panel = d.closest(".ak-drawer, .ak-offcanvas");
        if (panel) panel.classList.remove("ak-show");
      }
    });
    // Drawer: cerrar al hacer clic en el backdrop (also offcanvas)
    document.addEventListener("click", (e) => {
      const panel = e.target.closest(".ak-drawer.ak-show, .ak-offcanvas.ak-show");
      if (panel && e.target.closest(".ak-drawer-backdrop, .ak-offcanvas-backdrop")) {
        panel.classList.remove("ak-show");
      }
    });

    // Ripple effect en botones (contenido en .ak-ripple-wrap para no depender de overflow del padre)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".ak-btn:not(.ak-disabled):not(:disabled)");
      if (!btn) return;
      let wrap = btn.querySelector(".ak-ripple-wrap");
      if (!wrap) {
        wrap = document.createElement("span");
        wrap.className = "ak-ripple-wrap";
        btn.insertBefore(wrap, btn.firstChild);
      }
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ak-ripple";
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      wrap.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });

    // Navbar toggler
    document.querySelectorAll(".ak-navbar-toggler[data-ak-target]").forEach((t) => {
      t.addEventListener("click", () => {
        const c = document.querySelector(t.getAttribute("data-ak-target"));
        if (c) c.classList.toggle("ak-show");
      });
    });

    // Auto-init de tooltips, popovers y carruseles declarativos
    document.querySelectorAll("[data-ak-tooltip]").forEach((el) => {
      if (!registry.has(el)) AgrocityKit.tooltip(el, { placement: el.getAttribute("data-ak-placement") || "top" });
    });
    document.querySelectorAll("[data-ak-popover]").forEach((el) => {
      if (!registry.has(el)) AgrocityKit.popover(el, {
        placement: el.getAttribute("data-ak-placement") || "top",
        trigger: el.getAttribute("data-ak-trigger") || "click",
      });
    });
    document.querySelectorAll("[data-ak-carousel]").forEach((el) => {
      if (!registry.has(el)) AgrocityKit.carousel(el, {
        interval: Number(el.getAttribute("data-ak-interval")) || 5000,
      });
    });
    document.querySelectorAll("[data-ak-scrollspy]").forEach((el) => {
      if (!registry.has(el)) AgrocityKit.scrollspy(el, { target: el.getAttribute("data-ak-target") });
    });
  }

  /**
   * @desc Inicializa grupos de selects en cascada geo con data-ak-geo-name.
   *        Los campos del grupo se identifican con data-ak-geo-state,
   *        data-ak-geo-municipality, data-ak-geo-neighborhood, data-ak-geo-postalcode.
   *        Todos deben compartir el mismo valor en data-ak-geo-name.
   */
  /** @desc Refresca un custom select si fue inicializado con data-ak-select. */
  function refreshCustomSelect_(el) {
    if (el && el.hasAttribute('data-ak-select') && registry.has(el)) {
      registry.get(el).destroy();
      AgrocityKit.select(el, parseDataOptions(el, 'akSelect'));
    }
  }

  /**
   * @desc Si el elemento tiene data-ak-geo-value, asigna ese valor,
   *        remueve el atributo y dispara change para continuar la cascada.
   */
  function applyGeoValueIfPresent_(el) {
    var pendingVal = el.getAttribute('data-ak-geo-value');
    if (pendingVal) {
      el.removeAttribute('data-ak-geo-value');
      if (el.hasAttribute('data-ak-select') && registry.has(el)) {
        el.value = pendingVal;
        registry.get(el).setValue(pendingVal);
      } else {
        el.value = pendingVal;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  /**
   * @desc Limpia y deshabilita todos los campos del grupo que están después
   *        del campo que disparó el cambio.
   */
  function clearDownstreamFields_(groupName, currentGeoType) {
    var order = ['state', 'municipality', 'neighborhood', 'postalcode'];
    var currentIdx = order.indexOf(currentGeoType);
    if (currentIdx < 0) return;
    for (var i = currentIdx + 1; i < order.length; i++) {
      var field = document.querySelector('[data-ak-geo-name="' + groupName + '"][data-ak-geo-' + order[i] + ']');
      if (!field) continue;
      if (field.tagName === 'SELECT') {
        field.innerHTML = '<option value="">Seleccionar...</option>';
        field.disabled = true;
        refreshCustomSelect_(field);
      } else {
        field.value = '';
      }
    }
  }

  /**
   * @desc Obtiene el valor de un campo del grupo por su geo type.
   */
  function getGeoFieldValue_(groupName, geoType) {
    var el = document.querySelector('[data-ak-geo-name="' + groupName + '"][data-ak-geo-' + geoType + ']');
    return el ? el.value : null;
  }

  function initGeoSelects_() {
    var groups = {};

    // Agrupar elementos por data-ak-geo-name
    document.querySelectorAll('[data-ak-geo-name]').forEach(function(el) {
      var name = el.getAttribute('data-ak-geo-name');
      if (!groups[name]) groups[name] = [];
      groups[name].push(el);
    });

    Object.keys(groups).forEach(function(groupName) {
      var els = groups[groupName];

      // Identificar cada campo por su atributo
      var stateEl = null;
      var municipalityEl = null;
      var neighborhoodEl = null;

      els.forEach(function(el) {
        if (el.hasAttribute('data-ak-geo-state')) stateEl = el;
        else if (el.hasAttribute('data-ak-geo-municipality')) municipalityEl = el;
        else if (el.hasAttribute('data-ak-geo-neighborhood')) neighborhoodEl = el;
      });

      // Cargar estados en el select de estado
      if (stateEl) {
        AgrocityKit.geo.fetchStates().then(function(states) {
          var currentVal = stateEl.value;
          stateEl.innerHTML = '<option value="">Seleccionar estado...</option>';
          states.forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            stateEl.appendChild(opt);
          });
          if (currentVal) stateEl.value = currentVal;
          refreshCustomSelect_(stateEl);
          applyGeoValueIfPresent_(stateEl);
        });
      }

      // Limpiar downstream fields al inicio
      if (municipalityEl) {
        municipalityEl.innerHTML = '<option value="">Seleccionar...</option>';
        municipalityEl.disabled = true;
      }
      if (neighborhoodEl) {
        neighborhoodEl.innerHTML = '<option value="">Seleccionar...</option>';
        neighborhoodEl.disabled = true;
      }
    });

    // Change handler delegado (global, usa group + attr)
    document.addEventListener('change', function(e) {
      var target = e.target;
      var groupName = target.getAttribute('data-ak-geo-name');
      if (!groupName) return;

      // Determinar qué tipo de geo es este campo
      var geoType = null;
      if (target.hasAttribute('data-ak-geo-state')) geoType = 'state';
      else if (target.hasAttribute('data-ak-geo-municipality')) geoType = 'municipality';
      else if (target.hasAttribute('data-ak-geo-neighborhood')) geoType = 'neighborhood';
      if (!geoType) return;

      var value = target.value;

      // Limpiar campos descendientes
      clearDownstreamFields_(groupName, geoType);

      if (!value) return;

      if (geoType === 'state') {
        var munEl = document.querySelector('[data-ak-geo-name="' + groupName + '"][data-ak-geo-municipality]');
        if (!munEl) return;
        munEl.disabled = true;
        munEl.innerHTML = '<option value="">Cargando...</option>';
        refreshCustomSelect_(munEl);
        AgrocityKit.geo.fetchMunicipalities(value).then(function(items) {
          munEl.innerHTML = '<option value="">Seleccionar municipio...</option>';
          items.forEach(function(m) {
            var opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            munEl.appendChild(opt);
          });
          munEl.disabled = false;
          refreshCustomSelect_(munEl);
          applyGeoValueIfPresent_(munEl);
        });
      } else if (geoType === 'municipality') {
        var stateId = getGeoFieldValue_(groupName, 'state');
        if (!stateId) return;
        var neighEl = document.querySelector('[data-ak-geo-name="' + groupName + '"][data-ak-geo-neighborhood]');
        if (!neighEl) return;
        neighEl.disabled = true;
        neighEl.innerHTML = '<option value="">Cargando...</option>';
        refreshCustomSelect_(neighEl);
        AgrocityKit.geo.fetchNeighborhoods(stateId, value).then(function(items) {
          neighEl.innerHTML = '<option value="">Seleccionar colonia...</option>';
          items.forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = c.name + (c.zip ? ' (' + c.zip + ')' : '');
            if (c.zip) opt.setAttribute('data-zip', c.zip);
            neighEl.appendChild(opt);
          });
          neighEl.disabled = items.length === 0;
          refreshCustomSelect_(neighEl);
          applyGeoValueIfPresent_(neighEl);
        });
      } else if (geoType === 'neighborhood') {
        var opt = target.options[target.selectedIndex];
        var zip = opt ? opt.getAttribute('data-zip') || '' : '';
        var zipEl = document.querySelector('[data-ak-geo-name="' + groupName + '"][data-ak-geo-postalcode]');
        if (zipEl) {
          zipEl.value = zip;
          Helpers.emit(zipEl, 'change', {source:'agrocity-kit'});
        }
      }
    });
  }

  /* ==========================================================================
   * 6. AUTO-INIT
   * ======================================================================== */
  /** @desc Ejecuta fn cuando el DOM esté listo. @param {Function} fn */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(() => {
    AgrocityKit.autoInit();
    wireDataAttributes();
    initGeoSelects_();
  });

  // Exponer globalmente
  window.AgrocityKit = AgrocityKit;
})(window, document);
