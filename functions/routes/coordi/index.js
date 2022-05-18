// eslint-disable-next-line new-cap
const router = require("express").Router();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const MAN = "1";
const WOMAN = "2";
const LOWER = 0;
const UPPER = 1;
const SKIRT_WARNING = 4;
const MAX_NUM_OF_COORDI = 20;

function recommandValidtor(coordi,condition) {
  const { stemp, isRain, isSnow, windSpeed} = condition;
  if (coordi['temperature'][LOWER] > stemp || stemp > coordi['temperature'][UPPER]) return false;
  if(isRain) {
    if (coordi.items.some(item=>item.minor==='skirt')) return false; // 비올때 스커트 제외
    if (coordi.items.some(item=>item.minor==='shirt')) return false; // 비올때 셔츠 제외
    if (coordi.items.some(item=>item.minor==='blouse')) return false; // 비올때 블라우스 제외
    if (coordi.items.some(item=>item.minor==='neat')) return false; // 비올때 니트 제외
  }
  if(isSnow) {
    if (coordi.items.some(item=>item.minor==='far')) return false; // 눈올때 far 제외
  }
  if(windSpeed>SKIRT_WARNING) {
    if (coordi.items.some(item=>item.minor==='mini-skirt')) return false; // 바람이 쌔면 미니스커트 제외
  }
  return true;
}
/*
작업 내용
get->post로 수정
가지고 있는 index list를 받음(alreadyHave)
genderCoordiList에서 recommandValidtor를 통과하는 원소만 filter
recommandCoordiList에서 MAX_NUM_OF_COORDI개의 index를 뽑음
이때 alreadyHave를 set으로 만들고 이 set에 has되는 index는 무시하고 다시뽑도록 설정
만들어진 index list로부터 코디를 뽑아 전달
*/
router.get("/recommand", async (req, res) => {
  const gender = parseInt(req.query.gender);
  const stemp = parseInt(req.query.stemp);
  const isRain = req.query.isRain === 'true';
  const isSnow = req.query.isSnow === 'true';
  const windSpeed  = parseInt(req.query.windSpeed);
  //const alreadyHave = 

  try {
    const db = admin.firestore();
    const coordisCollection = db.collection('coordis');
    const genderCoordiList = await coordisCollection
    .where('gender',"==",parseInt(gender)).get();
    if(genderCoordiList.empty) {
      res.json([]);
    } 

    const condition = {
      stemp : stemp,
      isRain : isRain,
      isSnow : isSnow,
      windSpeed : windSpeed
    }

    const recommandCoordiList = [];
    genderCoordiList
      .forEach(doc=>{
        const coordi = doc.data();
        if(recommandValidtor(coordi,condition)) {
          recommandCoordiList.push(coordi);
        }
    });
    const randomIndexSet = new Set();
    let LimitedRecommandCoordiList = [];
    if(recommandCoordiList.length <= MAX_NUM_OF_COORDI) { // 코디가 MAX_NUM_OF_COORDI보다 적으면 읽어온 리스트를 전부 반환
      LimitedRecommandCoordiList = recommandCoordiList;
    }
    else {//이 방법은 코디의 수가 적을 땐 오히려 비효율적이다
      while(randomIndexSet.size < MAX_NUM_OF_COORDI) {
        let idx = Math.floor(Math.random() * (recommandCoordiList.length-1));
        randomIndexSet.add(idx);
      }
      randomIndexSet.forEach(idx=>{
        LimitedRecommandCoordiList.push(recommandCoordiList[idx]);
      })
    }
    
    res.json(LimitedRecommandCoordiList.map(coordi=>{
      return {
        url: coordi.url || '',
        items: coordi.items || [],
        style: coordi.style || ''
      }
    }));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;