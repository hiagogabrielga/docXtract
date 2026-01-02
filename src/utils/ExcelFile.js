import * as XLSX from "xlsx";

/* ===========================
   Remove duplicadas
=========================== */
function removerDuplicadas(rows) {
  const map = new Map();

  for (const row of rows) {
    const chave = [
      row.Pagina,
      row.Nome,
      row.Curso,
      row.Campus,
      row.Documento,
      row.dataAssinatura,
      ...Object.keys(row)
        .filter((k) => k.startsWith("Motivo da Negativa"))
        .map((k) => row[k]),
    ].join("||");

    if (!map.has(chave)) {
      map.set(chave, row);
    }
  }

  return Array.from(map.values());
}

/* ===========================
   Aplica wrapText nas colunas de motivo
=========================== */
function aplicarWrapText(worksheet, colInicio, colFim, totalLinhas) {
  for (let C = colInicio; C <= colFim; C++) {
    for (let R = 1; R <= totalLinhas; R++) {
      const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
      const cell = worksheet[cellAddress];

      if (!cell) continue;

      cell.s = {
        alignment: {
          wrapText: true,
          vertical: "top",
        },
      };
    }
  }
}

export async function downloadExcel(data) {
  // 1️⃣ Descobre o máximo de motivos
  try {
    const maxMotivos = Math.max(
      0,
      ...data.flatMap((arquivo) =>
        arquivo.pages.map((c) => c.motivosNegativa?.length || 0)
      )
    );

    // 2️⃣ Monta as linhas
    const rows = data.flatMap((arquivo) =>
      arquivo.pages.map((candidato) => {
        const row = {
          Arquivo: arquivo.fileName,
          Pagina: candidato.pagina,
          Nome: candidato.nome,
          Curso: candidato.curso,
          Campus: candidato.campus,
          Documento: candidato.tipoDocumento,
          "Data Assinatura": candidato.dataAssinatura,
        };

        for (let i = 0; i < maxMotivos; i++) {
          row[`Motivo da Negativa ${i + 1}`] =
            candidato.motivosNegativa?.[i] || "-";
        }

        return row;
      })
    );

    // 3️⃣ Remove duplicadas ANTES de criar a planilha
    const rowsSemDuplicatas = removerDuplicadas(rows);

    // 4️⃣ Cria worksheet e workbook
    const worksheet = XLSX.utils.json_to_sheet(rowsSemDuplicatas);
    const workbook = XLSX.utils.book_new();

    // 5️⃣ Ajusta largura das colunas
    worksheet["!cols"] = [
      { wch: 20 }, // Arquivo
      { wch: 5 }, // Pagina
      { wch: 30 }, // Nome
      { wch: 25 }, // Curso
      { wch: 10 }, // Campus
      { wch: 25 }, // Documento
      { wch: 10 }, // Data
      ...Array.from({ length: maxMotivos }, () => ({ wch: 120 })),
    ];

    // 6️⃣ Aplica wrapText nas colunas de motivos
    const totalLinhas = rowsSemDuplicatas.length;

    // índices (0-based):
    // 0 Arquivo
    // 1 Pagina
    // 2 Nome
    // 3 Curso
    // 4 Campus
    // 5 Documento
    // 6 Data
    // 7 Motivo 1 ← começa aqui
    const colInicioMotivos = 7;
    const colFimMotivos = 7 + maxMotivos - 1;

    aplicarWrapText(worksheet, colInicioMotivos, colFimMotivos, totalLinhas);

    // 7️⃣ Finaliza
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidatos");
    XLSX.writeFile(workbook, "candidatos.xlsx");
    return true;
  } catch {
    return false;
  }
}
