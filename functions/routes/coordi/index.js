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

router.get("/recommand", async (req, res) => {
  const gender = parseInt(req.query.gender);
  const stemp = parseInt(req.query.stemp);
  const isRain = req.query.isRain === 'true';
  const isSnow = req.query.isSnow === 'true';
  const windSpeed  = parseInt(req.query.windSpeed);

  try {
    const db = admin.firestore();
    const coordisCollection = db.collection('coordis');
    const genderCoordiList = await coordisCollection
    .where('gender',"==",parseInt(gender)).get();

    if(genderCoordiList.empty) {
      res.json([]);
    } else {
      const recommandCoordiList = [];
      const condition = {
        stemp : stemp,
        isRain : isRain,
        isSnow : isSnow,
        windSpeed : windSpeed
      }
      genderCoordiList
        .forEach(doc=> {
          const coordi = doc.data();
          if (recommandValidtor(coordi,condition)) {
            recommandCoordiList.push(coordi);
          }
        });
      let recommandCoordiListWithRandomIndex = recommandCoordiList.map(coordi=>{
        return {
          ...coordi,
          random:Math.floor(Math.random() * (recommandCoordiList.length-1))
        }
      });
      recommandCoordiListWithRandomIndex.sort((a,b)=>{
        if(a.random < b.random) return 1;
        else return -1;
      })
      let LimitedRecommandCoordiList = recommandCoordiListWithRandomIndex.slice(0,MAX_NUM_OF_COORDI);
      res.json(LimitedRecommandCoordiList.map(coordi=>{
        return {
          url: coordi.url,
          items: coordi.items
        }
      }));
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;