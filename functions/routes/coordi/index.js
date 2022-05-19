// eslint-disable-next-line new-cap
const router = require("express").Router();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const MAN = 1;
const WOMAN = 2;
const LOWER = 0;
const UPPER = 1;
const SKIRT_WARNING = 4;
const MAX_NUM_OF_COORDI = 20;
const cloth2temp = {
  "cardigan": [12, 22],
  "nambang": [20, 26],
  "hood_zipup": [12, 20],
  "coat": [6, 12],
  "short_coat": [6, 12],
  "trench_coat": [10, 16],
  "blouson": [10, 16],
  "leather_jacket": [6, 12],
  "moose_leather_coat": [6, 12],
  "fur": [6, 12],
  "airline_jumper": [10, 16],
  "blazer": [10, 16],
  "blue_jacket": [12, 16],
  "anorak_jacket": [10, 16],
  "fleece": [6, 12],
  "jersey": [10, 22],
  "baseball_jumper": [10, 16],
  "long_padding": [-10, -5],
  "short_padding": [-10, -5],
  "neat_vest": [9, 19],
  "padding_vest": [10, 12],
  "safari_jacket": [10, 16],
  "coach_jacket": [12, 20],
  "wind_breaker": [12, 22],
  "long_sleeve_shirt": [16, 24],
  "short_sleeve_shirt": [23, 40],
  "long_sleeve_nambang": [16, 24],
  "short_sleeve_nambang": [23, 40],
  "long_sleeve_blouse": [16, 24],
  "short_sleeve_blouse": [23, 40],
  "mtm": [17, 22],
  "long_sleeve_hood": [16, 20],
  "short_sleeve_hood": [23, 40],
  "sleeveless_hood": [28, 40],
  "neat": [14, 20],
  "sweater": [12, 20],
  "long_sleeve_tshirt": [16, 24],
  "short_sleeve_tshirt": [23, 40],
  "sleeveless_tshirt": [28, 40],
  "long_sleeve_collar_tshirt": [16, 24],
  "short_sleeve_collar_tshirt": [23, 40],
  "short_jeans": [-99, 99],
  "jeans": [-99, 99],
  "hot_jeans": [-99, 99],
  "hot_cotton_pants": [-99, 99],
  "leggings": [-99, 99],
  "slacks": [-99, 99],
  "short_slacks": [-99, 99],
  "short_cotton_pants": [-99, 99],
  "cotton_pants": [-99, 99],
  "jogger_pants": [-99, 99],
  "training_pants": [-99, 99],
  "short_training_pants": [-99, 99],
  "hot_training_pants": [-99, 99],
  "mini_skirt": [-99, 99],
  "midi_skirt": [-99, 99],
  "long_skirt": [-99, 99],
  "mini_one_piece": [12, 40],
  "midi_one_piece": [12, 40],
  "long_one_piece": [12, 40],
  "line_one_piece": [12, 40],
};
const outer2kor = {
  "hood_zipup": "후드집업",
  "coat": "코트",
  "short_coat": "숏코트",
  "trench_coat": "트렌치코트",
  "blouson": "블루종",
  "leather_jacket": "레더자켓",
  "moose_leather_coat": "무스탕",
  "fur": "퍼",
  "airline_jumper": "항공점퍼",
  "blazer": "블레이저",
  "blue_jacket": "청자켓",
  "cardigan": "가디건",
  "anorak_jacket": "아노락 재킷",
  "fleece": "후리스",
  "jersey": "저지",
  "baseball_jumper": "야구잠바",
  "long_padding": "롱패딩",
  "short_padding": "숏패딩",
  "neat_vest": "니트조끼",
  "padding_vest": "패딩조끼",
  "safari_jacket": "야상",
  "coach_jacket": "코치자켓",
  "wind_breaker": "바람막이",
};
const top2kor = {
  "long_sleeve_shirt": "긴팔셔츠",
  "short_sleeve_shirt": "반팔셔츠",
  "long_sleeve_nambang": "긴팔남방",
  "short_sleeve_nambang": "반팔남방",
  "long_sleeve_blouse": "긴팔블라우스",
  "short_sleeve_blouse": "반팔블라우스",
  "mtm": "맨투맨",
  "long_sleeve_hood": "긴팔후드티",
  "short_sleeve_hood": "반팔후드티",
  "sleeveless_hood": "민소매후드티",
  "neat": "니트",
  "sweater": "스웨터",
  "long_sleeve_tshirt": "긴팔티",
  "short_sleeve_tshirt": "반팔티",
  "sleeveless_tshirt": "민소매",
  "long_sleeve_collar_tshirt": "긴팔카라티",
  "short_sleeve_collar_tshirt": "반팔카라티",
};
const bottom2kor = {
  "short_jeans": "청반바지",
  "jeans": "청바지",
  "hot_jeans": "청핫팬츠",
  "hot_cotton_pants": "핫팬츠",
  "leggings": "레깅스",
  "slacks": "슬랙스",
  "short_slacks": "슬랙스 반바지",
  "short_cotton_pants": "면반바지",
  "cotton_pants": "면바지",
  "jogger_pants": "조거팬츠",
  "training_pants": "츄리닝 바지",
  "short_training_pants": "츄리닝 반바지",
  "hot_training_pants": "핫츄리닝바지",
  "mini_skirt": "미니스커트",
  "midi_skirt": "미디스커트",
  "long_skirt": "롱스커트",
};
const onePiece2kor = {
  "long_one_piece": "롱 원피스",
  "midi_one_piece": "미디 원피스",
  "mini_one_piece": "미니 원피스",
  "line_one_piece": "끈 원피스",
};
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
function clothValidator(cloth,condition,cloth2temp) {
  const { stemp, isRain, isSnow, windSpeed} = condition;
  if (cloth2temp[cloth][LOWER] > stemp || stemp > cloth2temp[cloth][UPPER]) return false;
  if(isRain) {
    if (cloth==='skirt') return false; // 비올때 스커트 제외
    if (cloth==='shirt') return false; // 비올때 셔츠 제외
    if (cloth==='blouse') return false; // 비올때 블라우스 제외
    if (cloth==='neat') return false; // 비올때 니트 제외
  }
  if(isSnow) {
    if (cloth==='far') return false; // 눈올때 far 제외
  }
  if(windSpeed>SKIRT_WARNING) {
    if (cloth==='mini-skirt') return false; // 바람이 쌔면 미니스커트 제외
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
router.post("/list", async (req, res) => {
  const gender = parseInt(req.body.gender);
  const stemp = parseInt(req.body.stemp);
  const isRain = req.body.isRain === 'true';
  const isSnow = req.body.isSnow === 'true';
  const windSpeed  = parseInt(req.body.windSpeed);
  const condition = {
    stemp : stemp,
    isRain : isRain,
    isSnow : isSnow,
    windSpeed : windSpeed
  }
  try {
    const outerList = [
      "hood_zipup","trench_coat","blazer","blue_jacket","cardigan","anorak_jacket","jersey","neat_vest","padding_vest","coach_jacket","wind_breaker"
    ]
    const topList = [
      "long_sleeve_shirt",
      "short_sleeve_shirt",
      "long_sleeve_nambang",
      "short_sleeve_nambang",
      "long_sleeve_blouse",
      "short_sleeve_blouse",
      "mtm",
      "long_sleeve_hood",
      "short_sleeve_hood",
      "sleeveless_hood",
      "neat",
      "sweater",
      "long_sleeve_tshirt",
      "short_sleeve_tshirt",
      "sleeveless_tshirt",
      "long_sleeve_collar_tshirt",
      "short_sleeve_collar_tshirt"
    ]
    const bottomList = [
      "short_jeans",
      "jeans",
      "leggings",
      "slacks",
      "short_slacks",
      "short_cotton_pants",
      "cotton_pants",
      "jogger_pants",
      "training_pants",
      "short_training_pants",
    ]
    const onePieceList = [
      "long_one_piece","midi_one_piece","mini_one_piece","line_one_piece"
    ]
    const clothMap = {
      'outer':[],
      'top':[],
      'bottom':[],
      'one_piece':[]
    }
    if(gender === WOMAN) {
      bottomList.push(...["mini_skirt","midi_skirt","long_skirt","hot_jeans","hot_cotton_pants","hot_training_pants"]);
      clothMap['one_piece'] = onePieceList.filter(cloth=>clothValidator(cloth,condition,cloth2temp)).map(cloth=>onePiece2kor[cloth]);
    }
    clothMap['outer'] = outerList.filter(cloth=>clothValidator(cloth,condition,cloth2temp)).map(cloth=>outer2kor[cloth]);
    if(clothMap['outer'].length===0) {
      clothMap['top'] = topList.filter(cloth=>clothValidator(cloth,condition,cloth2temp)).map(cloth=>top2kor[cloth]);
    }
    else {
      clothMap['top'] = topList.map(cloth=>top2kor[cloth]);
    }
    clothMap['bottom'] = bottomList.map(cloth=>bottom2kor[cloth]);
    
    res.json(clothMap);
  } catch(err) {
    res.status(400).send(err.message);
  }
});
router.post("/recommand", async (req, res) => {
  const gender = parseInt(req.body.gender);
  const stemp = parseInt(req.body.stemp);
  const isRain = req.body.isRain === 'true';
  const isSnow = req.body.isSnow === 'true';
  const windSpeed  = parseInt(req.body.windSpeed);
  const filterList = JSON.parse(req.body.filterList || '{"outer":[],"top":[],"bottom":[],"one_piece":[]}');
  const filterSet = {
    'outer': new Set(filterList['outer']),
    'top': new Set(filterList['top']),
    'bottom': new Set(filterList['bottom']),
    'one_piece': new Set(filterList['one_piece']),
  }
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
    let filteredCoordiList = recommandCoordiList;
    if(filterSet['outer'].size > 0) {
      filteredCoordiList = filteredCoordiList.filter(coordi=>{
        return coordi.items.some(cloth=>cloth.major==='outer' && filterSet['outer'].has(outer2kor[cloth.minor]))
      })
    }    
    if(filterSet['top'].size > 0) {
      filteredCoordiList = filteredCoordiList.filter(coordi=>{
        return coordi.items.some(cloth=>cloth.major==='top' && filterSet['top'].has(top2kor[cloth.minor]))
      })
    }
    if(filterSet['bottom'].size > 0) {
      filteredCoordiList = filteredCoordiList.filter(coordi=>{
        return coordi.items.some(cloth=>cloth.major==='bottom' && filterSet['bottom'].has(bottom2kor[cloth.minor]))
      })
    }
    if(filterSet['one_piece'].size > 0) {
      filteredCoordiList = filteredCoordiList.filter(coordi=>{
        return coordi.items.some(cloth=>cloth.major==='one_piece' && filterSet['one_piece'].has(onePiece2kor[cloth.minor]))
      })
    }
    const randomIndexSet = new Set();
    let LimitedRecommandCoordiList = [];
    if(filteredCoordiList.length <= MAX_NUM_OF_COORDI) { // 코디가 MAX_NUM_OF_COORDI보다 적으면 읽어온 리스트를 전부 반환
      LimitedRecommandCoordiList = filteredCoordiList;
    }
    else {//이 방법은 코디의 수가 적을 땐 오히려 비효율적이다
      while(randomIndexSet.size < MAX_NUM_OF_COORDI) {
        let idx = Math.floor(Math.random() * (filteredCoordiList.length-1));
        randomIndexSet.add(idx);
      }
      randomIndexSet.forEach(idx=>{
        LimitedRecommandCoordiList.push(filteredCoordiList[idx]);
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
//현재 동작중인 앱때문에 임시로 get으로 동작하게 만듦
router.get("/recommand", async (req, res) => {
  const gender = parseInt(req.query.gender);
  const stemp = parseInt(req.query.stemp);
  const isRain = req.query.isRain === 'true';
  const isSnow = req.query.isSnow === 'true';
  const windSpeed  = parseInt(req.query.windSpeed);
  const filterList = JSON.parse(req.query.filterList || '{"outer":[],"top":[],"bottom":[],"one_piece":[]}');
  const filterSet = {
    'outer': new Set(filterList['outer']),
    'top': new Set(filterList['top']),
    'bottom': new Set(filterList['bottom']),
    'one_piece': new Set(filterList['one_piece']),
  }
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
    let filteredCoordiList = recommandCoordiList;
    if(filterSet['outer'].size > 0) {
      filteredCoordiList = filteredCoordiList.filter(coordi=>{
        return coordi.items.some(cloth=>cloth.major==='outer' && filterSet['outer'].has(outer2kor[cloth.minor]))
      })
    }    
    if(filterSet['top'].size > 0) {
      filteredCoordiList = filteredCoordiList.filter(coordi=>{
        return coordi.items.some(cloth=>cloth.major==='top' && filterSet['top'].has(top2kor[cloth.minor]))
      })
    }
    if(filterSet['bottom'].size > 0) {
      filteredCoordiList = filteredCoordiList.filter(coordi=>{
        return coordi.items.some(cloth=>cloth.major==='bottom' && filterSet['bottom'].has(bottom2kor[cloth.minor]))
      })
    }
    if(filterSet['one_piece'].size > 0) {
      filteredCoordiList = filteredCoordiList.filter(coordi=>{
        return coordi.items.some(cloth=>cloth.major==='one_piece' && filterSet['one_piece'].has(onePiece2kor[cloth.minor]))
      })
    }
    const randomIndexSet = new Set();
    let LimitedRecommandCoordiList = [];
    if(filteredCoordiList.length <= MAX_NUM_OF_COORDI) { // 코디가 MAX_NUM_OF_COORDI보다 적으면 읽어온 리스트를 전부 반환
      LimitedRecommandCoordiList = filteredCoordiList;
    }
    else {//이 방법은 코디의 수가 적을 땐 오히려 비효율적이다
      while(randomIndexSet.size < MAX_NUM_OF_COORDI) {
        let idx = Math.floor(Math.random() * (filteredCoordiList.length-1));
        randomIndexSet.add(idx);
      }
      randomIndexSet.forEach(idx=>{
        LimitedRecommandCoordiList.push(filteredCoordiList[idx]);
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