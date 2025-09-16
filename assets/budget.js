// Script pour la gestion des graphiques budgétaires avec données Excel
// Design moderne rouge et blanc pour le dashboard SIMMT
// Utilise le système centralisé de gestion des données

let budgetData = [];
let charts = {};

// Configuration des couleurs pour les graphiques (palette rouge et blanc)
const chartColors = {
  primary: '#dc2626',
  secondary: '#ef4444',
  accent: '#f87171',
  light: '#fef2f2',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6'
};

const corpsColors = {
  'Armée de l\'Air': chartColors.primary,
  'Marine Nationale': chartColors.secondary,
  'Armée de Terre': chartColors.accent
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  initializeBudgetPage();
  setupEventListeners();
  createEmptyCharts();
  loadExistingData();
});

function initializeBudgetPage() {
  console.log('Initialisation de la page Budget avec système centralisé');
  
  // Créer le bouton d'import universel
  createUniversalFileInput('budgetImportContainer', 'Importer Excel (Budget)', 'budget');
  
  updateBudgetSummary([]);
}

function setupEventListeners() {
  // Gestionnaire pour l'export
  const exportBtn = document.getElementById('exportBudgetBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportBudgetAnalysis);
  }
  
  // Écouter les mises à jour de données depuis d'autres pages
  window.addEventListener('dataUpdated', function(e) {
    console.log('Données mises à jour - rechargement des graphiques budget');
    loadExistingData();
  });
}

function loadExistingData() {
  // Charger les données budgétaires depuis le gestionnaire centralisé
  const centralBudgetData = dataManager.getBudgetData();
  if (centralBudgetData.length > 0) {
    budgetData = centralBudgetData;
    updateBudgetSummary(budgetData);
    updateAllCharts(budgetData);
    updateBudgetTable(budgetData);
    console.log(`${budgetData.length} éléments budgétaires chargés depuis le stockage centralisé`);
  } else {
    // Si pas de données budgétaires, essayer de charger les données principales
    const mainData = dataManager.getData();
    if (mainData.length > 0) {
      console.log('Génération des données budgétaires à partir des données principales');
      dataManager.generateBudgetData(mainData, 'budget-page');
      // Sauvegarder dans le DataManager
      dataManager.saveData(data.map(item => ({
        ...item,
        bonCommande: item.bonCommande,
        ligneBudgetaire: item.ligneBudgetaire,
        intituleCommande: item.intituleCommande
      })), source);
      // Recharger après génération
      const newBudgetData = dataManager.getBudgetData();
      if (newBudgetData.length > 0) {
        budgetData = newBudgetData;
        updateBudgetSummary(budgetData);
        updateAllCharts(budgetData);
        updateBudgetTable(budgetData);
        console.log(`${budgetData.length} éléments budgétaires générés et chargés`);
      }
    } else {
      console.log('Aucune donnée disponible - importez un fichier Excel depuis n\'importe quelle page');
      showNoDataMessage();
    }
  }
}

function handleBudgetExcelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      processBudgetData(jsonData);
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier Excel:', error);
      alert('Erreur lors de la lecture du fichier. Vérifiez le format.');
    }
  };
  reader.readAsArrayBuffer(file);
}

function processBudgetData(data) {
  // Traitement et enrichissement des données avec informations budgétaires
  budgetData = data.map(item => ({
    immatriculation: item['Immatriculation'] || item['immatriculation'] || '',
    type: item['Type'] || item['type'] || '',
    corpsArmee: item['Corps d\'Armée'] || item['corps_armee'] || '',
    localisation: item['Localisation'] || item['localisation'] || '',
    statut: item['Statut'] || item['statut'] || '',
    // Génération de données budgétaires simulées basées sur le type d'équipement
    coutUnitaire: generateCostByType(item['Type'] || item['type'] || ''),
    dateAcquisition: generateRandomDate(),
    // Nouvelles colonnes budgétaires
    bonCommande: generateBonCommande(),
    ligneBudgetaire: generateLigneBudgetaire(item['Type'] || item['type'] || ''),
    intituleCommande: generateIntituleCommande(item['Type'] || item['type'] || ''),
    latitude: item['Latitude'] || item['latitude'] || 0,
    longitude: item['Longitude'] || item['longitude'] || 0
  }));

  console.log(`${budgetData.length} équipements traités pour l'analyse budgétaire`);
  
  updateBudgetSummary(budgetData);
  updateAllCharts(budgetData);
  updateBudgetTable(budgetData);
}

function generateCostByType(type) {
  // Génération de coûts réalistes basés sur le type d'équipement
  const costRanges = {
    'Camion': { min: 150000, max: 300000 },
    'Fourgon': { min: 80000, max: 150000 },
    'Véhicule': { min: 50000, max: 120000 },
    'Remorque': { min: 20000, max: 50000 },
    'Extincteur': { min: 50, max: 500 },
    'default': { min: 10000, max: 100000 }
  };

  const range = costRanges[type] || costRanges['default'];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

function generateRandomDate() {
  const start = new Date(2015, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toLocaleDateString('fr-FR');
}

function generateBonCommande() {
  // Génération d'un numéro de bon de commande réaliste
  const year = new Date().getFullYear();
  const prefix = 'BC';
  const number = Math.floor(Math.random() * 9999) + 1;
  return `${prefix}${year}-${number.toString().padStart(4, '0')}`;
}

function generateLigneBudgetaire(type) {
  // Génération de lignes budgétaires selon le type d'équipement
  const lignesBudgetaires = {
    'Camion': ['6.2.1.001', '6.2.1.002', '6.2.1.003'],
    'Fourgon': ['6.2.2.001', '6.2.2.002', '6.2.2.003'],
    'Véhicule': ['6.2.3.001', '6.2.3.002', '6.2.3.003'],
    'Remorque': ['6.2.4.001', '6.2.4.002'],
    'Extincteur': ['6.3.1.001', '6.3.1.002'],
    'default': ['6.9.9.001', '6.9.9.002']
  };
  
  const lignes = lignesBudgetaires[type] || lignesBudgetaires['default'];
  return lignes[Math.floor(Math.random() * lignes.length)];
}

function generateIntituleCommande(type) {
  // Génération d'intitulés de commande réalistes
  const intitules = {
    'Camion': [
      'Acquisition camion-citerne incendie',
      'Renouvellement véhicule de secours',
      'Achat camion grande échelle'
    ],
    'Fourgon': [
      'Fourgon pompe-tonne léger',
      'Véhicule de première intervention',
      'Fourgon mousse haute expansion'
    ],
    'Véhicule': [
      'Véhicule de liaison',
      'Voiture de service',
      'Véhicule de commandement'
    ],
    'Remorque': [
      'Remorque porte-matériel',
      'Remorque éclairage',
      'Remorque groupe électrogène'
    ],
    'Extincteur': [
      'Extincteurs portatifs CO2',
      'Extincteurs à poudre ABC',
      'Extincteurs à eau pulvérisée'
    ],
    'default': [
      'Matériel de sécurité incendie',
      'Équipement de protection',
      'Matériel de secours'
    ]
  };
  
  const liste = intitules[type] || intitules['default'];
  return liste[Math.floor(Math.random() * liste.length)];
}

function updateBudgetSummary(data) {
  const totalBudget = data.reduce((sum, item) => sum + item.coutUnitaire, 0);
  const avgCost = data.length > 0 ? totalBudget / data.length : 0;
  const maxCost = data.length > 0 ? Math.max(...data.map(item => item.coutUnitaire)) : 0;

  document.getElementById('totalBudget').textContent = formatCurrency(totalBudget);
  document.getElementById('avgCost').textContent = formatCurrency(avgCost);
  document.getElementById('maxCost').textContent = formatCurrency(maxCost);
  document.getElementById('totalEquipments').textContent = data.length.toString();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function createEmptyCharts() {
  createBudgetByCorpsChart([]);
  createCostByTypeChart([]);
  createCostByLocationChart([]);
  createRadarChart([]);
}

function updateAllCharts(data) {
  createBudgetByCorpsChart(data);
  createCostByTypeChart(data);
  createCostByLocationChart(data);
  createRadarChart(data);
}

function createBudgetByCorpsChart(data) {
  const ctx = document.getElementById('budgetByCorpsChart').getContext('2d');
  
  if (charts.budgetByCorps) {
    charts.budgetByCorps.destroy();
  }

  const budgetByCorps = {};
  data.forEach(item => {
    const corps = item.corpsArmee || 'Non spécifié';
    budgetByCorps[corps] = (budgetByCorps[corps] || 0) + item.coutUnitaire;
  });

  const labels = Object.keys(budgetByCorps);
  const values = Object.values(budgetByCorps);
  const colors = labels.map(label => corpsColors[label] || chartColors.info);

  charts.budgetByCorps = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function createCostByTypeChart(data) {
  const ctx = document.getElementById('costByTypeChart').getContext('2d');
  
  if (charts.costByType) {
    charts.costByType.destroy();
  }

  const costByType = {};
  const countByType = {};
  
  data.forEach(item => {
    const type = item.type || 'Non spécifié';
    costByType[type] = (costByType[type] || 0) + item.coutUnitaire;
    countByType[type] = (countByType[type] || 0) + 1;
  });

  const labels = Object.keys(costByType);
  const avgCosts = labels.map(type => costByType[type] / countByType[type]);

  charts.costByType = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Coût moyen (€)',
        data: avgCosts,
        backgroundColor: chartColors.primary,
        borderColor: chartColors.secondary,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Coût moyen: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45
          }
        }
      }
    }
  });
}

function createCostByLocationChart(data) {
  const ctx = document.getElementById('costByLocationChart').getContext('2d');
  
  if (charts.costByLocation) {
    charts.costByLocation.destroy();
  }

  const costByLocation = {};
  data.forEach(item => {
    const location = item.localisation || 'Non spécifié';
    costByLocation[location] = (costByLocation[location] || 0) + item.coutUnitaire;
  });

  const sortedLocations = Object.entries(costByLocation)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 des localisations

  const labels = sortedLocations.map(item => item[0]);
  const values = sortedLocations.map(item => item[1]);

  charts.costByLocation = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Coût total par localisation',
        data: values,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.light,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.secondary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Total: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45
          }
        }
      }
    }
  });
}

function createRadarChart(data) {
  const ctx = document.getElementById('radarChart').getContext('2d');
  
  if (charts.radar) {
    charts.radar.destroy();
  }

  const corpsStats = {};
  
  // Calcul des statistiques par corps d'armée
  data.forEach(item => {
    const corps = item.corpsArmee || 'Non spécifié';
    if (!corpsStats[corps]) {
      corpsStats[corps] = {
        count: 0,
        totalCost: 0,
        avgCost: 0,
        maxCost: 0,
        locations: new Set()
      };
    }
    
    corpsStats[corps].count++;
    corpsStats[corps].totalCost += item.coutUnitaire;
    corpsStats[corps].maxCost = Math.max(corpsStats[corps].maxCost, item.coutUnitaire);
    corpsStats[corps].locations.add(item.localisation);
  });

  // Normalisation des données pour le radar
  const maxValues = {
    count: Math.max(...Object.values(corpsStats).map(s => s.count)),
    totalCost: Math.max(...Object.values(corpsStats).map(s => s.totalCost)),
    avgCost: Math.max(...Object.values(corpsStats).map(s => s.totalCost / s.count)),
    maxCost: Math.max(...Object.values(corpsStats).map(s => s.maxCost)),
    locations: Math.max(...Object.values(corpsStats).map(s => s.locations.size))
  };

  const datasets = Object.keys(corpsStats).map((corps, index) => {
    const stats = corpsStats[corps];
    const avgCost = stats.totalCost / stats.count;
    
    return {
      label: corps,
      data: [
        (stats.count / maxValues.count) * 100,
        (stats.totalCost / maxValues.totalCost) * 100,
        (avgCost / maxValues.avgCost) * 100,
        (stats.maxCost / maxValues.maxCost) * 100,
        (stats.locations.size / maxValues.locations) * 100
      ],
      borderColor: corpsColors[corps] || chartColors.info,
      backgroundColor: (corpsColors[corps] || chartColors.info) + '20',
      borderWidth: 2,
      pointBackgroundColor: corpsColors[corps] || chartColors.info
    };
  });

  charts.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Nombre d\'équipements', 'Budget total', 'Coût moyen', 'Équipement le plus cher', 'Nombre de sites'],
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            display: false
          }
        }
      }
    }
  });
}

function updateBudgetTable(data) {
  const tbody = document.querySelector('#budgetTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  data.forEach(item => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td class="bon-commande-cell">${item.bonCommande}</td>
      <td>${item.type}</td>
      <td class="ligne-budgetaire-cell">${item.ligneBudgetaire}</td>
      <td>${item.localisation}</td>
      <td class="cost-cell">${formatCurrency(item.coutUnitaire)}</td>
      <td>${item.dateAcquisition}</td>
      <td class="intitule-cell">${item.intituleCommande}</td>
      <td><span class="status-badge status-${item.statut?.toLowerCase().replace(' ', '-')}">${item.statut}</span></td>
    `;
  });
}

function showNoDataMessage() {
  const tbody = document.querySelector('#budgetTable tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2rem; color: #6b7280;">
          <div>
            <i class="fas fa-file-excel" style="font-size: 2rem; margin-bottom: 1rem; color: #dc2626;"></i>
            <h3 style="margin: 0.5rem 0; color: #374151;">Aucune donnée budgétaire</h3>
            <p style="margin: 0;">Importez un fichier Excel depuis le tableau de bord ou utilisez le bouton d'import ci-dessus</p>
          </div>
        </td>
      </tr>
    `;
  }
}

function exportBudgetAnalysis() {
  if (budgetData.length === 0) {
    alert('Aucune donnée à exporter. Veuillez d\'abord importer un fichier Excel.');
    return;
  }

  // Création d'un nouveau workbook avec analyse budgétaire
  const wb = XLSX.utils.book_new();
  
  // Feuille des données détaillées
  const wsData = XLSX.utils.json_to_sheet(budgetData.map(item => ({
    'Immatriculation': item.immatriculation,
    'Type': item.type,
    'Corps d\'Armée': item.corpsArmee,
    'Localisation': item.localisation,
    'Coût Unitaire (€)': item.coutUnitaire,
    'Date d\'Acquisition': item.dateAcquisition,
    'Bon de Commande': item.bonCommande,
    'Ligne Budgétaire': item.ligneBudgetaire,
    'Intitulé Commande': item.intituleCommande,
    'Statut': item.statut
  })));
  
  XLSX.utils.book_append_sheet(wb, wsData, 'Données Détaillées');
  
  // Feuille de synthèse budgétaire
  const totalBudget = budgetData.reduce((sum, item) => sum + item.coutUnitaire, 0);
  const avgCost = budgetData.length > 0 ? totalBudget / budgetData.length : 0;
  
  const summary = [
    ['Indicateur', 'Valeur'],
    ['Budget Total (€)', totalBudget],
    ['Coût Moyen (€)', Math.round(avgCost)],
    ['Nombre d\'Équipements', budgetData.length],
    ['Coût Maximum (€)', Math.max(...budgetData.map(item => item.coutUnitaire))]
  ];
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Synthèse Budgétaire');
  
  // Export du fichier
  const fileName = `Analyse_Budgetaire_Parc_Incendie_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Styles CSS additionnels pour les éléments spécifiques au budget
const budgetStyles = `
  .cost-cell {
    font-weight: 600;
    color: var(--primary-red);
    text-align: right;
  }
  
  .bon-commande-cell {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #1f2937;
    background-color: #f3f4f6;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
  
  .ligne-budgetaire-cell {
    font-family: 'Courier New', monospace;
    font-weight: 500;
    color: #374151;
    text-align: center;
    font-size: 0.875rem;
  }
  
  .intitule-cell {
    max-width: 200px;
    word-wrap: break-word;
    font-size: 0.875rem;
    line-height: 1.3;
    color: #4b5563;
  }
  
  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .status-actif {
    background-color: #dcfce7;
    color: #166534;
  }
  
  .status-maintenance {
    background-color: #fef3c7;
    color: #92400e;
  }
  
  .status-hors-service {
    background-color: #fee2e2;
    color: #991b1b;
  }
  
  #budgetTable {
    font-size: 0.875rem;
  }
  
  #budgetTable th {
    white-space: nowrap;
    padding: 0.75rem 0.5rem;
  }
  
  #budgetTable td {
    padding: 0.75rem 0.5rem;
    vertical-align: top;
  }
`;

// Injection des styles
const styleSheet = document.createElement('style');
styleSheet.textContent = budgetStyles;
document.head.appendChild(styleSheet);
