import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, Check, Clock3, Copy, FileImage, History, ImagePlus,
  Instagram, Linkedin, LoaderCircle, RefreshCw, Search, Settings2,
  Sparkles, Star, Trash2, UploadCloud, WandSparkles, Youtube, X, Zap,
} from 'lucide-react';

const STOPWORDS = new Set('a an about above after again all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further get got had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves via use using make makes made much many like want'.split(/\s+/));

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function clipText(value, maxLength = 280) {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.65 ? clipped.slice(0, lastSpace) : clipped).trim().replace(/[,:;—-]+$/, '') + '…';
}

function clipBlock(value, maxLength = 2800) {
  const text = String(value || '').replace(/\r/g, '').trim();
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.65 ? clipped.slice(0, lastSpace) : clipped).trim().replace(/[,:;—-]+$/, '') + '…';
}

function extractTopic(context, script, niche, imageName) {
  let source = cleanText(context) || cleanText(script) || cleanText(imageName).replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[_-]+/g, ' ') || cleanText(niche) || 'your content';
  source = source.replace(/^(reel|video|post|topic|context|script)\s*:\s*/i, '').replace(/^["'“”]+|["'“”]+$/g, '');
  const firstSentence = source.match(/^.{1,150}?(?:[.!?](?:\s|$)|$)/);
  source = firstSentence?.[0] || source;
  return clipText(source.replace(/[.!?]+$/, ''), 115) || 'your content';
}

function extractKeywords(source, niche = '') {
  const words = (cleanText(source + ' ' + niche).toLowerCase().match(/[a-z0-9\u0B80-\u0BFF\u0900-\u097F\u0600-\u06FF]+/g) || []);
  const counts = new Map();
  for (const word of words) {
    if (word.length < 3 || STOPWORDS.has(word) || /^\d+$/.test(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([word]) => word).slice(0, 10);
}

function asHashtag(value) {
  const cleaned = String(value || '').replace(/^#+/, '').replace(/[^a-zA-Z0-9\u0B80-\u0BFF\u0900-\u097F\u0600-\u06FF]/g, '');
  return cleaned ? '#' + cleaned : '';
}

function makeHashtags(keywords, fixedTags, limit = 5) {
  const fixed = String(fixedTags || '').split(/[\s,]+/).map(asHashtag).filter(Boolean);
  const derived = (keywords || []).map(asHashtag).filter(Boolean);
  return [...new Set([...fixed, ...derived])].slice(0, limit);
}

// Fast offline-first drafting: produces editable, platform-shaped copy without loading an AI model.
function buildQuickDraft(inputs, imageName = '', variant = 0) {
  const platforms = Array.isArray(inputs.platforms) ? inputs.platforms : [];
  const profile = inputs.brandProfile || {};
  const niche = cleanText(inputs.niche || 'content creation');
  const audience = cleanText(inputs.audience || 'your audience');
  const context = cleanText(inputs.context);
  const script = cleanText(inputs.script);
  const source = [context, script].filter(Boolean).join(' ');
  const topic = extractTopic(context, script, niche, imageName);
  const keywords = extractKeywords(source || topic, niche);
  const primary = keywords[0] || topic;
  const secondary = keywords.filter((word) => word !== primary).slice(0, 7);
  const snippet = clipText(script || context, 390);
  const cta = cleanText(profile.cta || 'Follow for more helpful content.');
  const rotation = Math.abs(Number(variant) || 0);
  const hashtagsBase = [...keywords, niche, 'contentcreation', 'socialmedia'];
  const instagramTags = makeHashtags(hashtagsBase, profile.fixedHashtags, 8);
  const youtubeTags = [...new Set([primary, ...secondary, topic, niche, topic + ' tips', 'content tips'].map(cleanText).filter(Boolean))].slice(0, 12);
  const youtubeHashtags = makeHashtags([...keywords, niche, 'contentcreation'], '', 5);
  const linkedinTags = makeHashtags([...keywords, niche, 'contentstrategy'], profile.fixedHashtags, 5);
  const igHooks = [
    'Want to make sense of ' + topic + '? Start here.',
    'Let’s break down ' + topic + ' in a clear, practical way.',
    'Your next post about ' + topic + ' starts with the right message.',
    'A quick guide to ' + topic + ' — save this for later.',
    'Keep ' + topic + ' clear, useful, and audience-focused.',
  ];
  const ytTitleOptions = [
    topic,
    'What to Know About ' + topic,
    topic + ': Key Points and Takeaways',
    'A Simple Guide to ' + topic,
    'Understanding ' + topic,
  ];
  const ytTitles = [
    clipText(ytTitleOptions[rotation % ytTitleOptions.length], 95),
    clipText(ytTitleOptions[(rotation + 1) % ytTitleOptions.length], 95),
    clipText(ytTitleOptions[(rotation + 2) % ytTitleOptions.length], 95),
  ];
  const assumptions = [];
  if (imageName && !context && !script) assumptions.push('Only the uploaded filename was available to this instant draft builder. Add a content idea for a more accurate result.');
  if (!source) assumptions.push('The draft is based on the selected niche because no descriptive text was provided.');
  const result = {
    analysis: {
      topic,
      primary_keyword: primary,
      secondary_keywords: secondary,
      audience,
      hook_angle: rotation % 2 ? 'Practical, clear explanation' : 'Useful starting point and save-worthy guidance',
      assumptions,
    },
  };

  if (platforms.includes('instagram_facebook')) {
    const hook = igHooks[rotation % igHooks.length];
    const caption = [
      hook,
      '',
      snippet ? 'From your content: ' + snippet : 'Introduce the main idea, explain why it matters to ' + audience + ', and keep the message easy to follow.',
      '',
      'Keep the message clear, useful, and relevant to ' + audience + '.',
      '',
      cta,
      '',
      instagramTags.join(' '),
    ].join('\n');
    result.instagram_facebook = {
      hook,
      caption: clipBlock(caption, 2150),
      seo_keywords: [primary, ...secondary.slice(0, 5)].filter(Boolean),
      hashtags: instagramTags,
      cta,
      alt_text: imageName
        ? 'Uploaded image (' + cleanText(imageName) + ') intended for a post about ' + topic + '. Update this text to describe the actual visible details.'
        : 'Visual accompanying a social post about ' + topic + '. Add the visible subjects, setting, and any meaningful text for accessibility.',
    };
  }

  if (platforms.includes('youtube')) {
    const description = [
      topic + ' — a clear introduction for ' + audience + '.',
      snippet ? snippet : 'Introduce the topic, share the main points, and end with a useful takeaway.',
      '',
      'TIMESTAMPS',
      '00:00 Introduction (replace with actual video timing)',
      '',
      'LINKS',
      '[Add relevant links here]',
      '',
      cta,
      '',
      youtubeHashtags.join(' '),
    ].join('\n');
    result.youtube = {
      titles: ytTitles,
      description: clipBlock(description, 4900),
      tags: youtubeTags,
      hashtags: youtubeHashtags,
      pinned_comment: 'What would you add to this conversation about ' + topic + '? Share your thoughts below.',
    };
  }

  if (platforms.includes('linkedin')) {
    const hook = [
      'A useful conversation to have: ' + topic + '.',
      'Clear communication matters when discussing ' + topic + '.',
      'One way to make content about ' + topic + ' more useful is to focus on the audience.',
      'Let’s look at ' + topic + ' through a practical lens.',
      'Make the message about ' + topic + ' specific, useful, and easy to act on.',
    ][rotation % 5];
    const post = [
      hook,
      '',
      snippet || 'Start with the central idea, explain its relevance, and make the takeaway clear.',
      '',
      'A practical takeaway: keep the message specific, useful, and easy for the intended audience to act on.',
      '',
      'How are you approaching ' + topic + '?',
      '',
      linkedinTags.join(' '),
    ].join('\n');
    result.linkedin = {
      hook,
      post: clipBlock(post, 2950),
      hashtags: linkedinTags,
      cta_question: 'How are you approaching ' + topic + '?',
    };
  }
  return result;
}

const PLATFORMS = [
  { key: 'instagram_facebook', label: 'Instagram / Facebook', short: 'Instagram / FB', icon: Instagram, color: '#d94b86' },
  { key: 'youtube', label: 'YouTube', short: 'YouTube', icon: Youtube, color: '#f04444' },
  { key: 'linkedin', label: 'LinkedIn', short: 'LinkedIn', icon: Linkedin, color: '#2777b9' },
];
const FIELDS = {
  instagram_facebook: [
    { key: 'hook', label: 'Hook line', hint: 'The opening line that earns attention.', max: 180 },
    { key: 'caption', label: 'Caption', hint: 'Use the primary keyword naturally near the beginning.', max: 2200 },
    { key: 'seo_keywords', label: 'SEO keywords', hint: 'Search phrases your audience may use.', array: true },
    { key: 'hashtags', label: 'Hashtags', hint: 'Relevant broad and niche hashtags.', array: true },
    { key: 'cta', label: 'Call to action', hint: 'Give the audience a clear next step.', max: 300 },
    { key: 'alt_text', label: 'Alt text', hint: 'A descriptive sentence for accessibility.', max: 500 },
  ],
  youtube: [
    { key: 'titles', label: 'Title options', hint: 'Three searchable, benefit-driven title options.', array: true, max: 100 },
    { key: 'description', label: 'Description', hint: 'Search-friendly summary, timestamps, links, and CTA.', max: 5000 },
    { key: 'tags', label: 'Tags', hint: 'Combined comma-separated tags should stay under 500 characters.', array: true, max: 500 },
    { key: 'hashtags', label: 'Hashtags', hint: 'Three to five relevant hashtags.', array: true },
    { key: 'pinned_comment', label: 'Pinned comment', hint: 'An engagement prompt to pin under the video.', max: 800 },
  ],
  linkedin: [
    { key: 'hook', label: 'Hook', hint: 'Opening thought visible before “see more”.', max: 300 },
    { key: 'post', label: 'Post body', hint: 'A story, insight, takeaway, and natural close.', max: 3000 },
    { key: 'hashtags', label: 'Hashtags', hint: 'Three to five professional hashtags.', array: true },
    { key: 'cta_question', label: 'Closing question', hint: 'Invite thoughtful comments.', max: 500 },
  ],
};
const DEFAULT_PROFILE = {
  name: 'My Brand', niche: 'Digital Marketing', audience: 'Social media audience',
  tone: 'Professional', language: 'English', fixedHashtags: '', cta: 'Follow for more',
};
const readStored = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};
const toText = (value) => Array.isArray(value) ? value.join('\n') : (value == null ? '' : String(value));
const parseField = (value, isArray) => isArray ? value.split(/,|\n/).map((part) => part.trim()).filter(Boolean) : value;
const fmtDate = (value) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export default function App() {
  const [page, setPage] = useState('generator');
  const [context, setContext] = useState('');
  const [script, setScript] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(PLATFORMS.map((item) => item.key));
  const [profile, setProfile] = useState(() => readStored('captioncraft.profile', DEFAULT_PROFILE));
  const [history, setHistory] = useState(() => readStored('captioncraft.history', []));
  const [generated, setGenerated] = useState(null);
  const [activePlatform, setActivePlatform] = useState('instagram_facebook');
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [regenerating, setRegenerating] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [apiStatus, setApiStatus] = useState('ready');
  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const fileInput = useRef(null);
  const availablePlatforms = useMemo(() => PLATFORMS.filter((platform) => selectedPlatforms.includes(platform.key)), [selectedPlatforms]);

  useEffect(() => { localStorage.setItem('captioncraft.profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('captioncraft.history', JSON.stringify(history)); }, [history]);
  useEffect(() => {
    if (!activeHistoryId || !generated) return;
    setHistory((items) => items.map((item) => item.id === activeHistoryId ? { ...item, result: generated, context, script, platforms: selectedPlatforms, inputs: { ...item.inputs, platforms: selectedPlatforms, niche: profile.niche, tone: profile.tone, language: profile.language, audience: profile.audience, context, script, brandProfile: profilePayload() } } : item));
  }, [generated, activeHistoryId, context, script, selectedPlatforms, profile]);
  useEffect(() => { setApiStatus('ready'); }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  const showToast = (message) => setToast(message);
  const profilePayload = () => ({ name: profile.name, fixedHashtags: profile.fixedHashtags, cta: profile.cta });
  const currentInputs = () => ({
    platforms: selectedPlatforms, niche: profile.niche, tone: profile.tone, language: profile.language,
    audience: profile.audience, context, script, brandProfile: profilePayload(),
  });
  const togglePlatform = (key) => setSelectedPlatforms((old) => old.includes(key) ? old.filter((item) => item !== key) : [...old, key]);

  const handleImage = (file) => {
    setError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Choose a PNG, JPEG, WebP, or GIF image.'); return;
    }
    if (file.size > 10 * 1024 * 1024) { setError('Images must be 10 MB or smaller.'); return; }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveGeneration = (result, inputs, imageName = '') => {
    const entry = {
      id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8),
      title: inputs.context.trim() || inputs.script.trim().slice(0, 95) || imageName || 'Untitled content',
      niche: inputs.niche, date: new Date().toISOString(), platforms: inputs.platforms,
      context: inputs.context, script: inputs.script, imageName, inputs, result, favorite: false,
    };
    setHistory((old) => [entry, ...old].slice(0, 150));
    setActiveHistoryId(entry.id);
    return entry.id;
  };

  const handleGenerate = async (event) => {
    if (event) event.preventDefault();
    setError('');
    if (!context.trim() && !script.trim() && !image) {
      setError('Add a content idea, paste a script, or upload an image first.');
      return;
    }
    if (!selectedPlatforms.length) {
      setError('Choose at least one platform.');
      return;
    }
    setBusy(true);
    try {
      const inputs = currentInputs();
      const result = buildQuickDraft(inputs, image?.name || '');
      setGenerated(result);
      const firstAvailablePlatform = availablePlatforms.find((platform) => result?.[platform.key])?.key;
      setActivePlatform(firstAvailablePlatform || selectedPlatforms[0]);
      saveGeneration(result, inputs, image?.name || '');
      setPage('results');
      showToast('Draft created instantly');
    } catch (requestError) {
      setError(requestError.message || 'Could not create the draft. Please try again.');
    } finally {
      setBusy(false);
    }
  };

    const updateField = (platformKey, field, raw, isArray) => {
    const value = parseField(raw, isArray);
    setGenerated((old) => {
      const next = { ...old, [platformKey]: { ...old?.[platformKey], [field]: value } };
      return next;
    });
  };

  const regenerateField = async (platformKey, field) => {
    const operation = platformKey + '.' + field.key;
    setRegenerating(operation);
    setError('');
    try {
      const inputs = { ...currentInputs(), platforms: [platformKey] };
      const currentValue = generated?.[platformKey]?.[field.key];
      let variation = 1;
      let draft = buildQuickDraft(inputs, image?.name || '', variation);
      let candidate = draft?.[platformKey]?.[field.key];
      while (JSON.stringify(candidate) === JSON.stringify(currentValue) && variation < 7) {
        variation += 1;
        draft = buildQuickDraft(inputs, image?.name || '', variation);
        candidate = draft?.[platformKey]?.[field.key];
      }
      if (candidate === undefined) throw new Error('Could not create an alternative for this field.');
      if (JSON.stringify(candidate) === JSON.stringify(currentValue) && typeof candidate === 'string') {
        candidate = candidate + '\n\nAlternative angle: keep the message concise, relevant, and helpful to the intended audience.';
      }
      setGenerated((old) => ({
        ...old,
        [platformKey]: { ...old?.[platformKey], [field.key]: candidate },
      }));
      showToast(field.label + ' updated');
    } catch (requestError) {
      setError(requestError.message || 'Could not update this field.');
    } finally {
      setRegenerating('');
    }
  };

    const copyText = async (text, label = 'Copied to clipboard') => {
    try { await navigator.clipboard.writeText(text || ''); showToast(label); }
    catch { setError('Clipboard access failed. Select the text and copy it manually.'); }
  };
  const copyPlatform = (key) => {
    const sections = FIELDS[key].map((field) => field.label.toUpperCase() + '\n' + toText(generated?.[key]?.[field.key])).join('\n\n');
    copyText(sections, PLATFORMS.find((platform) => platform.key === key)?.short + ' copied');
  };
  const loadHistory = (entry) => {
    setGenerated(entry.result); setActiveHistoryId(entry.id);
    setContext(entry.context || entry.inputs?.context || '');
    setScript(entry.script || entry.inputs?.script || '');
    setSelectedPlatforms(entry.platforms || entry.inputs?.platforms || []);
    if (entry.inputs) {
      const nextProfile = { ...profile, ...entry.inputs, ...(entry.inputs.brandProfile || {}) };
      setProfile((old) => ({ ...old, name: nextProfile.name || old.name, niche: nextProfile.niche || old.niche, tone: nextProfile.tone || old.tone, language: nextProfile.language || old.language, audience: nextProfile.audience || old.audience, fixedHashtags: nextProfile.fixedHashtags || old.fixedHashtags, cta: nextProfile.cta || old.cta }));
    }
    const first = (entry.platforms || []).find((key) => entry.result?.[key]);
    setActivePlatform(first || 'instagram_facebook'); setPage('results'); setError('');
  };
  const toggleFavorite = (id) => setHistory((items) => items.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item));
  const removeHistory = (id) => { setHistory((items) => items.filter((item) => item.id !== id)); if (activeHistoryId === id) setActiveHistoryId(null); showToast('Generation deleted'); };
  const filteredHistory = history.filter((item) => (item.title + ' ' + item.niche).toLowerCase().includes(search.toLowerCase()) && (!favoritesOnly || item.favorite));

  const nav = [
    { key: 'generator', label: 'Generator', icon: WandSparkles },
    { key: 'history', label: 'History', icon: History, count: history.length },
    { key: 'profile', label: 'Brand profile', icon: Settings2 },
  ];

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => setPage('generator')} aria-label="CaptionCraft home">
        <span className="brand-mark"><Sparkles size={22} /></span>
        <span className="brand-copy"><b>CaptionCraft <i>AI</i></b><small>SOCIAL SEO STUDIO</small></span>
      </button>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">
        {nav.map((item) => { const Icon = item.icon; return <button key={item.key} className={page === item.key || (page === 'results' && item.key === 'generator') ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(item.key); setError(''); }}><Icon size={18} /><span>{item.label}</span>{item.count > 0 && <small>{item.count}</small>}</button>; })}
      </nav>
      <div className="sidebar-spacer" />
      <div className="api-status ready"><span className="status-dot" /><div><b>Instant mode ready</b><small>No API key or model download</small></div></div>
      <div className="sidebar-foot"><span>BUILT FOR CREATORS</span><span>v1.0 · CaptionCraft</span></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><b>{page === 'generator' || page === 'results' ? 'Content generator' : page === 'history' ? 'Your library' : 'Brand voice'}</b></div><div className="topbar-right"><span className="secure-note"><Zap size={14} /> AI-powered workflow</span><div className="avatar">{(profile.name || 'M').trim().charAt(0).toUpperCase()}</div></div></header>

      {page === 'generator' && <section className="page-content generator-page">
        <div className="hero-row"><div><span className="eyebrow"><span className="eyebrow-dot" /> YOUR SOCIAL CONTENT, ELEVATED</span><h1>One idea. <em>Every platform.</em></h1><p>Turn a rough idea, script, or image into platform-ready content — with discoverability built in.</p></div><div className="hero-sticker"><Sparkles size={19} /><span>Less drafting.<br /><b>More creating.</b></span></div></div>
        <form className="generator-grid" onSubmit={handleGenerate}>
          <div className="input-column">
            <section className="surface input-card"><div className="card-heading"><span className="step-number">01</span><div><h2>Start with your content</h2><p>Use any combination of text and an image.</p></div></div>
              <label className="field-label" htmlFor="context">CONTENT IDEA <span>OPTIONAL</span></label>
              <textarea id="context" className="script-textarea context-textarea" value={context} onChange={(event) => setContext(event.target.value)} placeholder="Example: A reel about 5 mistakes new creators make when growing on Instagram…" rows={4} />
              <div className="field-label label-spaced"><label htmlFor="script">SCRIPT / TRANSCRIPT</label><span>OPTIONAL</span></div>
              <textarea id="script" className="script-textarea" value={script} onChange={(event) => setScript(event.target.value)} placeholder="Paste your voiceover, video script, or transcript here…" rows={5} />
              <div className="upload-label">IMAGE OR THUMBNAIL <span>OPTIONAL</span></div>
              <input ref={fileInput} className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => handleImage(event.target.files?.[0])} />
              {imagePreview ? <div className="image-preview"><img src={imagePreview} alt="Selected content preview" /><div><b>{image?.name}</b><small>{(image.size / (1024 * 1024)).toFixed(2)} MB · Image ready</small><button type="button" className="text-button danger-text" onClick={() => { setImage(null); setImagePreview(''); if (fileInput.current) fileInput.current.value = ''; }}>Remove image <X size={13} /></button></div></div> :
                <button type="button" className="upload-dropzone" onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleImage(event.dataTransfer.files?.[0]); }}><span className="upload-icon"><UploadCloud size={20} /></span><span><b>Click to upload or drop an image</b><small>PNG, JPG, WebP or GIF · Up to 10 MB</small></span><ImagePlus size={19} className="upload-end-icon" /></button>}
            </section>
            <section className="surface input-card platform-card"><div className="card-heading"><span className="step-number">02</span><div><h2>Choose your platforms</h2><p>Generate only where you plan to publish.</p></div></div>
              <div className="platform-choice-list">{PLATFORMS.map((platform) => { const Icon = platform.icon; const checked = selectedPlatforms.includes(platform.key); return <button key={platform.key} type="button" className={'platform-choice ' + (checked ? 'selected' : '')} onClick={() => togglePlatform(platform.key)}><span className="platform-icon" style={{ color: platform.color }}><Icon size={19} /></span><span className="platform-choice-copy"><b>{platform.label}</b><small>{platform.key === 'instagram_facebook' ? 'Captions, keywords, hashtags, CTA, alt text' : platform.key === 'youtube' ? 'Titles, description, tags, pinned comment' : 'Professional post, hashtags, closing question'}</small></span><span className={'check-square ' + (checked ? 'checked' : '')}>{checked && <Check size={14} />}</span></button>; })}</div>
            </section>
          </div>

          <div className="settings-column">
            <section className="surface settings-card"><div className="card-heading"><span className="step-number">03</span><div><h2>Brand voice</h2><p>Tailor every output to your audience.</p></div><button type="button" className="tiny-link" onClick={() => setPage('profile')}>Edit profile <ArrowRight size={13} /></button></div>
              <div className="form-field"><label className="field-label" htmlFor="niche">NICHE / INDUSTRY</label><input id="niche" className="text-input" value={profile.niche} onChange={(event) => setProfile({ ...profile, niche: event.target.value })} placeholder="e.g. Fitness, travel, tech" /></div>
              <div className="form-field two-fields"><div><label className="field-label" htmlFor="tone">TONE</label><div className="select-wrap"><select id="tone" className="text-input select-input" value={profile.tone} onChange={(event) => setProfile({ ...profile, tone: event.target.value })}>{['Professional', 'Casual', 'Funny', 'Motivational', 'Educational', 'Luxury', 'Friendly'].map((tone) => <option key={tone}>{tone}</option>)}</select></div></div><div><label className="field-label" htmlFor="language">LANGUAGE</label><div className="select-wrap"><select id="language" className="text-input select-input" value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })}>{['English', 'Tamil', 'Hinglish', 'Hindi', 'Arabic', 'Filipino', 'Spanish', 'French'].map((language) => <option key={language}>{language}</option>)}</select></div></div></div>
              <div className="form-field"><label className="field-label" htmlFor="audience">TARGET AUDIENCE</label><input id="audience" className="text-input" value={profile.audience} onChange={(event) => setProfile({ ...profile, audience: event.target.value })} placeholder="Who is this content for?" /></div>
              <div className="mini-brand-note"><Sparkles size={15} /><span>Profile details save automatically in this browser.</span></div>
            </section>
            <section className="surface generate-card"><div className="generate-spark"><Sparkles size={23} /></div><h2>Ready to create?</h2><p>Create an editable first draft instantly. No model download, GPU, API key, or paid subscription needed.</p><div className="generate-summary"><span><Check size={14} /> Instant draft generation</span><span><Check size={14} /> Platform-specific sections</span><span><Check size={14} /> Your brand settings</span></div><button className="primary-button generate-button" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17} /> Creating draft…</> : <><Sparkles size={17} /> Generate content <ArrowRight size={16} /></>}</button><div className="local-ai-note"><Check size={14} /><span><b>Instant mode — no API key needed</b><small>Uses lightweight editable text templates. No AI model download is required; customize the drafts before posting.</small></span></div><small className="generate-footnote">Review facts, links, and image details before publishing.</small></section>
          </div>
        </form>
        {error && <div className="error-banner" role="alert"><X size={17} /><span>{error}</span><button type="button" onClick={() => setError('')}><X size={14} /></button></div>}
        <footer className="page-footer"><span>CAPTIONCRAFT AI <i /> MADE FOR CREATORS</span><span>Write once. Show up everywhere.</span></footer>
      </section>}

      {page === 'results' && <section className="page-content results-page">
        <div className="result-heading"><div><button className="back-link" onClick={() => setPage('generator')}>← Back to inputs</button><span className="eyebrow"><span className="eyebrow-dot" /> YOUR CONTENT IS READY</span><h1>Made for <em>the feed.</em></h1><p>Review, edit, copy, or regenerate each individual field before you publish.</p></div><button className="secondary-button" onClick={() => setPage('generator')}><RefreshCw size={15} /> Adjust inputs</button></div>
        {generated?.analysis && <section className="analysis-strip"><div className="analysis-icon"><Sparkles size={18} /></div><div><span className="analysis-label">CONTENT ANALYSIS</span><b>{generated.analysis.topic || generated.analysis.primary_keyword || 'Your content topic'}</b><p>{generated.analysis.hook_angle || 'Platform-specific content tailored to your requested audience.'}</p><div className="keyword-row">{(generated.analysis.secondary_keywords || []).slice(0, 5).map((keyword) => <span key={keyword}>{keyword}</span>)}</div></div></section>}
        <div className="result-tabs">{PLATFORMS.filter((platform) => generated?.[platform.key]).map((platform) => { const Icon = platform.icon; return <button key={platform.key} className={'result-tab ' + (activePlatform === platform.key ? 'active' : '')} onClick={() => setActivePlatform(platform.key)}><Icon size={17} style={{ color: platform.color }} /><span>{platform.short}</span><span className="tab-check"><Check size={12} /></span></button>; })}<span className="tab-spacer" /><button className="secondary-button copy-all-button" onClick={() => copyPlatform(activePlatform)}><Copy size={14} /> Copy platform</button></div>
        {!generated?.[activePlatform] ? <div className="empty-state surface"><h2>No output for this platform</h2><p>Choose another result tab or generate again.</p></div> : <div className="result-field-list">
          {FIELDS[activePlatform].map((field, index) => {
            const value = generated?.[activePlatform]?.[field.key];
            const raw = toText(value);
            const isBusy = regenerating === activePlatform + '.' + field.key;
            const overLimit = field.max && raw.length > field.max;
            const multiline = ['caption', 'description', 'post'].includes(field.key);
            return <article key={field.key} className="surface result-field-card"><div className="result-field-heading"><span className="field-index">{String(index + 1).padStart(2, '0')}</span><div className="result-field-title"><h3>{field.label}</h3><p>{field.hint}</p></div><div className="field-actions"><button className="field-copy-button" onClick={() => copyText(raw, field.label + ' copied')}><Copy size={13} /> Copy</button><button className="field-regenerate-button" disabled={Boolean(regenerating)} onClick={() => regenerateField(activePlatform, field)}>{isBusy ? <LoaderCircle className="spin" size={13} /> : <RefreshCw size={13} />} Regenerate</button></div></div>
              <textarea className={'result-edit ' + (multiline ? 'tall-edit' : '')} value={raw} onChange={(event) => updateField(activePlatform, field.key, event.target.value, field.array)} rows={multiline ? 7 : field.array ? 3 : 2} aria-label={field.label} />
              <div className="result-field-bottom"><span className={overLimit ? 'count-warning' : 'char-count'}>{field.array ? (Array.isArray(value) ? value.length : raw ? raw.split('\n').length : 0) + ' items' : raw.length.toLocaleString() + (field.max ? ' / ' + field.max.toLocaleString() + ' characters' : ' characters')}</span>{overLimit && <span className="limit-warning">Over suggested limit</span>}<button className="field-copy-link" onClick={() => copyText(raw, field.label + ' copied')}><Copy size={12} /> Copy field</button></div>
            </article>;
          })}
        </div>}
        <div className="results-bottom-actions"><div><span className="bottom-check"><Check size={15} /></span><span><b>Review before publishing</b><small>Confirm facts, links, and timestamps.</small></span></div><div><button className="secondary-button" onClick={() => setPage('generator')}><RefreshCw size={15} /> Adjust inputs</button><button className="primary-small" onClick={() => copyPlatform(activePlatform)}><Copy size={15} /> Copy this platform</button></div></div>
        {error && <div className="error-banner" role="alert"><X size={16} /><span>{error}</span><button type="button" onClick={() => setError('')}><X size={14} /></button></div>}
        <footer className="page-footer"><span>CAPTIONCRAFT AI <i /> MADE FOR CREATORS</span><span>Write once. Show up everywhere.</span></footer>
      </section>}

      {page === 'history' && <section className="page-content history-page">
        <div className="simple-page-heading"><span className="eyebrow"><Clock3 size={14} /> YOUR CONTENT LIBRARY</span><h1>Good ideas, <em>kept close.</em></h1><p>Revisit previous generations, favorite useful copy, or pick up where you left off.</p></div>
        <div className="history-controls"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ideas or niches…" /></div><div className="filter-pills"><button className={!favoritesOnly ? 'active' : ''} onClick={() => setFavoritesOnly(false)}>All generations <span>{history.length}</span></button><button className={favoritesOnly ? 'active' : ''} onClick={() => setFavoritesOnly(true)}><Star size={14} /> Favorites <span>{history.filter((item) => item.favorite).length}</span></button></div></div>
        {filteredHistory.length === 0 ? <div className="empty-state surface"><div className="empty-icon"><History size={23} /></div><h2>{history.length ? 'No matching generations' : 'Your library starts here'}</h2><p>{history.length ? 'Try a different search or switch back to all generations.' : 'The content you generate is saved in this browser so you can return to it later.'}</p><button className="primary-small" onClick={() => setPage('generator')}>Create first generation <ArrowRight size={15} /></button></div> : <div className="history-grid">{filteredHistory.map((item) => <article className="surface history-card" key={item.id}><div className="history-card-top"><div className="history-file-icon"><FileImage size={18} /></div><button className={'icon-btn favorite-btn ' + (item.favorite ? 'favorited' : '')} onClick={() => toggleFavorite(item.id)} aria-label={item.favorite ? 'Remove favorite' : 'Add favorite'}><Star size={17} fill={item.favorite ? 'currentColor' : 'none'} /></button></div><h3>{item.title}</h3><div className="history-card-meta"><span><Clock3 size={13} /> {fmtDate(item.date)}</span><span>{item.niche || 'General'}</span></div><div className="history-platforms">{(item.platforms || []).map((key) => { const meta = PLATFORMS.find((platform) => platform.key === key); if (!meta) return null; const Icon = meta.icon; return <span title={meta.label} key={key} style={{ color: meta.color }}><Icon size={15} /></span>; })}</div><div className="history-card-actions"><button className="secondary-button" onClick={() => loadHistory(item)}>Open & edit <ArrowRight size={14} /></button><button className="icon-btn" onClick={() => removeHistory(item.id)} aria-label="Delete history item" title="Delete"><Trash2 size={15} /></button></div></article>)}</div>}
        <div className="local-storage-note"><span><Check size={14} /></span> Your history stays in this browser. It is not synced to a cloud account.</div>
        <footer className="page-footer"><span>CAPTIONCRAFT AI <i /> MADE FOR CREATORS</span><span>Write once. Show up everywhere.</span></footer>
      </section>}

      {page === 'profile' && <section className="page-content profile-page">
        <div className="simple-page-heading"><span className="eyebrow"><Settings2 size={14} /> PERSONALIZE YOUR OUTPUT</span><h1>Make it sound <em>like you.</em></h1><p>Set your brand defaults once. Every generation can use your voice, audience, and signature call to action.</p></div>
        <div className="profile-grid"><section className="surface profile-form-card"><div className="profile-card-heading"><div className="profile-big-avatar">{(profile.name || 'M').trim().charAt(0).toUpperCase()}</div><div><h2>Brand identity</h2><p>Your creator or business details.</p></div></div>
          <div className="form-field"><label className="field-label" htmlFor="brand-name">BRAND / CREATOR NAME</label><input id="brand-name" className="text-input" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></div>
          <div className="form-field"><label className="field-label" htmlFor="brand-niche">DEFAULT NICHE</label><input id="brand-niche" className="text-input" value={profile.niche} onChange={(event) => setProfile({ ...profile, niche: event.target.value })} /></div>
          <div className="form-field"><label className="field-label" htmlFor="brand-audience">DEFAULT AUDIENCE</label><input id="brand-audience" className="text-input" value={profile.audience} onChange={(event) => setProfile({ ...profile, audience: event.target.value })} /></div>
          <div className="form-field two-fields"><div><label className="field-label" htmlFor="brand-tone">DEFAULT TONE</label><select id="brand-tone" className="text-input" value={profile.tone} onChange={(event) => setProfile({ ...profile, tone: event.target.value })}>{['Professional', 'Casual', 'Funny', 'Motivational', 'Educational', 'Luxury', 'Friendly'].map((tone) => <option key={tone}>{tone}</option>)}</select></div><div><label className="field-label" htmlFor="brand-language">DEFAULT LANGUAGE</label><select id="brand-language" className="text-input" value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })}>{['English', 'Tamil', 'Hinglish', 'Hindi', 'Arabic', 'Filipino', 'Spanish', 'French'].map((language) => <option key={language}>{language}</option>)}</select></div></div>
          <div className="form-field"><label className="field-label" htmlFor="fixed-hashtags">FIXED HASHTAGS</label><textarea id="fixed-hashtags" className="script-textarea" value={profile.fixedHashtags} onChange={(event) => setProfile({ ...profile, fixedHashtags: event.target.value })} placeholder="#YourBrand #YourNiche" rows={2} /></div>
          <div className="form-field"><label className="field-label" htmlFor="default-cta">SIGNATURE CALL TO ACTION</label><input id="default-cta" className="text-input" value={profile.cta} onChange={(event) => setProfile({ ...profile, cta: event.target.value })} placeholder="Follow for more tips" /></div>
          <div className="profile-saved-note"><Check size={15} /> Changes save automatically to this browser.</div><div className="profile-action-row"><button className="secondary-button" onClick={() => setProfile(DEFAULT_PROFILE)}>Reset defaults</button><button className="primary-small" onClick={() => { showToast('Brand voice saved'); setPage('generator'); }}>Done <Check size={15} /></button></div>
        </section><aside className="profile-aside"><section className="surface brand-preview-card"><span className="eyebrow">YOUR BRAND CARD</span><div className="brand-preview-mark"><Sparkles size={24} /></div><h2>{profile.name || 'Your brand name'}</h2><p>{profile.niche || 'Your niche'} · {profile.tone || 'Your tone'}</p><div className="preview-divider" /><span className="preview-label">SIGNATURE CTA</span><b className="preview-cta">{profile.cta || 'Your call to action'}</b>{profile.fixedHashtags && <div className="preview-hashtags">{profile.fixedHashtags}</div>}</section><section className="profile-tip-card"><div><Sparkles size={17} /></div><h3>Consistency builds recognition.</h3><p>Keep a clear tone, audience, and signature CTA. You can still change these when creating an individual post.</p></section></aside></div>
        <footer className="page-footer"><span>CAPTIONCRAFT AI <i /> MADE FOR CREATORS</span><span>Write once. Show up everywhere.</span></footer>
      </section>}
    </main>
    {toast && <div className="toast-message" role="status"><span><Check size={15} /></span>{toast}</div>}
  </div>;
}
