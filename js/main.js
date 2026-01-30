document.addEventListener('DOMContentLoaded', () => {
  // --- Dark mode toggle initialization ---
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      const sidebar = document.getElementById('section-sidebar');
      if (sidebar) {
        sidebar.style.backgroundColor = '#212529';
        sidebar.classList.add('text-white');
        sidebar.classList.remove('text-dark');
      }
      // Update sidebar links to be light colored
      document.querySelectorAll('.section-nav-link').forEach((link) => {
        link.classList.add('text-light');
        link.classList.remove('text-dark');
      });
      // Update progress bar background for dark mode
      const progressContainer = document.getElementById('global-progress');
      if (progressContainer) {
        progressContainer.style.backgroundColor = '#2d2d2d';
      }
    } else {
      document.documentElement.removeAttribute('data-bs-theme');
      const sidebar = document.getElementById('section-sidebar');
      if (sidebar) {
        sidebar.style.backgroundColor = 'white';
        sidebar.classList.remove('text-white');
        sidebar.classList.add('text-dark');
      }
      // Update sidebar links to be dark colored
      document.querySelectorAll('.section-nav-link').forEach((link) => {
        link.classList.remove('text-light');
        link.classList.add('text-dark');
      });
      // Update progress bar background for light mode
      const progressContainer = document.getElementById('global-progress');
      if (progressContainer) {
        progressContainer.style.backgroundColor = '#f8f9fa';
      }
    }
    const toggle = document.getElementById('darkModeToggle');
    const label = document.querySelector('label[for="darkModeToggle"]');
    if (toggle) toggle.checked = (theme === 'dark');
    if (label) {
      label.classList.toggle('text-white', true);
    }
  };

  // restore persisted theme
  try {
    const saved = localStorage.getItem('cracy_theme');
    if (saved) applyTheme(saved);
  } catch (e) {}

  // listen for toggle (may be added later in DOM)
  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t && t.id === 'darkModeToggle') {
      const theme = t.checked ? 'dark' : 'light';
      applyTheme(theme);
      try { localStorage.setItem('cracy_theme', theme); } catch (e) {}
    }
  });

  const main = document.querySelector('main');
  if (!main) return console.warn('No <main> container found to render the form into.');

  const form = document.createElement('form');
  form.className = 'needs-validation';
  form.noValidate = true;

  function showError(msg) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.role = 'alert';
    alert.textContent = msg;
    main.prepend(alert);
  }

  fetch('db/questions.json')
    .then((res) => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then((data) => {
      const sections = Array.isArray(data.sections) ? data.sections : (Array.isArray(data) ? data : (data.sections || []));
      if (!Array.isArray(sections) || sections.length === 0) {
        showError('No sections found in questions.json');
        return;
      }

      // Create global progress bars container (below welcome message)
      const globalProgressContainer = document.createElement('div');
      globalProgressContainer.id = 'global-progress';
      globalProgressContainer.className = 'mb-5 p-4 rounded';
      const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      globalProgressContainer.style.backgroundColor = isDarkMode ? '#2d2d2d' : '#f8f9fa';
      
      const progressTitle = document.createElement('h3');
      progressTitle.className = 'h6 mb-3';
      progressTitle.textContent = 'Overall Progress';
      globalProgressContainer.appendChild(progressTitle);
      
      const progressLabels = [
        { label: 'Yes / Not Applicable', color: 'success' },
        { label: 'In Progress', color: 'warning' },
        { label: 'No', color: 'danger' },
        { label: 'Not Answered', color: 'secondary' }
      ];
      
      progressLabels.forEach((item) => {
        const progressItem = document.createElement('div');
        progressItem.className = 'mb-3';
        
        const label = document.createElement('small');
        label.className = 'text-muted d-block mb-1';
        label.textContent = item.label;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress';
        progressBar.style.height = '24px';
        
        const progressFill = document.createElement('div');
        progressFill.className = `progress-bar bg-${item.color}`;
        progressFill.role = 'progressbar';
        progressFill.setAttribute('aria-valuenow', '0');
        progressFill.setAttribute('aria-valuemin', '0');
        progressFill.setAttribute('aria-valuemax', '100');
        progressFill.style.width = '0%';
        progressFill.dataset.category = item.label.toLowerCase().replace(/\s+/g, '-');
        progressFill.textContent = '0';
        progressFill.style.color = 'white';
        progressFill.style.fontSize = '12px';
        progressFill.style.fontWeight = 'bold';
        progressFill.style.display = 'flex';
        progressFill.style.alignItems = 'center';
        progressFill.style.justifyContent = 'center';
        
        progressBar.appendChild(progressFill);
        progressItem.appendChild(label);
        progressItem.appendChild(progressBar);
        globalProgressContainer.appendChild(progressItem);
      });
      
      form.appendChild(globalProgressContainer);

      // create a wrapper for panels
      const panels = document.createElement('div');
      panels.id = 'sections-wrapper';

      // build sidebar navigation
      const sidebarList = document.getElementById('section-list');

      sections.forEach((section, sIdx) => {
        const secEl = document.createElement('section');
        secEl.className = 'mb-4 section-panel';
        secEl.dataset.index = String(sIdx);
        secEl.style.display = 'none';

        // add sidebar link
        const sidebarLink = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'section-nav-link text-decoration-none small d-block py-2 px-2 text-dark';
        link.dataset.index = String(sIdx);
        link.textContent = section.title || `Section ${sIdx + 1}`;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showPanel(sIdx);
          window.scrollTo(0, 0);
        });
        sidebarLink.appendChild(link);
        sidebarList.appendChild(sidebarLink);

        if (section.title) {
          const h = document.createElement('h2');
          h.className = 'h4 mb-3';
          h.textContent = section.title;
          secEl.appendChild(h);
        }

        if (section.description) {
          const desc = document.createElement('p');
          desc.className = 'text-muted small mb-4';
          desc.innerHTML = section.description;
          secEl.appendChild(desc);
        }

        const questions = Array.isArray(section.questions) ? section.questions : (Array.isArray(section.items) ? section.items : []);

        questions.forEach((q, qIdx) => {
          const qWrap = document.createElement('div');
          qWrap.className = 'mb-3';

          const qTitle = document.createElement('h3');
          qTitle.className = 'h6 mb-1';
          qTitle.textContent = q.title || q.name || `Question ${qIdx + 1}`;
          qWrap.appendChild(qTitle);

          if (q.content) {
            const p = document.createElement('p');
            p.className = 'small text-muted mb-2';
            p.innerHTML = q.content;
            qWrap.appendChild(p);
          }

          if (q.info) {
            const info = document.createElement('div');
            info.className = 'small text-muted fst-italic mb-3';
            info.innerHTML = q.info;
            qWrap.appendChild(info);
          }

          // Check if question type is mchoices
          if (q.type === 'mchoices' && Array.isArray(q.responses)) {
            const choicesWrapper = document.createElement('div');
            
            const fieldName = q.id || `q_${sIdx}_${qIdx}`;
            
            // Add choice responses as radio buttons
            q.responses.forEach((resp, respIdx) => {
              if (resp.type === 'choice') {
                const radioId = `${fieldName}_${respIdx}`;
                
                const formCheck = document.createElement('div');
                formCheck.className = 'form-check';
                
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.className = 'form-check-input';
                radioInput.id = radioId;
                radioInput.name = fieldName;
                radioInput.value = resp.title || '';
                
                const radioLabel = document.createElement('label');
                radioLabel.className = 'form-check-label';
                radioLabel.htmlFor = radioId;
                radioLabel.textContent = resp.title || '';
                
                formCheck.appendChild(radioInput);
                formCheck.appendChild(radioLabel);
                choicesWrapper.appendChild(formCheck);
              }
            });
            
            qWrap.appendChild(choicesWrapper);
          } else {
            // Default: textarea for free-text answers
            const textarea = document.createElement('textarea');
            textarea.className = 'form-control';
            textarea.rows = 3;
            textarea.name = q.id || `q_${sIdx}_${qIdx}`;
            textarea.placeholder = 'Your answer';
            qWrap.appendChild(textarea);
          }

          secEl.appendChild(qWrap);
        });

        panels.appendChild(secEl);
      });

      // Navigation controls - full width with 3 positions
      const nav = document.createElement('div');
      nav.className = 'd-flex justify-content-between align-items-center mt-3 gap-3';

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'btn btn-outline-secondary';
      prevBtn.textContent = 'Previous';
      prevBtn.disabled = true;

      const pageInfo = document.createElement('div');
      pageInfo.className = 'text-muted small text-center flex-grow-1';
      pageInfo.textContent = '';

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'btn btn-primary';
      nextBtn.textContent = 'Next';

      // Submit button (only shown on last panel)
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'btn btn-success';
      submit.textContent = 'Submit';
      submit.style.display = 'none';

      nav.appendChild(prevBtn);
      nav.appendChild(pageInfo);
      
      const rightGroup = document.createElement('div');
      rightGroup.className = 'd-flex gap-2';
      rightGroup.appendChild(nextBtn);
      rightGroup.appendChild(submit);
      nav.appendChild(rightGroup);

      form.appendChild(panels);
      form.appendChild(nav);
      main.appendChild(form);

      // panel navigation logic
      let current = 0;
      const panelEls = Array.from(document.querySelectorAll('.section-panel'));
      function showPanel(idx) {
        panelEls.forEach((el, i) => {
          const is = i === idx;
          el.style.display = is ? '' : 'none';
          el.setAttribute('aria-hidden', is ? 'false' : 'true');
        });
        
        // highlight current section in sidebar, respecting dark/light mode
        const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        const inactiveTextClass = isDarkMode ? 'text-light' : 'text-dark';
        
        document.querySelectorAll('.section-nav-link').forEach((link, i) => {
          if (i === idx) {
            link.classList.add('bg-primary', 'text-white');
            link.classList.remove('text-dark', 'text-light');
          } else {
            link.classList.remove('bg-primary', 'text-white');
            link.classList.remove('text-dark', 'text-light');
            link.classList.add(inactiveTextClass);
          }
        });
        
        current = idx;
        prevBtn.disabled = idx === 0;
        const last = idx === panelEls.length - 1;
        nextBtn.style.display = last ? 'none' : '';
        submit.style.display = last ? '' : 'none';
        pageInfo.textContent = `Section ${idx + 1} of ${panelEls.length}`;
      }

      prevBtn.addEventListener('click', () => {
        if (current > 0) { current -= 1; showPanel(current); }
      });
      nextBtn.addEventListener('click', () => {
        if (current < panelEls.length - 1) { current += 1; showPanel(current); }
      });

      // initial show
      showPanel(0);
      
      // Initialize global progress bars
      updateProgressBars();
      
      // Add event listeners to all radio buttons to update progress bars
      document.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.addEventListener('change', () => {
          updateProgressBars();
        });
      });

      // handle submit
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const fd = new FormData(form);
        const result = {};
        for (const [k, v] of fd.entries()) result[k] = v;
        console.log('Form answers:', result);
        alert('Answers logged to console.');
      });
    })
    .catch((err) => {
      console.error(err);
      showError('Failed to load questions.json from server.');
    });
});

// Function to update global progress bars across all sections
function updateProgressBars() {
  const allRadios = document.querySelectorAll('input[type="radio"]');
  
  let answered = 0;  // Yes or Not Applicable
  let inProgress = 0;
  let no = 0;
  let notAnswered = 0;
  
  const questionGroupNames = new Set();
  
  // Get all unique question field names across all sections
  allRadios.forEach(radio => {
    questionGroupNames.add(radio.name);
  });
  
  // Count responses across all sections
  questionGroupNames.forEach(name => {
    const checkedRadio = document.querySelector(`input[name="${name}"]:checked`);
    
    if (!checkedRadio) {
      notAnswered++;
    } else {
      const responseValue = checkedRadio.value.toLowerCase();
      if (responseValue === 'yes' || responseValue === 'not applicable') {
        answered++;
      } else if (responseValue === 'in progress') {
        inProgress++;
      } else if (responseValue === 'no') {
        no++;
      }
    }
  });
  
  const total = questionGroupNames.size || 1;
  const answeredPct = total > 0 ? Math.round((answered / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const noPct = total > 0 ? Math.round((no / total) * 100) : 0;
  const notAnsweredPct = total > 0 ? Math.round((notAnswered / total) * 100) : 0;
  
  // Update global progress bar fills
  const globalProgressContainer = document.getElementById('global-progress');
  if (globalProgressContainer) {
    const progressFills = globalProgressContainer.querySelectorAll('.progress-bar');
    if (progressFills.length >= 4) {
      progressFills[0].style.width = answeredPct + '%';
      progressFills[0].setAttribute('aria-valuenow', answeredPct);
      progressFills[0].textContent = answered;
      
      progressFills[1].style.width = inProgressPct + '%';
      progressFills[1].setAttribute('aria-valuenow', inProgressPct);
      progressFills[1].textContent = inProgress;
      
      progressFills[2].style.width = noPct + '%';
      progressFills[2].setAttribute('aria-valuenow', noPct);
      progressFills[2].textContent = no;
      
      progressFills[3].style.width = notAnsweredPct + '%';
      progressFills[3].setAttribute('aria-valuenow', notAnsweredPct);
      progressFills[3].textContent = notAnswered;
    }
  }
}
