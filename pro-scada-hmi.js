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
    const s1 = e1 ? e1.state : "N/A";
    const s2 = e2 ? e2.state : "N/A";
    const s3 = e3 ? `${e3.state} ${e3.attributes.unit_of_measurement || ''}`.trim() : "N/A";
    const s4 = e4 ? `${e4.state} ${e4.attributes.unit_of_measurement || ''}`.trim() : "N/A";
    const s5 = e5 ? `${e5.state} ${e5.attributes.unit_of_measurement || ''}`.trim() : "N/A";

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
    } else {
      // Keď sa aktualizuje hass v editore, mali by sme ho predať pickerom
      this.updatePickers();
    }
  }

  init() {
    if (!this._hass) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="card-config">
        <div class="option" style="margin-bottom: 12px;">
          <ha-entity-picker id="picker1" label="Entity 1 (Čerpadlá)" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="option" style="margin-bottom: 12px;">
          <ha-entity-picker id="picker2" label="Entity 2 (Mix Ventily)" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="option" style="margin-bottom: 12px;">
          <ha-entity-picker id="picker3" label="Entity 3 (Teploty)" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="option" style="margin-bottom: 12px;">
          <ha-entity-picker id="picker4" label="Entity 4 (Teploty vratné)" allow-custom-entity></ha-entity-picker>
        </div>
        <div class="option" style="margin-bottom: 12px;">
          <ha-entity-picker id="picker5" label="Entity 5 (Extra senzor/Doplňujúca hodnota)" allow-custom-entity></ha-entity-picker>
        </div>
      </div>
    `;

    this._setupPicker('picker1', 'entity_1');
    this._setupPicker('picker2', 'entity_2');
    this._setupPicker('picker3', 'entity_3');
    this._setupPicker('picker4', 'entity_4');
    this._setupPicker('picker5', 'entity_5');
  }

  _setupPicker(pickerId, configKey) {
    const picker = this.querySelector('#' + pickerId);
    if (!picker) return;
    picker.hass = this._hass;
    picker.value = this._config[configKey] || '';
    picker.addEventListener('value-changed', (ev) => this._valueChanged(ev, configKey));
  }

  updatePickers() {
    const keys = ['entity_1', 'entity_2', 'entity_3', 'entity_4', 'entity_5'];
    keys.forEach((key, index) => {
      const picker = this.querySelector('#picker' + (index + 1));
      if (picker) {
        picker.hass = this._hass;
      }
    });
  }

  _valueChanged(ev, key) {
    if (!this._config || !this._hass) return;

    if (this._config[key] === ev.detail.value) return;

    this._config = {
      ...this._config,
      [key]: ev.detail.value
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
