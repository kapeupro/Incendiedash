// Affichage du tableau extincteur avec photo sur le dashboard
if (document.getElementById('dashboardExtincteurTableContainer')) {
  window.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('extincteurData');
    if (saved) {
      const extincteurData = JSON.parse(saved);
      renderDashboardExtincteurTable(extincteurData);
    }
  });
  function renderDashboardExtincteurTable(data) {
    const container = document.getElementById('dashboardExtincteurTableContainer');
    if (!data || data.length === 0) {
      container.innerHTML = '<em>Aucune donnée extincteur importée.</em>';
      return;
    }
    let columns = Object.keys(data[0]);
    if (!columns.includes('Photo')) columns.push('Photo');
    let html = '<table class="extincteur-table"><thead><tr>';
    columns.forEach(col => { html += `<th>${col}</th>`; });
    html += '</tr></thead><tbody>';
    data.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        if (col !== 'Photo') {
          html += `<td>${row[col] ?? ''}</td>`;
        } else {
          if (row.Photo) {
            html += `<td><img src="${row.Photo}" style="max-width:80px;max-height:80px;" /></td>`;
          } else {
            html += `<td></td>`;
          }
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }
}
// Gestion Hors Forfait : ajout et affichage dynamique
if (document.getElementById('horsForfaitForm')) {
  let horsForfaitData = [];
  // Chargement auto
  window.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('horsForfaitData');
    if (saved) {
      horsForfaitData = JSON.parse(saved);
      renderHorsForfaitTable(horsForfaitData);
    }
  });
  // Soumission formulaire
  document.getElementById('horsForfaitForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const type = document.getElementById('typeVehicule').value.trim();
    const prix = parseFloat(document.getElementById('prixHorsForfait').value);
    if (!type || isNaN(prix)) return;
    horsForfaitData.push({ "Type de véhicule": type, "Prix du hors forfait (€)": prix.toFixed(2) });
    localStorage.setItem('horsForfaitData', JSON.stringify(horsForfaitData));
    renderHorsForfaitTable(horsForfaitData);
    e.target.reset();
  });
  // Rendu du tableau
  function renderHorsForfaitTable(data) {
    const container = document.getElementById('horsForfaitTableContainer');
    if (!data || data.length === 0) {
      container.innerHTML = '<em>Aucun véhicule hors forfait enregistré.</em>';
      return;
    }
    let html = '<table class="horsforfait-table"><thead><tr>';
    Object.keys(data[0]).forEach(col => { html += `<th>${col}</th>`; });
    html += '</tr></thead><tbody>';
    data.forEach(row => {
      html += '<tr>';
      Object.values(row).forEach(val => { html += `<td>${val ?? ''}</td>`; });
      html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }
}
// Navigation pour le dashboard uniquement
function initDashboardNavigation() {
  // Afficher seulement la section dashboard
  const dashboardSection = document.getElementById('page-dashboard');
  if (dashboardSection) {
    dashboardSection.style.display = 'block';
  }
  
  // Cacher les autres sections (si elles existent)
  const otherSections = ['page-horsforfait', 'page-ari', 'page-extincteur', 'page-budget'];
  otherSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'none';
    }
  });
  
  // Marquer le lien dashboard comme actif
  const dashboardLink = document.getElementById('nav-dashboard');
  if (dashboardLink) {
    dashboardLink.classList.add('active');
  }
}

window.addEventListener('DOMContentLoaded', initDashboardNavigation);
// Export Excel
document.getElementById('exportExcelBtn').addEventListener('click', function () {
  if (!allData || allData.length === 0) {
    alert('Aucune donnée à exporter.');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(allData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Parc Incendie');
  XLSX.writeFile(wb, 'Parc_Incendie_MAJ.xlsx');
});
// Script principal pour le dashboard de suivi de parc incendie

const map = L.map('map').setView([46.5, 2.5], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

let allData = [];

function updateSummaryBox(data) {
  let air = 0, navy = 0, army = 0;
  data.forEach(row => {
    const corps = row["Corps Armée"]?.toLowerCase();
    if (corps?.includes("air")) air++;
    else if (corps?.includes("marine")) navy++;
    else if (corps?.includes("terre")) army++;
  });
  document.getElementById('count-air').textContent = `✈️ Armée de l'air : ${air}`;
  document.getElementById('count-navy').textContent = `🚢 Marine nationale : ${navy}`;
  document.getElementById('count-army').textContent = `🪖 Armée de terre : ${army}`;
}

function renderData(data) {
  const tbody = document.querySelector('#vehicleTable tbody');
  tbody.innerHTML = '';
  map.eachLayer(layer => { if (layer instanceof L.CircleMarker || layer instanceof L.Marker) map.removeLayer(layer); });

  data.forEach((row, rowIdx) => {
    const tr = document.createElement('tr');
    ["Immatriculation", "Type", "Corps Armée", "Statut", "Localisation", "Latitude", "Longitude"].forEach(col => {
      const td = document.createElement('td');
      td.textContent = row[col] || '';
      td.contentEditable = true;
      td.classList.add('editable-cell');
      td.addEventListener('blur', function () {
        // Trouver l'index réel dans allData
        const realIdx = allData.findIndex(r =>
          r["Immatriculation"] === row["Immatriculation"] &&
          r["Type"] === row["Type"] &&
          r["Corps Armée"] === row["Corps Armée"] &&
          r["Statut"] === row["Statut"] &&
          r["Localisation"] === row["Localisation"] &&
          r["Latitude"] === row["Latitude"] &&
          r["Longitude"] === row["Longitude"]
        );
        if (realIdx !== -1) {
          allData[realIdx][col] = td.textContent;
          // Sauvegarde locale automatique après édition
          localStorage.setItem('parcIncendieData', JSON.stringify(allData));
        }
      });
      tr.appendChild(td);
    });
    tbody.appendChild(tr);

    if (row.Latitude && row.Longitude) {
      const latLng = [parseFloat(row.Latitude), parseFloat(row.Longitude)];
      let iconUrl = '';
      if (row["Corps Armée"] === "Armée de Terre") iconUrl = 'assets/logo-armee-terre.png';
      else if (row["Corps Armée"] === "Armée de l'Air") iconUrl = 'assets/logo-armee-air.png';
      else if (row["Corps Armée"] === "Marine Nationale") iconUrl = 'assets/logo-marine.png';

      if (iconUrl) {
        const icon = L.icon({ iconUrl, iconSize: [38, 38], className: 'marker-logo' });
        const marker = L.marker(latLng, { icon });
        
        // Utiliser le nouveau système de popups modernes
        const equipment = {
          Immatriculation: row.Immatriculation || 'N/A',
          Type: row.Type || 'Non spécifié',
          'Corps d\'Armée': row["Corps Armée"] || 'Non spécifié',
          Localisation: row.Localisation || 'Non spécifiée',
          Statut: row.Statut || 'Actif',
          Latitude: row.Latitude,
          Longitude: row.Longitude
        };
        
        const popupContent = popupManager.createBudgetPopup(equipment);
        marker.bindPopup(popupContent, {
          maxWidth: 320,
          minWidth: 280,
          className: 'modern-popup'
        });
        
        marker.addTo(map);
      }
    }
  });

  updateSummaryBox(data);
}


document.getElementById('inputExcel').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    allData = XLSX.utils.sheet_to_json(sheet);
    // Sauvegarde locale à l'import
    localStorage.setItem('parcIncendieData', JSON.stringify(allData));
    renderData(allData);
  };

  reader.readAsArrayBuffer(file);
});


// Gestion extincteur : import Excel et photo
if (document.getElementById('inputExcelExtincteur')) {
  let extincteurData = [];
  document.getElementById('inputExcelExtincteur').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      extincteurData = XLSX.utils.sheet_to_json(sheet);
      localStorage.setItem('extincteurData', JSON.stringify(extincteurData));
      renderExtincteurTable(extincteurData);
    };
    reader.readAsArrayBuffer(file);
  });

  // Chargement auto extincteur
  window.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('extincteurData');
    if (saved) {
      extincteurData = JSON.parse(saved);
      renderExtincteurTable(extincteurData);
    }
  });

  // Aperçu photo
  document.getElementById('inputPhotoExtincteur').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('photoPreviewExtincteur');
    preview.innerHTML = '';
    if (file && file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.style.maxWidth = '200px';
      img.style.maxHeight = '200px';
      img.src = URL.createObjectURL(file);
      preview.appendChild(img);
    }
  });

  // Rendu du tableau extincteur
  function renderExtincteurTable(data) {
    const container = document.getElementById('extincteurTableContainer');
    if (!data || data.length === 0) {
      container.innerHTML = '<em>Aucune donnée extincteur importée.</em>';
      return;
    }
    // Ajout colonne Photo
    let columns = Object.keys(data[0]);
    if (!columns.includes('Photo')) columns.push('Photo');
    let html = '<table class="extincteur-table"><thead><tr>';
    columns.forEach(col => { html += `<th>${col}</th>`; });
    html += '</tr></thead><tbody>';
    data.forEach((row, idx) => {
      html += '<tr>';
      columns.forEach(col => {
        if (col !== 'Photo') {
          html += `<td>${row[col] ?? ''}</td>`;
        } else {
          html += `<td data-row="${idx}">`;
          html += `<input type="file" accept="image/*" class="photo-upload-per-row" data-row="${idx}" style="display:block;margin:auto;" />`;
          if (row.Photo) {
            html += `<div class="photo-preview-per-row" style="margin-top:0.5rem;text-align:center;"><img src="${row.Photo}" style="max-width:80px;max-height:80px;" /></div>`;
          } else {
            html += `<div class="photo-preview-per-row" style="margin-top:0.5rem;text-align:center;"></div>`;
          }
          html += `</td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;

    // Gestion upload photo par ligne
    container.querySelectorAll('.photo-upload-per-row').forEach(input => {
      input.addEventListener('change', function (e) {
        const file = e.target.files[0];
        const rowIdx = parseInt(e.target.getAttribute('data-row'));
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = function (evt) {
            data[rowIdx].Photo = evt.target.result;
            localStorage.setItem('extincteurData', JSON.stringify(data));
            renderExtincteurTable(data); // refresh pour afficher l'aperçu
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }
}
// Chargement auto depuis localStorage si dispo (dashboard)
window.addEventListener('DOMContentLoaded', function () {
  const saved = localStorage.getItem('parcIncendieData');
  if (saved) {
    allData = JSON.parse(saved);
    renderData(allData);
  }
});


// Filtrage par corps d'armée
document.getElementById('filterCorps').addEventListener('change', function () {
  applyFilters();
});

// Filtrage texte sur le tableau
document.getElementById('tableSearch').addEventListener('input', function () {
  applyFilters();
});

function applyFilters() {
  const corps = document.getElementById('filterCorps').value;
  const search = document.getElementById('tableSearch').value.trim().toLowerCase();
  let filtered = allData;
  if (corps) {
    filtered = filtered.filter(row => row["Corps Armée"] === corps);
  }
  if (search) {
    filtered = filtered.filter(row => {
      return Object.values(row).some(val =>
        (val + '').toLowerCase().includes(search)
      );
    });
  }
  renderData(filtered);
}
