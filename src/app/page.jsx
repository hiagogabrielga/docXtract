"use client";
import { useState } from "react";
import { useRef } from "react";

import extrairMotivoNegativa from "../utils/MotivoNegativa";
import { extractText } from "unpdf";
import { downloadExcel } from "../utils/ExcelFile";
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

import { FileSpreadsheet, TrendingUp, Upload, Zap, Plus } from "lucide-react";
import styles from "./page.module.css";
export default function Home() {
  const [filesUpload, setFilesUpload] = useState([]);
  const [cursoDrag, setCursoDrag] = useState(false);
  const [data, setData] = useState([]);
  const dragCounter = useRef(0);

  function handleAddFiles(fileList) {
    const pdfs = Array.from(fileList).filter(
      (file) => file.type === "application/pdf"
    );

    setFilesUpload((prev) => [...prev, ...pdfs]);
  }

  async function handleUpload() {
    if (!filesUpload.length) return;

    const resultadoFinal = [];

    for (const file of filesUpload) {
      try {
        const buffer = await file.arrayBuffer();
        const pages = await extractText(new Uint8Array(buffer));

        resultadoFinal.push({
          fileName: file.name,
          pages: formatandoCandidatos(pages.text),
        });
      } catch (error) {
        console.error("Erro ao processar:", file.name, error);
      }
    }

    downloadExcel(resultadoFinal);
  }

  return (
    <main>
      <div className={styles.subTitulo}>
        <Zap size={16} />
        <h4>Processamento Automatizado</h4>
      </div>
      <h3 className={styles.titulo}>
        Transforme seus dados educacionais em insights acionáveis
      </h3>
      <h2 className={styles.paragrafo}>
        Envie múltiplos arquivos PDF e receba análises completas sobre acesso de
        alunos, problemas identificados e relatórios consolidados em Excel
      </h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.icone} id={styles.iconeUpload}>
            <Upload />
          </div>
          <h3 className={styles.tituloCard}>Upload Simplificado</h3>
          <p className={styles.paragrafoCard}>
            Envie múltiplos PDFs de uma só vez
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.icone} id={styles.iconeGrafico}>
            <TrendingUp />
          </div>

          <h3 className={styles.tituloCard}>Análise Inteligente</h3>
          <p className={styles.paragrafoCard}>
            Dashboard com insights detalhados
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.icone} id={styles.iconeFile}>
            <FileSpreadsheet />
          </div>

          <h3 className={styles.tituloCard}>Relatórios Excel</h3>
          <p className={styles.paragrafoCard}>
            Dados consolidados prontos para uso
          </p>
        </div>
      </div>
      <div
        className={styles.containerInput}
        onDragEnter={(e) => {
          e.preventDefault();
          dragCounter.current++;
          setCursoDrag(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragCounter.current--;
          if (dragCounter.current === 0) {
            setCursoDrag(false);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragCounter.current = 0;
          setCursoDrag(false);
          handleAddFiles(e.dataTransfer.files);
        }}
      >
        <div
          className={`${styles.wrapper}`}
          style={{ backgroundColor: cursoDrag ? `#c2c2c2` : `#fff` }}
        >
          <p className={styles.title}>Envie seus arquivos para processar</p>

          <label htmlFor="uploader" className={`${styles.dropzone}`}>
            <div
              className={styles.icon}
              style={{ backgroundColor: cursoDrag ? `#e2e2e2` : `#fff` }}
            >
              {cursoDrag ? <Plus size={28} /> : <Upload size={28} />}
            </div>
            <p className={styles.text}>
              Arraste seus arquivos PDF aqui <br />
              <span>ou clique para selecionar</span>
            </p>
            <small className={styles.hint}>
              Suporta múltiplos arquivos PDF
            </small>
            <input
              id="uploader"
              name="uploader"
              type="file"
              accept="application/pdf"
              multiple
              className={styles.input}
              onChange={(e) => handleAddFiles(e.target.files)}
            />{" "}
          </label>
        </div>
      </div>{" "}
      <div className={styles.containerFiles}>
        {filesUpload.length > 0 && (
          <div className={styles.fileList}>
            {filesUpload.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <span className={styles.fileName}>{file.name}</span>

                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() =>
                    setFilesUpload((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {filesUpload.length > 0 && (
        <div>
          <button className={styles.botaoExcel} onClick={() => handleUpload(filesUpload)}>
            Transcrever para Excel
          </button>
        </div>
      )}
    </main>
  );
}
