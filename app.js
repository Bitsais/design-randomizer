/**
 * DESIGN RANDOMIZER — CORE APPLICATION LOGIC
 * Высококачественный интерактивный генератор брифов для графических дизайнеров
 */

(function () {
  'use strict';

  // Состояние приложения
  const state = {
    selectedCategory: 'all',
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
    categoryTabs: document.getElementById('categoryTabs'),
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

    // Поля Ниши
    nicheCategoryBadge: document.getElementById('nicheCategoryBadge'),
    nicheTitle: document.getElementById('nicheTitle'),
    nicheDesc: document.getElementById('nicheDesc'),
    nicheAudience: document.getElementById('nicheAudience'),

    // Поля Настроения
    moodKeywords: document.getElementById('moodKeywords'),
    moodName: document.getElementById('moodName'),
    moodVibe: document.getElementById('moodVibe'),
    moodFonts: document.getElementById('moodFonts'),

    // Поля Названия
    brandName: document.getElementById('brandName'),
    brandTagline: document.getElementById('brandTagline'),

    // Поля Палитры
    paletteName: document.getElementById('paletteName'),
    paletteSwatches: document.getElementById('paletteSwatches'),

    // Поля Задачи
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
  // WEB AUDIO API ДЛЯ ТАКТИЛЬНЫХ ЗВУКОВ КЛИКА (Zero-dependencies, offline)
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
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.05); // E5
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
      // Audio context might be restricted before interaction
    }
  }

  // ---------------------------------------------------------------------------
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ВЫБОРКИ И РАНДОМА
  // ---------------------------------------------------------------------------
  function getRandomItem(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Генератор названий брендов (микс кураторских и процедурных)
  function generateBrandName() {
    // 55% вероятность выбрать из кураторского списка, 45% сгенерировать процедурно
    if (Math.random() < 0.55 && DESIGN_DATA.curatedNames.length > 0) {
      const item = getRandomItem(DESIGN_DATA.curatedNames);
      return { ...item };
    }

    // Процедурная генерация
    const gen = DESIGN_DATA.namingGenerator;
    const prefix = getRandomItem(gen.prefixes);
    const root = getRandomItem(gen.roots);
    const suffix = getRandomItem(gen.suffixes);
    const tagStart = getRandomItem(gen.taglinesStart);
    const tagEnd = getRandomItem(gen.taglinesEnd);

    let name = '';
    const style = Math.floor(Math.random() * 3);
    if (style === 0) {
      name = prefix + capitalize(root);
    } else if (style === 1) {
      name = capitalize(root) + suffix;
    } else {
      name = prefix + suffix;
    }

    return {
      name: name,
      tagline: `${tagStart} ${tagEnd}`
    };
  }

  function getAvailableNiches() {
    if (state.selectedCategory === 'all') {
      return DESIGN_DATA.niches;
    }
    return DESIGN_DATA.niches.filter(n => n.category === state.selectedCategory);
  }

  // ---------------------------------------------------------------------------
  // ГЕНЕРАЦИЯ ПОЛЕЙ И ОБНОВЛЕНИЕ UI
  // ---------------------------------------------------------------------------
  function randomizeField(fieldKey) {
    if (state.locked[fieldKey]) return;

    if (fieldKey === 'niche') {
      const available = getAvailableNiches();
      state.current.niche = getRandomItem(available);
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
  // РЕНДЕР КАРТОЧЕК
  // ---------------------------------------------------------------------------
  function renderNiche() {
    const item = state.current.niche;
    if (!item) return;

    const catObj = DESIGN_DATA.categories.find(c => c.id === item.category);
    DOM.nicheCategoryBadge.textContent = catObj ? `${catObj.icon} ${catObj.name}` : item.category;
    DOM.nicheTitle.textContent = item.title;
    DOM.nicheDesc.textContent = item.desc;
    DOM.nicheAudience.textContent = item.audience;
  }

  function renderMood() {
    const item = state.current.mood;
    if (!item) return;

    DOM.moodName.textContent = item.name;
    DOM.moodVibe.textContent = item.vibe;
    DOM.moodKeywords.textContent = item.keywords ? item.keywords.replace(/,\s*/g, ' • ') : 'Стиль • Концепт';

    // Рендер тегов шрифтов
    DOM.moodFonts.innerHTML = '';
    const fontList = item.fonts.split(',').map(f => f.trim());
    fontList.forEach(font => {
      const span = document.createElement('span');
      span.className = 'font-tag';
      span.textContent = font;
      DOM.moodFonts.appendChild(span);
    });
  }

  function renderName() {
    const item = state.current.name;
    if (!item) return;

    DOM.brandName.textContent = item.name;
    DOM.brandTagline.textContent = item.tagline ? `«${item.tagline}»` : '';
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
        copyToClipboard(col.hex, `Цвет ${col.hex} скопирован в буфер!`);
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
    }, 2400);
  }

  function copyToClipboard(text, successMsg = 'Скопировано в буфер!') {
    navigator.clipboard.writeText(text).then(() => {
      playSound('success');
      showToast(successMsg);
    }).catch(() => {
      // Fallback
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

  // Скопировать готовый структурированный бриф
  function copyFullBrief() {
    const n = state.current.niche;
    const m = state.current.mood;
    const b = state.current.name;
    const p = state.current.palette;
    const d = state.current.deliverable;

    let text = `✦ ДИЗАЙН-БРИФ И КОНЦЕПТ ПРОЕКТА ✦\n\n`;
    text += `🏷️ БРЕНД: ${b.name}\n`;
    if (b.tagline) text += `   Слоган: «${b.tagline}»\n\n`;

    text += `🎯 НИША:\n   ${n.title}\n`;
    text += `   Суть: ${n.desc}\n`;
    text += `   Целевая аудитория: ${n.audience}\n\n`;

    text += `🎭 СТИЛЬ & НАСТРОЕНИЕ:\n   ${m.name}\n`;
    text += `   Вайб: ${m.vibe}\n`;
    text += `   Шрифты: ${m.fonts}\n\n`;

    text += `🎨 ЦВЕТОВАЯ ПАЛИТРА (${p.name}):\n`;
    p.colors.forEach(c => {
      text += `   • ${c.hex} — ${c.name} (${c.role})\n`;
    });
    text += `\n`;

    text += `📦 ЗАДАЧА & НОСИТЕЛИ:\n   ${d.title}\n`;
    text += `   Объем работ: ${d.scope}\n`;

    copyToClipboard(text, 'Полный бриф скопирован для Notion / Figma!');
  }

  // ---------------------------------------------------------------------------
  // ЭКСПОРТ КАРТОЧКИ В PNG (HTML5 Canvas автономный рендеринг высокого разрешения)
  // ---------------------------------------------------------------------------
  function exportBriefAsImage() {
    playSound('click');
    showToast('Генерация постера-карточки PNG...');

    const canvas = DOM.exportCanvas;
    const ctx = canvas.getContext('2d');
    
    // Базовые параметры разрешения (2400px ширина)
    const W = 2400;
    const isDark = DOM.body.classList.contains('theme-dark');
    
    // Параметры сетки колонок
    const col1X = 160;
    const col1W = 960;
    const dividerX = 1180;
    const col2X = 1240;
    const col2W = 980;

    // Вспомогательная функция переноса текста по словам
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

    // Предварительный расчет высоты левой колонки
    const nameLines = getLines(state.current.name.name, col1W, 'bold 70px "Syne", "Space Grotesk", sans-serif');
    const taglineLines = state.current.name.tagline 
      ? getLines(`«${state.current.name.tagline}»`, col1W, 'italic 28px Inter, sans-serif') 
      : [];
    const nicheTitleLines = getLines(state.current.niche.title, col1W, 'bold 36px "Space Grotesk", Inter, sans-serif');
    const nicheDescLines = getLines(state.current.niche.desc, col1W, '26px Inter, sans-serif');
    const audienceLines = getLines(state.current.niche.audience, col1W, '24px Inter, sans-serif');

    let estLeftH = 320 + (nameLines.length * 78) + (taglineLines.length * 36) + 40 + 36;
    estLeftH += (nicheTitleLines.length * 46) + 12 + (nicheDescLines.length * 36) + 24 + 28 + (audienceLines.length * 34);

    // Предварительный расчет высоты правой колонки
    const moodNameLines = getLines(state.current.mood.name, col2W, 'bold 36px "Space Grotesk", Inter, sans-serif');
    const moodVibeLines = getLines(state.current.mood.vibe, col2W, '26px Inter, sans-serif');
    const fontLines = getLines(state.current.mood.fonts, col2W, 'bold 24px "JetBrains Mono", monospace');
    const delivTitleLines = getLines(state.current.deliverable.title, col2W, 'bold 32px "Space Grotesk", Inter, sans-serif');
    const delivScopeLines = getLines(state.current.deliverable.scope, col2W, '24px Inter, sans-serif');

    let estRightH = 320 + 36 + (moodNameLines.length * 46) + 12 + (moodVibeLines.length * 36) + 20 + 28 + (fontLines.length * 34) + 40;
    estRightH += 36 + (delivTitleLines.length * 42) + 12 + (delivScopeLines.length * 34);

    // Динамический расчет высоты холста
    const contentBottom = Math.max(estLeftH, estRightH);
    const paletteSepY = Math.max(contentBottom + 45, 960);
    const swatchY = paletteSepY + 85;
    const swatchH = 175;
    const H = Math.max(1450, swatchY + swatchH + 110);

    canvas.width = W;
    canvas.height = H;

    // Отрисовка фона
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
    ctx.fillText('Креативный бриф айдентики и дизайн-концепта', 160, 218);

    // Разделительная линия под шапкой
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(160, 255);
    ctx.lineTo(W - 160, 255);
    ctx.stroke();

    // Функция отрисовки массива строк
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
    let leftY = 330;

    // Имя бренда
    leftY = drawLines(nameLines, col1X, leftY, 78, isDark ? '#ffffff' : '#111827', 'bold 70px "Syne", "Space Grotesk", sans-serif');

    // Слоган
    if (taglineLines.length > 0) {
      leftY = drawLines(taglineLines, col1X, leftY - 10, 36, isDark ? '#9ca3af' : '#4b5563', 'italic 28px Inter, sans-serif');
    }
    leftY += 35;

    // Заголовок ниши
    const catObj = DESIGN_DATA.categories.find(c => c.id === state.current.niche.category);
    const catName = catObj ? ` • ${catObj.name.toUpperCase()}` : '';
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(`01 // НИША БИЗНЕСА${catName}`, col1X, leftY);
    leftY += 38;

    // Название ниши (аккуратно перенесено)
    leftY = drawLines(nicheTitleLines, col1X, leftY, 46, isDark ? '#f3f4f6' : '#111827', 'bold 36px "Space Grotesk", Inter, sans-serif');
    leftY += 10;

    // Описание ниши
    leftY = drawLines(nicheDescLines, col1X, leftY, 36, isDark ? '#9ca3af' : '#4b5563', '26px Inter, sans-serif');
    leftY += 20;

    // Метка аудитории
    ctx.fillStyle = isDark ? '#6b7280' : '#9ca3af';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('ЦЕЛЕВАЯ АУДИТОРИЯ:', col1X, leftY);
    leftY += 28;

    // Текст аудитории
    leftY = drawLines(audienceLines, col1X, leftY, 34, isDark ? '#d1d5db' : '#374151', '24px Inter, sans-serif');

    // === ПРАВАЯ КОЛОНКА ===
    let rightY = 330;

    // Секция 02: Настроение и стиль
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('02 // НАСТРОЕНИЕ & СТИЛЬ', col2X, rightY);
    rightY += 38;

    // Имя стиля
    rightY = drawLines(moodNameLines, col2X, rightY, 46, isDark ? '#ffffff' : '#111827', 'bold 36px "Space Grotesk", Inter, sans-serif');
    rightY += 10;

    // Вайб стиля
    rightY = drawLines(moodVibeLines, col2X, rightY, 36, isDark ? '#9ca3af' : '#4b5563', '26px Inter, sans-serif');
    rightY += 18;

    // Метка шрифтов
    ctx.fillStyle = isDark ? '#6b7280' : '#9ca3af';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('ШРИФТОВЫЕ ОРИЕНТИРЫ:', col2X, rightY);
    rightY += 28;

    // Список шрифтов
    rightY = drawLines(fontLines, col2X, rightY, 34, '#6366f1', 'bold 24px "JetBrains Mono", monospace');
    rightY += 38;

    // Секция 03: Задача и носители
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('03 // ЗАДАЧА & ОБЪЕМ', col2X, rightY);
    rightY += 38;

    // Название задачи
    rightY = drawLines(delivTitleLines, col2X, rightY, 42, isDark ? '#ffffff' : '#111827', 'bold 32px "Space Grotesk", Inter, sans-serif');
    rightY += 10;

    // Описание задачи
    rightY = drawLines(delivScopeLines, col2X, rightY, 34, isDark ? '#9ca3af' : '#4b5563', '24px Inter, sans-serif');

    // Тонкий вертикальный разделитель между колонками
    const maxColY = Math.max(leftY, rightY);
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.moveTo(dividerX, 290);
    ctx.lineTo(dividerX, maxColY);
    ctx.stroke();

    // === РАЗДЕЛИТЕЛЬ И ПАЛИТРА СНИЗУ ===
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.moveTo(160, paletteSepY);
    ctx.lineTo(W - 160, paletteSepY);
    ctx.stroke();

    // Заголовок палитры
    ctx.fillStyle = isDark ? '#ffffff' : '#111827';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.fillText(`ЦВЕТОВАЯ ПАЛИТРА: ${state.current.palette.name.toUpperCase()}`, 160, paletteSepY + 45);

    // Отрисовка 5 цветовых плашек
    const swatchGap = 24;
    const swatchW = (W - 320 - (4 * swatchGap)) / 5;

    state.current.palette.colors.forEach((col, idx) => {
      const sx = 160 + idx * (swatchW + swatchGap);
      
      // Фон подложки плашки
      ctx.fillStyle = isDark ? '#1f232f' : '#f3f4f6';
      roundRect(ctx, sx, swatchY, swatchW, swatchH, 16, true, false);

      // Верхняя цветная часть плашки
      ctx.fillStyle = col.hex;
      roundRect(ctx, sx, swatchY, swatchW, swatchH - 75, 14, true, false);

      // HEX-код
      ctx.fillStyle = isDark ? '#ffffff' : '#111827';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText(col.hex, sx + 14, swatchY + swatchH - 42);

      // Название оттенка
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
      showToast(`Карточка brief-${safeName}.png сохранена! 🖼️`);
    }, 100);
  }

  // Вспомогательные функции отрисовки на Canvas
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

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  // ---------------------------------------------------------------------------
  // ИЗБРАННОЕ И ИСТОРИЯ (LOCALSTORAGE)
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

  // Восстановить концепт из истории или избранного
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

      // Плашки палитры
      const swatchesHtml = c.palette.colors.map(col => `
        <span class="mini-swatch" style="background-color: ${col.hex};" title="${col.hex}"></span>
      `).join('');

      card.innerHTML = `
        <div class="saved-item-info">
          <h4>${c.name.name} <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">— ${c.niche.title}</span></h4>
          <p>${c.mood.name} • ${c.deliverable.title}</p>
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
  // ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ СОБЫТИЙ
  // ---------------------------------------------------------------------------
  function initCategories() {
    DOM.categoryTabs.innerHTML = '';
    DESIGN_DATA.categories.forEach(cat => {
      const tab = document.createElement('button');
      tab.className = `category-tab ${cat.id === state.selectedCategory ? 'active' : ''}`;
      tab.innerHTML = `<span>${cat.icon}</span> <span>${cat.name}</span>`;
      
      tab.addEventListener('click', () => {
        playSound('click');
        state.selectedCategory = cat.id;
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Если ниша не залочена, перегенерировать под новую категорию
        if (!state.locked.niche) {
          randomizeField('niche');
        }
      });

      DOM.categoryTabs.appendChild(tab);
    });
  }

  function initListeners() {
    // Главная кнопка
    DOM.btnRandomizeAll.addEventListener('click', randomizeAll);

    // Дополнительные кнопки
    DOM.btnSaveFavorite.addEventListener('click', toggleFavorite);
    DOM.btnCopyBrief.addEventListener('click', copyFullBrief);
    DOM.btnExportImage.addEventListener('click', exportBriefAsImage);
    DOM.btnCopyName.addEventListener('click', () => {
      copyToClipboard(state.current.name.name, `Название «${state.current.name.name}» скопировано!`);
    });

    // Хедер
    DOM.btnSound.addEventListener('click', toggleSound);
    DOM.btnTheme.addEventListener('click', toggleTheme);
    DOM.btnOpenHistory.addEventListener('click', () => openModal('favorites'));

    // Модалка
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

    // Обработчики Lock и Reroll на карточках
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

    // Горячие клавиши (Spacebar, Escape, etc.)
    window.addEventListener('keydown', (e) => {
      // Игнорируем если фокус в инпуте или textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        randomizeAll();
      } else if (e.key === 'Escape') {
        closeModal();
      } else if (e.code === 'KeyC' && (e.ctrlKey || e.metaKey)) {
        // Стандартный копирует если выделен текст
      } else if (e.key === 's' || e.key === 'ы') {
        toggleFavorite();
      }
    });
  }

  // Запуск приложения
  function init() {
    loadStorage();
    initCategories();
    initListeners();
    randomizeAll();
  }

  // Старт после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
