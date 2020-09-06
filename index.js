require('dotenv/config');
const puppeteer = require('puppeteer');
const bcryptjs = require('bcryptjs');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch(); // Abre o navegador em background
  const page = await browser.newPage(); // Abre uma nova aba
  await page.goto(`https://busca.livrariacultura.com.br/search/?query=${process.env.SEARCH}`); // Abre a página

  // Percorre o site, fazendo a busca pelo conteúdo
  const bookList = await page.evaluate(() => {
    // Seletor do conteúdo da página
    const nodeList = document.querySelectorAll('.prateleiraProduto.pronto.livros')

    // Transforma em Array
    const bookArray = [...nodeList]

    // Percorre o array e monta o dados
    const bookList = bookArray.map(book => ({
        name: book.children[2].children[1].innerText.replace('\n', ''),
        author: book.children[2].children[2].innerText.replace('Colaborador\n', '')
    }))

    // Retorna os dados montados
    return bookList;
  });

  // Gera um hash de 4 caracteres como nome do arquivo json
  const hashNameFile = await bcryptjs.genSaltSync(6);

  // Cria o arquivo e escreve o conteúdo convertido para json
  fs.writeFile(`${hashNameFile}.json`, JSON.stringify(bookList, null, 2), err => {
    // Caso dê erro
    if (err) throw new Error('something went wrong')

    // Caso dê sucesso!
    console.log('well done!')
  });

  // Fecha o browser
  await browser.close();
})();
