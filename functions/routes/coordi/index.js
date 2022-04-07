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

function recommandValidtor(coordi,condition) {
  const { stemp, isRain, isSnow, windSpeed} = condition;
  if (coordi['temperature'][LOWER] > stemp || stemp > coordi['temperature'][UPPER]) return false;
  if(isRain) {
    if (coordi.items.some(item=>item.category==='jeans') && coordi.items.some(item=>item.category==='short-sleeve'&&item.color==='white')) return false; // 비올때 흰티 청바지 조합 제외
    if (coordi.items.some(item=>item.category==='skirt')) return false; // 비올때 스커트 제외
    if (coordi.items.some(item=>item.category==='shirt')) return false; // 비올때 셔츠 제외
    if (coordi.items.some(item=>item.category==='blouse')) return false; // 비올때 블라우스 제외
    if (coordi.items.some(item=>item.color==='white')) return false; // 비올때 흰옷 제외  // hex로 바꾸면?
    if (coordi.items.some(item=>item.features.some(feature=>feature==='neat'))) return false; // 비올때 니트 제외
  }
  if(isSnow) {
    if (coordi.items.some(item=>item.category==='far')) return false; // 눈올때 far 제외
  }
  if(windSpeed>SKIRT_WARNING) {
    if (coordi.items.some(item=>item.category==='mini-skirt')) return false; // 바람이 쌔면 미니스커트 제외
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

      res.json(recommandCoordiList.map(coordi=>{
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