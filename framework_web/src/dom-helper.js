(function (window, document) {
  "use strict";

  /* ==========================================================================
   * QCollection — colección iterable de elementos DOM con métodos encadenables
   * ======================================================================== */
  function QCollection(elements) {
    this.length = elements.length;
    for (var i = 0; i < elements.length; i++) {
      this[i] = elements[i];
    }
  }

  /** Itera sobre cada elemento */
  QCollection.prototype.each = function (fn) {
    for (var i = 0; i < this.length; i++) fn.call(this[i], i, this[i]);
    return this;
  };

  /** Ejecuta fn cuando el DOM esté listo */
  QCollection.prototype.ready = function (fn) {
    if (this[0] === document) {
      if (document.readyState !== "loading") fn();
      else document.addEventListener("DOMContentLoaded", fn);
    }
    return this;
  };

  /** Obtiene o asigna value del primer elemento */
  QCollection.prototype.val = function (value) {
    if (arguments.length === 0) {
      var el = this[0];
      if (!el) return "";
      if (el.multiple) {
        var a = [];
        for (var i = 0; i < el.options.length; i++) {
          if (el.options[i].selected) a.push(el.options[i].value);
        }
        return a;
      }
      return el.value || "";
    }
    return this.each(function () { this.value = value; });
  };

  /** Obtiene o asigna textContent */
  QCollection.prototype.text = function (value) {
    if (arguments.length === 0) {
      return this[0] ? (this[0].textContent || "") : "";
    }
    return this.each(function () { this.textContent = value; });
  };

  /** Obtiene o asigna innerHTML */
  QCollection.prototype.html = function (value) {
    if (arguments.length === 0) {
      return this[0] ? (this[0].innerHTML || "") : "";
    }
    return this.each(function () { this.innerHTML = value; });
  };

  /** Obtiene o asigna una propiedad (checked, disabled, etc.) */
  QCollection.prototype.prop = function (name, value) {
    if (arguments.length === 1) {
      return this[0] ? this[0][name] : undefined;
    }
    return this.each(function () { this[name] = value; });
  };

  /** Obtiene o asigna atributo(s) HTML */
  QCollection.prototype.attr = function (name, value) {
    if (arguments.length === 1) {
      if (typeof name === "object" && name !== null) {
        var attrs = name;
        return this.each(function () {
          var el = this;
          Object.keys(attrs).forEach(function (k) {
            el.setAttribute(k, attrs[k]);
          });
        });
      }
      return this[0] ? (this[0].getAttribute(name) || undefined) : undefined;
    }
    return this.each(function () { this.setAttribute(name, value); });
  };

  /** Elimina un atributo HTML */
  QCollection.prototype.removeAttr = function (name) {
    return this.each(function () { this.removeAttribute(name); });
  };

  /** Muestra los elementos */
  QCollection.prototype.show = function () {
    return this.each(function () {
      var prev = this.getAttribute("data-q-display");
      if (prev) {
        this.style.display = prev;
        this.removeAttribute("data-q-display");
      } else {
        this.style.display = "";
      }
    });
  };

  /** Oculta los elementos */
  QCollection.prototype.hide = function () {
    return this.each(function () {
      if (this.style.display && this.style.display !== "none") {
        this.setAttribute("data-q-display", this.style.display);
      }
      this.style.display = "none";
    });
  };

  /** Asigna event listener */
  QCollection.prototype.on = function (type, fn) {
    return this.each(function () { this.addEventListener(type, fn); });
  };

  /** Remueve event listener */
  QCollection.prototype.off = function (type, fn) {
    return this.each(function () { this.removeEventListener(type, fn); });
  };

  /** Asigna handler submit o dispara submit */
  QCollection.prototype.submit = function (fn) {
    if (fn) return this.each(function () { this.addEventListener("submit", fn); });
    var el = this[0];
    if (el && el.tagName === "FORM") {
      el.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
    return this;
  };

  /** Busca descendientes por selector CSS */
  QCollection.prototype.find = function (sel) {
    var r = [];
    this.each(function () {
      var n = this.querySelectorAll(sel);
      for (var i = 0; i < n.length; i++) r.push(n[i]);
    });
    return new QCollection(r);
  };

  /** Inserta contenido al final de cada elemento */
  QCollection.prototype.append = function (content) {
    if (typeof content === "string") {
      this.each(function () { this.insertAdjacentHTML("beforeend", content); });
    } else if (content instanceof Element) {
      this.each(function () { this.appendChild(content); });
    } else {
      this.each(function () {
        for (var i = 0; i < content.length; i++) {
          if (content[i] instanceof Element) this.appendChild(content[i]);
        }
      });
    }
    return this;
  };

  /** Inserta este conjunto como hijo del target */
  QCollection.prototype.appendTo = function (target) {
    var t = $Q(target);
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
  QCollection.prototype.remove = function () {
    return this.each(function () {
      var p = this.parentNode;
      if (p) p.removeChild(this);
    });
  };

  /** Agrega clase(s) CSS */
  QCollection.prototype.addClass = function (cls) {
    return this.each(function () { this.classList.add(cls); });
  };

  /** Remueve clase(s) CSS */
  QCollection.prototype.removeClass = function (cls) {
    return this.each(function () { this.classList.remove(cls); });
  };

  /** Alterna una clase CSS */
  QCollection.prototype.toggleClass = function (cls) {
    return this.each(function () { this.classList.toggle(cls); });
  };

  /** Verifica si tiene la clase */
  QCollection.prototype.hasClass = function (cls) {
    for (var i = 0; i < this.length; i++) {
      if (this[i].classList.contains(cls)) return true;
    }
    return false;
  };

  /** Obtiene o asigna propiedad de estilo */
  QCollection.prototype.css = function (prop, value) {
    if (arguments.length === 1) {
      return this[0] ? getComputedStyle(this[0])[prop] : undefined;
    }
    return this.each(function () { this.style[prop] = value; });
  };

  /** Elemento en el índice dado */
  QCollection.prototype.eq = function (index) {
    return new QCollection(
      index >= 0 && index < this.length ? [this[index]] : []
    );
  };

  QCollection.prototype.first = function () { return this.eq(0); };
  QCollection.prototype.last = function () { return this.eq(this.length - 1); };

  /** Verifica si algún elemento coincide con el selector */
  QCollection.prototype.is = function (sel) {
    for (var i = 0; i < this.length; i++) {
      if (this[i].matches(sel)) return true;
    }
    return false;
  };

  /** Primer ancestro que coincide */
  QCollection.prototype.closest = function (sel) {
    var el = this[0];
    return el
      ? new QCollection(el.closest(sel) ? [el.closest(sel)] : [])
      : new QCollection([]);
  };

  /** Padres directos */
  QCollection.prototype.parent = function () {
    var r = [];
    this.each(function () {
      if (this.parentNode && r.indexOf(this.parentNode) === -1) r.push(this.parentNode);
    });
    return new QCollection(r);
  };

  /** Hijos que coinciden con el selector */
  QCollection.prototype.children = function (sel) {
    var r = [];
    this.each(function () {
      var c = sel ? this.querySelectorAll(sel) : this.children;
      for (var i = 0; i < c.length; i++) r.push(c[i]);
    });
    return new QCollection(r);
  };

  /** Hermanos */
  QCollection.prototype.siblings = function (sel) {
    var r = [];
    this.each(function () {
      var p = this.parentNode;
      if (!p) return;
      for (var i = 0; i < p.children.length; i++) {
        if (p.children[i] !== this && (!sel || p.children[i].matches(sel))) {
          r.push(p.children[i]);
        }
      }
    });
    return new QCollection(r);
  };

  /** Dispara evento personalizado */
  QCollection.prototype.trigger = function (type, detail) {
    return this.each(function () {
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: detail }));
    });
  };

  /** Enfoca el primer elemento */
  QCollection.prototype.focus = function () {
    var el = this[0];
    if (el) el.focus({ preventScroll: true });
    return this;
  };

  /** Vacía contenido interno */
  QCollection.prototype.empty = function () {
    return this.each(function () { this.innerHTML = ""; });
  };

  /** Inserta contenido al inicio */
  QCollection.prototype.prepend = function (content) {
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

  /** Inserta contenido antes como hermano */
  QCollection.prototype.before = function (content) {
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

  /** Inserta contenido después como hermano */
  QCollection.prototype.after = function (content) {
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

  /** Reemplaza en el DOM */
  QCollection.prototype.replaceWith = function (content) {
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

  /** Clona los elementos */
  QCollection.prototype.clone = function () {
    var r = [];
    this.each(function () { r.push(this.cloneNode(true)); });
    return new QCollection(r);
  };

  /** Hermano siguiente */
  QCollection.prototype.next = function (sel) {
    var r = [];
    this.each(function () {
      var n = this.nextElementSibling;
      if (n && (!sel || n.matches(sel))) r.push(n);
    });
    return new QCollection(r);
  };

  /** Hermano anterior */
  QCollection.prototype.prev = function (sel) {
    var r = [];
    this.each(function () {
      var n = this.previousElementSibling;
      if (n && (!sel || n.matches(sel))) r.push(n);
    });
    return new QCollection(r);
  };

  /** Subconjunto */
  QCollection.prototype.slice = function (start, end) {
    var r = [];
    for (var i = start; i < (end !== undefined ? end : this.length); i++) {
      if (this[i]) r.push(this[i]);
    }
    return new QCollection(r);
  };

  /** Filtra por selector */
  QCollection.prototype.filter = function (sel) {
    var r = [];
    this.each(function () { if (this.matches(sel)) r.push(this); });
    return new QCollection(r);
  };

  /** Excluye por selector */
  QCollection.prototype.not = function (sel) {
    var r = [];
    this.each(function () { if (!this.matches(sel)) r.push(this); });
    return new QCollection(r);
  };

  /** Posición respecto al padre */
  QCollection.prototype.index = function () {
    var el = this[0];
    if (!el || !el.parentNode) return -1;
    var p = el.parentNode;
    for (var i = 0; i < p.children.length; i++) {
      if (p.children[i] === el) return i;
    }
    return -1;
  };

  /* ---- Cache para .data() ---- */
  var dataCache = typeof WeakMap !== "undefined"
    ? new WeakMap()
    : (function () {
        var k = "_qData";
        return {
          get: function (el) { return el[k]; },
          set: function (el, v) { el[k] = v; },
          has: function (el) { return k in el; },
        };
      })();

  /** Obtiene o asigna data (como jQuery .data()) */
  QCollection.prototype.data = function (key, value) {
    var el = this[0];
    if (!el) return arguments.length < 2 ? undefined : this;
    if (!dataCache.has(el)) dataCache.set(el, {});
    var cache = dataCache.get(el);
    if (arguments.length === 0) {
      var all = {};
      for (var k in cache) {
        if (Object.prototype.hasOwnProperty.call(cache, k)) all[k] = cache[k];
      }
      var attrs = el.attributes;
      for (var i = 0; i < attrs.length; i++) {
        var name = attrs[i].name;
        if (name.indexOf("data-") === 0) {
          var ck = name.slice(5).replace(/-([a-z])/g, function (_, l) {
            return l.toUpperCase();
          });
          if (!(ck in cache)) {
            try { cache[ck] = JSON.parse(attrs[i].value); }
            catch (e) { cache[ck] = attrs[i].value; }
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
        try { cache[key] = JSON.parse(attr); }
        catch (e) { cache[key] = attr; }
        return cache[key];
      }
      return undefined;
    }
    cache[key] = value;
    return this;
  };

  /** Serializa formulario a objeto { name: value } */
  QCollection.prototype.serialize = function () {
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

  /* ==========================================================================
   * $Q() — función principal, envoltura tipo jQuery
   * ======================================================================== */
  function $Q(selector) {
    if (!selector) return new QCollection([]);
    if (selector instanceof QCollection) return selector;
    if (typeof selector === "function") {
      if (document.readyState !== "loading") selector();
      else document.addEventListener("DOMContentLoaded", selector);
      return new QCollection([]);
    }
    if (typeof selector === "string") {
      if (selector.trim().charAt(0) === "<") {
        var d = document.createElement("div");
        d.innerHTML = selector;
        return new QCollection(Array.from(d.children));
      }
      return new QCollection(Array.from(document.querySelectorAll(selector)));
    }
    if (selector instanceof Element || selector === window || selector === document) {
      return new QCollection([selector]);
    }
    if (selector instanceof NodeList || Array.isArray(selector)) {
      return new QCollection(Array.from(selector));
    }
    return new QCollection([]);
  }

  /* ---- Utilidades ---- */
  $Q.trim = function (str) { return String(str).trim(); };

  $Q.each = function (arr, fn) {
    if (arr instanceof QCollection) { arr.each(fn); return arr; }
    for (var i = 0; i < arr.length; i++) fn.call(arr[i], i, arr[i]);
    return arr;
  };

  $Q.map = function (arr, fn) {
    var r = [];
    for (var i = 0; i < arr.length; i++) r.push(fn.call(arr[i], i, arr[i]));
    return r;
  };

  $Q.isArray = function (v) { return Array.isArray(v); };
  $Q.isFunction = function (v) { return typeof v === "function"; };
  $Q.isPlainObject = function (v) {
    return Object.prototype.toString.call(v) === "[object Object]";
  };

  $Q.inArray = function (value, arr) {
    for (var i = 0; i < arr.length; i++) { if (arr[i] === value) return i; }
    return -1;
  };

  $Q.extend = function () {
    var deep = false, target = arguments[0] || {}, i = 1, len = arguments.length;
    if (typeof target === "boolean") {
      deep = target;
      target = arguments[1] || {};
      i = 2;
    }
    for (; i < len; i++) {
      var src = arguments[i];
      if (!src) continue;
      for (var key in src) {
        if (Object.prototype.hasOwnProperty.call(src, key)) {
          if (deep && $Q.isPlainObject(src[key]) && $Q.isPlainObject(target[key])) {
            target[key] = $Q.extend(true, target[key], src[key]);
          } else {
            target[key] = src[key];
          }
        }
      }
    }
    return target;
  };

  /* ---- AJAX ---- */

  /** Serializa objeto a query string */
  function serializeParams(obj) {
    if (!obj) return "";
    return Object.keys(obj)
      .map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
      })
      .join("&");
  }

  /**
   * Petición AJAX.
   * @param {Object|string} opts - URL string u objeto con { url, method, data, headers, success, error, complete }
   */
  $Q.ajax = function (opts) {
    if (typeof opts === "string") opts = { url: opts };
    var o = $Q.extend(
      {
        url: "",
        method: "GET",
        data: null,
        headers: {},
        success: null,
        error: null,
        complete: null,
        dataType: "json",
      },
      opts
    );

    var xhr = new XMLHttpRequest();
    xhr.open(o.method.toUpperCase(), o.url, true);

    // Set default headers
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    if (o.dataType === "json") {
      xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
    }

    // Custom headers
    for (var h in o.headers) {
      if (Object.prototype.hasOwnProperty.call(o.headers, h)) {
        xhr.setRequestHeader(h, o.headers[h]);
      }
    }

    var body = null;
    if (o.data) {
      if (typeof o.data === "string") {
        body = o.data;
      } else {
        body = serializeParams(o.data);
      }
      if (o.method.toUpperCase() === "GET") {
        o.url += (o.url.indexOf("?") === -1 ? "?" : "&") + body;
        body = null;
      } else {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      }
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        var response = xhr.responseText;
        if (o.dataType === "json" || o.dataType === "jsonp") {
          try { response = JSON.parse(response); } catch (e) {}
        }
        if (typeof o.success === "function") o.success(response, xhr.status, xhr);
      } else {
        if (typeof o.error === "function") o.error(xhr, xhr.status, xhr.statusText);
      }
      if (typeof o.complete === "function") o.complete(xhr, xhr.status);
    };

    xhr.send(body);
    return xhr;
  };

  /** Atajo GET */
  $Q.get = function (url, data, success, dataType) {
    if (typeof data === "function") {
      dataType = success;
      success = data;
      data = null;
    }
    return $Q.ajax({
      url: url,
      method: "GET",
      data: data,
      success: success,
      dataType: dataType || "json",
    });
  };

  /** Atajo GET JSON */
  $Q.getJSON = function (url, data, success) {
    if (typeof data === "function") {
      success = data;
      data = null;
    }
    return $Q.get(url, data, success, "json");
  };

  /** Atajo POST */
  $Q.post = function (url, data, success, dataType) {
    if (typeof data === "function") {
      dataType = success;
      success = data;
      data = null;
    }
    return $Q.ajax({
      url: url,
      method: "POST",
      data: data,
      success: success,
      dataType: dataType || "json",
    });
  };

  // Exponer globalmente
  window.$Q = $Q;
  window.Q = QCollection;

})(window, document);
