// Gestionnaire centralisé des données Excel pour toutes les pages
// Système de stockage et synchronisation des données budgétaires

class DataManager {
  constructor() {
    this.storageKey = 'simmt_parc_incendie_data';
    this.budgetStorageKey = 'simmt_budget_data';
    this.init();
  }

  init() {
    // Écouter les changements de données entre les onglets/pages
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey || e.key === this.budgetStorageKey) {
        this.notifyDataChange();
      }
    });
  }

  // Sauvegarder les données principales
  saveData(data, source = 'unknown') {
    const dataWithMeta = {
      data: data,
      timestamp: new Date().toISOString(),
      source: source,
      count: data.length
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(dataWithMeta));
    
    // Générer automatiquement les données budgétaires
    this.generateBudgetData(data, source);
    
    // Notifier les autres pages
    this.notifyDataChange();
    
    console.log(`Données sauvegardées: ${data.length} éléments depuis ${source}`);
  }

  // Récupérer les données principales
  getData() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.data || [];
      } catch (e) {
        console.error('Erreur lors de la lecture des données:', e);
        return [];
      }
    }
    return [];
  }

  // Récupérer les métadonnées
  getDataMeta() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          timestamp: parsed.timestamp,
          source: parsed.source,
          count: parsed.count
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Générer les données budgétaires à partir des données principales
  generateBudgetData(data, source) {
    const budgetData = data.map(item => ({
      ...item,
      // Génération de coûts basés sur le type d'équipement
      coutUnitaire: this.generateCostByType(item.Type || item.type || ''),
      dateAcquisition: this.generateRandomDate(),
      amortissement: this.calculateAmortissement(item.Type || item.type || ''),
      coutMaintenance: this.generateMaintenanceCost(item.Type || item.type || ''),
      valeurResiduelle: 0 // Calculé dynamiquement
    }));

    // Calculer la valeur résiduelle
    budgetData.forEach(item => {
      item.valeurResiduelle = this.calculateValeurResiduelle(
        item.coutUnitaire, 
        item.dateAcquisition, 
        item.amortissement
      );
    });

    const budgetDataWithMeta = {
      data: budgetData,
      timestamp: new Date().toISOString(),
      source: source,
      count: budgetData.length,
      totalBudget: budgetData.reduce((sum, item) => sum + item.coutUnitaire, 0),
      avgCost: budgetData.length > 0 ? budgetData.reduce((sum, item) => sum + item.coutUnitaire, 0) / budgetData.length : 0
    };

    localStorage.setItem(this.budgetStorageKey, JSON.stringify(budgetDataWithMeta));
    console.log(`Données budgétaires générées: ${budgetData.length} éléments`);
  }

  // Récupérer les données budgétaires
  getBudgetData() {
    const stored = localStorage.getItem(this.budgetStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.data || [];
      } catch (e) {
        console.error('Erreur lors de la lecture des données budgétaires:', e);
        return [];
      }
    }
    return [];
  }

  // Récupérer les métadonnées budgétaires
  getBudgetMeta() {
    const stored = localStorage.getItem(this.budgetStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          timestamp: parsed.timestamp,
          source: parsed.source,
          count: parsed.count,
          totalBudget: parsed.totalBudget,
          avgCost: parsed.avgCost
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Générer des coûts réalistes par type d'équipement
  generateCostByType(type) {
    const costRanges = {
      'Camion': { min: 180000, max: 350000 },
      'Fourgon': { min: 90000, max: 180000 },
      'Véhicule': { min: 60000, max: 140000 },
      'Remorque': { min: 25000, max: 60000 },
      'Extincteur': { min: 80, max: 800 },
      'Échelle': { min: 200000, max: 500000 },
      'Autopompe': { min: 250000, max: 400000 },
      'Véhicule de Secours': { min: 150000, max: 300000 },
      'default': { min: 15000, max: 120000 }
    };

    // Recherche par mot-clé dans le type
    let range = costRanges['default'];
    for (const [key, value] of Object.entries(costRanges)) {
      if (type.toLowerCase().includes(key.toLowerCase())) {
        range = value;
        break;
      }
    }

    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  // Générer une date d'acquisition aléatoire
  generateRandomDate() {
    const start = new Date(2010, 0, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toLocaleDateString('fr-FR');
  }

  // Calculer l'amortissement annuel
  calculateAmortissement(type) {
    const amortissementRates = {
      'Camion': 10, // 10 ans
      'Fourgon': 8,
      'Véhicule': 7,
      'Remorque': 15,
      'Extincteur': 20,
      'Échelle': 15,
      'Autopompe': 12,
      'default': 10
    };

    for (const [key, value] of Object.entries(amortissementRates)) {
      if (type.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return amortissementRates['default'];
  }

  // Générer un coût de maintenance annuel
  generateMaintenanceCost(type) {
    const maintenanceRates = {
      'Camion': 0.08, // 8% du coût initial
      'Fourgon': 0.06,
      'Véhicule': 0.05,
      'Remorque': 0.03,
      'Extincteur': 0.02,
      'Échelle': 0.10,
      'Autopompe': 0.12,
      'default': 0.06
    };

    let rate = maintenanceRates['default'];
    for (const [key, value] of Object.entries(maintenanceRates)) {
      if (type.toLowerCase().includes(key.toLowerCase())) {
        rate = value;
        break;
      }
    }

    return rate;
  }

  // Calculer la valeur résiduelle
  calculateValeurResiduelle(coutInitial, dateAcquisition, dureeAmortissement) {
    const dateAcq = new Date(dateAcquisition.split('/').reverse().join('-'));
    const today = new Date();
    const ageInYears = (today - dateAcq) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (ageInYears >= dureeAmortissement) {
      return Math.max(coutInitial * 0.05, 1000); // Valeur résiduelle minimale
    }
    
    const amortissementAnnuel = coutInitial / dureeAmortissement;
    const valeurResiduelle = coutInitial - (amortissementAnnuel * ageInYears);
    
    return Math.max(valeurResiduelle, coutInitial * 0.05);
  }

  // Traiter un fichier Excel
  processExcelFile(file, source = 'unknown') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Normaliser les noms de colonnes
          const normalizedData = jsonData.map(item => ({
            Immatriculation: item['Immatriculation'] || item['immatriculation'] || '',
            Type: item['Type'] || item['type'] || '',
            'Corps d\'Armée': item['Corps d\'Armée'] || item['corps_armee'] || item['CorpsArmee'] || '',
            Localisation: item['Localisation'] || item['localisation'] || '',
            Statut: item['Statut'] || item['statut'] || 'Actif',
            Latitude: parseFloat(item['Latitude'] || item['latitude'] || 0),
            Longitude: parseFloat(item['Longitude'] || item['longitude'] || 0)
          }));

          this.saveData(normalizedData, source);
          resolve(normalizedData);
        } catch (error) {
          console.error('Erreur lors du traitement du fichier Excel:', error);
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // Notifier les changements de données
  notifyDataChange() {
    // Émettre un événement personnalisé
    window.dispatchEvent(new CustomEvent('dataUpdated', {
      detail: {
        timestamp: new Date().toISOString(),
        hasData: this.getData().length > 0,
        hasBudgetData: this.getBudgetData().length > 0
      }
    }));
  }

  // Vérifier si des données sont disponibles
  hasData() {
    return this.getData().length > 0;
  }

  // Vérifier si des données budgétaires sont disponibles
  hasBudgetData() {
    return this.getBudgetData().length > 0;
  }

  // Effacer toutes les données
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.budgetStorageKey);
    this.notifyDataChange();
    console.log('Toutes les données ont été effacées');
  }

  // Exporter toutes les données
  exportAllData() {
    const data = this.getData();
    const budgetData = this.getBudgetData();
    
    if (data.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const wb = XLSX.utils.book_new();
    
    // Feuille des données principales
    const wsMain = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, wsMain, 'Données Principales');
    
    // Feuille des données budgétaires
    if (budgetData.length > 0) {
      const wsBudget = XLSX.utils.json_to_sheet(budgetData.map(item => ({
        'Immatriculation': item.Immatriculation,
        'Type': item.Type,
        'Corps d\'Armée': item['Corps d\'Armée'],
        'Localisation': item.Localisation,
        'Coût Initial (€)': item.coutUnitaire,
        'Date Acquisition': item.dateAcquisition,
        'Durée Amortissement (ans)': item.amortissement,
        'Coût Maintenance (%)': (item.coutMaintenance * 100).toFixed(1),
        'Valeur Résiduelle (€)': Math.round(item.valeurResiduelle),
        'Statut': item.Statut
      })));
      XLSX.utils.book_append_sheet(wb, wsBudget, 'Analyse Budgétaire');
    }
    
    const fileName = `Export_Complet_SIMMT_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
}

// Instance globale du gestionnaire de données
window.dataManager = new DataManager();

// Fonction utilitaire pour formater les devises
window.formatCurrency = function(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Fonction utilitaire pour créer un input file universel
window.createUniversalFileInput = function(containerId, buttonText = 'Importer Excel', source = 'unknown') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.xlsx,.xls';
  fileInput.style.display = 'none';
  fileInput.id = `fileInput_${source}`;

  const button = document.createElement('button');
  button.className = 'export-btn';
  button.innerHTML = `<i class="fas fa-upload"></i> ${buttonText}`;
  button.onclick = () => fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
      button.disabled = true;

      await window.dataManager.processExcelFile(file, source);
      
      button.innerHTML = '<i class="fas fa-check"></i> Importé avec succès';
      button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      
      setTimeout(() => {
        button.innerHTML = `<i class="fas fa-upload"></i> ${buttonText}`;
        button.style.background = '';
        button.disabled = false;
      }, 2000);

    } catch (error) {
      button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erreur';
      button.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      
      setTimeout(() => {
        button.innerHTML = `<i class="fas fa-upload"></i> ${buttonText}`;
        button.style.background = '';
        button.disabled = false;
      }, 3000);
      
      alert('Erreur lors de l\'importation du fichier Excel');
    }
  };

  container.appendChild(fileInput);
  container.appendChild(button);
};

console.log('Gestionnaire de données SIMMT initialisé');
