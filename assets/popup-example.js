// Exemple d'utilisation des popups modernes dans app.js
// Remplacez votre code existant de création de popups par ces fonctions

// Exemple d'utilisation basique
function createMapMarkerWithModernPopup(equipment, map) {
  const lat = parseFloat(equipment.Latitude) || 0;
  const lng = parseFloat(equipment.Longitude) || 0;
  
  if (lat === 0 && lng === 0) return null;
  
  // Utiliser le gestionnaire de popups moderne
  const marker = popupManager.createMarkerWithPopup(equipment, [lat, lng], map);
  
  return marker;
}

// Exemple pour remplacer les anciens popups simples
function updateMapWithModernPopups(data, map) {
  // Effacer les marqueurs existants
  map.eachLayer(function(layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
  
  // Ajouter les nouveaux marqueurs avec popups modernes
  data.forEach(equipment => {
    const marker = createMapMarkerWithModernPopup(equipment, map);
    if (marker) {
      marker.addTo(map);
    }
  });
}

// Exemple d'utilisation directe du contenu popup
function showModernPopupContent(equipment) {
  // Créer le contenu du popup moderne
  const popupContent = popupManager.createBudgetPopup(equipment);
  
  // Vous pouvez utiliser ce contenu dans un modal ou autre
  console.log('Contenu popup moderne:', popupContent);
  
  return popupContent;
}

// Exemple d'intégration dans votre code existant
// Remplacez cette ligne dans app.js :
// marker.bindPopup(`<strong>${equipment.Immatriculation}</strong><br>${equipment['Corps d\'Armée']}<br>${equipment.Localisation}`);
// 
// Par cette ligne :
// const popupContent = popupManager.createBudgetPopup(equipment);
// marker.bindPopup(popupContent, {
//   maxWidth: 320,
//   minWidth: 280,
//   className: 'modern-popup'
// });

console.log('Exemples de popups modernes chargés');
