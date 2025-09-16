// Gestionnaire du menu mobile pour la sidebar responsive
class MobileMenuManager {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
    this.sidebarOverlay = document.getElementById('sidebarOverlay');
    this.sidebarToggle = document.getElementById('sidebarToggle');
    this.mainContent = document.querySelector('.container');
    this.isMenuOpen = false;
    this.isCollapsed = true; // Start collapsed by default
    
    this.init();
  }

  init() {
    // Événement pour le bouton hamburger
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', () => {
        this.toggleMenu();
      });
    }

    // Événement pour l'overlay
    if (this.sidebarOverlay) {
      this.sidebarOverlay.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    // Événement pour le bouton de rétraction/expansion
    if (this.sidebarToggle) {
      this.sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    // Fermer le menu lors du redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Fermer le menu lors de la navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          this.closeMenu();
        }
      });
    });

    // Gestion des touches clavier
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Restaurer l'état de la sidebar au chargement
    this.restoreSidebarState();
  }

  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    if (this.sidebar) {
      this.sidebar.classList.add('active');
    }
    if (this.sidebarOverlay) {
      this.sidebarOverlay.classList.add('active');
    }
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
    }
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
    
    this.isMenuOpen = true;
  }

  closeMenu() {
    if (this.sidebar) {
      this.sidebar.classList.remove('active');
    }
    if (this.sidebarOverlay) {
      this.sidebarOverlay.classList.remove('active');
    }
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
    
    // Rétablir le scroll du body
    document.body.style.overflow = '';
    
    this.isMenuOpen = false;
  }

  // Méthode pour basculer la sidebar (rétraction/expansion)
  toggleSidebar() {
    if (this.isMobileView()) return; // Ne pas rétracter sur mobile
    
    this.isCollapsed = !this.isCollapsed;
    
    if (this.isCollapsed) {
      this.sidebar.classList.add('collapsed');
      // Sauvegarder l'état dans localStorage
      localStorage.setItem('sidebarCollapsed', 'true');
    } else {
      this.sidebar.classList.remove('collapsed');
      localStorage.setItem('sidebarCollapsed', 'false');
    }
  }

  // Restaurer l'état de la sidebar au chargement
  restoreSidebarState() {
    if (this.isMobileView()) return;
    
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'false') {
      // Only expand if explicitly saved as expanded
      this.isCollapsed = false;
      this.sidebar.classList.remove('collapsed');
    } else {
      // Default to collapsed state
      this.isCollapsed = true;
      this.sidebar.classList.add('collapsed');
      localStorage.setItem('sidebarCollapsed', 'true');
    }
  }

  // Méthode pour vérifier si on est en mode mobile
  isMobileView() {
    return window.innerWidth <= 1024;
  }
}

// Initialiser le gestionnaire de menu mobile
document.addEventListener('DOMContentLoaded', () => {
  window.mobileMenuManager = new MobileMenuManager();
});

console.log('Gestionnaire de menu mobile initialisé');
