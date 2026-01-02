export default function extrairMotivoNegativa(texto) {
  const motivos = [];

  const blocosPosX = Array.from(
    texto.matchAll(/X\s*\n([\s\S]*?)(?=\n-)|X\s+([^\n]+)/g),
    (m) => m[1] || m[2]
  );

  const blocos = blocosPosX.filter((item) => item.length > 10);
  //console.log(blocos);
  if (blocosPosX == 0) {
    motivos.push("-");
  } else {
    for (const bloco in blocos) {
      motivos.push(blocos[bloco]);
    }
  }

  return motivos;
}
