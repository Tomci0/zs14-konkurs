(() => {
  'use strict'

  document.addEventListener('DOMContentLoaded', () => {
    const getStoredTheme = () => localStorage.getItem('theme');
    const setStoredTheme = theme => localStorage.setItem('theme', theme);

    const getPreferredTheme = () => {
      const storedTheme = getStoredTheme();
      if (storedTheme) {
        return storedTheme;
      }

      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const setTheme = theme => {
      document.documentElement.setAttribute('data-bs-theme', theme);
      document.querySelectorAll('.changeColorMode').forEach(button => {
        const iconElement = button.querySelector('.iconify.icon');
        if (iconElement) {
          const currentIcon = iconElement.getAttribute('data-icon');
          const newIcon = theme === 'dark' ? 'bi:sun-fill' : 'bi:moon-fill';
          iconElement.setAttribute('data-icon', newIcon);
        }
      });
    };

    const updateTheme = () => {
      const currentTheme = getStoredTheme();
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setStoredTheme(newTheme);
      setTheme(newTheme);
    };

    const showActiveTheme = () => {
      const currentTheme = getStoredTheme() || getPreferredTheme();
      setTheme(currentTheme);
    };

    // each document query selector

    Array.from(document.querySelectorAll(".changeColorMode")).forEach(button=> {
      button.addEventListener('click', () => {
        updateTheme();
      });
    })

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const storedTheme = getStoredTheme();
      if (!storedTheme) {
        showActiveTheme();
      }
    });

    showActiveTheme(); // Ustawienie trybu po załadowaniu strony
  });
})()