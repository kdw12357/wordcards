/* ─── Storage ─── */
const Storage = {
  getDecks: () => JSON.parse(localStorage.getItem('decks') || '[]'),
  saveDecks: (d) => localStorage.setItem('decks', JSON.stringify(d)),
  getCards: () => JSON.parse(localStorage.getItem('cards') || '[]'),
  saveCards: (c) => localStorage.setItem('cards', JSON.stringify(c)),

  getDeck: (id) => Storage.getDecks().find((d) => d.id === id) || null,
  getCard: (id) => Storage.getCards().find((c) => c.id === id) || null,
  getCardsByDeck: (deckId) => Storage.getCards().filter((c) => c.deckId === deckId),

  addDeck(deck) {
    const decks = Storage.getDecks();
    decks.push(deck);
    Storage.saveDecks(decks);
  },
  updateDeck(updated) {
    const decks = Storage.getDecks().map((d) => (d.id === updated.id ? updated : d));
    Storage.saveDecks(decks);
  },
  deleteDeck(id) {
    Storage.saveDecks(Storage.getDecks().filter((d) => d.id !== id));
    Storage.saveCards(Storage.getCards().filter((c) => c.deckId !== id));
  },
  addCard(card) {
    const cards = Storage.getCards();
    cards.push(card);
    Storage.saveCards(cards);
  },
  updateCard(updated) {
    const cards = Storage.getCards().map((c) => (c.id === updated.id ? updated : c));
    Storage.saveCards(cards);
  },
  deleteCard(id) {
    Storage.saveCards(Storage.getCards().filter((c) => c.id !== id));
  },
};

/* ─── Pastel Palette ─── */
const PASTEL_PALETTE = [
  '#FFB3BA','#FFDFBA','#FFFFBA','#BAFFC9','#BAE1FF',
  '#D4BAFF','#B5EAD7','#FFDAC1','#C7CEEA','#F2C4CE',
];

/* ─── SRS ─── */
const INTERVALS = [10, 60, 360, 1440, 4320, 10080, 20160, 43200, 129600, 259200, 525600];

const SRS = {
  nextLevel(current, rating) {
    if (rating === 'forgot') return 0;
    if (rating === 'hard') return Math.min(current + 1, 10);
    return Math.min(current + 2, 10);
  },
  nextReviewTime(level) {
    return new Date(Date.now() + INTERVALS[level] * 60 * 1000).toISOString();
  },
  apply(card, rating) {
    const newLevel = SRS.nextLevel(card.level, rating);
    return {
      ...card,
      level: newLevel,
      nextReview: SRS.nextReviewTime(newLevel),
      lastReviewed: new Date().toISOString(),
      reviewCount: (card.reviewCount || 0) + 1,
    };
  },
  isDue(card) {
    if (!card.nextReview) return true;
    return new Date(card.nextReview) <= new Date();
  },
  formatInterval(minutes) {
    if (minutes < 60) return `${minutes}분`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}시간`;
    if (minutes < 43200) return `${Math.round(minutes / 1440)}일`;
    if (minutes < 525600) return `${Math.round(minutes / 43200)}달`;
    return `${Math.round(minutes / 525600)}년`;
  },
  previewInterval(card, rating) {
    const lvl = SRS.nextLevel(card.level, rating);
    return SRS.formatInterval(INTERVALS[lvl]);
  },
};

/* ─── Utils ─── */
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diff = d - now;
  const absDiff = Math.abs(diff);
  if (absDiff < 60000) return '방금';
  if (diff < 0 && absDiff < 3600000) return `${Math.floor(absDiff / 60000)}분 전`;
  if (diff > 0 && diff < 3600000) return `${Math.floor(diff / 60000)}분 후`;
  if (diff > 0 && diff < 86400000) return `${Math.floor(diff / 3600000)}시간 후`;
  if (diff > 0 && diff < 604800000) return `${Math.floor(diff / 86400000)}일 후`;
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function showToast(msg, type = '') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast${type ? ' ' + type : ''}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function svgIcon(name) {
  const icons = {
    back: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
    plus: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`,
    x: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    sound: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
    repeat: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  };
  return icons[name] || '';
}

/* ─── Modal (Deck) ─── */
const DeckModal = {
  _editingId: null,
  _selectedColor: null,

  _renderSwatches(currentColor) {
    const container = document.getElementById('color-swatches');
    if (!container) return;
    container.innerHTML = PASTEL_PALETTE.map((c) => `
      <button type="button" class="color-swatch${c === currentColor ? ' selected' : ''}"
              style="background:${c}" data-color="${c}" title="${c}"></button>
    `).join('');
    container.querySelectorAll('.color-swatch').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.color-swatch').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this._selectedColor = btn.dataset.color;
      });
    });
    this._selectedColor = currentColor;
  },

  open(deck = null) {
    this._editingId = deck ? deck.id : null;
    document.getElementById('modal-title').textContent = deck ? '덱 수정' : '새 덱 만들기';
    document.getElementById('deck-name-input').value = deck ? deck.name : '';
    document.getElementById('deck-desc-input').value = deck ? (deck.description || '') : '';

    const defaultColor = deck?.color || PASTEL_PALETTE[Storage.getDecks().length % PASTEL_PALETTE.length];
    this._renderSwatches(defaultColor);

    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('open');
    overlay.removeAttribute('aria-hidden');
    setTimeout(() => document.getElementById('deck-name-input').focus(), 50);
  },
  close() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  },
  save() {
    const name = document.getElementById('deck-name-input').value.trim();
    if (!name) { showToast('덱 이름을 입력해주세요.', 'error'); return; }
    const desc = document.getElementById('deck-desc-input').value.trim();
    const color = this._selectedColor || PASTEL_PALETTE[0];
    if (this._editingId) {
      const deck = Storage.getDeck(this._editingId);
      Storage.updateDeck({ ...deck, name, description: desc, color });
      showToast('덱이 수정되었습니다.', 'success');
    } else {
      Storage.addDeck({ id: uid(), name, description: desc, color, createdAt: new Date().toISOString() });
      showToast('새 덱이 만들어졌습니다.', 'success');
    }
    this.close();
    Router.refresh();
  },
};

/* ─── 학습 순서 모달 ─── */
const StudyOrderModal = {
  _deckId: null,
  _mode: 'srs',

  open(deckId, mode = 'srs') {
    this._deckId = deckId;
    this._mode = mode;

    const saved = localStorage.getItem('studyOrder') || 'random';
    document.getElementById('order-random').checked = saved === 'random';
    document.getElementById('order-oldest').checked = saved === 'oldest';

    const titleMap = { srs: '학습 설정', all: '전체 카드 학습', review: '오늘 학습 복습' };
    document.getElementById('study-modal-title').textContent = titleMap[mode] || '학습 설정';

    const overlay = document.getElementById('study-modal-overlay');
    overlay.classList.add('open');
    overlay.removeAttribute('aria-hidden');
  },
  close() {
    const overlay = document.getElementById('study-modal-overlay');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  },
  start() {
    const order = document.querySelector('input[name="study-order"]:checked')?.value || 'random';
    localStorage.setItem('studyOrder', order);
    this.close();
    initStudy(this._deckId, this._mode);
  },
};

/* ─── Menu ─── */
const Menu = {
  toggle() {
    const menu = document.getElementById('dropdown-menu');
    const overlay = document.getElementById('dropdown-overlay');
    const btn = document.getElementById('btn-hamburger');
    const open = menu.classList.toggle('open');
    overlay.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  },
  close() {
    document.getElementById('dropdown-menu').classList.remove('open');
    document.getElementById('dropdown-overlay').classList.remove('open');
    document.getElementById('btn-hamburger').setAttribute('aria-expanded', false);
  },
  exportJSON() {
    const data = { decks: Storage.getDecks(), cards: Storage.getCards(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wordcards-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('내보내기 완료!', 'success');
  },
  importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.decks || !data.cards) throw new Error('올바른 형식이 아닙니다.');
        const existingDecks = Storage.getDecks();
        const existingCards = Storage.getCards();
        const newDecks = data.decks.filter((d) => !existingDecks.find((ed) => ed.id === d.id));
        const newCards = data.cards.filter((c) => !existingCards.find((ec) => ec.id === c.id));
        Storage.saveDecks([...existingDecks, ...newDecks]);
        Storage.saveCards([...existingCards, ...newCards]);
        showToast(`덱 ${newDecks.length}개, 카드 ${newCards.length}개 가져왔습니다.`, 'success');
        Router.refresh();
      } catch (err) {
        showToast('파일을 읽을 수 없습니다: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  },
};

/* ─── Views ─── */

// Home View
function renderHome() {
  const decks = Storage.getDecks();
  const allCards = Storage.getCards();

  const youglishBar = `
    <div class="youglish-bar fade-in">
      <input type="text" id="youglish-input" class="form-input youglish-input"
             placeholder="발음을 찾고 싶은 단어를 입력하세요..."
             autocomplete="off" autocorrect="off" spellcheck="false" />
      <button class="btn-youglish-search" id="btn-youglish-search">
        ${svgIcon('sound')} YouGlish 검색
      </button>
    </div>`;

  if (decks.length === 0) {
    return `
      <div class="view-header">
        <h1 class="view-title">내 덱</h1>
        <button class="btn btn-primary" id="btn-new-deck">${svgIcon('plus')} 새 덱 만들기</button>
      </div>
      ${youglishBar}
      <div class="empty-state fade-in">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-title">아직 덱이 없습니다</div>
        <div class="empty-state-desc">
          단어 덱을 만들고 카드를 추가해<br />
          간격 반복 학습을 시작해보세요!
        </div>
        <button class="btn btn-primary" id="btn-new-deck2">${svgIcon('plus')} 첫 덱 만들기</button>
      </div>`;
  }

  const deckCards = decks.map((deck) => {
    const cards = allCards.filter((c) => c.deckId === deck.id);
    const due = cards.filter((c) => SRS.isDue(c));
    return { deck, total: cards.length, due: due.length };
  });

  return `
    <div class="view-header fade-in">
      <h1 class="view-title">내 덱</h1>
      <button class="btn btn-primary" id="btn-new-deck">${svgIcon('plus')} 새 덱</button>
    </div>
    ${youglishBar}
    <div class="deck-grid fade-in">
      ${deckCards.map(({ deck, total, due }) => `
        <div class="deck-card" data-deck-id="${deck.id}" style="background:${deck.color || '#F3F4F6'}">
          <div class="deck-card-name">${escHtml(deck.name)}</div>
          <div class="deck-card-desc">${escHtml(deck.description || '')}</div>
          <div class="deck-card-stats">
            <span class="stat-badge">총 ${total}장</span>
            ${due > 0 ? `<span class="stat-badge due">오늘 ${due}장</span>` : '<span class="stat-badge">학습 완료</span>'}
          </div>
          <div class="deck-card-actions">
            <button class="btn btn-study btn-study-deck" data-deck-id="${deck.id}" ${due === 0 ? 'disabled' : ''}>
              ${due > 0 ? '학습 시작' : '모두 완료 ✓'}
            </button>
            <button class="btn-edit-deck" data-deck-id="${deck.id}" title="덱 관리">
              ${svgIcon('edit')}
            </button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

// Deck Detail View
function renderDeckDetail(deckId) {
  const deck = Storage.getDeck(deckId);
  if (!deck) return renderHome();
  const cards = Storage.getCardsByDeck(deckId);
  const due = cards.filter((c) => SRS.isDue(c));

  const headerColor = deck.color || '#F3F4F6';

  return `
    <a href="#home" class="back-link fade-in">${svgIcon('back')} 덱 목록</a>
    <div class="deck-detail-header fade-in" style="background:${headerColor}">
      <div class="deck-detail-info">
        <div class="deck-detail-name">${escHtml(deck.name)}</div>
        ${deck.description ? `<div class="deck-detail-desc">${escHtml(deck.description)}</div>` : ''}
      </div>
      <div class="deck-detail-actions">
        <button class="btn btn-ghost btn-sm" id="btn-edit-this-deck">수정</button>
        <button class="btn btn-ghost btn-sm" id="btn-delete-deck">삭제</button>
        <button class="btn btn-ghost btn-sm" id="btn-study-all" ${cards.length === 0 ? 'disabled' : ''} title="SRS 무관하게 전체 카드 학습">
          전체 학습
        </button>
        <button class="btn btn-study" id="btn-start-study" ${due.length === 0 ? 'disabled' : ''}>
          ${due.length > 0 ? `학습 (${due.length}장)` : '오늘 완료 ✓'}
        </button>
      </div>
    </div>
    <div class="card-list-header">
      <span class="card-list-title">카드 ${cards.length}장</span>
      <button class="btn btn-primary" id="btn-add-card-here">${svgIcon('plus')} 카드 추가</button>
    </div>
    <div class="card-list fade-in">
      ${cards.length === 0 ? `
        <div class="empty-state" style="padding:40px 0">
          <div class="empty-state-icon">🃏</div>
          <div class="empty-state-title">카드가 없습니다</div>
          <div class="empty-state-desc">카드를 추가해서 학습을 시작해보세요.</div>
        </div>` :
        cards.map((card) => `
          <div class="card-item" data-card-id="${card.id}" data-deck-id="${deckId}">
            <div class="card-item-front">${escHtml(card.front)}</div>
            <div class="card-item-back">${escHtml(card.back)}</div>
            <div class="card-item-meta">
              <span class="level-badge ${card.level >= 10 ? 'mastered' : ''}">Lv.${card.level}</span>
              <span class="next-review-label">${formatDate(card.nextReview)}</span>
              <button class="btn-delete-card" data-card-id="${card.id}" title="카드 삭제" onclick="event.stopPropagation()">${svgIcon('trash')}</button>
            </div>
          </div>`).join('')
      }
    </div>`;
}

// Card Form View
function renderCardForm(deckId, cardId = null) {
  const deck = Storage.getDeck(deckId);
  if (!deck) { Router.go('#home'); return ''; }
  const card = cardId ? Storage.getCard(cardId) : null;
  const examples = card && card.examples && card.examples.length > 0 ? card.examples : [''];

  return `
    <a href="#deck/${deckId}" class="back-link fade-in">${svgIcon('back')} ${escHtml(deck.name)}</a>
    <div class="form-view fade-in">
      <div class="form-view-title">${card ? '카드 수정' : '새 카드 추가'}</div>
      <div class="form-card">
        <div class="form-group">
          <label class="form-label" for="card-front">단어 (영어) <span class="required">*</span></label>
          <input type="text" id="card-front" class="form-input en" placeholder="예: abandon" value="${escHtml(card ? card.front : '')}" autocomplete="off" autocorrect="off" spellcheck="false" />
        </div>
        <div class="form-group">
          <label class="form-label" for="card-back">뜻 (한국어) <span class="required">*</span></label>
          <input type="text" id="card-back" class="form-input" placeholder="예: 버리다, 포기하다" value="${escHtml(card ? card.back : '')}" />
        </div>
        <div class="examples-group">
          <span class="examples-label">예시 문장 (선택, 최대 3개)</span>
          <div id="examples-list">
            ${examples.map((ex, i) => renderExampleRow(ex, i)).join('')}
          </div>
          ${examples.length < 3 ? `<button class="btn-add-example" id="btn-add-example">${svgIcon('plus')} 예시 추가</button>` : ''}
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="btn-cancel-form">취소</button>
          <button class="btn btn-primary" id="btn-save-card">저장</button>
        </div>
      </div>
    </div>`;
}

function renderExampleRow(value, idx) {
  return `
    <div class="example-row" data-example-idx="${idx}">
      <input type="text" class="form-input example-input" placeholder="예: She abandoned her car and ran." value="${escHtml(value)}" />
      <button class="btn-remove-example" data-example-idx="${idx}" title="삭제">${svgIcon('x')}</button>
    </div>`;
}

// Study View
let studyState = null;

function initStudy(deckId, mode = 'srs') {
  const deck = Storage.getDeck(deckId);
  if (!deck) { Router.go('#home'); return; }

  let cards;
  if (mode === 'all') {
    cards = Storage.getCardsByDeck(deckId);
  } else if (mode === 'review') {
    cards = Storage.getCardsByDeck(deckId).filter((c) => isToday(c.lastReviewed));
    if (cards.length === 0) {
      showToast('오늘 학습한 카드가 없습니다.', 'error');
      return;
    }
  } else {
    cards = Storage.getCardsByDeck(deckId).filter((c) => SRS.isDue(c));
  }

  if (cards.length === 0) {
    Router.go(`#done/${deckId}/0/0/0`);
    return;
  }

  const savedOrder = localStorage.getItem('studyOrder') || 'random';
  const orderedCards = savedOrder === 'oldest'
    ? [...cards].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    : shuffle(cards);

  studyState = {
    deckId,
    mode,
    applyScore: mode === 'srs',
    queue: orderedCards,
    done: 0,
    forgot: 0,
    hard: 0,
    easy: 0,
    totalInitial: orderedCards.length,
    flipped: false,
  };

  Router.currentDeckId = deckId;
  updateQuickAddBtn('study', deckId);
  renderStudyCard();
}

function renderStudyCard() {
  const s = studyState;
  const main = document.getElementById('app-main');
  if (!s || s.queue.length === 0) {
    Router.go(`#done/${s.deckId}/${s.done}/${s.forgot}/${s.hard}`);
    studyState = null;
    return;
  }

  const card = s.queue[0];
  const current = s.done;
  const displayTotal = current + s.queue.length;
  const pct = displayTotal > 0 ? Math.round((current / displayTotal) * 100) : 0;

  const modeBadgeMap = { all: '전체 학습', review: '오늘 복습' };
  const modeBadge = !s.applyScore && modeBadgeMap[s.mode]
    ? `<span class="study-mode-badge">${modeBadgeMap[s.mode]}</span>`
    : '';

  const previewForgot = s.applyScore ? SRS.previewInterval(card, 'forgot') : null;
  const previewHard   = s.applyScore ? SRS.previewInterval(card, 'hard')   : null;
  const previewEasy   = s.applyScore ? SRS.previewInterval(card, 'easy')   : null;

  const deck = Storage.getDeck(s.deckId);
  const deckColor = deck?.color || '';

  main.innerHTML = `
    <div class="study-view fade-in"${deckColor ? ` style="--deck-color:${deckColor}"` : ''}>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:8px;">
        <a href="#deck/${s.deckId}" class="back-link" style="margin-bottom:0">${svgIcon('back')} 종료</a>
        ${modeBadge}
      </div>
      <div class="study-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-text">${current} / ${displayTotal}</div>
      </div>
      <div class="flip-card-container">
        <div class="flip-card" id="flip-card">
          <div class="flip-card-face flip-card-front">
            <div class="card-word">${escHtml(card.front)}</div>
            <div class="card-hint">카드를 탭하거나 버튼을 누르세요</div>
          </div>
          <div class="flip-card-face flip-card-back">
            <div class="card-back-top" style="width:100%">
              <div class="card-meaning">${escHtml(card.back)}</div>
              <div class="card-word-small">${escHtml(card.front)}</div>
            </div>
            ${card.examples && card.examples.filter(Boolean).length > 0 ? `
              <div class="card-examples">
                ${card.examples.filter(Boolean).map((ex) => `
                  <div class="example-item"><span class="example-bullet">▸</span>${escHtml(ex)}</div>
                `).join('')}
              </div>` : ''}
            <a href="https://youglish.com/pronounce/${encodeURIComponent(card.front)}/english"
               target="_blank" rel="noopener noreferrer" class="btn-youglish">
              ${svgIcon('sound')} YouGlish 발음 검색
            </a>
            <div class="rating-buttons">
              <button class="btn-rating btn-forgot" id="btn-forgot">
                몰랐어요
                ${previewForgot ? `<span class="interval-hint">${previewForgot}</span>` : ''}
              </button>
              <button class="btn-rating btn-hard" id="btn-hard">
                애매했어요
                ${previewHard ? `<span class="interval-hint">${previewHard}</span>` : ''}
              </button>
              <button class="btn-rating btn-easy" id="btn-easy">
                잘 알아요
                ${previewEasy ? `<span class="interval-hint">${previewEasy}</span>` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
      <button class="btn-reveal" id="btn-reveal" style="${s.flipped ? 'display:none' : ''}">
        뜻 보기
      </button>
    </div>`;

  bindStudyEvents();
}

function bindStudyEvents() {
  const flipCard = document.getElementById('flip-card');
  const btnReveal = document.getElementById('btn-reveal');

  function reveal() {
    if (studyState.flipped) return;
    studyState.flipped = true;
    flipCard.classList.add('flipped');
    if (btnReveal) btnReveal.style.display = 'none';
  }

  flipCard?.addEventListener('click', reveal);
  btnReveal?.addEventListener('click', reveal);

  function rate(rating) {
    if (!studyState.flipped) { reveal(); return; }
    const s = studyState;
    const card = s.queue.shift();

    if (s.applyScore) {
      const updated = SRS.apply(card, rating);
      Storage.updateCard(updated);
      if (rating === 'forgot') {
        s.queue.push(updated);
        s.forgot++;
      } else if (rating === 'hard') {
        s.queue.splice(Math.min(3, s.queue.length), 0, updated);
        s.hard++;
        s.done++;
      } else {
        s.easy++;
        s.done++;
      }
    } else {
      s.done++;
      if (rating === 'forgot') s.forgot++;
      else if (rating === 'hard') s.hard++;
      else s.easy++;
    }

    s.flipped = false;

    const main = document.getElementById('app-main');
    main.style.opacity = '0';
    main.style.transform = 'translateX(20px)';
    main.style.transition = 'opacity 0.18s, transform 0.18s';
    setTimeout(() => {
      main.style.opacity = '';
      main.style.transform = '';
      main.style.transition = '';
      renderStudyCard();
    }, 180);
  }

  document.getElementById('btn-forgot')?.addEventListener('click', () => rate('forgot'));
  document.getElementById('btn-hard')?.addEventListener('click', () => rate('hard'));
  document.getElementById('btn-easy')?.addEventListener('click', () => rate('easy'));
}

// Done View
function renderDone(deckId, done, forgot, hard) {
  const deck = Storage.getDeck(deckId);
  const deckName = deck ? deck.name : '덱';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowCards = Storage.getCardsByDeck(deckId).filter((c) => {
    if (!c.nextReview) return false;
    const r = new Date(c.nextReview);
    return r >= tomorrow && r < new Date(tomorrow.getTime() + 86400000);
  }).length;

  const todayReviewed = Storage.getCardsByDeck(deckId).filter((c) => isToday(c.lastReviewed)).length;
  const totalCards = Storage.getCardsByDeck(deckId).length;

  return `
    <div class="done-view fade-in">
      <span class="done-emoji">🎉</span>
      <div class="done-title">학습 완료!</div>
      <div class="done-subtitle">${escHtml(deckName)} 학습을 마쳤습니다</div>
      <div class="done-stats">
        <div class="stat-item">
          <span class="stat-num">${parseInt(done) + parseInt(forgot)}</span>
          <div class="stat-label">전체 복습</div>
        </div>
        <div class="stat-item">
          <span class="stat-num">${done}</span>
          <div class="stat-label">완료 카드</div>
        </div>
        <div class="stat-item">
          <span class="stat-num">${forgot}</span>
          <div class="stat-label">다시 볼 카드</div>
        </div>
      </div>
      ${tomorrowCards > 0 ? `
        <div class="done-next">
          내일 학습할 카드: <strong>${tomorrowCards}장</strong>
        </div>` : ''}
      <div class="done-actions">
        <a href="#deck/${deckId}" class="btn btn-ghost">덱으로 돌아가기</a>
        <a href="#home" class="btn btn-primary">홈으로</a>
      </div>
      <div class="done-restudy">
        <div class="done-restudy-label">다시 학습하기</div>
        <div class="done-restudy-btns">
          ${todayReviewed > 0 ? `
            <button class="btn btn-ghost" id="btn-restudy-review">
              ${svgIcon('repeat')} 오늘 학습 복습 (${todayReviewed}장)
            </button>` : ''}
          ${totalCards > 0 ? `
            <button class="btn btn-ghost" id="btn-restudy-all">
              ${svgIcon('repeat')} 전체 카드 학습 (${totalCards}장)
            </button>` : ''}
        </div>
      </div>
    </div>`;
}

function bindDoneEvents(deckId) {
  document.getElementById('btn-restudy-review')?.addEventListener('click', () => {
    initStudy(deckId, 'review');
  });
  document.getElementById('btn-restudy-all')?.addEventListener('click', () => {
    initStudy(deckId, 'all');
  });
}

/* ─── Router ─── */
const Router = {
  currentDeckId: null,

  go(hash) {
    window.location.hash = hash;
  },
  refresh() {
    this.route(window.location.hash);
  },
  route(hash) {
    const main = document.getElementById('app-main');
    const h = hash.replace('#', '');
    const parts = h.split('/');
    const view = parts[0] || 'home';

    updateQuickAddBtn(view, parts[1]);

    if (view === 'home' || view === '') {
      this.currentDeckId = null;
      studyState = null;
      main.innerHTML = renderHome();
      bindHomeEvents();
    } else if (view === 'deck') {
      const deckId = parts[1];
      this.currentDeckId = deckId;
      studyState = null;
      main.innerHTML = renderDeckDetail(deckId);
      bindDeckDetailEvents(deckId);
    } else if (view === 'study') {
      const deckId = parts[1];
      this.currentDeckId = deckId;
      main.innerHTML = '';
      StudyOrderModal.open(deckId, 'srs');
    } else if (view === 'card') {
      const deckId = parts[1];
      const cardId = parts[2] || null;
      this.currentDeckId = deckId;
      studyState = null;
      main.innerHTML = renderCardForm(deckId, cardId);
      bindCardFormEvents(deckId, cardId);
    } else if (view === 'done') {
      const deckId = parts[1];
      const done = parts[2] || 0;
      const forgot = parts[3] || 0;
      const hard = parts[4] || 0;
      this.currentDeckId = deckId;
      studyState = null;
      main.innerHTML = renderDone(deckId, done, forgot, hard);
      bindDoneEvents(deckId);
    } else {
      this.currentDeckId = null;
      studyState = null;
      main.innerHTML = renderHome();
      bindHomeEvents();
    }
  },
};

function updateQuickAddBtn(view, deckId) {
  const btn = document.getElementById('btn-quick-add');
  if (view === 'deck' && deckId) {
    btn.onclick = () => Router.go(`#card/${deckId}`);
    btn.style.display = '';
  } else if (view === 'home' || view === '') {
    btn.onclick = () => DeckModal.open();
    btn.style.display = '';
  } else {
    btn.style.display = 'none';
  }
}

/* ─── Event Bindings ─── */
function bindHomeEvents() {
  document.getElementById('btn-new-deck')?.addEventListener('click', () => DeckModal.open());
  document.getElementById('btn-new-deck2')?.addEventListener('click', () => DeckModal.open());

  document.querySelectorAll('.btn-study-deck').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      StudyOrderModal.open(btn.dataset.deckId, 'srs');
    });
  });

  document.querySelectorAll('.btn-edit-deck').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const deck = Storage.getDeck(btn.dataset.deckId);
      if (deck) DeckModal.open(deck);
    });
  });

  document.querySelectorAll('.deck-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      Router.go(`#deck/${card.dataset.deckId}`);
    });
  });

  // YouGlish 검색바
  function doYouglishSearch() {
    const word = document.getElementById('youglish-input')?.value.trim();
    if (!word) { showToast('단어를 입력해주세요.', 'error'); return; }
    window.open(`https://youglish.com/pronounce/${encodeURIComponent(word)}/english`, '_blank', 'noopener,noreferrer');
  }
  document.getElementById('btn-youglish-search')?.addEventListener('click', doYouglishSearch);
  document.getElementById('youglish-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doYouglishSearch();
  });
}

function bindDeckDetailEvents(deckId) {
  document.getElementById('btn-start-study')?.addEventListener('click', () => {
    StudyOrderModal.open(deckId, 'srs');
  });
  document.getElementById('btn-study-all')?.addEventListener('click', () => {
    StudyOrderModal.open(deckId, 'all');
  });
  document.getElementById('btn-add-card-here')?.addEventListener('click', () => Router.go(`#card/${deckId}`));

  document.getElementById('btn-edit-this-deck')?.addEventListener('click', () => {
    const deck = Storage.getDeck(deckId);
    if (deck) DeckModal.open(deck);
  });

  document.getElementById('btn-delete-deck')?.addEventListener('click', () => {
    const deck = Storage.getDeck(deckId);
    if (!deck) return;
    const cards = Storage.getCardsByDeck(deckId);
    const msg = `"${deck.name}" 덱과 카드 ${cards.length}장을 모두 삭제할까요?`;
    if (confirm(msg)) {
      Storage.deleteDeck(deckId);
      showToast('덱이 삭제되었습니다.');
      Router.go('#home');
    }
  });

  document.querySelectorAll('.card-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-card')) return;
      Router.go(`#card/${item.dataset.deckId}/${item.dataset.cardId}`);
    });
  });

  document.querySelectorAll('.btn-delete-card').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = Storage.getCard(btn.dataset.cardId);
      if (!card) return;
      if (confirm(`"${card.front}" 카드를 삭제할까요?`)) {
        Storage.deleteCard(btn.dataset.cardId);
        showToast('카드가 삭제되었습니다.');
        Router.refresh();
      }
    });
  });
}

function bindCardFormEvents(deckId, cardId) {
  let exampleCount = document.querySelectorAll('.example-row').length;

  document.getElementById('btn-add-example')?.addEventListener('click', () => {
    if (exampleCount >= 3) return;
    const list = document.getElementById('examples-list');
    const div = document.createElement('div');
    div.innerHTML = renderExampleRow('', exampleCount);
    list.appendChild(div.firstElementChild);
    exampleCount++;
    if (exampleCount >= 3) document.getElementById('btn-add-example')?.remove();
    bindRemoveExampleBtns();
  });

  bindRemoveExampleBtns();

  document.getElementById('btn-cancel-form')?.addEventListener('click', () => {
    Router.go(`#deck/${deckId}`);
  });

  document.getElementById('btn-save-card')?.addEventListener('click', () => {
    const front = document.getElementById('card-front').value.trim();
    const back = document.getElementById('card-back').value.trim();
    if (!front) { showToast('단어를 입력해주세요.', 'error'); return; }
    if (!back) { showToast('뜻을 입력해주세요.', 'error'); return; }
    const examples = [...document.querySelectorAll('.example-input')]
      .map((el) => el.value.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (cardId) {
      const existing = Storage.getCard(cardId);
      Storage.updateCard({ ...existing, front, back, examples });
      showToast('카드가 수정되었습니다.', 'success');
    } else {
      Storage.addCard({
        id: uid(), deckId, front, back, examples,
        level: 0,
        nextReview: new Date().toISOString(),
        lastReviewed: null,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      });
      showToast('카드가 추가되었습니다!', 'success');
    }
    Router.go(`#deck/${deckId}`);
  });

  document.getElementById('card-front')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('card-back')?.focus();
  });
}

function bindRemoveExampleBtns() {
  document.querySelectorAll('.btn-remove-example').forEach((btn) => {
    btn.onclick = () => {
      btn.closest('.example-row')?.remove();
      const list = document.getElementById('examples-list');
      const count = list?.querySelectorAll('.example-row').length || 0;
      if (!document.getElementById('btn-add-example') && count < 3) {
        const addBtn = document.createElement('button');
        addBtn.className = 'btn-add-example';
        addBtn.id = 'btn-add-example';
        addBtn.innerHTML = `${svgIcon('plus')} 예시 추가`;
        list?.after(addBtn);
        addBtn.addEventListener('click', () => {
          const currentCount = list?.querySelectorAll('.example-row').length || 0;
          if (currentCount >= 3) return;
          const div = document.createElement('div');
          div.innerHTML = renderExampleRow('', currentCount);
          list?.appendChild(div.firstElementChild);
          if ((list?.querySelectorAll('.example-row').length || 0) >= 3) addBtn.remove();
          bindRemoveExampleBtns();
        });
      }
    };
  });
}

/* ─── XSS protection ─── */
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─── Global Event Listeners ─── */
function initGlobalEvents() {
  // 덱 모달
  document.getElementById('modal-close')?.addEventListener('click', () => DeckModal.close());
  document.getElementById('modal-cancel')?.addEventListener('click', () => DeckModal.close());
  document.getElementById('modal-save')?.addEventListener('click', () => DeckModal.save());
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) DeckModal.close();
  });
  document.getElementById('deck-name-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') DeckModal.save();
  });

  // 학습 순서 모달
  document.getElementById('study-modal-close')?.addEventListener('click', () => StudyOrderModal.close());
  document.getElementById('study-modal-cancel')?.addEventListener('click', () => StudyOrderModal.close());
  document.getElementById('study-modal-start')?.addEventListener('click', () => StudyOrderModal.start());
  document.getElementById('study-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) StudyOrderModal.close();
  });

  // 햄버거 메뉴
  document.getElementById('btn-hamburger')?.addEventListener('click', () => Menu.toggle());
  document.getElementById('dropdown-overlay')?.addEventListener('click', () => Menu.close());

  document.getElementById('menu-export')?.addEventListener('click', () => {
    Menu.close();
    Menu.exportJSON();
  });
  document.getElementById('menu-import')?.addEventListener('click', () => {
    Menu.close();
    document.getElementById('import-file-input')?.click();
  });
  document.getElementById('import-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) Menu.importJSON(file);
    e.target.value = '';
  });

  // 라우터
  window.addEventListener('hashchange', () => {
    Menu.close();
    Router.route(window.location.hash);
  });

  // 빠른 추가 버튼
  document.getElementById('btn-quick-add')?.addEventListener('click', () => {
    if (Router.currentDeckId) {
      Router.go(`#card/${Router.currentDeckId}`);
    } else {
      DeckModal.open();
    }
  });

  // 키보드 단축키
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      DeckModal.close();
      StudyOrderModal.close();
      Menu.close();
    }
    if (studyState && studyState.queue.length > 0) {
      if (e.key === ' ' || e.key === 'Enter') {
        if (!studyState.flipped) document.getElementById('btn-reveal')?.click();
      }
      if (studyState.flipped) {
        if (e.key === '1') document.getElementById('btn-forgot')?.click();
        if (e.key === '2') document.getElementById('btn-hard')?.click();
        if (e.key === '3') document.getElementById('btn-easy')?.click();
      }
    }
  });
}

/* ─── Migration ─── */
function migrateDeckColors() {
  const decks = Storage.getDecks();
  let changed = false;
  decks.forEach((d, i) => {
    if (!d.color) { d.color = PASTEL_PALETTE[i % PASTEL_PALETTE.length]; changed = true; }
  });
  if (changed) Storage.saveDecks(decks);
}

/* ─── Service Worker ─── */
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  }
}

/* ─── Init ─── */
function init() {
  migrateDeckColors();
  initGlobalEvents();
  Router.route(window.location.hash || '#home');
  registerSW();
}

document.addEventListener('DOMContentLoaded', init);
