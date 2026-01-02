"use client";
import extrairMotivoNegativa from "../../../utils/MotivoNegativa";
import { useState } from "react";
import { extractText } from "unpdf";
import { downloadExcel } from "../../../utils/ExcelFile";
function extrairCampo(texto, label, delimitadores = [",", "-", "\\n"]) {
  const fim = delimitadores.join("|");

  const regex = new RegExp(
    `${label}\\s*(?:de\\s*)?([\\s\\S]*?)(?=\\s*(?:${fim}))`,
    "i"
  );

  const match = texto.match(regex);

  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

function extrairData(texto) {
  const regex = /em\s*(\d{2}\/\d{2}\/\d{4})/i;
  const match = texto.match(regex);
  return match ? match[1] : null;
}

function titleCasePt(texto) {
  const ignorar = ["de", "da", "do", "das", "dos", "em", "e"];

  return texto
    .toLowerCase()
    .split(" ")
    .map((palavra, index) => {
      if (index !== 0 && ignorar.includes(palavra)) {
        return palavra;
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}

function formatandoCandidatos(pages) {
  let candidatos = [];
  for (const page in pages) {
    let texto = pages[page];
    let nomeCandidato = extrairCampo(texto, "candidato\\(a\\)", ["-", ","]);
    let campusCandidato = extrairCampo(texto, "campus", ["-", ","]);
    let cursoCandidato = extrairCampo(texto, "curso", ["-", ","]);
    let tipoDocumento = extrairCampo(texto, "declaração", [
      "-",
      ",",
      "\\n",
      "de",
    ]);
    let assinatura = extrairData(texto);
    let motivoNegativa = extrairMotivoNegativa(texto);

    let candidato = {
      pagina: Number(page) + 1,
      nome: titleCasePt(nomeCandidato),
      curso: titleCasePt(cursoCandidato),
      campus: titleCasePt(campusCandidato),
      tipoDocumento: titleCasePt(tipoDocumento),
      dataAssinatura: assinatura,
      motivosNegativa: motivoNegativa,
    };
    candidatos.push(candidato);
  }
  return candidatos;
}

export default function PdfReader() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setLoading(true);
    setData([]);

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();

        const pages = await extractText(new Uint8Array(buffer));

        setData((prev) => [
          ...prev,
          {
            fileName: file.name,
            pages: formatandoCandidatos(pages.text),
          },
        ]);
      } catch (err) {
        console.error(err);
      }
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleUpload}
      />

      {loading && <p>Lendo PDFs...</p>}

      <pre style={{ maxHeight: 400, overflow: "auto" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
      <button
        onClick={() => downloadExcel(data)}
        disabled={!data.length}
        style={{
          marginTop: 10,
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        Baixar Excel
      </button>
    </div>
  );
}
