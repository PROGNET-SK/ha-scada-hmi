// pro-scada-hmi.js
const version = "1.0.1";

console.info(
  `%c PRO-SCADA-HMI %c v${version} `,
  'color: white; background: #039be5; font-weight: 700;',
  'color: #039be5; background: white; font-weight: 700;'
);

class ProScadaHmiCard extends HTMLElement {
  // Priradenie vlastného editora pre túto kartu
  static getConfigElement() {
    return document.createElement("pro-scada-hmi-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:pro-scada-hmi",
      entity_1: "",
      entity_2: "",
      entity_3: "",
      entity_4: "",
      entity_5: "",
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Neplatná konfigurácia");
    }
    this.config = { ...{
      entity_1: "",
      entity_2: "",
      entity_3: "",
      entity_4: "",
      entity_5: "",
    }, ...config };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this.innerHTML = `
        <ha-card header="PRO SCADA HMI">
          <div class="card-content" style="padding: 16px;">
            <style>
              .scada-container { width: 100%; height: auto; }
              .scada-svg { width: 100%; height: auto; display: block; }
              .label { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: var(--primary-text-color, #fff); }
              .value { font-family: Arial, sans-serif; font-size: 14px; fill: var(--primary-text-color, #fff); }
              .col-bg { fill: var(--secondary-background-color, #333); stroke: var(--divider-color, #555); stroke-width: 1; rx: 8; }
              /* Minimal CSS animaions could be added here */
            </style>
            <div id="svg-container" class="scada-container"></div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector("#svg-container");
    }

    this.renderSVG();
  }

  renderSVG() {
    if (!this.config || !this._hass) return;

    // Načítanie stavov entít; ak nie sú konfigurované alebo dostupné, default je null
    const e1 = this.config.entity_1 ? this._hass.states[this.config.entity_1] : null;
    const e2 = this.config.entity_2 ? this._hass.states[this.config.entity_2] : null;
    const e3 = this.config.entity_3 ? this._hass.states[this.config.entity_3] : null;
    const e4 = this.config.entity_4 ? this._hass.states[this.config.entity_4] : null;
    const e5 = this.config.entity_5 ? this._hass.states[this.config.entity_5] : null;

    // Extrahovanie hodnôt a jednotiek
    const s1 = e1 ? e1.state : "0";
    const s2 = e2 ? e2.state : "0";
    const s3 = e3 ? `${e3.state} ${e3.attributes.unit_of_measurement || ''}`.trim() : "0";
    const s4 = e4 ? `${e4.state} ${e4.attributes.unit_of_measurement || ''}`.trim() : "0";
    const s5 = e5 ? `${e5.state} ${e5.attributes.unit_of_measurement || ''}`.trim() : "0";

    const isE1On = s1 === "on" || (parseFloat(s1) > 0);
    const isE2On = s2 === "on" || (parseFloat(s2) > 0);

    // Hlavné SVG (4 stĺpce, každý 200px, výška 300px => viewBox="0 0 800 300")
    this.content.innerHTML = `
      <svg class="scada-svg" viewBox="0 0 800 300">
        <!-- Pozadia stĺpcov -->
        <rect x="10" y="10" width="180" height="280" class="col-bg" />
        <rect x="210" y="10" width="180" height="280" class="col-bg" />
        <rect x="410" y="10" width="180" height="280" class="col-bg" />
        <rect x="610" y="10" width="180" height="280" class="col-bg" />

        <!-- Nadpisy stĺpcov -->
        <text x="100" y="40" text-anchor="middle" class="label">Čerpadlá</text>
        <text x="300" y="40" text-anchor="middle" class="label">Mix Ventily</text>
        <text x="500" y="40" text-anchor="middle" class="label">Teploty</text>
        <text x="700" y="40" text-anchor="middle" class="label">Teploty Vratné</text>

        <!-- Stĺpec 1: Čerpadlá -->
        <circle cx="100" cy="120" r="40" fill="${isE1On ? '#4caf50' : '#f44336'}" />
        <text x="100" y="190" text-anchor="middle" class="value">Stav: ${s1}</text>

        <!-- Stĺpec 2: Mix Ventily -->
        <polygon points="300,80 340,140 260,140" fill="${isE2On ? '#2196f3' : '#9e9e9e'}" />
        <text x="300" y="190" text-anchor="middle" class="value">Stav: ${s2}</text>

        <!-- Stĺpec 3: Teploty -->
        <rect x="480" y="80" width="40" height="80" fill="#ff9800" rx="4" />
        <text x="500" y="190" text-anchor="middle" class="value">${s3}</text>

        <!-- Stĺpec 4: Teploty Vratné -->
        <rect x="680" y="80" width="40" height="80" fill="#00bcd4" rx="4" />
        <text x="700" y="190" text-anchor="middle" class="value">${s4}</text>

        <!-- Zobrazenie 5tej (Doplnkovej) Entity na spodu -->
        <rect x="250" y="240" width="300" height="40" fill="#444" rx="5" />
        <text x="400" y="265" text-anchor="middle" class="label" fill="#fff">Referenčný senzor: ${s5}</text>
      </svg>
    `;
  }

  getCardSize() {
    return 4;
  }
}

class ProScadaHmiCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this.init();
    }
  }

  init() {
    if (!this._hass) return;
    this._initialized = true;

    // Všetky entity z HA zapísané do natívneho <select> elementu
    const entities = Object.keys(this._hass.states).sort();
    let options = `<option value="">-- Nevybraná entita (Zobrazí 0) --</option>`;
    entities.forEach(entity => {
      options += `<option value="${entity}">${entity}</option>`;
    });

    this.innerHTML = `
      <style>
        .scada-block {
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 6px;
          margin-bottom: 12px;
          overflow: hidden;
          background: var(--card-background-color, #fff);
        }
        .scada-block-header {
          background: var(--secondary-background-color, #f5f5f5);
          padding: 12px 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--primary-text-color, #212121);
          user-select: none;
        }
        .scada-block-header:hover {
          background: var(--divider-color, #e0e0e0);
        }
        .scada-block-content {
          padding: 16px;
          display: none;
        }
        .scada-block-content.active {
          display: block;
        }
        .scada-select {
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          border-radius: 4px;
          border: 1px solid var(--divider-color, #ccc);
          background-color: var(--card-background-color, #fff);
          color: var(--primary-text-color, #212121);
          font-size: 14px;
        }
        .scada-select:focus {
          outline: none;
          border-color: var(--primary-color, #03a9f4);
        }
      </style>
      <div class="card-config">
        <!-- Blok 1 -->
        <div class="scada-block">
          <div class="scada-block-header" onclick="this.nextElementSibling.classList.toggle('active')">
            1. Čerpadlá <span style="font-size: 12px;">▼</span>
          </div>
          <div class="scada-block-content">
            <label>Priradiť Entity ID do bloku Čerpadiel:</label>
            <select id="select1" class="scada-select">${options}</select>
          </div>
        </div>

        <!-- Blok 2 -->
        <div class="scada-block">
          <div class="scada-block-header" onclick="this.nextElementSibling.classList.toggle('active')">
            2. Mix Ventily <span style="font-size: 12px;">▼</span>
          </div>
          <div class="scada-block-content">
            <label>Priradiť Entity ID do bloku Mix Ventily:</label>
            <select id="select2" class="scada-select">${options}</select>
          </div>
        </div>

        <!-- Blok 3 -->
        <div class="scada-block">
          <div class="scada-block-header" onclick="this.nextElementSibling.classList.toggle('active')">
            3. Teploty <span style="font-size: 12px;">▼</span>
          </div>
          <div class="scada-block-content">
            <label>Priradiť Entity ID do bloku Teplôt:</label>
            <select id="select3" class="scada-select">${options}</select>
          </div>
        </div>

        <!-- Blok 4 -->
        <div class="scada-block">
          <div class="scada-block-header" onclick="this.nextElementSibling.classList.toggle('active')">
            4. Teploty vratné <span style="font-size: 12px;">▼</span>
          </div>
          <div class="scada-block-content">
            <label>Priradiť Entity ID do bloku Teplôt vratných:</label>
            <select id="select4" class="scada-select">${options}</select>
          </div>
        </div>

        <!-- Blok 5 (Extra) -->
        <div class="scada-block">
          <div class="scada-block-header" onclick="this.nextElementSibling.classList.toggle('active')">
            5. Spodný senzor (Extra) <span style="font-size: 12px;">▼</span>
          </div>
          <div class="scada-block-content">
            <label>Priradiť Entity ID pre spodnú hodnotu:</label>
            <select id="select5" class="scada-select">${options}</select>
          </div>
        </div>
      </div>
    `;

    this._setupSelect('select1', 'entity_1');
    this._setupSelect('select2', 'entity_2');
    this._setupSelect('select3', 'entity_3');
    this._setupSelect('select4', 'entity_4');
    this._setupSelect('select5', 'entity_5');
  }

  _setupSelect(selectId, configKey) {
    const selectEl = this.querySelector('#' + selectId);
    if (!selectEl) return;
    
    // Prednastavená hodnota
    selectEl.value = (this._config && this._config[configKey]) || '';
    
    // Udalosť pri zmene
    selectEl.addEventListener('change', (ev) => this._valueChanged(ev, configKey));
  }

  _valueChanged(ev, key) {
    if (!this._config) return;

    if (this._config[key] === ev.target.value) return;

    this._config = {
      ...this._config,
      [key]: ev.target.value
    };

    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define("pro-scada-hmi", ProScadaHmiCard);
customElements.define("pro-scada-hmi-editor", ProScadaHmiCardEditor);

// Pridanie karty do zoznamu custom kard v používateľskom paneli Home Assistant (aby to bolo vyhľadateľné pod "pro-scada-hmi")
window.customCards = window.customCards || [];
window.customCards.push({
  type: "pro-scada-hmi",
  name: "Pro SCADA HMI",
  preview: true,
  description: "Scada HMI so 4 stĺpcami zobrazení pomocou dynamického SVG."
});
