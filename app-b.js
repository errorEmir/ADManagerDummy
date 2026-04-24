/* =============================================
   FolSec AD Manager — Application Logic (Version B)
   ============================================= */

const App = (() => {
  /* ---- State ---- */
  let state = {
    selectedNodeId:   'folsec-group-create',
    selectedObjectIds: new Set(),
    expandedNodes:    new Set(['root', 'folsec-local', 'folsec-group-create']),
    navHistory:       ['folsec-group-create'],
    navIndex:         0,
    searchTerm:       '',
    sortCol:          'name',
    sortDir:          'asc',
    ctxTarget:        null,
    ctxType:          null,  // 'ou' | 'object'
    modalOpen:        null,  // 'new-user' | 'new-group' | 'new-ou' | 'properties' | 'delete'
    modalData:        {},
    isResizing:       false,
  };

  /* ---- DOM References ---- */
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  /* ---- Helpers ---- */
  function findNode(id, tree) {
    if (tree.id === id) return tree;
    for (const child of (tree.children || [])) {
      const found = findNode(id, child);
      if (found) return found;
    }
    return null;
  }

  function getNodePath(id, tree, path = []) {
    if (tree.id === id) return [...path, tree];
    for (const child of (tree.children || [])) {
      const result = getNodePath(id, child, [...path, tree]);
      if (result) return result;
    }
    return null;
  }

  function getObjects(nodeId) {
    const objs = AD_OBJECTS[nodeId] || [];
    const term = state.searchTerm.toLowerCase();
    let filtered = term
      ? objs.filter(o =>
          o.name.toLowerCase().includes(term) ||
          o.type.toLowerCase().includes(term) ||
          (o.description || '').toLowerCase().includes(term)
        )
      : objs;

    filtered = [...filtered].sort((a, b) => {
      let va = (a[state.sortCol] || '').toLowerCase();
      let vb = (b[state.sortCol] || '').toLowerCase();
      if (va < vb) return state.sortDir === 'asc' ? -1 : 1;
      if (va > vb) return state.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }

  function getObjIconClass(type) {
    if (type === 'Security Group') return 'type-secgroup';
    if (type === 'User') return 'type-user';
    if (type === 'Computer') return 'type-computer';
    return 'type-secgroup';
  }

  function getObjIconName(type) {
    if (type === 'User') return 'user';
    if (type === 'Computer') return 'computer';
    return 'group';
  }

  function getStatusInfo(obj) {
      if (obj.disabled) {
          return { statusText: 'Disabled', statusClass: 'disabled' };
      }
      return { statusText: 'Active', statusClass: 'active' };
  }

  /* =============================================
     RENDER — Tree
     ============================================= */
  function renderTreeNode(node, depth = 0) {
    const isExpanded = state.expandedNodes.has(node.id);
    const isSelected = state.selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const indent = depth * 14 + 6;

    const toggleClass = hasChildren
      ? (isExpanded ? 'tree-toggle open' : 'tree-toggle')
      : 'tree-toggle leaf';

    const toggleIcon = hasChildren ? icon('chevronRight') : '';

    const iconCls = `tree-node-icon icon-${node.icon}`;
    const nodeIcon = icon(node.icon === 'folder-saved' ? 'folder-saved'
                        : node.icon === 'domain'      ? 'domain'
                        : node.icon === 'ou'          ? 'ou'
                        : 'folder');

    let childrenHtml = '';
    if (hasChildren) {
      childrenHtml = `<div class="tree-children ${isExpanded ? 'open' : ''}" data-node-children="${node.id}">
        ${node.children.map(c => renderTreeNode(c, depth + 1)).join('')}
      </div>`;
    }

    return `
      <div class="tree-node" data-node-id="${node.id}">
        <div class="tree-node-row ${isSelected ? 'selected' : ''}"
             style="padding-left:${indent}px"
             data-node-id="${node.id}"
             data-node-type="${node.type}"
             id="tree-row-${node.id}">
          <span class="${toggleClass}" data-toggle="${node.id}">${toggleIcon}</span>
          <span class="${iconCls}">${nodeIcon}</span>
          <span class="tree-node-name ellipsis" title="${node.name}">${node.name}</span>
        </div>
        ${childrenHtml}
      </div>`;
  }

  function renderTree() {
    const treePanel = $('tree-panel');
    // Preserve the collapse button if it exists
    const collapseBtnHtml = `<button id="tree-collapse-btn" title="Paneli daralt" aria-label="Paneli daralt">
          <span id="icon-collapse">${icon('chevronLeft')}</span>
        </button>`;

    treePanel.innerHTML = collapseBtnHtml + renderTreeNode(AD_TREE, 0);
    attachTreeEvents();

    // Reattach collapse event after replacing innerHTML
    const collapseBtn = $('tree-collapse-btn');
    if (collapseBtn) {
       collapseBtn.addEventListener('click', () => {
           treePanel.classList.add('collapsed');
           $('tree-resizer')?.classList.add('tree-hidden');
           $('tree-expand-btn')?.classList.add('visible');
       });
    }
  }

  /* =============================================
     RENDER — Object List
     ============================================= */
  function renderObjects() {
    const objs = getObjects(state.selectedNodeId);
    const list  = $('object-list');
    const count = $('status-count');

    if (objs.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          ${icon('folder')}
          <p>Bu konteynerde nesne bulunmuyor</p>
        </div>`;
      if (count) count.textContent = '0 nesne';
      return;
    }

    list.innerHTML = objs.map(obj => {
      const iconName  = getObjIconName(obj.type);
      const iconClass = getObjIconClass(obj.type);
      const isSelected = state.selectedObjectIds.has(obj.id);
      const { statusText, statusClass } = getStatusInfo(obj);

      let detailsHtml = '';
      if (obj.type === 'User') {
          detailsHtml = `Ad Soyad: ${obj.name}, E-posta: ${obj.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@folsec.local`;
      } else if (obj.type === 'Security Group') {
          detailsHtml = `Kapsam: ${obj.typeDetail || 'Grup'}, Açıklama: ${obj.description || 'Yok'}`;
      } else {
          detailsHtml = obj.description || '—';
      }

      return `
        <div class="obj-row ${isSelected ? 'selected' : ''}"
             data-obj-id="${obj.id}"
             data-obj-type="${obj.type}"
             id="obj-row-${obj.id}"
             draggable="true">
          <div class="obj-icon ${iconClass}">
             ${icon(iconName)}
             <div class="obj-status-dot ${statusClass}" title="${statusText}"></div>
          </div>
          <div class="obj-cell ellipsis" title="${obj.name}">${obj.name}</div>
          <div class="obj-cell type-cell ellipsis">${obj.typeDetail || obj.type}</div>
          <div class="obj-cell desc-cell ellipsis" title="${detailsHtml}">${detailsHtml}</div>
        </div>`;
    }).join('');

    if (count) {
        const users = objs.filter(o => o.type === 'User').length;
        const groups = objs.filter(o => o.type === 'Security Group').length;
        const comps = objs.filter(o => o.type === 'Computer').length;
        count.innerHTML = `Toplam: ${objs.length} <span style="opacity:0.5;margin:0 6px">|</span> Kullanıcı: ${users} <span style="opacity:0.5;margin:0 6px">|</span> Grup: ${groups} <span style="opacity:0.5;margin:0 6px">|</span> Bilgisayar: ${comps}`;
    }
    attachObjectEvents();
    updateSelection();
  }

  /* =============================================
     RENDER — Content Header & Breadcrumb
     ============================================= */
  function renderBreadcrumb() {
    const path = getNodePath(state.selectedNodeId, AD_TREE) || [];
    const bc = $('breadcrumb');
    if(bc) {
        bc.innerHTML = path.map((node, i) => {
          const isLast = i === path.length - 1;
          return `
            ${i > 0 ? `<span class="bc-sep">${icon('chevronRight')}</span>` : ''}
            <span class="bc-item" data-node-id="${node.id}">${node.name}</span>
          `;
        }).join('');

        // Click breadcrumb
        bc.querySelectorAll('.bc-item').forEach(item => {
          item.addEventListener('click', e => {
            const nid = e.currentTarget.dataset.nodeId;
            if (nid !== state.selectedNodeId) navigateTo(nid);
          });
        });
    }

    // Update Content Header Title (Version B feature)
    const node = findNode(state.selectedNodeId, AD_TREE);
    const titleEl = $('ch-title-text');
    if (titleEl && node) {
        titleEl.innerHTML = `<strong>${node.name}</strong>`;
    }
  }

  /* =============================================
     RENDER — Sort Headers
     ============================================= */
  function renderSortHeaders() {
    $$('.th-cell[data-sort]').forEach(th => {
      const col = th.dataset.sort;
      th.classList.toggle('sorted', col === state.sortCol);
      const sortIconEl = th.querySelector('.sort-icon');
      if (sortIconEl) {
        sortIconEl.innerHTML = col === state.sortCol
          ? (state.sortDir === 'asc' ? icon('sortAsc') : icon('sortDesc'))
          : '';
      }
    });
  }

  /* =============================================
     NAVIGATION
     ============================================= */
  function navigateTo(nodeId) {
    if (state.selectedNodeId === nodeId) return;

    // Trim forward history
    state.navHistory = state.navHistory.slice(0, state.navIndex + 1);
    state.navHistory.push(nodeId);
    state.navIndex = state.navHistory.length - 1;

    state.selectedNodeId  = nodeId;
    state.selectedObjectIds.clear();
    state.searchTerm = '';

    // Expand parent nodes
    const path = getNodePath(nodeId, AD_TREE) || [];
    path.forEach(n => {
      if (n.id !== nodeId) state.expandedNodes.add(n.id);
    });
    state.expandedNodes.add(nodeId);

    updateAll();
    updateNavButtons();
  }

  function updateNavButtons() {
    const btnBack    = $('btn-back');
    const btnForward = $('btn-forward');
    const btnUp      = $('btn-up');
    if (btnBack)    btnBack.disabled = state.navIndex <= 0;
    if (btnForward) btnForward.disabled = state.navIndex >= state.navHistory.length - 1;
    if (btnUp) {
      const path = getNodePath(state.selectedNodeId, AD_TREE) || [];
      btnUp.disabled = path.length <= 1;
    }
  }

  /* =============================================
     UPDATE ALL
     ============================================= */
  function updateAll() {
    renderTree();
    renderObjects();
    renderBreadcrumb();
    renderSortHeaders();

    const searchInput = $('tb-search-input');
    if (searchInput) searchInput.value = state.searchTerm;
  }

  /* =============================================
     TREE EVENTS
     ============================================= */
  function attachTreeEvents() {
    $('tree-panel').querySelectorAll('.tree-node-row').forEach(row => {
      row.addEventListener('click', e => {
        e.stopPropagation();
        const nid = row.dataset.nodeId;

        // If clicking toggle
        const toggleBtn = e.target.closest('[data-toggle]');
        if (toggleBtn) {
          const tid = toggleBtn.dataset.toggle;
          if (state.expandedNodes.has(tid)) state.expandedNodes.delete(tid);
          else state.expandedNodes.add(tid);
          renderTree();
          return;
        }

        navigateTo(nid);
      });

      row.addEventListener('contextmenu', e => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, 'ou', row.dataset.nodeId);
      });

      row.addEventListener('dragover', e => {
          e.preventDefault();
          row.classList.add('drag-over');
          e.dataTransfer.dropEffect = 'move';
      });
      row.addEventListener('dragleave', e => {
          row.classList.remove('drag-over');
      });
      row.addEventListener('drop', e => {
          e.preventDefault();
          row.classList.remove('drag-over');
          const targetNodeId = row.dataset.nodeId;
          const data = e.dataTransfer.getData('text/plain');
          if (data) {
             try {
                 const ids = JSON.parse(data);
                 showToast(`${ids.length} nesne ${targetNodeId} hedefine taşındı.`, 'success');
                 state.selectedObjectIds.clear();
                 updateSelection();
             } catch(e) {}
          }
      });
    });
  }

  function updateSelection() {
    $$('.obj-row').forEach(row => {
      const oid = row.dataset.objId;
      row.classList.toggle('selected', state.selectedObjectIds.has(oid));
    });
    const actionBar = $('selection-action-bar');
    const btnUpdate = $('sel-btn-update');
    if (actionBar) {
      const count = state.selectedObjectIds.size;
      if (count > 0) {
        actionBar.style.display = 'flex';
        $('sel-count').textContent = `${count} nesne seçildi`;
        // Çoklu Güncelle: sadece 2+ seçimde görünür
        if (btnUpdate) btnUpdate.style.display = count >= 2 ? 'inline-flex' : 'none';
      } else {
        actionBar.style.display = 'none';
      }
    }
  }

  /* =============================================
     OBJECT EVENTS
     ============================================= */
  function attachObjectEvents() {
    $('object-list').querySelectorAll('.obj-row').forEach(row => {
      row.addEventListener('click', e => {
        const oid = row.dataset.objId;
        if (e.ctrlKey || e.metaKey) {
            if (state.selectedObjectIds.has(oid)) state.selectedObjectIds.delete(oid);
            else state.selectedObjectIds.add(oid);
        } else {
            state.selectedObjectIds.clear();
            state.selectedObjectIds.add(oid);
        }
        updateSelection();
      });

      row.addEventListener('dragstart', e => {
         const oid = row.dataset.objId;
         if (!state.selectedObjectIds.has(oid)) {
            state.selectedObjectIds.clear();
            state.selectedObjectIds.add(oid);
            updateSelection();
         }
         e.dataTransfer.setData('text/plain', JSON.stringify(Array.from(state.selectedObjectIds)));
         e.dataTransfer.effectAllowed = 'move';
         row.style.opacity = '0.5';
      });
      row.addEventListener('dragend', e => {
         row.style.opacity = '1';
      });

      row.addEventListener('dblclick', e => {
        const objId  = row.dataset.objId;
        const objs   = AD_OBJECTS[state.selectedNodeId] || [];
        const obj    = objs.find(o => o.id === objId);
        if (obj) showPropertiesModal(obj);
      });

      row.addEventListener('contextmenu', e => {
        e.preventDefault();
        const oid = row.dataset.objId;
        if (!state.selectedObjectIds.has(oid)) {
            state.selectedObjectIds.clear();
            state.selectedObjectIds.add(oid);
            updateSelection();
        }
        showContextMenu(e.clientX, e.clientY, 'object', oid);
      });
    });
  }

  /* =============================================
     CONTEXT MENU
     ============================================= */
  function showContextMenu(x, y, type, targetId) {
    hideContextMenu();
    state.ctxTarget = targetId;
    state.ctxType   = type;

    const menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.setAttribute('role', 'menu');

    const items = CONTEXT_MENU_ITEMS[type] || [];

    items.forEach(item => {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.className = 'ctx-separator';
        menu.appendChild(sep);
        return;
      }

      const el = document.createElement('div');
      el.className = 'ctx-item';
      el.dataset.action = item.id;

      let submenuEl = null;

      if (item.submenu) {
        submenuEl = document.createElement('div');
        submenuEl.className = 'ctx-submenu';
        submenuEl.innerHTML = item.submenu.map(si => `
          <div class="ctx-item" data-action="${si.id}">
            ${icon(si.icon)}
            <span>${si.label}</span>
          </div>`).join('');
      }

      el.innerHTML = `
        ${icon(item.icon)}
        <span>${item.label}</span>
        ${item.submenu ? `<span class="ctx-arrow">${icon('chevronRight')}</span>` : ''}
      `;

      if (submenuEl) el.appendChild(submenuEl);

      el.addEventListener('click', e => {
        if (!item.submenu) {
          e.stopPropagation();
          handleContextAction(item.id, targetId, type);
          hideContextMenu();
        }
      });

      // JS-driven submenu: show on enter, hide with delay so mouse can travel
      if (submenuEl) {
        let hideTimer = null;

        const showSub  = () => { clearTimeout(hideTimer); submenuEl.classList.add('open'); };
        const startHide = () => { hideTimer = setTimeout(() => submenuEl.classList.remove('open'), 150); };

        el.addEventListener('mouseenter', showSub);
        el.addEventListener('mouseleave', startHide);
        submenuEl.addEventListener('mouseenter', showSub);
        submenuEl.addEventListener('mouseleave', startHide);

        // Submenu item clicks
        submenuEl.querySelectorAll('.ctx-item').forEach(si => {
          si.addEventListener('click', e => {
            e.stopPropagation();
            handleContextAction(si.dataset.action, targetId, type);
            hideContextMenu();
          });
        });
      }

      menu.appendChild(el);
    });

    document.body.appendChild(menu);

    // Position within viewport
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x, top = y;
    if (x + rect.width  > vw) left = vw - rect.width  - 8;
    if (y + rect.height > vh) top  = vh - rect.height - 8;
    menu.style.left = `${left}px`;
    menu.style.top  = `${top}px`;
  }

  function hideContextMenu() {
    const existing = $('context-menu');
    if (existing) existing.remove();
  }

  function handleContextAction(action, targetId, ctx) {
    switch (action) {
      case 'new-user':    openModal('new-user', {parentId: targetId}); break;
      case 'new-group':   openModal('new-group', {parentId: targetId}); break;
      case 'new-ou':      openModal('new-ou', {parentId: targetId}); break;
      case 'properties':
        if (ctx === 'object') {
          const objs = AD_OBJECTS[state.selectedNodeId] || [];
          const obj  = objs.find(o => o.id === targetId);
          if (obj) showPropertiesModal(obj);
        } else {
          const node = findNode(targetId, AD_TREE);
          if (node) showNodePropertiesModal(node);
        }
        break;
      case 'delete':
        if (ctx === 'object') openModal('delete-object', {objId: targetId});
        break;
      case 'find':        openModal('find', {}); break;
      case 'refresh':     showToast('Yenileniyor...', 'info'); setTimeout(() => updateAll(), 400); break;
      default:
        showToast(`"${action}" aksiyonu henüz backend'e bağlanmadı`, 'warn');
    }
  }

  /* =============================================
     MODALS
     ============================================= */
  function openModal(type, data = {}) {
    state.modalOpen = type;
    state.modalData = data;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';

    let content = '';

    if (type === 'new-user') {
      content = `
        <div class="modal-header">
          <span>${icon('user-plus')}</span>
          <h3>Yeni Kullanıcı Oluştur</h3>
          <button class="modal-close" id="modal-close-btn">${icon('close')}</button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label>Ad</label>
            <input type="text" id="f-firstname" placeholder="Örn: Emir" />
          </div>
          <div class="form-field">
            <label>Soyad</label>
            <input type="text" id="f-lastname" placeholder="Örn: Işık" />
          </div>
          <div class="form-field">
            <label>Kullanıcı Adı (UPN)</label>
            <input type="text" id="f-upn" placeholder="emir.isik" />
          </div>
          <div class="form-field">
            <label>Şifre</label>
            <input type="password" id="f-pw" placeholder="••••••••" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel-btn">İptal</button>
          <button class="btn btn-primary" id="modal-ok-btn">Oluştur</button>
        </div>`;
    } else if (type === 'new-group') {
      content = `
        <div class="modal-header">
          <span>${icon('users')}</span>
          <h3>Yeni Güvenlik Grubu</h3>
          <button class="modal-close" id="modal-close-btn">${icon('close')}</button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label>Grup Adı</label>
            <input type="text" id="f-groupname" placeholder="Örn: DEPARTMANLAR_READ" />
          </div>
          <div class="form-field">
            <label>Grup Kapsamı</label>
            <select id="f-groupscope">
              <option value="domain-local">Domain Local</option>
              <option value="global">Global</option>
              <option value="universal">Universal</option>
            </select>
          </div>
          <div class="form-field">
            <label>Grup Türü</label>
            <select id="f-grouptype">
              <option value="security">Security</option>
              <option value="distribution">Distribution</option>
            </select>
          </div>
          <div class="form-field">
            <label>Açıklama</label>
            <input type="text" id="f-desc" placeholder="Opsiyonel açıklama" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel-btn">İptal</button>
          <button class="btn btn-primary" id="modal-ok-btn">Oluştur</button>
        </div>`;
    } else if (type === 'new-ou') {
      content = `
        <div class="modal-header">
          <span>${icon('folder-plus')}</span>
          <h3>Yeni Organizasyon Birimi</h3>
          <button class="modal-close" id="modal-close-btn">${icon('close')}</button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label>OU Adı</label>
            <input type="text" id="f-ouname" placeholder="Örn: Satış_OU" />
          </div>
          <div class="form-field">
            <label>Açıklama</label>
            <input type="text" id="f-oudesc" placeholder="Opsiyonel" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel-btn">İptal</button>
          <button class="btn btn-primary" id="modal-ok-btn">Oluştur</button>
        </div>`;
    } else if (type === 'delete-object') {
      const objs = AD_OBJECTS[state.selectedNodeId] || [];
      const obj  = objs.find(o => o.id === data.objId);
      content = `
        <div class="modal-header">
          <span>${icon('trash-2')}</span>
          <h3>Nesneyi Sil</h3>
          <button class="modal-close" id="modal-close-btn">${icon('close')}</button>
        </div>
        <div class="modal-body">
          <p style="font-size:13px;color:var(--text-primary)">
            <strong>${obj?.name || 'Seçili nesne'}</strong> silinecek. Bu işlem geri alınamaz.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel-btn">İptal</button>
          <button class="btn btn-danger" id="modal-ok-btn">Sil</button>
        </div>`;
    } else if (type === 'find') {
      content = `
        <div class="modal-header">
          <span>${icon('search')}</span>
          <h3>Nesne Ara</h3>
          <button class="modal-close" id="modal-close-btn">${icon('close')}</button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label>Nesne Adı</label>
            <input type="text" id="f-findname" placeholder="Ad ile ara..." />
          </div>
          <div class="form-field">
            <label>Nesne Türü</label>
            <select id="f-findtype">
              <option value="">Tümü</option>
              <option value="user">Kullanıcı</option>
              <option value="group">Güvenlik Grubu</option>
              <option value="computer">Bilgisayar</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel-btn">İptal</button>
          <button class="btn btn-primary" id="modal-ok-btn">Ara</button>
        </div>`;
    }

    overlay.innerHTML = `<div class="modal">${content}</div>`;
    document.body.appendChild(overlay);

    const closeBtn  = $('modal-close-btn');
    const cancelBtn = $('modal-cancel-btn');
    const okBtn     = $('modal-ok-btn');

    const closeModal = () => { overlay.remove(); state.modalOpen = null; };

    if (closeBtn)  closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    if (okBtn) {
      okBtn.addEventListener('click', () => {
        handleModalOk(type, data);
        closeModal();
      });
    }

    // Focus first input
    setTimeout(() => {
      const firstInput = overlay.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 50);
  }

  function handleModalOk(type, data) {
    switch (type) {
      case 'new-user': {
        const fn  = ($('f-firstname')?.value || '').trim();
        const ln  = ($('f-lastname')?.value  || '').trim();
        const upn = ($('f-upn')?.value       || '').trim();
        if (!fn || !upn) { showToast('Ad ve kullanıcı adı zorunludur', 'error'); return; }
        showToast(`Kullanıcı "${upn}" oluşturuldu ✓`, 'success');
        break;
      }
      case 'new-group': {
        const gname = ($('f-groupname')?.value || '').trim();
        if (!gname) { showToast('Grup adı zorunludur', 'error'); return; }
        showToast(`Grup "${gname}" oluşturuldu ✓`, 'success');
        break;
      }
      case 'new-ou': {
        const ouname = ($('f-ouname')?.value || '').trim();
        if (!ouname) { showToast('OU adı zorunludur', 'error'); return; }
        showToast(`Organizasyon birimi "${ouname}" oluşturuldu ✓`, 'success');
        break;
      }
      case 'delete-object': {
        showToast('Nesne silindi', 'success');
        break;
      }
      case 'find': {
        const term = ($('f-findname')?.value || '').trim();
        state.searchTerm = term;
        renderObjects();
        showToast(term ? `"${term}" için sonuçlar filtrelendi` : 'Filtre kaldırıldı', 'info');
        break;
      }
    }
  }

  /* ---- Properties Modal (read-only) ---- */
  function showPropertiesModal(obj) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span>${icon(getObjIconName(obj.type))}</span>
          <h3>${obj.name}</h3>
          <button class="modal-close" id="modal-close-btn">${icon('close')}</button>
        </div>
        <div class="modal-body" style="padding:0">
          <div class="props-grid">
            <div class="props-label">Nesne</div>
            <div class="props-value">${obj.name}</div>
            <div class="props-label">Tür</div>
            <div class="props-value">${obj.typeDetail || obj.type}</div>
            <div class="props-label">Açıklama</div>
            <div class="props-value">${obj.description || '—'}</div>
            <div class="props-label">Container</div>
            <div class="props-value">${state.selectedNodeId}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-close-btn2">Kapat</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    $('modal-close-btn')?.addEventListener('click', close);
    $('modal-close-btn2')?.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  }

  function showNodePropertiesModal(node) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span>${icon(node.icon)}</span>
          <h3>${node.name} — Özellikler</h3>
          <button class="modal-close" id="np-close">${icon('close')}</button>
        </div>
        <div class="modal-body" style="padding:0">
          <div class="props-grid">
            <div class="props-label">Ad</div>
            <div class="props-value">${node.name}</div>
            <div class="props-label">Tür</div>
            <div class="props-value">${node.type}</div>
            <div class="props-label">ID</div>
            <div class="props-value">${node.id}</div>
            <div class="props-label">Nesne Sayısı</div>
            <div class="props-value">${(AD_OBJECTS[node.id] || []).length} nesne</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="np-close2">Kapat</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    $('np-close')?.addEventListener('click', close);
    $('np-close2')?.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  }

  /* =============================================
     TOAST NOTIFICATIONS
     ============================================= */
  function showToast(msg, type = 'success') {
    const container = $('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconName = type === 'error' ? 'warn'
                   : type === 'warn'  ? 'warn'
                   : type === 'info'  ? 'info'
                   : 'check';

    toast.innerHTML = `${icon(iconName)}<span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 300ms';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* =============================================
     TOOLBAR EVENTS
     ============================================= */
  function attachToolbarEvents() {
    $('btn-back')?.addEventListener('click', () => {
      if (state.navIndex > 0) {
        state.navIndex--;
        state.selectedNodeId = state.navHistory[state.navIndex];
        state.selectedObjectId = null;
        updateAll();
        updateNavButtons();
      }
    });

    $('btn-forward')?.addEventListener('click', () => {
      if (state.navIndex < state.navHistory.length - 1) {
        state.navIndex++;
        state.selectedNodeId = state.navHistory[state.navIndex];
        state.selectedObjectId = null;
        updateAll();
        updateNavButtons();
      }
    });

    $('btn-up')?.addEventListener('click', () => {
      const path = getNodePath(state.selectedNodeId, AD_TREE) || [];
      if (path.length >= 2) {
        navigateTo(path[path.length - 2].id);
      }
    });

    $('btn-new-user')?.addEventListener('click',  () => openModal('new-user',  {parentId: state.selectedNodeId}));
    $('btn-new-group')?.addEventListener('click', () => openModal('new-group', {parentId: state.selectedNodeId}));
    $('btn-new-ou')?.addEventListener('click',    () => openModal('new-ou',    {parentId: state.selectedNodeId}));

    $('btn-delete')?.addEventListener('click', () => {
      if (state.selectedObjectId) openModal('delete-object', {objId: state.selectedObjectId});
      else showToast('Silmek için bir nesne seçin', 'warn');
    });

    $('btn-properties')?.addEventListener('click', () => {
      if (state.selectedObjectId) {
        const objs = AD_OBJECTS[state.selectedNodeId] || [];
        const obj  = objs.find(o => o.id === state.selectedObjectId);
        if (obj) showPropertiesModal(obj);
      } else {
        const node = findNode(state.selectedNodeId, AD_TREE);
        if (node) showNodePropertiesModal(node);
      }
    });

    // Search
    const searchInput = $('tb-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.searchTerm = e.target.value;
        state.selectedObjectIds.clear();
        updateSelection();
        renderObjects();
      });
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          state.searchTerm = '';
          searchInput.value = '';
          renderObjects();
        }
      });
    }

    $('btn-bc-search')?.addEventListener('click', () => {
      alert('Gelişmiş arama açılıyor...');
    });
  }

  /* =============================================
     SORT HEADER EVENTS
     ============================================= */
  function attachSortEvents() {
    $$('.th-cell[data-sort]').forEach(th => {
      th.addEventListener('click', e => {
        if (e.target.closest('.th-filter-btn')) {
          e.stopPropagation();
          showToast('Filtreleme menüsü', 'info');
          return;
        }
        const col = th.dataset.sort;
        if (state.sortCol === col) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortCol = col;
          state.sortDir = 'asc';
        }
        renderObjects();
        renderSortHeaders();
      });
    });
  }

  /* =============================================
     RESIZER (Tree panel)
     ============================================= */
  function initResizer() {
    const resizer   = $('tree-resizer');
    const treePanel = $('tree-panel');
    if (!resizer || !treePanel) return;

    let startX, startWidth;

    resizer.addEventListener('mousedown', e => {
      startX     = e.clientX;
      startWidth = treePanel.offsetWidth;
      state.isResizing = true;
      resizer.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', e => {
      if (!state.isResizing) return;
      const diff  = e.clientX - startX;
      const newW  = Math.max(150, Math.min(500, startWidth + diff));
      treePanel.style.width = `${newW}px`;
    });

    document.addEventListener('mouseup', () => {
      if (state.isResizing) {
        state.isResizing = false;
        resizer.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  /* =============================================
     VERSION B - PANEL EVENTS & HEADER ACTIONS
     ============================================= */
  function attachPanelEvents() {
    const treePanel = $('tree-panel');
    const resizer = $('tree-resizer');
    const expandBtn = $('tree-expand-btn');

    // Expand button logic
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        treePanel.classList.remove('collapsed');
        resizer?.classList.remove('tree-hidden');
        expandBtn.classList.remove('visible');
      });
    }

    // Content header utility buttons
    $('ch-btn-refresh')?.addEventListener('click', () => {
       showToast('Yenileniyor...', 'info');
       setTimeout(() => { updateAll(); showToast('Yenilendi ✓', 'success'); }, 400);
    });
    $('ch-btn-export')?.addEventListener('click', () => {
       showToast('Dışa aktarılıyor...', 'success');
    });

    // ---- New Object Panel ----
    const nopPanel = $('new-object-panel');
    const chBtnNew = $('ch-btn-new');
    let nopActiveType = 'user';

    function openNopPanel() {
      // Position panel below the button
      if (chBtnNew) {
        const rect = chBtnNew.getBoundingClientRect();
        nopPanel.style.top = (rect.bottom + 6) + 'px';
        nopPanel.style.right = (window.innerWidth - rect.right) + 'px';
      }
      nopPanel?.classList.add('open');
      setTimeout(() => {
        const activeForm = $(`nop-form-${nopActiveType}`);
        activeForm?.querySelector('input')?.focus();
      }, 50);
    }
    function closeNopPanel() { nopPanel?.classList.remove('open'); }

    chBtnNew?.addEventListener('click', (e) => {
      e.stopPropagation();
      nopPanel?.classList.contains('open') ? closeNopPanel() : openNopPanel();
    });

    // Tab switching
    $$('.nop-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const type = tab.dataset.type;
        nopActiveType = type;
        $$('.nop-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        $$('.nop-form').forEach(f => f.style.display = 'none');
        $(`nop-form-${type}`).style.display = 'flex';
        $(`nop-form-${type}`)?.querySelector('input')?.focus();
      });
    });

    // Cancel / close
    $('nop-cancel')?.addEventListener('click', closeNopPanel);

    // Confirm / submit
    $('nop-confirm')?.addEventListener('click', () => {
      if (nopActiveType === 'user') {
        const fn  = ($('nop-firstname')?.value || '').trim();
        const ln  = ($('nop-lastname')?.value  || '').trim();
        const upn = ($('nop-upn')?.value       || '').trim();
        if (!fn || !upn) { showToast('Ad ve kullanıcı adı zorunludur', 'error'); return; }
        showToast(`Kullanıcı "${fn} ${ln}" oluşturuldu ✓`, 'success');
        // Clear
        ['nop-firstname','nop-lastname','nop-upn','nop-pw','nop-email','nop-user-desc'].forEach(id => { const el = $(id); if(el) el.value = ''; });
      } else if (nopActiveType === 'group') {
        const gname = ($('nop-groupname')?.value || '').trim();
        if (!gname) { showToast('Grup adı zorunludur', 'error'); return; }
        showToast(`Grup "${gname}" oluşturuldu ✓`, 'success');
        ['nop-groupname','nop-group-desc'].forEach(id => { const el = $(id); if(el) el.value = ''; });
      } else if (nopActiveType === 'ou') {
        const ouname = ($('nop-ouname')?.value || '').trim();
        if (!ouname) { showToast('OU adı zorunludur', 'error'); return; }
        showToast(`OU "${ouname}" oluşturuldu ✓`, 'success');
        ['nop-ouname','nop-ou-desc'].forEach(id => { const el = $(id); if(el) el.value = ''; });
      }
      closeNopPanel();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (nopPanel?.classList.contains('open') && !nopPanel.contains(e.target) && e.target !== chBtnNew) {
        closeNopPanel();
      }
    });


    // Global actions
    $('ga-bell')?.addEventListener('click', () => showToast('Okunmamış bildiriminiz yok', 'info'));
    $('ga-settings')?.addEventListener('click', () => showToast('Ayarlar paneli', 'info'));
    $('ga-user')?.addEventListener('click', () => showToast('Kullanıcı hesabı', 'info'));

    // Selection Action Bar Events
    $('sel-btn-move')?.addEventListener('click', () => showToast(`${state.selectedObjectIds.size} nesne için taşıma işlemi başlatılıyor...`, 'info'));
    $('sel-btn-update')?.addEventListener('click', () => showToast(`${state.selectedObjectIds.size} nesne için çoklu güncelleme açılıyor...`, 'info'));
    $('sel-btn-delete')?.addEventListener('click', () => {
       const firstId = Array.from(state.selectedObjectIds)[0];
       if (firstId) openModal('delete-object', {objId: firstId});
    });
  }

  /* =============================================
     GLOBAL EVENTS
     ============================================= */
  function attachGlobalEvents() {
    document.addEventListener('click', e => {
      if (!e.target.closest('#context-menu')) hideContextMenu();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { hideContextMenu(); }
      if (e.key === 'F5')     { e.preventDefault(); updateAll(); showToast('Yenilendi ✓', 'success'); }
      if (e.key === 'Delete' && state.selectedObjectIds.size > 0) {
        const firstId = Array.from(state.selectedObjectIds)[0];
        openModal('delete-object', {objId: firstId});
      }
    });
  }

  /* =============================================
     INIT
     ============================================= */
  function init() {
    updateAll();
    attachToolbarEvents();
    attachSortEvents();
    attachGlobalEvents();
    initResizer();
    attachPanelEvents();
    updateNavButtons();
  }

  return { init, showToast, navigateTo, openModal };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
