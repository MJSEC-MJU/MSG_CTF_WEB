import { useState, useEffect } from 'react';
import './Ranking.css';

import Loading from '../components/Loading';

const Ranking = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // 더미 데이터 (SSE 대신 임시로 테스트용)
const dummyScores = [
  { id: 1, userId: "playerOne", totalPoint: 1520 },
  { id: 2, userId: "cyberKing", totalPoint: 1480 },
  { id: 3, userId: "hackerPro", totalPoint: 1455 },
  { id: 4, userId: "matrixNeo", totalPoint: 1402 },
  { id: 5, userId: "codeMaster", totalPoint: 1389 },
  { id: 6, userId: "darkKnight", totalPoint: 1370 },
  { id: 7, userId: "greenArrow", totalPoint: 1355 },
  { id: 8, userId: "silverFox", totalPoint: 1348 },
  { id: 9, userId: "quantumAI", totalPoint: 1330 },
  { id: 10, userId: "binaryHero", totalPoint: 1325 },
  { id: 11, userId: "cryptoNinja", totalPoint: 1308 },
  { id: 12, userId: "fireDragon", totalPoint: 1290 },
  { id: 13, userId: "ghostHunter", totalPoint: 1282 },
  { id: 14, userId: "stormBreaker", totalPoint: 1275 },
  { id: 15, userId: "ironShield", totalPoint: 1266 },
  { id: 16, userId: "shadowWolf", totalPoint: 1255 },
  { id: 17, userId: "bluePhoenix", totalPoint: 1248 },
  { id: 18, userId: "digitalSamurai", totalPoint: 1242 },
  { id: 19, userId: "netRunner", totalPoint: 1235 },
  { id: 20, userId: "starDust", totalPoint: 1220 },
];

    useEffect(() => {
    // 🔹 SSE 대신 더미 데이터 사용
    setScores(dummyScores);
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   let eventSource = null;
  //   let reconnectInterval = null;

  //   const connectSSE = () => {
  //     // 기존 연결 종료
  //     if (eventSource) {
  //       eventSource.close();
  //       eventSource = null;
  //     }
      
  //     eventSource = new EventSource(
  //       'https://msg.mjsec.kr/api/leaderboard/stream'
  //     );
      
  //     eventSource.onopen = () => {
  //       //console.log('✅ SSE 연결이 열렸습니다.');
  //     };

  //     eventSource.onmessage = (event) => {
  //       try {
  //         //console.log('📩 수신된 데이터:', event.data);
  //         const parsedData = JSON.parse(event.data);
  //         let dataArray = [];
  //         if (Array.isArray(parsedData)) {
  //           dataArray = parsedData;
  //         } else if (parsedData && Array.isArray(parsedData.data)) {
  //           dataArray = parsedData.data;
  //         } else {
  //           throw new Error('응답 데이터 형식이 올바르지 않습니다.');
  //         }
  //         setScores(dataArray);
  //         if (loading) {
  //           setLoading(false);
  //         }
  //       } catch (error) {
  //         //console.error('❌ 데이터 파싱 오류:', error.message);
  //       }
  //     };

  //     eventSource.onerror = (error) => {
  //       //console.error('❌ SSE 오류 발생:', error);
  //       eventSource.close();
  //     };
  //   };

  //   // 최초 SSE 연결
  //   connectSSE();

  //   // 1시간마다 재연결 (60분 * 60초 * 1000ms)
  //   reconnectInterval = setInterval(connectSSE, 60 * 60 * 1000);

  //   // 클린업: 컴포넌트 언마운트 시 SSE 연결과 인터벌 종료
  //   return () => {
  //     if (eventSource) eventSource.close();
  //     if (reconnectInterval) clearInterval(reconnectInterval);
  //   };
  // }, [loading]);

  const displayScores = scores.map((score, index) => {
    const rank = index + 1;
    return (
      <div className="card" key={score.id}>
        <div className={`rank ${rank <= 3 ? "top3" : ""}`}>
          <span className={`rank-number ${rank <= 3 ? "top3" : ""}`}>{rank}</span>
          <span className="user">{score.userId}</span>
        </div>
        <span className={`score ${rank <= 3 ? "top3" : ""}`}>{score.totalPoint}</span>
      </div>
    );
  }); 

  if (loading) {
    return (
      <div className="ranking-wrapper">
        <div className="loading-wrapper">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-wrapper">
      <div className="ranking-wrapper">
        <h2 className="title">Ranking</h2>
        <div className="list">
          {displayScores}
        </div>
      </div>
    </div>
  );
};

export default Ranking;
