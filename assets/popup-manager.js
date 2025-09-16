// Gestionnaire des popups modernes pour la carte Leaflet
// Design rouge et blanc cohérent avec le dashboard SIMMT

class PopupManager {
  constructor() {
    this.statusIcons = {
      'Actif': 'fas fa-check-circle',
      'Maintenance': 'fas fa-tools',
      'Hors service': 'fas fa-times-circle',
      'En réparation': 'fas fa-wrench',
      'Disponible': 'fas fa-check-circle',
      'Indisponible': 'fas fa-ban'
    };

    this.typeIcons = {
      'Camion': 'fas fa-truck',
      'Fourgon': 'fas fa-shuttle-van',
      'Véhicule': 'fas fa-car',
      'Remorque': 'fas fa-trailer',
      'Extincteur': 'fas fa-fire-extinguisher',
      'Échelle': 'fas fa-ladder',
      'Autopompe': 'fas fa-fire-truck',
      'Véhicule de Secours': 'fas fa-ambulance'
    };

    this.corpsIcons = {
      'Armée de l\'Air': 'fas fa-plane',
      'Marine Nationale': 'fas fa-anchor',
      'Armée de Terre': 'fas fa-shield-alt'
    };
  }

  // Créer un popup moderne avec toutes les informations
  createModernPopup(equipment) {
    const {
      Immatriculation = 'N/A',
      Type = 'Non spécifié',
      'Corps d\'Armée': corpsArmee = 'Non spécifié',
      Localisation = 'Non spécifiée',
      Statut = 'Actif',
      Latitude = 0,
      Longitude = 0
    } = equipment;

    // Normaliser le statut pour les classes CSS
    const statusClass = this.normalizeStatusClass(Statut);
    const statusIcon = this.getStatusIcon(Statut);
    const typeIcon = this.getTypeIcon(Type);
    const corpsIcon = this.getCorpsIcon(corpsArmee);

    const popupContent = `
      <div class="popup-header">
        <div class="popup-title">
          <i class="${typeIcon}"></i>
          ${Immatriculation || 'Équipement SIMMT'}
        </div>
        <div class="popup-subtitle">
          <i class="${corpsIcon}"></i>
          ${corpsArmee}
        </div>
      </div>
      
      <div class="popup-body">
        <div class="popup-info-grid">
          <div class="popup-info-item">
            <div class="popup-info-label">
              <i class="fas fa-hashtag"></i>
              Immatriculation
            </div>
            <div class="popup-info-value">${Immatriculation}</div>
          </div>
          
          <div class="popup-info-item">
            <div class="popup-info-label">
              <i class="fas fa-tag"></i>
              Type
            </div>
            <div class="popup-info-value">${Type}</div>
          </div>
          
          <div class="popup-info-item">
            <div class="popup-info-label">
              <i class="fas fa-flag"></i>
              Corps d'Armée
            </div>
            <div class="popup-info-value">${corpsArmee}</div>
          </div>
          
          <div class="popup-info-item">
            <div class="popup-info-label">
              <i class="fas fa-compass"></i>
              Coordonnées
            </div>
            <div class="popup-info-value">${this.formatCoordinates(Latitude, Longitude)}</div>
          </div>
        </div>
        
        <div class="popup-status-badge status-${statusClass}">
          <i class="${statusIcon}"></i>
          ${Statut}
        </div>
        
        <div class="popup-location">
          <i class="fas fa-map-marker-alt"></i>
          <div class="popup-location-text">${Localisation}</div>
        </div>
      </div>
    `;

    return popupContent;
  }

  // Créer un popup avec informations budgétaires
  createBudgetPopup(equipment) {
    const basePopup = this.createModernPopup(equipment);
    
    // Si des données budgétaires sont disponibles, les ajouter
    const budgetData = this.getBudgetInfo(equipment);
    if (budgetData) {
      const budgetSection = `
        <div class="popup-budget-section">
          <div class="popup-info-grid">
            <div class="popup-info-item">
              <div class="popup-info-label">
                <i class="fas fa-euro-sign"></i>
                Coût Initial
              </div>
              <div class="popup-info-value">${this.formatCurrency(budgetData.coutUnitaire)}</div>
            </div>
            
            <div class="popup-info-item">
              <div class="popup-info-label">
                <i class="fas fa-calendar"></i>
                Acquisition
              </div>
              <div class="popup-info-value">${budgetData.dateAcquisition}</div>
            </div>
          </div>
          
          <div class="popup-budget-bar">
            <div class="popup-budget-label">Valeur résiduelle</div>
            <div class="popup-budget-progress">
              <div class="popup-budget-fill" style="width: ${budgetData.residualPercentage}%"></div>
            </div>
            <div class="popup-budget-value">${this.formatCurrency(budgetData.valeurResiduelle)}</div>
          </div>
        </div>
      `;
      
      // Insérer la section budget avant la fermeture du popup-body
      return basePopup.replace('</div>\n    ', budgetSection + '\n      </div>\n    ');
    }
    
    return basePopup;
  }

  // Normaliser le statut pour les classes CSS
  normalizeStatusClass(status) {
    const normalized = status.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c');
    
    // Mapper vers les classes CSS définies
    const statusMap = {
      'actif': 'actif',
      'disponible': 'actif',
      'operationnel': 'actif',
      'maintenance': 'maintenance',
      'en-reparation': 'maintenance',
      'revision': 'maintenance',
      'hors-service': 'hors-service',
      'indisponible': 'hors-service',
      'defaillant': 'hors-service'
    };
    
    return statusMap[normalized] || 'actif';
  }

  // Obtenir l'icône du statut
  getStatusIcon(status) {
    const normalized = status.toLowerCase();
    
    if (normalized.includes('actif') || normalized.includes('disponible') || normalized.includes('operationnel')) {
      return 'fas fa-check-circle';
    } else if (normalized.includes('maintenance') || normalized.includes('reparation') || normalized.includes('revision')) {
      return 'fas fa-tools';
    } else if (normalized.includes('hors') || normalized.includes('indisponible') || normalized.includes('defaillant')) {
      return 'fas fa-times-circle';
    }
    
    return 'fas fa-info-circle';
  }

  // Obtenir l'icône du type d'équipement
  getTypeIcon(type) {
    const normalized = type.toLowerCase();
    
    for (const [key, icon] of Object.entries(this.typeIcons)) {
      if (normalized.includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return 'fas fa-cog'; // Icône par défaut
  }

  // Obtenir l'icône du corps d'armée
  getCorpsIcon(corps) {
    return this.corpsIcons[corps] || 'fas fa-flag';
  }

  // Formater les coordonnées
  formatCoordinates(lat, lng) {
    if (!lat || !lng || (lat === 0 && lng === 0)) {
      return 'Non géolocalisé';
    }
    
    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
  }

  // Formater la devise
  formatCurrency(amount) {
    if (!amount || amount === 0) return 'N/A';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Obtenir les informations budgétaires depuis le gestionnaire de données
  getBudgetInfo(equipment) {
    if (typeof dataManager === 'undefined') return null;
    
    const budgetData = dataManager.getBudgetData();
    const budgetItem = budgetData.find(item => 
      item.Immatriculation === equipment.Immatriculation
    );
    
    if (budgetItem) {
      const residualPercentage = budgetItem.valeurResiduelle && budgetItem.coutUnitaire 
        ? (budgetItem.valeurResiduelle / budgetItem.coutUnitaire) * 100 
        : 0;
      
      return {
        ...budgetItem,
        residualPercentage: Math.max(0, Math.min(100, residualPercentage))
      };
    }
    
    return null;
  }

  // Créer un marqueur avec popup moderne
  createMarkerWithPopup(equipment, latlng, map) {
    // Créer le marqueur avec une icône personnalisée selon le type
    const markerIcon = this.createCustomIcon(equipment);
    const marker = L.marker(latlng, { icon: markerIcon });
    
    // Créer le popup moderne
    const popupContent = this.createBudgetPopup(equipment);
    
    // Configurer le popup avec des options personnalisées
    const popup = L.popup({
      maxWidth: 320,
      minWidth: 280,
      closeButton: true,
      autoClose: true,
      closeOnEscapeKey: true,
      className: 'modern-popup'
    }).setContent(popupContent);
    
    marker.bindPopup(popup);
    
    // Ajouter des événements pour améliorer l'UX
    marker.on('mouseover', function() {
      this.openPopup();
    });
    
    return marker;
  }

  // Créer une icône personnalisée selon le type d'équipement
  createCustomIcon(equipment) {
    const type = equipment.Type || 'default';
    const status = equipment.Statut || 'Actif';
    
    // Couleurs selon le statut
    const statusColors = {
      'Actif': '#22c55e',
      'Maintenance': '#f59e0b',
      'Hors service': '#ef4444'
    };
    
    const normalizedStatus = this.normalizeStatusClass(status);
    const color = statusColors[status] || statusColors['Actif'];
    
    // Créer une icône SVG personnalisée
    const svgIcon = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="16" cy="16" r="8" fill="#ffffff" opacity="0.9"/>
        <text x="16" y="20" text-anchor="middle" font-family="FontAwesome" font-size="10" fill="${color}">
          ${this.getIconUnicode(type)}
        </text>
      </svg>
    `;
    
    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  }

  // Obtenir le code Unicode de l'icône FontAwesome
  getIconUnicode(type) {
    const iconMap = {
      'Camion': '\uf0d1',
      'Fourgon': '\uf5b6',
      'Véhicule': '\uf1b9',
      'Extincteur': '\uf84d'
    };
    
    return iconMap[type] || '\uf013'; // Cog par défaut
  }
}

// Instance globale du gestionnaire de popups
window.popupManager = new PopupManager();

// Fonction utilitaire pour créer rapidement un popup moderne
window.createModernPopup = function(equipment) {
  return window.popupManager.createModernPopup(equipment);
};

// Fonction utilitaire pour créer un marqueur avec popup
window.createMarkerWithModernPopup = function(equipment, latlng, map) {
  return window.popupManager.createMarkerWithPopup(equipment, latlng, map);
};

console.log('Gestionnaire de popups modernes initialisé');
