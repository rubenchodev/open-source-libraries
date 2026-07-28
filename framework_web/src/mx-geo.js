(function (window, document) {
  "use strict";

  /* ==========================================================================
   * MXGeo — Módulo de geolocalización para México
   * Estados → Municipios → Localidades
   *
   * Datos servidos desde CDN (GitHub):
   *   - index.json          → lista de estados [{id, name}]
   *   - {stateId}.json      → datos del estado  {id, name, municipalities: [{id, name}]}
   *   - localidades/{key}.json → localidades    { localidades: [{id, name, ambito}] }
   *
   * Atributos HTML para auto-vinculación:
   *   data-mxgeo-group="nombre"       — agrupa campos del mismo conjunto
   *   data-mxgeo-state                — select de estados
   *   data-mxgeo-municipality         — select de municipios
   *   data-mxgeo-locality             — select de localidades
   *
   * @example
   *   <select data-mxgeo-group="dir" data-mxgeo-state></select>
   *   <select data-mxgeo-group="dir" data-mxgeo-municipality></select>
   *   <select data-mxgeo-group="dir" data-mxgeo-locality></select>
   *
   *   MXGeo.init()  // escanea todo el documento
   *   MXGeo.init(containerElement)  // escanea solo un contenedor
   * ======================================================================== */

  /* ---- Helpers internos ---- */
  function warn(msg) {
    if (window.console && console.warn) console.warn("[MXGeo] " + msg);
  }

  function resolveElements(target) {
    if (!target) return [];
    if (typeof target === "string") return Array.from(document.querySelectorAll(target));
    if (target instanceof Element) return [target];
    if (target instanceof NodeList || Array.isArray(target)) return Array.from(target);
    return [];
  }

  function emit(el, name, detail) {
    el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true, cancelable: true }));
  }

  /* ---- MXGeo ---- */
  var MXGeo = {
    baseUrl:
      "https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/framework_web/dist/mxGeoJSON/",
    cache: {},
    loading: {},

    /** Carga lista de estados desde index.json */
    fetchStates: function () {
      if (this.cache.states) return Promise.resolve(this.cache.states);
      if (this.loading.states) return this.loading.states;
      this.loading.states = fetch(this.baseUrl + "index.json")
        .then(function (r) {
          if (!r.ok) throw new Error("Error al cargar estados");
          return r.json();
        })
        .then(
          function (data) {
            this.cache.states = data;
            delete this.loading.states;
            return data;
          }.bind(this)
        )
        .catch(
          function (e) {
            delete this.loading.states;
            warn("fetchStates: " + e.message);
            return [];
          }.bind(this)
        );
      return this.loading.states;
    },

    /** Carga datos completos de un estado (municipios) */
    fetchStateData: function (stateId) {
      if (this.cache[stateId]) return Promise.resolve(this.cache[stateId]);
      if (this.loading[stateId]) return this.loading[stateId];
      this.loading[stateId] = fetch(this.baseUrl + stateId + ".json")
        .then(function (r) {
          if (!r.ok) throw new Error("Error al cargar estado " + stateId);
          return r.json();
        })
        .then(
          function (data) {
            this.cache[stateId] = data;
            delete this.loading[stateId];
            return data;
          }.bind(this)
        )
        .catch(
          function (e) {
            delete this.loading[stateId];
            warn("fetchStateData: " + e.message);
            return { municipalities: [] };
          }.bind(this)
        );
      return this.loading[stateId];
    },

    /** Devuelve los municipios de un estado */
    fetchMunicipalities: function (stateId) {
      return this.fetchStateData(stateId).then(function (data) {
        return data.municipalities || [];
      });
    },

    /** Devuelve las localidades de un municipio */
    fetchLocalities: function (stateId, municipalityId) {
      var key = stateId + municipalityId;
      if (this.cache[key]) return Promise.resolve(this.cache[key]);
      if (this.loading[key]) return this.loading[key];
      this.loading[key] = fetch(this.baseUrl + "localidades/" + key + ".json")
        .then(function (r) {
          if (!r.ok) return { localidades: [] };
          return r.json();
        })
        .then(
          function (data) {
            var localidades = data.localidades || [];
            this.cache[key] = localidades;
            delete this.loading[key];
            return localidades;
          }.bind(this)
        )
        .catch(
          function (e) {
            delete this.loading[key];
            warn("fetchLocalities: " + e.message);
            return [];
          }.bind(this)
        );
      return this.loading[key];
    },
  };

  /* ==========================================================================
   * Auto-vinculación a selects del DOM
   * ======================================================================== */

  function refreshSelect_(el) {
    // Si el framework detecta AgrocityKit, lo usa para refrescar custom select
    if (window.AgrocityKit && window.AgrocityKit.select && el.hasAttribute("data-ak-select")) {
      var inst = AgrocityKit.getInstance(el);
      if (inst) inst.destroy();
      AgrocityKit.select(el, {});
    }
  }

  function applyPendingValue_(el) {
    var val = el.getAttribute("data-mxgeo-value");
    if (val) {
      el.removeAttribute("data-mxgeo-value");
      if (window.AgrocityKit && window.AgrocityKit.select && el.hasAttribute("data-ak-select")) {
        var inst = AgrocityKit.getInstance(el);
        if (inst) { inst.setValue(val); return; }
      }
      el.value = val;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function clearDownstreamFields_(groupName, currentType) {
    var order = ["state", "municipality", "locality"];
    var idx = order.indexOf(currentType);
    if (idx < 0) return;
    for (var i = idx + 1; i < order.length; i++) {
      var sel = '[data-mxgeo-group="' + groupName + '"][data-mxgeo-' + order[i] + "]";
      var field = document.querySelector(sel);
      if (!field) continue;
      if (field.tagName === "SELECT") {
        field.innerHTML = '<option value="">Seleccionar...</option>';
        field.disabled = true;
        refreshSelect_(field);
      } else {
        field.value = "";
      }
    }
  }

  function getFieldValue_(groupName, type) {
    var el = document.querySelector(
      '[data-mxgeo-group="' + groupName + '"][data-mxgeo-' + type + "]"
    );
    return el ? el.value : null;
  }

  /** Inicializa grupos de selects geográficos */
  function initGeoGroups_(root) {
    root = root || document;
    var groups = {};
    root.querySelectorAll("[data-mxgeo-group]").forEach(function (el) {
      var name = el.getAttribute("data-mxgeo-group");
      if (!groups[name]) groups[name] = [];
      groups[name].push(el);
    });

    Object.keys(groups).forEach(function (groupName) {
      var els = groups[groupName];
      var stateEl = null;
      var municipalityEl = null;
      var localityEl = null;

      els.forEach(function (el) {
        if (el.hasAttribute("data-mxgeo-state")) stateEl = el;
        else if (el.hasAttribute("data-mxgeo-municipality")) municipalityEl = el;
        else if (el.hasAttribute("data-mxgeo-locality")) localityEl = el;
      });

      // Cargar estados
      if (stateEl) {
        MXGeo.fetchStates().then(function (states) {
          var cur = stateEl.value;
          stateEl.innerHTML = '<option value="">Seleccionar estado...</option>';
          states.forEach(function (s) {
            var opt = document.createElement("option");
            opt.value = s.id;
            opt.textContent = s.name;
            stateEl.appendChild(opt);
          });
          if (cur) stateEl.value = cur;
          refreshSelect_(stateEl);
          applyPendingValue_(stateEl);
        });
      }

      // Inicializar downstream deshabilitados
      if (municipalityEl) {
        municipalityEl.innerHTML = '<option value="">Seleccionar...</option>';
        municipalityEl.disabled = true;
      }
      if (localityEl) {
        localityEl.innerHTML = '<option value="">Seleccionar...</option>';
        localityEl.disabled = true;
      }
    });
  }

  /* ---- Delegación de eventos (change) ---- */
  function wireEvents_() {
    document.addEventListener("change", function (e) {
      var target = e.target;
      var groupName = target.getAttribute("data-mxgeo-group");
      if (!groupName) return;

      var geoType = null;
      if (target.hasAttribute("data-mxgeo-state")) geoType = "state";
      else if (target.hasAttribute("data-mxgeo-municipality")) geoType = "municipality";
      else if (target.hasAttribute("data-mxgeo-locality")) geoType = "locality";
      if (!geoType) return;

      var value = target.value;
      clearDownstreamFields_(groupName, geoType);
      if (!value) return;

      if (geoType === "state") {
        var munSel =
          '[data-mxgeo-group="' + groupName + '"][data-mxgeo-municipality]';
        var munEl = document.querySelector(munSel);
        if (!munEl) return;
        munEl.disabled = true;
        munEl.innerHTML = '<option value="">Cargando...</option>';
        refreshSelect_(munEl);
        MXGeo.fetchMunicipalities(value).then(function (items) {
          munEl.innerHTML = '<option value="">Seleccionar municipio...</option>';
          items.forEach(function (m) {
            var opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.name;
            munEl.appendChild(opt);
          });
          munEl.disabled = false;
          refreshSelect_(munEl);
          applyPendingValue_(munEl);
        });
      } else if (geoType === "municipality") {
        var stateId = getFieldValue_(groupName, "state");
        if (!stateId) return;
        var locSel =
          '[data-mxgeo-group="' + groupName + '"][data-mxgeo-locality]';
        var locEl = document.querySelector(locSel);
        if (!locEl) return;
        locEl.disabled = true;
        locEl.innerHTML = '<option value="">Cargando...</option>';
        refreshSelect_(locEl);
        MXGeo.fetchLocalities(stateId, value).then(function (items) {
          locEl.innerHTML = '<option value="">Seleccionar localidad...</option>';
          items.forEach(function (l) {
            var opt = document.createElement("option");
            opt.value = l.id;
            opt.textContent = l.name;
            locEl.appendChild(opt);
          });
          locEl.disabled = items.length === 0;
          refreshSelect_(locEl);
          applyPendingValue_(locEl);
        });
      }
    });
  }

  /* ---- API pública de inicialización ---- */

  /**
   * Inicializa los grupos geográficos en un contenedor.
   * @param {Element|string} [container] - Contenedor o selector. Omite para todo el documento.
   */
  MXGeo.init = function (container) {
    if (container) {
      var el =
        typeof container === "string"
          ? document.querySelector(container)
          : container;
      if (el) initGeoGroups_(el);
      else warn("init(): contenedor no encontrado");
    } else {
      initGeoGroups_(document);
    }
  };

  // Auto-inicializar al cargar el DOM
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    MXGeo.init();
    wireEvents_();
  });

  // Exponer globalmente
  window.MXGeo = MXGeo;

})(window, document);
