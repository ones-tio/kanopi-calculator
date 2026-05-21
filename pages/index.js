import { useState, useCallback } from 'react'
import Head from 'next/head'

const HARGA_DEFAULT = {
  single: 650000,
  double: 750000,
  talang: 300000,
}

const INCLUDES = [
  'Frame Hollow Galvanaish 5×10',
  'Rangka Hollow Galvanaish 4×6',
  'Talang Plat Eser',
  'Cat Dasar Epoxy',
  'Cat Finish',
  'Sudah termasuk Jasa Pasang & Kirim',
]

function fmtRp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

function fmtRpShort(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

export default function Home() {
  const [jenis, setJenis] = useState('minimalis')
  const [atap, setAtap] = useState('single')
  const [panjang, setPanjang] = useState(6)
  const [lebar, setLebar] = useState(6)
  const [hAtap, setHAtap] = useState(HARGA_DEFAULT.single)
  const [hTalang, setHTalang] = useState(HARGA_DEFAULT.talang)
  const [namaCustomer, setNamaCustomer] = useState('')
  const [catatan, setCatatan] = useState('')
  const [downloading, setDownloading] = useState(false)

  const volume = Math.round(panjang * lebar * 100) / 100
  const namaAtap = atap === 'single' ? 'Atap Alderon Single' : 'Atap Alderon Double'
  const namaKanopi = jenis === 'minimalis' ? 'Kanopi Minimalis' : 'Kanopi Talang Profil'

  let rows = []
  let total = 0

  if (jenis === 'minimalis') {
    const biaya = hAtap * volume
    total = biaya
    rows = [
      {
        label: `${namaAtap}`,
        detail: `${fmtRpShort(hAtap)} × ${volume} m²`,
        nilai: biaya,
      },
    ]
  } else {
    const volAtap = Math.round(panjang * lebar / 2 * 100) / 100
    const biayaAtap = hAtap * volAtap
    const biayaTalang = hTalang * lebar
    total = biayaAtap + biayaTalang
    rows = [
      {
        label: `${namaAtap}`,
        detail: `${fmtRpShort(hAtap)} × ${volAtap} m²`,
        nilai: biayaAtap,
      },
      {
        label: 'Talang Air Profil',
        detail: `${fmtRpShort(hTalang)} × ${lebar} m`,
        nilai: biayaTalang,
      },
    ]
  }

  const handleAtapChange = (val) => {
    setAtap(val)
    setHAtap(val === 'single' ? HARGA_DEFAULT.single : HARGA_DEFAULT.double)
  }

  const handleDownloadPDF = useCallback(async () => {
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = doc.internal.pageSize.getWidth()
      const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

      // Header strip
      doc.setFillColor(26, 58, 110)
      doc.rect(0, 0, W, 32, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('PENAWARAN HARGA KANOPI', W / 2, 13, { align: 'center' })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Bengkel Las & Aluminium', W / 2, 20, { align: 'center' })
      doc.text(`Tanggal: ${today}`, W / 2, 27, { align: 'center' })

      let y = 40

      // Customer info
      if (namaCustomer) {
        doc.setTextColor(60, 60, 60)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Kepada Yth: ${namaCustomer}`, 14, y)
        y += 8
      }

      // Judul paket
      doc.setTextColor(26, 58, 110)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(namaKanopi, 14, y)
      y += 6

      doc.setTextColor(100, 100, 100)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Volume: ${panjang} × ${lebar} = ${volume} m²`, 14, y)
      y += 10

      // Tabel rincian harga
      autoTable(doc, {
        startY: y,
        head: [['Uraian', 'Perhitungan', 'Harga']],
        body: rows.map(r => [r.label, r.detail, fmtRp(r.nilai)]),
        foot: [['', 'TOTAL HARGA', fmtRp(total)]],
        theme: 'grid',
        headStyles: {
          fillColor: [26, 58, 110],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center',
        },
        footStyles: {
          fillColor: [240, 245, 255],
          textColor: [26, 58, 110],
          fontStyle: 'bold',
          fontSize: 11,
        },
        columnStyles: {
          0: { cellWidth: 65 },
          1: { cellWidth: 65, halign: 'center' },
          2: { cellWidth: 50, halign: 'right', fontStyle: 'bold', textColor: [220, 60, 60] },
        },
        styles: { fontSize: 10, cellPadding: 4 },
        margin: { left: 14, right: 14 },
      })

      y = doc.lastAutoTable.finalY + 10

      // Kotak "Sudah Termasuk"
      doc.setFillColor(240, 245, 255)
      doc.setDrawColor(26, 58, 110)
      doc.roundedRect(14, y, W - 28, 8 + INCLUDES.length * 7, 3, 3, 'FD')

      doc.setTextColor(26, 58, 110)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Sudah Termasuk:', 18, y + 6)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(40, 40, 40)
      INCLUDES.forEach((item, i) => {
        doc.text(`✓  ${item}`, 20, y + 13 + i * 7)
      })

      y = y + 10 + INCLUDES.length * 7 + 6

      // Catatan
      if (catatan) {
        doc.setTextColor(80, 80, 80)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.text(`Catatan: ${catatan}`, 14, y)
        y += 8
      }

      // Footer
      doc.setFillColor(26, 58, 110)
      doc.rect(0, 282, W, 15, 'F')
      doc.setTextColor(200, 220, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Terima kasih atas kepercayaan Anda. Harga berlaku 7 hari dari tanggal penawaran.', W / 2, 291, { align: 'center' })

      const filename = `Penawaran_Kanopi_${namaCustomer ? namaCustomer.replace(/\s+/g, '_') + '_' : ''}${panjang}x${lebar}m.pdf`
      doc.save(filename)
    } catch (err) {
      console.error(err)
      alert('Gagal generate PDF. Coba lagi.')
    }
    setDownloading(false)
  }, [jenis, atap, panjang, lebar, hAtap, hTalang, namaCustomer, catatan, rows, total, volume, namaAtap, namaKanopi])

  return (
    <>
      <Head>
        <title>Kalkulator Harga Kanopi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <h1 style={s.headerTitle}>🏗️ Kalkulator Harga Kanopi</h1>
          <p style={s.headerSub}>Bengkel Las & Aluminium</p>
        </div>

        <div style={s.container}>
          {/* Left: Form */}
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Data Penawaran</h2>

            {/* Nama customer */}
            <div style={s.field}>
              <label style={s.label}>Nama Customer (opsional)</label>
              <input
                style={s.input}
                type="text"
                placeholder="Contoh: Bpk. Andi"
                value={namaCustomer}
                onChange={e => setNamaCustomer(e.target.value)}
              />
            </div>

            {/* Jenis kanopi */}
            <div style={s.field}>
              <label style={s.label}>Jenis Kanopi</label>
              <div style={s.toggleGroup}>
                {['minimalis', 'talang'].map(t => (
                  <button
                    key={t}
                    style={jenis === t ? s.toggleActive : s.toggle}
                    onClick={() => setJenis(t)}
                  >
                    {t === 'minimalis' ? 'Minimalis' : 'Talang Profil'}
                  </button>
                ))}
              </div>
            </div>

            {/* Jenis atap */}
            <div style={s.field}>
              <label style={s.label}>Jenis Atap</label>
              <div style={s.toggleGroup}>
                {['single', 'double'].map(a => (
                  <button
                    key={a}
                    style={atap === a ? s.toggleActive : s.toggle}
                    onClick={() => handleAtapChange(a)}
                  >
                    Alderon {a === 'single' ? 'Single' : 'Double'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensi */}
            <div style={s.field}>
              <label style={s.label}>Dimensi (meter)</label>
              <div style={s.row2}>
                <div style={{ flex: 1 }}>
                  <label style={s.labelSub}>Panjang (m)</label>
                  <input style={s.input} type="number" min="0.1" step="0.1"
                    value={panjang} onChange={e => setPanjang(parseFloat(e.target.value) || 0)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.labelSub}>Lebar (m)</label>
                  <input style={s.input} type="number" min="0.1" step="0.1"
                    value={lebar} onChange={e => setLebar(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            {/* Harga satuan */}
            <div style={s.field}>
              <label style={s.label}>Harga Satuan</label>
              <div style={s.row2}>
                <div style={{ flex: 1 }}>
                  <label style={s.labelSub}>Atap / m² (Rp)</label>
                  <input style={s.input} type="number" step="1000"
                    value={hAtap} onChange={e => setHAtap(parseFloat(e.target.value) || 0)} />
                </div>
                {jenis === 'talang' && (
                  <div style={{ flex: 1 }}>
                    <label style={s.labelSub}>Talang / m (Rp)</label>
                    <input style={s.input} type="number" step="1000"
                      value={hTalang} onChange={e => setHTalang(parseFloat(e.target.value) || 0)} />
                  </div>
                )}
              </div>
            </div>

            {/* Catatan */}
            <div style={s.field}>
              <label style={s.label}>Catatan (opsional)</label>
              <textarea style={{ ...s.input, minHeight: 60, resize: 'vertical' }}
                placeholder="Contoh: Warna sesuai permintaan, dp 50%..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
              />
            </div>
          </div>

          {/* Right: Result */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Hasil */}
            <div style={s.card}>
              <h2 style={s.sectionTitle}>Rincian Harga</h2>

              <div style={s.volBadge}>
                📐 Volume: {panjang} × {lebar} = <strong>{volume} m²</strong>
              </div>

              <div style={s.namaKanopi}>{namaKanopi}</div>

              <div style={s.resultList}>
                {rows.map((r, i) => (
                  <div key={i} style={s.resultRow}>
                    <div>
                      <div style={s.resultLabel}>{r.label}</div>
                      <div style={s.resultDetail}>{r.detail}</div>
                    </div>
                    <div style={s.resultNilai}>{fmtRp(r.nilai)}</div>
                  </div>
                ))}
              </div>

              <div style={s.totalBox}>
                <span style={s.totalLabel}>TOTAL HARGA</span>
                <span style={s.totalNilai}>{fmtRp(total)}</span>
              </div>
            </div>

            {/* Sudah Termasuk */}
            <div style={s.includeCard}>
              <div style={s.includeTitle}>✅ Sudah Termasuk</div>
              {INCLUDES.map((item, i) => (
                <div key={i} style={s.includeRow}>
                  <span style={s.checkIcon}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Download */}
            <button
              style={downloading ? s.btnDisabled : s.btn}
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading ? '⏳ Membuat PDF...' : '📄 Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%)',
  },
  header: {
    background: 'linear-gradient(135deg, #1a3a6e 0%, #1e5fa8 100%)',
    color: '#fff',
    padding: '28px 24px 24px',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.3px',
  },
  headerSub: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.8,
  },
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '24px 16px 40px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '22px 20px',
    boxShadow: '0 2px 16px rgba(26,58,110,0.08)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1a3a6e',
    marginBottom: 18,
    paddingBottom: 10,
    borderBottom: '2px solid #eef2ff',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#444',
    marginBottom: 7,
  },
  labelSub: {
    display: 'block',
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #dde3f0',
    borderRadius: 8,
    fontSize: 14,
    color: '#1a1a2e',
    background: '#fafbff',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  row2: {
    display: 'flex',
    gap: 10,
  },
  toggleGroup: {
    display: 'flex',
    gap: 8,
  },
  toggle: {
    flex: 1,
    padding: '8px 10px',
    border: '1.5px solid #dde3f0',
    borderRadius: 8,
    background: '#fafbff',
    color: '#666',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  toggleActive: {
    flex: 1,
    padding: '8px 10px',
    border: '1.5px solid #1a3a6e',
    borderRadius: 8,
    background: '#1a3a6e',
    color: '#fff',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  volBadge: {
    background: '#eef2ff',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: '#1a3a6e',
    marginBottom: 12,
  },
  namaKanopi: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a3a6e',
    marginBottom: 12,
  },
  resultList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 14,
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: '10px 12px',
    background: '#f8faff',
    borderRadius: 8,
    border: '1px solid #e8edf8',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: 2,
  },
  resultDetail: {
    fontSize: 12,
    color: '#888',
  },
  resultNilai: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e5fa8',
    whiteSpace: 'nowrap',
    marginLeft: 8,
  },
  totalBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1a3a6e, #1e5fa8)',
    borderRadius: 10,
    padding: '14px 16px',
    marginTop: 4,
  },
  totalLabel: {
    color: '#a8c4f0',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  totalNilai: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 800,
  },
  includeCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '18px 20px',
    boxShadow: '0 2px 16px rgba(26,58,110,0.08)',
  },
  includeTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a3a6e',
    marginBottom: 12,
  },
  includeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 0',
    fontSize: 13,
    color: '#333',
    borderBottom: '1px solid #f0f2f8',
  },
  checkIcon: {
    color: '#22c55e',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #1a3a6e, #1e5fa8)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.03em',
    boxShadow: '0 4px 14px rgba(26,58,110,0.3)',
    transition: 'opacity 0.2s',
  },
  btnDisabled: {
    width: '100%',
    padding: '14px',
    background: '#ccc',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'not-allowed',
    letterSpacing: '0.03em',
  },
}
