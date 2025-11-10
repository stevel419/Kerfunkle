// app/javascript/application.js
import "@hotwired/turbo-rails";

(function sidebarController() {
  // single source of truth for state
  const isDesktop = () => window.innerWidth >= 1024;

  function ensureOverlay() {
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function applyState(state) {
    const sidebar = document.getElementById("sidebar");
    const container = document.querySelector("[data-sidebar-state]");
    if (!sidebar || !container) return;
    const collapsed = state === "collapsed";
    sidebar.classList.toggle("collapsed", collapsed);
    sidebar.classList.toggle("expanded", !collapsed);
    sidebar.setAttribute("data-state", state);
    container.setAttribute("data-sidebar-state", state);
  }

  function restoreSidebarState() {
    // Restore the saved state on every page load
    const saved = localStorage.getItem("sidebar-state") || "expanded";
    applyState(isDesktop() ? saved : "expanded");
  }

  function initOnce() {
    // prevent double init of event listeners
    if (document.documentElement.dataset.sidebarInit === "1") {
      // Still restore state even if listeners are already set up
      restoreSidebarState();
      return;
    }
    document.documentElement.dataset.sidebarInit = "1";

    // initial state
    restoreSidebarState();

    // event delegation for clicks anywhere in the document
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("#sidebarTrigger");
      if (!trigger) return;

      e.preventDefault();

      const sidebar = document.getElementById("sidebar");
      if (!sidebar) return;

      if (!isDesktop()) {
        const overlay = ensureOverlay();
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
        document.body.style.overflow = sidebar.classList.contains("active") ? "hidden" : "";

        overlay.onclick = () => {
          sidebar.classList.remove("active");
          overlay.classList.remove("active");
          document.body.style.overflow = "";
        };
        return;
      }

      const next = sidebar.classList.contains("collapsed") ? "expanded" : "collapsed";
      applyState(next);
      localStorage.setItem("sidebar-state", next);
    });

    // keep state correct on resize
    window.addEventListener("resize", () => {
      if (isDesktop()) {
        const saved = localStorage.getItem("sidebar-state") || "expanded";
        applyState(saved);
        const overlay = document.querySelector(".sidebar-overlay");
        if (overlay) overlay.classList.remove("active");
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.remove("active");
        document.body.style.overflow = "";
      } else {
        applyState("expanded");
      }
    });

    // clean up mobile overlay state before Turbo caches the page
    // but KEEP the collapsed/expanded state intact
    document.addEventListener("turbo:before-cache", () => {
      const sidebar = document.getElementById("sidebar");
      const overlay = document.querySelector(".sidebar-overlay");
      // Only remove mobile-specific "active" class, not collapsed/expanded
      if (sidebar) {
        sidebar.classList.remove("active");
      }
      if (overlay) {
        overlay.classList.remove("active");
      }
      document.body.style.overflow = "";
      // Don't remove collapsed/expanded classes - let them persist
    });
  }

  // Run on initial load, on every Turbo load, and when returning from bfcache
  document.addEventListener("DOMContentLoaded", initOnce);
  document.addEventListener("turbo:load", initOnce);
  window.addEventListener("pageshow", initOnce);
})();

// Auto-dismiss flash messages after 3 seconds
(function flashMessageController() {
  function dismissFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach((message) => {
      // Skip if already dismissing
      if (message.dataset.dismissing === 'true') return;
      
      message.dataset.dismissing = 'true';
      
      // Wait 3 seconds, then fade out
      setTimeout(() => {
        message.classList.add('fade-out');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
          message.remove();
          
          // Remove container if no messages left
          const container = document.querySelector('.flash-container');
          if (container && !container.querySelector('.flash-message')) {
            container.remove();
          }
        }, 300);
      }, 3000);
    });
  }
  
  // Run on page load and Turbo navigation
  document.addEventListener('DOMContentLoaded', dismissFlashMessages);
  document.addEventListener('turbo:load', dismissFlashMessages);
  window.addEventListener('pageshow', dismissFlashMessages);
})();
