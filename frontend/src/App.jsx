import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3,
  CheckCircle2, ChevronRight, CircleHelp, Clock3, Droplets, Fish,
  Gauge, Leaf, LoaderCircle, RefreshCw, ShieldCheck, Waves
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip,
  XAxis, YAxis, BarChart, Bar, Cell
} from "recharts";

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const initialForm = { ph: "7.8", turbidity: "4.2", dissolved_oxygen: "6.4", temperature: "24" };
const navItems = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "predict", label: "Pollution analysis", icon: Activity },
  { id: "history", label: "Prediction history", icon: Clock3 },
  { id: "about", label: "About this project", icon: CircleHelp },
];

function formatDate(value) {
  try { return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return value; }
}
function levelClass(level) {
  return (level || "low").toLowerCase();
}

export default function App() {
  const [active, setActive] = useState("overview");
  const [form, setForm] = useState(initialForm);
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiOnline, setApiOnline] = useState(false);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/history?limit=50`);
      if (!response.ok) throw new Error("Could not load prediction history.");
      const data = await response.json();
      setHistory(data);
      setApiOnline(true);
      if (data.length) setLatest(current => current || data[0]);
      setError("");
    } catch {
      setApiOnline(false);
      setError("Can't reach the prediction API. Start the FastAPI backend and check the API URL.");
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => { loadHistory(); }, []);

  async function submitPrediction(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, Number(value)]));
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail?.[0]?.msg || body.detail || "Prediction failed. Check the input values.");
      setLatest(body);
      setActive("predict");
      await loadHistory();
    } catch (err) {
      setError(err.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    if (!window.confirm("Clear all saved prediction history?")) return;
    try {
      const response = await fetch(`${API_BASE}/api/history`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to clear history.");
      setHistory([]);
      setLatest(null);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  const levelCounts = useMemo(() => {
    const counts = { Low: 0, Moderate: 0, High: 0 };
    history.forEach(item => { if (counts[item.pollution_level] !== undefined) counts[item.pollution_level] += 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [history]);

  const trendData = useMemo(() => [...history].reverse().map((item, index) => ({
    name: `#${index + 1}`,
    turbidity: item.turbidity,
    oxygen: item.dissolved_oxygen,
    temperature: item.temperature,
    level: item.pollution_level,
  })), [history]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); setActive("overview"); }}>
          <span className="brand-mark"><Waves size={22} /></span>
          <span><strong>BlueGuard</strong><small>OCEAN INTELLIGENCE</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.id} className={`nav-item ${active === item.id ? "selected" : ""}`} onClick={() => setActive(item.id)}>
              <Icon size={18} /><span>{item.label}</span>{active === item.id && <ChevronRight size={16} className="nav-arrow" />}
            </button>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="ocean-card">
            <span className="ocean-icon"><Fish size={19} /></span>
            <strong>Every drop matters.</strong>
            <p>Understand water-quality indicators. Support a healthier ocean.</p>
            <button onClick={() => setActive("about")}>Learn more <ArrowUpRight size={14} /></button>
          </div>
          <div className="connection"><span className={`status-dot ${apiOnline ? "online" : ""}`} />{apiOnline ? "Prediction API connected" : "API connection pending"}</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{navItems.find(x => x.id === active)?.label}</strong></div>
          <div className="topbar-right"><span className="live-pill"><span /> DEMO ENVIRONMENT</span><div className="avatar">BG</div></div>
        </header>

        <div className="page-content">
          {error && <div className="error-banner"><AlertTriangle size={18} /><span>{error}</span><button onClick={() => setError("")}>Dismiss</button></div>}

          {active === "overview" && <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><span className="eyebrow-line" /> OCEAN HEALTH · DATA EXPLORER</div>
                <h1>See the ocean<br /><em>beneath the surface.</em></h1>
                <p>Explore water-quality indicators and generate an educational pollution-level prediction from four environmental measurements.</p>
                <button className="primary-button" onClick={() => setActive("predict")}>Analyze water quality <ChevronRight size={17} /></button>
                <div className="hero-foot"><ShieldCheck size={15} /> Machine-learning demonstration · Sample data</div>
              </div>
              <div className="hero-visual">
                <div className="orb orb-one" /><div className="orb orb-two" />
                <div className="hero-wave"><Waves size={150} strokeWidth={0.8} /></div>
                <div className="hero-stat"><span className="stat-icon"><Droplets size={17} /></span><span><small>WATER QUALITY</small><strong>Explore the signals</strong></span><Activity size={18} className="stat-trend" /></div>
                <div className="visual-caption">MONITOR · UNDERSTAND · PROTECT</div>
              </div>
            </section>

            <div className="section-heading"><div><span className="section-kicker">YOUR WORKSPACE</span><h2>Water quality at a glance</h2></div><button className="text-button" onClick={() => setActive("history")}>View history <ChevronRight size={15} /></button></div>
            <div className="metric-grid">
              <Metric icon={Droplets} label="Latest pH" value={latest ? Number(latest.ph).toFixed(1) : "—"} unit="pH scale" tone="blue" />
              <Metric icon={Activity} label="Turbidity" value={latest ? Number(latest.turbidity).toFixed(1) : "—"} unit="Illustrative NTU" tone="teal" />
              <Metric icon={Waves} label="Dissolved oxygen" value={latest ? Number(latest.dissolved_oxygen).toFixed(1) : "—"} unit="Illustrative mg/L" tone="violet" />
              <Metric icon={Gauge} label="Water temperature" value={latest ? `${Number(latest.temperature).toFixed(1)}°` : "—"} unit="Celsius" tone="amber" />
            </div>

            <div className="dashboard-grid">
              <section className="panel chart-panel">
                <div className="panel-heading"><div><h3>Water-quality trend</h3><p>Measurements from recent predictions</p></div><span className="mini-tag"><Activity size={13} /> HISTORY</span></div>
                {trendData.length > 1 ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData}><defs><linearGradient id="turbidityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#21b6a8" stopOpacity={0.28}/><stop offset="95%" stopColor="#21b6a8" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e8eff1"/><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#7b929b"}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#7b929b"}}/><Tooltip/><Area type="monotone" dataKey="turbidity" name="Turbidity" stroke="#16a99d" fill="url(#turbidityFill)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div> : <EmptyChart text="Make at least two predictions to see a trend chart." />}
              </section>
              <section className="panel distribution-panel">
                <div className="panel-heading"><div><h3>Prediction distribution</h3><p>Categories in saved history</p></div><span className="panel-icon"><BarChart3 size={18}/></span></div>
                <div className="distribution-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={levelCounts} layout="vertical" margin={{left:0,right:14}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={72} tickLine={false} axisLine={false} tick={{fontSize:12,fill:"#58717c"}}/><Tooltip cursor={{fill:"#f3f8f8"}}/><Bar dataKey="value" radius={[0,5,5,0]} barSize={18}>{levelCounts.map((entry,index)=><Cell key={entry.name} fill={["#16a99d","#e7a949","#e36b64"][index]}/>)}</Bar></BarChart></ResponsiveContainer></div>
                <div className="legend-row"><span><i className="dot-low"/>Low</span><span><i className="dot-mid"/>Moderate</span><span><i className="dot-high"/>High</span></div>
              </section>
            </div>

            <section className="panel recent-panel">
              <div className="panel-heading"><div><h3>Recent predictions</h3><p>Your latest saved water-quality analyses</p></div><button className="text-button" onClick={() => setActive("history")}>See all <ChevronRight size={15}/></button></div>
              <HistoryTable history={history.slice(0, 5)} loading={historyLoading} />
            </section>
            <div className="disclaimer"><AlertTriangle size={17}/><p><strong>Research prototype:</strong> Model outputs are generated from synthetic data and are not validated for real-world ocean monitoring.</p></div>
          </>}

          {active === "predict" && <>
            <PageTitle eyebrow="ANALYSIS WORKSPACE" title="Pollution level analysis" subtitle="Enter four water-quality indicators to generate a demonstration prediction." />
            <div className="analysis-layout">
              <section className="panel form-panel">
                <div className="panel-heading"><div><h3>Water sample parameters</h3><p>Enter the measured values for a sample.</p></div><span className="panel-icon"><Droplets size={18}/></span></div>
                <form onSubmit={submitPrediction} className="prediction-form">
                  <Field label="pH level" hint="Scale: 0–14" name="ph" value={form.ph} min="0" max="14" step="0.1" onChange={value => setForm({...form, ph:value})} />
                  <Field label="Turbidity" hint="Illustrative NTU" name="turbidity" value={form.turbidity} min="0" max="1000" step="0.1" onChange={value => setForm({...form, turbidity:value})} />
                  <Field label="Dissolved oxygen" hint="Illustrative mg/L" name="dissolved_oxygen" value={form.dissolved_oxygen} min="0" max="30" step="0.1" onChange={value => setForm({...form, dissolved_oxygen:value})} />
                  <Field label="Water temperature" hint="Degrees Celsius" name="temperature" value={form.temperature} min="-5" max="60" step="0.1" onChange={value => setForm({...form, temperature:value})} />
                  <div className="form-note"><CircleHelp size={15}/><span>Use values from a sample or try the example values. Units and ranges are illustrative for this demo.</span></div>
                  <button className="primary-button full-button" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={17}/> Analyzing sample…</> : <><Activity size={17}/> Predict pollution level</>}</button>
                  <button type="button" className="secondary-button full-button" onClick={() => setForm(initialForm)}><RefreshCw size={15}/> Reset example values</button>
                </form>
              </section>
              <section className="panel result-panel">
                <div className="panel-heading"><div><h3>Prediction result</h3><p>Model output for the latest sample</p></div><span className="mini-tag">MODEL OUTPUT</span></div>
                {latest ? <div className="result-content">
                  <div className={`result-badge ${levelClass(latest.pollution_level)}`}><span className="result-badge-icon">{latest.pollution_level === "Low" ? <CheckCircle2/> : latest.pollution_level === "Moderate" ? <AlertTriangle/> : <AlertTriangle/>}</span><span><small>PREDICTED CATEGORY</small><strong>{latest.pollution_level} pollution</strong></span></div>
                  <div className="confidence-block"><div><span>Model confidence</span><strong>{Math.round(latest.confidence * 100)}%</strong></div><div className="confidence-track"><span style={{width:`${latest.confidence*100}%`}}/></div><small>Confidence is not a measure of scientific validity.</small></div>
                  <div className="result-measures">{[["pH",latest.ph],["Turbidity",`${latest.turbidity} NTU*`],["Dissolved oxygen",`${latest.dissolved_oxygen} mg/L*`],["Temperature",`${latest.temperature}°C`]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
                  <div className="result-advice"><Leaf size={17}/><p>{latest.pollution_level === "Low" ? "The model placed this sample in its low category. Continue monitoring and compare with verified local standards." : latest.pollution_level === "Moderate" ? "The model placed this sample in its moderate category. Review the measurements and compare them with trusted monitoring guidance." : "The model placed this sample in its high category. Verify the measurements and consult qualified environmental monitoring sources."}</p></div>
                  <p className="small-disclaimer">{latest.note}</p>
                </div> : <div className="result-empty"><span><Waves size={34}/></span><strong>Your result will appear here</strong><p>Submit the water-quality form to see the model's predicted category and input summary.</p></div>}
              </section>
            </div>
          </>}

          {active === "history" && <>
            <PageTitle eyebrow="SAVED ANALYSES" title="Prediction history" subtitle="Review earlier sample submissions stored by the local API database." />
            <section className="panel history-page-panel"><div className="panel-heading"><div><h3>All predictions</h3><p>{history.length} saved {history.length === 1 ? "record" : "records"}</p></div><div className="heading-actions"><button className="secondary-button compact" onClick={loadHistory}><RefreshCw size={14}/> Refresh</button><button className="danger-button compact" onClick={clearHistory} disabled={!history.length}>Clear history</button></div></div><HistoryTable history={history} loading={historyLoading} /></section>
            <div className="disclaimer"><AlertTriangle size={17}/><p>History is stored in the backend's SQLite database. Local history is not automatically shared across separate deployments or server instances.</p></div>
          </>}

          {active === "about" && <>
            <PageTitle eyebrow="ABOUT BLUEGUARD" title="Understand. Protect. Restore." subtitle="An educational prototype exploring how water-quality indicators can be used in a machine-learning workflow." />
            <section className="about-hero"><div className="about-hero-icon"><Waves size={44}/></div><div><span className="section-kicker">THE PROJECT</span><h2>Turning water data into a starting point for awareness.</h2><p>BlueGuard demonstrates a simple workflow: enter water-quality values, run a trained classification model, view a category, and review previous submissions.</p></div></section>
            <div className="about-grid">
              <AboutCard icon={Droplets} title="pH level" text="pH describes how acidic or alkaline a water sample is. Interpretation depends on the water body and the applicable standard."/>
              <AboutCard icon={Activity} title="Turbidity" text="Turbidity describes cloudiness caused by suspended particles. It is one indicator, not a complete measure of pollution."/>
              <AboutCard icon={Waves} title="Dissolved oxygen" text="Dissolved oxygen is important to aquatic life. Temperature, salinity, flow, and biological activity can affect its level."/>
              <AboutCard icon={Gauge} title="Water temperature" text="Temperature influences aquatic ecosystems and oxygen solubility. A single reading cannot establish overall ocean health."/>
            </div>
            <section className="panel methodology-panel"><div className="panel-heading"><div><h3>How the prototype works</h3><p>From input to demonstration output</p></div><span className="panel-icon"><BarChart3 size={18}/></span></div><div className="method-steps">{[["01","Input","Enter four water-quality measurements."],["02","Model","A Random Forest classifier trained on generated synthetic examples predicts a category."],["03","Review","The app shows the output and stores the submission in local SQLite history."],["04","Improve","A real deployment would need verified sampling data, evaluation, calibration, and expert review."]].map(([n,title,text])=><div className="method-step" key={n}><span>{n}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}</div></section>
            <div className="disclaimer"><ShieldCheck size={17}/><p><strong>Responsible use:</strong> This is a student/portfolio demonstration, not a certified environmental monitoring system. Do not use its output to make real-world safety or regulatory decisions.</p></div>
          </>}
          <footer className="footer"><span>BlueGuard Ocean Intelligence</span><span>Educational prototype · Synthetic training data</span></footer>
        </div>
      </main>
    </div>
  );
}

function Metric({icon: Icon, label, value, unit, tone}) {
  return <div className="metric-card"><span className={`metric-icon ${tone}`}><Icon size={19}/></span><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-unit">{unit}</span></div>;
}
function PageTitle({eyebrow,title,subtitle}) {
  return <div className="page-title"><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>;
}
function Field({label,hint,name,value,min,max,step,onChange}) {
  return <label className="field"><span className="field-top"><strong>{label}</strong><small>{hint}</small></span><input type="number" name={name} value={value} min={min} max={max} step={step} required onChange={e=>onChange(e.target.value)}/></label>;
}
function EmptyChart({text}) {
  return <div className="empty-chart"><span><BarChart3 size={24}/></span><p>{text}</p></div>;
}
function HistoryTable({history,loading}) {
  if (loading) return <div className="table-empty"><LoaderCircle className="spin" size={20}/> Loading history…</div>;
  if (!history.length) return <div className="table-empty"><span><Waves size={25}/></span><strong>No predictions yet</strong><p>Run a water-quality analysis to start your history.</p></div>;
  return <div className="table-scroll"><table><thead><tr><th>DATE</th><th>pH</th><th>TURBIDITY</th><th>DISSOLVED O₂</th><th>TEMP.</th><th>RESULT</th><th>CONFIDENCE</th></tr></thead><tbody>{history.map(row=><tr key={row.id}><td>{formatDate(row.created_at)}</td><td>{Number(row.ph).toFixed(1)}</td><td>{Number(row.turbidity).toFixed(1)}</td><td>{Number(row.dissolved_oxygen).toFixed(1)}</td><td>{Number(row.temperature).toFixed(1)}°C</td><td><span className={`level-chip ${levelClass(row.pollution_level)}`}>{row.pollution_level}</span></td><td>{Math.round(row.confidence*100)}%</td></tr>)}</tbody></table></div>;
}
function AboutCard({icon:Icon,title,text}) {
  return <div className="about-card"><span><Icon size={20}/></span><h3>{title}</h3><p>{text}</p></div>;
}
