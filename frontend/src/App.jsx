import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

function App() {
    const [page, setPage] = useState('analysis')
    const [results, setResults] = useState([])
    const [approved, setApproved] = useState([])
    const [training, setTraining] = useState([])
    const [trainingStats, setTrainingStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const [marketFilter, setMarketFilter] = useState('all')
    const [oddsInputs, setOddsInputs] = useState({})

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        showToast('Panoya kopyalandı!')
    }

    // ============ ANALYSIS ============

    const runAnalysis = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/analysis/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 50, leagueFilter: true })
            })
            const data = await res.json()
            if (data.success) {
                setResults(data.results)
                showToast(`${data.count} aday bulundu!`)
            } else {
                showToast(data.error, 'error')
            }
        } catch (err) {
            showToast(err.message, 'error')
        }
        setLoading(false)
    }

    const approveBet = async (item) => {
        const odds = oddsInputs[item.id] || null
        try {
            const res = await fetch(`${API_BASE}/bets/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId: item.matchId,
                    homeTeam: item.homeTeam,
                    awayTeam: item.awayTeam,
                    league: item.league,
                    market: item.market,
                    odds,
                    matchTime: item.timestamp
                })
            })
            const data = await res.json()
            if (data.success) {
                showToast('Bahis onaylandı!')
                setResults(results.filter(r => r.id !== item.id))
                loadApproved()
            }
        } catch (err) {
            showToast(err.message, 'error')
        }
    }

    const copyAllMarketPrompts = () => {
        const filtered = marketFilter === 'all' ? results : results.filter(r => r.marketKey === marketFilter)
        const text = filtered.map(r => {
            const odds = oddsInputs[r.id]
            let prompt = r.aiPrompt
            if (odds) {
                prompt = prompt.replace(`Market: ${r.market}`, `Market: ${r.market}\nOdds: ${odds}`)
            }
            return prompt
        }).join('\n\n---\n\n')
        copyToClipboard(text)
    }

    const copyAllRawStats = () => {
        const filtered = marketFilter === 'all' ? results : results.filter(r => r.marketKey === marketFilter)
        // Deduplicate by matchId
        const unique = []
        const seen = new Set()
        filtered.forEach(r => {
            if (!seen.has(r.matchId)) {
                seen.add(r.matchId)
                unique.push(r)
            }
        })
        const text = unique.map(r => r.rawStats).join('\n\n')
        copyToClipboard(text)
    }

    // ============ APPROVED ============

    const loadApproved = async () => {
        try {
            const res = await fetch(`${API_BASE}/bets/approved`)
            const data = await res.json()
            if (data.success) setApproved(data.bets)
        } catch (err) {
            console.error(err)
        }
    }

    const runSettlement = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/settlement/run`, { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                showToast(`${data.settled} bahis settle edildi!`)
                loadApproved()
                loadTraining()
            }
        } catch (err) {
            showToast(err.message, 'error')
        }
        setLoading(false)
    }

    const deleteBet = async (id) => {
        try {
            await fetch(`${API_BASE}/bets/${id}`, { method: 'DELETE' })
            loadApproved()
            showToast('Bahis silindi')
        } catch (err) {
            showToast(err.message, 'error')
        }
    }

    // ============ TRAINING ============

    const loadTraining = async () => {
        try {
            const [dataRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/training/all`),
                fetch(`${API_BASE}/training/stats`)
            ])
            const [dataJson, statsJson] = await Promise.all([dataRes.json(), statsRes.json()])
            if (dataJson.success) setTraining(dataJson.data)
            if (statsJson.success) setTrainingStats(statsJson.stats)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        loadApproved()
        loadTraining()
    }, [])

    const filteredResults = marketFilter === 'all'
        ? results
        : results.filter(r => r.marketKey === marketFilter)

    const markets = [...new Set(results.map(r => r.marketKey))]

    return (
        <div className="app">
            <aside className="sidebar">
                <h1>⚽ GoalSniper</h1>
                <nav>
                    <button
                        className={page === 'analysis' ? 'active' : ''}
                        onClick={() => setPage('analysis')}
                    >
                        📊 Analiz
                    </button>
                    <button
                        className={page === 'approved' ? 'active' : ''}
                        onClick={() => setPage('approved')}
                    >
                        ✅ Onaylanan Bahisler
                    </button>
                    <button
                        className={page === 'training' ? 'active' : ''}
                        onClick={() => setPage('training')}
                    >
                        🧠 Training Pool
                    </button>
                </nav>
            </aside>

            <main className="main">
                {/* ANALYSIS PAGE */}
                {page === 'analysis' && (
                    <>
                        <div className="header">
                            <h2>📊 Günlük Analiz</h2>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-primary" onClick={runAnalysis} disabled={loading}>
                                    {loading ? '⏳ Analiz Ediliyor...' : '🔍 Analizi Başlat'}
                                </button>
                                {results.length > 0 && (
                                    <>
                                        <button className="btn btn-secondary" onClick={copyAllMarketPrompts}>
                                            📋 Tüm Maçları Kopyala
                                        </button>
                                        <button className="btn btn-secondary" onClick={copyAllRawStats}>
                                            📊 Ham İstatistik
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {results.length > 0 && (
                            <div className="filter-bar">
                                <select value={marketFilter} onChange={e => setMarketFilter(e.target.value)}>
                                    <option value="all">Tüm Marketler ({results.length})</option>
                                    {markets.map(m => (
                                        <option key={m} value={m}>
                                            {m} ({results.filter(r => r.marketKey === m).length})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {loading && <div className="loading">⏳ Maçlar analiz ediliyor...</div>}

                        {!loading && results.length === 0 && (
                            <div className="empty">
                                Henüz analiz yapılmadı. Başlamak için "Analizi Başlat" butonuna tıklayın.
                            </div>
                        )}

                        {filteredResults.map(item => (
                            <div key={item.id} className="card">
                                <div className="card-header">
                                    <div>
                                        <div className="match-title">{item.homeTeam} vs {item.awayTeam}</div>
                                        <div className="match-league">{item.league}</div>
                                    </div>
                                    <span className="market-badge">{item.market}</span>
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-value">{item.stats.leagueAvg?.toFixed(1) || '-'}</div>
                                        <div className="stat-label">Lig Ort.</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{item.stats.homeForm?.over25Rate?.toFixed(0) || '-'}%</div>
                                        <div className="stat-label">Ev O2.5</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{item.stats.awayForm?.over25Rate?.toFixed(0) || '-'}%</div>
                                        <div className="stat-label">Dep O2.5</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{item.stats.homeHomeStats?.scoringRate?.toFixed(0) || '-'}%</div>
                                        <div className="stat-label">Ev Gol%</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{item.stats.awayAwayStats?.scoringRate?.toFixed(0) || '-'}%</div>
                                        <div className="stat-label">Dep Gol%</div>
                                    </div>
                                </div>

                                <div className="actions">
                                    <input
                                        type="text"
                                        className="odds-input"
                                        placeholder="Oran"
                                        value={oddsInputs[item.id] || ''}
                                        onChange={e => setOddsInputs({ ...oddsInputs, [item.id]: e.target.value })}
                                    />
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => {
                                            let prompt = item.aiPrompt
                                            if (oddsInputs[item.id]) {
                                                prompt = prompt.replace(`Market: ${item.market}`, `Market: ${item.market}\nOdds: ${oddsInputs[item.id]}`)
                                            }
                                            copyToClipboard(prompt)
                                        }}
                                    >
                                        📋 AI Prompt
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => copyToClipboard(item.rawStats)}
                                    >
                                        📊 Ham İstatistik
                                    </button>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => approveBet(item)}
                                    >
                                        ✓ Onayla
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* APPROVED BETS PAGE */}
                {page === 'approved' && (
                    <>
                        <div className="header">
                            <h2>✅ Onaylanan Bahisler</h2>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-primary" onClick={runSettlement} disabled={loading}>
                                    {loading ? '⏳ Çalışıyor...' : '⚖️ Settlement Çalıştır'}
                                </button>
                                <button className="btn btn-secondary" onClick={loadApproved}>
                                    🔄 Yenile
                                </button>
                            </div>
                        </div>

                        {approved.length === 0 ? (
                            <div className="empty">Henüz onaylanmış bahis yok.</div>
                        ) : (
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Maç</th>
                                            <th>Lig</th>
                                            <th>Market</th>
                                            <th>Oran</th>
                                            <th>Durum</th>
                                            <th>Sonuç</th>
                                            <th>Tarih</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approved.map(bet => (
                                            <tr key={bet.id}>
                                                <td>{bet.home_team} vs {bet.away_team}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{bet.league}</td>
                                                <td>{bet.market}</td>
                                                <td>{bet.odds || '-'}</td>
                                                <td>
                                                    <span className={`status-badge status-${bet.status?.toLowerCase()}`}>
                                                        {bet.status}
                                                    </span>
                                                </td>
                                                <td>{bet.final_score || '-'}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(bet.approved_at).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => deleteBet(bet.id)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* TRAINING POOL PAGE */}
                {page === 'training' && (
                    <>
                        <div className="header">
                            <h2>🧠 Training Pool</h2>
                            <button className="btn btn-secondary" onClick={loadTraining}>
                                🔄 Yenile
                            </button>
                        </div>

                        {trainingStats && (
                            <div className="stats-card">
                                <div className="stat-box">
                                    <div className="value">{trainingStats.total}</div>
                                    <div className="label">Toplam</div>
                                </div>
                                <div className="stat-box">
                                    <div className="value" style={{ color: 'var(--success)' }}>{trainingStats.won}</div>
                                    <div className="label">Kazanan</div>
                                </div>
                                <div className="stat-box">
                                    <div className="value" style={{ color: 'var(--danger)' }}>{trainingStats.lost}</div>
                                    <div className="label">Kaybeden</div>
                                </div>
                                <div className="stat-box">
                                    <div className="value" style={{ color: 'var(--accent)' }}>{trainingStats.winRate}%</div>
                                    <div className="label">Win Rate</div>
                                </div>
                            </div>
                        )}

                        {training.length === 0 ? (
                            <div className="empty">Training pool boş.</div>
                        ) : (
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Maç</th>
                                            <th>Lig</th>
                                            <th>Market</th>
                                            <th>Oran</th>
                                            <th>Sonuç</th>
                                            <th>Skor</th>
                                            <th>Tarih</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {training.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.match}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{item.league}</td>
                                                <td>{item.market}</td>
                                                <td>{item.odds || '-'}</td>
                                                <td>
                                                    <span className={`status-badge status-${item.result?.toLowerCase()}`}>
                                                        {item.result}
                                                    </span>
                                                </td>
                                                <td>{item.final_score}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(item.settled_at).toLocaleDateString('tr-TR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.message}
                </div>
            )}
        </div>
    )
}

export default App
