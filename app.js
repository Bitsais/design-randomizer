/**
 * DESIGN RANDOMIZER — CORE APPLICATION LOGIC
 * Минималистичный генератор дизайн-челленджей для графических дизайнеров
 */

(function () {
  'use strict';

  // Состояние приложения
  const state = {
    locked: {
      niche: false,
      mood: false,
      name: false,
      palette: false,
      deliverable: false
    },
    current: {
      niche: null,
      mood: null,
      name: null,
      palette: null,
      deliverable: null
    },
    soundEnabled: true,
    activeModalTab: 'favorites', // 'favorites' | 'history'
    favorites: [],
    history: []
  };

  // Элементы интерфейса
  const DOM = {
    body: document.body,
    btnSound: document.getElementById('btnSound'),
    btnTheme: document.getElementById('btnTheme'),
    btnOpenHistory: document.getElementById('btnOpenHistory'),
    favCountBadge: document.getElementById('favCount'),
    btnRandomizeAll: document.getElementById('btnRandomizeAll'),
    btnSaveFavorite: document.getElementById('btnSaveFavorite'),
    btnCopyBrief: document.getElementById('btnCopyBrief'),
    btnExportImage: document.getElementById('btnExportImage'),
    btnCopyName: document.getElementById('btnCopyName'),
    
    // Карточки
    cardNiche: document.getElementById('cardNiche'),
    cardMood: document.getElementById('cardMood'),
    cardName: document.getElementById('cardName'),
    cardPalette: document.getElementById('cardPalette'),
    cardDeliverable: document.getElementById('cardDeliverable'),

    // Поля данных
    nicheTitle: document.getElementById('nicheTitle'),
    moodName: document.getElementById('moodName'),
    brandName: document.getElementById('brandName'),
    paletteName: document.getElementById('paletteName'),
    paletteSwatches: document.getElementById('paletteSwatches'),
    deliverableTitle: document.getElementById('deliverableTitle'),
    deliverableScope: document.getElementById('deliverableScope'),

    // Модалка и Toast
    historyModal: document.getElementById('historyModal'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    tabFavorites: document.getElementById('tabFavorites'),
    tabHistory: document.getElementById('tabHistory'),
    modalListContainer: document.getElementById('modalListContainer'),
    modalFavCount: document.getElementById('modalFavCount'),
    btnClearHistory: document.getElementById('btnClearHistory'),
    toastNotice: document.getElementById('toastNotice'),
    toastMessage: document.getElementById('toastMessage'),
    exportCanvas: document.getElementById('exportCanvas')
  };

  // ---------------------------------------------------------------------------
  // WEB AUDIO API ДЛЯ ЗВУКОВ КЛИКА
  // ---------------------------------------------------------------------------
  let audioCtx = null;
  function playSound(type = 'click') {
    if (!state.soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'shuffle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'lock') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Audio context may be restricted before interaction
    }
  }

  // ---------------------------------------------------------------------------
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ---------------------------------------------------------------------------
  function getRandomItem(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Генератор названий брендов (без слоганов)
  function generateBrandName() {
    if (Math.random() < 0.55 && DESIGN_DATA.curatedNames.length > 0) {
      const item = getRandomItem(DESIGN_DATA.curatedNames);
      return { name: item.name };
    }

    const gen = DESIGN_DATA.namingGenerator;
    const prefix = getRandomItem(gen.prefixes);
    const root = getRandomItem(gen.roots);
    const suffix = getRandomItem(gen.suffixes);

    let name = '';
    const style = Math.floor(Math.random() * 3);
    if (style === 0) {
      name = prefix + capitalize(root);
    } else if (style === 1) {
      name = capitalize(root) + suffix;
    } else {
      name = prefix + suffix;
    }

    return { name: name };
  }

  // ---------------------------------------------------------------------------
  // ГЕНЕРАЦИЯ ПОЛЕЙ И ОБНОВЛЕНИЕ UI
  // ---------------------------------------------------------------------------
  function randomizeField(fieldKey) {
    if (state.locked[fieldKey]) return;

    if (fieldKey === 'niche') {
      state.current.niche = getRandomItem(DESIGN_DATA.niches);
      renderNiche();
    } else if (fieldKey === 'mood') {
      state.current.mood = getRandomItem(DESIGN_DATA.moods);
      renderMood();
    } else if (fieldKey === 'name') {
      state.current.name = generateBrandName();
      renderName();
    } else if (fieldKey === 'palette') {
      state.current.palette = getRandomItem(DESIGN_DATA.palettes);
      renderPalette();
    } else if (fieldKey === 'deliverable') {
      state.current.deliverable = getRandomItem(DESIGN_DATA.deliverables);
      renderDeliverable();
    }

    triggerCardAnimation(fieldKey);
  }

  function randomizeAll() {
    playSound('shuffle');
    const fields = ['niche', 'mood', 'name', 'palette', 'deliverable'];
    fields.forEach(f => {
      if (!state.locked[f]) {
        randomizeField(f);
      }
    });
    recordHistory();
    updateFavoriteButtonState();
  }

  function triggerCardAnimation(fieldKey) {
    const cardMap = {
      niche: DOM.cardNiche,
      mood: DOM.cardMood,
      name: DOM.cardName,
      palette: DOM.cardPalette,
      deliverable: DOM.cardDeliverable
    };
    const card = cardMap[fieldKey];
    if (!card) return;

    const highlightEl = card.querySelector('.field-highlight') || card;
    highlightEl.classList.add('animating');
    setTimeout(() => {
      highlightEl.classList.remove('animating');
    }, 140);
  }

  // ---------------------------------------------------------------------------
  // РЕНДЕР КАРТОЧЕК (ТОЛЬКО СУТЬ БЕЗ ЛИШНИХ ОПИСАНИЙ)
  // ---------------------------------------------------------------------------
  function renderNiche() {
    const item = state.current.niche;
    if (!item) return;
    DOM.nicheTitle.textContent = item.title;
  }

  function renderMood() {
    const item = state.current.mood;
    if (!item) return;
    DOM.moodName.textContent = item.name;
  }

  function renderName() {
    const item = state.current.name;
    if (!item) return;
    DOM.brandName.textContent = item.name;
  }

  function renderPalette() {
    const item = state.current.palette;
    if (!item) return;

    DOM.paletteName.textContent = item.name;
    DOM.paletteSwatches.innerHTML = '';

    item.colors.forEach(col => {
      const swatch = document.createElement('div');
      swatch.className = 'swatch-item';
      swatch.title = `Нажмите, чтобы скопировать ${col.hex}`;
      
      swatch.innerHTML = `
        <div class="swatch-color-box" style="background-color: ${col.hex};"></div>
        <div class="swatch-info">
          <span class="swatch-hex">${col.hex}</span>
          <span class="swatch-name">${col.name}</span>
          <span class="swatch-role">${col.role}</span>
        </div>
      `;

      swatch.addEventListener('click', () => {
        copyToClipboard(col.hex, `Цвет ${col.hex} скопирован!`);
      });

      DOM.paletteSwatches.appendChild(swatch);
    });
  }

  function renderDeliverable() {
    const item = state.current.deliverable;
    if (!item) return;

    DOM.deliverableTitle.textContent = item.title;
    DOM.deliverableScope.textContent = item.scope;
  }

  // ---------------------------------------------------------------------------
  // БЛОКИРОВКА КАРТОЧЕК (LOCK / UNLOCK)
  // ---------------------------------------------------------------------------
  function toggleLock(fieldKey) {
    state.locked[fieldKey] = !state.locked[fieldKey];
    playSound('lock');

    const cardMap = {
      niche: DOM.cardNiche,
      mood: DOM.cardMood,
      name: DOM.cardName,
      palette: DOM.cardPalette,
      deliverable: DOM.cardDeliverable
    };

    const card = cardMap[fieldKey];
    const lockBtn = card.querySelector('.lock-btn');

    if (state.locked[fieldKey]) {
      card.classList.add('is-locked');
      lockBtn.classList.add('locked');
      showToast(`Поле «${getFieldName(fieldKey)}» зафиксировано 🔒`);
    } else {
      card.classList.remove('is-locked');
      lockBtn.classList.remove('locked');
      showToast(`Поле «${getFieldName(fieldKey)}» разблокировано 🔓`);
    }
  }

  function getFieldName(key) {
    const names = {
      niche: 'Ниша',
      mood: 'Настроение',
      name: 'Название',
      palette: 'Палитра',
      deliverable: 'Задача'
    };
    return names[key] || key;
  }

  // ---------------------------------------------------------------------------
  // БУФЕР ОБМЕНА & TOAST УВЕДОМЛЕНИЯ
  // ---------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    DOM.toastMessage.textContent = message;
    DOM.toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      DOM.toastNotice.classList.remove('show');
    }, 2200);
  }

  function copyToClipboard(text, successMsg = 'Скопировано в буфер!') {
    navigator.clipboard.writeText(text).then(() => {
      playSound('success');
      showToast(successMsg);
    }).catch(() => {
      const input = document.createElement('textarea');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      playSound('success');
      showToast(successMsg);
    });
  }

  // Скопировать готовый бриф
  function copyFullBrief() {
    const n = state.current.niche;
    const m = state.current.mood;
    const b = state.current.name;
    const p = state.current.palette;
    const d = state.current.deliverable;

    let text = `✦ ДИЗАЙН-БРИФ И КОНЦЕПТ ПРОЕКТА ✦\n\n`;
    text += `🏷️ БРЕНД: ${b.name}\n\n`;
    text += `🎯 НИША: ${n.title}\n\n`;
    text += `🎭 НАСТРОЕНИЕ & СТИЛЬ: ${m.name}\n\n`;
    text += `🎨 ЦВЕТОВАЯ ПАЛИТРА (${p.name}):\n`;
    p.colors.forEach(c => {
      text += `   • ${c.hex} — ${c.name} (${c.role})\n`;
    });
    text += `\n`;
    text += `📦 ЗАДАЧА & НОСИТЕЛИ:\n   ${d.title}\n`;
    text += `   Объем работ: ${d.scope}\n`;

    copyToClipboard(text, 'Бриф скопирован для Notion / Figma!');
  }

  // ---------------------------------------------------------------------------
  // ЭКСПОРТ КАРТОЧКИ В PNG (ЧИСТЫЙ МИНИМАЛИСТИЧНЫЙ ДИЗАЙН)
  // ---------------------------------------------------------------------------
  function exportBriefAsImage() {
    playSound('click');
    showToast('Генерация постера PNG...');

    const canvas = DOM.exportCanvas;
    const ctx = canvas.getContext('2d');
    
    const W = 2400;
    const isDark = DOM.body.classList.contains('theme-dark');
    
    const col1X = 160;
    const col1W = 960;
    const dividerX = 1180;
    const col2X = 1240;
    const col2W = 980;

    function getLines(text, maxWidth, font) {
      if (!text) return [];
      ctx.font = font;
      const words = String(text).split(' ');
      const lines = [];
      let cur = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const test = cur ? cur + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && cur) {
          lines.push(cur);
          cur = word;
        } else {
          cur = test;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    }

    // Расчет высоты левой колонки
    const nameLines = getLines(state.current.name.name, col1W, 'bold 74px "Syne", "Space Grotesk", sans-serif');
    const nicheTitleLines = getLines(state.current.niche.title, col1W, 'bold 38px "Space Grotesk", Inter, sans-serif');

    let estLeftH = 320 + (nameLines.length * 82) + 50 + 38 + (nicheTitleLines.length * 48);

    // Расчет высоты правой колонки
    const delivTitleLines = getLines(state.current.deliverable.title, col2W, 'bold 32px "Space Grotesk", Inter, sans-serif');
    const delivScopeLines = getLines(state.current.deliverable.scope, col2W, '24px Inter, sans-serif');

    let estRightH = 320 + 38 + 65 + 45 + 38 + (delivTitleLines.length * 42) + 12 + (delivScopeLines.length * 34);

    // Высота холста
    const contentBottom = Math.max(estLeftH, estRightH);
    const paletteSepY = Math.max(contentBottom + 50, 880);
    const swatchY = paletteSepY + 85;
    const swatchH = 175;
    const H = Math.max(1360, swatchY + swatchH + 110);

    canvas.width = W;
    canvas.height = H;

    // Фон
    ctx.fillStyle = isDark ? '#0b0c10' : '#f4f5f8';
    ctx.fillRect(0, 0, W, H);

    // Внутренняя карточка
    ctx.fillStyle = isDark ? '#161922' : '#ffffff';
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 4;
    roundRect(ctx, 80, 80, W - 160, H - 160, 36, true, true);

    // Шапка карточки
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 34px "Space Grotesk", Inter, sans-serif';
    ctx.fillText('✦ DESIGN BRIEF RANDOMIZER', 160, 175);

    ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
    ctx.font = '26px Inter, sans-serif';
    ctx.fillText('Креативный бриф айдентики и концепта', 160, 218);

    // Разделительная линия
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(160, 255);
    ctx.lineTo(W - 160, 255);
    ctx.stroke();

    function drawLines(lines, x, startY, lineHeight, color, font) {
      ctx.fillStyle = color;
      ctx.font = font;
      let y = startY;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y);
        y += lineHeight;
      }
      return y;
    }

    // === ЛЕВАЯ КОЛОНКА ===
    let leftY = 340;

    // Имя бренда
    leftY = drawLines(nameLines, col1X, leftY, 82, isDark ? '#ffffff' : '#111827', 'bold 74px "Syne", "Space Grotesk", sans-serif');
    leftY += 50;

    // 01 // НИША БИЗНЕСА
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('01 // НИША БИЗНЕСА', col1X, leftY);
    leftY += 38;

    // Название ниши (без лишних описаний)
    leftY = drawLines(nicheTitleLines, col1X, leftY, 48, isDark ? '#f3f4f6' : '#111827', 'bold 38px "Space Grotesk", Inter, sans-serif');

    // === ПРАВАЯ КОЛОНКА ===
    let rightY = 340;

    // 02 // НАСТРОЕНИЕ & СТИЛЬ
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('02 // НАСТРОЕНИЕ & СТИЛЬ', col2X, rightY);
    rightY += 45;

    // Одно единственное слово настроения (крупно и выразительно)
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 54px "Space Grotesk", sans-serif';
    ctx.fillText(state.current.mood.name.toUpperCase(), col2X, rightY);
    rightY += 75;

    // 03 // ЗАДАЧА & ОБЪЕМ
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('03 // ЗАДАЧА & ОБЪЕМ', col2X, rightY);
    rightY += 38;

    // Название задачи
    rightY = drawLines(delivTitleLines, col2X, rightY, 42, isDark ? '#ffffff' : '#111827', 'bold 32px "Space Grotesk", Inter, sans-serif');
    rightY += 10;

    // Описание задачи
    rightY = drawLines(delivScopeLines, col2X, rightY, 34, isDark ? '#9ca3af' : '#4b5563', '24px Inter, sans-serif');

    // Вертикальный разделитель
    const maxColY = Math.max(leftY, rightY);
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.moveTo(dividerX, 290);
    ctx.lineTo(dividerX, maxColY);
    ctx.stroke();

    // === ПАЛИТРА СНИЗУ ===
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.moveTo(160, paletteSepY);
    ctx.lineTo(W - 160, paletteSepY);
    ctx.stroke();

    // Заголовок палитры
    ctx.fillStyle = isDark ? '#ffffff' : '#111827';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.fillText(`ЦВЕТОВАЯ ПАЛИТРА: ${state.current.palette.name.toUpperCase()}`, 160, paletteSepY + 45);

    const swatchGap = 24;
    const swatchW = (W - 320 - (4 * swatchGap)) / 5;

    state.current.palette.colors.forEach((col, idx) => {
      const sx = 160 + idx * (swatchW + swatchGap);
      
      ctx.fillStyle = isDark ? '#1f232f' : '#f3f4f6';
      roundRect(ctx, sx, swatchY, swatchW, swatchH, 16, true, false);

      ctx.fillStyle = col.hex;
      roundRect(ctx, sx, swatchY, swatchW, swatchH - 75, 14, true, false);

      ctx.fillStyle = isDark ? '#ffffff' : '#111827';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText(col.hex, sx + 14, swatchY + swatchH - 42);

      ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
      ctx.font = '20px Inter, sans-serif';
      let colName = col.name;
      if (ctx.measureText(colName).width > swatchW - 28) {
        while (ctx.measureText(colName + '…').width > swatchW - 28 && colName.length > 0) {
          colName = colName.slice(0, -1);
        }
        colName += '…';
      }
      ctx.fillText(colName, sx + 14, swatchY + swatchH - 16);
    });

    // Экспорт в файл
    setTimeout(() => {
      const link = document.createElement('a');
      const safeName = state.current.name.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `brief-${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast(`Постер brief-${safeName}.png сохранен! 🖼️`);
    }, 100);
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // ИЗБРАННОЕ И ИСТОРИЯ
  // ---------------------------------------------------------------------------
  function loadStorage() {
    try {
      const savedFavs = localStorage.getItem('design_randomizer_favs');
      if (savedFavs) state.favorites = JSON.parse(savedFavs);

      const savedHist = localStorage.getItem('design_randomizer_hist');
      if (savedHist) state.history = JSON.parse(savedHist);

      const savedSound = localStorage.getItem('design_randomizer_sound');
      if (savedSound !== null) state.soundEnabled = savedSound === 'true';

      const savedTheme = localStorage.getItem('design_randomizer_theme');
      if (savedTheme) {
        DOM.body.classList.remove('theme-dark', 'theme-light');
        DOM.body.classList.add(savedTheme);
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
    updateFavoriteCountBadges();
    updateSoundButtonUI();
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  }

  function recordHistory() {
    if (!state.current.name) return;
    const item = {
      id: Date.now(),
      concept: JSON.parse(JSON.stringify(state.current)),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    state.history.unshift(item);
    if (state.history.length > 30) state.history.pop();
    saveStorage('design_randomizer_hist', state.history);
  }

  function toggleFavorite() {
    if (!state.current.name) return;
    const currentName = state.current.name.name;
    const existingIndex = state.favorites.findIndex(f => f.concept.name.name === currentName);

    if (existingIndex >= 0) {
      state.favorites.splice(existingIndex, 1);
      showToast(`«${currentName}» удален из избранного`);
    } else {
      state.favorites.unshift({
        id: Date.now(),
        concept: JSON.parse(JSON.stringify(state.current)),
        timestamp: new Date().toLocaleDateString()
      });
      playSound('success');
      showToast(`«${currentName}» добавлен в избранное! ⭐`);
    }

    saveStorage('design_randomizer_favs', state.favorites);
    updateFavoriteCountBadges();
    updateFavoriteButtonState();
  }

  function isCurrentFavorite() {
    if (!state.current.name) return false;
    return state.favorites.some(f => f.concept.name.name === state.current.name.name);
  }

  function updateFavoriteButtonState() {
    if (isCurrentFavorite()) {
      DOM.btnSaveFavorite.style.color = '#f59e0b';
      DOM.btnSaveFavorite.querySelector('span').textContent = 'В избранном ★';
    } else {
      DOM.btnSaveFavorite.style.color = '';
      DOM.btnSaveFavorite.querySelector('span').textContent = 'В избранное';
    }
  }

  function updateFavoriteCountBadges() {
    DOM.favCountBadge.textContent = state.favorites.length;
    DOM.modalFavCount.textContent = state.favorites.length;
  }

  function restoreConcept(concept) {
    state.current = JSON.parse(JSON.stringify(concept));
    renderNiche();
    renderMood();
    renderName();
    renderPalette();
    renderDeliverable();
    updateFavoriteButtonState();
    closeModal();
    playSound('success');
    showToast(`Концепт «${concept.name.name}» загружен! 🚀`);
  }

  // ---------------------------------------------------------------------------
  // МОДАЛЬНОЕ ОКНО
  // ---------------------------------------------------------------------------
  function openModal(tab = 'favorites') {
    state.activeModalTab = tab;
    DOM.historyModal.classList.add('open');
    DOM.historyModal.setAttribute('aria-hidden', 'false');
    renderModalList();
  }

  function closeModal() {
    DOM.historyModal.classList.remove('open');
    DOM.historyModal.setAttribute('aria-hidden', 'true');
  }

  function renderModalList() {
    const isFav = state.activeModalTab === 'favorites';
    DOM.tabFavorites.classList.toggle('active', isFav);
    DOM.tabHistory.classList.toggle('active', !isFav);

    const items = isFav ? state.favorites : state.history;
    DOM.modalListContainer.innerHTML = '';

    if (items.length === 0) {
      DOM.modalListContainer.innerHTML = `
        <div class="empty-state">
          <p>${isFav ? 'В избранном пока нет сохраненных идей.' : 'История генераций пуста.'}</p>
          <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-dim);">
            ${isFav ? 'Нажмите «В избранное» у понравившегося концепта.' : 'Нажмите кнопку генерации или клавишу Пробел!'}
          </p>
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const c = item.concept;
      const card = document.createElement('div');
      card.className = 'saved-item-card';

      const swatchesHtml = c.palette.colors.map(col => `
        <span class="mini-swatch" style="background-color: ${col.hex};" title="${col.hex}"></span>
      `).join('');

      card.innerHTML = `
        <div class="saved-item-info">
          <h4>${c.name.name} <span style="font-size: 0.85rem; font-weight: 400; color: var(--text-muted);">— ${c.niche.title}</span></h4>
          <p>Настроение: <strong>${c.mood.name}</strong> • ${c.deliverable.title}</p>
          <div class="saved-item-palette">
            ${swatchesHtml}
            <span style="font-size: 0.75rem; color: var(--text-dim); margin-left: 6px;">${c.palette.name}</span>
          </div>
        </div>
        <div class="saved-item-actions">
          <button class="restore-btn" title="Применить этот концепт">Открыть</button>
          <button class="delete-btn" title="Удалить">✕</button>
        </div>
      `;

      card.querySelector('.restore-btn').addEventListener('click', () => {
        restoreConcept(c);
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        if (isFav) {
          state.favorites = state.favorites.filter(f => f.id !== item.id);
          saveStorage('design_randomizer_favs', state.favorites);
        } else {
          state.history = state.history.filter(h => h.id !== item.id);
          saveStorage('design_randomizer_hist', state.history);
        }
        updateFavoriteCountBadges();
        updateFavoriteButtonState();
        renderModalList();
      });

      DOM.modalListContainer.appendChild(card);
    });
  }

  function clearCurrentModalList() {
    if (state.activeModalTab === 'favorites') {
      state.favorites = [];
      saveStorage('design_randomizer_favs', state.favorites);
    } else {
      state.history = [];
      saveStorage('design_randomizer_hist', state.history);
    }
    updateFavoriteCountBadges();
    updateFavoriteButtonState();
    renderModalList();
    showToast('Список очищен');
  }

  // ---------------------------------------------------------------------------
  // ТЕМА И ЗВУК
  // ---------------------------------------------------------------------------
  function toggleTheme() {
    const isDark = DOM.body.classList.contains('theme-dark');
    DOM.body.classList.remove('theme-dark', 'theme-light');
    const newTheme = isDark ? 'theme-light' : 'theme-dark';
    DOM.body.classList.add(newTheme);
    localStorage.setItem('design_randomizer_theme', newTheme);
    playSound('click');
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('design_randomizer_sound', state.soundEnabled);
    updateSoundButtonUI();
    if (state.soundEnabled) playSound('success');
    showToast(state.soundEnabled ? 'Звуковые эффекты включены 🔊' : 'Звук выключен 🔇');
  }

  function updateSoundButtonUI() {
    DOM.btnSound.classList.toggle('active', state.soundEnabled);
    DOM.btnSound.style.opacity = state.soundEnabled ? '1' : '0.5';
  }

  // ---------------------------------------------------------------------------
  // ОБРАБОТЧИКИ СОБЫТИЙ И СТАРТ
  // ---------------------------------------------------------------------------
  function initListeners() {
    DOM.btnRandomizeAll.addEventListener('click', randomizeAll);
    DOM.btnSaveFavorite.addEventListener('click', toggleFavorite);
    DOM.btnCopyBrief.addEventListener('click', copyFullBrief);
    DOM.btnExportImage.addEventListener('click', exportBriefAsImage);
    DOM.btnCopyName.addEventListener('click', () => {
      copyToClipboard(state.current.name.name, `Название «${state.current.name.name}» скопировано!`);
    });

    DOM.btnSound.addEventListener('click', toggleSound);
    DOM.btnTheme.addEventListener('click', toggleTheme);
    DOM.btnOpenHistory.addEventListener('click', () => openModal('favorites'));

    DOM.btnCloseModal.addEventListener('click', closeModal);
    DOM.tabFavorites.addEventListener('click', () => {
      state.activeModalTab = 'favorites';
      renderModalList();
    });
    DOM.tabHistory.addEventListener('click', () => {
      state.activeModalTab = 'history';
      renderModalList();
    });
    DOM.btnClearHistory.addEventListener('click', clearCurrentModalList);
    DOM.historyModal.addEventListener('click', (e) => {
      if (e.target === DOM.historyModal) closeModal();
    });

    document.querySelectorAll('.lock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.getAttribute('data-field');
        toggleLock(field);
      });
    });

    document.querySelectorAll('.reroll-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.getAttribute('data-field');
        playSound('click');
        randomizeField(field);
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        randomizeAll();
      } else if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 's' || e.key === 'ы') {
        toggleFavorite();
      }
    });
  }

  function init() {
    loadStorage();
    initListeners();
    randomizeAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
