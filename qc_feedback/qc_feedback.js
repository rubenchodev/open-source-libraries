/**
 * QCFeedback - Componente Web para capturar feedback de usuarios.
 * Chat con captura de pantalla integrada y editor de imágenes.
 * Carga automáticamente html2canvas y fabric.js si no están presentes.
 * @ATRIBUTOS: app-name, primary-color, position, title, subtitle, theme, endpoint, size, modules
 * @EVENTOS: feedback-open, feedback-close, feedback-submit
 */
(() => {
  /** URLs de las dependencias */
  const DEPS = {
    html2canvas: "https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/qc_feedback/html2canvas.min.js",
    fabric: "https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/qc_feedback/fabric.min.js"
  };

  /** Verifica y carga las dependencias si no existen en el DOM. */
  const loadDependencies = () => {
    if (window.html2canvas && window.fabric) return Promise.resolve();

    // Permite cargar la dependencia
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src*="${src.split('/').pop().split('.')[0]}"]`)) {
        resolve(); return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });

    return Promise.all([
      typeof html2canvas === "undefined" ? loadScript(DEPS.html2canvas) : Promise.resolve(),
      typeof fabric === "undefined" ? loadScript(DEPS.fabric) : Promise.resolve()
    ]);
  };

  /**
   * Componente Web principal para feedback.
   * @class
   * @extends HTMLElement
   */
  class QCFeedback extends HTMLElement {
    /** Inicializa el estado interno del componente. */
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      /** @type {Object} Estado interno: screenshot, canvas, herramientas, historial */
      this.state = {
        screenshot: null,
        fabricCanvas: null,
        currentTool: "select",
        isPanning: false,
        lastPosX: 0,
        lastPosY: 0,
        zoom: 1,
        history: [],
        historyStep: -1,
        currentColor: "#3b82f6",
        currentOpacity: 1,
        currentFill: "none",       // "none" = solo borde | "solid" = relleno sólido
        currentStrokeWidth: 4,
        editorImageUrl: null,
        // Para dibujo de formas con arrastre
        isDrawingShape: false,
        shapeStartX: 0,
        shapeStartY: 0,
        activeShapeObj: null,
      };
    }

    /** Se invoca al añadir el componente al DOM. Carga dependencias e inicializa la UI. */
    connectedCallback() {
      loadDependencies().then(() => {
        this.render();
        this.bindEvents();
        this.positionFAB();
      }).catch(err => {
        console.error("QCFeedback: Error al cargar dependencias:", err);
      });
    }

    /** Lee los atributos del elemento y devuelve la configuración. */
    get config() {
      return {
        appName: this.getAttribute("app-name") || document.title,
        primary: this.getAttribute("primary-color") || "#2563eb",
        endpoint: this.getAttribute("endpoint") || "",
        title: this.getAttribute("title") || "Enviar feedback",
        subtitle: this.getAttribute("subtitle") || "¿Qué te ocurrió?",
        position: this.getAttribute("position") || "bottom-right",
        size: this.getAttribute("size") || "md",   // sm | md | lg
        theme: this.getAttribute("theme") || "light",
        modules: this.getAttribute("modules") || "",
        imageScale: parseFloat(this.getAttribute("image-scale")) || Math.max(2, window.devicePixelRatio || 1),
        imageQuality: parseFloat(this.getAttribute("image-quality")) || 0.9,
      };
    }

    /** Devuelve dimensiones del FAB según size */
    get fabSize() {
      return { sm: 44, md: 56, lg: 68 }[this.config.size] || 56;
    }

    /** Devuelve tamaño del ícono SVG según size del FAB */
    get fabIconSize() {
      return { sm: 20, md: 26, lg: 32 }[this.config.size] || 26;
    }

    /** Genera el HTML y CSS (Shadow DOM) del componente. */
    render() {
      const dark = this.config.theme === "dark";
      const sz = this.fabSize;
      const colors = {
        primary: this.config.primary,
        panel: dark ? "#1e293b" : "#ffffff",
        border: dark ? "#334155" : "#e2e8f0",
        text: dark ? "#f1f5f9" : "#1e293b",
        muted: dark ? "#94a3b8" : "#64748b",
      };
      this.shadowRoot.innerHTML = `
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          :host { all: initial; --qc-primary: ${colors.primary}; --qc-panel: ${colors.panel}; --qc-border: ${colors.border}; --qc-text: ${colors.text}; --qc-muted: ${colors.muted}; }
          .qc-fab { position: fixed; width: ${sz}px; height: ${sz}px; border: none; border-radius: 50%; cursor: pointer; z-index: 99999999; color: white; background: linear-gradient(135deg, var(--qc-primary), #1d4ed8); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,.2); transition: .25s; }
          .qc-fab:hover { transform: scale(1.08); }
          .qc-fab svg { width: 28px; height: 28px; }
          .qc-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); backdrop-filter: blur(4px); z-index: 999999999; display: none; align-items: flex-end; justify-content: flex-end; padding: 20px; }
          .qc-overlay.active { display: flex; }
          .qc-chat { width: 380px; max-height: min(578px, calc(100vh - 40px)); background: var(--qc-panel); border-radius: 20px; overflow: hidden; border: 1px solid var(--qc-border); box-shadow: 0 20px 60px rgba(0,0,0,.3); display: flex; flex-direction: column; animation: qcSlideIn .3s ease; }
          @keyframes qcSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .qc-header-chat { padding: 10px 16px; border-bottom: 1px solid var(--qc-border); display: flex; align-items: center; justify-content: space-between; }
          .qc-app-banner { padding: 6px 16px; background: rgba(128,128,128,0.05); border-bottom: 1px solid var(--qc-border); text-align: center; font-size: 11px; font-weight: 700; color: var(--qc-primary); text-transform: uppercase; letter-spacing: 0.5px; }
          .qc-header-title { display: flex; align-items: center; gap: 10px; }
          .qc-header-title svg { width: 20px; height: 20px; color: var(--qc-primary); }
          .qc-title { color: var(--qc-text); font-size: 15px; font-weight: 600; }
          .qc-close { width: 32px; height: 32px; border: none; border-radius: 8px; background: transparent; cursor: pointer; color: var(--qc-muted); display: flex; align-items: center; justify-content: center; transition: .2s; }
          .qc-close:hover { background: var(--qc-border); color: var(--qc-text); }
          .qc-body-chat { flex: 1; overflow-y: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
          .qc-msg { padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.4; }
          .qc-msg-bot { background: var(--qc-border); color: var(--qc-text); border-bottom-left-radius: 4px; }
          .qc-capture-box { border: 2px dashed var(--qc-border); border-radius: 12px; padding: 12px; text-align: center; transition: .2s; }
          .qc-capture-box:hover { border-color: var(--qc-primary); }
          .qc-capture-options { display: flex; gap: 8px; margin-top: 8px; justify-content: center; }
          .qc-capture-btn { padding: 8px 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: .2s; }
          .qc-capture-btn:hover { transform: translateY(-1px); }
          .qc-capture-btn.primary { background: var(--qc-primary); color: white; }
          .qc-capture-btn.secondary { background: var(--qc-border); color: var(--qc-text); }
          .qc-capture-btn svg { width: 18px; height: 18px; }
          .qc-image-preview { border-radius: 12px; overflow: hidden; border: 1px solid var(--qc-border); cursor: pointer; position: relative; margin-top: 8px; }
          .qc-image-preview:hover { opacity: .9; }
          .qc-image-preview img { width: 100%; height: auto; max-height: 300px; object-fit: contain; display: block; background: #f5f5f5; }
          .qc-edit-badge { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; }
          .qc-field { margin-top: 0; }
          .qc-field-label { display: block; color: var(--qc-text); font-size: 12px; font-weight: 600; margin-bottom: 4px; }
          .qc-required { color: #ef4444; margin-left: 3px; }
          .qc-textarea { width: 100%; border: 1px solid var(--qc-border); border-radius: 10px; background: transparent; color: var(--qc-text); padding: 8px 12px; font-size: 13px; resize: none; outline: none; font-family: inherit; }
          .qc-textarea:focus { border-color: var(--qc-primary); }
          .qc-select { width: 100%; border: 1px solid var(--qc-border); border-radius: 10px; background: transparent; color: var(--qc-text); padding: 8px 12px; font-size: 13px; outline: none; }
          .qc-actions-chat { padding: 8px 16px; border-top: 1px solid var(--qc-border); display: flex; gap: 10px; }
          .qc-btn { flex: 1; height: 40px; border: none; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; transition: .2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
          .qc-btn:hover { transform: translateY(-1px); }
          .qc-btn-primary { background: var(--qc-primary); color: white; }
          .qc-btn-secondary { background: var(--qc-border); color: var(--qc-text); }
          .qc-btn svg { width: 16px; height: 16px; }
          .qc-author-wrap { position: relative; display: flex; align-items: center; justify-content: center; width: 24px; color: var(--qc-muted); opacity: 0.5; cursor: pointer; transition: .2s; }
          .qc-author-wrap:hover { opacity: 1; color: var(--qc-text); }
          .qc-author-wrap svg { width: 14px; height: 14px; }
          .qc-author-popover { position: absolute; bottom: 100%; left: 0; margin-bottom: 8px; background: var(--qc-text); color: var(--qc-panel); padding: 6px 10px; border-radius: 6px; font-size: 11px; white-space: nowrap; opacity: 0; visibility: hidden; transition: .2s; box-shadow: 0 4px 12px rgba(0,0,0,.2); line-height: 1.4; font-weight: 500; pointer-events: none; z-index: 10; }
          .qc-author-wrap:hover .qc-author-popover { opacity: 1; visibility: visible; transform: translateY(-4px); }
          .qc-author-popover::after { content: ''; position: absolute; top: 100%; left: 10px; border: 4px solid transparent; border-top-color: var(--qc-text); }

          /* Editor */
          .qc-editor-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.95); z-index: 9999999999; display: none; align-items: center; justify-content: center; }
          .qc-editor-overlay.active { display: flex; }
          .qc-editor-modal { width: 95vw; height: 90vh; background: #1e1e1e; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; max-width: 1400px; }
          .qc-editor-header { height: 50px; padding: 0 16px; background: #252525; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #333; }
          .qc-editor-title { color: #e0e0e0; font-size: 14px; font-weight: 600; }
          .qc-editor-body { flex: 1; display: grid; grid-template-columns: 80px 1fr; overflow: hidden; }

          /* Panel lateral de herramientas */
          .qc-editor-tools { width: 80px; background: #252525; padding: 8px 6px; display: flex; flex-direction: column; gap: 3px; align-items: center; border-right: 1px solid #333; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: #3a3a3a #1e1e1e; }
          .qc-editor-tools::-webkit-scrollbar { width: 4px; }
          .qc-editor-tools::-webkit-scrollbar-track { background: #1e1e1e; border-radius: 2px; }
          .qc-editor-tools::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 2px; }
          .qc-editor-tools::-webkit-scrollbar-thumb:hover { background: #555; }
          .qc-editor-tool-btn { width: 36px; height: 32px; border: none; border-radius: 6px; background: #333; cursor: pointer; color: #aaa; font-size: 15px; transition: .2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .qc-editor-tool-btn:hover { background: #444; color: #fff; }
          .qc-editor-tool-btn.active { background: var(--qc-primary, #2563eb); color: #fff; }
          .qc-tools-divider { width: 80%; height: 1px; background: #3a3a3a; margin: 3px 0; flex-shrink: 0; }

          /* Panel compacto de opciones */
          .qc-shape-panel { padding: 6px 4px; display: flex; flex-direction: column; gap: 5px; width: 100%; flex-shrink: 0; }
          .qc-panel-label { color: #666; font-size: 9px; text-align: center; text-transform: uppercase; letter-spacing: .5px; }

          /* Fill toggle — iconos en vez de texto */
          .qc-fill-toggle { display: flex; gap: 3px; width: 100%; }
          .qc-fill-btn {
            flex: 1; height: 28px; border: 1px solid #3a3a3a; border-radius: 5px;
            background: #2a2a2a; color: #777; font-size: 13px; cursor: pointer;
            display: flex; align-items: center; justify-content: center; transition: .15s;
          }
          .qc-fill-btn:hover { background: #383838; color: #ccc; }
          .qc-fill-btn.active { background: var(--qc-primary, #2563eb); color: #fff; border-color: transparent; }

          /* Stroke slider compacto */
          .qc-stroke-wrap { display: flex; flex-direction: column; gap: 2px; }
          .qc-stroke-wrap input[type=range] {
            width: 100%; height: 3px; cursor: pointer;
            accent-color: var(--qc-primary, #2563eb);
            -webkit-appearance: none; background: #3a3a3a; border-radius: 2px;
          }
          .qc-stroke-wrap input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none; width: 12px; height: 12px;
            border-radius: 50%; background: var(--qc-primary, #2563eb); cursor: pointer;
          }
          .qc-stroke-label { color: #666; font-size: 9px; text-align: center; }

          /* Color picker compacto */
          .qc-color-row { display: flex; align-items: center; gap: 5px; width: 100%; padding: 0 2px; }
          .qc-color-presets { display: flex; gap: 3px; flex-wrap: wrap; flex: 1; justify-content: center; }
          .qc-color-swatch {
            width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid transparent;
            cursor: pointer; transition: transform .12s; flex-shrink: 0;
          }
          .qc-color-swatch:hover { transform: scale(1.25); }
          .qc-color-swatch.active { border-color: #fff; box-shadow: 0 0 0 1.5px rgba(255,255,255,.35); transform: scale(1.2); }
          /* Native color picker oculto, activado por el botón custom */
          .qc-color-custom-wrap { position: relative; flex-shrink: 0; }
          .qc-color-custom-btn {
            width: 44px; height: 28px; border-radius: 6px; border: 2px solid #555;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            background: #3b82f6; transition: border-color .15s;
            position: relative; overflow: hidden;
          }
          .qc-color-custom-btn:hover { border-color: #999; }
          .qc-color-custom-btn.swatch-active { border-color: #fff; box-shadow: 0 0 0 1px rgba(255,255,255,.3); }
          .qc-color-custom-btn input[type=color] {
            position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%;
            cursor: pointer; border: none; padding: 0;
          }

          /* Canvas */
          .qc-editor-canvas-wrap { flex: 1; background: #0a0a0a; overflow: auto; display: flex; align-items: center; justify-content: center; padding: 20px; }
          .qc-editor-canvas-wrap canvas { box-shadow: 0 4px 40px rgba(0,0,0,.6); }

          /* Cursor para herramientas de dibujo */
          .qc-editor-canvas-wrap.cursor-crosshair canvas { cursor: crosshair !important; }
          .qc-editor-canvas-wrap.cursor-text canvas { cursor: text !important; }

          .qc-editor-footer { height: 60px; padding: 0 20px; background: #252525; display: flex; align-items: center; justify-content: flex-end; gap: 12px; border-top: 1px solid #333; }
          .qc-editor-actions { display: flex; gap: 12px; }
          .qc-editor-actions .qc-btn { min-width: 110px; height: 44px; }
          .qc-btn-dark { background: #333; color: #e0e0e0; }
          .qc-btn-dark:hover { background: #444; }

          /* Submenú nueva captura */
          .qc-btn-wrapper { position: relative; }
          .qc-submenu { position: absolute; bottom: 100%; left: 0; margin-bottom: 8px; background: #333; border-radius: 8px; padding: 6px; display: none; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,.3); min-width: 140px; }
          .qc-submenu.show { display: block; }
          .qc-submenu-btn { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: none; background: transparent; color: #e0e0e0; cursor: pointer; border-radius: 6px; font-size: 13px; width: 100%; white-space: nowrap; }
          .qc-submenu-btn:hover { background: #444; }
          .qc-submenu-btn svg { width: 16px; height: 16px; }

          /* Hint de herramienta */
          .qc-tool-hint { color: #666; font-size: 10px; text-align: center; padding: 0 4px; line-height: 1.3; }
        </style>

        <!-- Botón flotante -->
        <button class="qc-fab" id="qcFab">${this.iconFab()}</button>

        <!-- Chat principal -->
        <div class="qc-overlay" id="qcOverlay">
          <div class="qc-chat">
            <div class="qc-header-chat">
              <div class="qc-header-title">${this.iconMessage()}<span class="qc-title">${this.config.title}</span></div>
              <button class="qc-close" id="qcCloseBtn">${this.iconX()}</button>
            </div>
            <div class="qc-app-banner">${this.config.appName}</div>
            <div class="qc-body-chat" id="qcBodyChat"></div>
            <div class="qc-actions-chat" id="qcActionsChat"></div>
          </div>
        </div>

        <!-- Editor -->
        <div class="qc-editor-overlay" id="qcEditorOverlay">
          <div class="qc-editor-modal">
            <div class="qc-editor-header">
              <span class="qc-editor-title">Editar captura — Selecciona herramienta y haz clic en el canvas</span>
              <button class="qc-close" id="qcEditorClose">${this.iconX()}</button>
            </div>
            <div class="qc-editor-body">
              <!-- Panel lateral -->
              <div class="qc-editor-tools" id="qcEditorTools">

                <!-- Herramientas principales -->
                <button class="qc-editor-tool-btn active" data-tool="select" title="Seleccionar / Mover">✋</button>
                <button class="qc-editor-tool-btn" data-tool="draw" title="Dibujar a mano alzada">✏</button>
                <button class="qc-editor-tool-btn" data-tool="rectangle" title="Rectángulo">▢</button>
                <button class="qc-editor-tool-btn" data-tool="circle" title="Círculo">○</button>
                <button class="qc-editor-tool-btn" data-tool="text" title="Texto">T</button>
                <button class="qc-editor-tool-btn" data-tool="arrow" title="Flecha">→</button>
                <button class="qc-editor-tool-btn" data-tool="undo" title="Deshacer">↩</button>

                <div class="qc-tools-divider"></div>

                <!-- Relleno -->
                <div class="qc-shape-panel">
                  <span class="qc-panel-label">Relleno</span>
                  <div class="qc-fill-toggle">
                    <button class="qc-fill-btn active" data-fill="none" title="Sin relleno">▢</button>
                    <button class="qc-fill-btn" data-fill="solid" title="Con relleno">■</button>
                  </div>
                  <span class="qc-panel-label" style="margin-top:2px;">Grosor</span>
                  <div class="qc-stroke-wrap">
                    <input type="range" id="qcStrokeWidth" min="1" max="16" value="4">
                    <span class="qc-stroke-label" id="qcStrokeVal">4 px</span>
                  </div>
                </div>

                <div class="qc-tools-divider"></div>

                <!-- Color: solo swatches esenciales + picker nativo prominente -->
                <div class="qc-shape-panel" style="gap:5px;">
                  <span class="qc-panel-label">Color</span>
                  <!-- Color picker nativo — es el protagonista -->
                  <div class="qc-color-custom-wrap" style="align-self:center;">
                    <div class="qc-color-custom-btn" id="qcCustomColorBtn" title="Seleccionar color">
                      <input type="color" id="qcCustomColor" value="#3b82f6">
                    </div>
                  </div>
                  <!-- Solo 3 swatches fijos de acceso rápido -->
                  <div class="qc-color-presets">
                    <div class="qc-color-swatch" data-color="#000000" style="background:#000" title="Negro"></div>
                    <div class="qc-color-swatch" data-color="#ef4444" style="background:#ef4444" title="Rojo"></div>
                    <div class="qc-color-swatch" data-color="rgba(234,179,8,0.4)" style="background:rgba(234,179,8,0.4);border-color:#ca8a04" title="Highlight amarillo"></div>
                  </div>
                </div>

                <div class="qc-tools-divider"></div>
                <span class="qc-tool-hint" id="qcToolHint">Clic en canvas</span>
              </div>

              <!-- Área del canvas -->
              <div class="qc-editor-canvas-wrap" id="qcCanvasWrap">
                <canvas id="qcEditorCanvas"></canvas>
              </div>
            </div>

            <div class="qc-editor-footer">
              <button class="qc-btn qc-btn-dark" id="qcEditorCancel">Cancelar</button>
              <div style="position:relative;">
                <button class="qc-btn qc-btn-dark" id="qcEditorNewCapture">${this.iconCamera()} Nueva captura</button>
                <div class="qc-submenu" id="qcNewCaptureMenu">
                  <button class="qc-submenu-btn" id="qcNewCaptureFull">${this.iconCamera()} Completa</button>
                  <button class="qc-submenu-btn" id="qcNewCaptureRegion">${this.iconSelect()} Región</button>
                </div>
              </div>
              <button class="qc-btn qc-btn-primary" id="qcEditorAccept">${this.iconCheck()} Aceptar</button>
            </div>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // ICONOS
    // =========================================================================

    /** Ícono del FAB con width/height explícitos para garantizar visibilidad en todos los navegadores */
    iconFab() {
      const s = this.fabIconSize;
      return `<svg width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    }
    /** @returns {string} SVG del ícono de mensaje */
    iconMessage() { return `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`; }
    /** @returns {string} SVG del ícono de cerrar (X) */
    iconX() { return `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>`; }
    /** @returns {string} SVG del ícono de cámara */
    iconCamera() { return `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`; }
    /** @returns {string} SVG del ícono de selección de región */
    iconSelect() { return `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>`; }
    /** @returns {string} SVG del ícono de confirmación (Check) */
    iconCheck() { return `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`; }
    /** @returns {string} SVG del ícono de enviar */
    iconSend() { return `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`; }
    /** @returns {string} SVG del ícono de imagen */
    iconImage() { return `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`; }
    /** @returns {string} SVG del ícono de información */
    iconInfo() { return `<svg width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg>`; }

    // =========================================================================
    // EVENTOS GLOBALES
    // =========================================================================
    /** Asocia los eventos globales de abrir y cerrar el chat. */
    bindEvents() {
      this.shadowRoot.getElementById("qcFab").onclick = () => this.openFromFab();
      this.shadowRoot.getElementById("qcCloseBtn").onclick = () => this.close();
    }

    // =========================================================================
    // ABRIR / CERRAR CHAT
    // =========================================================================
    /** Abre el chat y renderiza el formulario. Dispatch: feedback-open */
    open() {
      this.shadowRoot.getElementById("qcOverlay").classList.add("active");
      this.renderForm();
      this.dispatchEvent(new CustomEvent("feedback-open"));
    }

    /** Abre desde FAB reseteando estado. Dispatch: feedback-open */
    openFromFab() {
      this.state.screenshot = null;
      this.state.history = [];
      this.state.historyStep = -1;
      this.state.editorImageUrl = null;
      this.shadowRoot.getElementById("qcOverlay").classList.add("active");
      this.renderForm();
      this.dispatchEvent(new CustomEvent("feedback-open"));
    }

    /** Cierra el chat. Dispatch: feedback-close */
    close() {
      this.disposeEditor();
      this.shadowRoot.getElementById("qcOverlay").classList.remove("active");
      this.dispatchEvent(new CustomEvent("feedback-close"));
    }

    // =========================================================================
    // RENDER FORM
    // =========================================================================
    /** Renderiza el formulario con campos y opciones de captura. */
    renderForm() {
      const body = this.shadowRoot.getElementById("qcBodyChat");
      const actions = this.shadowRoot.getElementById("qcActionsChat");

      // Limpiar mensajes anteriores si existen
      const oldMsg = this.shadowRoot.getElementById("qcFormMsg");
      if (oldMsg) oldMsg.remove();

      let html = `<div class="qc-msg qc-msg-bot">${this.config.subtitle}</div>`;

      if (this.state.screenshot) {
        html += `
          <div class="qc-image-preview" id="qcPreviewClick">
            <img src="${this.state.screenshot}" alt="Captura">
            <span class="qc-edit-badge">✏️ Editar</span>
          </div>`;
      } else {
        html += `
          <div class="qc-capture-box">
            ${this.iconImage()}
            <div class="qc-capture-options">
              <button class="qc-capture-btn primary" id="qcCaptureFullBtn">${this.iconCamera()} Completa</button>
              <button class="qc-capture-btn secondary" id="qcCaptureRegionBtn">${this.iconSelect()} Región</button>
            </div>
          </div>`;
      }

      let modulesHtml = "";
      if (this.config.modules) {
        const modulesList = this.config.modules.split(',').map(m => m.trim()).filter(Boolean);
        if (modulesList.length > 0) {
          modulesHtml = `
            <div class="qc-field">
              <label class="qc-field-label">Módulo<span class="qc-required">*</span></label>
              <select class="qc-select" id="qcModule">
                <option value="Todos los módulos">Todos los módulos</option>
                ${modulesList.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>`;
        }
      }

      html += `
        <div class="qc-field">
          <label class="qc-field-label">Descripción<span class="qc-required">*</span></label>
          <textarea class="qc-textarea" id="qcDescription" rows="2" placeholder="Describe el problema..."></textarea>
        </div>
        ${modulesHtml}
        <div class="qc-field">
          <label class="qc-field-label">Prioridad<span class="qc-required">*</span></label>
          <select class="qc-select" id="qcPriority">
            <option value="baja">Baja</option>
            <option value="media" selected>Media</option>
            <option value="alta">Alta</option>
            <option value="crítica">Crítica</option>
          </select>
        </div>`;

      body.innerHTML = html;
      actions.innerHTML = `
        <div class="qc-author-wrap">
          ${this.iconInfo()}
          <div class="qc-author-popover">
            <span style="color:var(--qc-muted)">Desarrollado por:</span><br>
            <strong>Rubén Sánchez</strong><br>
            rubencho.dev@gmail.com<br><br>
            <span style="font-size:9px;color:var(--qc-muted)">Todos los derechos reservados</span>
          </div>
        </div>
        <button class="qc-btn qc-btn-primary" id="qcSendBtn">${this.iconSend()} Enviar</button>
      `;

      const fullBtn = this.shadowRoot.getElementById("qcCaptureFullBtn");
      if (fullBtn) fullBtn.onclick = () => this.captureFull();
      const regionBtn = this.shadowRoot.getElementById("qcCaptureRegionBtn");
      if (regionBtn) regionBtn.onclick = () => this.captureRegion();
      const previewClick = this.shadowRoot.getElementById("qcPreviewClick");
      if (previewClick) previewClick.onclick = () => this.openEditor(this.state.screenshot);
      this.shadowRoot.getElementById("qcSendBtn").onclick = () => this.sendFeedback();
    }

    // =========================================================================
    // CAPTURA DE PANTALLA
    // =========================================================================
    /** Captura pantalla completa y abre el editor. */
    async captureFull() {
      this.close();
      // Ocultar todo el host del componente para que no aparezca en la captura
      this.style.display = "none";
      await new Promise(r => setTimeout(r, 150));
      try {
        const canvas = await html2canvas(document.body, {
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          ignoreElements: (el) => el === this,
          scale: this.config.imageScale
        });
        const imageUrl = canvas.toDataURL("image/jpeg", this.config.imageQuality);
        this.state.screenshot = imageUrl;
        this.state.editorImageUrl = imageUrl;
        this.openEditor(imageUrl);
      } catch (e) {
        console.error("Error al capturar:", e);
        this.openFromFab();
      } finally {
        this.style.display = "";
      }
    }

    /** Captura la pantalla completa y pasa automáticamente al editor. */
    async captureFullAndEdit() {
      await this.captureFull();
    }

    /** Captura una región de la pantalla con selección interactiva. */
    async captureRegion() {
      this.close();
      this.style.display = "none";

      // Cursor crosshair blanco personalizado en SVG
      const cursorSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><line x1='16' y1='2' x2='16' y2='30' stroke='white' stroke-width='2'/><line x1='2' y1='16' x2='30' y2='16' stroke='white' stroke-width='2'/><circle cx='16' cy='16' r='3' fill='none' stroke='white' stroke-width='1.5'/></svg>`;
      const cursorURL = `url("data:image/svg+xml,${encodeURIComponent(cursorSVG)}") 16 16, crosshair`;

      let overlay = document.createElement("div");
      overlay.id = "qcRegionOverlayFull";
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:99999999999;cursor:${cursorURL};
        background:rgba(0,0,0,0.65);
      `;
      document.body.appendChild(overlay);

      // Instrucción inicial
      const hint = document.createElement("div");
      hint.style.cssText = `
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        color:rgba(255,255,255,0.7);font-size:15px;font-family:sans-serif;
        background:rgba(0,0,0,0.5);padding:10px 20px;border-radius:8px;
        border:1px solid rgba(255,255,255,0.15);pointer-events:none;white-space:nowrap;
        letter-spacing:0.3px;
      `;
      hint.textContent = "Clic y arrastra para seleccionar la región";
      overlay.appendChild(hint);

      // Selección de área
      let box = document.createElement("div");
      box.style.cssText = `
        position:absolute;border:2px solid #fff;
        background:rgba(255,255,255,0.08);pointer-events:none;
        box-shadow:0 0 0 9999px rgba(0,0,0,0.45);
        display:none;
      `;
      overlay.appendChild(box);

      // Punto inicial de clic
      let startDot = document.createElement("div");
      startDot.style.cssText = `
        position:absolute;width:10px;height:10px;background:#fff;
        border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);
        box-shadow:0 0 0 2px rgba(0,0,0,0.5);display:none;
      `;
      overlay.appendChild(startDot);

      // Label de dimensiones
      let sizeLabel = document.createElement("div");
      sizeLabel.style.cssText = `
        position:absolute;background:rgba(0,0,0,0.7);color:#fff;
        font-size:11px;font-family:sans-serif;padding:3px 7px;
        border-radius:4px;pointer-events:none;white-space:nowrap;display:none;
      `;
      overlay.appendChild(sizeLabel);

      let startX = 0, startY = 0, isDragging = false;

      const mouseDown = (e) => {
        startX = e.clientX; startY = e.clientY;
        isDragging = true;
        hint.style.display = "none";
        startDot.style.left = startX + "px"; startDot.style.top = startY + "px";
        startDot.style.display = "block";
        box.style.left = startX + "px"; box.style.top = startY + "px";
        box.style.width = "0px"; box.style.height = "0px";
        box.style.display = "block";
      };
      const mouseMove = (e) => {
        if (!isDragging) return;
        const left = Math.min(startX, e.clientX);
        const top = Math.min(startY, e.clientY);
        const w = Math.abs(e.clientX - startX);
        const h = Math.abs(e.clientY - startY);
        box.style.left = left + "px"; box.style.top = top + "px";
        box.style.width = w + "px"; box.style.height = h + "px";
        // Label de tamaño
        sizeLabel.textContent = `${Math.round(w)} × ${Math.round(h)}`;
        sizeLabel.style.left = (e.clientX + 10) + "px";
        sizeLabel.style.top = (e.clientY + 10) + "px";
        sizeLabel.style.display = "block";
      };
      const mouseUp = async (e) => {
        if (!isDragging) return;
        isDragging = false;
        overlay.removeEventListener("mousemove", mouseMove);
        overlay.removeEventListener("mouseup", mouseUp);
        const rect = box.getBoundingClientRect();
        overlay.remove();
        this.style.display = "";
        if (rect.width < 20 || rect.height < 20) { this.openFromFab(); return; }
        try {
          // html2canvas captura todo el body. La resolución se ajusta mediante la configuración.
          const scale = this.config.imageScale;
          const fullCanvas = await html2canvas(document.body, {
            useCORS: true, logging: false, backgroundColor: "#ffffff",
            ignoreElements: (el) => el === this,
            scale: scale
          });

          const crop = document.createElement("canvas");

          // Escalamos el canvas de destino para mantener la alta resolución
          crop.width = rect.width * scale;
          crop.height = rect.height * scale;

          // rect.left/top son relativos al viewport. Hay que sumar el scroll para la posición absoluta.
          const sx = (rect.left + window.scrollX) * scale;
          const sy = (rect.top + window.scrollY) * scale;
          const sw = rect.width * scale;
          const sh = rect.height * scale;

          crop.getContext("2d").drawImage(fullCanvas, sx, sy, sw, sh, 0, 0, crop.width, crop.height);
          this.state.screenshot = crop.toDataURL("image/jpeg", this.config.imageQuality);
          this.state.editorImageUrl = this.state.screenshot;
          this.openEditor(this.state.screenshot);
        } catch (err) {
          console.error("Error:", err);
          this.openFromFab();
        }
      };

      // Escape para cancelar
      const keyHandler = (e) => {
        if (e.key === "Escape") {
          overlay.remove();
          this.style.display = "";
          document.removeEventListener("keydown", keyHandler);
          this.openFromFab();
        }
      };
      document.addEventListener("keydown", keyHandler);

      overlay.addEventListener("mousedown", mouseDown);
      overlay.addEventListener("mousemove", mouseMove);
      overlay.addEventListener("mouseup", mouseUp);
    }

    // =========================================================================
    // HISTORIAL
    // =========================================================================
    /** Guarda el estado actual del canvas para permitir deshacer (undo). */
    saveHistory() {
      if (!this.state.fabricCanvas) return;
      const json = JSON.stringify(this.state.fabricCanvas.toJSON());
      if (this.state.historyStep < this.state.history.length - 1) {
        this.state.history = this.state.history.slice(0, this.state.historyStep + 1);
      }
      this.state.history.push(json);
      this.state.historyStep = this.state.history.length - 1;
    }

    // =========================================================================
    // EDITOR DE IMAGENES (Fabric.js)
    // =========================================================================
    /** Abre el editor de imagenes con herramientas de dibujo. */
    openEditor(imageUrl) {
      if (!this.state.screenshot && imageUrl) this.state.screenshot = imageUrl;
      this.state.editorImageUrl = this.state.screenshot;
      this.state.history = [];
      this.state.historyStep = -1;
      this.state.currentColor = this.config.primary;
      this.state.currentOpacity = 1;
      this.state.currentFill = "none";
      this.state.currentStrokeWidth = 4;
      this.state.isDrawingShape = false;
      this.state.activeShapeObj = null;

      this.shadowRoot.getElementById("qcEditorOverlay").classList.add("active");

      // Resetear herramienta seleccionada visualmente
      this.shadowRoot.querySelectorAll(".qc-editor-tool-btn").forEach(el => el.classList.remove("active"));
      const selectBtn = this.shadowRoot.querySelector('.qc-editor-tool-btn[data-tool="select"]');
      if (selectBtn) selectBtn.classList.add("active");
      this.state.currentTool = "select";

      // Resetear fill buttons
      this.shadowRoot.querySelectorAll(".qc-fill-btn").forEach(el => el.classList.remove("active"));
      const noneBtn = this.shadowRoot.querySelector('.qc-fill-btn[data-fill="none"]');
      if (noneBtn) noneBtn.classList.add("active");

      // Resetear swatches y color picker
      this.shadowRoot.querySelectorAll(".qc-color-swatch").forEach(el => el.classList.remove("active"));
      const picker = this.shadowRoot.getElementById("qcCustomColor");
      const customColorBtn = this.shadowRoot.getElementById("qcCustomColorBtn");
      if (picker) picker.value = "#3b82f6";
      if (customColorBtn) { customColorBtn.style.background = "#3b82f6"; customColorBtn.classList.add("swatch-active"); }

      this.loadEditorCanvas(this.state.editorImageUrl);
      this.bindEditorEvents();
    }

    /** Cierra la interfaz del editor de imágenes. */
    closeEditor() {
      this.shadowRoot.getElementById("qcEditorOverlay").classList.remove("active");
    }

    /** Limpia y destruye la instancia de Fabric.js para liberar memoria. */
    disposeEditor() {
      if (this.state.fabricCanvas) {
        this.state.fabricCanvas.dispose();
        this.state.fabricCanvas = null;
      }
      // Limpiar botón de eliminar si existe
      const btn = document.getElementById("qcDeleteBtn");
      if (btn) btn.remove();
    }

    // =========================================================================
    // EDITOR — EVENTOS
    // =========================================================================
    /** Asigna eventos de las herramientas y controles dentro del editor. */
    bindEditorEvents() {
      // Nueva captura
      const newCaptureBtn = this.shadowRoot.getElementById("qcEditorNewCapture");
      const newCaptureMenu = this.shadowRoot.getElementById("qcNewCaptureMenu");
      if (newCaptureBtn && newCaptureMenu) {
        newCaptureBtn.onclick = (e) => { e.stopPropagation(); newCaptureMenu.classList.toggle("show"); };
        this.shadowRoot.getElementById("qcNewCaptureFull").onclick = async () => {
          newCaptureMenu.classList.remove("show");
          this.closeEditor();
          await this.captureFullAndEdit();
        };
        this.shadowRoot.getElementById("qcNewCaptureRegion").onclick = () => {
          newCaptureMenu.classList.remove("show");
          this.closeEditor();
          this.captureRegion();
        };
      }

      // Botones de herramientas
      this.shadowRoot.querySelectorAll(".qc-editor-tool-btn").forEach(btn => {
        btn.onclick = () => this.selectTool(btn.dataset.tool, btn);
      });

      // Botones de relleno
      this.shadowRoot.querySelectorAll(".qc-fill-btn").forEach(btn => {
        btn.onclick = () => {
          this.shadowRoot.querySelectorAll(".qc-fill-btn").forEach(el => el.classList.remove("active"));
          btn.classList.add("active");
          this.state.currentFill = btn.dataset.fill;
          // Actualizar objeto seleccionado si hay uno
          this.updateSelectedObjectStyle();
        };
      });

      // Slider de grosor
      const strokeSlider = this.shadowRoot.getElementById("qcStrokeWidth");
      const strokeVal = this.shadowRoot.getElementById("qcStrokeVal");
      if (strokeSlider) {
        strokeSlider.oninput = () => {
          this.state.currentStrokeWidth = parseInt(strokeSlider.value);
          if (strokeVal) strokeVal.textContent = strokeSlider.value + " px";
          const canvas = this.state.fabricCanvas;
          if (canvas && canvas.isDrawingMode) canvas.freeDrawingBrush.width = this.state.currentStrokeWidth;
          this.updateSelectedObjectStyle();
        };
      }

      // Colores — swatches
      this.shadowRoot.querySelectorAll(".qc-color-swatch").forEach(btn => {
        btn.onclick = () => {
          this.shadowRoot.querySelectorAll(".qc-color-swatch").forEach(el => el.classList.remove("active"));
          btn.classList.add("active");
          this.state.currentColor = btn.dataset.color;
          this.state.currentOpacity = 1;
          // Reflejar en el botón picker
          const customColorBtn = this.shadowRoot.getElementById("qcCustomColorBtn");
          if (customColorBtn) {
            customColorBtn.style.background = btn.dataset.color;
            customColorBtn.classList.remove("swatch-active");
          }
          const canvas = this.state.fabricCanvas;
          if (canvas && canvas.isDrawingMode) canvas.freeDrawingBrush.color = this.state.currentColor;
          this.updateSelectedObjectStyle();
        };
      });

      // Color picker nativo
      const customColorInput = this.shadowRoot.getElementById("qcCustomColor");
      const customColorBtn = this.shadowRoot.getElementById("qcCustomColorBtn");
      if (customColorInput && customColorBtn) {
        // Inicializar con color primario
        customColorBtn.style.background = this.state.currentColor;
        customColorBtn.classList.add("swatch-active");

        customColorInput.oninput = () => {
          const color = customColorInput.value;
          this.state.currentColor = color;
          this.state.currentOpacity = 1;
          // Deseleccionar swatches fijos
          this.shadowRoot.querySelectorAll(".qc-color-swatch").forEach(el => el.classList.remove("active"));
          // Reflejar color en el botón
          customColorBtn.style.background = color;
          customColorBtn.classList.add("swatch-active");
          const canvas = this.state.fabricCanvas;
          if (canvas && canvas.isDrawingMode) canvas.freeDrawingBrush.color = color;
          this.updateSelectedObjectStyle();
        };
      }

      // Cerrar editor (descarta cambios)
      this.shadowRoot.getElementById("qcEditorClose").onclick = () => {
        this.state.screenshot = this.state.editorImageUrl;
        this.disposeEditor();
        this.closeEditor();
        this.open();
      };

      // Cancelar (elimina captura)
      this.shadowRoot.getElementById("qcEditorCancel").onclick = () => {
        this.state.screenshot = null;
        this.state.editorImageUrl = null;
        this.disposeEditor();
        this.closeEditor();
        this.openFromFab();
      };

      // Aceptar (guarda)
      this.shadowRoot.getElementById("qcEditorAccept").onclick = () => {
        if (this.state.fabricCanvas) {
          // Deseleccionar antes de exportar para que no aparezcan los handles
          this.state.fabricCanvas.discardActiveObject();
          this.state.fabricCanvas.renderAll();
          // Exportar deshaciendo la escala visual del editor para recuperar la calidad original
          const editedImageUrl = this.state.fabricCanvas.toDataURL({
            format: "jpeg",
            quality: this.config.imageQuality,
            multiplier: 1 / (this.state.editorScale || 1)
          });
          this.state.screenshot = editedImageUrl;
        }
        this.state.editorImageUrl = null;
        this.disposeEditor();
        this.closeEditor();
        this.shadowRoot.getElementById("qcOverlay").classList.add("active");
        this.renderForm();
      };

      // Cerrar submenú al hacer click fuera
      document.addEventListener("click", (e) => {
        const menu = this.shadowRoot.getElementById("qcNewCaptureMenu");
        if (menu && menu.classList.contains("show")) menu.classList.remove("show");
      }, { once: false });
    }

    /**
     * Seleccionar una herramienta — NO crea objetos, solo cambia el modo
     */
    selectTool(tool, btn) {
      const canvas = this.state.fabricCanvas;
      if (!canvas) return;

      // Undo es acción inmediata, no herramienta
      if (tool === "undo") {
        this.doUndo();
        return;
      }

      // Actualizar UI
      this.shadowRoot.querySelectorAll(".qc-editor-tool-btn").forEach(el => el.classList.remove("active"));
      if (btn) btn.classList.add("active");

      this.state.currentTool = tool;
      this.state.isDrawingShape = false;
      this.state.activeShapeObj = null;

      const wrap = this.shadowRoot.getElementById("qcCanvasWrap");

      // Configurar modo del canvas
      canvas.isDrawingMode = false;
      canvas.selection = (tool === "select");

      // Cursor visual
      wrap.classList.remove("cursor-crosshair", "cursor-text");

      // Hint
      const hintEl = this.shadowRoot.getElementById("qcToolHint");

      if (tool === "select") {
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
        if (hintEl) hintEl.textContent = "Clic para seleccionar";
      } else if (tool === "draw") {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = this.state.currentColor;
        canvas.freeDrawingBrush.width = this.state.currentStrokeWidth;
        if (hintEl) hintEl.textContent = "Arrastra para dibujar";
      } else if (tool === "text") {
        canvas.defaultCursor = "text";
        wrap.classList.add("cursor-text");
        if (hintEl) hintEl.textContent = "Clic para insertar texto";
      } else if (tool === "rectangle") {
        wrap.classList.add("cursor-crosshair");
        canvas.defaultCursor = "crosshair";
        canvas.selection = false;
        if (hintEl) hintEl.textContent = "Clic y arrastra para crear";
      } else if (tool === "circle") {
        wrap.classList.add("cursor-crosshair");
        canvas.defaultCursor = "crosshair";
        canvas.selection = false;
        if (hintEl) hintEl.textContent = "Clic y arrastra para crear";
      } else if (tool === "arrow") {
        wrap.classList.add("cursor-crosshair");
        canvas.defaultCursor = "crosshair";
        canvas.selection = false;
        if (hintEl) hintEl.textContent = "Clic y arrastra para crear";
      }

      canvas.renderAll();
    }

    /** Revierte la última acción en el canvas usando el historial. */
    doUndo() {
      const canvas = this.state.fabricCanvas;
      if (!canvas) return;
      if (this.state.historyStep > 0) {
        this.state.historyStep--;
        canvas.loadFromJSON(this.state.history[this.state.historyStep], canvas.renderAll.bind(canvas));
      }
    }

    /**
     * Actualiza el estilo del objeto actualmente seleccionado en el canvas
     */
    updateSelectedObjectStyle() {
      const canvas = this.state.fabricCanvas;
      if (!canvas) return;
      const activeObj = canvas.getActiveObject();
      if (!activeObj) return;

      const color = this.state.currentColor;
      const fill = this.state.currentFill;
      const sw = this.state.currentStrokeWidth;

      this.saveHistory();

      if (activeObj.type === "i-text" || activeObj.type === "text") {
        activeObj.set("fill", color);
      } else if (activeObj.type === "rect" || activeObj.type === "ellipse") {
        this.applyShapeStyle(activeObj, color, fill, sw);
      } else if (activeObj.type === "path") {
        // Trazo libre
        activeObj.set("stroke", color);
        activeObj.set("strokeWidth", sw);
      } else if (activeObj.type === "group") {
        // Flechas
        activeObj.getObjects().forEach(obj => {
          if (obj.type === "line") { obj.set("stroke", color); obj.set("strokeWidth", sw); }
          if (obj.type === "triangle") { obj.set("fill", color); }
        });
      }
      canvas.renderAll();
    }

    /**
     * Aplica fill/stroke a una forma según el modo de relleno seleccionado
     */
    applyShapeStyle(obj, color, fillMode, strokeWidth) {
      if (fillMode === "solid") {
        // Relleno sólido, sin borde visible
        obj.set({
          fill: color,
          stroke: null,
          strokeWidth: 0,
        });
      } else if (fillMode === "none") {
        // Sin relleno, solo borde
        obj.set({
          fill: "transparent",
          stroke: color,
          strokeWidth: strokeWidth,
        });
      }
      // Si el color tiene alpha (rgba) lo respetamos
      if (color.startsWith("rgba")) {
        if (fillMode === "solid") {
          obj.set({ fill: color, stroke: null, strokeWidth: 0 });
        } else {
          obj.set({ fill: color, stroke: null, strokeWidth: 0 });
        }
      }
    }

    // =========================================================================
    // EDITOR — CANVAS
    // =========================================================================
    /** Inicializa el canvas de Fabric.js con la captura de pantalla de fondo. */
    loadEditorCanvas(imageUrl) {
      const canvasEl = this.shadowRoot.getElementById("qcEditorCanvas");
      if (this.state.fabricCanvas) {
        this.state.fabricCanvas.dispose();
      }

      const canvas = new fabric.Canvas(canvasEl, {
        selection: true,
        preserveObjectStacking: true,
      });
      this.state.fabricCanvas = canvas;

      fabric.Image.fromURL(imageUrl, (img) => {
        if (!img) return;
        const wrap = this.shadowRoot.querySelector(".qc-editor-canvas-wrap");
        const maxW = wrap.clientWidth - 40;
        const maxH = wrap.clientHeight - 40;
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        this.state.editorScale = scale; // Guardamos la escala visual

        canvas.setWidth(img.width * scale);
        canvas.setHeight(img.height * scale);
        img.scale(scale);
        img.set({ left: 0, top: 0, selectable: false, evented: false });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));

        this.saveHistory();
      }, { crossOrigin: "anonymous" });

      // —— MOUSE DOWN: crear objetos al hacer clic ——
      canvas.on("mouse:down", (opt) => {
        const tool = this.state.currentTool;

        // En modo select, si hay objeto bajo el cursor lo seleccionamos normalmente
        if (tool === "select" || tool === "draw") return;

        // Si se hizo clic sobre un objeto existente en modo herramienta, ignorar creación
        if (opt.target) return;

        const pointer = canvas.getPointer(opt.e);
        const color = this.state.currentColor;
        const fill = this.state.currentFill;
        const sw = this.state.currentStrokeWidth;

        if (tool === "text") {
          this.saveHistory();
          const text = new fabric.IText("Escribe aquí", {
            left: pointer.x,
            top: pointer.y,
            fill: color,
            fontSize: 22,
            fontFamily: "Arial",
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          canvas.renderAll();
          text.enterEditing();
          text.selectAll();
          return;
        }

        // Para rect, circle, arrow: iniciar dibujo con arrastre
        this.state.isDrawingShape = true;
        this.state.shapeStartX = pointer.x;
        this.state.shapeStartY = pointer.y;

        if (tool === "rectangle") {
          const rect = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 1,
            height: 1,
            rx: 4,
            ry: 4,
            selectable: false,
            evented: false,
            originX: "left",
            originY: "top",
          });
          this.applyShapeStyle(rect, color, fill, sw);
          canvas.add(rect);
          this.state.activeShapeObj = rect;
        }
        else if (tool === "circle") {
          const ellipse = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 1,
            ry: 1,
            selectable: false,
            evented: false,
            originX: "left",
            originY: "top",
          });
          this.applyShapeStyle(ellipse, color, fill, sw);
          canvas.add(ellipse);
          this.state.activeShapeObj = ellipse;
        }
        else if (tool === "arrow") {
          // Línea con punta: se crea mínima y crece al arrastrar
          const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: color,
            strokeWidth: sw,
            selectable: false,
            evented: false,
          });
          // Triángulo de punta (se actualizará al soltar)
          const arrowHead = new fabric.Triangle({
            width: sw * 4 + 8,
            height: sw * 4 + 8,
            fill: color,
            left: pointer.x,
            top: pointer.y,
            angle: 90,
            selectable: false,
            evented: false,
            originX: "center",
            originY: "center",
          });
          canvas.add(line);
          canvas.add(arrowHead);
          this.state.activeShapeObj = { type: "arrow-preview", line, arrowHead };
        }

        canvas.renderAll();
      });

      // —— MOUSE MOVE: redimensionar forma en tiempo real ——
      canvas.on("mouse:move", (opt) => {
        if (!this.state.isDrawingShape || !this.state.activeShapeObj) return;
        const pointer = canvas.getPointer(opt.e);
        const x0 = this.state.shapeStartX;
        const y0 = this.state.shapeStartY;
        const x1 = pointer.x;
        const y1 = pointer.y;
        const w = Math.abs(x1 - x0);
        const h = Math.abs(y1 - y0);
        const left = Math.min(x0, x1);
        const top = Math.min(y0, y1);
        const obj = this.state.activeShapeObj;

        if (obj.type === "rect") {
          obj.set({ left, top, width: w, height: h });
        } else if (obj.type === "ellipse") {
          obj.set({ left, top, rx: w / 2, ry: h / 2 });
        } else if (obj.type === "arrow-preview") {
          const { line, arrowHead } = obj;
          line.set({ x1: x0, y1: y0, x2: x1, y2: y1 });
          // Ángulo de la punta
          const angle = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI + 90;
          arrowHead.set({ left: x1, top: y1, angle });
        }
        canvas.renderAll();
      });

      // —— MOUSE UP: finalizar forma y hacerla seleccionable ——
      canvas.on("mouse:up", (opt) => {
        if (!this.state.isDrawingShape) return;
        this.state.isDrawingShape = false;

        const obj = this.state.activeShapeObj;
        this.state.activeShapeObj = null;

        if (!obj) return;

        const pointer = canvas.getPointer(opt.e);
        const x0 = this.state.shapeStartX;
        const y0 = this.state.shapeStartY;
        const dist = Math.sqrt((pointer.x - x0) ** 2 + (pointer.y - y0) ** 2);

        // Si el arrastre fue muy pequeño (<8px), crear forma de tamaño por defecto
        if (dist < 8) {
          if (obj.type === "rect") {
            obj.set({ width: 160, height: 100, left: x0 - 80, top: y0 - 50 });
          } else if (obj.type === "ellipse") {
            obj.set({ rx: 70, ry: 50, left: x0 - 70, top: y0 - 50 });
          } else if (obj.type === "arrow-preview") {
            const { line, arrowHead } = obj;
            line.set({ x1: x0, y1: y0, x2: x0 + 120, y2: y0 });
            arrowHead.set({ left: x0 + 120, top: y0, angle: 90 });
          }
        }

        // Hacer seleccionable y guardar
        if (obj.type === "arrow-preview") {
          const { line, arrowHead } = obj;
          canvas.remove(line);
          canvas.remove(arrowHead);
          // Agrupar en un grupo seleccionable
          const group = new fabric.Group([
            new fabric.Line([line.x1, line.y1, line.x2, line.y2], {
              stroke: line.stroke,
              strokeWidth: line.strokeWidth,
            }),
            new fabric.Triangle({
              width: arrowHead.width,
              height: arrowHead.height,
              fill: arrowHead.fill,
              left: arrowHead.left,
              top: arrowHead.top,
              angle: arrowHead.angle,
              originX: "center",
              originY: "center",
            }),
          ]);
          canvas.add(group);
          canvas.setActiveObject(group);
        } else {
          obj.set({ selectable: true, evented: true });
          canvas.setActiveObject(obj);
        }

        this.saveHistory();
        canvas.renderAll();

        // Volver al modo select automáticamente
        const selectBtn = this.shadowRoot.querySelector('.qc-editor-tool-btn[data-tool="select"]');
        this.selectTool("select", selectBtn);
      });

      // Historial al modificar
      canvas.on("object:modified", () => this.saveHistory());

      // Selección → sync controles
      canvas.on("selection:created", (e) => this.handleSelection(e));
      canvas.on("selection:updated", (e) => this.handleSelection(e));
      canvas.on("selection:cleared", () => this.hideDeleteButton());

      // Tecla Delete para eliminar seleccionado
      this._keyHandler = (e) => {
        if ((e.key === "Delete" || e.key === "Backspace") && this.state.fabricCanvas) {
          const active = this.state.fabricCanvas.getActiveObject();
          // No eliminar si hay texto en edición
          if (active && !(active.type === "i-text" && active.isEditing)) {
            this.saveHistory();
            this.state.fabricCanvas.remove(active);
            this.hideDeleteButton();
          }
        }
      };
      window.addEventListener("keydown", this._keyHandler);
    }

    /** Maneja la selección de objetos en el canvas para mostrar opciones como "Eliminar". */
    handleSelection(e) {
      const obj = e.selected && e.selected[0];
      if (!obj) return;
      // Mostrar botón eliminar
      this.showDeleteButton(obj);
    }

    /** Muestra el botón flotante de "Eliminar" junto al objeto seleccionado. */
    showDeleteButton(obj) {
      let deleteBtn = document.getElementById("qcDeleteBtn");
      if (!deleteBtn) {
        deleteBtn = document.createElement("button");
        deleteBtn.id = "qcDeleteBtn";
        deleteBtn.innerHTML = "🗑 Eliminar";
        deleteBtn.style.cssText = `
          position:fixed;padding:7px 14px;background:#ef4444;border:none;
          border-radius:8px;color:white;font-size:13px;font-weight:600;
          cursor:pointer;z-index:10000000;box-shadow:0 4px 12px rgba(0,0,0,.4);
          display:none;white-space:nowrap;font-family:sans-serif;
        `;
        document.body.appendChild(deleteBtn);
        deleteBtn.onclick = () => {
          const canvas = this.state.fabricCanvas;
          if (!canvas) return;
          const activeObj = canvas.getActiveObject();
          if (activeObj) {
            this.saveHistory();
            canvas.remove(activeObj);
            this.hideDeleteButton();
          }
        };
      }

      // Calcular posición relativa a la ventana
      const canvasWrap = this.shadowRoot.querySelector(".qc-editor-canvas-wrap");
      const wrapRect = canvasWrap ? canvasWrap.getBoundingClientRect() : { left: 0, top: 0 };
      const objBounds = obj.getBoundingRect(true, true);
      const canvas = this.state.fabricCanvas;

      // Convertir coordenadas del canvas a coordenadas de ventana
      const canvasEl = this.shadowRoot.getElementById("qcEditorCanvas");
      const canvasRect = canvasEl ? canvasEl.getBoundingClientRect() : wrapRect;

      const scaleX = canvasRect.width / canvas.width;
      const scaleY = canvasRect.height / canvas.height;

      const btnX = canvasRect.left + objBounds.left * scaleX + objBounds.width * scaleX - 80;
      const btnY = canvasRect.top + objBounds.top * scaleY - 44;

      deleteBtn.style.left = Math.max(8, btnX) + "px";
      deleteBtn.style.top = Math.max(8, btnY) + "px";
      deleteBtn.style.display = "block";
    }

    /** Oculta el botón flotante de eliminar. */
    hideDeleteButton() {
      const btn = document.getElementById("qcDeleteBtn");
      if (btn) btn.style.display = "none";
    }

    // =========================================================================
    // DATOS
    // =========================================================================
    /** Recopila y retorna todos los datos ingresados en el formulario junto con info del navegador. */
    getData() {
      const descEl = this.shadowRoot.getElementById("qcDescription");
      const priorityEl = this.shadowRoot.getElementById("qcPriority");
      const moduleEl = this.shadowRoot.getElementById("qcModule");
      return {
        app: this.config.appName,
        module: moduleEl ? moduleEl.value : "Todos los módulos",
        description: descEl ? descEl.value : "",
        priority: priorityEl ? priorityEl.value : "media",
        screenshot: this.state.screenshot,
        url: location.href,
        browser: navigator.userAgent,
        resolution: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      };
    }

    // =========================================================================
    // ENVÍO DE DATOS
    // =========================================================================
    /** Valida y envía los datos al endpoint configurado. Dispatch: feedback-submit */
    async sendFeedback() {
      // — Validaciones —
      if (!this.state.screenshot) {
        this.showFormMessage("error", "Captura una pantalla antes de enviar.");
        return;
      }
      const descEl = this.shadowRoot.getElementById("qcDescription");
      const desc = descEl ? descEl.value.trim() : "";
      if (!desc) {
        descEl && descEl.focus();
        this.showFormMessage("error", "La descripción no puede estar vacía.");
        return;
      }
      if (!this.config.endpoint) {
        this.showFormMessage("error", "No se ha configurado un endpoint (atributo 'endpoint').");
        return;
      }

      const data = this.getData();

      // Bloquear UI mientras envía
      const sendBtn = this.shadowRoot.getElementById("qcSendBtn");
      if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = "Enviando…"; }

      try {
        const res = await fetch(this.config.endpoint, {
          method: "POST",
          // no-cors y text/plain son necesarios para evitar el bloqueo de CORS en Google Apps Script
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
        });

        // En modo no-cors la respuesta es opaca (res.type === 'opaque'), lo que significa que
        // la petición se envió pero no podemos leer la respuesta. Lo damos por válido.
        if (!res.ok && res.type !== "opaque") {
          // Intentar leer mensaje del servidor
          let serverMsg = "";
          try { const j = await res.json(); serverMsg = j.message || j.error || ""; } catch (_) { }
          throw new Error(serverMsg || `Error del servidor (${res.status})`);
        }

        // Éxito
        this.showFormMessage("success", "¡Feedback enviado correctamente! Gracias.");
        this.state.screenshot = null;
        this.dispatchEvent(new CustomEvent("feedback-submit", { detail: data }));

        // Cerrar tras 2 s
        setTimeout(() => this.close(), 2000);

      } catch (err) {
        console.error("QCFeedback send error:", err);
        const msg = err.message || "Error de red. Verifica tu conexión e intenta de nuevo.";
        this.showFormMessage("error", msg);
        if (sendBtn) { sendBtn.disabled = false; sendBtn.innerHTML = `${this.iconSend()} Enviar`; }
      }
    }

    /** Muestra un mensaje de estado debajo del formulario */
    showFormMessage(type, text) {
      let msgEl = this.shadowRoot.getElementById("qcFormMsg");
      if (!msgEl) {
        msgEl = document.createElement("div");
        msgEl.id = "qcFormMsg";
        const actions = this.shadowRoot.getElementById("qcActionsChat");
        actions && actions.parentNode.insertBefore(msgEl, actions);
      }
      const isErr = type === "error";
      msgEl.style.cssText = `
        margin: 0 16px 10px; padding: 10px 14px; border-radius: 10px; font-size: 13px;
        line-height: 1.4; font-family: inherit;
        background: ${isErr ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)"};
        color: ${isErr ? "#ef4444" : "#16a34a"};
        border: 1px solid ${isErr ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"};
      `;
      msgEl.textContent = (isErr ? "⚠ " : "✓ ") + text;

      // Auto-ocultar errores tras 5 s
      if (isErr) setTimeout(() => { if (msgEl) msgEl.remove(); }, 5000);
    }

    // =========================================================================
    // POSICIÓN FAB
    // =========================================================================
    /** Ajusta la posición del botón flotante en la pantalla según la configuración. */
    positionFAB() {
      const fab = this.shadowRoot.querySelector(".qc-fab");
      const p = this.config.position;
      if (p.includes("bottom")) fab.style.bottom = "24px";
      if (p.includes("top")) fab.style.top = "24px";
      if (p.includes("right")) fab.style.right = "24px";
      if (p.includes("left")) fab.style.left = "24px";
    }

    // =========================================================================
    // API PÚBLICA
    // =========================================================================
    /** @method Abre el widget (alias de open) */
    openWidget() { this.open(); }
    /** @method Cierra el widget (alias de close) */
    closeWidget() { this.close(); }
    /** @method Inicia captura de pantalla */
    capture() { this.captureFull(); }
    /** @method Envía el feedback */
    send() { this.sendFeedback(); }
    /** @method Cambia el tema (light|dark) */
    setTheme(theme) { this.setAttribute("theme", theme); }
  }

  customElements.define("qc-feedback", QCFeedback);
})();