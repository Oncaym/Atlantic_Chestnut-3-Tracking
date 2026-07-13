const PROJECT = window.PROJECT || {};  // project data & identity — see project-config.js
/* ============================================================
   ATLANTIC-CHESTNUT BUILDING 3 — Installation Progress Monitor
   Data extracted from: INSTALLED FRAMING UPDATE.pdf (Ground FL)
   ============================================================ */
/* ============================================================
   i18n — ENG / CN / KR
   ============================================================ */
const I18N = {
  en: {
    header_sub: "Monadnock · Ground Floor · Storefront Install & Glass Tracking",
    btn_export: "⬇ Export JSON",
    btn_import: "⬆ Import JSON",
    btn_add_log: "+ Add Daily Log",
    btn_reset: "↻ Reset",
    kpi_installed: "Installed",
    kpi_installed_sub: "Framing units completed",
    kpi_progress: "Ready",
    kpi_progress_sub: "Ready to install",
    kpi_issues: "Issues",
    kpi_issues_sub: "Opening error / rework needed",
    kpi_pending: "Pending",
    kpi_pending_sub: "Not yet installed",
    kpi_louvers: "Louvers Installed",
    kpi_louvers_sub: "Louver installation count",
    kpi_percent: "Overall Progress",
    kpi_percent_sub: "— Overall",
    kpi_percent_sub_dyn: "{installed} / {total} units · Ground FL",
    sec_plan_title: "Floor Plan (from DXF) · Click marker to edit / drag to reposition",
    legend_louver: "Louver",
    legend_facecap: "Face Cap",
    level_gf: "Ground Floor",
    level_l2: "Other Levels",
    tool_edit_pos: "📍 Edit marker position (drag)",
    tool_place: "➕ Add new marker on plan",
    tool_hide_pending: "Hide Pending markers",
    tool_hint: "Click marker to edit status",
    sec_trend: "Daily Installation Trend",
    cat_framing: "Framing",
    cat_glass: "Glass",
    cat_louver: "Louver",
    cat_caulking: "Caulking",
    sec_status_breakdown: "Status Breakdown",
    sec_unit_map: "Unit Status Map · Click unit to update status",
    zone_all: "All",
    zone_sf: "Storefront SF",
    zone_gf: "Ground Floor",
    zone_l2: "Other Levels",
    sec_log: "Daily Installation Log",
    btn_add_entry: "+ Add Entry",
    sec_table: "Unit Detail Table",
    filter_all: "All",
    status_installed: "Installed",
    status_in_progress: "Ready",
    status_issue: "Issue",
    status_issue_long: "Issue / Rework Needed",
    status_pending: "Pending",
    th_unit: "Unit",
    th_type: "Type",
    th_status: "Status",
    th_date: "Date",
    th_note: "Note",
    footer_updated: "Last updated",
    footer_autosave: "Auto-saved in browser",
    modal_edit_unit: "Edit Unit",
    form_status: "Status",
    form_date: "Installation Date",
    form_louver: "Louver Installed?",
    form_facecap: "Face Cap Installed?",
    opt_no: "No",
    opt_yes: "Yes",
    opt_na: "N/A",
    form_note: "Note",
    ph_note: "Notes",
    btn_cancel: "Cancel",
    btn_save: "Save",
    modal_add_log: "Add Daily Log Entry",
    modal_edit_log: "Edit Daily Log Entry",
    btn_delete: "Delete",
    log_click_edit: "Click to edit",
    log_delete: "Delete entry",
    confirm_log_delete: "Delete this log entry?\n\n{content}",
    msg_log_deleted: "Log entry deleted",
    alert_pick_category: "Pick at least one category",
    form_date_only: "Date",
    form_category: "Category",
    cat_framing_long: "Framing Installation",
    cat_glass_long: "Glass Installation",
    cat_louver_long: "Louver Installation",
    cat_issue_note: "Issue / Note",
    form_units_desc: "Units / Description",
    ph_log_content: "e.g. 11A 11B 10A or Caulking",
    ph_log_filter: "Filter: unit / party / ref…",
    toast_saved: "Saved ✓",
    img_alt_gf: "Atlantic-Chestnut Building 3 — Ground Floor Plan",
    msg_pos_saved: "position saved",
    place_cancel: "× Cancel adding",
    place_hint: "Click a location on the plan to choose a unit",
    prompt_place_unit: "Which unit to place at ({x}%, {y}%)?\n\nAvailable: {units}\n\nEnter unit ID:",
    confirm_unit_create: 'Unit "{id}" does not exist. Create it?',
    msg_edit_on: "Edit mode — drag markers to reposition",
    msg_edit_off: "Edit mode off",
    alert_fill_required: "Please fill in date and content",
    msg_exported: "JSON exported",
    alert_invalid_format: "Invalid format",
    alert_json_parse_fail: "JSON parse failed",
    confirm_reset: "Reset to PDF original data? Edits saved in browser will be lost.",
    confirm_reset_cloud: "Refresh from cloud? Your local cache will be cleared and reloaded from the shared cloud data. Cloud data is NOT modified.",
    msg_reset: "Reset complete",
    msg_import_ok: "Import successful",
    badge_planned: "Planned",
    legend_planned: "Planned",
    filter_planned: "Planned",
    no_units_match: "No units match",
    edit_unit_title: "Edit · {id}",
    form_photos: "Site Photos",
    btn_add_photo: "📷 Add Photos",
    photo_hint: "Take / select photos. Auto-compressed (max ~1280px) and saved with this log.",
    photo_processing: "Processing photo…",
    photo_remove_confirm: "Remove this photo?",
    photo_gallery_title: "Site Issue Photos",
    photo_count: "{n} photo(s)",
    photo_open: "View photos",
    badge_photo: "📷",
    no_photos: "No photos attached",
    kpi_detail_title_installed: "Installed Units",
    kpi_detail_title_pending: "Pending Units",
    kpi_detail_title_progress: "Ready Units",
    kpi_detail_title_issues: "Issue Units",
    kpi_detail_title_louvers: "Louver-Installed Units",
    kpi_detail_title_glass: "Glass-Installed Panels",
    kpi_detail_title_percent: "All Units",
    kpi_detail_empty: "Nothing to show.",
    col_unit: "Unit",
    col_zone: "Zone",
    col_type: "Type",
    col_status: "Status",
    col_note: "Note",
    col_date: "Date",
    col_panel: "Panel",
    pie_issue_tooltip_title: "ISSUE units",
    pie_click_hint: "Click to view details",
    btn_close: "Close",
    btn_glass_triage: "🪟 Glass Triage",
    btn_drawings: "📐 Drawings",
    btn_warehouse: "📦 Warehouse",
    drawings_title: "Drawings",
    drawings_empty: "No drawings yet. Click + Add Drawing to attach a OneDrive link.",
    drawing_add: "+ Add Drawing",
    drawing_name_prompt: "Drawing name (e.g. \"Ground Floor Plan A-101\"):",
    drawing_url_prompt: "Paste the OneDrive / web link (make sure it's \"Anyone with the link\"):",
    drawing_remove_confirm: "Remove this drawing from the list?",
    drawing_open: "Open",
    drawing_invalid_url: "URL must start with http:// or https://",
    btn_camera: "📷 Camera",
    btn_album: "🖼 Album",
    btn_edit_log: "✎ Edit log"
  },
  zh: {
    header_sub: "Monadnock · 一层 · 店面安装与玻璃追踪",
    btn_export: "⬇ 导出 JSON",
    btn_import: "⬆ 导入 JSON",
    btn_add_log: "+ 新增日报",
    btn_reset: "↻ 重置",
    kpi_installed: "已安装",
    kpi_installed_sub: "已完成框架单元",
    kpi_progress: "就绪",
    kpi_progress_sub: "准备安装",
    kpi_issues: "问题",
    kpi_issues_sub: "开口误差 / 待返工",
    kpi_pending: "待装",
    kpi_pending_sub: "尚未安装",
    kpi_louvers: "百叶已装",
    kpi_louvers_sub: "百叶安装数",
    kpi_percent: "总进度",
    kpi_percent_sub: "— 总进度",
    kpi_percent_sub_dyn: "{installed} / {total} 单元 · 一层",
    sec_plan_title: "平面图（来自 DXF）· 点击标记编辑 / 拖拽调整位置",
    legend_louver: "百叶",
    legend_facecap: "压条",
    level_gf: "一层",
    level_l2: "其他楼层",
    tool_edit_pos: "📍 编辑标记位置（拖拽）",
    tool_place: "➕ 在平面图上添加标记",
    tool_hide_pending: "隐藏待装标记",
    tool_hint: "点击标记可编辑状态",
    sec_trend: "每日安装趋势",
    cat_framing: "框架",
    cat_glass: "玻璃",
    cat_louver: "百叶",
    cat_caulking: "打胶",
    sec_status_breakdown: "状态分布",
    sec_unit_map: "单元状态图 · 点击单元更新状态",
    zone_all: "全部",
    zone_sf: "店面 SF",
    zone_gf: "一层",
    zone_l2: "其他楼层",
    sec_log: "每日安装日报",
    btn_add_entry: "+ 新增条目",
    sec_table: "单元明细表",
    filter_all: "全部",
    status_installed: "已安装",
    status_in_progress: "就绪",
    status_issue: "问题",
    status_issue_long: "问题 / 需返工",
    status_pending: "待装",
    th_unit: "单元",
    th_type: "类型",
    th_status: "状态",
    th_date: "日期",
    th_note: "备注",
    footer_updated: "最后更新",
    footer_autosave: "数据自动保存到浏览器",
    modal_edit_unit: "编辑单元",
    form_status: "状态",
    form_date: "安装日期",
    form_louver: "已装百叶？",
    form_facecap: "已装压条？",
    opt_no: "否",
    opt_yes: "是",
    opt_na: "不适用",
    form_note: "备注",
    ph_note: "备注内容",
    btn_cancel: "取消",
    btn_save: "保存",
    modal_add_log: "新增日报条目",
    modal_edit_log: "编辑日报条目",
    btn_delete: "删除",
    log_click_edit: "点击编辑",
    log_delete: "删除该条目",
    confirm_log_delete: "确定删除该日报条目?\n\n{content}",
    msg_log_deleted: "已删除日报条目",
    alert_pick_category: "请至少选择一个类别",
    form_date_only: "日期",
    form_category: "类别",
    cat_framing_long: "框架安装",
    cat_glass_long: "玻璃安装",
    cat_louver_long: "百叶安装",
    cat_issue_note: "问题 / 备注",
    form_units_desc: "单元 / 描述",
    ph_log_content: "例如 11A 11B 10A 或 打胶",
    ph_log_filter: "筛选：单元 / 对方 / 编号…",
    toast_saved: "已保存 ✓",
    img_alt_gf: "Atlantic-Chestnut Building 3 — 一层平面图",
    msg_pos_saved: "位置已保存",
    place_cancel: "× 取消添加",
    place_hint: "点击平面图上的位置以选择单元",
    prompt_place_unit: "在 ({x}%, {y}%) 放置哪个单元？\n\n可用: {units}\n\n输入单元 ID:",
    confirm_unit_create: '单元 "{id}" 不存在，是否新建？',
    msg_edit_on: "编辑模式 — 拖拽标记调整位置",
    msg_edit_off: "编辑模式已关闭",
    alert_fill_required: "请填写日期和内容",
    msg_exported: "已导出 JSON",
    alert_invalid_format: "格式不正确",
    alert_json_parse_fail: "JSON 解析失败",
    confirm_reset: "确认恢复为 PDF 原始数据？浏览器中保存的修改会丢失。",
    confirm_reset_cloud: "从云端重新拉取数据？本地缓存将被清除并从云端共享数据重建，云端数据不会被修改。",
    msg_reset: "已重置",
    msg_import_ok: "导入成功",
    badge_planned: "计划",
    legend_planned: "计划",
    filter_planned: "计划",
    no_units_match: "无匹配单元",
    edit_unit_title: "编辑 · {id}",
    form_photos: "现场照片",
    btn_add_photo: "📷 添加照片",
    photo_hint: "支持拍照或本地选择，会自动压缩（最长边约1280px）后随日报一起保存。",
    photo_processing: "正在处理照片…",
    photo_remove_confirm: "移除这张照片?",
    photo_gallery_title: "现场问题照片",
    photo_count: "{n} 张照片",
    photo_open: "查看照片",
    badge_photo: "📷",
    no_photos: "暂无照片",
    kpi_detail_title_installed: "已安装单元",
    kpi_detail_title_pending: "待安装单元",
    kpi_detail_title_progress: "就绪单元",
    kpi_detail_title_issues: "问题单元明细",
    kpi_detail_title_louvers: "已装百叶单元",
    kpi_detail_title_glass: "已装玻璃面板",
    kpi_detail_title_percent: "全部单元",
    kpi_detail_empty: "暂无数据。",
    col_unit: "单元",
    col_zone: "区域",
    col_type: "类型",
    col_status: "状态",
    col_note: "备注",
    col_date: "日期",
    col_panel: "面板",
    pie_issue_tooltip_title: "ISSUE 单元",
    pie_click_hint: "点击查看明细",
    btn_close: "关闭",
    btn_glass_triage: "🪟 玻璃巡检",
    btn_drawings: "📐 图纸",
    btn_warehouse: "📦 仓库",
    drawings_title: "图纸",
    drawings_empty: "暂无图纸。点击 + 添加图纸，把 OneDrive 链接贴进来。",
    drawing_add: "+ 添加图纸",
    drawing_name_prompt: "图纸名称（例如 \"一层平面图 A-101\"）：",
    drawing_url_prompt: "粘贴 OneDrive / 网页链接（请确认分享权限是\"任何拥有链接的人\"）：",
    drawing_remove_confirm: "从列表中移除这张图纸?",
    drawing_open: "打开",
    drawing_invalid_url: "链接必须以 http:// 或 https:// 开头",
    btn_camera: "📷 拍照",
    btn_album: "🖼 相册",
    btn_edit_log: "✎ 编辑日志"
  },
  ko: {
    header_sub: "Monadnock · 지상층 · 스토어프론트 설치 및 유리 추적",
    btn_export: "⬇ JSON 내보내기",
    btn_import: "⬆ JSON 가져오기",
    btn_add_log: "+ 일일 기록 추가",
    btn_reset: "↻ 초기화",
    kpi_installed: "설치 완료",
    kpi_installed_sub: "프레임 설치 완료 유닛",
    kpi_progress: "준비됨",
    kpi_progress_sub: "설치 준비 완료",
    kpi_issues: "문제",
    kpi_issues_sub: "개구부 오차 / 재작업 필요",
    kpi_pending: "대기",
    kpi_pending_sub: "미설치",
    kpi_louvers: "루버 설치",
    kpi_louvers_sub: "루버 설치 수량",
    kpi_percent: "전체 진행률",
    kpi_percent_sub: "— 전체",
    kpi_percent_sub_dyn: "{installed} / {total} 유닛 · 1층",
    sec_plan_title: "평면도 (DXF) · 마커 클릭하여 편집 / 드래그하여 위치 조정",
    legend_louver: "루버",
    legend_facecap: "페이스 캡",
    level_gf: "1층",
    level_l2: "기타 층",
    tool_edit_pos: "📍 마커 위치 편집 (드래그)",
    tool_place: "➕ 평면도에 새 마커 추가",
    tool_hide_pending: "대기 마커 숨기기",
    tool_hint: "마커 클릭하여 상태 편집",
    sec_trend: "일일 설치 추이",
    cat_framing: "프레임",
    cat_glass: "유리",
    cat_louver: "루버",
    cat_caulking: "코킹",
    sec_status_breakdown: "상태 분포",
    sec_unit_map: "유닛 상태 맵 · 유닛 클릭하여 상태 변경",
    zone_all: "전체",
    zone_sf: "스토어프론트 SF",
    zone_gf: "1층",
    zone_l2: "기타 층",
    sec_log: "일일 설치 기록",
    btn_add_entry: "+ 항목 추가",
    sec_table: "유닛 상세 표",
    filter_all: "전체",
    status_installed: "설치 완료",
    status_in_progress: "준비됨",
    status_issue: "문제",
    status_issue_long: "문제 / 재작업 필요",
    status_pending: "대기",
    th_unit: "유닛",
    th_type: "유형",
    th_status: "상태",
    th_date: "날짜",
    th_note: "비고",
    footer_updated: "최종 업데이트",
    footer_autosave: "브라우저에 자동 저장됨",
    modal_edit_unit: "유닛 편집",
    form_status: "상태",
    form_date: "설치 날짜",
    form_louver: "루버 설치됨?",
    form_facecap: "페이스 캡 설치됨?",
    opt_no: "아니오",
    opt_yes: "예",
    opt_na: "해당 없음",
    form_note: "비고",
    ph_note: "비고",
    btn_cancel: "취소",
    btn_save: "저장",
    modal_add_log: "일일 기록 항목 추가",
    modal_edit_log: "일일 기록 항목 편집",
    btn_delete: "삭제",
    log_click_edit: "클릭하여 편집",
    log_delete: "항목 삭제",
    confirm_log_delete: "이 기록 항목을 삭제하시겠습니까?\n\n{content}",
    msg_log_deleted: "기록 항목이 삭제되었습니다",
    alert_pick_category: "카테고리를 하나 이상 선택하세요",
    form_date_only: "날짜",
    form_category: "카테고리",
    cat_framing_long: "프레임 설치",
    cat_glass_long: "유리 설치",
    cat_louver_long: "루버 설치",
    cat_issue_note: "문제 / 메모",
    form_units_desc: "유닛 / 설명",
    ph_log_content: "예: 11A 11B 10A 또는 코킹",
    ph_log_filter: "필터: 유닛 / 상대방 / 번호…",
    toast_saved: "저장됨 ✓",
    img_alt_gf: "Atlantic-Chestnut Building 3 — 지상층 평면도",
    msg_pos_saved: "위치 저장됨",
    place_cancel: "× 추가 취소",
    place_hint: "평면도에서 위치를 클릭하여 유닛 선택",
    prompt_place_unit: "({x}%, {y}%)에 어느 유닛을 배치할까요?\n\n사용 가능: {units}\n\n유닛 ID 입력:",
    confirm_unit_create: '유닛 "{id}"이(가) 없습니다. 새로 만들까요?',
    msg_edit_on: "편집 모드 — 마커를 드래그하여 위치 조정",
    msg_edit_off: "편집 모드 해제",
    alert_fill_required: "날짜와 내용을 입력하세요",
    msg_exported: "JSON 내보내기 완료",
    alert_invalid_format: "형식이 올바르지 않습니다",
    alert_json_parse_fail: "JSON 파싱 실패",
    confirm_reset: "PDF 원본 데이터로 복원하시겠습니까? 브라우저에 저장된 변경 사항이 손실됩니다.",
    confirm_reset_cloud: "클라우드에서 데이터를 다시 가져올까요? 로컬 캐시가 삭제되고 공유 클라우드 데이터로 재구성됩니다. 클라우드 데이터는 변경되지 않습니다.",
    msg_reset: "초기화 완료",
    msg_import_ok: "가져오기 성공",
    badge_planned: "예정",
    legend_planned: "예정",
    filter_planned: "예정",
    no_units_match: "일치하는 유닛 없음",
    edit_unit_title: "편집 · {id}",
    form_photos: "현장 사진",
    btn_add_photo: "📷 사진 추가",
    photo_hint: "촬영 또는 로컬에서 선택, 자동으로 압축되어 일지에 저장됩니다.",
    photo_processing: "사진 처리 중…",
    photo_remove_confirm: "이 사진을 제거하시겠습니까?",
    photo_gallery_title: "현장 문제 사진",
    photo_count: "{n}장",
    photo_open: "사진 보기",
    badge_photo: "📷",
    no_photos: "첨부된 사진 없음",
    kpi_detail_title_installed: "설치 완료 유닛",
    kpi_detail_title_pending: "대기 유닛",
    kpi_detail_title_progress: "준비 유닛",
    kpi_detail_title_issues: "문제 유닛 상세",
    kpi_detail_title_louvers: "루버 설치 유닛",
    kpi_detail_title_glass: "유리 설치 패널",
    kpi_detail_title_percent: "전체 유닛",
    kpi_detail_empty: "데이터 없음.",
    col_unit: "유닛",
    col_zone: "구역",
    col_type: "유형",
    col_status: "상태",
    col_note: "비고",
    col_date: "날짜",
    col_panel: "패널",
    pie_issue_tooltip_title: "ISSUE 유닛",
    pie_click_hint: "클릭하여 상세 보기",
    btn_close: "닫기",
    btn_glass_triage: "🪟 유리 점검",
    btn_drawings: "📐 도면",
    btn_warehouse: "📦 창고",
    drawings_title: "도면",
    drawings_empty: "아직 도면이 없습니다. + 도면 추가를 눌러 OneDrive 링크를 첨부하세요.",
    drawing_add: "+ 도면 추가",
    drawing_name_prompt: "도면 이름 (예: \"1층 평면도 A-101\"):",
    drawing_url_prompt: "OneDrive / 웹 링크를 붙여넣으세요 (공유 설정이 \"링크가 있는 모든 사람\"인지 확인):",
    drawing_remove_confirm: "이 도면을 목록에서 제거하시겠습니까?",
    drawing_open: "열기",
    drawing_invalid_url: "링크는 http:// 또는 https://로 시작해야 합니다",
    btn_camera: "📷 카메라",
    btn_album: "🖼 앨범",
    btn_edit_log: "✎ 일지 편집"
  }
};
const WEEKDAYS = {
  en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  zh: ['周日','周一','周二','周三','周四','周五','周六'],
  ko: ['일','월','화','수','목','금','토']
};
let currentLang = localStorage.getItem(PROJECT.langKey || 'tracker_lang') || 'en';
function t(key) {
  const po = (PROJECT.i18n || {})[currentLang] || {};
  if (po[key]) return po[key];
  const dict = I18N[currentLang] || I18N.en;
  return dict[key] || I18N.en[key] || key;
}
let _appReady = false;  // set true after state/render functions are initialized below
function applyLang(lang) {
  if (!I18N[lang]) lang = 'en';
  currentLang = lang;
  localStorage.setItem(PROJECT.langKey || 'tracker_lang', lang);
  document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : lang === 'ko' ? 'ko' : 'en');
  // Translate static elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
  });
  // Update switcher button state
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  // Re-render dynamic parts that depend on language — only after `state` is defined.
  // The initial call from _initLang() happens before `state` exists (let TDZ), so we
  // skip render() then; the boot `render()` at the bottom of the script handles it.
  { const _mm=document.getElementById('modulesModal'); if(_mm) _mm.remove(); }
  if (_appReady && typeof render === 'function') render();
}
function _initLang() {
  document.querySelectorAll('.lang-btn').forEach(b => {
    if (b.__langBound) return;
    b.__langBound = true;
    b.addEventListener('click', () => applyLang(b.dataset.lang));
  });
  applyLang(currentLang);
}
// The artifact bundler uses document.documentElement.replaceWith() after
// DOMContentLoaded fires on the outer document, so by the time this inline
// script runs the DOM is already complete. Initialize immediately, and also
// queue a microtask retry in case render() defines elements lazily.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initLang);
} else {
  _initLang();
}


const STORAGE_KEY = PROJECT.storageKey || 'tracker_install_v1';
// Tracks which embedded.updatedAt the local state was derived from. If the
// HTML file is replaced (newer embedded snapshot), the stored baseline no
// longer matches and we drop localStorage to honor the freshly shared data.
const BASELINE_KEY = PROJECT.baselineKey || (STORAGE_KEY + '_baseline');
const YEAR = new Date().getFullYear(); // assumed log year

const TODAY_ISO = new Date().toISOString().slice(0,10);
function isPlanned(item) { return !!(item && item.date && item.date > TODAY_ISO); }
// Doors are identified by an SD-prefixed id (all SD* units are doors),
// or an explicit type === 'Door'. Storefront = everything else.
const _DOOR_PATTERNS = (PROJECT.doorPatterns || ['^SD']).map(p => new RegExp(p, 'i'));
function isDoor(u) { return !!u && (u.type === 'Door' || /door/i.test(u.type || '') || _DOOR_PATTERNS.some(rx => rx.test(u.id || ''))); }
let doorMode = false;  // when true, floor plan shows only doors (hides storefront)

// Seed data extracted from PDF — Ground Floor + Level 2 units
// Source: "GLASS and Louver Locations on plans.pdf"
const SEED_UNITS = PROJECT.seedUnits || [];
const SEED_LOG = PROJECT.seedLog || [];
const DEFAULT_POSITIONS = PROJECT.defaultPositions || {};
const _UNUSED_CP2_POSITIONS = {
  'SF06N': { x: 86.07, y: 8.26 },
  'SF04__1': { x: 81.27, y: 8.03 },
  'SF04__2': { x: 75.58, y: 8.03 },
  'SF07N': { x: 70.20, y: 8.01 },
  'SF07W': { x: 67.97, y: 10.41 },
  'SF01__1': { x: 67.80, y: 16.03 },
  'SF01__2': { x: 67.80, y: 22.84 },
  'SF20A__1': { x: 66.34, y: 45.70 },
  'SF20A__2': { x: 62.83, y: 45.70 },
  'SF20B__1': { x: 58.90, y: 45.70 },
  'SF20A__3': { x: 54.83, y: 45.70 },
  'SF20B__2': { x: 50.91, y: 45.70 },
  'SF20A__4': { x: 46.90, y: 45.70 },
  'SF52': { x: 43.80, y: 48.85 },
  'SF51__1': { x: 42.29, y: 50.74 },
  'SF50__1': { x: 38.89, y: 50.74 },
  'SF51__2': { x: 35.17, y: 50.74 },
  'SF50__2': { x: 31.76, y: 50.74 },
  'SF21A': { x: 29.82, y: 43.68 },
  'SF21B__1': { x: 29.84, y: 37.64 },
  'SF21B__2': { x: 29.84, y: 30.60 },
  'SF21B__3': { x: 29.84, y: 23.82 },
  'SF32': { x: 29.84, y: 15.65 },
  'SF08E': { x: 30.08, y: 10.33 },
  'SF08N': { x: 28.00, y: 8.00 },
  'SF03__1': { x: 22.60, y: 8.02 },
  'SF03__2': { x: 17.27, y: 8.02 },
  'SF03__3': { x: 11.98, y: 8.02 },
  'SF09N': { x: 6.56, y: 8.02 },
  'SF09W': { x: 4.57, y: 10.10 },
  'SF02': { x: 4.22, y: 16.30 },
  'SF22B': { x: 4.18, y: 23.57 },
  'SF40': { x: 3.70, y: 76.11 },
  'SF41': { x: 6.49, y: 84.53 },
  'SF42': { x: 11.99, y: 84.53 },
  'SF43': { x: 15.71, y: 84.53 },
  'SF44': { x: 18.84, y: 84.53 },
  'SF45': { x: 24.60, y: 84.53 },
  'SF46': { x: 30.52, y: 84.53 },
  'SF48': { x: 38.34, y: 84.53 },
  'SF20A__5': { x: 42.23, y: 88.00 },
  'SF20A__6': { x: 46.47, y: 88.00 },
  'SF10A': { x: 50.70, y: 88.00 },
  'SF30': { x: 55.64, y: 88.00 },
  'SF11A__1': { x: 59.23, y: 88.00 },
  'SF11A__2': { x: 63.35, y: 88.00 },
  'SF11A__3': { x: 67.45, y: 88.00 },
  'SF11B': { x: 71.66, y: 88.00 },
  'SF11A__4': { x: 75.88, y: 88.00 },
  'SF11A__5': { x: 80.23, y: 88.00 },
  'SF31__1': { x: 85.33, y: 87.87 },
  'SF17S': { x: 90.69, y: 87.79 },
  'SF47': { x: 36.12, y: 84.53 },
  'SF13A': { x: 92.27, y: 66.58 },
  'SF12B': { x: 92.28, y: 61.00 },
  'SF12A__1': { x: 92.27, y: 54.60 },
  'SF12A__2': { x: 92.27, y: 47.94 },
  'SF12A__3': { x: 92.27, y: 41.62 },
  'SF16E': { x: 92.27, y: 36.10 },
  'SF16N': { x: 90.49, y: 33.66 },
  'SF31__2': { x: 87.78, y: 31.47 },
  'SF01__3': { x: 87.78, y: 24.69 },
  'SF01__4': { x: 87.78, y: 17.41 },
  'SF06E': { x: 87.78, y: 10.87 },
  'SF17E': { x: 96.30, y: 86.27 },
  'SF12A__4': { x: 96.29, y: 80.82 },
  'SF12A__5': { x: 96.29, y: 74.42 },
  'SF15E': { x: 96.29, y: 69.12 },
  'SF15N': { x: 94.24, y: 66.55 },

  // ---- Level 2 (auto-imported from DXF: 2nd & 13th FL partial plan) ----
  'SF60': { x: 10.05, y: 75.74 },
  'SF61': { x: 19.04, y: 75.74 },
  'SF62__1': { x: 10.97, y: 19.91 },
  'SF62__2': { x: 22.59, y: 19.98 },
  'SF63__1': { x: 16.3, y: 19.98 },
  'SF63__2': { x: 27.03, y: 19.98 },
  'SF70__1': { x: 63.76, y: 61.65 },
  'SF70__2': { x: 71.99, y: 61.65 },
  'SF70__3': { x: 85.08, y: 61.65 },
  'SF71__1': { x: 66.85, y: 61.65 },
  'SF71__2': { x: 77.87, y: 61.65 },
};

// FIX: defer loadState() until after DOMContentLoaded. The <script id="__embedded_state">
// tag lives AT THE END OF <body>, AFTER this main <script>. If we call loadState()
// here, document.getElementById('__embedded_state') returns null (the slot isn't
// parsed yet) and we silently fall back to SEED_UNITS — making the dashboard show
// the original PDF baseline instead of the team-shared snapshot baked into the file.
let state = null;
let currentZone = 'all';

// ---- Floors: data-driven from PROJECT.floors (falls back to Ground Floor + Level 2) ----
const HAS_CUSTOM_FLOORS = !!(window.PROJECT && PROJECT.floors && PROJECT.floors.length);
function getFloors(){
  if (HAS_CUSTOM_FLOORS) return PROJECT.floors;
  return [
    { key:'GF', name:{ en:'Ground Floor', zh:'一层 / Ground Floor', ko:'지상층' } },
    { key:'L2', name:{ en:'Level 2', zh:'二层 / Level 2', ko:'2층' }, img:(typeof PLAN_L2_SRC!=='undefined'?PLAN_L2_SRC:null) }
  ];
}
function firstFloorKey(){ return getFloors()[0].key; }
function floorLabel(f){ return (f.name && (f.name[currentLang]||f.name.en||f.name.zh)) || f.key; }
function _escFloor(x){ return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
// Rebuild the level-button bar + floor tabs from PROJECT.floors. No-op on legacy
// GF/L2 projects so their hand-written markup (and om-ids) stay byte-identical.
function renderFloorControls(){
  if (!HAS_CUSTOM_FLOORS) return;
  const floors = getFloors();
  const anyBtn = document.querySelector('.plan-toolbar .level-btn');
  if (anyBtn && anyBtn.parentElement){
    anyBtn.parentElement.innerHTML = floors.map(f =>
      `<button class="level-btn${f.key===currentLevel?' active':''}" data-level="${_escFloor(f.key)}" onclick="setLevel('${_escFloor(f.key)}')">${_escFloor(floorLabel(f))}</button>`
    ).join('');
  }
  const tabs = document.getElementById('zoneTabs');
  if (tabs){
    const allTab = `<div class="tab${currentZone==='all'?' active':''}" data-zone="all"><span>${t('zone_all')}</span> (<span id="cnt-all">0</span>)</div>`;
    tabs.innerHTML = allTab + floors.map(f =>
      `<div class="tab${currentZone===f.key?' active':''}" data-zone="${_escFloor(f.key)}"><span>${_escFloor(floorLabel(f))}</span> (<span id="cnt-${_escFloor(f.key)}">0</span>)</div>`
    ).join('');
  }
}
let currentFilter = 'all';
let currentLevel = (window.PROJECT && PROJECT.floors && PROJECT.floors.length) ? PROJECT.floors[0].key : 'GF';   // which floor's markers to render on the plan
let trendChart, donutChart;
let editingUnitId = null;

function loadState() {
  // Embedded baseline — fetched from state.json at boot (see bootstrap() at
  // the bottom of this file). Fallback: the inline <script id="__embedded_state">
  // tag (kept for back-compat with legacy "Save to HTML" snapshots).
  let embedded = null;
  if (window._embeddedStateJson && window._embeddedStateJson.units && window._embeddedStateJson.log) {
    embedded = window._embeddedStateJson;
  } else {
    try {
      const el = document.getElementById('__embedded_state');
      if (el && el.textContent.trim()) {
        const parsed = JSON.parse(el.textContent);
        if (parsed && parsed.units && parsed.log) embedded = parsed;
      }
    } catch (e) { console.warn('Embedded state parse failed', e); }
  }

  let local = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) local = JSON.parse(raw);
  } catch (e) {}

  // ----- Baseline check -----
  // localStorage is only valid if it was created on top of THIS exact embedded
  // snapshot. We store the embedded.updatedAt the local state was derived from
  // in BASELINE_KEY. If it differs from the current embedded.updatedAt, the
  // HTML file has been re-uploaded by a teammate and we MUST discard the
  // stale local copy — otherwise localStorage from the previous version of
  // the file shadows the new shared data (e.g. 19 installed instead of 29).
  const embeddedStamp = embedded ? (embedded.updatedAt || '') : '';
  let baseline = null;
  try { baseline = localStorage.getItem(BASELINE_KEY); } catch (e) {}

  let s = null;
  let staleDiscarded = false;
  if (embedded && local && baseline && baseline === embeddedStamp) {
    // local is a continuation of the current embedded snapshot — preserve
    // the user's in-flight edits since they downloaded this file.
    s = local;
  } else if (embedded) {
    // No local, or local was based on a different (older) version of the
    // file. Use embedded as the source of truth.
    s = embedded;
    if (local && baseline !== embeddedStamp) {
      staleDiscarded = true;
      // FIX: actually drop the stale local copy. Previously we only updated
      // BASELINE_KEY, which silently 'blessed' the old localStorage so the
      // very next load would happily use it again (the bug that made the
      // dashboard show SEED data even though embedded was correct).
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
    try { localStorage.setItem(BASELINE_KEY, embeddedStamp); } catch (e) {}
  } else if (local) {
    s = local;
  }
  if (staleDiscarded) {
    console.log('AC3: discarded stale localStorage — HTML file was updated externally');
    // Surface a one-time toast so the user understands why their cached view changed.
    setTimeout(() => { try { toast('Loaded latest snapshot from HTML / 已加载最新共享数据'); } catch(e){} }, 50);
  }

  if (s) {
      if (!s.log) s.log = [];
      if (!s.positions) s.positions = {};
      mergeSeedUnits(s);
      return s;
  }
  return {
    units: structuredClone(SEED_UNITS),
    log: structuredClone(SEED_LOG),
    positions: structuredClone(DEFAULT_POSITIONS),
    glassPanelOffsets: {},
    updatedAt: new Date().toISOString()
  };
}

/* Merge any new SEED_UNITS into an existing state object (in-place).
   Called from loadState() and _cloudApplyRemoteState() so Firebase sync
   never silently drops newly-added seed units (e.g. Level 2 markers). */
function mergeSeedUnits(s) {
      // ensure positions exist (migration for older state)
      if (!s.positions) s.positions = structuredClone(DEFAULT_POSITIONS);
      if (!s.glassPanelOffsets) s.glassPanelOffsets = {};
      // ----- merge any new seed units the user does not yet have -----
      // Preserves user edits to existing units; only adds new IDs.
      const existing = new Set(s.units.map(u => u.key || u.id));
      let added = 0;
      SEED_UNITS.forEach(seed => {
        if (!existing.has(seed.key)) {
          s.units.push(structuredClone(seed));
          if (!s.positions[seed.key] && DEFAULT_POSITIONS[seed.key]) {
            s.positions[seed.key] = { ...DEFAULT_POSITIONS[seed.key] };
          }
          added++;
        }
      });
      // backfill missing `key` on legacy units (use id as key)
      s.units.forEach(u => { if (!u.key) u.key = u.id; });
      // backfill missing `level` (default GF)
      s.units.forEach(u => { if (!u.level) u.level = 'GF'; });
      // backfill glass + panels from SEED_UNITS
      s.units.forEach(u => {
        const seed = SEED_UNITS.find(x => x.key === u.key);
        if (seed) {
          if (!u.glass)  u.glass  = seed.glass  || '';
          if (!u.panels) u.panels = seed.panels || '';
          if (u.facecap === undefined) u.facecap = seed.facecap || 'na';
        }
      });
      // backfill facecap on units with no matching seed (e.g. manually-added
      // markers like split units or extra doors) so older saved state doesn't
      // break the edit form / plan badge.
      s.units.forEach(u => { if (u.facecap === undefined) u.facecap = 'na'; });
      // Sync `zone` (wall direction) from SEED_UNITS — zone is layout metadata,
      // not a user-edited field, so force-update it to match the latest seed.
      // This lets us fix marker fan-out direction without a Reset.
      s.units.forEach(u => {
        const seed = SEED_UNITS.find(x => x.key === u.key);
        if (seed && seed.zone) u.zone = seed.zone;
      });
      if (added > 0) {
        s._mergeNote = `+${added} new units from PDF`;
      }
}

function saveState(showToast = true, description) {
  // Don't echo a save that was triggered by applying a remote snapshot —
  // otherwise two clients ping-pong updates back and forth forever.
  const isRemoteApply = window._cloudIsSuppressed && window._cloudIsSuppressed();

  state.updatedAt = new Date().toISOString();
  // localStorage can overflow (~5MB) when legacy log entries still carry
  // base64 photos. NEVER let that abort the save — cloud push below is the
  // real persistence. Fallback: cache a slim copy without embedded photos.
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    try {
      const slim = JSON.parse(JSON.stringify(state));
      (slim.log || []).forEach(l => {
        if (l && Array.isArray(l.photos)) {
          l.photos = l.photos.filter(p => !String(p).startsWith('data:'));
          if (!l.photos.length) delete l.photos;
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      console.warn('AC3: state too big for localStorage — cached without embedded photos');
    } catch (e2) {
      console.warn('AC3: localStorage cache skipped (quota) — cloud sync still active', e2);
    }
  }
  // mark "unsaved-to-file" so the Save to HTML button can pulse
  markDirty();
  render();
  if (showToast && !isRemoteApply) toast(t('toast_saved'));

  // ---- CLOUD SYNC: push to Firebase Realtime DB (debounced ~350ms) ----
  if (!isRemoteApply && window._cloudQueuePush) {
    window._cloudQueuePush(state, description);
  }
}

/* Called by cloud-sync.js when another client pushes a state update.
   Replaces local state with the remote snapshot and re-renders WITHOUT
   pushing back to the cloud (the suppress flag is set by the caller). */
window._cloudApplyRemoteState = function(remoteState, meta) {
  if (!remoteState || !remoteState.units) return;
  if (window._cloudSetSuppress) window._cloudSetSuppress(true);
  let _needSeedSync = false;
  try {
    // Ensure core arrays exist (Firebase may strip large fields like log)
    if (!Array.isArray(remoteState.log)) remoteState.log = Object.values(remoteState.log || {});
    if (!remoteState.positions) remoteState.positions = {};

    mergeSeedUnits(remoteState);

    // If new seed units were added, push them back to Firebase after this
    // function completes so Firebase "learns" about them and stops re-triggering.
    if (remoteState._mergeNote) { _needSeedSync = true; delete remoteState._mergeNote; }

    // Preserve photos from local state — base64 images often exceed Firebase node
    // size limits and get silently stripped. We match log entries by date+content
    // and copy local photos back so they survive a remote-state overwrite.
    if (state && Array.isArray(state.log) && Array.isArray(remoteState.log)) {
      const localPhotos = {};
      state.log.forEach(l => {
        if (l.photos && l.photos.length) {
          localPhotos[(l.date || '') + '||' + (l.content || '').slice(0, 40)] = l.photos;
        }
      });
      remoteState.log.forEach(l => {
        const key = (l.date || '') + '||' + (l.content || '').slice(0, 40);
        if (!l.photos && localPhotos[key]) l.photos = localPhotos[key];
      });
    }

    state = remoteState;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {
      try {
        const slim = JSON.parse(JSON.stringify(state));
        (slim.log || []).forEach(l => {
          if (l && Array.isArray(l.photos)) {
            l.photos = l.photos.filter(p => !String(p).startsWith('data:'));
            if (!l.photos.length) delete l.photos;
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      } catch(e2) {}
    }
    if (typeof render === 'function') render();
    if (typeof toast === 'function' && meta && meta.by) {
      const who = String(meta.by).split('@')[0];
      const what = meta.desc ? ` · ${meta.desc}` : '';
      toast(`↻ Updated by ${who}${what}`);
    }
  } finally {
    if (window._cloudSetSuppress) window._cloudSetSuppress(false);
  }
  // One-time push: teach Firebase about newly merged seed units so the merge
  // doesn't keep re-running on every Firebase update.
  if (_needSeedSync && window._cloudQueuePush) {
    setTimeout(() => window._cloudQueuePush(state, 'seed-sync'), 800);
  }
};

/* -------- Embed-in-HTML save (team-shared workflow) -------- */
let isDirty = false;
let htmlFileHandle = null;     // FileSystemFileHandle for the HTML file itself
const supportsFSA = typeof window.showSaveFilePicker === 'function';

function markDirty() {
  isDirty = true;
  updateSaveBtnState();
}
function clearDirty() {
  isDirty = false;
  updateSaveBtnState();
}
function updateSaveBtnState() {
  const btns = document.querySelectorAll('button[onclick="saveToHTML()"]');
  btns.forEach(b => {
    if (isDirty) {
      b.style.boxShadow = '0 0 0 2px var(--orange)';
      b.title = htmlFileHandle
        ? `有未保存修改 — 点击写入 ${htmlFileHandle.name}\nUnsaved changes — click to save in place`
        : '有未保存到 HTML 的修改 — 点击保存\nUnsaved changes — click to save';
    } else {
      b.style.boxShadow = '';
      b.title = htmlFileHandle
        ? `已链接到 ${htmlFileHandle.name} — 修改后会直接覆盖该文件\nLinked to ${htmlFileHandle.name} — saves overwrite in place`
        : '点击保存(首次会让你选中并授权这个 HTML 文件,之后静默覆盖)\nFirst save links the HTML file; later saves overwrite silently';
    }
  });
}

async function ensurePerm(handle) {
  if (!handle.queryPermission) return true;
  let p = await handle.queryPermission({ mode: 'readwrite' });
  if (p === 'granted') return true;
  p = await handle.requestPermission({ mode: 'readwrite' });
  return p === 'granted';
}

function buildHTMLString() {
  const slot = document.getElementById('__embedded_state');
  if (!slot) throw new Error('Missing embedded slot');
  state.updatedAt = new Date().toISOString();
  // Escape end-script tags inside JSON so they can't break the parser.
  // Concat literal so this source line doesn't terminate the live <script>.
  const endTagRe = new RegExp('<' + '/script', 'gi');
  const json = JSON.stringify(state).replace(endTagRe, '<\\/script');
  slot.textContent = json;
  return '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
}

async function saveToHTML() {
  const html = buildHTMLString();

  // ---- Path A: in-place overwrite via File System Access API ----
  if (supportsFSA) {
    try {
      if (!htmlFileHandle) {
        // First save: ask the user to point to this HTML file on disk.
        const guess = decodeURIComponent(location.pathname.split('/').pop() || '')
          .replace(/\.html?$/i, '') + '.html';
        htmlFileHandle = await window.showSaveFilePicker({
          suggestedName: guess || 'Installation_Progress_Monitor.html',
          types: [{ description: 'HTML', accept: { 'text/html': ['.html', '.htm'] } }]
        });
      }
      const ok = await ensurePerm(htmlFileHandle);
      if (!ok) { toast('需要写入权限 / Write permission required'); return; }
      const w = await htmlFileHandle.createWritable();
      await w.write(html);
      await w.close();
      // local state is now in sync with the just-written embedded snapshot —
      // align the baseline so a page reload doesn't think it's stale.
      try { localStorage.setItem(BASELINE_KEY, state.updatedAt); } catch(e) {}
      clearDirty();
      updateSaveBtnState();
      toast(`已保存到 / Saved: ${htmlFileHandle.name}`);
      return;
    } catch(err) {
      if (err && err.name === 'AbortError') return; // user cancelled
      console.warn('FSA save failed, falling back to download', err);
      htmlFileHandle = null;
      // fall through to download fallback
    }
  }

  // ---- Path B: fallback download (Safari / Firefox) ----
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fname = decodeURIComponent(location.pathname.split('/').pop() || 'Installation_Progress_Monitor.html')
    .replace(/\.html?$/i, '') + '.html';
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  // local state is now in sync with the just-built embedded snapshot — align
  // the baseline so reopening the downloaded file doesn't drop the user's view.
  try { localStorage.setItem(BASELINE_KEY, state.updatedAt); } catch(e) {}
  clearDirty();
  toast('已下载更新的 HTML — 替换团队共享文件 / Updated HTML downloaded');
}

// Cloud sync handles all persistence — no need to warn about unsaved local changes.
// (beforeunload removed; isDirty is still tracked harmlessly for any code that reads it)

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._tm);
  toast._tm = setTimeout(()=>t.classList.remove('show'), 1800);
}

/* -------- Render -------- */
function render() {
  renderFloorControls();
  renderKPIs();
  renderPlan();
  renderUnitGrid();
  renderTable();
  renderTimeline();
  renderCharts();
  renderGlassChart();
  document.getElementById('lastUpdated').textContent = new Date(state.updatedAt).toLocaleString();
  if (typeof window.__afterScopeRender === 'function') { try { window.__afterScopeRender(); } catch(e){} }
}

/* ---- Floor Plan rendering ---- */
function renderPlan() {
  const wrap = document.getElementById('planWrap');
  // remove existing markers (keep image + tooltip)
  wrap.querySelectorAll('.plan-marker').forEach(el => el.remove());
  // Also remove any STALE glass markers + reset glass-mode class to match JS state.
  // Without this, a Save-to-HTML done while in glass mode bakes the markers
  // and `.glass-mode` class into the file; on reload `mapGlassMode` is false
  // so the markers stay in the DOM with no event handlers → clicks do nothing
  // until the user toggles glass mode off-and-on.
  wrap.querySelectorAll('.glass-marker').forEach(el => el.remove());
  if (typeof mapGlassMode === 'undefined' || !mapGlassMode) {
    wrap.classList.remove('glass-mode');
    const _gmBtn = document.getElementById('glassMapBtn');
    if (_gmBtn) { _gmBtn.textContent = '🪟 Glass Mode'; _gmBtn.classList.remove('btn-primary'); }
    const _gbBtn = document.getElementById('glassBatchBtn');
    if (_gbBtn) { _gbBtn.style.display = 'none'; _gbBtn.textContent = '☑ Batch Select'; _gbBtn.classList.remove('btn-primary'); }
    const _gbBar = document.getElementById('glassBatchBar');
    if (_gbBar) _gbBar.style.display = 'none';
  }
  const hidePending = document.getElementById('hidePendingChk').checked;
  const hl = window._highlightedSfIds; // Set<string> or null
  state.units.forEach(u => {
    if ((u.level || firstFloorKey()) !== currentLevel) return;
    if (hidePending && u.status === 'pending') return;
    if (doorMode && !isDoor(u)) return;   // Door Mode: hide storefront markers
    if (PROJECT.requirePlacedMarkers && !state.positions[u.key]) return;  // opt-in: skip markers not placed on the plan
    const pos = state.positions[u.key] || { x: 50, y: 50 };
    const m = document.createElement('div');
    let extra = '';
    if (hl && hl.size) {
      extra = hl.has((u.id || '').toUpperCase()) ? ' highlighted' : ' dimmed';
    }
    m.className = `plan-marker ${u.status}${isDoor(u) ? ' door' : ''}${u.louver === 'yes' ? ' has-louver' : ''}${isPlanned(u) ? ' planned' : ''}${extra}`;
    m.style.left = pos.x + '%';
    m.style.top  = pos.y + '%';
    {
      // Strip SF prefix only — sub-IDs are entered manually by the user, no auto suffix
      m.textContent = u.id.replace(/^SF/, '');
    }
    m.dataset.unit = u.key;
    m.title = `${u.id} · ${formatStatus(u.status)}${u.date ? ' · ' + formatDate(u.date) : ''}`;
    // hover tooltip
    m.addEventListener('mouseenter', e => showPlanTooltip(e, u));
    m.addEventListener('mouseleave', hidePlanTooltip);
    wrap.appendChild(m);
  });
  setupPlanInteractions();
  if (typeof mapGlassMode !== 'undefined' && mapGlassMode) renderGlassMarkers();
}

function showPlanTooltip(e, u) {
  const tt = document.getElementById('planTooltip');
  tt.innerHTML = `<strong>${u.id}</strong> · ${isDoor(u) ? 'Door' : u.type} · ${u.zone}<br>
    <span style="color:var(--text-dim)">${formatStatus(u.status)}${u.date ? ' · ' + formatDate(u.date) : ''}${u.louver==='yes' ? ' · Louver ✓' : ''}${u.facecap==='yes' ? ' · Face Cap ✓' : ''}</span>
    ${u.note ? '<br><span style="color:var(--text-dim);font-size:10px">' + u.note + '</span>' : ''}`;
  const rect = e.currentTarget.getBoundingClientRect();
  const wrapRect = document.getElementById('planWrap').getBoundingClientRect();
  tt.style.left = (rect.left - wrapRect.left + rect.width/2) + 'px';
  tt.style.top  = (rect.top  - wrapRect.top) + 'px';
  tt.style.display = 'block';
}
function hidePlanTooltip() {
  document.getElementById('planTooltip').style.display = 'none';
}

/* ---- Plan zoom & pan (touch + buttons + wheel) ---- */
let planView = { s: 0.9, tx: 0, ty: 0 };
const MIN_ZOOM = 0.9, MAX_ZOOM = 6;

// Returns the centered planView state at MIN_ZOOM (equal black border on all sides).
// Uses wrap.offsetHeight (image natural height) so vertical centering works even when
// the image is shorter than the viewport (e.g. mobile portrait).
function getPlanCenterView() {
  const vp   = document.getElementById('planViewport');
  const wrap = document.getElementById('planWrap');
  if (!vp || !wrap) return { s: MIN_ZOOM, tx: 0, ty: 0 };
  const vpW = vp.offsetWidth,  vpH = vp.offsetHeight;
  const wW  = wrap.offsetWidth, wH = wrap.offsetHeight;
  return {
    s:  MIN_ZOOM,
    tx: Math.max(0, (vpW - wW * MIN_ZOOM) / 2),
    ty: Math.max(0, (vpH - wH * MIN_ZOOM) / 2)
  };
}

function applyPlanTransform() {
  const wrap = document.getElementById('planWrap');
  if (!wrap) return;
  wrap.style.transform = `translate(${planView.tx}px, ${planView.ty}px) scale(${planView.s})`;
  const lbl = document.getElementById('zoomLabel');
  if (lbl) lbl.textContent = Math.round(planView.s / MIN_ZOOM * 100) + '%';
}
function clampPlanPan() {
  const vp = document.getElementById('planViewport');
  if (!vp) return;
  const r = vp.getBoundingClientRect();
  if (planView.s <= MIN_ZOOM) {
    // Snap back to centered at MIN_ZOOM
    Object.assign(planView, getPlanCenterView());
    return;
  }
  const minX = r.width  - r.width  * planView.s;
  const minY = r.height - r.height * planView.s;
  if (planView.tx > 0) planView.tx = 0;
  if (planView.tx < minX) planView.tx = minX;
  if (planView.ty > 0) planView.ty = 0;
  if (planView.ty < minY) planView.ty = minY;
}
function planZoom(factor, cx, cy) {
  const vp = document.getElementById('planViewport');
  if (!vp) return;
  const r = vp.getBoundingClientRect();
  if (cx == null) { cx = r.width / 2; cy = r.height / 2; }
  const newS = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, planView.s * factor));
  if (newS === planView.s) return;
  // Keep the point under (cx,cy) fixed
  const f = newS / planView.s;
  planView.tx = cx - f * (cx - planView.tx);
  planView.ty = cy - f * (cy - planView.ty);
  planView.s = newS;
  clampPlanPan();
  applyPlanTransform();
}
function planZoomReset() {
  planView = getPlanCenterView();
  applyPlanTransform();
}

function setupPlanZoomPan() {
  const vp = document.getElementById('planViewport');
  if (!vp || vp._planZoomBound) return;
  vp._planZoomBound = true;

  // ----- Wheel: zoom centered on cursor -----
  vp.addEventListener('wheel', (e) => {
    if (placeMode) return;
    e.preventDefault();
    const r = vp.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    const factor = e.deltaY < 0 ? 1.15 : 1/1.15;
    planZoom(factor, cx, cy);
  }, { passive: false });

  // ----- Unified Pointer Events: 1-pointer pan, 2-pointer pinch -----
  // Works for touch + mouse + stylus uniformly. iOS Safari requires
  // touch-action:none on the element (already set in CSS) so we own gestures.
  const pointers = new Map();             // pointerId → { x, y, sx, sy }
  let pinchPrevDist = 0;
  let panActive = false;
  let suppressClickUntil = 0;
  const PAN_THRESHOLD = 5;

  const isMarker = (el) => el && el.closest && el.closest('.plan-marker, .glass-marker');

  function pointersCenter() {
    let cx = 0, cy = 0, n = 0;
    pointers.forEach(p => { cx += p.x; cy += p.y; n++; });
    return n ? { x: cx / n, y: cy / n } : { x: 0, y: 0 };
  }
  function pointersDist() {
    if (pointers.size < 2) return 0;
    const arr = [...pointers.values()];
    return Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
  }

  vp.addEventListener('pointerdown', (e) => {
    if (placeMode) return;
    // In edit mode, let markers handle their own drag — don't capture them here.
    const editMode = document.getElementById('editPositionMode')?.checked;
    if (editMode && isMarker(e.target)) return;

    pointers.set(e.pointerId, {
      x: e.clientX, y: e.clientY,
      sx: e.clientX, sy: e.clientY,
    });
    try { vp.setPointerCapture(e.pointerId); } catch(_) {}

    if (pointers.size === 2) {
      pinchPrevDist = pointersDist();
    }
  });

  vp.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;

    if (pointers.size === 2) {
      // Pinch + pan together
      e.preventDefault();
      const r = vp.getBoundingClientRect();
      const c = pointersCenter();
      const cx = c.x - r.left, cy = c.y - r.top;
      const dist = pointersDist();
      if (pinchPrevDist > 0) {
        const factor = dist / pinchPrevDist;
        planZoom(factor, cx, cy);
      }
      pinchPrevDist = dist;
      panActive = true;
      return;
    }

    // In edit mode a single-pointer background drag is a box-select, not a pan —
    // so don't pan or auto-zoom here (that was dragging the whole plan + markers).
    if (document.getElementById('editPositionMode')?.checked) return;

    // Single pointer pan
    if (!panActive) {
      if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) < PAN_THRESHOLD) return;
      panActive = true;
      // At base zoom, auto-zoom on first drag so the gesture actually moves the map
      if (planView.s <= MIN_ZOOM) {
        const r = vp.getBoundingClientRect();
        planZoom(1.8, p.sx - r.left, p.sy - r.top);
      }
    }
    e.preventDefault();
    planView.tx += dx;
    planView.ty += dy;
    clampPlanPan();
    applyPlanTransform();
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    try { vp.releasePointerCapture(e.pointerId); } catch(_) {}
    if (pointers.size < 2) pinchPrevDist = 0;
    if (pointers.size === 0) {
      if (panActive) suppressClickUntil = Date.now() + 350;
      panActive = false;
    }
  }
  vp.addEventListener('pointerup', endPointer);
  vp.addEventListener('pointercancel', endPointer);
  vp.addEventListener('pointerleave', (e) => {
    // Only end if we actually left (not just child transitions)
    if (e.target === vp) endPointer(e);
  });

  // Eat the synthetic click that fires after a drag so markers don't open
  vp.addEventListener('click', (e) => {
    if (Date.now() < suppressClickUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Cursor hint for desktop
  vp.style.cursor = 'grab';
  vp.addEventListener('pointerdown', () => { vp.style.cursor = 'grabbing'; });
  vp.addEventListener('pointerup',   () => { vp.style.cursor = 'grab'; });

  // ----- Double-click / double-tap to reset -----
  vp.addEventListener('dblclick', (e) => {
    if (placeMode) return;
    if (isMarker(e.target)) return;
    planZoomReset();
  });
  let lastTap = 0;
  vp.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    const now = Date.now();
    if (now - lastTap < 300 && !isMarker(e.target)) {
      planZoomReset();
    }
    lastTap = now;
  });
  // Center after image loads (ensures wrap.offsetHeight is correct before calculating)
  const _img = document.getElementById('planImg');
  const _doCenter = () => { planView = getPlanCenterView(); applyPlanTransform(); };
  if (_img && !_img.complete) {
    _img.addEventListener('load', _doCenter, { once: true });
  } else {
    requestAnimationFrame(_doCenter);
  }
}

let dragState = null;
let placeMode = false;
let selectedMarkers = new Set();  // keys of box-selected markers
let selBoxState = null;           // active rubber-band selection

function clearMarkerSelection() {
  selectedMarkers.clear();
  document.querySelectorAll('.plan-marker.sel').forEach(m => m.classList.remove('sel'));
}

function clearGlassSelection() {
  selectedGlassPanels = [];
  document.querySelectorAll('.glass-marker.selected').forEach(el => el.classList.remove('selected'));
  const cnt = document.getElementById('glassBatchCount');
  if (cnt) cnt.textContent = '0';
}

function setupPlanInteractions() {
  setupPlanZoomPan();
  const wrap = document.getElementById('planWrap');
  const editMode = document.getElementById('editPositionMode').checked;
  wrap.classList.toggle('edit-mode', editMode);

  // ----- Box-select: mousedown on background -----
  wrap.onmousedown = (e) => {
    if (!editMode || placeMode) return;
    if (e.target.closest('.plan-marker, .glass-marker')) return; // marker drag handled below
    e.preventDefault();                            // stop native drag/text-select auto-scroll
    // In glass mode the box selects glass dots; otherwise it selects SF markers.
    // Always clear SF selection so stale blue outlines can't linger under glass mode.
    clearMarkerSelection();
    if (mapGlassMode) clearGlassSelection();
    // Draw the marquee in the NON-transformed viewport so it tracks the cursor
    // 1:1 regardless of zoom/pan. (planWrap carries the scale transform.)
    const vp = document.getElementById('planViewport');
    const vpRect = vp.getBoundingClientRect();
    selBoxState = {
      startPx: { x: e.clientX - vpRect.left, y: e.clientY - vpRect.top },
      vpRect
    };
    const box = document.getElementById('selBox');
    if (box) {
      box.style.cssText = `display:block;left:${selBoxState.startPx.x}px;top:${selBoxState.startPx.y}px;width:0;height:0`;
    }
  };

  wrap.querySelectorAll('.plan-marker').forEach(m => {
    m.onpointerdown = (e) => {
      if (placeMode) return;
      e.stopPropagation();
    };
    m.onclick = (e) => {
      if (dragState && dragState.moved) { dragState = null; return; }
      if (placeMode) return;
      // In edit mode, clicking an unselected marker clears the selection first
      if (editMode && !selectedMarkers.has(m.dataset.unit)) clearMarkerSelection();
      openUnit(m.dataset.unit);
    };
    m.onmousedown = (e) => {
      if (!editMode || placeMode) return;
      e.preventDefault();
      e.stopPropagation(); // don't start a box-select
      const rect = wrap.getBoundingClientRect();
      const startX = ((e.clientX - rect.left) / rect.width) * 100;
      const startY = ((e.clientY - rect.top)  / rect.height) * 100;
      const isMulti = selectedMarkers.has(m.dataset.unit) && selectedMarkers.size > 1;
      dragState = { id: m.dataset.unit, el: m, rect, moved: false, startX, startY, isMulti };
      if (isMulti) {
        // Capture start positions + DOM elements of all selected markers
        dragState.multiStart = {};
        dragState.multiEls = {};
        selectedMarkers.forEach(key => {
          dragState.multiStart[key] = { ...(state.positions[key] || { x: 50, y: 50 }) };
          const el = wrap.querySelector(`.plan-marker[data-unit="${CSS.escape(key)}"]`);
          if (el) dragState.multiEls[key] = el;
        });
      }
      hidePlanTooltip();
    };
  });
}

document.addEventListener('mousemove', e => {
  // ----- Box-select drawing -----
  if (selBoxState) {
    e.preventDefault();                     // block page scroll / text selection while dragging
    const box = document.getElementById('selBox');
    if (box) {
      const r = selBoxState.vpRect;
      // Clamp the cursor to the viewport so the box never extends past the
      // visible area (which is what was nudging the page scroll before).
      const cx = Math.max(0, Math.min(r.width,  e.clientX - r.left));
      const cy = Math.max(0, Math.min(r.height, e.clientY - r.top));
      const x = Math.min(cx, selBoxState.startPx.x);
      const y = Math.min(cy, selBoxState.startPx.y);
      const w = Math.abs(cx - selBoxState.startPx.x);
      const h = Math.abs(cy - selBoxState.startPx.y);
      box.style.left = x + 'px'; box.style.top = y + 'px';
      box.style.width = w + 'px'; box.style.height = h + 'px';
    }
    return;
  }
  if (!dragState) return;
  const { rect, el } = dragState;
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top)  / rect.height) * 100;
  if (x < 0 || x > 100 || y < 0 || y > 100) return;
  if (dragState.glassMulti) {
    // Move all selected glass dots by the same delta from drag start
    const dx = x - dragState.startX;
    const dy = y - dragState.startY;
    dragState.glassItems.forEach(it => {
      it.el.style.left = (it.startLeft + dx) + '%';
      it.el.style.top  = (it.startTop  + dy) + '%';
    });
  } else if (dragState.isMulti) {
    // Move all selected markers by the same delta from drag start
    const dx = x - dragState.startX;
    const dy = y - dragState.startY;
    Object.entries(dragState.multiStart).forEach(([key, sp]) => {
      const nx = Math.max(0, Math.min(100, sp.x + dx));
      const ny = Math.max(0, Math.min(100, sp.y + dy));
      if (dragState.multiEls[key]) {
        dragState.multiEls[key].style.left = nx + '%';
        dragState.multiEls[key].style.top  = ny + '%';
      }
    });
  } else {
    el.style.left = x + '%';
    el.style.top  = y + '%';
  }
  dragState.x = x; dragState.y = y;
  dragState.moved = true;
});
document.addEventListener('mouseup', () => {
  // ----- Finalize box selection -----
  if (selBoxState) {
    const box = document.getElementById('selBox');
    if (box) {
      const bw = parseFloat(box.style.width)  || 0;
      const bh = parseFloat(box.style.height) || 0;
      if (bw > 5 || bh > 5) {
        // The box is in viewport (screen) px; markers use % of the SCALED wrap.
        // Convert the box's screen rect into wrap % so hit-testing is zoom/pan-correct.
        const vpr = selBoxState.vpRect;
        const wrapRect = document.getElementById('planWrap').getBoundingClientRect();
        const boxScreenL = vpr.left + (parseFloat(box.style.left) || 0);
        const boxScreenT = vpr.top  + (parseFloat(box.style.top)  || 0);
        const bx1 = (boxScreenL - wrapRect.left) / wrapRect.width  * 100;
        const by1 = (boxScreenT - wrapRect.top)  / wrapRect.height * 100;
        const bx2 = bx1 + bw / wrapRect.width  * 100;
        const by2 = by1 + bh / wrapRect.height * 100;
        if (mapGlassMode) {
          // Glass mode: box selects glass dots (into selectedGlassPanels) for batch move.
          document.querySelectorAll('#planWrap .glass-marker').forEach(el => {
            const ml = parseFloat(el.style.left);
            const mt = parseFloat(el.style.top);
            if (ml >= bx1 && ml <= bx2 && mt >= by1 && mt <= by2) {
              const uk = el.dataset.unitKey, pidx = parseInt(el.dataset.panelIdx, 10);
              if (!selectedGlassPanels.some(x => x.unitKey === uk && x.panelIdx === pidx)) {
                selectedGlassPanels.push({ unitKey: uk, panelIdx: pidx });
                el.classList.add('selected');
              }
            }
          });
          const cnt = document.getElementById('glassBatchCount');
          if (cnt) cnt.textContent = selectedGlassPanels.length;
          if (selectedGlassPanels.length > 0) toast(`${selectedGlassPanels.length} glass panels selected — drag any to move all`);
        } else {
          document.querySelectorAll('#planWrap .plan-marker').forEach(m => {
            const ml = parseFloat(m.style.left);
            const mt = parseFloat(m.style.top);
            if (ml >= bx1 && ml <= bx2 && mt >= by1 && mt <= by2) {
              selectedMarkers.add(m.dataset.unit);
              m.classList.add('sel');
            }
          });
          if (selectedMarkers.size > 0) toast(`${selectedMarkers.size} markers selected — drag any to move all`);
        }
      }
      box.style.display = 'none';
    }
    selBoxState = null;
    return;
  }
  if (dragState && dragState.moved && dragState.x != null) {
    if (dragState.glassMulti) {
      // Save every selected glass dot as an offset relative to its own SF marker
      const dx = dragState.x - dragState.startX;
      const dy = dragState.y - dragState.startY;
      if (!state.glassPanelOffsets) state.glassPanelOffsets = {};
      (dragState.glassItems || []).forEach(it => {
        const nx = it.startLeft + dx;
        const ny = it.startTop  + dy;
        if (!state.glassPanelOffsets[it.unitKey]) state.glassPanelOffsets[it.unitKey] = {};
        state.glassPanelOffsets[it.unitKey][it.panelIdx] = { dx: nx - it.sfPos.x, dy: ny - it.sfPos.y };
      });
      saveState(false);
      toast(`${(dragState.glassItems || []).length} glass panels ` + t('msg_pos_saved'));
    } else if (dragState.isMulti) {
      // Save all selected marker positions
      const dx = dragState.x - dragState.startX;
      const dy = dragState.y - dragState.startY;
      Object.entries(dragState.multiStart).forEach(([key, sp]) => {
        state.positions[key] = {
          x: Math.max(0, Math.min(100, sp.x + dx)),
          y: Math.max(0, Math.min(100, sp.y + dy))
        };
      });
      saveState(false);
      toast(`${selectedMarkers.size} markers ` + t('msg_pos_saved'));
    } else if (dragState.glassPanel) {
      // Glass panel: store offset relative to SF marker so it moves with the SF
      const sfPos = dragState.sfPos || state.positions[dragState.unitKey] || { x: 50, y: 50 };
      const dx = dragState.x - sfPos.x;
      const dy = dragState.y - sfPos.y;
      if (!state.glassPanelOffsets) state.glassPanelOffsets = {};
      if (!state.glassPanelOffsets[dragState.unitKey]) state.glassPanelOffsets[dragState.unitKey] = {};
      state.glassPanelOffsets[dragState.unitKey][dragState.panelIdx] = { dx: dx, dy: dy };
      saveState(false);
      const _du = state.units.find(x => x.key === dragState.unitKey);
      const _p  = _du && _du.glassPanels && _du.glassPanels[dragState.panelIdx];
      toast(((_du ? _du.id : '?') + ' · ' + ((_p && _p.panel) || ('#' + (dragState.panelIdx + 1))) + ' ') + t('msg_pos_saved'));
      if (dragState.el) dragState.el.style.cursor = 'grab';
    } else {
      state.positions[dragState.id] = { x: dragState.x, y: dragState.y };
      saveState(false);
      { const _du = state.units.find(x=>x.key===dragState.id); toast(`${_du ? _du.id : dragState.id} ` + t('msg_pos_saved')); }
    }
  } else if (dragState && dragState.glassPanel && dragState.el) {
    dragState.el.style.cursor = 'grab';
  }
  setTimeout(() => dragState = null, 50);
});

function togglePlaceMode() {
  placeMode = !placeMode;
  const wrap = document.getElementById('planWrap');
  const btn = document.getElementById('placeBtn');
  wrap.classList.toggle('placing', placeMode);
  if (placeMode) {
    btn.classList.add('btn-primary');
    btn.textContent = t('place_cancel');
    toast(t('place_hint'));
  } else {
    btn.classList.remove('btn-primary');
    btn.textContent = t('tool_place');
  }
}

document.getElementById('planImg').addEventListener('click', e => {
  if (!placeMode) return;
  const rect = document.getElementById('planWrap').getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top)  / rect.height) * 100;
  // prompt for unit selection
  const unitIds = state.units.map(u=>u.id).join(', ');
  const id = prompt(t('prompt_place_unit').replace('{x}', x.toFixed(1)).replace('{y}', y.toFixed(1)).replace('{units}', unitIds));
  if (!id) return;
  const unit = state.units.find(u => u.id.toUpperCase() === id.trim().toUpperCase() && !state.positions[u.key]) || state.units.find(u => u.id.toUpperCase() === id.trim().toUpperCase());
  if (!unit) {
    if (confirm(t('confirm_unit_create').replace('{id}', id))) {
      {
        // Generate a unique key — if id exists already, append __N suffix
        const trimmedId = id.trim().toUpperCase();
        // Firebase RTDB path keys can't contain . # $ / [ ] — a dot (e.g. "SF04.1") would make
        // the whole cloud set() fail silently and the new unit vanish on refresh. Sanitize the
        // KEY only; the display id keeps whatever the user typed.
        const safeId = trimmedId.replace(/[.#$/\[\]]/g, '-');
        const existingKeys = state.units.filter(u => u.id === trimmedId).map(u => u.key);
        let newKey = safeId;
        if (existingKeys.length > 0) {
          let n = existingKeys.length + 1;
          newKey = safeId + '__' + n;
          while (state.units.some(u => u.key === newKey)) { n++; newKey = safeId + '__' + n; }
        }
        state.units.push({ key: newKey, id: trimmedId, type:'Storefront', zone:'—', level:currentLevel, status:'pending', date:'', louver:'no', facecap:'na', note:'' });
        state.positions[newKey] = { x, y };
      }
      togglePlaceMode();
      saveState();
    }
    return;
  }
  state.positions[unit.key] = { x, y };
  togglePlaceMode();
  saveState();
});

document.getElementById('editPositionMode').addEventListener('change', () => {
  setupPlanInteractions();
  if (typeof mapGlassMode !== 'undefined' && mapGlassMode) renderGlassMarkers();
  toast(document.getElementById('editPositionMode').checked ? t('msg_edit_on') : t('msg_edit_off'));
});

// Inlined Level 2 plan so the file is fully self-contained when downloaded
const PLAN_L2_SRC = PROJECT.planL2 || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAADIAAAAO8CAYAAACLdC5HAAAAOnRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjEwLjgsIGh0dHBzOi8vbWF0cGxvdGxpYi5vcmcvwVt1zgAAAAlwSFlzAAAewgAAHsIBbtB1PgABAABJREFUeJzs3XmYnWV9N/DvmZkkM1knJCFkJxBChLBvLhRwRdxw11atuMQN0WKVLi4nh1Zaq9W+Vn2r1FatFq19qyIUKUUTBRVBUJawhQSSEAKBJEAmk2SW8/4xmWGSzCSTZGbOmcnnc11zZc5z7vs5v3POM/fz5Lru73MXyuVyOQAAAAAAAAAAAAAAAFStmkoXAAAAAAAAAAAAAAAAwJ4JgAAAAAAAAAAAAAAAAFQ5ARAAAAAAAAAAAAAAAIAqJwACAAAAAAAAAAAAAABQ5QRAAAAAAAAAAAAAAAAAqpwACAAAAAAAAAAAAAAAQJUTAAEAAAAAAAAAAAAAAKhyAiAAAAAAAAAAAAAAAABVTgAEAAAAAAAAAAAAAACgygmAAAAAAAAAAAAAAAAAVDkBEAAAAAAAAAAAAAAAgConAAIAAAAAAAAAAAAAAFDlBEAAAAAAAAAAAAAAAACqnAAIAAAAAAAAAAAAAABAlRMAAQAAAAAAAAAAAAAAqHICIAAAAAAAAAAAAAAAAFVOAAQAAAAAAAAAAAAAAKDKCYAAAAAAAAAAAAAAAABUOQEQAAAAAAAAAAAAAACAKicAAgAAAAAAAAAAAAAAUOUEQAAAAAAAAAAAAAAAAKqcAAgAAAAAAAAAAAAAAECVEwABAAAAAAAAAAAAAACocgIgAAAAAAAAAAAAAAAAVU4ABAAAAAAAAAAAAAAAoMoJgAAAAAAAAAAAAAAAAFQ5ARAAAAAAAAAAAAAAAIAqJwACAAAAAAAAAAAAAABQ5QRAAAAAAAAAAAAAAAAAqpwACAAAAAAAAAAAAAAAQJUTAAEAAAAAAAAAAAAAAKhyAiAAAAAAAAAAAAAAAABVTgAEAAAAAAAAAAAAAACgygmAAAAAAAAAAAAAAAAAVDkBEAAAAAAAAAAAAAAAgConAAIAAAAAAAAAAAAAAFDlBEAAAAAAAAAAAAAAAACqnAAIAAAAAAAAAAAAAABAlRMAAQAAAAAAAAAAAAAAqHICIAAAAAAAAAAAAAAAAFVOAAQAAAAAAAAAAAAAAKDKCYAAAAAAAAAAAAAAAABUubpKFwDDUalU2qf2xWKxq1+xWNzn/t33AQAAAAAAAAAAAADA8CMAAlWgp8DHvgQ69icwAgAAAAAAAAAAAADA0CEAAgOoLyGOzvCGFTwAAAAAAAAAAAAAAOhNTaULAAAAAAAAAAAAAAAAYM8EQAAAAAAAAAAAAAAAAKqcAAgAAAAAAAAAAAAAAECVq6t0AUDPSqVSj9uLxeIgVwIAAAAAAAAAAAAAQKUJgEAV6h7yKJVKXY97C4UAAAAAAAAAAAAAADC81VS6AAAAAAAAAAAAAAAAAPZMAAQAAAAAAAAAAAAAAKDKCYAAAAAAAAAAAAAAAABUOQEQAAAAAAAAAAAAAACAKicAAgAAAAAAAAAAAAAAUOUEQAAAAAAAAAAAAAAAAKpcXaULAPZNqVTqdXuxWBzkagAAAAAAAAAAAAAAGAwCIDCEFIvFXoMevQVDAAAAAAAAAAAAAAAY+moqXQAAAAAAAAAAAAAAAAB7JgACAAAAAAAAAAAAAABQ5QRAAAAAAAAAAAAAAAAAqpwACAAAAAAAAAAAAAAAQJUTAAEAAAAAAAAAAAAAAKhydZUuAIaDUqlU6RKS7LmOYrE4iJUAHLyq5ZwwkJxTAPrPwXDeGCjORwAAAAAAAADAwUYABPpJ98lHlZjEtafJT6VSab9rMqkKOFgdyFg+nMdO5xSA6nGwjqud56H9OR8drJ8ZAAAAAAAAADA8CIDAQWJ/Jjq5GzFwsDN29sznAtC/jKv7zmcGAAAAAAAAAByMaipdAAAAAAAAAAAAAAAAAHsmAAIAAAAAAAAAAAAAAFDlBEAAAAAAAAAAAAAAAACqXF2lCwD2XalUqnQJAOyBcRqAweB8AwAAAAAAAABwcBEAgSGmWCzuc59SqbTXyWH7s1+Ag9XBPKY6pwAMjr6EOw7W8da5CAAAAAAAAAA4WAmAwEFgb5Of3DkYYN8drBNLnVMABs/Beq7ZG+ciAAAAAAAAAOBgJQACQ8BATGAymQygf5hk6pwCMBicbwAAAAAAAAAAEACBKjcQk2pNHgPoXwdzAMI5BWDwHMznm33h3AQAAAAAAAAADFc1lS4AAAAAAAAAAAAAAACAPRMAAQAAAAAAAAAAAAAAqHJ1lS4AAAAAoD+VSqVKlwAAAAAAAAAA0O8EQIAkJkgB9MTYuH98bgD7xrjZv4rF4m7bSqVSj9sBAAAAAAAAAIYSARAgSe+TpAAOZr1NFB3s8bG5uTmrVq3K7Nmz09DQMKivvT+cUwD2jXETAAAAAAAAAIC+EACBKjEQE7zc4Ragcm655ZZen1u7dm2mT5/ep/2sWrUqDzzwQCZOnJiNGzfmzDPPzIgRI5Ik5XI5t956axobG7N69eqMHj06EydOzFFHHdUvr9297dq1a/OqV72qT/0AGFyd/5cYO3Zszj777P0e66ut7dKlS7N58+Y+7QMAAAAAAAAA4GAgAAIAMEBOPfXUA97HuHHjUigUUltbm0MOOSSTJk3K/Pnzu54fPXp0rrnmmowcOTKbN2/OyJEj++V1d3XllVf2+z4B6F/lcjnjxo3Li1/84n1aMaraVppqamrKmDFjsnTp0kqXAgAAAAAAAABQVQRAoMIGYpWOgVhNBIDKmD17dq699trMnDkza9asyXnnnbfT88cee2zq6uqydOnSvPWtb01jY2Of9lttk30BOHDlcjnLli3Ltddem0WLFvVpfG9ubs7ll1+eWbNm7VO/gXDDDTfkl7/8ZVpbW3Puuefm7LPP7rdQY6lUSqlUskoiAAAAAAAAADCk1VS6AAAAetfQ0JBFixZl4cKFvU7KPfroo/Oe97wnhxxySGpq9n551znZd9myZbn88svT3Nw8EKUDMMgmTpyY2trazJw5M6tXr+5Tn1WrVmXWrFl77Nfc3Jx77713wM8XY8aMSblczhFHHJGtW7cO6GsBAAAAAAAAAAxFAiAAAP2stbU1d955Z7/tr6GhIfPnz++3O7L3ZbJvp85Jv1OmTOmX1wZg4GzcuDGtra1Zs2ZNZs2a1ac+s2fPzurVq3vtt3HjxnzlK1/J7bffPuChwZNOOilvectb8uijjzrvAAAAAAAAAAD0QAAEAKCf1dTU5PHHH89dd91V6VJ6tLfJvklH8OOOO+7I1772tSxbtiw33HCDlUIAqtyZZ565xxWjerKnlaaam5vz9a9/PXV1dVm+fHmmTZvW55VF9tfMmTPzoQ99KPPnz8/atWsH9LUAAAAAAAAAAIYaARAAgH7W1taWJP22Ykd/29Nk36Rjwu/ll1+eW2+9NVu2bEmSNDY2DvikXwAOzIgRI/ZrxajeVppatWpV5syZky1btmT06NFdK0gNtEKhkCSZPn36gL8WAAAAAAAAAMBQIgACANDPtm3blkMOOSSHHXZYpUvpVW+TfZN0TfAdN25ckuTJJ5/Mpk2bBmXSLwCVVy6Xc+utt2b58uVZsWJFjjzyyLS0tOSd73xnv4Ubm5ubc++991pdCgAAAAAAAABgHwiAAAD0s7Fjx+b444/P6NGjK13Kfpk9e3bXah8NDQ055ZRTcuaZZ1btiiYA9K+tW7fm2muvTWtra1paWnLCCSfkwgsvzMSJE/tl/50rTS1btiyXX365EAgAAAAAAAAAQB8JgAAADAH7e6f05ubm3HHHHbnjjjv63LehoSGLFi3KwoUL8973vjfHHXdcRowYsT9lAzAENTQ05E1velPuvffejBo1KkcffXS/hgA7V5qqra3NzJkzu0KHAAAAAAAAAADsmQAIAEAF7EswY3/vlN7c3Jyvfe1rueqqq3LVVVflq1/96j6FQObPn2/VD4BhqC+hwiOOOCJveMMbMmPGjFxxxRW58847u/rceeedueKKK/Lwww/v1+t3rjTV2tqaNWvWZNasWfv7VgAAAAAAAAAADip1lS4AAOBg0xnM2LJlS5KOsMV73/veXsMWPd0pff78+Xvc/6pVq7J9+/ZMmDAhNTU1KZfLGT9+/F77AjB0rV27dq9tOkOFs2bNyrXXXptFixaloaGh69wxe/bsrvPRIYccktNPPz2FQiFXXHFFFixYkGuuuSbjx4/Pueeem//+7//Ou9/97hQKhV5fq/s+uz9etGhRVq9enfPOO2+n81/3NgAAAAAAAAAA7EwABAZQqVTq930Wi8V+3ycAg2vVqlX7FMyYPXt2rrrqqmzfvj2tra2ZO3dukuTXv/51brnllq5273znO1MoFLom9q5atSrt7e3ZunVrkqS9vX2/77Lel0nFAFTW9OnT99qmp1DhlClT8vWvfz1z5szZKRQyYcKETJgwIffee2/Gjx+fcrmcsWPHZvr06ZkxY0amT5+exx57LOPHj98tPLJr0ORtb3tb/u3f/i3Tpk3LVVddlXe+8527nfd27bN9+/ZcffXVA/JZAQAAAAAAAAAMRQIg0E8GIuwBwNC1p8DE7Nmz85Of/KRrBZC9BTMaGhrymte8Jk1NTZkxY0a+973v5aSTTsppp52Wk046KeVyOd/61rcyevTo3HvvvV0Te2fNmpWjjjoqSVIoFHLkkUf2usrI3vRlUjEA1W/27Nm59tprM3PmzKxZsybPf/7z8y//8i8ZMWJEli9fnnnz5u0USly/fn0ee+yxbN68OTU1NXniiSfyB3/wB0mSxsbGPP744/ne976324oiuwZNfve732XatGlZvnx5Ro8ena9//eu58MILdzov7drn/vvvr8hnBAAAAAAAAABQrQRAoB/suipHZxik+/aetu0LAROAoWVPgYmGhoa85z3vyfLly/sczDjiiCO6fq+vr097e3tqa2tTW1ubhx9+uOv1dp3Ye9555+136AOA4aehoSGLFi3K6tWrc95553Wt3NEZzHjooYfyile8oqv99u3b09TUlFmzZuXYY4/N6NGjM2bMmCRJXV1dHnnkkd1WFJk/f36vQZPRo0dny5YtuwVNkt3PYUcddVRe+9rX9vpe7r///tx0002pr6/P5MmTc8455+RnP/tZNmzYkLa2ttx9990D90ECAAAAAAAAAFRATaULgOFm69atlS4BgCGgoaEh8+bNy4gRI/ap3/r167N169Zs27ata9sDDzyQefPmde130aJFWbhwYddd2AGgu4aGhsyfPz8NDQ1dK22MHz8+27Zty7ve9a6dzh0zZszIS1/60kydOjX19fUZO3Zs1zlo27ZtXaGP1tbWrFmzpmtFq13PRxMnTsw73/nOtLS0ZN68eV3BkV3r6t6nrm7P96xoa2tLbW1tWltbM3bs2CQdIclyuZza2tokHQH8/Q3hAwAAAAAAAABUGwEQ6GebNm2qdAkADAHNzc25/PLLs2zZslx++eVpbm7uc59x48bt1OfBBx/M3Llzu9p1n9jb2e/ee+/t02t0f6197QPA0NO5okd9fX1GjRrVFaTYVblcTk1NTaZMmZJ169YlSR599NHMmDGj1+DhruejiRMn5sILL8wJJ5zQa0hx1z57Mnny5KxZsyann356lixZkm9/+9u58cYbs3DhwqxYsWJ/Pg4AAAAAAAAAgKq259tpAvvssMMOq3QJAAwBy5cvz7Rp01JbW9t19/T58+fvsc+SJUvS2NiY8ePHZ/To0Vm9enXmzJmTJBk1alSam5uzatWqzJ49e6fwx+WXX55Zs2bl2muv7dOqID31AWB4KhQKOeOMM/Lb3/42M2fO3Gllqttvvz1r1qxJkqxZsyYvetGL0tbWlp/97GdZs2ZNtm/fnnHjxiXJXs9hnToDHn0xffr0PT4/efLknHTSSbn++uvz/Oc/P/X19SkUClmyZEnOOuus/OQnP+nT6wAAAAAAAAAADBVWAAEAqIDbb789y5Yty3333ZeHHnoos2bN2mP7DRs2ZO3atWlpaUlra2vWrFmTWbNmZeXKlZk7d26vK4qsWrUqs2bN2ilosjf70weAymtpadmv1ZuOP/74zJw5M+edd95O2xcsWJC5c+dmzpw5efvb357a2tq0tbVl27ZtaWpqyoYNGyq+UtQLX/jCLFiwIEuXLs1//ud/5sc//nHmz5+f008/vaJ1AQAAAAAAAAAMBAEQAIAKOOaYYzJnzpy0trbmla985V5X5fjd736Xxx9/PG1tbXnggQfyx3/8x2loaMjy5ctz5JFH9hramD17dlavXp1t27ZlxYoVmTJlyl5r6+zT2tqaVatWZdu2bWlpaemX9w3AwLnhhht2CwL2xejRo3P++edn9OjRO20fOXJknvWsZ+XYY4/NqFGjknSEBOfMmZPJkydn1qxZFQ8JPv7447npppty0kkn5a1vfWvOOOOM3HrrrVm/fn1F6wIAAAAAAAAAGAgCIAAAFXDsscfmkUceyfz58zNv3ry9tn/+85+fSy65JBdffHE++tGPprGxMUny8pe/PNOnT98ptNG5OkiSNDQ05G1ve1vXhN1/+7d/2+uk4IaGhixatCjz589PoVDI8uXLc8MNN1T8Lu8A7NnEiRMHfPWm3s43lbJ06dI8+9nPTnNzc77zne9k8+bNed7znpclS5ZUtC4AAAAAAAAAgIEgAAIAUAEjR47Mn/7pn+YVr3hFn9oXCoWdfrpvT54JbSxcuDCLFi3aaUWRxx57LEcccURGjRrV50nBDQ0NGTFiRGbPnp3a2to0NjZW/C7vAOzZxo0bBzyYsafzTSWsXbs2c+bMyW233ZYPf/jD+d3vfpeZM2dm7dq1Fa0LAAAAAAAAAGAgCIAAAFTIyJEjM3LkyH7bX0NDQ+bPn7/bZNz9vVt7936bNm2q+F3eAdizI488clCCGT2db5qbm3Pvvffu82pR+9uvU2NjYzZt2pSpU6fmm9/8Zg499NA8/fTTmTBhwn7tDwAAAAAAAACgmtVVugAAgINRc3NzVq1aldmzZw/43dM779a+evXqnHfeeX1+ve79Oh8DUL1mz56d+fPnD/rrNjc35/LLL8+sWbNy7bXX9jmAsr/9unvuc5+bK6+8Mq94xSsyatSobNu2LVdffXVe9rKXZdWqVfv7lgAAAAAAAAAAqpIACADAAFi7dm2vz/XHhNd91Xm39v3t99RTTw1AVQAMB6tWrcqsWbNSW1ubmTNnZvXq1Xs855TL5Tz11FNZt27dPvXrybx58/LiF784V155ZZqamlJfX58XvOAFOfroow/0bQEAAAAAAAAAVJ2aShcAADAcTZ8+vdfnepooW2nNzc25995709zcvMdtABw8+noemD17dlavXp3W1tasWbMms2bN2mP7G2+8MV/60peyZMmSrFy5std+ewpTdmpvb89vf/vbzJkzJ6997Wtz6qmn5sYbb8zWrVv3/gYBAAAAAAAAAIYYARAAgEG2rxNlB1rniiTLli3L5Zdfnubm5t22tbS0VLRGAPbNgYb4ejo39LbvhoaGLFq0KAsXLuzTqlbz5s1LfX19CoVCTjrppF777SlM2enhhx/Oli1bctxxx+Xqq69ObW1t5s6dm5tuumk/3jUAAAAAAAAAQHUTAAEAGGT7OlG2NytXrsz111+f73znO9m0adMe227fvj0//OEPc/fdd+8W5uhpRZJdt23YsGG/agRg8O0pvNFXva1W1du+GxoaMn/+/D6d0w477LCMGjUq27dvz1lnndXnfj158sknc8ghh+TBBx9MoVDIAw88kGnTpqW9vX2/9gcAAAAAAAAAUM3qKl0AAMDBqHOi7IH41a9+lSeffDKjR4/OAw88kFNOOaXXtk1NTVm2bFkef/zx/Pa3v81b3/rWrudmz56da6+9NjNnzsyaNWty3nnnJclO20477bQDqhWAgXf11VcnSR599NGMHj06GzduTENDQ376059m6tSpSTrOHc95znOydOnSnH322b3uq6WlJffcc08mT56cTZs2Zdq0abnlllt63ffatWv3umJH9zannnpqyuVybrvttl7b3nbbbV3vqa/WrFmTNWvW7FMfAAAAAAAAAIChQgAEAGCIesMb3pAf/vCHWblyZc4444w9tp04cWJmzJiRpqam3YInnSuSrF69Ouedd17XXdi7b7vrrrsG7H0A0H9OPfXUrlU6OkN8L3jBC7rG9quvvjqnnnpq1797cuKJJ2b16tWZNWtWV/897bu/vepVrxqQ/QIAAAAAAAAADFUCIAAAB6hUKu22bezYsXudWHugRowYkde//vV56KGHMnPmzL22P+OMM3L77bfn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AAAAAFQ5ARAAAAAAAAAAAAAAAIAqJwACAAAAAAAAAAAAAABQ5QRAAAAAAAAAAAAAAAAAqpwACAAAAAAAAAAAAAAAQJUTAAEAAAAAAAAAAAAAAKhyAiAAAAAAAAAAAAAAAABVTgAEAAAAAAAAAAAAAACgygmAAAAAAAAAAAAAAAAAVDkBEAAAAAAAAAAAAAAAgConAAIAAAAAAAAAAAAAAFDlBEAAAAAAAAAAAAAAAACqnAAIAAAAAAAAAAAAAABAlRMAAQAAAAAAAAAAAAAAqHICIAAAAAAAAAAAAAAAAFVOAAQAAAAAAAAAAAAAAKDKCYAAAAAAAAAAAAAAAABUOQEQAAAAAAAAAAAAAACAKicAAgAAAAAAAAAAAAAAUOUEQAAAAAAAAAAAAAAAAKqcAAgAAAAAAAAAAAAAAECVEwABAAAAAAAAAAAAAACocgIgAAAAAAAAAAAAAAAAVU4ABAAAAAAAAAAAAAAAoMoJgAAAAAAAAAAAAAAAAFQ5ARAAAAAAAAAAAAAAAIAqJwACAAAAAAAAAAAAAABQ5QRAAAAAAAAAAAAAAAAAqpwACAAAAAAAAAAAAAAAQJUTAAEAAAAAAAAAAAAAAKhyAiAAAAAAAAAAAAAAAABVTgAEAAAAAAAAAAAAAACgygmAAAAAAAAAAAAAAAAAVDkBEAAAAAAAAAAAAAAAgConAAIAAAAAAAAAAAAAAFDlBEAAAAAAAAAAAAAAAACqnAAIAAAAAAAAAAAAAABAlRMAAQAAAAAAAAAAAAAAqHICIAAAAAAAAAAAAAAAAFVOAAQAAAAAAAAAAAAAAKDKCYAAAAAAAAAAAAAAAABUOQEQAAAAAAAAAAAAAACAKicAAgAAAAAAAAAAAAAAUOUEQAAAAAAAAAAAAAAAAKqcAAgAAAAAAAAAAAAAAECVEwABAAAAAAAAAAAAAACocgIgAAAAAAAAAAAAAAAAVU4ABAAAAAAAAAAAAAAAoMoJgAAAAAAAAAAAAAAAAFQ5ARAAAAAAAAAAAAAAAIAqJwACAAAAAAAAAAAAAABQ5QRAAAAAAAAAAAAAAAAAqpwACAAAAAAAAAAAAAAAQJUTAAEAAAAAAAAAAAAAAKhyAiAAAAAAAAAAAAAAAABVTgAEAAAAAAAAAAAAAACgygmAAAAAAAAAAAAAAAAAVDkBEAAAAAAAAAAAAAAAgConAAIAAAAAAAAAAAAAAFDlBEAAAAAAAAAAAAAAAACqnAAIAAAAAAAAAAAAAABAlRMAAQAAAAAAAAAAAAAAqHICIAAAAAAAAAAAAAAAAFVOAAQAAAAAAAAAAAAAAKDKCYAAAAAAAAAAAAAAAABUOQEQAAAAAAAAAAAAAACAKicAAgAAAAAAAAAAAAAAUOUEQAAAAAAAAAAAAAAAAKqcAAgAAAAAAAAAAAAAAECVEwABAAAAAAAAAAAAAACocgIgAAAAAAAAAAAAAAAAVU4ABAAAAAAAAAAAAAAAoMoJgAAAAAAAAAAAAAAAAFQ5ARAAAAAAAAAAAAAAAIAqJwACAAAAAAAAAAAAAABQ5QRAAAAAAAAAAAAAAAAAqpwACAAAAAAAAAAAAAAAQJUTAAEAAAAAAAAAAAAAAKhyAiAAAAAAAAAAAAAAAABVTgAEAAAAAAAAAAAAAACgygmAAAAAAAAAAAAAAAAAVDkBEAAAAAAAAAAAAAAAgConAAIAAAAAAAAAAAAAAFDlBEAAAAAAAAAAAAAAAACqnAAIAAAAAAAAAAAAAABAlRMAAQAAAAAAAAAAAAAAqHICIAAAAAAAAAAAAAAAAFVOAAQAAAAAAAAAAAAAAKDKCYAAAAAAAAAAAAAAAABUOQEQAAAAAAAAAAAAAACAKicAAgAAAAAAAAAAAAAAUOUEQAAAAAAAAAAAAAAAAKqcAAgAAAAAAAAAAAAAAECVEwABAAAAAAAAAAAAAACocgIgAAAAAAAAAAAAAAAAVU4ABAAAAAAAAAAAAAAAoMoJgAAAAAAAAAAAAAAAAFQ5ARAAAAAAAAAAAAAAAIAqJwACAAAAAAAAAAAAAABQ5QRAAAAAAAAAAAAAAAAAqpwACAAAAAAAAAAAAAAAQJUTAAEAAAAAAAAAAAAAAKhyAiAAAAAAAAAAAAAAAABVTgAEAAAAAAAAAACA/8/efYfXedd3439r2ZatZdmWbMeSM52EJEBCQhgJNvRhBMIoUKA8rAKGQtuHMvprSwFZQJ+WlhbaQqFxaSmU0odVNoQVmxmSsAI4MQRILMe2JMvy1tb5/SFLkfeSfCTr9bquXJxzz8/RucdJ+L7vDwAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAAAABTnAAIAAAAAAAAAAAAAADAFCcAAgAAAAAAAAAAAAAAMMUJgAAAAAAAAAAAAAAAAExxAiAAAAAAAAAAAAAA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9vb29PT0JElaW1snskQAAAAAAAAAAAAAOCsIgHDW6enpydq1a9PU1JSbb745q1evPm44Y/w63/72t5MkAwMDWbt2bS666KI89KEPzaJFi057P6PrCY0wFRwatKiqqsrVV199UtsoKSnJK17xilOuYfQ82rNnT+64445T3g4AZ95kBfZaWlomZbsAAAAAAAAAAADTnQAIZ51NmzalqakpZWVlWbZsWdra2rJixYoTXqeuri6Dg4PZu3dvli1blj179uRTn/pUFi1alCc96UmZO3fuKe/nVEMjcLrq6+uzY8eOSdv+aLCpoaEhHR0dJxxwGj2PNmzYcMT59fX1E10qABNkMoIaukABAAAAAAAAAAAcnQAI096WLVsOet/c3Jybb745y5Yty+bNm3PDDTcccb3xnTjGr7Nz587s378/TU1N2bx5c57xjGektrY2d999d772ta/laU972kntZ/z+vve972XJkiWHhUYO/QwwGY43UPdUO3CMBpuWLFmSu+++OxdddFE+//nP56UvfWnmz59/zHVHz6Pq6uokOSwU9U//9E+nVBMAAAAAAAAAAAAAnG1Ki10AnK6lS5ce9L6ysjKrV6/O5ZdfftQOG6MD1jds2JC1a9cmydg6j3nMY3LFFVfk2muvzerVq9Pc3Jza2tpce+212b59+0nt59D9dXV15e67705fX182b96cpqamI34GmGhlZWXHXeZUg0ijXTx6e3tTXV2dX/3qVykvL88HPvCB9PT0HHPd0fPoggsuOOJ5dCJ1AwAAAAAAAAAAAMBMoAMIZ6XKysqsWLHiqPNHB6wf2omjsbEx69aty+7du7Nw4cKDtjE4OHhS+xnfYWT8/i655JIsXLgwN95449hg9/Xr1+cLX/jCEbfT2tp6zM96vK4OkCRDQ0PHXeZUg0ijXTyWLFmS3bt3p6amJvv378+FF144dm4dS2VlZRobG48YojqRugGYGMf7zTFZ/JYBAAAAAAAAAAA4MQIgzEijA9aXLVuWzZs354YbbkiSfPWrX82uXbsyd+7cfO9738sjH/nI3HLLLamurs4999xz3IHso0Y7fjQ1NeXmm2/OC1/4wrH9bd269aDwx+nomTMnbUmGBwZSKBSSJA2ZuSd2R2lpSsof+PSzkyw8zjrtScZHe0oHBrLgwN9yOhrOyGdKkpKSkpRWVGTeJO9ztItHW1tbrrvuunzkIx/JhRdeOHasH6pQKKSkpOSEtr1/1qzcf8i0xUn0BTl1u5PsOWRaQ5KKY6yzL8nOQ6YtzMg5xqnpTNI/7n1pkiXHWacrSe8h05YmObGziUMNJ9l6yLS5SeYfY53CgXXG3yVO5F4z1exIcmh/Jr3IAAAAAAAAAAAApr6ZOk6cs8jAwEA2btyY5ubmEw5VjA5Yv+eee3LRRReNTb/yyivHOnckya233polS5akvb09V1xxRS677LIT2v6hHUY6OzvHBsjfcMMNh9W5cuXKXH311Sf4iR8wq78/f5PkbZs358o9e1JIsjlJzUlvafrrS/Ll6uq0nnfe2LShjAxarz3KOncleVAODhPc9Ktf5aH9/dP24rg3I5+5JMndc+fmDRdemJIk/1g2uZGJ8d1w/uAP/iBtbW1HDDr97Gc/y/r16/OEJzzhoHPvSL72qjelfuuv07R6dUpLS/PmIj2ZnuS9r3pVOhctSsmBcFShtDSXbtiQ537840WubHraO3du3vknf5KS4eGxaYXS0rzsX/81TfcfGnkaMVRamre9+c2HrfOsj388V2zYMOk1n41uv+qqfOGpTz3sb7rmGNeaX1xwQf7rBS84bJ0//6u/yuz+/qOuN9WsaWk56DO8+v++P1f/aH1KL7kob/7Lt5+xOorVcQQAAAAAAAAAAGC6mq5jnCHJSKeNb3/727nwwgtz8803Z/Xq1SfVWeOWW27JkiVLcvPNN+dlL3tZLrjgglxwwQXp7e3Nxo0b86UvfSlVVVV5/vOfn/r6+hPe7qEdRh772Mdm06ZNJxVSOZ719yb/5/6KzHtY8twDoYdrk5z7lrek+pvfzK233pre3kOfFX92qqurS3ltbbp+7/eycc2aJMk9ST7ykW/kRzv/Ib+c1Zj6+q7cf/+yLFzYmV27alNdvTfNW/bm+mvemn9+7BWZlZGuCFdffHFe+Za35L//6Z9SV1eXe++9t3gf7CTNmTMnix7+8LQ/7nH5+Zo1uTBJYSDZeluyc/5VZ6yO8WGQQ91+++1Zvnx5PvGJT+TFL35xli49+jPnb53bk6GHXJSWd74zv/v//X9JS0uuTXLhW96SeTPsGJ8Iq1atyve+973kz/4sv9famtcdmP7E3v785cv/Mr+8sCQ5QmeWsr6htLz1P/PV97wuf3Ng/jOT7P5//y+3rF+f9evXZ+XKlVm3bt0Z+yzT2bnnnpuu7u5k7958o7V1rOvC877/izzqm79M2wVzj7hefXtfXvovX8oTXnlDrjww7bIke++8M7d861vOh5M0Z86cNF57bcp/8IP8/MB94xtJfvTez6Vmx0B21x+5J87jb/5pfnLFvfnUQ85NkmxM8oxCIQP79+efp8F949xzz013d3dSKOSDa9bkEQemf3Tvptx32cWp6u4uan0AAAAAAAAAAAAcW0mhcOBx3jANbdy4Md/61rfS0NCQwcHBXH755UcdeH6kde+8887cc889mTt3bgYHB/PqV796LKDR1taWT3/606mtrc2uXbvyR3/0RydVW09PT9ra2rJo0aJ8+MMfTlNTU9ra2o4YUrnjjjtOugPITXckW/Ymyx6RvHxO8oxnPCOfec97kqamsWVmyuldcsig9UKhkHuSfPFlL0t3c/PR1xsYyPy2zXnlf3wws5KUVFcnO3cm5Q9k46bT33D83+Hyyy/PT3/603x6IPnxd5Ls68iapzQcc/1TOQ5PxuDgYN797nenvLw8D33oQ/OIRzwic+bMOeq+/+Wf/znbOjuz/PWvz0uqqnLDDTfkyx/4QHLOOWPLTKfvp9gOOk8e/egMrFuX8vLyvO0vWjJcGEhmzz76yvv2JVdckZYXvjCf/exn8/T585PHPOagRXwXJ+ag72HJkhS2bEmS3PS852frxRclpaVHXnFoKAva2vLof//3XDm6nb17k6qqsUV8Bydu/PewbNmytLW15etJfvbSl2bn8uVHX3FwMGU7uvOm975nZDsXX5xs2DBt7hsHHX/nnJPC5s1Jkte85z2p7+pKkrS0tJyxekY7gIzfZ2tr6xmtAQAAAAAAAAAAYDo5yihDmB6am5vT3d2dwcHBbN68OU3jwg8nsu59992XuXPnZv/+/Wlubk5bW9vY/MbGxqxYsSIXXHBBnva0p510baNdEDo6OtLU1JSysrKxQaYTYXR4acmBs/if/umfklRPyLans2c966djrwfqjvwE91HlwwPZfv55Y+9f9epXJzm8A8J0tHLlLUnGNXQoKf7lvry8PK961avymte8JqtWrRoLfxzN4IFB1CUHBsS///3vj2N8gnznO3n720cGrH/3ec8+5qKlg4OZ09ubgQPdJZ74xCcmOXqwipOxJQeaT+T2Rz8yJcPDhy0xOmB/3t69md3fPzb9m9/8ZpJj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c1nP1NRUrVmzZtz9IiIitHnzZr366qvjbjvVtm3b5tN+W7duneSWzBytra0uM4BIGnM2l6SkJK/PYzabtXHjRv3qV79yrJtIkGHu3LkzbkYGX163kJAQrVu3zvD9qqysdLlBMZMNDQ25VB+SNOkz8CQmJnq9z/BMYiPLtw+XLvemxPSwkpISj2ZKmj17tubPn2+oilJTUzOhnyEAAAAAAAAArm+HDh3Srl27PNo2ODhY69at05o1azyasGiqmUwmPfjggx4NzL311lv11VdfOZatVquampqUkpIylU00oD9q6g0ODmrfvn2GdcuXL/d48Gp0dLQ2bdqkt99+27Hu7NmzWr9+vddtuf/++xUdHe31fs5MJpMeeughr2c5Dw8P93ofScrKylJ+fr6hEkdlZaWWL18+5n579uwxhKpMJpMeffRRxcbGenX+sdpcUVGhhoYGw7pHHnnEENoZy+LFi1VWVmboa6yoqJi2vsPa2lr97Gc/83n/efPm+VSx5Pbbb1dycvK425WUlGj37t2GkMD58+d96qucLJmZmbr11lu92qekpMQwMVt5ebk2b97s0URvPT09LpO6FRcXe3X+QDFysPyw1tZWt9Uc2tvbDf2LkjR//nyVlJR4dJ577rnH0C89NDSkAwcO6M4773S7z+DgoKHCi3Qt3OFJX3ZISIgeeugh/Z//838M15wvvvhCWVlZ4+7v7P7773f7Wo1mZBUKybfJXH3pL54Oly9fdqmwJI09BsQXvlxToqOjtXLlSn366aeOdZWVlSosLPSpDffcc49HlU1WrVqlzz//3BBWqqmpmfRQDAAACBz+v9sFYMax2Wx65513DGVVpWvVNDypljCapUuXjjmbzUjOs0B0d3erubl51O0HBwcN5TWla7MyePoLa35+vsvsDAh858+f17/9278ZSptK135R9+TmobcyMjIMNwHa29tdbqx4ytsbhDPZvHnzDB0L9fX1hvLLM1lbW5teeuklXbp0yeUxX2/yTLakpCSlp6c7lnt6elRfX+/TsVauXOnxts7X8fPnz/t0TgAAAAAAAAAYaenSpfre976nW265JSDCH9K1geqezrodGxvrUj2a+6fXnwsXLrj0hXg7uH/BggWGvtWGhoZxZ7J3lpWVNWZFCm/bM3v27Ek5lqeWLFliWB5vcrahoSGXbUpKSgz9JJPBeYB6RkaG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";
// Cache the original Ground Floor inline plan src on first read; restoring it
// guarantees switching back to GF always returns to the exact same image and
// works offline / when the assets/ folder is missing.
let PLAN_GF_SRC = null;
function setLevel(lvl) {
  clearMarkerSelection();
  const img = document.getElementById('planImg');
  if (PLAN_GF_SRC === null) PLAN_GF_SRC = img.src;
  currentLevel = lvl;
  document.querySelectorAll('.level-btn').forEach(b => b.classList.toggle('active', b.dataset.level === lvl));
  const _f = getFloors().find(x => x.key === lvl);
  img.src = (lvl === firstFloorKey()) ? PLAN_GF_SRC : ((_f && _f.img) ? _f.img : PLAN_GF_SRC);
  // Both GF (transparent PNG) and L2 (white SVG) need invert for dark theme
  img.style.filter = 'invert(1)';
  renderPlan();
}

function renderKPIs() {
  const u = state.units;
  const installed = u.filter(x=>x.status==='installed').length;
  const inProg = u.filter(x=>x.status==='in-progress').length;
  const issues = u.filter(x=>x.status==='issue').length;
  const pending = u.filter(x=>x.status==='pending').length;
  const louvers = u.filter(x=>x.louver==='yes').length;
  const total = u.length;
  const pct = total ? Math.round((installed / total) * 100) : 0;
  { const el=document.getElementById('kpi-installed'); if(el) el.textContent = installed; }
  const _progEl = document.getElementById('kpi-progress'); if(_progEl) _progEl.textContent = inProg;
  { const el=document.getElementById('kpi-issues'); if(el) el.textContent = issues; }
  { const el=document.getElementById('kpi-pending'); if(el) el.textContent = pending; }
  { const el=document.getElementById('kpi-louvers'); if(el) el.textContent = louvers; }
  { const el=document.getElementById('kpi-percent'); if(el) el.textContent = pct + '%'; }
  { const el=document.getElementById('kpi-percent-sub'); if(el) el.textContent = t('kpi_percent_sub_dyn').replace('{installed}', installed).replace('{total}', total); }
  const allPanels = u.flatMap(x => x.glassPanels || (x.glass ? [{ panel: x.panels||'', status: x.glass }] : []));
  const glassInstalled = allPanels.filter(p=>p.status==='installed').length;
  const giEl = document.getElementById('kpi-glass-installed'); if(giEl) giEl.textContent = glassInstalled;
  const giSub = document.getElementById('kpi-glass-installed-sub'); if(giSub) giSub.textContent = glassInstalled + ' / ' + allPanels.length + ' panels';
  if (typeof renderGlassChart === 'function') renderGlassChart();

  // tab counts
  document.getElementById('cnt-all').textContent = total;
  getFloors().forEach(f => { const _el=document.getElementById('cnt-'+f.key); if(_el) _el.textContent = u.filter(x=>(x.level||firstFloorKey())===f.key).length; });
}

function renderUnitGrid() {
  const grid = document.getElementById('unitGrid');
  let units = state.units;
  if (currentZone !== 'all') units = units.filter(u=>(u.level||firstFloorKey())===currentZone);
  // Compute duplicate counts per display id
  const idCounts = {};
  state.units.forEach(u => { idCounts[u.id] = (idCounts[u.id] || 0) + 1; });
  // Per-id running index
  const idSeen = {};
  grid.innerHTML = units.map(u => {
    const planned = isPlanned(u);
    idSeen[u.id] = (idSeen[u.id] || 0) + 1;
    const dupBadge = idCounts[u.id] > 1 ? `<span class="dup-badge">${idSeen[u.id]}/${idCounts[u.id]}</span>` : '';
    if (glassCardFlipMode) {
      const panels = u.glassPanels || (u.glass ? [{panel: u.panels||'', status: u.glass}] : []);
      // Worst-status priority: issue > pending > ready > installed
      var worstGlass = '';
      if (panels.length) {
        var statuses = panels.map(function(p){ return p.status || 'unknown'; });
        if      (statuses.indexOf('issue')   >= 0) worstGlass = 'issue';
        else if (statuses.indexOf('pending') >= 0) worstGlass = 'pending';
        else if (statuses.indexOf('unknown') >= 0) worstGlass = 'pending';
        else if (statuses.indexOf('ready')   >= 0) worstGlass = 'ready';
        else if (statuses.every(function(s){return s==='installed';})) worstGlass = 'installed';
      }
      const glassRows = panels.length && panels.some(function(p){return p.panel || p.status;})
        ? panels.map(function(p) {
            var sc = p.status || 'unknown';
            var stLabel = ({installed:'✓',ready:'R',pending:'·',issue:'!',unknown:'?'})[sc] || '?';
            return '<div class="glass-flip-row">' + (p.panel || '?') +
              '<span class="gf-status ' + sc + '">' + stLabel + '</span></div>';
          }).join('')
        : '<div class="glass-flip-row" style="color:var(--text-dim);font-weight:400">—</div>';
      var cornerDot = worstGlass ? '<span class="gf-corner gfc-' + worstGlass + '" title="Worst glass status: ' + worstGlass + '"></span>' : '';
      var cls2 = 'unit-cell ' + u.status + (planned ? ' planned' : '') + ' glass-flip-card gfc-card-' + (worstGlass || 'none');
      return '<div class="' + cls2 + '" onclick="openUnit(\''+ u.key +'\')">' +
        cornerDot +
        '<div class="glass-flip-sf">' + u.id + dupBadge + '</div>' + glassRows + '</div>';
    }
    const cls = `unit-cell ${u.status}${planned ? ' planned' : ''}`;
    return `
    <div class="${cls}" onclick="openUnit('${u.key}')">
      ${u.louver === 'yes' ? '<span class="badge">L</span>' : ''}
      <div class="unit-id">${u.id}${dupBadge}</div>
      <div class="unit-meta">${u.date ? formatDate(u.date) : '—'}</div>
    </div>`;
  }).join('');
}

function renderTable() {
  let units = state.units.slice();
  if (currentFilter === 'planned') units = units.filter(u=>isPlanned(u));
  else if (currentFilter !== 'all') units = units.filter(u=>u.status===currentFilter && !isPlanned(u));
  // sort: installed first by date desc, then others
  units.sort((a,b)=>{
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.id.localeCompare(b.id);
  });
  document.getElementById('tableBody').innerHTML = units.map(u => {
    const planned = isPlanned(u);
    const rowCls = planned ? ' class="planned-row"' : '';
    const plannedBadge = planned ? `<span class="planned-badge">${t('badge_planned')}</span>` : '';
    return `
    <tr${rowCls} onclick="openUnit('${u.key}')" style="cursor:pointer">
      <td><strong>${u.id}</strong>${(u.level && u.level!==firstFloorKey()) ? ` <span style="font-size:9px;background:var(--purple);color:#fff;padding:1px 5px;border-radius:6px;vertical-align:middle">${_escFloor(u.level)}</span>` : ''}</td>
      <td>${isDoor(u) ? '<span style="color:#22d3ee">Door</span>' : u.type}<br><span style="color:var(--text-dim);font-size:11px">${u.zone}</span></td>
      <td><span class="status-dot ${u.status}"></span>${formatStatus(u.status)}${plannedBadge}</td>
      <td>${u.date ? formatDate(u.date) : '<span style="color:var(--text-dim)">—</span>'}</td>
      <td style="font-size:12px;color:var(--text-dim);max-width:240px">${u.note || ''}</td>
      <td style="min-width:120px">${formatGlassPanels(u)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--text-dim);padding:24px">${t('no_units_match')}</td></tr>`;
}

let _logFilter = '';
function setLogFilter(v) { _logFilter = (v || '').trim().toLowerCase(); renderTimeline(); }
function _logMatches(l) {
  if (!_logFilter) return true;
  // Searchable haystack: content + evidence fields + categories. Multi-word = AND,
  // so "SF07 monadnock" pulls exactly the dispute dossier for that unit+party.
  const hay = [l.content, l.ref, l.party, l.fault, (getCats(l) || []).join(' '),
               (l.autoUnits || []).join ? (l.autoUnits || []).join(' ') : l.autoUnits]
    .filter(Boolean).join(' ').toLowerCase();
  return _logFilter.split(/\s+/).every(tok => hay.includes(tok));
}
function renderTimeline() {
  if (!Array.isArray(state.log)) state.log = Object.values(state.log || {});
  const tl = document.getElementById('timeline');
  // Group log entries by date, preserving original index for edit/delete
  const groups = new Map();
  let _shown = 0;
  state.log.forEach((l, i) => {
    if (!_logMatches(l)) return;
    _shown++;
    if (!groups.has(l.date)) groups.set(l.date, []);
    groups.get(l.date).push({ l, i });
  });
  const cnt = document.getElementById('logFilterCount');
  if (cnt) cnt.textContent = _logFilter ? (_shown + ' / ' + state.log.length) : '';
  const dates = [...groups.keys()].sort((a, b) => b.localeCompare(a));
  // Dot color priority: issue > framing > louver > caulking
  const dotPriority = ['fit-issue', 'issue', 'gc-inquiry', 'field-verify', 'framing', 'glass', 'louver', 'caulking'];
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  tl.innerHTML = dates.map(date => {
    const entries = groups.get(date);
    // Aggregate categories across the day to pick the dot color
    const allCats = new Set();
    entries.forEach(({ l }) => getCats(l).forEach(c => allCats.add(c)));
    const dotCat = dotPriority.find(c => allCats.has(c)) || 'framing';
    const anyPlanned = entries.some(({ l }) => isPlanned(l));
    const cls = `timeline-item ${dotCat}${anyPlanned ? ' planned' : ''}`;
    const badge = anyPlanned ? `<span class="planned-badge">${t('badge_planned')}</span>` : '';

    const entriesHtml = entries.map(({ l, i }) => {
      const cats = getCats(l);
      const tags = cats.map(c => `<span class="tag ${c}">${categoryLabel(c)}</span>`).join('');
      const photos = Array.isArray(l.photos) ? l.photos : [];
      const isIssue = cats.includes('issue');
      // Tapping the entry ALWAYS opens edit (consistent across logs).
      // Photo gallery is reached via the camera badge or any thumbnail.
      const onClick = `editLog(${i})`;
      const title = esc(t('log_click_edit'));
      const camBadge = photos.length
        ? `<span class="tag photo-badge" onclick="event.stopPropagation();openPhotoGallery(${i},0)" style="cursor:pointer" title="${esc(t('photo_open'))}">${t('badge_photo')} ${photos.length}</span>`
        : '';
      const thumbs = photos.length
        ? `<div class="timeline-photos">${photos.slice(0,6).map((p, pi) =>
              `<img src="${p}" alt="photo ${pi+1}" onclick="event.stopPropagation();openPhotoGallery(${i},${pi})">`
            ).join('')}${photos.length>6?`<span class="timeline-photo-more" onclick="event.stopPropagation();openPhotoGallery(${i},6)">+${photos.length-6}</span>`:''}</div>`
        : '';
      const metaPills = [
        l.ref   ? `<span class="meta-pill">Ref <b>${esc(l.ref)}</b></span>` : '',
        l.party ? `<span class="meta-pill">Party <b>${esc(l.party)}</b></span>` : '',
        l.fault ? `<span class="meta-pill">Fault <b>${esc(l.fault)}</b></span>` : ''
      ].filter(Boolean).join('');
      const meta = metaPills ? `<div class="timeline-meta">${metaPills}</div>` : '';
      return `
      <div class="timeline-entry${isIssue?' is-issue':''}" data-log-idx="${i}" onclick="${onClick}" title="${title}">
        <button class="log-delete-btn" onclick="event.stopPropagation();deleteLog(${i})" title="${esc(t('log_delete'))}" aria-label="delete">×</button>
        <div class="timeline-content">${esc(l.content)}</div>
        <div class="timeline-tags">${tags}${camBadge}</div>
        ${meta}
        ${thumbs}
      </div>`;
    }).join('');

    return `
    <div class="${cls}">
      <div class="timeline-date">${formatDate(date)} · ${weekdayCN(date)}${badge}</div>
      ${entriesHtml}
    </div>`;
  }).join('');
}

function isDayMode(){ return document.body.classList.contains('day-mode'); }
function chartTickColor(){ return isDayMode() ? '#59636e' : '#8b949e'; }
function chartGridColor(){ return isDayMode() ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)'; }
function chartTextColor(){ return isDayMode() ? '#1f2328' : '#e6edf3'; }
function chartRingBorder(){ return isDayMode() ? '#ffffff' : '#1a2028'; }

function renderCharts() {
  if (!Array.isArray(state.log)) state.log = Object.values(state.log || {});
  // Trend chart - by date, count by category
  const dates = [...new Set(state.log.map(l=>l.date))].sort();
  const framing = dates.map(d => countCategoryOnDate(d, 'framing'));
  const glass   = dates.map(d => countCategoryOnDate(d, 'glass'));
  const louver  = dates.map(d => countCategoryOnDate(d, 'louver'));
  const caulk   = dates.map(d => countCategoryOnDate(d, 'caulking'));

  if (trendChart) trendChart.destroy();
  trendChart = new Chart(document.getElementById('trendChart'), {
    type: 'bar',
    data: {
      labels: dates.map(d => formatDate(d)),
      datasets: [
        { label:'Framing',  data: framing, backgroundColor: '#3fb950' },
        { label:'Glass',    data: glass,   backgroundColor: '#4493f8' },
        { label:'Louver',   data: louver,  backgroundColor: '#bc8cff' },
        { label:'Caulking', data: caulk,   backgroundColor: '#ff8c42' },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, ticks:{ color:chartTickColor() }, grid:{ color:chartGridColor() } },
        y: { stacked: true, ticks:{ color:chartTickColor(), stepSize:1 }, grid:{ color:chartGridColor() } }
      }
    }
  });

  // Donut
  const counts = {
    installed: state.units.filter(u=>u.status==='installed').length,
    'in-progress': state.units.filter(u=>u.status==='in-progress').length,
    issue: state.units.filter(u=>u.status==='issue').length,
    pending: state.units.filter(u=>u.status==='pending').length,
  };
  if (donutChart) donutChart.destroy();
  // For the Issue slice we feed the tooltip the actual unit IDs + notes so
  // hovering it lists site issues directly (no more bare count).
  const issueUnits = state.units.filter(u => u.status === 'issue');
  const sliceTypes = ['installed','in-progress','issue','pending'];
  donutChart = new Chart(document.getElementById('donutChart'), {
    type: 'doughnut',
    data: {
      labels: ['Installed','Ready','Issue','Pending'],
      datasets: [{
        data: [counts.installed, counts['in-progress'], counts.issue, counts.pending],
        backgroundColor: ['#3fb950','#d29922','#f85149','#4d5764'],
        borderColor: chartRingBorder(),
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      onClick: (evt, els) => {
        if (!els || !els.length) return;
        const kind = sliceTypes[els[0].index];
        if (kind) openKpiDetail(kind === 'in-progress' ? 'progress' : kind);
      },
      onHover: (evt, els) => {
        evt.native.target.style.cursor = (els && els.length) ? 'pointer' : 'default';
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: chartTextColor(), boxWidth: 12, padding: 12 } },
        tooltip: {
          backgroundColor: 'rgba(20,24,30,0.96)',
          borderColor: '#30363d',
          borderWidth: 1,
          titleColor: '#e6edf3',
          bodyColor: '#c9d1d9',
          padding: 10,
          boxPadding: 4,
          callbacks: {
            // For ISSUE slice -> list actual ISSUE units + notes
            label: (ctx) => {
              const i = ctx.dataIndex;
              const v = ctx.parsed;
              if (sliceTypes[i] === 'issue') {
                if (!issueUnits.length) return ctx.label + ': 0';
                const lines = [ctx.label + ': ' + v];
                issueUnits.slice(0, 8).forEach(u => {
                  const n = (u.note || '').toString().trim();
                  lines.push('  • ' + u.id + (n ? ' — ' + (n.length > 60 ? n.slice(0,57)+'…' : n) : ''));
                });
                if (issueUnits.length > 8) lines.push('  …+' + (issueUnits.length - 8) + ' more');
                lines.push(t('pie_click_hint'));
                return lines;
              }
              return ctx.label + ': ' + v;
            }
          }
        }
      }
    }
  });
}

/* ======================================================
   KPI DRILL-DOWN PANEL
   Each KPI card and the donut slices route to openKpiDetail(kind).
   ====================================================== */
function _kpiUnitsForKind(kind) {
  const u = state.units || [];
  switch (kind) {
    case 'installed': return { units: u.filter(x => x.status === 'installed'), title: t('kpi_detail_title_installed') };
    case 'pending':   return { units: u.filter(x => x.status === 'pending'),   title: t('kpi_detail_title_pending') };
    case 'progress':
    case 'in-progress':
    case 'ready':
                      return { units: u.filter(x => x.status === 'in-progress'), title: t('kpi_detail_title_progress') };
    case 'issue':
    case 'issues':    return { units: u.filter(x => x.status === 'issue'),     title: t('kpi_detail_title_issues') };
    case 'louvers':   return { units: u.filter(x => x.louver === 'yes'),       title: t('kpi_detail_title_louvers') };
    case 'percent':   return { units: u.slice(),                               title: t('kpi_detail_title_percent') };
    case 'glass': {
      // Flatten glass panels
      const rows = [];
      u.forEach(x => {
        const panels = x.glassPanels || (x.glass ? [{ panel: x.panels||'', status: x.glass }] : []);
        panels.forEach(p => {
          if (p.status === 'installed') rows.push({ id: x.id, panel: p.panel || '', zone: x.zone, type: x.type, status: 'installed', note: '' });
        });
      });
      return { units: rows, title: t('kpi_detail_title_glass'), variant: 'glass' };
    }
    default: return { units: [], title: t('kpi_detail_title_installed') };
  }
}

function openKpiDetail(kind) {
  const { units, title, variant } = _kpiUnitsForKind(kind);
  const modal = document.getElementById('kpiDetailModal');
  if (!modal) return;
  const titleEl = document.getElementById('kpiDetailTitle');
  const countEl = document.getElementById('kpiDetailCount');
  const bodyEl  = document.getElementById('kpiDetailBody');
  if (titleEl) titleEl.textContent = title;
  if (countEl) countEl.textContent = units.length + '';
  const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  if (!units.length) {
    bodyEl.innerHTML = `<div class="kpi-detail-empty">${esc(t('kpi_detail_empty'))}</div>`;
  } else if (variant === 'glass') {
    bodyEl.innerHTML = `
      <table class="kpi-detail-table">
        <thead><tr>
          <th>${esc(t('col_unit'))}</th>
          <th>${esc(t('col_panel'))}</th>
          <th>${esc(t('col_zone'))}</th>
          <th>${esc(t('col_type'))}</th>
          <th>${esc(t('col_status'))}</th>
        </tr></thead>
        <tbody>${units.map(r => `
          <tr>
            <td><strong>${esc(r.id)}</strong></td>
            <td>${esc(r.panel)}</td>
            <td>${esc(r.zone||'')}</td>
            <td>${esc(r.type||'')}</td>
            <td><span class="status-dot ${r.status}"></span>${esc(formatStatus(r.status))}</td>
          </tr>`).join('')}</tbody>
      </table>`;
  } else {
    bodyEl.innerHTML = `
      <table class="kpi-detail-table">
        <thead><tr>
          <th>${esc(t('col_unit'))}</th>
          <th>${esc(t('col_type'))}</th>
          <th>${esc(t('col_zone'))}</th>
          <th>${esc(t('col_status'))}</th>
          <th>${esc(t('col_date'))}</th>
          <th>${esc(t('col_note'))}</th>
        </tr></thead>
        <tbody>${units.map(u => `
          <tr onclick="closeKpiDetail();openUnit('${esc(u.key)}')" style="cursor:pointer">
            <td><strong>${esc(u.id)}</strong></td>
            <td>${esc(u.type||'')}</td>
            <td>${esc(u.zone||'')}</td>
            <td><span class="status-dot ${u.status}"></span>${esc(formatStatus(u.status))}</td>
            <td>${u.date ? esc(formatDate(u.date)) : '<span style="color:var(--text-dim)">—</span>'}</td>
            <td style="color:var(--text-dim)">${esc(u.note || '')}</td>
          </tr>`).join('')}</tbody>
      </table>`;
  }
  modal.classList.add('show');
}
function closeKpiDetail() {
  const m = document.getElementById('kpiDetailModal');
  if (m) m.classList.remove('show');
}

/* ======================================================
   MAP HIGHLIGHT — driven by ?highlight=SF03,SF20A&order=J04
   Used by Glass Triage to show "where this crate's glass goes"
   ====================================================== */
function applyMapHighlightFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const highlight = params.get('highlight');
  const orderLbl  = params.get('order') || '';
  if (!highlight) {
    window._highlightedSfIds = null;
    return;
  }
  const ids = highlight.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (!ids.length) { window._highlightedSfIds = null; return; }
  window._highlightedSfIds = new Set(ids);
  showHighlightBanner(orderLbl, ids);
  // Re-render so markers pick up the new highlight/dim classes
  if (typeof renderPlan === 'function') renderPlan();
}
function clearMapHighlight() {
  window._highlightedSfIds = null;
  const url = new URL(window.location.href);
  url.searchParams.delete('highlight');
  url.searchParams.delete('order');
  history.replaceState(null, '', url.pathname + (url.search || ''));
  const banner = document.getElementById('highlightBanner');
  if (banner) banner.style.display = 'none';
  if (typeof renderPlan === 'function') renderPlan();
}

/* ---- Embed mode: ?embed=1[&glass=1][&highlight=SF03,...] ---- */
function applyEmbedMode() {
  const ep = new URLSearchParams(window.location.search);
  if (ep.get('embed') !== '1') return;
  document.documentElement.classList.add('embed-mode');
  // Mark the plan section so CSS can show it exclusively
  const planWrap = document.getElementById('planWrap');
  if (planWrap) {
    const sec = planWrap.closest('.section');
    if (sec) sec.classList.add('plan-section');
  }
  // Auto glass mode
  if (ep.get('glass') === '1' && !mapGlassMode) {
    if (typeof toggleMapGlassMode === 'function') toggleMapGlassMode();
  }
}
function showHighlightBanner(orderLbl, ids) {
  let banner = document.getElementById('highlightBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'highlightBanner';
    banner.className = 'highlight-banner';
    const main = document.querySelector('main');
    if (main && main.firstChild) main.insertBefore(banner, main.firstChild);
    else document.body.appendChild(banner);
  }
  const label = orderLbl ? `${orderLbl} · ` : '';
  banner.innerHTML =
    `<span class="hl-icon">📦</span>` +
    `<span class="hl-text">${label}${ids.length} destination${ids.length>1?'s':''} highlighted on plan</span>` +
    `<button class="hl-clear" type="button" onclick="clearMapHighlight()">Clear ×</button>`;
  banner.style.display = 'flex';
}

/* ======================================================
   DRAWINGS — list of OneDrive / web links to project drawings
   ====================================================== */
function openDrawings() {
  renderDrawingsList();
  const m = document.getElementById('drawingsModal');
  if (m) m.classList.add('show');
}
function closeDrawingsModal() {
  const m = document.getElementById('drawingsModal');
  if (m) m.classList.remove('show');
}
function renderDrawingsList() {
  if (!state.drawings) state.drawings = [];
  const wrap = document.getElementById('drawingsList');
  if (!wrap) return;
  const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  if (!state.drawings.length) {
    wrap.innerHTML = `<div class="drawings-empty">${esc(t('drawings_empty'))}</div>`;
    return;
  }
  wrap.innerHTML = state.drawings.map((d, i) => `
    <div class="drawing-row">
      <a class="drawing-link" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer" title="${esc(d.url)}">
        <span class="drawing-icon">📄</span>
        <span class="drawing-name">${esc(d.name || d.url)}</span>
        <span class="drawing-open">${esc(t('drawing_open'))} ↗</span>
      </a>
      <button class="drawing-remove" type="button" onclick="removeDrawing(${i})" title="remove" aria-label="remove">×</button>
    </div>`).join('');
}
function addDrawing() {
  const name = prompt(t('drawing_name_prompt'));
  if (name == null) return;
  const trimmedName = name.trim();
  if (!trimmedName) return;
  const url = prompt(t('drawing_url_prompt'));
  if (url == null) return;
  const trimmedUrl = url.trim();
  if (!/^https?:\/\//i.test(trimmedUrl)) {
    toast(t('drawing_invalid_url'));
    return;
  }
  if (!state.drawings) state.drawings = [];
  state.drawings.push({
    id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
    name: trimmedName,
    url: trimmedUrl,
    addedAt: new Date().toISOString().slice(0,10)
  });
  renderDrawingsList();
  saveState();
}
function removeDrawing(idx) {
  if (!state.drawings || idx < 0 || idx >= state.drawings.length) return;
  if (!confirm(t('drawing_remove_confirm'))) return;
  state.drawings.splice(idx, 1);
  renderDrawingsList();
  saveState();
}

function renderGlassChart() {
  const u = state.units;
  const allPanels = u.flatMap(x => x.glassPanels || (x.glass ? [{ panel: x.panels||'', status: x.glass }] : []));
  const counts = [
    allPanels.filter(p=>p.status==='installed').length,
    allPanels.filter(p=>p.status==='ready').length,
    allPanels.filter(p=>p.status==='pending').length,
    allPanels.filter(p=>p.status==='issue').length,
    allPanels.filter(p=>!p.status||p.status==='').length,
  ];
  const ctx = document.getElementById('glassDonutChart');
  if (!ctx) return;
  if (window._glassChart) window._glassChart.destroy();
  window._glassChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Installed','Ready','Pending','Issue','Unknown'],
      datasets: [{
        data: counts,
        backgroundColor: ['#3fb950','#58a6ff','#4d5764','#f85149','#2d333b'],
        borderColor: chartRingBorder(),
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position:'bottom', labels:{ color: chartTextColor(), boxWidth:12, padding:12 } }
      }
    }
  });
}

/* -------- Helpers -------- */
// Return an array of categories for a log entry. Supports the legacy `category`
// (single string) and the new `categories` (array) fields. Always returns
// at least one item.
function getCats(l) {
  if (Array.isArray(l.categories) && l.categories.length) return l.categories;
  if (l.category) return [l.category];
  return ['framing'];
}
function countCategoryOnDate(date, cat) {
  if (!Array.isArray(state.log)) state.log = Object.values(state.log || {});
  return state.log.filter(l => l.date === date && getCats(l).includes(cat)).reduce((acc, l) => {
    if (cat === 'caulking') return acc + 1;
    // count tokens separated by ·
    return acc + (l.content.match(/[A-Za-z0-9.]+/g) || ['x']).length;
  }, 0);
}
function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${parseInt(m)}/${parseInt(day)}`;
}
function weekdayCN(d) {
  const dd = new Date(d + 'T00:00:00');
  return WEEKDAYS[currentLang][dd.getDay()];
}
function formatGlass(g) {
  if (!g) return '<span style="color:var(--text-dim);font-size:11px">—</span>';
  const map = { pending:['glass-badge glass-pending','Pending'], ready:['glass-badge glass-ready','Ready'], installed:['glass-badge glass-installed','Installed'], issue:['glass-badge glass-issue','Issue'] };
  const [cls,lbl] = map[g]||['glass-badge','?'];
  return `<span class="${cls}">${lbl}</span>`;
}

function formatGlassPanels(u) {
  const panels = u.glassPanels || (u.glass ? [{ panel: u.panels||'', status: u.glass }] : []);
  if (!panels.length) return '<span style="color:var(--text-dim);font-size:11px">—</span>';
  return `<div class="glass-panel-lines">${panels.map(p =>
    `<div class="glass-panel-line">${formatGlass(p.status||'')}${p.panel ? `<span class="panels-label" style="display:inline;margin:0 0 0 4px">${p.panel}</span>` : ''}${p.date ? `<span class="panels-label" style="display:inline;margin:0 0 0 4px;color:var(--text-dim)">${formatDate(p.date)}</span>` : ''}</div>`
  ).join('')}</div>`;
}

/* --- Glass panel list helpers (modal) --- */
function glassStatusOptions(selected) {
  const opts = [['','— Unknown —'],['pending','Pending'],['ready','Ready'],['installed','Installed'],['issue','Issue / Rework']];
  return opts.map(([v,l]) => `<option value="${v}"${selected===v?' selected':''}>${l}</option>`).join('');
}

function renderGlassPanelList(panels) {
  const list = document.getElementById('glass-panels-list');
  const triage = window._triageCache || {};
  list.innerHTML = panels.map((p, i) => {
    // Cross-reference Glass Triage: show triage status next to the panel.
    const tag = String(p.panel || '').trim();
    const key = tag.replace(/[.#$\[\]\/]/g, '_');
    const triageRow = triage[key];
    let triageBadge = '';
    if (triageRow && triageRow.status && triageRow.status !== 'pending') {
      const cls = `triage-${triageRow.status}`;
      const label = ({pending:'pending', unloaded:'on-site', staged:'staged'})[triageRow.status] || triageRow.status;
      triageBadge = `<span class="triage-badge ${cls}" title="From Glass Triage">📦 ${label}</span>`;
    }
    return `
    <div class="glass-panel-row" data-idx="${i}">
      <input type="text" value="${p.panel||''}" placeholder="e.g. 1F-27" autocomplete="off">
      <select>${glassStatusOptions(p.status||'')}</select>
      <input type="date" value="${p.date||''}">
      ${triageBadge}
      <button type="button" class="btn-remove" onclick="removeGlassPanel(${i})" title="Remove">×</button>
    </div>`;
  }).join('');
}

function addGlassPanel() {
  const panels = readGlassPanels();
  panels.push({ panel: '1F-', status: '' });
  renderGlassPanelList(panels);
  // Auto-focus new input with cursor at end
  requestAnimationFrame(() => {
    const rows = document.querySelectorAll('#glass-panels-list .glass-panel-row');
    if (rows.length) {
      const inp = rows[rows.length-1].querySelector('input[type=text]');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    }
  });
}

function removeGlassPanel(idx) {
  const panels = readGlassPanels();
  if (panels.length <= 1) return; // keep at least one
  panels.splice(idx, 1);
  renderGlassPanelList(panels);
}

function readGlassPanels() {
  const rows = document.querySelectorAll('#glass-panels-list .glass-panel-row');
  return Array.from(rows).map(row => ({
    panel:  row.querySelector('input[type=text]').value.trim(),
    status: row.querySelector('select').value,
    date:   row.querySelector('input[type=date]').value
  }));
}
/* -------- R.O. field-verify rows (unit modal) --------
   Stored per unit as u.ro = [{date, stage, dims, by, tol}]. Each new row also
   auto-appends a field-verify log entry — the measurement is evidence, and
   evidence that never reaches the log can't be retrieved in a dispute. */
function renderRoList(rows) {
  const box = document.getElementById('ro-list'); if (!box) return;
  const esc = s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const r = (rows && rows.length) ? rows : [{}];
  box.innerHTML = r.map((m,i)=>`
    <div class="ro-row" style="display:grid;grid-template-columns:1.1fr 1fr 1.6fr 1fr .9fr auto;gap:6px;margin-top:6px">
      <input type="date" value="${esc(m.date)}">
      <select>${['R.O. measure','Order check','Site check'].map(s=>`<option${(m.stage||'R.O. measure')===s?' selected':''}>${s}</option>`).join('')}</select>
      <input type="text" placeholder="e.g. 2140 × 915 (+5 / −0)" value="${esc(m.dims)}" autocomplete="off">
      <input type="text" placeholder="who" value="${esc(m.by)}" autocomplete="off">
      <select><option value=""${!m.tol?' selected':''}>—</option><option value="ok"${m.tol==='ok'?' selected':''}>OK</option><option value="out"${m.tol==='out'?' selected':''}>OUT</option></select>
      <button type="button" class="btn-remove" onclick="removeRoRow(${i})" title="Remove">×</button>
    </div>`).join('');
}
function _roRowsRaw() {
  return Array.from(document.querySelectorAll('#ro-list .ro-row')).map(row=>{
    const f = row.querySelectorAll('input,select');
    return { date:f[0].value, stage:f[1].value, dims:f[2].value.trim(), by:f[3].value.trim(), tol:f[4].value };
  });
}
function readRoRows() { return _roRowsRaw().filter(m=>m.dims||m.by); }
function addRoRow() { const rows=_roRowsRaw(); rows.push({date:new Date().toISOString().slice(0,10),stage:'R.O. measure'}); renderRoList(rows); }
function removeRoRow(i) { const rows=_roRowsRaw(); rows.splice(i,1); renderRoList(rows); }

function formatStatus(s) {
  return { installed:t('status_installed'), 'in-progress':t('status_in_progress'), issue:t('status_issue'), pending:t('status_pending') }[s] || s;
}
function categoryLabel(c) {
  return { framing:'Framing', glass:'Glass', louver:'Louver', caulking:'Caulking', issue:'Issue',
    'fit-issue':'Fit Issue', 'field-verify':'Field Verify', 'gc-inquiry':'GC Inquiry' }[c] || c;
}

/* -------- Modals -------- */
function openUnit(id) {
  const u = state.units.find(x=>x.key===id);
  if (!u) return;
  editingUnitId = id;
  document.getElementById('modalTitle').textContent = t('edit_unit_title').replace('{id}', u.id);
  // Doors don't have "framing" — relabel that tab to "Door" for SD units.
  const _framingTab = document.getElementById('tab-framing');
  if (_framingTab) _framingTab.textContent = isDoor(u) ? 'Door' : 'Framing';
  document.getElementById('m-id').value = u.id;
  document.getElementById('m-status').value = u.status;
  document.getElementById('m-date').value = u.date || '';
  document.getElementById('m-louver').value = u.louver;
  { const _fc = document.getElementById('m-facecap'); if (_fc) _fc.value = u.facecap || 'na'; }
  document.getElementById('m-note').value = u.note || '';
  // populate glass panels list
  let panels = u.glassPanels;
  if (!panels || !panels.length) {
    // migrate legacy string fields or default to 2 empty panels
    if ((typeof u.glass === 'string' && u.glass) || (typeof u.panels === 'string' && u.panels)) {
      // legacy string fields only — some baselines carry empty ARRAYS here, which are truthy
      panels = [{ panel: (typeof u.panels === 'string' ? u.panels : ''), status: (typeof u.glass === 'string' ? u.glass : '') }];
      while (panels.length < 2) panels.push({ panel: '', status: '' });
    } else {
      panels = [{ panel: '1F-', status: '' }, { panel: '1F-', status: '' }];
    }
  }
  renderGlassPanelList(panels);
  renderRoList(Array.isArray(u.ro) ? u.ro : []);
  document.getElementById('m-glass-note').value = u.glassNote || '';
  setElevMode(false);
  const _hasElev = !!((window.ELEVATIONS || {})[u.id] || _elevParentFor(u.id));
  switchModalTab(_hasElev ? 'elev' : 'framing');
  document.getElementById('unitModal').classList.add('show');
}

function switchModalTab(tab) {
  ['elev','ro','framing','glass'].forEach(t => {
    const tb=document.getElementById('tab-'+t), pn=document.getElementById('panel-'+t);
    if (tb) tb.classList.toggle('active', t===tab);
    if (pn) pn.classList.toggle('active', t===tab);
  });
  if (tab==='elev') renderElevation();
}

/* ===== Interactive elevation (per-SF, geometry from window.ELEVATIONS) ===== */
let _elevEdit=false, _elevCurEl=null;
const _ELEV_NEXT_TYPE={glass:'panel',panel:'door',door:'louver',louver:'hidden',hidden:'glass'};
function _elevParentFor(id){ const EL=window.ELEVATIONS||{}; for(const k in EL){ if(EL[k].base && EL[k].base.indexOf('>'+id+'<')>=0) return k; } return null; }
function _elevKey(){ const u=state.units.find(x=>x.key===editingUnitId); if(!u) return null; const EL=window.ELEVATIONS||{}; if(EL[u.id]) return u.id; return _elevParentFor(u.id)||u.id; }
function _elevFrameUnit(){ const key=_elevKey(); return state.units.find(x=>x.id===key) || state.units.find(x=>x.key===editingUnitId) || null; }
function _elevStore(k){ if(!state.elevations)state.elevations={}; const s=state.elevations; if(!s[k])s[k]={el:{},custom:[]}; if(!s[k].el)s[k].el={}; if(!s[k].custom)s[k].custom=[]; return s[k]; }
function _elevSvgPt(svg,e){ const p=svg.createSVGPoint(); p.x=e.clientX; p.y=e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
function renderElevation(){
  const stage=document.getElementById('elevStage'); if(!stage) return;
  const u=state.units.find(x=>x.key===editingUnitId); const key=_elevKey();
  const E=(window.ELEVATIONS||{})[key];
  const kpi=document.getElementById('elevKpis');
  if(!E){ stage.innerHTML='<div class="elev-empty">No elevation imported for <b>'+(key||'?')+'</b> yet.<br>Provide its shop-drawing DXF and I\'ll generate the interactive elevation.</div>'; if(kpi)kpi.innerHTML=''; const fb=document.getElementById('elevFrameBtn'); if(fb)fb.style.display='none'; return; }
  const S=_elevStore(key);
  const parts=E.elements.map(e=>({id:e.id,x:e.x,y:e.y,w:e.w,h:e.h,t0:e.t0}))
              .concat(S.custom.map(c=>({id:c.id,x:c.x,y:c.y,w:c.w,h:c.h,t0:c.type})));
  const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const hot=parts.map(p=>{ const r=S.el[p.id]||{}; const type=r.type||p.t0; const status=r.status||'pending'; const nm=r.name||p.id;
    return '<rect class="el-el" data-id="'+esc(p.id)+'" data-type="'+type+'" data-status="'+status+'" x="'+p.x+'" y="'+p.y+'" width="'+p.w+'" height="'+p.h+'"><title>'+esc(nm)+' · '+type+' · '+status+'</title></rect>'; }).join('');
  stage.innerHTML='<svg id="elevSvg" viewBox="'+E.viewBox+'" xmlns="http://www.w3.org/2000/svg">'+E.base+'<g>'+hot+'</g></svg>';
  const svg=document.getElementById('elevSvg');
  svg.querySelectorAll('.el-el').forEach(el=>{
    el.addEventListener('click',ev=>{ ev.stopPropagation(); openElevStatus(el.dataset.id); });
  });
  let dr=null;
  svg.addEventListener('mousedown',e=>{ if(!_elevEdit||e.target.classList.contains('el-el'))return; const q=_elevSvgPt(svg,e); dr={x:q.x,y:q.y}; });
  svg.addEventListener('mousemove',e=>{ if(!dr)return; const q=_elevSvgPt(svg,e); let t=svg.querySelector('#eltmp'); if(!t){t=document.createElementNS('http://www.w3.org/2000/svg','rect');t.id='eltmp';t.setAttribute('fill','rgba(68,147,248,.2)');t.setAttribute('stroke','#4493f8');svg.appendChild(t);} t.setAttribute('x',Math.min(dr.x,q.x));t.setAttribute('y',Math.min(dr.y,q.y));t.setAttribute('width',Math.abs(q.x-dr.x));t.setAttribute('height',Math.abs(q.y-dr.y)); });
  svg.addEventListener('mouseup',e=>{ if(!dr)return; const q=_elevSvgPt(svg,e); const w=Math.abs(q.x-dr.x),h=Math.abs(q.y-dr.y); const t=svg.querySelector('#eltmp'); if(t)t.remove();
    if(w>2&&h>2){ const s=_elevStore(key); const id='C'+(s.custom.length+1); s.custom.push({id:id,type:'glass',status:'pending',x:+Math.min(dr.x,q.x).toFixed(1),y:+Math.min(dr.y,q.y).toFixed(1),w:+w.toFixed(1),h:+h.toFixed(1)}); saveState(); renderElevation(); }
    dr=null; });
  svg.addEventListener('click',e=>{ if(_elevEdit) return; if(e.target && e.target.closest && e.target.closest('.el-el')) return; openElevFrameStatus(); });
  if(u && u.id!==key){ const h=document.getElementById('elevHint'); if(h) h.textContent='Showing full '+key+' elevation (includes '+u.id+'). Click the door to update it, or the frame/empty area for frame status.'; }
  _renderElevKpis(key,_elevFrameUnit()||u);
  _updateElevFrameBtn();
}
function _renderElevKpis(key,u){
  const kpi=document.getElementById('elevKpis'); if(!kpi) return;
  const S=_elevStore(key); const E=(window.ELEVATIONS||{})[key]; if(!E){kpi.innerHTML='';return;}
  const parts=E.elements.map(e=>({id:e.id,t0:e.t0})).concat(S.custom.map(c=>({id:c.id,t0:c.type})));
  const bt={glass:[0,0],panel:[0,0],louver:[0,0],door:[0,0]};
  parts.forEach(p=>{ const r=S.el[p.id]||{}; const type=r.type||p.t0; const status=r.status||'pending'; if(type==='hidden')return; if(!bt[type])bt[type]=[0,0]; bt[type][1]++; if(status==='installed')bt[type][0]++; });
  const sfI=(u&&u.status==='installed'?1:0)+bt.door[0], sfT=1+bt.door[1];
  const card=(l,i,t)=>'<div class="kpi-card"><div class="kpi-label">'+l+'</div><div class="kpi-value">'+i+'</div><div class="kpi-sub">'+i+' / '+t+' installed</div></div>';
  const fc=(u&&u.facecap)||'na'; const fcT=(fc==='na')?0:1; const fcI=(fc==='yes')?1:0;
  kpi.innerHTML=card('Storefront',sfI,sfT)+card('Glass',bt.glass[0],bt.glass[1])+card('Metal Panel',bt.panel[0],bt.panel[1])+card('Louver',bt.louver[0],bt.louver[1])+card('Face Cap',fcI,fcT);
}
function setElevMode(edit){ _elevEdit=edit;
  const bs=document.getElementById('elevModeStatus'), be=document.getElementById('elevModeEdit');
  if(bs)bs.classList.toggle('btn-primary',!edit); if(be)be.classList.toggle('btn-primary',edit);
  const pe=document.getElementById('panel-elev'); if(pe)pe.classList.toggle('editing',edit);
  const h=document.getElementById('elevHint'); if(h)h.textContent=edit?'Drag on empty area → draw new glass. Click an element → edit its type/status in the popup.':'Click an element to set its status/type · click the frame/empty area for frame status';
}
function _updateElevFrameBtn(){ const b=document.getElementById('elevFrameBtn'); if(!b) return; const key=_elevKey(); const fu=_elevFrameUnit();
  if(!fu||!(window.ELEVATIONS||{})[key]){ b.style.display='none'; return; }
  b.style.display=''; b.textContent='▣ Frame: '+formatStatus(fu.status||'pending');
  b.classList.remove('st-pending','st-in-progress','st-installed','st-issue'); b.classList.add('st-'+(fu.status||'pending'));
}
function openElevFrameStatus(){ const fu=_elevFrameUnit(); if(!fu) return; _elevCurEl='__frame__';
  const nr=document.getElementById('elevStatusName').closest('.form-row'); if(nr)nr.style.display='none';
  const tr=document.getElementById('elevStatusNote').closest('.form-row'); if(tr)tr.style.display='none';
  const ty=document.getElementById('elevStatusTypeRow'); if(ty)ty.style.display='none';
  document.getElementById('elevStatusTitle').textContent=fu.id+' · frame (framing installation)';
  document.getElementById('elevStatusSel').value=fu.status||'pending';
  document.getElementById('elevStatusDate').value=fu.date||'';
  document.getElementById('elevStatusModal').classList.add('show');
}
function openElevStatus(elId){ const key=_elevKey(); if(!key)return; _elevCurEl=elId; const S=_elevStore(key); const E=window.ELEVATIONS[key]||{elements:[]};
  const nr=document.getElementById('elevStatusName').closest('.form-row'); if(nr)nr.style.display='';
  const tr=document.getElementById('elevStatusNote').closest('.form-row'); if(tr)tr.style.display='';
  const base=(E.elements||[]).find(e=>e.id===elId)||S.custom.find(c=>c.id===elId)||{}; const rec=S.el[elId]||{};
  const type=rec.type||base.t0||base.type||'glass';
  const ty=document.getElementById('elevStatusTypeRow'); if(ty)ty.style.display='';
  const tysel=document.getElementById('elevStatusType'); if(tysel)tysel.value=type;
  document.getElementById('elevStatusTitle').textContent=(rec.name||elId)+' · '+type;
  document.getElementById('elevStatusName').value=rec.name||elId;
  document.getElementById('elevStatusSel').value=rec.status||'pending';
  document.getElementById('elevStatusDate').value=rec.date||'';
  document.getElementById('elevStatusNote').value=rec.note||'';
  document.getElementById('elevStatusModal').classList.add('show');
}
function closeElevStatus(){ const m=document.getElementById('elevStatusModal'); if(m)m.classList.remove('show'); }
function saveElevStatus(){ const key=_elevKey(); if(!key||!_elevCurEl)return;
  if(_elevCurEl==='__frame__'){ const fu=_elevFrameUnit();
    if(fu){ fu.status=document.getElementById('elevStatusSel').value; fu.date=document.getElementById('elevStatusDate').value; }
    saveState(); closeElevStatus(); renderElevation(); return; }
  const S=_elevStore(key);
  const nm=document.getElementById('elevStatusName').value.trim();
  S.el[_elevCurEl]=Object.assign({},S.el[_elevCurEl],{
    type:(document.getElementById('elevStatusType')||{}).value||undefined,
    status:document.getElementById('elevStatusSel').value,
    date:document.getElementById('elevStatusDate').value,
    name:(nm && nm!==_elevCurEl)? nm : '',
    note:document.getElementById('elevStatusNote').value
  });
  saveState(); closeElevStatus(); renderElevation();
}
function closeModal() {
  document.getElementById('unitModal').classList.remove('show');
  editingUnitId = null;
}
function deleteUnit() {
  if (!editingUnitId) return;
  const u = state.units.find(x => x.key === editingUnitId);
  if (!u) return;
  if (!confirm(`Delete marker "${u.id}"? This cannot be undone.`)) return;
  state.units = state.units.filter(x => x.key !== editingUnitId);
  delete state.positions[editingUnitId];
  closeModal();
  saveState();
}
function saveUnit() {
  if (!editingUnitId) return;
  const u = state.units.find(x=>x.key===editingUnitId);
  if (!u) return;

  // --- Snapshot OLD values for auto-log diffing ---
  const _oldId     = u.id;
  const _oldStatus = u.status;
  const _oldDate   = u.date || '';
  const _oldLouver = u.louver;
  const _oldFacecap = u.facecap;
  const _oldNote   = u.note || '';
  const _oldGlassPanels = JSON.parse(JSON.stringify(u.glassPanels || []));

  // --- Manual ID rename ---
  const newId = (document.getElementById('m-id').value || '').trim();
  if (!newId) { toast('编号不能为空 / ID required'); return; }
  if (newId !== u.id) {
    const oldId = u.id;
    u.id = newId;
    toast(`已重命名 / Renamed: ${oldId} → ${newId}`);
  }

  u.status = document.getElementById('m-status').value;
  u.date   = document.getElementById('m-date').value;
  u.louver = document.getElementById('m-louver').value;
  { const _fc = document.getElementById('m-facecap'); if (_fc) u.facecap = _fc.value; }
  u.glassPanels = readGlassPanels();
  u.glassNote   = document.getElementById('m-glass-note').value;
  u.note   = document.getElementById('m-note').value;

  // --- R.O. field-verify rows: save + auto-log NEW measurements as evidence ---
  const _oldRoLen = Array.isArray(u.ro) ? u.ro.length : 0;
  u.ro = readRoRows();
  if (u.ro.length > _oldRoLen) {
    u.ro.slice(_oldRoLen).forEach(m => {
      if (!(m.dims || m.by)) return;
      const tolTxt = m.tol==='ok' ? ' · within tolerance' : m.tol==='out' ? ' · OUT of tolerance' : '';
      // NOTE: no auto:true here — the app-log.js projection engine rewrites
      // auto-flagged entries and would mangle this evidence record.
      state.log.push({
        date: m.date || new Date().toISOString().slice(0,10),
        category: 'field-verify', categories: ['field-verify'],
        content: `${u.id} · ${m.stage||'R.O. measure'} ${m.dims||''}${m.by?' · by '+m.by:''}${tolTxt}`
      });
    });
  }

  // --- Auto-generate Daily Log entry from diff ---
  autoLogUnitChanges(u, {
    id: _oldId, status: _oldStatus, date: _oldDate,
    louver: _oldLouver, facecap: _oldFacecap, note: _oldNote, glassPanels: _oldGlassPanels
  });

  closeModal();
  saveState();
}

/* Daily Log helpers moved to app-log.js (must be loaded BEFORE app.js).
   See: autoLogUnitChanges, isUnitAutoEntry, safeKey, autoUnitNorm,
   autoUnitDisplay, rebuildAutoUnitsContent, upsertUnitLog,
   removeUnitFromUnitLogs, upsertGlassLog. */

let editingLogIdx = null;
function setLogCategoryCheckboxes(cats) {
  const set = new Set(cats);
  document.querySelectorAll('#l-categories input[type="checkbox"]').forEach(cb => {
    cb.checked = set.has(cb.value);
  });
}
function getLogCategoryCheckboxes() {
  return Array.from(document.querySelectorAll('#l-categories input[type="checkbox"]:checked')).map(cb => cb.value);
}
/* -------- Daily Log photo helpers --------
   Photos are uploaded to Firebase Storage; only the download URL is stored
   in entry.photos[], keeping state.json small and Firebase-sync-safe. */
let _logPhotosDraft = [];   // in-progress photos for the open log modal

// Compress image file → Blob (JPEG)
function _photoFileToBlob(file, maxEdge = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('img failed'));
      img.onload = () => {
        let { width: w, height: h } = img;
        const scale = Math.min(1, maxEdge / Math.max(w, h));
        w = Math.round(w * scale); h = Math.round(h * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/jpeg', quality);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Upload compressed blob to Firebase Storage, return download URL
async function _uploadPhotoToStorage(blob, originalName) {
  const storage = firebase.storage();
  const filename = `cp2-photos/${Date.now()}_${(originalName || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const ref = storage.ref(filename);
  await ref.put(blob, { contentType: 'image/jpeg' });
  return await ref.getDownloadURL();
}

// Delete a photo from Storage if it's a Storage URL (fire-and-forget)
function _deleteStoragePhoto(url) {
  if (!url || !url.startsWith('https://firebasestorage')) return;
  try { firebase.storage().refFromURL(url).delete().catch(() => {}); } catch(e) {}
}

let _logPhotosBusy = 0;   // in-flight upload count
async function handleLogPhotoFiles(fileList) {
  if (!fileList || !fileList.length) return;
  _logPhotosBusy++;
  const status = document.getElementById('l-photo-status');
  if (status) status.textContent = t('photo_processing');
  try {
    for (const f of Array.from(fileList)) {
      if (!f.type || !f.type.startsWith('image/')) continue;
      try {
        const blob = await _photoFileToBlob(f);
        let ref;
        try {
          ref = await _uploadPhotoToStorage(blob, f.name);
        } catch(e) {
          // Fallback: store as data-URL if Storage unavailable
          console.warn('[log photo] Storage upload failed, falling back to data-URL', e);
          ref = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
        }
        _logPhotosDraft.push(ref);
        renderLogPhotoThumbs();
      } catch(e) { console.warn('[log photo] failed', e); }
    }
  } finally {
    _logPhotosBusy--;
    if (status && _logPhotosBusy === 0) status.textContent = '';
  }
}

function removeLogPhoto(idx) {
  if (!confirm(t('photo_remove_confirm'))) return;
  _deleteStoragePhoto(_logPhotosDraft[idx]);
  _logPhotosDraft.splice(idx, 1);
  renderLogPhotoThumbs();
}

function renderLogPhotoThumbs() {
  const wrap = document.getElementById('l-photo-thumbs');
  if (!wrap) return;
  if (!_logPhotosDraft.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = _logPhotosDraft.map((src, i) => `
    <div class="log-photo-thumb">
      <img src="${src}" alt="photo ${i+1}">
      <button type="button" class="log-photo-thumb-x" onclick="removeLogPhoto(${i})" title="remove" aria-label="remove">×</button>
    </div>`).join('');
}

function openAddLog() {
  editingLogIdx = null;
  document.querySelector('#logModal h3').textContent = t('modal_add_log');
  document.getElementById('l-date').value = new Date().toISOString().slice(0,10);
  setLogCategoryCheckboxes(['framing']);
  document.getElementById('l-content').value = '';
  setRespFields({});
  _logPhotosDraft = [];
  renderLogPhotoThumbs();
  const inp = document.getElementById('l-photo-input'); if (inp) inp.value = '';
  document.getElementById('logDeleteBtn').style.display = 'none';
  document.getElementById('logModal').classList.add('show');
}
function editLog(idx) {
  const entry = state.log[idx];
  if (!entry) return;
  editingLogIdx = idx;
  document.querySelector('#logModal h3').textContent = t('modal_edit_log');
  document.getElementById('l-date').value = entry.date || '';
  setLogCategoryCheckboxes(getCats(entry));
  document.getElementById('l-content').value = entry.content || '';
  setRespFields(entry);
  _logPhotosDraft = Array.isArray(entry.photos) ? entry.photos.slice() : [];
  renderLogPhotoThumbs();
  const inp = document.getElementById('l-photo-input'); if (inp) inp.value = '';
  document.getElementById('logDeleteBtn').style.display = '';
  document.getElementById('logModal').classList.add('show');
}
// Responsibility/evidence fields (ref / party / fault) in the log modal
function setRespFields(entry) {
  const r = document.getElementById('l-ref');
  const p = document.getElementById('l-party');
  const f = document.getElementById('l-fault');
  if (r) r.value = entry.ref || '';
  if (p) p.value = entry.party || '';
  if (f) f.value = entry.fault || '';
}
function deleteLog(idx) {
  const entry = state.log[idx];
  if (!entry) return;
  if (!confirm(t('confirm_log_delete').replace('{content}', entry.content))) return;
  // Clean up photos from Firebase Storage
  (entry.photos || []).forEach(_deleteStoragePhoto);
  state.log.splice(idx, 1);
  closeLogModal();
  saveState();
  toast(t('msg_log_deleted'));
}
function deleteLogFromModal() {
  if (editingLogIdx === null) return;
  deleteLog(editingLogIdx);
}
function closeLogModal() {
  document.getElementById('logModal').classList.remove('show');
  editingLogIdx = null;
  // pending compressions can still write to draft, but next openAddLog/editLog clears it
}
function saveLog() {
  if (_logPhotosBusy > 0) {
    toast('照片处理中，请稍等 / Photos still processing, please wait');
    return;
  }
  const cats = getLogCategoryCheckboxes();
  if (!cats.length) { toast(t('alert_pick_category')); return; }
  const entry = {
    date: document.getElementById('l-date').value,
    categories: cats,
    category: cats[0], // legacy compat
    content: document.getElementById('l-content').value.trim(),
    photos: _logPhotosDraft.slice()
  };
  // Responsibility/evidence fields — only stored when non-empty
  const _ref   = (document.getElementById('l-ref')   || {}).value;
  const _party = (document.getElementById('l-party') || {}).value;
  const _fault = (document.getElementById('l-fault') || {}).value;
  if (_ref   && _ref.trim())   entry.ref   = _ref.trim();
  if (_party && _party.trim()) entry.party = _party.trim();
  if (_fault && _fault.trim()) entry.fault = _fault.trim();
  if (!entry.date || !entry.content) { toast(t('alert_fill_required')); return; }
  if (editingLogIdx !== null) {
    // Preserve auto/kind/autoUnits metadata when editing an auto-generated entry
    const prev = state.log[editingLogIdx] || {};
    if (prev.auto)      entry.auto = prev.auto;
    if (prev.kind)      entry.kind = prev.kind;
    if (prev.autoUnits) entry.autoUnits = prev.autoUnits;
    state.log[editingLogIdx] = entry;
  } else {
    state.log.push(entry);
  }
  closeLogModal();
  saveState();
}

/* -------- Photo gallery viewer (ISSUE logs) -------- */
let _galleryPhotos = [];
let _galleryIdx = 0;
let _galleryLogIdx = null;
function openPhotoGallery(logIdx, startIdx) {
  const entry = state.log[logIdx];
  if (!entry || !Array.isArray(entry.photos) || !entry.photos.length) return;
  _galleryLogIdx = logIdx;
  _galleryPhotos = entry.photos.slice();
  _galleryIdx = Math.max(0, Math.min(startIdx|0, _galleryPhotos.length - 1));
  const title = document.getElementById('photoGalleryTitle');
  if (title) {
    const cats = getCats(entry);
    title.textContent = (cats.includes('issue') ? '⚠ ' : '') +
      t('photo_gallery_title') + ' · ' + (entry.date || '') +
      (entry.content ? ' · ' + entry.content : '');
  }
  renderGalleryView();
  document.getElementById('photoGalleryModal').classList.add('show');
}
function closePhotoGallery() {
  document.getElementById('photoGalleryModal').classList.remove('show');
  _galleryPhotos = []; _galleryIdx = 0; _galleryLogIdx = null;
}
// Bridge: switch from photo gallery into the edit modal for the same log.
function editLogFromGallery() {
  if (_galleryLogIdx == null) return;
  const idx = _galleryLogIdx;
  closePhotoGallery();
  editLog(idx);
}
function renderGalleryView() {
  const img = document.getElementById('photoGalleryImg');
  const counter = document.getElementById('photoGalleryCounter');
  const strip = document.getElementById('photoGalleryStrip');
  if (!img) return;
  img.src = _galleryPhotos[_galleryIdx] || '';
  if (counter) counter.textContent = (_galleryIdx + 1) + ' / ' + _galleryPhotos.length;
  if (strip) {
    strip.innerHTML = _galleryPhotos.map((p, i) =>
      `<img src="${p}" class="${i===_galleryIdx?'active':''}" onclick="galleryGoto(${i})" alt="thumb ${i+1}">`
    ).join('');
  }
}
function galleryGoto(i) {
  if (i < 0 || i >= _galleryPhotos.length) return;
  _galleryIdx = i; renderGalleryView();
}
function galleryPrev() { galleryGoto((_galleryIdx - 1 + _galleryPhotos.length) % _galleryPhotos.length); }
function galleryNext() { galleryGoto((_galleryIdx + 1) % _galleryPhotos.length); }

/* -------- Import / Export / Reset -------- */
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${PROJECT.fileSlug || 'tracker'}_progress_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(t('msg_exported'));
}
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.units && data.log) {
        state = data;
        saveState();
        toast(t('msg_import_ok'));
      } else { toast(t('alert_invalid_format')); }
    } catch(err) { toast(t('alert_json_parse_fail')); }
  };
  reader.readAsText(file);
  e.target.value = '';
}
function resetData() {
  // Cloud mode: Reset must NEVER push the blank seed to the shared database —
  // that would wipe the whole team's data. Instead, drop the local cache and
  // reload; the page rebuilds from cloud truth.
  if (window._cloudQueuePush) {
    if (!confirm(t('confirm_reset_cloud'))) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BASELINE_KEY);
    location.reload();
    return;
  }
  if (!confirm(t('confirm_reset'))) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(BASELINE_KEY);
  state = loadState();
  saveState(false);
  toast(t('msg_reset'));
}

/* ======================================================
   GLASS CARD FLIP (Unit Grid)
   ====================================================== */
let glassCardFlipMode = false;

function toggleCardFlip() {
  glassCardFlipMode = !glassCardFlipMode;
  renderUnitGrid();
  requestAnimationFrame(() => {
    document.querySelectorAll('#unitGrid .unit-cell').forEach(c => {
      c.classList.add('cell-flip-in');
      c.addEventListener('animationend', () => c.classList.remove('cell-flip-in'), { once: true });
    });
  });
  const btn = document.getElementById('glassFlipBtn');
  if (btn) btn.textContent = glassCardFlipMode ? '📋 Status View' : '🪟 Glass View';
}

/* ======================================================
   MAP GLASS MODE
   ====================================================== */
let mapGlassMode      = false;
let mapGlassBatchMode = false;
let selectedGlassPanels = [];

function toggleMapGlassMode() {
  mapGlassMode = !mapGlassMode;
  const wrap     = document.getElementById('planWrap');
  const btn      = document.getElementById('glassMapBtn');
  const batchBtn = document.getElementById('glassBatchBtn');
  const hideSfBtn = document.getElementById('hideSfBtn');
  if (mapGlassMode) {
    wrap.classList.add('glass-mode');
    clearMarkerSelection();   // drop any SF box-selection so it can't show under glass mode
    if (btn) { btn.textContent = '🗺 SF View'; btn.classList.add('btn-primary'); }
    if (batchBtn) batchBtn.style.display = '';
    if (hideSfBtn) hideSfBtn.style.display = '';
    renderGlassMarkers();
  } else {
    wrap.classList.remove('glass-mode');
    wrap.classList.remove('hide-sf');   // reset so SF markers reappear in SF view
    wrap.querySelectorAll('.glass-marker').forEach(el => el.remove());
    if (btn) { btn.textContent = '🪟 Glass Mode'; btn.classList.remove('btn-primary'); }
    if (batchBtn) { batchBtn.style.display = 'none'; batchBtn.textContent = '☑ Batch Select'; batchBtn.classList.remove('btn-primary'); }
    if (hideSfBtn) { hideSfBtn.style.display = 'none'; hideSfBtn.textContent = '🙈 Hide SF'; hideSfBtn.classList.remove('btn-primary'); }
    mapGlassBatchMode = false;
    selectedGlassPanels = [];
    document.getElementById('glassBatchBar').style.display = 'none';
  }
}

// Toggle full hiding of SF/door markers while in glass mode (vs. the default dim).
function toggleHideSf() {
  const wrap = document.getElementById('planWrap');
  if (!wrap) return;
  const hidden = wrap.classList.toggle('hide-sf');
  const btn = document.getElementById('hideSfBtn');
  if (btn) {
    btn.textContent = hidden ? '👁 Show SF' : '🙈 Hide SF';
    btn.classList.toggle('btn-primary', hidden);
  }
}

// Door Mode: show only doors (SD units) on the floor plan; hide storefront markers.
function toggleDoorMode() {
  doorMode = !doorMode;
  const btn = document.getElementById('doorModeBtn');
  if (btn) {
    btn.textContent = doorMode ? '🚪 All Units' : '🚪 Door Mode';
    btn.classList.toggle('btn-primary', doorMode);
  }
  renderPlan();
}

function toggleGlassBatchMode() {
  mapGlassBatchMode = !mapGlassBatchMode;
  const btn = document.getElementById('glassBatchBtn');
  const bar = document.getElementById('glassBatchBar');
  if (mapGlassBatchMode) {
    if (btn) { btn.textContent = '✕ Cancel Batch'; btn.classList.add('btn-primary'); }
    bar.style.display = 'flex';
    selectedGlassPanels = [];
    document.getElementById('glassBatchCount').textContent = '0';
  } else {
    if (btn) { btn.textContent = '☑ Batch Select'; btn.classList.remove('btn-primary'); }
    bar.style.display = 'none';
    selectedGlassPanels = [];
  }
  renderGlassMarkers();
}

function getPanelOffsets(n, zone) {
  // Fan glass markers OUTWARD from the SF marker along the wall's outward normal.
  // Direction by unit zone: North=up, South=down, East=right, West=left.
  // Mobile: viewport < 700px gets a slightly bigger step so labels don't overlap.
  //         Capped low enough that even SFs with many panels stay on the plan.
  const isMobile = (typeof window !== 'undefined' && window.innerWidth < 700);
  const step = isMobile ? 3.4 : 2.4;
  let ax = 0, ay = -1; // default to North
  switch ((zone || 'North').toLowerCase()) {
    case 'north': ax =  0; ay = -1; break;
    case 'south': ax =  0; ay =  1; break;
    case 'east':  ax =  1; ay =  0; break;
    case 'west':  ax = -1; ay =  0; break;
  }
  return Array.from({length: n}, (_, i) => ({
    dx: ax * (i + 1) * step,
    dy: ay * (i + 1) * step
  }));
}

function renderGlassMarkers() {
  const wrap = document.getElementById('planWrap');
  wrap.querySelectorAll('.glass-marker').forEach(el => el.remove());
  if (!mapGlassMode) return;
  const editMode = document.getElementById('editPositionMode').checked;
  if (!state.glassPanelOffsets) state.glassPanelOffsets = {};
  state.units.forEach(u => {
    if ((u.level || firstFloorKey()) !== currentLevel) return;
    if (PROJECT.requirePlacedMarkers && !state.positions[u.key]) return;
    const pos    = state.positions[u.key] || { x:50, y:50 };
    const panels = u.glassPanels || (u.glass ? [{panel: u.panels||'', status: u.glass}] : []);
    if (!panels.length) return;
    const offsets = getPanelOffsets(panels.length, u.zone);
    const customMap = state.glassPanelOffsets[u.key] || {};
    panels.forEach((p, pi) => {
      const off   = customMap[pi] || offsets[pi];
      const sc    = p.status || 'unknown';
      const isSel = selectedGlassPanels.some(x => x.unitKey === u.key && x.panelIdx === pi);
      const el    = document.createElement('div');
      el.className = 'glass-marker gm-' + sc + (isSel ? ' selected' : '');
      el.style.left = (pos.x + off.dx) + '%';
      el.style.top  = (pos.y + off.dy) + '%';
      const label = p.panel ? p.panel.replace(/^1F-/i, '') : '?';
      el.textContent = label;
      el.title = u.id + ' · ' + (p.panel || '?') + ' · ' + sc + (p.date ? ' · ' + p.date : '');
      el.dataset.unitKey  = u.key;
      el.dataset.panelIdx = pi;
      el.onpointerdown = function(e) {
        if (placeMode) return;
        e.stopPropagation();
      };
      el.onclick = function(e) {
        e.stopPropagation();
        if (dragState && dragState.moved) { dragState = null; return; }
        if (mapGlassBatchMode) { toggleGlassPanelSelect(el, u.key, pi); return; }
        openUnit(u.key);
        if (typeof switchModalTab === 'function') switchModalTab('glass');
      };
      if (editMode) {
        el.style.cursor = 'grab';
        el.onmousedown = function(e) {
          if (mapGlassBatchMode) return;
          e.preventDefault();
          e.stopPropagation();
          const rect = wrap.getBoundingClientRect();
          const startX = ((e.clientX - rect.left) / rect.width)  * 100;
          const startY = ((e.clientY - rect.top)  / rect.height) * 100;
          // If this dot is part of a multi-selection, drag moves the whole group.
          const inSel = selectedGlassPanels.some(s => s.unitKey === u.key && s.panelIdx === pi);
          const glassMulti = inSel && selectedGlassPanels.length > 1;
          dragState = {
            glassPanel: true,
            glassMulti: glassMulti,
            unitKey: u.key,
            panelIdx: pi,
            sfPos: pos,
            el: el,
            rect: rect,
            moved: false,
            startX: startX,
            startY: startY
          };
          if (glassMulti) {
            dragState.glassItems = selectedGlassPanels.map(s => {
              const gEl = wrap.querySelector(`.glass-marker[data-unit-key="${CSS.escape(s.unitKey)}"][data-panel-idx="${s.panelIdx}"]`);
              if (!gEl) return null;
              return {
                unitKey: s.unitKey,
                panelIdx: s.panelIdx,
                el: gEl,
                startLeft: parseFloat(gEl.style.left),
                startTop:  parseFloat(gEl.style.top),
                sfPos: state.positions[s.unitKey] || { x: 50, y: 50 }
              };
            }).filter(Boolean);
          }
          el.style.cursor = 'grabbing';
          hidePlanTooltip();
        };
      }
      el.addEventListener('mouseenter', function() {
        const tt = document.getElementById('planTooltip');
        const stLabel = ({installed:'Installed',ready:'Ready',pending:'Pending',issue:'Issue',unknown:'Unknown'})[sc] || sc;
        tt.innerHTML = '<strong>' + (p.panel || '?') + '</strong>&nbsp;<span style="color:var(--text-dim)">(' + u.id + ')</span><br><span style="color:var(--text-dim)">' + stLabel + (p.date ? ' · ' + formatDate(p.date) : '') + '</span>';
        const rect     = el.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        tt.style.left    = (rect.left - wrapRect.left + rect.width / 2) + 'px';
        tt.style.top     = (rect.top  - wrapRect.top) + 'px';
        tt.style.display = 'block';
      });
      el.addEventListener('mouseleave', hidePlanTooltip);
      wrap.appendChild(el);
    });
  });
}

function toggleGlassPanelSelect(el, unitKey, panelIdx) {
  const i = selectedGlassPanels.findIndex(function(x) { return x.unitKey === unitKey && x.panelIdx === panelIdx; });
  if (i >= 0) {
    selectedGlassPanels.splice(i, 1);
    el.classList.remove('selected');
  } else {
    selectedGlassPanels.push({unitKey: unitKey, panelIdx: panelIdx});
    el.classList.add('selected');
  }
  document.getElementById('glassBatchCount').textContent = selectedGlassPanels.length;
}

function applyGlassBatch() {
  const status = document.getElementById('glassBatchStatus').value;
  const date   = document.getElementById('glassBatchDate').value;
  if (!status && !date) { toast('请先选择状态或日期 / Select a status or date first'); return; }
  const count = selectedGlassPanels.length;
  if (!count) { toast('未选中任何玻璃 / No panels selected'); return; }
  const touched = []; // collect actual changes for auto-log
  selectedGlassPanels.forEach(function(item) {
    const u = state.units.find(function(x) { return x.key === item.unitKey; });
    if (!u || !u.glassPanels) return;
    const p = u.glassPanels[item.panelIdx];
    if (!p) return;
    const oldStatus = p.status || '';
    const oldDate   = p.date   || '';
    if (status) p.status = status;
    if (date)   p.date   = date;
    if ((status && status !== oldStatus) || (date && date !== oldDate)) {
      touched.push({ unitId: u.id, panel: p.panel || '' });
    }
  });
  // Auto-log: glass entries are kind='glass' so unit-modal saves don't sweep them away.
  // Log date follows the panel's date when the batch sets one, otherwise today.
  if (touched.length) {
    const logDate = date || new Date().toISOString().slice(0,10);
    const cat     = status === 'issue' ? 'issue' : 'glass';
    touched.forEach(function(t) {
      upsertGlassLog(logDate, cat, t.unitId, t.panel, status);
    });
  }
  selectedGlassPanels = [];
  saveState();
  renderGlassMarkers();
  renderKPIs();
  document.getElementById('glassBatchCount').textContent = '0';
  toast('已更新 ' + count + ' 块玻璃 / Updated ' + count + ' glass panel' + (count > 1 ? 's' : ''));
}

function clearGlassBatch() {
  selectedGlassPanels = [];
  document.getElementById('glassBatchCount').textContent = '0';
  renderGlassMarkers();
}

/* -------- Event bindings -------- */
document.getElementById('zoneTabs').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('#zoneTabs .tab').forEach(t=>t.classList.remove('active'));
  tab.classList.add('active');
  currentZone = tab.dataset.zone;
  renderUnitGrid();
});
document.getElementById('filters').addEventListener('click', e => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  document.querySelectorAll('#filters .filter-chip').forEach(c=>c.classList.remove('active'));
  chip.classList.add('active');
  currentFilter = chip.dataset.filter;
  renderTable();
});
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('show');
  });
});

/* ======================================================
   ONE-TIME PHOTO MIGRATION — legacy log entries store photos as base64
   data-URLs, which blow up state size (localStorage quota + slow Firebase
   pushes). Once signed in, upload each data-URL photo to Firebase Storage
   (cp2-photos/) and replace it with the download URL. Idempotent: after a
   successful run no data: photos remain, so it never runs again. Failed
   uploads keep their data-URL and retry on next load.
   ====================================================== */
let _photoMigrationRan = false;   // once per session

function _dataUrlToBlob(dataUrl) {
  const m = String(dataUrl).match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
  if (!m) return null;
  const mime = m[1] || 'image/jpeg';
  if (!mime.startsWith('image/')) return null;   // Storage rules require image/*
  try {
    const bin = m[2] ? atob(m[3]) : decodeURIComponent(m[3]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch (e) { return null; }
}

async function migrateLegacyPhotos() {
  if (_photoMigrationRan) return;
  if (!state || !Array.isArray(state.log)) return;
  if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return;
  if (!firebase.auth().currentUser) return;       // need auth for Storage rules

  // Collect all data-URL photos
  const jobs = [];
  state.log.forEach((l, li) => {
    if (l && Array.isArray(l.photos)) {
      l.photos.forEach((p, pi) => {
        if (String(p).startsWith('data:')) jobs.push({ li, pi });
      });
    }
  });
  if (!jobs.length) return;
  _photoMigrationRan = true;

  toast(`正在把 ${jobs.length} 张老照片迁移到云存储… / Migrating ${jobs.length} legacy photos`);
  let ok = 0, fail = 0;
  for (const j of jobs) {
    const entry = state.log[j.li];
    if (!entry || !entry.photos) continue;
    const blob = _dataUrlToBlob(entry.photos[j.pi]);
    if (!blob) { fail++; continue; }
    if (blob.size >= 10 * 1024 * 1024) { fail++; continue; }  // Storage rule limit
    try {
      const url = await _uploadPhotoToStorage(blob, `migrated_${entry.date || 'log'}_${j.li}_${j.pi}.jpg`);
      entry.photos[j.pi] = url;
      ok++;
    } catch (e) {
      console.warn('AC3 photo migration: upload failed, keeping data-URL for retry', e);
      fail++;
    }
  }
  if (ok > 0) {
    saveState(false, `photo migration: ${ok} moved to Storage`);
    toast(`✓ 照片迁移完成：${ok} 张已上云${fail ? `，${fail} 张失败（下次加载重试）` : ''}`);
  } else if (fail > 0) {
    _photoMigrationRan = false;   // nothing succeeded — allow retry
    console.warn(`AC3 photo migration: all ${fail} uploads failed`);
  }
}

// Run once signed in (covers both fresh sign-in and already-signed-in reload).
function _armPhotoMigration() {
  try {
    if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return;
    firebase.auth().onAuthStateChanged(u => {
      if (u) setTimeout(migrateLegacyPhotos, 2500);  // let initial cloud sync settle first
    });
  } catch (e) { console.warn('photo migration arm failed', e); }
}


/* ======================================================
   FEATURE MODULES — PM-facing on/off switches, no code needed.
   Stored in state.features (cloud-synced, last-save-wins, shows in
   Edit History like any other change). PROJECT config stays the
   install-time default; these are runtime toggles for the whole team.
   Off = the entry point is hidden. Data is never deleted.
   ====================================================== */
const FEATURE_MODULES = [
  { k:'themeToggle',   emoji:'☀️', label:{en:'Day / Night toggle',zh:'Day / Night 切换按钮',ko:'주간/야간 전환'},            sel:['#themeToggle'] },
  { k:'roTab',         emoji:'📐', label:{en:'Field Verify · R.O. tab',zh:'Field Verify · R.O. 实测 tab',ko:'Field Verify · R.O. 실측 tab'},    sel:['#tab-ro'] },
  { k:'logFilter',     emoji:'🔍', label:{en:'Daily-log search (evidence)',zh:'日志检索框（证据调取）',ko:'일지 검색(증거 조회)'},           sel:['#logFilter','#logFilterCount'] },
  { k:'chatLink',      emoji:'💬', label:{en:'Chat NL updater',zh:'Chat 自然语言更新入口',ko:'Chat 자연어 업데이트 입구'},            sel:['a[href="/chat"]'] },
  { k:'warehouseLink', emoji:'📦', label:{en:'Warehouse page',zh:'Warehouse 仓库页入口',ko:'Warehouse 창고 페이지 입구'},             sel:['a[href="warehouse.html"]'] },
  { k:'drawingsBtn',   emoji:'📁', label:{en:'Drawings button',zh:'Drawings 图纸按钮',ko:'Drawings 도면 버튼'},                sel:['button[onclick="openDrawings()"]'] },
];
function moduleLabel(m){ const L=m.label; return (m.emoji?m.emoji+' ':'')+((L&&(L[currentLang]||L.en))||m.k); }
function _modT(){
  if(currentLang==='zh') return {title:'⚙ Modules · 功能模块', desc:'对整个团队生效（保存后云端同步，Edit History 可查）。关闭只是隐藏入口，数据不会删除。', cancel:'取消', save:'保存'};
  if(currentLang==='ko') return {title:'⚙ Modules · 기능 모듈', desc:'팀 전체에 적용(저장 시 클라우드 동기화, Edit History에 표시). 끄면 입구만 숨기며 데이터는 삭제되지 않습니다.', cancel:'취소', save:'저장'};
  return {title:'⚙ Modules', desc:'Applies to the whole team (cloud-synced on save, shows in Edit History). Off just hides the entry — data is never deleted.', cancel:'Cancel', save:'Save'};
}
function featureOn(k){ const f=(typeof state!=='undefined' && state && state.features)||{}; return f[k]!==false; }
function applyFeatures(){
  if(typeof state==='undefined' || !state) return;
  FEATURE_MODULES.forEach(m=>{
    const on=featureOn(m.k);
    m.sel.forEach(q=>document.querySelectorAll(q).forEach(el=>{ el.style.display = on ? '' : 'none'; }));
  });
}
function openModules(){
  let ov=document.getElementById('modulesModal');
  if(!ov){
    ov=document.createElement('div'); ov.id='modulesModal'; ov.className='modal-overlay';
    ov.innerHTML='<div class="modal" style="max-width:430px"><h3>'+_modT().title+'</h3>'
      +'<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px">'+_modT().desc+'</div>'
      +'<div id="modulesList"></div><div class="modal-actions">'
      +'<button class="btn" type="button" onclick="closeModules()">'+_modT().cancel+'</button>'
      +'<button class="btn btn-primary" type="button" onclick="saveModules()">'+_modT().save+'</button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{ if(e.target===ov) ov.classList.remove('show'); });
  }
  ov.querySelector('#modulesList').innerHTML = FEATURE_MODULES.map(m=>
    '<label style="display:flex;gap:10px;align-items:center;padding:7px 2px;cursor:pointer">'
    +'<input type="checkbox" data-k="'+m.k+'"'+(featureOn(m.k)?' checked':'')+'> <span>'+moduleLabel(m)+'</span></label>').join('');
  ov.classList.add('show');
}
function closeModules(){ const ov=document.getElementById('modulesModal'); if(ov)ov.classList.remove('show'); }
function saveModules(){
  if(!state.features) state.features={};
  document.querySelectorAll('#modulesList input[data-k]').forEach(c=>{ state.features[c.dataset.k]=c.checked; });
  saveState(); applyFeatures(); closeModules(); toast('Modules updated ✓');
}
function _injectModulesBtn(){
  if(document.getElementById('modulesBtn')) return;
  const bar=document.querySelector('.header-actions'); if(!bar) return;
  const b=document.createElement('button'); b.className='btn'; b.id='modulesBtn'; b.type='button';
  b.textContent='⚙'; b.title='Modules · 功能模块开关'; b.onclick=openModules;
  bar.appendChild(b);
}
// Re-apply after every render so remote toggles from teammates take effect live.
const _renderBase = render;
render = function(){ _renderBase(); applyFeatures(); _injectModulesBtn(); };

/* boot */
function initApp() {
  // ---- CLOUD SYNC: kick off Firebase Auth + Realtime DB sync ----
  // Cloud-sync mounts a login gate. The app keeps booting underneath
  // (so when the user signs in, everything's already initialized).
  if (window.CloudSync && window.FIREBASE_CONFIG) {
    try { window.CloudSync.init(window.FIREBASE_CONFIG); }
    catch (e) { console.error('CloudSync init failed:', e); }
  } else if (!window.FIREBASE_CONFIG) {
    console.warn('CloudSync: firebase-config.js not loaded — running in local-only mode.');
  }
  // Expose render/toast on window so cloud-sync.js can call them
  window.render = render;
  window.toast  = toast;

  _armPhotoMigration();

  // Load state NOW that the entire <body> (including __embedded_state) is parsed.
  if (!state) state = loadState();

  // When bundled, ensure the initial GF plan src points to the blob URL too
  if (window.__resources && window.__resources.planGF) {
    const _img = document.getElementById('planImg');
    if (_img) _img.src = window.__resources.planGF;
  }
  _appReady = true;
  render();
  // Pick up ?highlight=SF03,SF20A&order=J04 from Glass Triage "📍 Map" deep-link
  if (typeof applyMapHighlightFromUrl === 'function') applyMapHighlightFromUrl();
  if (typeof applyEmbedMode === 'function') applyEmbedMode();
  // Subscribe (read-only) to Glass Triage pieces so the unit modal can show
  // shipping status (📦 on-site / staged) next to each glass panel.
  try {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
      firebase.database().ref('triage/friday/pieces').on('value', snap => {
        window._triageCache = snap.val() || {};
      });
    }
  } catch (e) { console.warn('triage subscribe failed', e); }
  if (state._mergeNote) {
    const _note = state._mergeNote;
    delete state._mergeNote;
    setTimeout(() => toast(_note + ' — see left margin / L2 tab'), 600);
  }
}

// Fetch the team's baseline snapshot before running initApp.
// localStorage / Firebase still win when they're newer; this just supplies
// the "fresh visitor" / "stale localStorage discarded" fallback.
async function bootstrap() {
  try {
    const res = await fetch('state.json', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.units && data.log) {
        window._embeddedStateJson = data;
      }
    }
  } catch (e) { console.warn('bootstrap: state.json fetch failed', e); }
  initApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
