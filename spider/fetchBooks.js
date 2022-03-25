const axios = require("axios").default;
const cheerio = require("cheerio");
const Book = require("../models/Book");


async function getBooksHTML(){
    const resp = await axios.get("https://book.douban.com/chart?subcat=all&icn=index-topchart-popular")
    return resp.data;
}

async function getListLink(){
   const html = await getBooksHTML();
   const $ = cheerio.load(html);
   const linkList = $("#content .article ul.chart-dashed-list li.media .media__img a");
   const linkArray = linkList.map((i,item)=>{
        const href = item.attribs["href"];
        return href;
   }).get();
   return linkArray;
}
async function getBookDetail(url){
    const resp = await axios.get(url);
   const $ = cheerio.load(resp.data);
   const name = $("#wrapper h1 span").html();
   const imgurl = $("#mainpic a img").attr("src");
   const spans = $("#info span.pl");
   const authorSpan = spans.filter((i,ele)=>{
    return $(ele).text().includes("作者");
   });
   var author = authorSpan.next("a").text();
   if(authorSpan.next("a").next("a").text()){
     author += "/" + authorSpan.next("a").next("a").text();
   }
   const publicSpan = spans.filter((i,ele)=>{
    return $(ele).text().includes("出版年");
   });
   const publishDate = publicSpan[0].nextSibling.nodeValue.trim();
   return {
       name,
       imgurl,
       publishDate,
       author
   }
    
}

async function fetchAll(){
    const arraybookDetailLink = await getListLink();
    const proms = arraybookDetailLink.map((item)=>{
        return getBookDetail(item);
    });
    return Promise.all(proms);
}

async function saveToDB(){
    const books = fetchAll();
    await Book.bulkCreate(books)
    console.log("抓取数据成功！")
}
saveToDB();
