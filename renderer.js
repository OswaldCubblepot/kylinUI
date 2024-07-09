document.getElementById('toggle-button').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
});

document.getElementById('menu-items').addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (link) {
    event.preventDefault();
    const href = link.getAttribute('href').substring(1);
    showPage(href);
  }
});

document.getElementById('run-python-button').addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:5000/get_status');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.type !== undefined) {
      const schemeNumber = data.type;
      const message = `目前推荐使用第${schemeNumber}种调优方案`;
      alert(message);
    } else {
      alert('未能获取推荐方案');
    }
  } catch (error) {
    console.error('Error fetching scheme:', error);
  }
});

window.electronAPI.onFromPython((data) => {
  if (data && data.score !== undefined && data.type !== undefined) {
    const score = parseFloat(data.score).toFixed(2);
    const schemeNumber = data.type;
    const currentScoreElement = document.getElementById('current-score');
    currentScoreElement.textContent = `当前评分：${score}`;

    const message = `目前推荐使用第${schemeNumber}种调优方案`;
    alert(message);
  } else {
    alert('未能获取有效数据');
  }
});

function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.toggle('active', page.id === pageId);
  });

  const content = document.getElementById('content');
  if (pageId === 'dashboard') {
    content.classList.add('centered');
  } else {
    content.classList.remove('centered');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('server-options').addEventListener('click', (event) => {
    const option = event.target.closest('.server-option');
    if (option) {
      document.querySelectorAll('.server-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      option.classList.add('selected');
      const selectedType = option.getAttribute('data-type');
      const serverId = option.getAttribute('data-id');
      console.log(`Selected server type: ${selectedType}`);
      window.electronAPI.serverTypeSelected(serverId);
    }
  });

  showPage('home');

  try {
    console.log('Attempting to fetch score...');
    const response = await fetch('http://localhost:5000/get_status');
    console.log('Response received:', response);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Data received:', data);
    if (data && data.score !== undefined) {
      const score = parseFloat(data.score).toFixed(2);
      const currentScoreElement = document.getElementById('current-score');
      currentScoreElement.textContent = `当前评分：${score}`;
    }
  } catch (error) {
    console.error('Error fetching score:', error);
  }

  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
      window.electronAPI.toggleDarkMode();
    });
  }

  window.electronAPI.onDarkModeStatus((isDarkMode) => {
    darkModeToggle.checked = isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
  });
});

