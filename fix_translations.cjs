const fs = require('fs');

const file = 'src/lib/translations.ts';
let content = fs.readFileSync(file, 'utf8');

const additions = {
  en: {
    settings: "Settings",
    helpCenter: "Help Center",
    legal: "Legal",
    bugReport: "Bug Report",
    adminPanel: "Admin Panel",
    submitGameButton: "Submit Game"
  },
  pt: {
    settings: "Configurações",
    helpCenter: "Centro de Ajuda",
    legal: "Jurídico",
    bugReport: "Reportar Bug",
    adminPanel: "Painel Admin",
    submitGameButton: "Enviar Jogo"
  },
  es: {
    settings: "Configuración",
    helpCenter: "Centro de Ayuda",
    legal: "Aviso Legal",
    bugReport: "Reportar Error",
    adminPanel: "Panel Admin",
    submitGameButton: "Enviar Juego"
  },
  fr: {
    settings: "Paramètres",
    helpCenter: "Centre d'aide",
    legal: "Légal",
    bugReport: "Signaler un Bug",
    adminPanel: "Panneau Admin",
    submitGameButton: "Soumettre un Jeu"
  },
  de: {
    settings: "Einstellungen",
    helpCenter: "Hilfezentrum",
    legal: "Rechtliches",
    bugReport: "Fehler Melden",
    adminPanel: "Admin-Panel",
    submitGameButton: "Spiel Einreichen"
  },
  it: {
    settings: "Impostazioni",
    helpCenter: "Centro Assistenza",
    legal: "Note Legali",
    bugReport: "Segnala Bug",
    adminPanel: "Pannello Admin",
    submitGameButton: "Invia Gioco"
  }
};

for (const lang of Object.keys(additions)) {
  const match = new RegExp(`(${lang}:\\s*\\{[\\s\\S]*?)(\\n\\s*\\})`);
  content = content.replace(match, (m, p1, p2) => {
    let added = "";
    for (const [key, value] of Object.entries(additions[lang])) {
      if (!p1.includes(`\\n    ${key}:`)) {
        added += `    ${key}: "${value}",\\n`;
      }
    }
    return p1 + added + p2;
  });
}

// Write the result and handle literal \n
content = content.replace(/\\n/g, '\n');

fs.writeFileSync(file, content);
