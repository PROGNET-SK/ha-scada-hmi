# PRO SCADA HMI Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)

Custom Lovelace karta pre Home Assistant, vytvorená na dynamické 4-stĺpcové SVG zobrazenie dát pre SCADA / HMI systém.

## Vlastnosti (verzia 1.0.1)
- **4 stĺpcový dizajn:**
  1. Čerpadlá
  2. Mix Ventily
  3. Teploty
  4. Teploty Vratné
- 5 konfigurovateľných entít priamo previazaných s UI editorom, z ktorých sa dynamicky mení SVG vizualizácia.
- Vyhľadanie karty v UI zozname ako **"Pro SCADA HMI"**.
- Kompatibilné s HACS pre jednoduchú správu a aktualizácie.

## Inštalácia cez HACS (Odporúčané)
1. Otvorte HACS vo vašom Home Assistant.
2. V hornom menu zvoľte **Frontend**.
3. Kliknite na tri bodky (Menu) v pravom hornom rohu a vyberte **Vlastné repozitáre** (Custom repositories).
4. Pridajte URL tohto repozitára a typ zvoľte ako **Lovelace**.
5. Následne zistite kartu v zozname (ako `PRO SCADA HMI` alebo podobne podľa repozitára) a nainštalujte.
6. Povoľte pridanie zdroja ak ste vyzvaný, alebo sa uistite, že sa modul nahral.
7. V úprave UI panela kliknite na **Pridať kartu**, vyhľadajte `"Pro SCADA HMI"` a jednoducho nakonfigurujte.

## Manuálna Inštalácia
1. Stiahnite si súbor `pro-scada-hmi.js` z tohto repozitára.
2. Nahrajte tento súbor do priečinka `www` pre Home Assistant (napríklad `/config/www/pro-scada-hmi.js`).
3. Choďte na Nastavenia > Informačné panely (Dashboards) >  Zdroje (Zdroje, horné menu alebo cez 3 bodky).
4. Pridajte nový zdroj:
   - URL: `/local/pro-scada-hmi.js`
   - Typ zdroja: `JavaScript Modul`

## Konfigurácia
Aplikácia sa dá konfigurovať priamo z grafického rozhrania (UI editor).
1. Zvoľte "Pridať do používateľského panelu".
2. Nájdite **"Pro SCADA HMI"**.
3. Zo zoznamu vyberte až 5 dátových bodov (Entity ID).

### Príklad pre YAML konfiguráciu:
```yaml
type: 'custom:pro-scada-hmi'
entity_1: switch.moje_cerpadlo
entity_2: switch.moj_mix_ventil
entity_3: sensor.teplota_kotla
entity_4: sensor.teplota_vratna
entity_5: sensor.celkova_spotreba
```

## Podpora a Vylepšenia
Kód (`pro-scada-hmi.js`) obsahuje priame mapovania na SVG parametre (`fill`, `text`, atď...). V prípade zložitejších logík ho je možné ľubovoľne upraviť a rozšíriť na lepšie animácie či podrobnejšie dáta.

## Licencia
Nezávislý projekt s otvoreným kódom.
